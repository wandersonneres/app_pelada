export interface Player {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  arrivalTime?: Date;
  confirmed: boolean;
  position: 'defesa' | 'meio' | 'ataque';
}

export interface Goal {
  id: string;
  matchId: string;
  teamId: string;
  scorerId: string;
  assisterId?: string;
  timestamp: Date;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  score?: number;
  goals?: Goal[];
  formation?: {
    defesa: Player[];
    meio: Player[];
    ataque: Player[];
    tactical?: string; // Formação tática (ex: '4-3-2')
  };
}

export interface Match {
  id: string;
  teams: Team[];
  status: 'waiting' | 'in_progress' | 'finished';
  winner?: string; // ID do time vencedor
  createdAt: Date;
  updatedAt: Date;
  duration?: number; // Duração em minutos
  goals?: Goal[];
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
  username: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'player';
  playerInfo?: {
    name: string;
    position: 'defesa' | 'meio' | 'ataque';
    ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50';
    skillLevel: 1 | 2 | 3 | 4 | 5;
  };
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
} 