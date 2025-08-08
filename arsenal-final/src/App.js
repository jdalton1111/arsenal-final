import React, { useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";

// Layout with header, nav, and footer
const Layout = ({ children }) => (
  <div className="min-h-screen bg-neutral-900 text-neutral-100">
    <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur border-b border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold tracking-wide text-red-500">A R S E N A L • HUB</Link>
        <nav className="text-sm flex gap-4">
          <Link to="/fixtures" className={`px-3 py-1 rounded-md hover:bg-neutral-800 transition ${window.location.pathname === '/fixtures' ? 'bg-neutral-800 text-white' : 'text-neutral-300'}`}>Fixtures</Link>
          <Link to="/table" className={`px-3 py-1 rounded-md hover:bg-neutral-800 transition ${window.location.pathname === '/table' ? 'bg-neutral-800 text-white' : 'text-neutral-300'}`}>Table</Link>
          <Link to="/players" className={`px-3 py-1 rounded-md hover:bg-neutral-800 transition ${window.location.pathname === '/players' ? 'bg-neutral-800 text-white' : 'text-neutral-300'}`}>Players</Link>
          <Link to="/news" className={`px-3 py-1 rounded-md hover:bg-neutral-800 transition ${window.location.pathname === '/news' ? 'bg-neutral-800 text-white' : 'text-neutral-300'}`}>News</Link>
        </nav>
        <div className="ml-auto">
          <SearchBar />
        </div>
      </div>
    </header>
    <main className="max-w-6xl mx-auto p-4">{children}</main>
    <footer className="max-w-6xl mx-auto px-4 py-6 text-xs text-neutral-400 border-t border-neutral-800">
      Data shown is demo only. Hook up an API later. © Arsenal Hub (fan project)
    </footer>
  </div>
);

const SearchBar = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (q.trim()) navigate(`/players?q=${encodeURIComponent(q)}`);
    }}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players..." className="bg-neutral-800/70 border border-neutral-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500" />
    </form>
  );
};

// Demo Data
const demoPlayers = [
  { id: 1, name: "Declan Rice", pos: "DM", nationality: "ENG", minutes: 3200, tackles: 98, tacklesWon: 72, passes: 2600, passesCompleted: 2365, shots: 44, goals: 8, assists: 6 },
  { id: 2, name: "Martin Ødegaard", pos: "AM", nationality: "NOR", minutes: 3005, tackles: 42, tacklesWon: 23, passes: 2820, passesCompleted: 2530, shots: 96, goals: 14, assists: 10 },
  { id: 3, name: "Ben White", pos: "RB", nationality: "ENG", minutes: 3150, tackles: 90, tacklesWon: 60, passes: 2100, passesCompleted: 1950, shots: 32, goals: 4, assists: 7 },
  { id: 4, name: "William Saliba", pos: "CB", nationality: "FRA", minutes: 3330, tackles: 70, tacklesWon: 55, passes: 2800, passesCompleted: 2670, shots: 12, goals: 2, assists: 1 },
  { id: 5, name: "Bukayo Saka", pos: "RW", nationality: "ENG", minutes: 2990, tackles: 35, tacklesWon: 18, passes: 1650, passesCompleted: 1410, shots: 110, goals: 16, assists: 12 },
];

const demoFixtures = [
  { id: "ARS-MCI-2025-08-17", date: "2025-08-17", comp: "Premier League", home: "Arsenal", away: "Man City", venue: "Emirates" },
  { id: "CHE-ARS-2025-08-24", date: "2025-08-24", comp: "Premier League", home: "Chelsea", away: "Arsenal", venue: "Stamford Bridge" },
];

const demoResults = [
  { id: "ARS-TOT-2025-05-12", date: "2025-05-12", comp: "Premier League", home: "Arsenal", away: "Spurs", score: "2–1", xgHome: 1.9, xgAway: 1.1, stats: { shotsH: 15, shotsA: 9, possH: 55, possA: 45, tacklesH: 19, tacklesA: 17 } },
];

