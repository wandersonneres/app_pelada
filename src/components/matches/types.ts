import { Game, Match, Player, Team } from '../../types';

export interface MatchesLayoutProps {
  game: Game;
  matches: Match[];
  activeMatch: Match;
  activeMatchId: string | null;
  onSelectMatch: (matchId: string) => void;
  isFirstMatch: boolean;
  canManage: boolean;
  playersPerTeam: number;
  setPlayersPerTeam: (n: number) => void;
  isPlayersPerTeamOpen: boolean;
  setIsPlayersPerTeamOpen: (open: boolean) => void;
  isGeneratingTeams: boolean;
  generateTeams: () => void;
  onGoalScored: (teamId: string, scorerId: string, assisterId?: string, ownGoal?: boolean) => void;
  onRemoveGoal: (goalId: string) => void;
  onTimerUpdate: (timerData: {
    isRunning: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    startedAt?: Date;
  }) => void;
  onFormationChange: (teamId: string, formation: string) => void;
  onFinishMatch: (matchId: string, winnerTeamId: string) => void;
  onDeleteMatch: (matchId: string) => void;
  onSwapClick: (team: Team, player: Player) => void;
  onOpenWaitingList: (matchId: string) => void;
}
