import { Timestamp } from 'firebase/firestore';

export interface Player {
  id: string;
  name: string;
  email: string;
  confirmed: boolean;
  arrivalTime: Date | Timestamp;
  position: 'defesa' | 'meio' | 'ataque';
  arrivalOrder?: number;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  score: number;
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
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  winner?: string;
}

export interface Game {
  id: string;
  date: Date | Timestamp;
  location: string;
  maxPlayers: number;
  status: 'waiting' | 'in_progress' | 'finished';
  players: Player[];
  matches: Match[];
  currentMatch?: string;
  observations?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Função auxiliar para converter Timestamp do Firestore para Date
export function convertTimestampToDate(timestamp: Date | Timestamp): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
} 