const demoTable = [
  { team: "Arsenal", p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  { team: "Man City", p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  { team: "Liverpool", p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
];

// Utility
const pct = (num, den) => den ? (num / den) * 100 : 0;

// UI Components
const Card = ({ title, children }) => (
  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
    <h2 className="font-semibold text-neutral-100">{title}</h2>
    <div className="mt-3">{children}</div>
  </div>
);

const Stat = ({ label, home, away, fmt = (v) => String(v) }) => (
  <div className="p-2 text-center">
    <div className="text-neutral-400 text-xs">{label}</div>
    <div className="font-semibold">{fmt(home)} – {fmt(away)}</div>
  </div>
);

const LeagueTable = ({ table, compact = false }) => (
  <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-neutral-900 text-neutral-300">
        <tr>
          <th className="p-2 text-left">Team</th>
          <th className="p-2">P</th>
          {!compact && (
            <>
              <th className="p-2">W</th>
              <th className="p-2">D</th>
              <th className="p-2">L</th>
              <th className="p-2">GF</th>
              <th className="p-2">GA</th>
              <th className="p-2">GD</th>
            </>
          )}
          <th className="p-2">Pts</th>
        </tr>
      </thead>
      <tbody>
        {table.map((r, i) => (
          <tr key={r.team} className={`border-t border-neutral-800 ${i === 0 ? 'bg-neutral-900/40' : ''}`}>
            <td className="p-2 text-left">{r.team}</td>
            <td className="p-2 text-center">{r.p}</td>
            {!compact && (
              <>
                <td className="p-2 text-center">{r.w}</td>
                <td className="p-2 text-center">{r.d}</td>
                <td className="p-2 text-center">{r.l}</td>
                <td className="p-2 text-center">{r.gf}</td>
                <td className="p-2 text-center">{r.ga}</td>
                <td className="p-2 text-center">{r.gd}</td>
              </>
            )}
            <td className="p-2 text-center font-semibold">{r.pts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TopTacklePct = ({ players, limit = 5 }) => {
  const rows = [...players]
    .map(p => ({ ...p, tacklePct: pct(p.tacklesWon, p.tackles) }))
    .sort((a, b) => b.tacklePct - a.tacklePct)
    .slice(0, limit);
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-neutral-900 text-neutral-300">
          <tr>
            <th className="p-2 text-left">Player</th>
            <th className="p-2 text-right">Tackle %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t border-neutral-800">
              <td className="p-2">{r.name}</td>
              <td className="p-2 text-right">{r.tacklePct.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BadgeStat = ({ label, value }) => (
  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center">
    <div className="text-xs text-neutral-400">{label}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
);

// Pages
const Home = () => (
  <div className="grid md:grid-cols-3 gap-4">
    <Card title="Next Fixture">
      {demoFixtures.slice(0, 1).map(f => (
        <div key={f.id} className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{f.home} vs {f.away}</div>
            <div className="text-neutral-400 text-sm">{f.comp} · {f.venue}</div>
          </div>
          <div className="text-right text-sm">{new Date(f.date).toDateString()}</div>
        </div>
      ))}
      <div className="mt-3">
        <Link className="text-red-400 hover:underline" to="/fixtures">All fixtures →</Link>
      </div>
    </Card>

    <Card title="Latest Result">
      {demoResults.slice(0, 1).map(m => (
        <div key={m.id}>
          <div className="text-lg font-semibold">{m.home} {m.score} {m.away}</div>
          <div className="text-neutral-400 text-sm">xG {m.xgHome.toFixed(1)} – {m.xgAway.toFixed(1)}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <Stat label="Shots" home={m.stats.shotsH} away={m.stats.shotsA} />
            <Stat label="Poss%" home={m.stats.possH} away={m.stats.possA} fmt={(v) => v + "%"} />
            <Stat label="Tackles" home={m.stats.tacklesH} away={m.stats.tacklesA} />
          </div>
          <div className="mt-3">
            <Link className="text-red-400 hover:underline" to={`/match/${m.id}`}>Match centre →</Link>
          </div>
        </div>
      ))}
    </Card>

    <Card title="League Table">
      <LeagueTable table={demoTable} compact />
      <div className="mt-3">
        <Link className="text-red-400 hover:underline" to="/table">Full table →</Link>
      </div>
    </Card>

    <Card title="Top Tackle % (Team)">
      <TopTacklePct players={demoPlayers} limit={5} />
    </Card>

    <Card title="News (demo)">
      <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
        <li>Arsenal pre-season: key takeaways and player form</li>
        <li>Injury update ahead of opening weekend</li>
        <li>Transfer window watch: midfield depth options</li>
      </ul>
      <div className="mt-3"><Link className="text-red-400 hover:underline" to="/news">All news →</Link></div>
    </Card>
  </div>
);

const Fixtures = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-semibold">Fixtures</h1>
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-neutral-900 text-neutral-300">
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Competition</th>
            <th className="p-2 text-left">Match</th>
            <th className="p-2 text-left">Venue</th>
          </tr>
        </thead>
        <tbody>
          {demoFixtures.map(f => (
            <tr key={f.id} className="border-t border-neutral-800 hover:bg-neutral-900/60">
              <td className="p-2">{new Date(f.date).toLocaleDateString()}</td>
              <td className="p-2">{f.comp}</td>
              <td className="p-2"><Link className="text-red-400 hover:underline" to={`/fixture/${f.id}`}>{f.home} vs {f.away}</Link></td>
              <td className="p-2">{f.venue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TablePage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-semibold">Premier League Table</h1>
    <LeagueTable table={demoTable} />
  </div>
);

const Players = () => {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get('q') || '').toLowerCase();
  const [sortKey, setSortKey] = useState('tacklePct');
  const [dir, setDir] = useState('desc');

  const rows = useMemo(() => {
    return demoPlayers
      .filter(p => p.name.toLowerCase().includes(q))
      .map(p => ({
        ...p,
        passPct: pct(p.passesCompleted, p.passes),
        tacklePct: pct(p.tacklesWon, p.tackles),
      }))
      .sort((a, b) => dir === 'asc' ? (a[sortKey] - b[sortKey]) : (b[sortKey] - a[sortKey]));
  }, [q, sortKey, dir]);

  const setSort = (k) => {
    if (k === sortKey) setDir(dir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setDir('desc'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Players</h1>
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="p-2 text-left cursor-pointer select-none hover:text-red-400" onClick={() => setSort('name')}>Player</th>
              <th className="p-2 text-left cursor-pointer select-none hover:text-red-400" onClick={() => setSort('pos')}>Pos</th>
              <th className="p-2 text-center cursor-pointer select-none hover:text-red-400" onClick={() => setSort('minutes')}>Min</th>
              <th className="p-2 text-center cursor-pointer select-none hover:text-red-400" onClick={() => setSort('goals')}>G</th>
              <th className="p-2 text-center cursor-pointer select-none hover:text-red-400" onClick={() => setSort('assists')}>A</th>
              <th className="p-2 text-center cursor-pointer select-none hover:text-red-400" onClick={() => setSort('passPct')}>Pass %</th>
              <th className="p-2 text-center cursor-pointer select-none hover:text-red-400" onClick={() => setSort('tacklePct')}>Tackle %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id} className="border-t border-neutral-800 hover:bg-neutral-900/60">
                <td className="p-2"><Link className="text-red-400 hover:underline" to={`/player/${p.id}`}>{p.name}</Link></td>
                <td className="p-2">{p.pos}</td>
                <td className="p-2 text-center">{p.minutes}</td>
                <td className="p-2 text-center">{p.goals}</td>
                <td className="p-2 text-center">{p.assists}</td>
                <td className="p-2 text-center">{p.passPct.toFixed(1)}%</td>
                <td className="p-2 text-center">{p.tacklePct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PlayerPage = () => {
  const { id } = useParams();
  const p = demoPlayers.find(x => String(x.id) === id);
  if (!p) return <NotFound />;
  const passPct = pct(p.passesCompleted, p.passes);
  const tacklePct = pct(p.tacklesWon, p.tackles);
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card title={p.name}>
          <div className="text-sm text-neutral-300">{p.pos} · {p.nationality}</div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <BadgeStat label="Minutes" value={p.minutes} />
            <BadgeStat label="Goals" value={p.goals} />
            <BadgeStat label="Assists" value={p.assists} />
            <BadgeStat label="Pass %" value={`${passPct.toFixed(1)}%`} />
            <BadgeStat label="Tackle %" value={`${tacklePct.toFixed(1)}%`} />
          </div>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card title="Season Summary">
          <p className="text-sm text-neutral-300">Demo summary. Replace with per-match breakdown and links to match pages.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <BadgeStat label="Passes" value={`${p.passesCompleted}/${p.passes}`} />
            <BadgeStat label="Tackles Won" value={`${p.tacklesWon}/${p.tackles}`} />
          </div>
        </Card>
      </div>
    </div>
  );
};

const MatchPage = () => {
  const { id } = useParams();
  const m = demoResults.find(x => x.id === id);
  if (!m) return <NotFound />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{m.home} {m.score} {m.away}</h1>
      <div className="text-neutral-400">{m.comp} · {new Date(m.date).toDateString()}</div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="xG">
          <div className="text-lg">{m.xgHome.toFixed(1)} – {m.xgAway.toFixed(1)}</div>
        </Card>
        <Card title="Team Stats">
          <div className="grid grid-cols-3 text-center text-sm">
            <Stat label="Shots" home={m.stats.shotsH} away={m.stats.shotsA} />
            <Stat label="Poss%" home={m.stats.possH} away={m.stats.possA} fmt={(v) => v + "%"} />
            <Stat label="Tackles" home={m.stats.tacklesH} away={m.stats.tacklesA} />
          </div>
        </Card>
        <Card title="Report">
          <p className="text-sm text-neutral-300">Add lineups, events timeline, and player ratings here.</p>
        </Card>
      </div>
    </div>
  );
};

const FixturePage = () => {
  const { id } = useParams();
  const f = demoFixtures.find(x => x.id === id);
  if (!f) return <NotFound />;
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">{f.home} vs {f.away}</h1>
      <div className="text-neutral-400">{f.comp} · {f.venue} · {new Date(f.date).toDateString()}</div>
      <p className="text-sm text-neutral-300">Previews: form, predicted XI, head-to-head, odds (later).</p>
    </div>
  );
};

const News = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-semibold">News</h1>
    <p className="text-neutral-300 text-sm">Plug in RSS feeds via backend. For MVP, manually curate links.</p>
    <ul className="list-disc list-inside text-sm text-neutral-300 space-y-2">
      <li>Arsenal confirm squad numbers for new season</li>
      <li>Analysis: pressing triggers in 4-3-3</li>
    </ul>
  </div>
);

const NotFound = () => (
  <div className="text-neutral-400">Not found.</div>
);

const App = () => (
  <Router>
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fixtures" element={<Fixtures />} />
        <Route path="/fixture/:id" element={<FixturePage />} />
        <Route path="/table" element={<TablePage />} />
        <Route path="/players" element={<Players />} />
        <Route path="/player/:id" element={<PlayerPage />} />
        <Route path="/match/:id" element={<MatchPage />} />
        <Route path="/news" element={<News />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  </Router>
);

export default App;
