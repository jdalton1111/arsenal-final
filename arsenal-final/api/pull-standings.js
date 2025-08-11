// api/pull-standings.js
export const config = { runtime: 'edge' };

export default async function handler() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE, FD_API_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !FD_API_KEY) {
    return new Response('Missing env vars', { status: 500 });
  }

  // Premier League standings (TOTAL table)
  const r = await fetch('https://api.football-data.org/v4/competitions/PL/standings', {
    headers: { 'X-Auth-Token': FD_API_KEY }
  });
  if (!r.ok) return new Response(`FD error ${r.status}`, { status: 502 });

  const data = await r.json();
  const table = data.standings?.find(s => s.type === 'TOTAL');
  const season = Number(data.season.startDate.slice(0, 4));
  const snapDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const rows = (table?.table || []).map(row => ({
    competition_id: 'PL',
    season,
    snap_date: snapDate,
    team_id: row.team.id,
    p: row.playedGames,
    w: row.won,
    d: row.draw,
    l: row.lost,
    gf: row.goalsFor,
    ga: row.goalsAgainst,
    gd: row.goalDifference,
    pts: row.points
  }));

  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/standings?on_conflict=competition_id,season,snap_date,team_id`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(rows)
    }
  );

  if (!resp.ok) {
    const txt = await resp.text();
    return new Response(`Supabase error: ${txt}`, { status: 500 });
  }

  return new Response('ok');
}
