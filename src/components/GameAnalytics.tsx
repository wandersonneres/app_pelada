import { Game, getGoalTeamId } from '../types';
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
              className={`${level <= (hoverValue || value) ? 'text-yellow-400 fill-yellow-400' : 'text-ink-dim'} transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
      {showLabel && (
        <span className="text-sm text-ink-muted mt-1">
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
            // Gol contra não credita o autor como artilheiro
            if (goal.scorerId && stats[goal.scorerId] && !goal.ownGoal) {
              stats[goal.scorerId].goals += 1;
            }
            if (goal.assisterId && stats[goal.assisterId]) {
              stats[goal.assisterId].assists += 1;
            }
          });
        }

        const teams = match.teams;

        // Count goals per team using each goal's teamId (resists substitutions / own goals)
        const teamGoals: Record<string, number> = {};
        teams.forEach(t => { teamGoals[t.id] = 0; });
        (match.goals ?? []).forEach(g => {
          const tid = getGoalTeamId(g, teams);
          if (tid && tid in teamGoals) teamGoals[tid] += 1;
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
      ? 'bg-team-blue/15 text-team-blue-soft'
      : pos === 'meio'
      ? 'bg-meio/15 text-meio-soft'
      : 'bg-danger/15 text-danger-soft';
  // Medalhas de pódio (ouro/prata/bronze) — cores neutras que funcionam nos 2 temas
  const rankClass = (i: number) =>
    i === 0
      ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
      : i === 1
      ? 'bg-[#94a3b8]/25 text-[#9aa6b6]'
      : i === 2
      ? 'bg-[#d97706]/20 text-[#d97706]'
      : 'text-ink-dim';

  return (
    <div className="space-y-5">
      {/* Cards de destaque */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Partidas */}
        <Card className="border-divider shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 bg-team-blue/15 rounded-md">
                <Trophy className="w-3.5 h-3.5 text-team-blue-soft" />
              </div>
              <span className="text-xs text-ink-muted font-medium">Partidas</span>
            </div>
            <p className="text-3xl font-bold text-heading">{totalMatches}</p>
          </CardContent>
        </Card>

        {/* Gols */}
        <Card className="border-divider shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 bg-success/15 rounded-md">
                <Target className="w-3.5 h-3.5 text-success-soft" />
              </div>
              <span className="text-xs text-ink-muted font-medium">Gols</span>
            </div>
            <p className="text-3xl font-bold text-heading">{totalGoals}</p>
            <p className="text-xs text-ink-dim mt-0.5">
              {totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0.0'}/jogo
            </p>
          </CardContent>
        </Card>

        {/* Jogadores */}
        <Card className="border-divider shadow-sm col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 bg-meio/15 rounded-md">
                <Users className="w-3.5 h-3.5 text-meio-soft" />
              </div>
              <span className="text-xs text-ink-muted font-medium">Jogadores</span>
            </div>
            <p className="text-3xl font-bold text-heading">{game.players.length}</p>
          </CardContent>
        </Card>

        {/* Artilheiro */}
        {topScorer ? (
          <Card className="border-warning/30 bg-warning/10 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="p-1 bg-warning/20 rounded-md">
                  <Crown className="w-3.5 h-3.5 text-warning-soft" />
                </div>
                <span className="text-xs text-warning-soft font-medium">Artilheiro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center text-sm font-bold text-warning-soft shrink-0">
                  {topScorer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-heading truncate">
                    {topScorer.name.split(' ')[0]}
                  </p>
                  <p className="text-xs text-warning-soft font-medium">{topScorer.goals} gols</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-divider shadow-sm opacity-60">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="p-1 bg-surface-hover rounded-md">
                  <Crown className="w-3.5 h-3.5 text-ink-dim" />
                </div>
                <span className="text-xs text-ink-dim font-medium">Artilheiro</span>
              </div>
              <p className="text-xs text-ink-dim">Sem gols</p>
            </CardContent>
          </Card>
        )}

        {/* Melhor Assistente */}
        {topAssister ? (
          <Card className="border-team-blue/30 bg-team-blue/10 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="p-1 bg-team-blue/20 rounded-md">
                  <Footprints className="w-3.5 h-3.5 text-team-blue-soft" />
                </div>
                <span className="text-xs text-team-blue-soft font-medium">Assistente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-team-blue/20 flex items-center justify-center text-sm font-bold text-team-blue-soft shrink-0">
                  {topAssister.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-heading truncate">
                    {topAssister.name.split(' ')[0]}
                  </p>
                  <p className="text-xs text-team-blue-soft font-medium">{topAssister.assists} assists</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-divider shadow-sm opacity-60">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="p-1 bg-surface-hover rounded-md">
                  <Footprints className="w-3.5 h-3.5 text-ink-dim" />
                </div>
                <span className="text-xs text-ink-dim font-medium">Assistente</span>
              </div>
              <p className="text-xs text-ink-dim">Sem assists</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mais Vitorioso — banner destacado */}
      {topWinner && (
        <Card className="border-success/30 bg-success/10 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-success/20 rounded-lg shrink-0">
              <Award className="w-5 h-5 text-success-soft" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-success-soft font-medium mb-0.5">Mais Vitorioso da Pelada</p>
              <p className="text-base font-bold text-heading truncate">{topWinner.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-success-soft">{topWinner.victories}</p>
              <p className="text-xs text-success-soft">vitórias</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela simplificada */}
      <Card className="border-divider shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-divider flex items-center gap-2">
          <Target className="w-4 h-4 text-team-blue" />
          <h2 className="text-sm font-semibold text-heading">Estatísticas dos Jogadores</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-ink-muted">
                <th className="px-3 py-2 text-left text-xs font-medium w-10">#</th>
                <th className="px-3 py-2 text-left text-xs font-medium">Jogador</th>
                <th className="px-3 py-2 text-left text-xs font-medium w-14">Pos</th>
                <th className="px-2 py-2 text-center text-xs font-medium w-12" title="Gols">
                  <Target className="w-3.5 h-3.5 mx-auto" />
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium w-12" title="Assistências">
                  <Footprints className="w-3.5 h-3.5 mx-auto" />
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium w-12" title="Vitórias">
                  <Award className="w-3.5 h-3.5 mx-auto" />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium w-16">Aprov.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {playerStats.map((player, index) => (
                <tr key={player.id} className={`transition-colors ${index === 0 ? 'bg-warning/5 hover:bg-warning/10' : 'hover:bg-surface/50'}`}>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${rankClass(index)}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full avatar-grad flex items-center justify-center text-xs font-bold text-white shrink-0 ring-1 ring-black/10">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-heading truncate max-w-[120px]">
                        {player.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${posBadgeClass(player.position)}`}>
                      {posLabel(player.position)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center font-semibold">
                    {player.goals > 0 ? (
                      <span className="text-success-soft">{player.goals}</span>
                    ) : (
                      <span className="text-ink-dim">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-center font-semibold">
                    {player.assists > 0 ? (
                      <span className="text-team-blue-soft">{player.assists}</span>
                    ) : (
                      <span className="text-ink-dim">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-center font-semibold">
                    {player.victories > 0 ? (
                      <span className="text-success-soft">{player.victories}</span>
                    ) : (
                      <span className="text-ink-dim">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {player.matches > 0 ? (
                      <span className="text-xs font-semibold text-ink-soft">{player.winRate}%</span>
                    ) : (
                      <span className="text-ink-dim text-xs">—</span>
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
