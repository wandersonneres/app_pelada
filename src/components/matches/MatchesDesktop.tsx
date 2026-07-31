import { Trash2 } from 'lucide-react';
import { FormatSheet } from './FormatSheet';
import { GoalButton } from './GoalButtons';
import { MatchActionsBar } from './MatchActionsBar';
import { MatchNavigator } from './MatchNavigator';
import { PitchLines } from './Pin';
import { RosterPanel } from './RosterPanel';
import { WaitingPanel } from './WaitingPanel';
import { GoalsLog } from './GoalsLog';
import { useFormationLines } from './useFormationLines';
import { matchOutcome } from '../game-details/gameStats';
import { MatchesLayoutProps } from './types';

export function MatchesDesktop({
  game,
  matches,
  activeMatch,
  activeMatchId,
  onSelectMatch,
  canManage,
  playersPerTeam,
  setPlayersPerTeam,
  isPlayersPerTeamOpen,
  setIsPlayersPerTeamOpen,
  isGeneratingTeams,
  generateTeams,
  onGoalScored,
  onRemoveGoal,
  onFormationChange,
  onFinishMatch,
  onSwapClick,
  onOpenWaitingList,
  onDeleteMatch,
}: MatchesLayoutProps) {
  const teamA = activeMatch.teams[0];
  const teamB = activeMatch.teams[1];
  const isLive = activeMatch.status === 'in_progress';
  const lastMatch = matches[matches.length - 1];
  const canGenerate = !isGeneratingTeams
    && game.players.length >= playersPerTeam * 2
    && (matches.length === 0 || (lastMatch?.status === 'finished' && !!lastMatch?.winner));

  const outcome = matchOutcome(activeMatch);
  const linesTop = useFormationLines(teamB, teamB.formation?.tactical || '3-3-1'); // Laranja no topo
  const linesBottom = useFormationLines(teamA, teamA.formation?.tactical || '3-3-1'); // Azul embaixo

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 24px', background: '#fff', borderBottom: '1px solid #e6e1d4' }}>
        <span className="hd" style={{ fontWeight: 700, fontSize: 15 }}>Partidas</span>
        <div style={{ display: 'flex', gap: 10, flex: 1, overflow: 'hidden' }}>
          <MatchNavigator matches={matches} activeMatchId={activeMatchId} onSelect={onSelectMatch} />
        </div>
        {canManage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontSize: 12, color: '#8b8578', fontWeight: 600 }}>Formato</span>
            <button
              onClick={() => setIsPlayersPerTeamOpen(true)}
              style={{ border: '1px solid #ded8c9', borderRadius: 9, padding: '7px 12px', fontSize: 12.5, fontWeight: 700, background: '#fff', cursor: 'pointer' }}
            >
              {playersPerTeam}×{playersPerTeam} ▾
            </button>
            <button
              className={canGenerate ? 'gbtn' : ''}
              onClick={generateTeams}
              disabled={!canGenerate}
              title={!canGenerate && lastMatch && lastMatch.status !== 'finished' ? 'Encerre a partida atual (defina quem continua) para gerar a próxima' : undefined}
              style={{ border: 'none', background: '#6e1a28', color: '#fff', fontWeight: 600, fontSize: 12.5, padding: '9px 15px', borderRadius: 10, cursor: canGenerate ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', opacity: canGenerate ? 1 : 0.45 }}
            >
              + Gerar próxima
            </button>
            {game.status !== 'finished' && (
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.')) {
                    onDeleteMatch(activeMatch.id);
                  }
                }}
                title="Excluir partida"
                style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        )}
      </div>

      {(
        <div style={{ flex: 1, display: 'flex', minHeight: 0, padding: '14px 16px', gap: 16 }}>
          <RosterPanel team={teamA} match={activeMatch} teamKey="azul" canSwap={canManage && isLive} onSwapClick={p => onSwapClick(teamA, p)} variant="desktop" side="left" />

          <div style={{ flex: '1.45 1 0', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  width: '100%',
                  position: 'relative',
                  borderRadius: 18,
                  overflow: 'hidden',
                  background: 'radial-gradient(120% 130% at 50% 0%, #478a5e, #296040)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  padding: '18px 12px',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 60px, rgba(0,0,0,.03) 60px 120px)' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: 'rgba(255,255,255,.45)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 130, height: 130, border: '2px solid rgba(255,255,255,.45)', borderRadius: 999 }} />
                <div style={{ position: 'absolute', top: 0, left: '28%', right: '28%', height: 52, border: '2px solid rgba(255,255,255,.4)', borderTop: 'none', borderRadius: '0 0 10px 10px' }} />
                <div style={{ position: 'absolute', bottom: 0, left: '28%', right: '28%', height: 52, border: '2px solid rgba(255,255,255,.4)', borderBottom: 'none', borderRadius: '10px 10px 0 0' }} />

                <PitchLines lines={linesTop} team="laranja" axis="rows" chipSize={42} chipFont={15} labelFont={11} onPlayerClick={canManage && isLive ? p => onSwapClick(teamB, p) : undefined} />
                <PitchLines lines={linesBottom} team="azul" axis="rows" reverse chipSize={42} chipFont={15} labelFont={11} onPlayerClick={canManage && isLive ? p => onSwapClick(teamA, p) : undefined} />

                <div style={{ position: 'absolute', left: 12, top: 10 }}>
                  <span style={{ background: 'rgba(0,0,0,.42)', color: '#fff', fontSize: 11, padding: '5px 10px', borderRadius: 8, fontWeight: 600 }}>Laranja</span>
                </div>
                <div style={{ position: 'absolute', left: 12, bottom: 10 }}>
                  <span style={{ background: 'rgba(0,0,0,.42)', color: '#fff', fontSize: 11, padding: '5px 10px', borderRadius: 8, fontWeight: 600 }}>
                    Azul · {teamA.formation?.tactical || '3-3-1'} ▾
                  </span>
                </div>
                {!isLive && (
                  <div style={{ position: 'absolute', right: 12, bottom: 10 }}>
                    <span style={{ background: '#1f6b46', color: '#fff', fontSize: 11, padding: '5px 10px', borderRadius: 8, fontWeight: 700 }}>FIM</span>
                  </div>
                )}
              </div>

              {isLive ? (
                <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <GoalButton match={activeMatch} which="azul" onGoalScored={onGoalScored} size="lg" />
                    <GoalButton match={activeMatch} which="laranja" onGoalScored={onGoalScored} size="lg" />
                  </div>
                  <GoalsLog match={activeMatch} roster={game.players} canManage={canManage} onRemoveGoal={onRemoveGoal} />
                  <MatchActionsBar match={activeMatch} onFinishMatch={onFinishMatch} variant="desktop" />
                </div>
              ) : (
                <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <GoalsLog match={activeMatch} roster={game.players} canManage={false} onRemoveGoal={onRemoveGoal} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid #e6e1d4', borderRadius: 12, padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#4b463b' }}>
                    {outcome.draw
                      ? `🤝 Empate · ${outcome.scoreA}–${outcome.scoreB}`
                      : `🏆 ${outcome.winner?.name} venceu · ${outcome.scoreA}–${outcome.scoreB}`}
                  </div>
                </div>
              )}
          </div>

          <RosterPanel team={teamB} match={activeMatch} teamKey="laranja" canSwap={canManage && isLive} onSwapClick={p => onSwapClick(teamB, p)} variant="desktop" side="right" />

          <WaitingPanel game={game} match={activeMatch} canManage={canManage} onOpenWaitingList={() => onOpenWaitingList(activeMatch.id)} />
        </div>
      )}

      <FormatSheet
        isOpen={isPlayersPerTeamOpen}
        onClose={() => setIsPlayersPerTeamOpen(false)}
        playersPerTeam={playersPerTeam}
        onSelect={n => { setPlayersPerTeam(n); setIsPlayersPerTeamOpen(false); }}
      />
    </div>
  );
}
