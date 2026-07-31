import { useMemo } from 'react';
import { Player, Team } from '../../types';

const FORMATIONS_BY_COUNT: Record<number, string[]> = {
  4: ['2-1-1', '1-2-1'],
  5: ['2-2-1', '2-1-2'],
  6: ['3-2-1', '2-3-1'],
  7: ['3-3-1', '3-2-2'],
  8: ['4-3-1', '3-3-2'],
  9: ['4-3-1', '3-4-2'],
  10: ['4-4-2', '4-3-3'],
};

export function getAvailableFormations(playerCount: number): string[] {
  return FORMATIONS_BY_COUNT[playerCount] ?? FORMATIONS_BY_COUNT[9];
}

// Linhas ordenadas do próprio gol para fora (defesa -> meio -> ataque),
// mesma ordenação usada antes em TacticalView.
export function useFormationLines(team: Team, formation: string): Player[][] {
  const availableFormations = getAvailableFormations(team.players.length);
  const activeFormation = availableFormations.includes(formation) ? formation : availableFormations[0];

  return useMemo(() => {
    const formationArray = activeFormation.split('-').map(Number);
    const sortedPlayers = [...team.players].sort((a, b) => {
      const positionOrder = { defesa: 1, meio: 2, ataque: 3 };
      if (positionOrder[a.position] !== positionOrder[b.position]) {
        return positionOrder[a.position] - positionOrder[b.position];
      }
      const ageOrder = { '+50': 1, '41-50': 2, '31-40': 3, '21-30': 4, '15-20': 5 };
      if (ageOrder[a.ageGroup] !== ageOrder[b.ageGroup]) {
        return ageOrder[a.ageGroup] - ageOrder[b.ageGroup];
      }
      return a.skillLevel - b.skillLevel;
    });

    const lines: Player[][] = [];
    let idx = 0;
    formationArray.forEach(count => {
      const line: Player[] = [];
      for (let i = 0; i < count && idx < sortedPlayers.length; i++) {
        line.push(sortedPlayers[idx++]);
      }
      lines.push(line);
    });
    return lines;
  }, [activeFormation, team.players]);
}
