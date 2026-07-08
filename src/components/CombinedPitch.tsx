import { Team, Goal, Player, getGoalTeamId } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';

interface CombinedPitchProps {
  teamA: Team;
  teamB: Team;
  goals?: Goal[];
  formationA: string;
  formationB: string;
  onFormationChange?: (teamId: string, formation: string) => void;
}

const FORMATIONS_BY_COUNT: Record<number, string[]> = {
  4: ['2-1-1', '1-2-1'],
  5: ['2-2-1', '2-1-2'],
  6: ['3-2-1', '2-3-1'],
  7: ['3-3-1', '3-2-2'],
  8: ['4-3-1', '3-3-2'],
  9: ['4-3-2', '3-4-2'],
  10: ['4-4-2', '4-3-3'],
};

const POS_ORDER = { defesa: 0, meio: 1, ataque: 2 } as const;

// Distribui os jogadores em linhas conforme a formação, na metade indicada do campo.
function layout(players: Player[], formation: string, half: 'top' | 'bottom') {
  const sorted = [...players].sort((a, b) => POS_ORDER[a.position] - POS_ORDER[b.position]);
  const lines = formation.split('-').map(Number).filter(n => n > 0);
  const out: { player: Player; x: number; y: number }[] = [];
  let idx = 0;
  const n = lines.length || 1;
  lines.forEach((count, li) => {
    const t = n === 1 ? 0.5 : li / (n - 1); // 0 = defesa, 1 = ataque
    // defesa perto do próprio gol; ataque em direção ao meio.
    // linhas bem espalhadas pela metade (gap maior entre elas) e folga no
    // centro (~16%) para os dois ataques não se sobreporem.
    const y = half === 'bottom' ? 88 - t * 30 : 12 + t * 30;
    for (let i = 0; i < count && idx < sorted.length; i++) {
      const x = ((i + 1) * 100) / (count + 1);
      out.push({ player: sorted[idx++], x, y });
    }
  });
  // sobras (formação com menos vagas que jogadores) perto do meio
  while (idx < sorted.length) {
    out.push({ player: sorted[idx++], x: 50, y: half === 'bottom' ? 56 : 44 });
  }
  return out;
}

const A_GRAD = 'linear-gradient(155deg,#5b9bf6,#2c5fb0)';
const B_GRAD = 'linear-gradient(155deg,#fba56a,#d2691e)';

export function CombinedPitch({
  teamA, teamB, goals = [], formationA, formationB, onFormationChange,
}: CombinedPitchProps) {
  const goalsOf = (playerId: string) =>
    goals.filter(g => g.scorerId === playerId && !g.ownGoal).length;

  const formationsA = FORMATIONS_BY_COUNT[teamA.players.length] ?? FORMATIONS_BY_COUNT[9];
  const formationsB = FORMATIONS_BY_COUNT[teamB.players.length] ?? FORMATIONS_BY_COUNT[9];
  const fA = formationsA.includes(formationA) ? formationA : formationsA[0];
  const fB = formationsB.includes(formationB) ? formationB : formationsB[0];

  // time A embaixo, time B em cima
  const tokensA = layout(teamA.players, fA, 'bottom').map(t => ({ ...t, grad: A_GRAD }));
  const tokensB = layout(teamB.players, fB, 'top').map(t => ({ ...t, grad: B_GRAD }));
  const tokens = [...tokensB, ...tokensA];

  const fmtFormSelect = (team: Team, formations: string[], current: string) => (
    <Select value={current} onValueChange={v => { if (v) onFormationChange?.(team.id, v); }}>
      <SelectTrigger
        onClick={e => e.stopPropagation()}
        className="h-auto w-auto gap-1 border-0 bg-transparent p-0 text-xs font-heading font-bold tracking-wide text-inherit shadow-none hover:bg-transparent focus-visible:ring-0 data-[size=default]:h-auto dark:bg-transparent dark:hover:bg-transparent [&>svg]:size-3 [&>svg]:opacity-80"
      >
        <span>{current}</span>
      </SelectTrigger>
      <SelectContent>
        {formations.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.7)] relative h-full flex flex-col">
      <div className="relative w-full flex-1 min-h-[460px] md:min-h-[560px] min-[960px]:landscape:min-h-[320px] xl:min-h-[320px]" style={{ background: 'var(--pitch-grad)' }}>
        {/* faixas */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(180deg, var(--pitch-stripe) 0 52px, rgba(255,255,255,0) 52px 104px)' }} />
        {/* marcações */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2" style={{ background: 'var(--pitch-line)' }} />
        <div className="absolute left-1/2 top-1/2 rounded-full -translate-x-1/2 -translate-y-1/2" style={{ width: 120, height: 120, border: '2px solid var(--pitch-line)' }} />
        <div className="absolute left-1/2 top-1/2 rounded-full -translate-x-1/2 -translate-y-1/2" style={{ width: 8, height: 8, background: 'var(--pitch-center-dot)' }} />
        <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ width: 190, height: 78, border: '2px solid var(--pitch-line-soft)', borderTop: 'none', borderRadius: '0 0 10px 10px' }} />
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2" style={{ width: 190, height: 78, border: '2px solid var(--pitch-line-soft)', borderBottom: 'none', borderRadius: '10px 10px 0 0' }} />

        {/* tags de formação */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-team-orange-soft" style={{ background: 'var(--pitch-pill-bg)', backdropFilter: 'blur(4px)', border: '1px solid rgba(249,115,22,0.4)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F97316' }} />
          <span className="font-heading font-bold text-xs tracking-wide uppercase">{(teamB.name || 'Laranja')} ·</span>
          {fmtFormSelect(teamB, formationsB, fB)}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-team-blue-soft" style={{ background: 'var(--pitch-pill-bg)', backdropFilter: 'blur(4px)', border: '1px solid rgba(59,130,246,0.4)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3B82F6' }} />
          <span className="font-heading font-bold text-xs tracking-wide uppercase">{(teamA.name || 'Azul')} ·</span>
          {fmtFormSelect(teamA, formationsA, fA)}
        </div>

        {/* jogadores */}
        {tokens.map(t => {
          const g = goalsOf(t.player.id);
          return (
            <div
              key={t.player.id}
              className="absolute flex flex-col items-center gap-1"
              style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%,-50%)', width: 60, zIndex: 2 }}
            >
              <div
                className="relative rounded-full"
                style={{
                  width: 28, height: 28, background: t.grad,
                  border: '2px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                }}
              >
                {g > 0 && (
                  <div className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center font-heading font-extrabold" style={{ fontSize: 9, color: '#0b3d2e', background: 'radial-gradient(circle at 35% 30%,#fff,#cbd2dd)', border: '1.5px solid #fff' }}>{g}</div>
                )}
              </div>
              <div className="text-[10px] font-semibold whitespace-nowrap max-w-[60px] overflow-hidden text-ellipsis" style={{ color: 'var(--pitch-label)', textShadow: 'var(--pitch-label-shadow)' }}>
                {t.player.name.split(' ')[0]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
