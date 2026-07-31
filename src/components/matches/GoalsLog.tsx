import { X } from 'lucide-react';
import { Match, Player, getGoalTeamId } from '../../types';

interface GoalsLogProps {
  match: Match;
  roster: Player[];
  canManage: boolean;
  onRemoveGoal: (goalId: string) => void;
}

function firstName(name?: string) {
  return name ? name.split(' ')[0] : '?';
}

// Lista compacta e removível dos gols da partida ao vivo.
export function GoalsLog({ match, roster, canManage, onRemoveGoal }: GoalsLogProps) {
  const goals = [...(match.goals || [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  if (goals.length === 0) return null;

  const teamA = match.teams[0];
  const all = [...match.teams.flatMap(t => t.players), ...roster];

  return (
    <div className="flex items-center gap-2 bg-surface border border-line rounded-xl px-3 py-2 overflow-x-auto">
      <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wide flex-none">Gols</span>
      <div className="flex items-center gap-1.5">
        {goals.map(goal => {
          const scorer = all.find(p => p.id === goal.scorerId);
          const assister = goal.assisterId ? all.find(p => p.id === goal.assisterId) : null;
          const isTeamA = getGoalTeamId(goal, match.teams) === teamA.id;
          return (
            <span
              key={goal.id}
              className="inline-flex items-center gap-1.5 bg-paper border border-line-soft rounded-full pl-2 pr-1 py-1 text-[11px] flex-none"
            >
              <span className={`w-2 h-2 rounded-full ${isTeamA ? 'bg-team-blue' : 'bg-team-orange'}`} />
              <span className="font-semibold text-ink whitespace-nowrap">
                {firstName(scorer?.name)}
                {goal.ownGoal ? <span className="text-state-live font-normal"> (contra)</span> : assister ? <span className="text-ink-soft font-normal"> ·{firstName(assister.name)}</span> : null}
              </span>
              {canManage && (
                <button
                  onClick={() => onRemoveGoal(goal.id)}
                  title="Remover gol"
                  className="w-4 h-4 rounded-full flex items-center justify-center text-ink-icon hover:text-state-live hover:bg-red-50 transition-colors"
                >
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
