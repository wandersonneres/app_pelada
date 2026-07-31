import { Match, Player, getGoalTeamId } from '../../types';

interface FinishedMatchSummaryProps {
  match: Match;
  roster: Player[]; // elenco completo do jogo, para resolver nomes de jogadores substituídos
}

export function FinishedMatchSummary({ match, roster }: FinishedMatchSummaryProps) {
  const teamA = match.teams[0];
  const teamB = match.teams[1];
  const allPlayers = [...teamA.players, ...teamB.players, ...roster];
  const winner = match.teams.find(t => t.id === match.winner);

  const goals = [...(match.goals || [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const scoreA = match.goals?.filter(g => getGoalTeamId(g, match.teams) === teamA.id).length ?? teamA.score ?? 0;
  const scoreB = match.goals?.filter(g => getGoalTeamId(g, match.teams) === teamB.id).length ?? teamB.score ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-4 bg-ink text-white rounded-xl py-4">
        <div className="text-right">
          <div className="text-xs font-semibold text-team-blue-tint">{teamA.name}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-stat text-3xl font-bold">{scoreA}</span>
          <span className="text-white/40 text-sm">×</span>
          <span className="font-stat text-3xl font-bold">{scoreB}</span>
        </div>
        <div className="text-left">
          <div className="text-xs font-semibold text-team-orange-tint">{teamB.name}</div>
        </div>
      </div>

      {winner && (
        <div className="text-center text-xs font-semibold text-ink-medium">{winner.name} venceu esta partida</div>
      )}

      {goals.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-ink-soft uppercase tracking-wide mb-1.5">Timeline de gols</div>
          <ul className="space-y-1.5">
            {goals.map(goal => {
              const scorer = allPlayers.find(p => p.id === goal.scorerId);
              const assister = goal.assisterId ? allPlayers.find(p => p.id === goal.assisterId) : null;
              const isTeamA = getGoalTeamId(goal, match.teams) === teamA.id;
              return (
                <li key={goal.id} className="flex items-center gap-2 bg-paper rounded-lg px-3 py-2 text-xs">
                  <span className={`w-2 h-2 rounded-full flex-none ${isTeamA ? 'bg-team-blue' : 'bg-team-orange'}`} />
                  <span className="flex-1 min-w-0 truncate">
                    <span className="font-semibold text-ink">{scorer?.name ?? '?'}</span>
                    {goal.ownGoal ? (
                      <span className="text-state-live"> (gol contra)</span>
                    ) : assister ? (
                      <span className="text-ink-soft"> (assist. {assister.name})</span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
