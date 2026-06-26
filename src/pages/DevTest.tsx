import { useRef, useLayoutEffect, useState } from 'react';

// TEMP dev-only route (/dev-test) to verify the tablet-landscape "fit" behavior. Remove after.
export function DevTest() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'partidas' | 'jogadores'>('partidas');

  useLayoutEffect(() => {
    const mql = window.matchMedia(
      '(min-width: 1180px) and (max-width: 1366px) and (max-height: 834px) and (orientation: landscape)'
    );
    const recompute = () => {
      const el = gridRef.current;
      if (!el) return;
      el.style.height = '';
      if (mql.matches && tab === 'partidas') {
        const overflow = document.documentElement.scrollHeight - window.innerHeight;
        if (overflow > 0) {
          const naturalH = el.getBoundingClientRect().height;
          el.style.height = `${Math.max(320, naturalH - overflow - 8)}px`;
        }
      }
    };
    recompute();
    window.addEventListener('resize', recompute);
    mql.addEventListener('change', recompute);
    return () => {
      window.removeEventListener('resize', recompute);
      mql.removeEventListener('change', recompute);
      if (gridRef.current) gridRef.current.style.height = '';
    };
  }, [tab]);

  const roster = (name: string, n: number) => (
    <div className="glass-card p-3.5">
      <div className="font-heading font-extrabold text-base text-heading mb-2">{name}</div>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="flex items-center gap-2 py-2 border-t border-divider">
          <div className="w-7 h-7 rounded-full avatar-grad" />
          <span className="text-sm text-ink-soft">Jogador {i + 1}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`pelada-page${tab === 'partidas' ? ' partida-page' : ''}`}>
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 py-5">
        {/* header (faithful-ish) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-6">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-heading">Detalhes da Pelada</h1>
          <span className="glass-pill">Local</span>
          <span className="glass-pill">14 / 20</span>
        </div>
        <div className="glass-card p-4 sm:p-5 mb-4">
          <div className="flex gap-2 mb-4 border-b border-divider">
            <button onClick={() => setTab('jogadores')} className={`px-4 py-2 font-medium border-b-2 ${tab === 'jogadores' ? 'border-team-blue text-team-blue-soft' : 'border-transparent text-ink-muted'}`}>Jogadores</button>
            <button onClick={() => setTab('partidas')} className={`px-4 py-2 font-medium border-b-2 ${tab === 'partidas' ? 'border-team-blue text-team-blue-soft' : 'border-transparent text-ink-muted'}`}>Partidas</button>
          </div>
          {tab === 'partidas' ? (
            <div className="space-y-4">
              <div className="glass-card p-2.5">Barra de jogos · Jogo 1 · 0 × 0</div>
              <div ref={gridRef} data-fit className="partida-fit grid grid-cols-1 xl:grid-cols-[minmax(300px,340px)_minmax(0,1fr)_minmax(300px,340px)] gap-4 items-stretch">
                <div data-col className="flex flex-col gap-3">
                  <div className="glass-card p-4">Placar / Timer</div>
                  <div className="glass-card p-4">Força do time</div>
                </div>
                <div data-col className="glass-card flex items-center justify-center text-ink-muted" style={{ minHeight: 300 }}>Campo</div>
                <div data-col className="space-y-3">
                  {roster('Time Azul', 8)}
                  {roster('Time Laranja', 8)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-ink-soft">Aba jogadores (sem fit)</div>
          )}
        </div>
      </div>
    </div>
  );
}
