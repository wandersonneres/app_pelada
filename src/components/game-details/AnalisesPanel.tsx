import { useMemo, useState } from 'react';
import { Game } from '../../types';
import { computeGameTotals, computeMatchScores, computePlayerStats, POSITION_HEX } from './gameStats';

interface AnalisesPanelProps {
  game: Game;
}

type Metric = 'goals' | 'assists' | 'victories' | 'losses';
const METRIC_TABS: { key: Metric; label: string }[] = [
  { key: 'goals', label: 'Gols' },
  { key: 'assists', label: 'Assist.' },
  { key: 'victories', label: 'Vitórias' },
  { key: 'losses', label: 'Derrotas' },
];

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-surface border border-line rounded-[14px] p-[15px]">
      <div className="text-[11px] text-ink-soft font-semibold">{label}</div>
      <div className="font-heading font-extrabold text-[26px] leading-none mt-1 text-ink">{value}</div>
      {hint && <div className="text-[10px] text-ink-soft mt-1">{hint}</div>}
    </div>
  );
}

export function AnalisesPanel({ game }: AnalisesPanelProps) {
  const [metric, setMetric] = useState<Metric>('goals');
  const stats = useMemo(() => computePlayerStats(game), [game]);
  const totals = useMemo(() => computeGameTotals(game), [game]);
  const scores = useMemo(() => computeMatchScores(game), [game]);

  const totalAssists = stats.reduce((s, p) => s + p.assists, 0);
  const topScorer = stats.find(p => p.goals > 0);
  const topAssister = [...stats].sort((a, b) => b.assists - a.assists).find(p => p.assists > 0);
  const worst = [...stats].filter(p => p.matches > 0).sort((a, b) => b.losses - a.losses)[0];

  const ranked = [...stats].sort((a, b) => (b[metric] as number) - (a[metric] as number)).filter(p => (p[metric] as number) > 0).slice(0, 8);
  const maxVal = ranked.length ? (ranked[0][metric] as number) : 1;
  const maxMatchGoals = Math.max(1, ...scores.map(s => Math.max(s.blue, s.orange)));

  const winTotal = Math.max(1, totals.blueWins + totals.orangeWins);
  const goalTotal = Math.max(1, totals.blueGoals + totals.orangeGoals);

  return (
    <div className="p-5 md:px-[28px] md:py-[22px] flex flex-col gap-4 min-h-full">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-[20px] text-ink">Análises da pelada</h2>
          <div className="text-[12.5px] text-ink-soft mt-px">Consolidado das {totals.totalMatches} partidas</div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <MetricCard label="Partidas" value={totals.totalMatches} />
        <MetricCard label="Gols" value={totals.totalGoals} />
        <MetricCard label="Média/jogo" value={totals.goalsPerMatch} />
        <MetricCard label="Jogadores" value={game.players.length} />
        <MetricCard label="Assistências" value={totalAssists} />
        {topScorer ? (
          <div className="rounded-[14px] p-[13px] flex items-center gap-2.5 border" style={{ background: 'linear-gradient(120deg,#fdf6e3,#f6ecca)', borderColor: '#ecd79a' }}>
            <span className="text-[18px]">👑</span>
            <div className="min-w-0">
              <div className="text-[10px] font-bold" style={{ color: '#9a6a10' }}>Artilheiro</div>
              <div className="text-[13px] font-bold text-ink truncate">{topScorer.name}</div>
              <div className="text-[10px]" style={{ color: '#9a6a10' }}>{topScorer.goals} gols</div>
            </div>
          </div>
        ) : (
          <MetricCard label="Artilheiro" value="—" hint="sem gols" />
        )}
      </div>

      {/* Main grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
        {/* Ranking */}
        <div className="bg-surface border border-line rounded-2xl p-[18px] flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="font-heading font-bold text-[15px] text-ink">Ranking dos jogadores</div>
            <div className="ml-auto flex gap-0.5 bg-line-soft rounded-[9px] p-[3px]">
              {METRIC_TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setMetric(t.key)}
                  className={`text-[11.5px] font-semibold px-3 py-1.5 rounded-[7px] transition-colors ${
                    metric === t.key ? 'bg-surface text-wine shadow-sm' : 'text-ink-soft'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            {ranked.length === 0 && <div className="text-ink-soft text-sm py-6 text-center">Sem dados ainda.</div>}
            {ranked.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 py-[9px] ${i > 0 ? 'border-t border-[#f4efe4]' : ''}`}>
                <span className="font-stat text-[12px] text-[#c8c1b0] w-3.5 text-center">{i + 1}</span>
                <span className="chip w-7 h-7 flex-none rounded-full bg-ink text-white font-stat text-[11px] flex items-center justify-center">{p.arrivalOrder}</span>
                <div className="flex items-center gap-1.5 w-[150px] min-w-0">
                  <span className="w-[5px] h-[5px] rounded-full flex-none" style={{ background: POSITION_HEX[p.position] }} />
                  <span className="text-[13px] font-semibold text-ink truncate">{p.name}</span>
                </div>
                <div className="flex-1 h-2 bg-[#f1ece1] rounded-full overflow-hidden">
                  <div className="h-full bg-wine rounded-full" style={{ width: `${Math.round(((p[metric] as number) / maxVal) * 100)}%` }} />
                </div>
                <span className="font-stat text-[13px] font-bold w-[18px] text-right text-ink">{p[metric] as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3.5">
          <div className="bg-surface border border-line rounded-2xl p-[18px]">
            <div className="font-heading font-bold text-[14px] mb-3 text-ink">Azul vs Laranja</div>
            <div className="flex flex-col gap-[11px]">
              <SplitRow label="Vitórias" left={totals.blueWins} right={totals.orangeWins} leftPct={(totals.blueWins / winTotal) * 100} />
              <SplitRow label="Gols" left={totals.blueGoals} right={totals.orangeGoals} leftPct={(totals.blueGoals / goalTotal) * 100} />
            </div>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-[18px]">
            <div className="font-heading font-bold text-[14px] mb-3 text-ink">Gols por partida</div>
            <div className="flex items-end gap-5 h-[74px] px-1.5">
              {scores.length === 0 && <div className="text-ink-soft text-xs">Sem partidas.</div>}
              {scores.map(s => (
                <div key={s.index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="flex gap-1 items-end h-full">
                    <div className="w-4 rounded-t" style={{ height: `${Math.max(4, (s.blue / maxMatchGoals) * 100)}%`, background: '#24499c' }} />
                    <div className="w-4 rounded-t" style={{ height: `${Math.max(4, (s.orange / maxMatchGoals) * 100)}%`, background: '#c2560f' }} />
                  </div>
                  <span className={`text-[11px] font-semibold ${s.live ? 'text-wine' : 'text-ink-soft'}`}>
                    P{s.index} {s.blue}-{s.orange}{s.live ? '●' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {topAssister && (
              <HighlightRow emoji="🎯" order={topAssister.arrivalOrder} name={topAssister.name} sub={`Garçom · ${topAssister.assists} assistências`} bg="#eef1fa" chip="#24499c" subColor="#1c3576" />
            )}
            {worst && worst.losses > 0 && (
              <HighlightRow emoji="🙈" order={worst.arrivalOrder} name={worst.name} sub={`Pior da pelada · ${worst.losses} derrotas`} bg="#f4f0ea" chip="#262319" subColor="#8b8578" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitRow({ label, left, right, leftPct }: { label: string; left: number; right: number; leftPct: number }) {
  return (
    <div className="flex items-center gap-2.5 text-[12px]">
      <span className="w-[54px] font-bold text-team-blue-dark">{label}</span>
      <span className="font-heading w-4 font-extrabold text-center text-ink">{left}</span>
      <div className="flex-1 flex h-2.5 rounded-full overflow-hidden bg-line-soft">
        <div style={{ width: `${leftPct}%`, background: '#24499c' }} />
        <div className="flex-1" style={{ background: '#c2560f' }} />
      </div>
      <span className="font-heading w-4 font-extrabold text-center text-ink">{right}</span>
    </div>
  );
}

function HighlightRow({ emoji, order, name, sub, bg, chip, subColor }: { emoji: string; order: number; name: string; sub: string; bg: string; chip: string; subColor: string }) {
  return (
    <div className="flex items-center gap-[11px] rounded-[13px] px-3.5 py-[11px]" style={{ background: bg }}>
      <span className="text-[16px]">{emoji}</span>
      <span className="chip w-[30px] h-[30px] flex-none rounded-full text-white font-stat text-[11px] flex items-center justify-center" style={{ background: chip }}>{order}</span>
      <div className="min-w-0">
        <div className="text-[12.5px] font-bold text-ink truncate">{name}</div>
        <div className="text-[10.5px]" style={{ color: subColor }}>{sub}</div>
      </div>
    </div>
  );
}
