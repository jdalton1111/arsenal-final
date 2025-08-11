// api/pull-fixtures.js
export const config = { runtime: 'edge' };

// Map Football-Data match → our fixtures row
function mapFixture(m) {
  return {
    id: m.id,
    competition_id: m.competition.code,            // e.g. 'PL'
    season: Number(m.season.startDate.slice(0, 4)),// 2025
    utc_date: m.utcDate,
    status: m.status,                              // SCHEDULED/FINISHED/...
    venue: null,                                   // FD free tier doesn't include venue reliably
    home_team_id: m.homeTeam.id,
    away_team_id: m.awayTeam.id,
    home_score: m.score?.fullTime?.home ?? null,
    away_score: m.score?.fullTime?.away ?? null
  };
}

export default async function handler() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE, FD_API_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !FD_API_KEY) {
    return new Response('Missing env vars', { status: 500 });
  }

  // Arsenal team id on Football-Data is 57. Season 2025 = 2025/26.
  const url = 'https://api.football-data.org/v4/teams/57/matches?season=2025';

  const r = await fetch(url, { headers: { 'X-Auth-Token': FD_API_KEY } });
  if (!r.ok) return new Response(`FD error ${r.status}`, { status: 502 });

  const data = await r.json();
  const rows = (data.matches || []).map(mapFixture);

  // Upsert into Supabase via REST
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/fixtures?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(rows)
  });

  if (!resp.ok) {
    const txt = await resp.text();
    return new Response(`Supabase error: ${txt}`, { status: 500 });
  }

  return new Response('ok', { status: 200 });
}
