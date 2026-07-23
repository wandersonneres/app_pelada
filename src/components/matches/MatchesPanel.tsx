import { useEffect, useRef, useState } from 'react';
import { Game, Match, Player, Team } from '../../types';
import type { User } from '../../types/index';
import { useViewport } from '../../hooks/useViewport';
import { MatchesDesktop } from './MatchesDesktop';
import { MatchesTablet } from './MatchesTablet';
import { MatchesMobile } from './MatchesMobile';
import { EmptyMatches } from './EmptyMatches';

interface MatchesPanelProps {
  game: Game;
  user: User | null;
  playersPerTeam: number;
  isPlayersPerTeamOpen: boolean;
  setIsPlayersPerTeamOpen: (open: boolean) => void;
  setPlayersPerTeam: (n: number) => void;
  isGeneratingTeams: boolean;
  generateTeams: () => void;
  deleteMatch: (matchId: string) => void;
  finishMatch: (matchId: string, winnerTeamId: string) => void;
  handleFormationChange: (matchId: string, teamId: string, formation: string) => void;
  handleGoalScored: (matchId: string, teamId: string, scorerId: string, assisterId?: string, ownGoal?: boolean) => void;
  handleRemoveGoal: (matchId: string, goalId: string) => void;
  createTimerUpdateHandler: (matchId: string) => (timerData: {
    isRunning: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    startedAt?: Date;
  }) => void;
  onOpenSwap: (team: Team, player: Player, match: Match) => void;
  setWaitingListMatchId: (matchId: string | null) => void;
}

export function MatchesPanel({
  game,
  user,
  playersPerTeam,
  isPlayersPerTeamOpen,
  setIsPlayersPerTeamOpen,
  setPlayersPerTeam,
  isGeneratingTeams,
  generateTeams,
  deleteMatch,
  finishMatch,
  handleFormationChange,
  handleGoalScored,
  handleRemoveGoal,
  createTimerUpdateHandler,
  onOpenSwap,
  setWaitingListMatchId,
}: MatchesPanelProps) {
  const viewport = useViewport();
  const matches = game.matches || [];
  const [activeMatchId, setActiveMatchId] = useState<string | null>(
    matches.length > 0 ? matches[matches.length - 1].id : null
  );

  const prevCount = useRef(matches.length);
  useEffect(() => {
    if (matches.length === 0) {
      setActiveMatchId(null);
      prevCount.current = 0;
      return;
    }
    const lastId = matches[matches.length - 1].id;
    // Nova partida gerada (a lista cresceu) → vai direto para ela.
    // Também corrige quando a partida ativa deixa de existir (ex.: exclusão).
    if (matches.length > prevCount.current || !activeMatchId || !matches.some(m => m.id === activeMatchId)) {
      setActiveMatchId(lastId);
    }
    prevCount.current = matches.length;
  }, [matches, activeMatchId]);

  const canManage = !!(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista');
  const activeMatch = matches.find(m => m.id === activeMatchId) || null;
  const activeMatchIndex = activeMatch ? matches.findIndex(m => m.id === activeMatch.id) : -1;

  if (matches.length === 0 || !activeMatch) {
    return (
      <EmptyMatches
        playersCount={game.players.length}
        playersPerTeam={playersPerTeam}
        setPlayersPerTeam={setPlayersPerTeam}
        isGeneratingTeams={isGeneratingTeams}
        generateTeams={generateTeams}
        canManage={canManage}
      />
    );
  }

  const layoutProps = {
    game,
    matches,
    activeMatch,
    activeMatchId,
    onSelectMatch: setActiveMatchId,
    isFirstMatch: activeMatchIndex === 0,
    canManage,
    playersPerTeam,
    setPlayersPerTeam,
    isPlayersPerTeamOpen,
    setIsPlayersPerTeamOpen,
    isGeneratingTeams,
    generateTeams,
    onGoalScored: (teamId: string, scorerId: string, assisterId?: string, ownGoal?: boolean) =>
      handleGoalScored(activeMatch.id, teamId, scorerId, assisterId, ownGoal),
    onRemoveGoal: (goalId: string) => handleRemoveGoal(activeMatch.id, goalId),
    onTimerUpdate: createTimerUpdateHandler(activeMatch.id),
    onFormationChange: (teamId: string, formation: string) => handleFormationChange(activeMatch.id, teamId, formation),
    onFinishMatch: finishMatch,
    onDeleteMatch: deleteMatch,
    onSwapClick: (team: Team, player: Player) => onOpenSwap(team, player, activeMatch),
    onOpenWaitingList: setWaitingListMatchId,
  };

  if (viewport === 'desktop') return <MatchesDesktop {...layoutProps} />;
  if (viewport === 'tablet') return <MatchesTablet {...layoutProps} />;
  return <MatchesMobile {...layoutProps} />;
}
