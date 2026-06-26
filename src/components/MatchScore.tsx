import { Match, getGoalTeamId } from '../types';

interface MatchScoreProps {
  match: Match;
}

export function MatchScore({ match }: MatchScoreProps) {
  // Calcula os gols de cada time pelo time que o gol contabiliza (teamId),
  // resistindo a substituições e gols contra.
  const teamAGoals = match.goals?.filter(goal =>
    getGoalTeamId(goal, match.teams) === match.teams[0].id
  ).length || 0;

  const teamBGoals = match.goals?.filter(goal =>
    getGoalTeamId(goal, match.teams) === match.teams[1].id
  ).length || 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 glass-card p-4 mb-4">
      <span className="font-heading font-bold text-lg sm:text-xl text-team-blue-soft whitespace-nowrap">
        {match.teams[0]?.name || 'Time Azul'}
      </span>
      <div className="flex items-center gap-2 sm:gap-4 bg-surface px-4 py-2 rounded-lg border border-divider">
        <span className="font-heading text-2xl sm:text-3xl font-extrabold text-team-blue-soft min-w-[32px] text-center">
          {teamAGoals}
        </span>
        <span className="text-2xl font-bold text-ink-dim">×</span>
        <span className="font-heading text-2xl sm:text-3xl font-extrabold text-team-orange-soft min-w-[32px] text-center">
          {teamBGoals}
        </span>
      </div>
      <span className="font-heading font-bold text-lg sm:text-xl text-team-orange-soft whitespace-nowrap">
        {match.teams[1]?.name || 'Time Laranja'}
      </span>
    </div>
  );
} 