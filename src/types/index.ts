export interface Player {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  arrivalTime?: Date;
  confirmed: boolean;
  position: 'defesa' | 'meio' | 'ataque';
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  score?: number;
  formation?: {
    defesa: Player[];
    meio: Player[];
    ataque: Player[];
  };
}

export interface Match {
  id: string;
  teams: Team[];
  status: 'waiting' | 'in_progress' | 'finished';
  winner?: string; // ID do time vencedor
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  id: string;
  date: Date;
  location: string;
  maxPlayers: number;
  status: 'waiting' | 'in_progress' | 'finished';
  players: Player[];
  matches: Match[];
  currentMatch?: string; // ID da partida atual
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: Date;
} 