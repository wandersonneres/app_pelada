import { useMemo } from 'react';
import { Game } from '../../types';
import { computeGameTotals, computePlayerStats } from './gameStats';

interface AnalisesMobileProps {
  game: Game;
}

function HighlightRow({ emoji, order, name, sub, bg, chip, subColor }: { emoji: string; order: number; name: string; sub: string; bg: string; chip: string; subColor: string }) {
  return (
    <div className="flex items-center gap-[11px] rounded-[13px] px-3.5 py-[11px]" style={{ background: bg }}>
      <span className="text-[16px]">{emoji}</span>
      <span className="chip w-[30px] h-[30px] flex-none rounded-full text-white font-stat text-[11px] flex items-center justify-center" style={{ background: chip }}>{order}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-bold text-ink truncate">{name}</div>
        <div className="text-[10.5px]" style={{ color: subColor }}>{sub}</div>
      </div>
    </div>
  );
}

export function AnalisesMobile({ game }: AnalisesMobileProps) {
  const stats = useMemo(() => computePlayerStats(game), [game]);
  const totals = useMemo(() => computeGameTotals(game), [game]);

  const scorers = stats.filter(p => p.goals > 0).slice(0, 5);
  const maxGoals = scorers.length ? scorers[0].goals : 1;
  const topScorer = scorers[0];
  const topAssister = [...stats].sort((a, b) => b.assists - a.assists).find(p => p.assists > 0);
  const worst = [...stats].filter(p => p.matches > 0).sort((a, b) => b.losses - a.losses)[0];

  return (
    <div className="p-3.5 pb-4 flex flex-col gap-[13px]">
      <div className="font-heading font-extrabold text-[17px] text-ink">Análises da pelada</div>

      <div className="grid grid-cols-2 gap-[9px]">
        <div className="bg-surface border border-line rounded-[13px] p-[13px]">
          <div className="text-[11px] text-ink-soft font-semibold">Partidas</div>
          <div className="font-heading font-extrabold text-[24px] mt-0.5 text-ink">{totals.totalMatches}</div>
        </div>
        <div className="bg-surface border border-line rounded-[13px] p-[13px]">
          <div className="text-[11px] text-ink-soft font-semibold">Gols</div>
          <div className="font-heading font-extrabold text-[24px] mt-0.5 text-ink">
            {totals.totalGoals} <span className="text-[11px] text-ink-soft font-semibold">{totals.goalsPerMatch}/jogo</span>
          </div>
        </div>
      </div>

      {topScorer && (
        <div className="rounded-[14px] p-[13px] flex items-center gap-3 border" style={{ background: 'linear-gradient(120deg,#fdf6e3,#f6ecca)', borderColor: '#ecd79a' }}>
          <span className="text-[20px]">👑</span>
          <span className="chip w-[34px] h-[34px] flex-none rounded-full text-white font-stat text-[12px] flex items-center justify-center" style={{ background: '#d99a1a' }}>{topScorer.arrivalOrder}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-ink truncate">{topScorer.name}</div>
            <div className="text-[11px]" style={{ color: '#9a6a10' }}>Artilheiro · {topScorer.goals} gols</div>
          </div>
        </div>
      )}

      <div className="bg-surface border border-line rounded-2xl p-[14px]">
        <div className="font-heading font-bold text-[14px] mb-2.5 text-ink">Ranking de gols</div>
        {scorers.length === 0 ? (
          <div className="text-ink-soft text-sm py-2">Sem gols registrados ainda.</div>
        ) : (
          <div className="flex flex-col">
            {scorers.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-2.5 py-2 ${i > 0 ? 'border-t border-[#f1ece1]' : ''}`}>
                <span className="font-stat text-[12px] text-[#c8c1b0] w-3">{i + 1}</span>
                <span className="chip w-[26px] h-[26px] flex-none rounded-full bg-ink text-white font-stat text-[10px] flex items-center justify-center">{p.arrivalOrder}</span>
                <span className="text-[12.5px] font-semibold text-ink w-24 truncate">{p.name}</span>
                <div className="flex-1 h-[7px] bg-[#f1ece1] rounded-full overflow-hidden">
                  <div className="h-full bg-wine rounded-full" style={{ width: `${Math.round((p.goals / maxGoals) * 100)}%` }} />
                </div>
                <span className="font-stat text-[13px] font-bold w-3.5 text-right text-ink">{p.goals}</span>
              </div>
            ))}
          </div>
        )}
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
  );
}
