import { Player, Team, Goal } from '../types';
import { useState, useEffect } from 'react';

interface TacticalViewProps {
  team: Team;
  formation: string;
  onFormationChange: (formation: string) => void;
  goals?: Goal[];
  teamColor: string;
  isHomeTeam?: boolean;
}

const FORMATIONS_BY_COUNT: Record<number, string[]> = {
  4:  ['2-1-1', '1-2-1'],
  5:  ['2-2-1', '2-1-2'],
  6:  ['3-2-1', '2-3-1'],
  7:  ['3-3-1', '3-2-2'],
  8:  ['4-3-1', '3-3-2'],
  9:  ['4-3-1', '3-4-2'],
  10: ['4-4-2', '4-3-3'],
};

export const TacticalView = ({ team, formation = '3-3-3', onFormationChange, goals = [], teamColor, isHomeTeam = false }: TacticalViewProps) => {
  const [positions, setPositions] = useState<Player[][]>([]);

  const playerCount = team.players.length;
  const availableFormations = FORMATIONS_BY_COUNT[playerCount] ?? FORMATIONS_BY_COUNT[9];

  useEffect(() => {
    if (availableFormations.length > 0 && !availableFormations.includes(formation)) {
      onFormationChange(availableFormations[0]);
    }
  }, [availableFormations, formation, onFormationChange]);

  useEffect(() => {
    const activeFormation = availableFormations.includes(formation) ? formation : availableFormations[0];
    const formationArray = activeFormation.split('-').map(Number);
    const sortedPlayers = [...team.players].sort((a, b) => {
      const positionOrder = { defesa: 1, meio: 2, ataque: 3 };
      if (positionOrder[a.position] !== positionOrder[b.position]) {
        return positionOrder[a.position] - positionOrder[b.position];
      }
      const ageOrder = {
        '+50': 1,
        '41-50': 2,
        '31-40': 3,
        '21-30': 4,
        '15-20': 5
      };
      if (ageOrder[a.ageGroup] !== ageOrder[b.ageGroup]) {
        return ageOrder[a.ageGroup] - ageOrder[b.ageGroup];
      }
      return a.skillLevel - b.skillLevel;
    });
    const newPositions: Player[][] = [];
    let playerIndex = 0;
    formationArray.forEach((playersInLine) => {
      const line: Player[] = [];
      for (let i = 0; i < playersInLine && playerIndex < sortedPlayers.length; i++) {
        line.push(sortedPlayers[playerIndex++]);
      }
      newPositions.push(line);
    });
    setPositions(newPositions);
  }, [formation, team.players, availableFormations]);

  return (
    <div
      className={`relative w-full max-w-xl mx-auto h-72 bg-gradient-to-b from-green-200 to-green-400 rounded-xl border border-green-300 shadow-inner overflow-hidden ${isHomeTeam ? 'rotate-180' : ''}`}
    >
      {/* Seletor de Formação */}
      <div className={`absolute top-2 right-2 z-10 ${isHomeTeam ? 'rotate-180' : ''}`}>
        <select
          className="text-xs bg-white/80 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={availableFormations.includes(formation) ? formation : availableFormations[0]}
          onChange={e => onFormationChange(e.target.value)}
        >
          {availableFormations.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      {/* Linhas do campo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40" style={{transform: 'translateY(-50%)'}} />
        <div className="absolute top-1/2 left-1/2 w-10 h-10 border border-white/40 rounded-full" style={{transform: 'translate(-50%, -50%)'}} />
        {/* Áreas */}
        <div className="absolute top-0 left-1/2 w-32 h-10 border border-white/40 rounded-b-xl" style={{transform: 'translateX(-50%)'}} />
        <div className="absolute bottom-0 left-1/2 w-32 h-10 border border-white/40 rounded-t-xl" style={{transform: 'translateX(-50%)'}} />
      </div>
        {/* Jogadores */}
        {positions.map((line, lineIndex) => (
        <div
            key={lineIndex}
          className="absolute left-0 right-0 flex justify-evenly items-center"
          style={{ top: `${((lineIndex + 1) * 100) / (positions.length + 1)}%`, transform: 'translateY(-50%)' }}
          >
          {line.map(player => (
            <div key={player.id} className={`flex flex-col items-center ${isHomeTeam ? 'rotate-180' : ''}`}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2"
                style={{ backgroundColor: teamColor }}
                title={player.name}
              >
                {player.name.split(' ')[0][0]}
              </div>
              <span className="text-xs text-white font-medium drop-shadow max-w-[60px] truncate mt-1">
                      {player.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
        ))}
    </div>
  );
}
