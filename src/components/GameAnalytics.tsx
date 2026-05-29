import { Game } from '../types';
import { Trophy, Users, Target, Award, Footprints, Crown, Star } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface GameAnalyticsProps {
  game: Game;
}

interface PlayerStats {
  id: string;
  name: string;
  position: string;
  goals: number;
  assists: number;
  victories: number;
  matches: number;
  winRate: number;
}

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StarRating({ value, onChange, size = 'md', showLabel = true }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-5 h-5';
      case 'md': return 'w-6 h-6';
      case 'lg': return 'w-7 h-7';
      default: return 'w-6 h-6';
    }
  };

  const getLabel = (level: number) => {
    switch (level) {
      case 1: return "Iniciante";
      case 2: return "Básico";
      case 3: return "Intermediário";
      case 4: return "Avançado";
      case 5: return "Profissional";
      default: return "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            onMouseEnter={() => setHoverValue(level)}
            onMouseLeave={() => setHoverValue(null)}
            className={`p-1 transition-colors duration-200 ${getSizeClasses()}`}
            type="button"
          >
            <Star
              className={`${level <= (hoverValue || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
      {showLabel && (
        <span className="text-sm text-gray-500 mt-1">
          {getLabel(hoverValue || value)}
        </span>
      )}
    </div>
  );
}

export function GameAnalytics({ game }: GameAnalyticsProps) {
  const calculatePlayerStats = (): PlayerStats[] => {
    const stats: { [key: string]: PlayerStats } = {};

    game.players.forEach(player => {
      stats[player.id] = {
        id: player.id,
        name: player.name,
        position: player.position,
        goals: 0,
        assists: 0,
        victories: 0,
        matches: 0,
        winRate: 0,
      };
    });

    game.matches.forEach(match => {
      if (match.status === 'finished') {
        if (match.goals) {
          match.goals.forEach(goal => {
            if (goal.scorerId && stats[goal.scorerId]) {
              stats[goal.scorerId].goals += 1;
            }
            if (goal.assisterId && stats[goal.assisterId]) {
              stats[goal.assisterId].assists += 1;
            }
          });
        }

        const teams = match.teams;

        // Count goals per team from the goals array
        const teamGoals: Record<string, number> = {};
        teams.forEach(t => { teamGoals[t.id] = 0; });
        (match.goals ?? []).forEach(g => {
          if (!g.scorerId) return;
          for (const t of teams) {
            if (t.players.some(p => p.id === g.scorerId)) {
              teamGoals[t.id] = (teamGoals[t.id] ?? 0) + 1;
              break;
            }
          }
        });

        // Fall back to team.score if no goals recorded in goals array
        const totalRecorded = Object.values(teamGoals).reduce((a: number, b: number) => a + b, 0);
        if (totalRecorded === 0) {
          teams.forEach(t => { teamGoals[t.id] = t.score ?? 0; });
        }

        const goalValues = teams.map(t => teamGoals[t.id] ?? 0);
        const isDraw = goalValues.every(v => v === goalValues[0]);
        const maxGoals = Math.max(...goalValues);

        teams.forEach(team => {
          team.players.forEach(player => {
            if (stats[player.id]) {
              stats[player.id].matches += 1;
              // Placar diferente → vence quem marcou mais; empate → usa match.winner (quem fica)
              const won = isDraw
                ? match.winner === team.id
                : (teamGoals[team.id] ?? 0) === maxGoals;
              if (won) stats[player.id].victories += 1;
            }
          });
        });
      }
    });

    Object.values(stats).forEach(player => {
      player.winRate = player.matches > 0
        ? Math.round((player.victories / player.matches) * 100)
        : 0;
    });

    return Object.values(stats)
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.victories - a.victories);
  };

  const playerStats = calculatePlayerStats();

  const totalMatches = game.matches.filter(m => m.status === 'finished').length;
  const totalGoals = game.matches.reduce((sum, match) => {
    if (match.status === 'finished' && match.goals) return sum + match.goals.length;
    return sum;
  }, 0);

  const topScorer = playerStats.find(p => p.goals > 0);
  const topAssister = [...playerStats].sort((a, b) => b.assists - a.assists).find(p => p.assists > 0);
  const topWinner = [...playerStats].sort((a, b) => b.victories - a.victories).find(p => p.victories > 0);

  const posLabel = (pos: string) =>
    pos === 'defesa' ? 'DEF' : pos === 'meio' ? 'MEI' : 'ATA';
  const posBadgeClass = (pos: string) =>
    pos === 'defesa'
      ? 'bg-yellow-100 text-yellow-700'
      : pos === 'meio'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-red-100 text-red-700';

  return (
    <div className="space-y-5">
      {/* Cards de destaque */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Partidas */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 bg-blue-100 rounded-md">
                <Trophy className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Partidas</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalMatches}</p>
          </CardContent>
        </Card>

        {/* Gols */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 bg-green-100 rounded-md">
                <Target className="w-3.5 h-3.5 text-green-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Gols</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalGoals}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0.0'}/jogo
            </p>
          </CardContent>
        </Card>

        {/* Jogadores */}
        <Card className="border-gray-100 shadow-sm col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 bg-purple-100 rounded-md">
                <Users className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Jogadores</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{game.players.length}</p>
          </CardContent>
        </Card>

        {/* Artilheiro */}
        {topScorer ? (
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="p-1 bg-yellow-200 rounded-md">
                  <Crown className="w-3.5 h-3.5 text-yellow-700" />
                </div>
                <span className="text-xs text-yellow-700 font-medium">Artilheiro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-sm font-bold text-yellow-800 shrink-0">
                  {topScorer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {topScorer.name.split(' ')[0]}
                  </p>
                  <p className="text-xs text-yellow-700 font-medium">{topScorer.goals} gols</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-100 shadow-sm opacity-60">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="p-1 bg-gray-100 rounded-md">
                  <Crown className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="text-xs text-gray-400 font-medium">Artilheiro</span>
              </div>
              <p className="text-xs text-gray-400">Sem gols</p>
            </CardContent>
          </Card>
        )}

        {/* Melhor Assistente */}
        {topAssister ? (
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="p-1 bg-blue-200 rounded-md">
                  <Footprints className="w-3.5 h-3.5 text-blue-700" />
                </div>
                <span className="text-xs text-blue-700 font-medium">Assistente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-800 shrink-0">
                  {topAssister.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {topAssister.name.split(' ')[0]}
                  </p>
                  <p className="text-xs text-blue-700 font-medium">{topAssister.assists} assists</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-100 shadow-sm opacity-60">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="p-1 bg-gray-100 rounded-md">
                  <Footprints className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="text-xs text-gray-400 font-medium">Assistente</span>
              </div>
              <p className="text-xs text-gray-400">Sem assists</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mais Vitorioso — banner destacado */}
      {topWinner && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-emerald-200 rounded-lg shrink-0">
              <Award className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-emerald-600 font-medium mb-0.5">Mais Vitorioso da Pelada</p>
              <p className="text-base font-bold text-gray-900 truncate">{topWinner.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-emerald-700">{topWinner.victories}</p>
              <p className="text-xs text-emerald-600">vitórias</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela simplificada */}
      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-semibold text-gray-900">Estatísticas dos Jogadores</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500">
                <th className="px-3 py-2 text-left text-xs font-medium w-8">#</th>
                <th className="px-3 py-2 text-left text-xs font-medium">Jogador</th>
                <th className="px-3 py-2 text-left text-xs font-medium w-14">Pos</th>
                <th className="px-3 py-2 text-center text-xs font-medium w-12">
                  <Target className="w-3.5 h-3.5 mx-auto" />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium w-12">
                  <Footprints className="w-3.5 h-3.5 mx-auto" />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium w-12">
                  <Award className="w-3.5 h-3.5 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {playerStats.map((player, index) => (
                <tr key={player.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2.5 text-gray-400 text-xs font-medium">{index + 1}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 shrink-0">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 truncate max-w-[120px]">
                        {player.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${posBadgeClass(player.position)}`}>
                      {posLabel(player.position)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold text-gray-900">
                    {player.goals > 0 ? (
                      <span className="text-green-700">{player.goals}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold text-gray-900">
                    {player.assists > 0 ? (
                      <span className="text-blue-700">{player.assists}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold text-gray-900">
                    {player.victories > 0 ? (
                      <span className="text-emerald-700">{player.victories}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
