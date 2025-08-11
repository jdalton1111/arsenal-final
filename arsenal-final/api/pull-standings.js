// api/pull-standings.js
export const config = { runtime: 'edge' };

// Map Football-Data row → teams row
function mapTeam(row) {
  const t = row.team || {};
  return {
    id: t.id,
    name: t.name ?? t.shortName ?? String(t.id),
    short_name: t.shortName ?? (t.name ? t.name.slice(0, 12) : String(t.id)),
    crest_url: t.crest ?? null
  };
}

// Map Football-Data row → standings row (our schema)
function mapStanding(row, season, snapDate) {
  return {
    competition_id: 'PL',
    season,
    snap_date: snapDate, // YYYY-MM-DD
    team_id: row.team.id,
    p: row.playedGames,
    w: row.won,
    d: row.draw,
    l: row.lost,
    gf: row.goalsFor,
    ga: row.goalsAgainst,
    gd: row.goalDifference,
    pts: row.points
  };
}

export default async function handler() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE, FD_API_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !FD_API_KEY) {
    return new Response('Missing env vars', { status: 500 });
  }

  // Premier League standings (TOTAL table)
  const fdUrl = 'https://api.football-data.org/v4/competitions/PL/standings';
  const r = await fetch(fdUrl, { headers: { 'X-Auth-Token': FD_API_KEY } });
  if (!r.ok) return new Response(`FD error ${r.status}`, { status: 502 });

  const data = await r.json();
  const total = (data.standings || []).find(s => s.type === 'TOTAL');
  const rows = total?.table || [];

  // Derive season and snapshot date
  const seasonStart = data?.season?.startDate; // e.g. "2025-08-01"
  const season = seasonStart ? Number(seasonStart.slice(0, 4)) : new Date().getFullYear();
  const snapDate = new Date().toISOString().slice(0, 10);

  // 1) Upsert all teams referenced in the table
  const teams = rows.map(mapTeam);
  if (teams.length) {
    const teamResp = await fetch(`${SUPABASE_URL}/rest/v1/teams?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(teams)
    });
    if (!teamResp.ok) {
      const txt = await teamResp.text();
      return new Response(`Supabase teams upsert error: ${txt}`, { status: 500 });
    }
  }

  // 2) Upsert standings snapshot
  const standings = rows.map(r => mapStanding(r, season, snapDate));
  if (standings.length) {
    const standResp = await fetch(
      `${SUPABASE_URL}/rest/v1/standings?on_conflict=competition_id,season,snap_date,team_id`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify(standings)
      }
    );
    if (!standResp.ok) {
      const txt = await standResp.text();
      return new Response(`Supabase standings upsert error: ${txt}`, { status: 500 });
    }
  }

  return new Response('ok', { status: 200 });
}
