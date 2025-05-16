import { Match } from '../types';

interface MatchScoreProps {
  match: Match;
}

export function MatchScore({ match }: MatchScoreProps) {
  // Calcula os gols de cada time
  const teamAGoals = match.goals?.filter(goal => 
    match.teams[0].players.some(p => p.id === goal.scorerId)
  ).length || 0;

  const teamBGoals = match.goals?.filter(goal => 
    match.teams[1].players.some(p => p.id === goal.scorerId)
  ).length || 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 bg-white rounded-xl shadow p-4 mb-4 border border-gray-100">
      <span className="font-bold text-lg sm:text-xl text-gray-700 whitespace-nowrap">
        {match.teams[0]?.name || 'Time Branco'}
      </span>
      <div className="flex items-center gap-2 sm:gap-4 bg-gray-50 px-4 py-2 rounded-lg shadow-inner">
        <span className="text-2xl sm:text-3xl font-bold text-blue-600 min-w-[32px] text-center">
          {teamAGoals}
        </span>
        <span className="text-2xl font-bold text-gray-400">x</span>
        <span className="text-2xl sm:text-3xl font-bold text-orange-500 min-w-[32px] text-center">
          {teamBGoals}
        </span>
      </div>
      <span className="font-bold text-lg sm:text-xl text-orange-500 whitespace-nowrap">
        {match.teams[1]?.name || 'Time Laranja'}
      </span>
    </div>
  );
} 