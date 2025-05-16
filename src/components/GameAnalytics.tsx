import { Game } from '../types';
import { Trophy, Users, Goal, Target, Star, Award, TrendingUp } from 'lucide-react';
import { useState } from 'react';

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

    // Inicializa estatísticas para todos os jogadores
    game.players.forEach(player => {
      stats[player.id] = {
        id: player.id,
        name: player.name,
        position: player.position,
        goals: 0,
        assists: 0,
        victories: 0,
        matches: 0,
        winRate: 0
      };
    });

    // Calcula estatísticas baseado nas partidas
    game.matches.forEach(match => {
      if (match.status === 'finished') {
        // Contabiliza gols e assistências
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

        // Contabiliza vitórias e partidas jogadas
        match.teams.forEach(team => {
          team.players.forEach(player => {
            if (stats[player.id]) {
              stats[player.id].matches += 1;
              if (match.winner === team.id) {
                stats[player.id].victories += 1;
              }
            }
          });
        });
      }
    });

    // Calcula taxa de vitória
    Object.values(stats).forEach(player => {
      player.winRate = player.matches > 0 
        ? Math.round((player.victories / player.matches) * 100) 
        : 0;
    });

    return Object.values(stats)
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.winRate - a.winRate);
  };

  const playerStats = calculatePlayerStats();

  const totalMatches = game.matches.filter(m => m.status === 'finished').length;
  const totalGoals = game.matches.reduce((sum, match) => {
    if (match.status === 'finished' && match.goals) {
      return sum + match.goals.length;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Gerais - Versão mais compacta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Trophy className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Partidas</p>
            <p className="text-xl font-semibold text-gray-900">{totalMatches}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Goal className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Gols</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-semibold text-gray-900">{totalGoals}</p>
              <p className="text-xs text-gray-500">
                ({totalGoals > 0 && totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0.0'} por jogo)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Jogadores</p>
            <p className="text-xl font-semibold text-gray-900">{game.players.length}</p>
          </div>
        </div>
      </div>

      {/* Tabela de Estatísticas - Versão mais compacta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          <h2 className="text-base font-semibold text-gray-900">Estatísticas dos Jogadores</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="px-4 py-2 text-left font-medium">Jogador</th>
                <th className="px-4 py-2 text-left font-medium">Pos</th>
                <th className="px-4 py-2 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <Goal className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-4 py-2 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-4 py-2 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-4 py-2 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-4 py-2 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {playerStats.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 truncate max-w-[120px]">{player.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      player.position === 'defesa' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : player.position === 'meio' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center font-medium">{player.goals}</td>
                  <td className="px-4 py-2 text-center font-medium">{player.assists}</td>
                  <td className="px-4 py-2 text-center font-medium">{player.matches}</td>
                  <td className="px-4 py-2 text-center font-medium">{player.victories}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      player.winRate >= 70 
                        ? 'bg-green-100 text-green-700' 
                        : player.winRate >= 40 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {player.winRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 