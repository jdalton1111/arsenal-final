// api/pull-fixtures.js
export const config = { runtime: 'edge' };

// Map Football-Data match → our fixtures row
function mapFixture(m) {
  return {
    id: m.id,
    competition_id: m.competition.code,             // e.g. 'PL'
    season: Number(m.season.startDate.slice(0, 4)), // 2025
    utc_date: m.utcDate,
    status: m.status,                               // SCHEDULED/FINISHED/...
    venue: null,
    home_team_id: m.homeTeam.id,
    away_team_id: m.awayTeam.id,
    home_score: m.score?.fullTime?.home ?? null,
    away_score: m.score?.fullTime?.away ?? null
  };
}

// Extract unique teams from the matches and map → our teams rows
function extractTeams(matches) {
  const map = new Map();
  for (const m of matches) {
    const teams = [m.homeTeam, m.awayTeam];
    for (const t of teams) {
      if (!map.has(t.id)) {
        map.set(t.id, {
          id: t.id,
          name: t.name ?? t.shortName ?? String(t.id),
          short_name: t.shortName ?? (t.name ? t.name.slice(0, 12) : String(t.id)),
          crest_url: t.crest ?? null
        });
      }
    }
  }
  return Array.from(map.values());
}

export default async function handler() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE, FD_API_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !FD_API_KEY) {
    return new Response('Missing env vars', { status: 500 });
  }

  // Arsenal fixtures for season 2025/26
  const fdUrl = 'https://api.football-data.org/v4/teams/57/matches?season=2025';
  const r = await fetch(fdUrl, { headers: { 'X-Auth-Token': FD_API_KEY } });
  if (!r.ok) return new Response(`FD error ${r.status}`, { status: 502 });

  const data = await r.json();
  const matches = data.matches || [];

  // 1) Upsert teams first (satisfy FK constraints)
  const teams = extractTeams(matches);
  if (teams.length) {
    const teamsResp = await fetch(`${SUPABASE_URL}/rest/v1/teams?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(teams)
    });
    if (!teamsResp.ok) {
      const txt = await teamsResp.text();
      return new Response(`Supabase teams upsert error: ${txt}`, { status: 500 });
    }
  }

  // 2) Upsert fixtures
  const rows = matches.map(mapFixture);
  if (rows.length) {
    const fixResp = await fetch(`${SUPABASE_URL}/rest/v1/fixtures?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(rows)
    });
    if (!fixResp.ok) {
      const txt = await fixResp.text();
      return new Response(`Supabase fixtures upsert error: ${txt}`, { status: 500 });
    }
  }

  return new Response('ok', { status: 200 });
}
