import { Trash2, Users } from 'lucide-react';
import { FormatSheet } from './FormatSheet';
import { GoalButton } from './GoalButtons';
import { LiveScoreboard } from './LiveScoreboard';
import { MatchActionsBar } from './MatchActionsBar';
import { MatchNavigator } from './MatchNavigator';
import { PitchLines } from './Pin';
import { RosterPanel } from './RosterPanel';
import { GoalsLog } from './GoalsLog';
import { useFormationLines } from './useFormationLines';
import { MatchesLayoutProps } from './types';
import { getGoalTeamId } from '../../types';

export function MatchesTablet({
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
  const matchIndex = matches.findIndex(m => m.id === activeMatch.id);
  const canGenerate = !isGeneratingTeams
    && game.players.length >= playersPerTeam * 2
    && (matches.length === 0 || (lastMatch?.status === 'finished' && !!lastMatch?.winner));

  const linesA = useFormationLines(teamA, teamA.formation?.tactical || '3-3-1');
  const linesB = useFormationLines(teamB, teamB.formation?.tactical || '3-3-1');

  const scoreA = activeMatch.goals?.filter(g => getGoalTeamId(g, activeMatch.teams) === teamA.id).length ?? teamA.score ?? 0;
  const scoreB = activeMatch.goals?.filter(g => getGoalTeamId(g, activeMatch.teams) === teamB.id).length ?? teamB.score ?? 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: '#fff', borderBottom: '1px solid #e6e1d4' }}>
        <span style={{ fontWeight: 700, fontSize: 14, flex: 'none' }}>Partidas</span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <MatchNavigator matches={matches} activeMatchId={activeMatchId} onSelect={onSelectMatch} />
        </div>
        {canManage && (
          <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#8b8578', fontWeight: 600 }}>Formato</span>
            <button
              onClick={() => setIsPlayersPerTeamOpen(true)}
              style={{ border: '1px solid #ded8c9', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 700, background: '#fff', cursor: 'pointer' }}
            >
              {playersPerTeam}×{playersPerTeam} ▾
            </button>
            <button
              className={canGenerate ? 'gbtn' : ''}
              onClick={generateTeams}
              disabled={!canGenerate}
              title={!canGenerate && lastMatch && lastMatch.status !== 'finished' ? 'Encerre a partida atual (defina quem venceu) para gerar a próxima' : undefined}
              style={{ border: 'none', background: '#6e1a28', color: '#fff', fontWeight: 600, fontSize: 12, padding: '9px 14px', borderRadius: 10, cursor: canGenerate ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', opacity: canGenerate ? 1 : 0.45 }}
            >
              + Gerar próxima
            </button>
          </div>
        )}
      </div>

      {(
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <RosterPanel team={teamA} match={activeMatch} teamKey="azul" canSwap={canManage && isLive} onSwapClick={p => onSwapClick(teamA, p)} variant="tablet" side="left" />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: 14 }}>
            <LiveScoreboard variant="tablet" scoreA={scoreA} scoreB={scoreB} matchBadge={`P${matchIndex + 1}`} />

            <div style={{ flex: 1, position: 'relative', marginTop: 12, borderRadius: 16, overflow: 'hidden', background: 'radial-gradient(130% 100% at 50% -10%, #478a5e, #296040)', minHeight: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 58px, rgba(0,0,0,.03) 58px 116px)' }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: 'rgba(255,255,255,.45)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 118, height: 118, border: '2px solid rgba(255,255,255,.45)', borderRadius: 999 }} />
              <div style={{ position: 'absolute', left: 0, top: '28%', bottom: '28%', width: 44, border: '2px solid rgba(255,255,255,.4)', borderLeft: 'none', borderRadius: '0 8px 8px 0' }} />
              <div style={{ position: 'absolute', right: 0, top: '28%', bottom: '28%', width: 44, border: '2px solid rgba(255,255,255,.4)', borderRight: 'none', borderRadius: '8px 0 0 8px' }} />
              <div style={{ position: 'relative', height: '100%', display: 'flex' }}>
                <div style={{ flex: 1, display: 'flex', padding: '18px 6px', gap: 2 }}>
                  <PitchLines lines={linesA} team="azul" axis="columns" chipSize={38} chipFont={13} labelFont={10} onPlayerClick={canManage && isLive ? p => onSwapClick(teamA, p) : undefined} />
                </div>
                <div style={{ flex: 1, display: 'flex', padding: '18px 6px', gap: 2 }}>
                  <PitchLines lines={linesB} team="laranja" axis="columns" reverse chipSize={38} chipFont={13} labelFont={10} onPlayerClick={canManage && isLive ? p => onSwapClick(teamB, p) : undefined} />
                </div>
              </div>
              <div style={{ position: 'absolute', left: 12, bottom: 10 }}>
                <span style={{ background: 'rgba(0,0,0,.42)', color: '#fff', fontSize: 11, padding: '5px 11px', borderRadius: 8, fontWeight: 600 }}>
                  Formação {teamA.formation?.tactical || '3-3-1'} ▾
                </span>
              </div>
            </div>

            {isLive ? (
              <div style={{ flex: 'none', display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
                <GoalButton match={activeMatch} which="azul" onGoalScored={onGoalScored} size="md" />
                <MatchActionsBar match={activeMatch} onFinishMatch={onFinishMatch} variant="tablet" />
                <GoalButton match={activeMatch} which="laranja" onGoalScored={onGoalScored} size="md" />
              </div>
            ) : (
              <div style={{ flex: 'none', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid #e6e1d4', borderRadius: 12, padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#4b463b' }}>
                {(() => { const w = activeMatch.teams.find(t => t.id === activeMatch.winner); return w ? `🏆 ${w.name} venceu esta partida` : 'Partida finalizada'; })()}
              </div>
            )}
            <div style={{ flex: 'none', marginTop: 10 }}>
              <GoalsLog match={activeMatch} roster={game.players} canManage={canManage && isLive} onRemoveGoal={onRemoveGoal} />
            </div>
          </div>

          <div style={{ width: 236, flex: 'none', background: '#fff', borderLeft: '1px solid #e6e1d4', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <RosterPanel team={teamB} match={activeMatch} teamKey="laranja" canSwap={canManage && isLive} onSwapClick={p => onSwapClick(teamB, p)} variant="tablet" side="right" />
            {canManage && (
              <div style={{ padding: 10, borderTop: '1px solid #efe9dc', display: 'flex', gap: 8 }}>
                <button
                  onClick={() => onOpenWaitingList(activeMatch.id)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #ded8c9', background: '#fff', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#423d33', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Users className="w-[15px] h-[15px]" style={{ color: '#8b8578' }} />
                    Lista de espera
                  </span>
                  <span style={{ background: '#f3e5e8', color: '#6e1a28', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                    {game.waitingList?.length ?? 0}
                  </span>
                </button>
                {game.status !== 'finished' && (
                  <button
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.')) {
                        onDeleteMatch(activeMatch.id);
                      }
                    }}
                    title="Excluir partida"
                    style={{ flex: 'none', border: '1px solid #ded8c9', background: '#fff', borderRadius: 10, padding: '0 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 className="w-[15px] h-[15px] text-red-500" />
                  </button>
                )}
              </div>
            )}
          </div>
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
