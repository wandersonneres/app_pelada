import { Timestamp } from 'firebase/firestore';

export interface Player {
  id: string;
  name: string;
  email: string;
  confirmed: boolean;
  arrivalTime: Date | Timestamp;
  position: 'defesa' | 'meio' | 'ataque';
  arrivalOrder: number;
  skillLevel: 1 | 2 | 3 | 4 | 5;
  ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50';
  paymentType: 'mensalista' | 'diarista';
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  score: number;
  formation: {
    defesa: Player[];
    meio: Player[];
    ataque: Player[];
    tactical?: string; // Formação tática (ex: '3-3-2')
  };
}

export interface Goal {
  id: string;
  scorerId: string;
  assisterId?: string;
  timestamp: Date;
}

export interface Match {
  id: string;
  teams: Team[];
  status: 'waiting' | 'in_progress' | 'finished';
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
  goals?: Goal[];
  duration?: number; // Duração em minutos
  timer?: {
    isRunning: boolean;
    remainingSeconds: number;
    totalSeconds: number; // Duração total em segundos
    startedAt?: Date; // Quando o timer foi iniciado
  };
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
  waitingList: string[]; // IDs dos jogadores na lista de espera, em ordem
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