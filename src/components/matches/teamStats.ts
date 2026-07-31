import { Player } from '../../types';

// Mesma fórmula usada em GameDetails.tsx para balancear e exibir força de time.
export function getAgeValue(ageGroup: string): number {
  switch (ageGroup) {
    case '15-20': return 17.5;
    case '21-30': return 25.5;
    case '31-40': return 35.5;
    case '41-50': return 45.5;
    case '+50': return 55;
    default: return 25.5;
  }
}

function getAgeBalanceScore(ageGroup: string): number {
  switch (ageGroup) {
    case '15-20': return 5;
    case '21-30': return 4;
    case '31-40': return 3;
    case '41-50': return 2;
    case '+50': return 1;
    default: return 4;
  }
}

function getPositionValue(position: string): number {
  switch (position) {
    case 'defesa': return 1;
    case 'meio': return 2;
    case 'ataque': return 3;
    default: return 2;
  }
}

export function calculatePlayerScore(player: Player): number {
  return player.skillLevel * 0.6 + getAgeBalanceScore(player.ageGroup) * 0.3 + getPositionValue(player.position) * 0.1;
}

export function calculateTeamScore(players: Player[]): number {
  return players.reduce((sum, p) => sum + calculatePlayerScore(p), 0);
}

export function average(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}
