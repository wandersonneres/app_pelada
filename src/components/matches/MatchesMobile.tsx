import { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { GoalButton } from './GoalButtons';
import { LiveScoreboard } from './LiveScoreboard';
import { MatchNavigator } from './MatchNavigator';
import { PitchLines } from './Pin';
import { GoalsLog } from './GoalsLog';
import { useFormationLines } from './useFormationLines';
import { MatchesLayoutProps } from './types';
import { getGoalTeamId } from '../../types';

export function MatchesMobile({
  game,
  matches,
  activeMatch,
  activeMatchId,
  onSelectMatch,
  canManage,
  playersPerTeam,
  setPlayersPerTeam,
  generateTeams,
  isGeneratingTeams,
  onGoalScored,
  onRemoveGoal,
  onFinishMatch,
  onDeleteMatch,
  onOpenWaitingList,
  onSwapClick,
}: MatchesLayoutProps) {
  const teamA = activeMatch.teams[0];
  const teamB = activeMatch.teams[1];
  const isLive = activeMatch.status === 'in_progress';
  const matchIndex = matches.findIndex(m => m.id === activeMatch.id);

  const [selectedTeam, setSelectedTeam] = useState<'azul' | 'laranja'>('azul');
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeTeam = selectedTeam === 'azul' ? teamA : teamB;
  const lines = useFormationLines(activeTeam, activeTeam.formation?.tactical || '3-3-1');

  const scoreA = activeMatch.goals?.filter(g => getGoalTeamId(g, activeMatch.teams) === teamA.id).length ?? teamA.score ?? 0;
  const scoreB = activeMatch.goals?.filter(g => getGoalTeamId(g, activeMatch.teams) === teamB.id).length ?? teamB.score ?? 0;

  return (
    <div style={{ padding: '14px 14px 20px', display: 'flex', flexDirection: 'column', gap: 13 }}>
      <MatchNavigator matches={matches} activeMatchId={activeMatchId} onSelect={onSelectMatch} compact />

      {(
        <>
          <LiveScoreboard variant="mobile" scoreA={scoreA} scoreB={scoreB} matchBadge={`P${matchIndex + 1}`} />

          <div style={{ display: 'flex', gap: 2, background: '#efe9dc', borderRadius: 11, padding: 3 }}>
            <button
              onClick={() => setSelectedTeam('azul')}
              style={{ flex: 1, position: 'relative', border: 'none', background: selectedTeam === 'azul' ? '#fff' : 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#1c3576', padding: 9, borderRadius: 8, boxShadow: selectedTeam === 'azul' ? '0 1px 3px rgba(0,0,0,.09)' : 'none' }}
            >
              ● Time Azul
            </button>
            <button
              onClick={() => setSelectedTeam('laranja')}
              style={{ flex: 1, position: 'relative', border: 'none', background: selectedTeam === 'laranja' ? '#fff' : 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#9e440a', padding: 9, borderRadius: 8, boxShadow: selectedTeam === 'laranja' ? '0 1px 3px rgba(0,0,0,.09)' : 'none' }}
            >
              ● Time Laranja
            </button>
          </div>

          <div
            style={{
              position: 'relative',
              borderRadius: 18,
              overflow: 'hidden',
              background: 'radial-gradient(120% 90% at 50% 0%, #478a5e, #296040)',
              height: 352,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              padding: '20px 10px',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 48px, rgba(0,0,0,.03) 48px 96px)' }} />
            <div style={{ position: 'absolute', left: '50%', top: -40, transform: 'translateX(-50%)', width: 120, height: 120, border: '2px solid rgba(255,255,255,.35)', borderRadius: 999 }} />
            <div style={{ position: 'absolute', left: '35%', right: '35%', bottom: 0, height: 44, border: '2px solid rgba(255,255,255,.35)', borderBottom: 'none', borderRadius: '10px 10px 0 0' }} />
            <PitchLines
              lines={lines}
              team={selectedTeam}
              axis="rows"
              reverse
              chipSize={46}
              chipFont={16}
              labelFont={10}
              onPlayerClick={canManage && isLive ? player => onSwapClick(activeTeam, player) : undefined}
            />
          </div>

          {isLive ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <GoalButton match={activeMatch} which="azul" onGoalScored={onGoalScored} size="lg" />
              <GoalButton match={activeMatch} which="laranja" onGoalScored={onGoalScored} size="lg" />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid #e6e1d4', borderRadius: 13, padding: '13px 14px', fontSize: 13, fontWeight: 700, color: '#4b463b' }}>
              {(() => { const w = activeMatch.teams.find(t => t.id === activeMatch.winner); return w ? `🏆 ${w.name} venceu esta partida` : 'Partida finalizada'; })()}
            </div>
          )}
          <GoalsLog match={activeMatch} roster={game.players} canManage={canManage && isLive} onRemoveGoal={onRemoveGoal} />
        </>
      )}

      {canManage && (
        <button
          onClick={() => setSheetOpen(true)}
          style={{ border: '1px solid #ded8c9', background: '#fff', borderRadius: 13, padding: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#4b463b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Plus className="w-4 h-4" style={{ color: '#6e1a28' }} />
          {isLive ? 'Encerrar e gerar próxima' : 'Gerar próxima partida'}
        </button>
      )}

      {canManage && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onOpenWaitingList(activeMatch.id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #ded8c9', background: '#fff', borderRadius: 10, padding: '9px 12px', fontFamily: 'Inter, sans-serif' }}
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
              style={{ flex: 'none', border: '1px solid #ded8c9', background: '#fff', borderRadius: 10, padding: '0 12px', display: 'flex', alignItems: 'center' }}
            >
              <Trash2 className="w-[15px] h-[15px] text-red-500" />
            </button>
          )}
        </div>
      )}

      {sheetOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setSheetOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,18,22,.42)' }} />
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '26px 26px 0 0', padding: '10px 16px 30px' }}
          >
            <div style={{ width: 40, height: 5, borderRadius: 99, background: '#e0dccf', margin: '6px auto 14px' }} />

            {isLive ? (
              <>
                <div className="hd" style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Encerrar Partida {matchIndex + 1}</div>
                <div style={{ fontSize: 12.5, color: '#8b8578', marginBottom: 14 }}>Quem continua em campo? O perdedor vai para a espera.</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => { onFinishMatch(activeMatch.id, teamA.id); setSheetOpen(false); }}
                    style={{ flex: 1, border: '1.5px solid #b9c5e4', background: '#eef1fa', color: '#1c3576', fontWeight: 700, fontSize: 14, padding: 15, borderRadius: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Time Azul
                  </button>
                  <button
                    onClick={() => { onFinishMatch(activeMatch.id, teamB.id); setSheetOpen(false); }}
                    style={{ flex: 1, border: '1.5px solid #ecceb0', background: '#f8efe4', color: '#9e440a', fontWeight: 700, fontSize: 14, padding: 15, borderRadius: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Time Laranja
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="hd" style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Gerar próxima partida</div>
                <div style={{ fontSize: 12.5, color: '#8b8578', marginBottom: 14 }}>
                  {teamA.name === activeMatch.teams.find(t => t.id === activeMatch.winner)?.name ? teamA.name : teamB.name} continua em campo.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', background: '#faf8f2', borderRadius: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#4b463b' }}>Formato da próxima</span>
                  <select
                    value={playersPerTeam}
                    onChange={e => setPlayersPerTeam(Number(e.target.value))}
                    style={{ border: '1px solid #e5e3dc', borderRadius: 8, padding: '5px 11px', fontSize: 12.5, fontWeight: 700, background: '#fff' }}
                  >
                    {[4, 5, 6, 7, 8, 9, 10].map(n => (
                      <option key={n} value={n}>{n}×{n}</option>
                    ))}
                  </select>
                </div>
                <button
                  disabled={isGeneratingTeams}
                  onClick={() => { generateTeams(); setSheetOpen(false); }}
                  style={{ width: '100%', border: 'none', background: '#6e1a28', color: '#fff', fontWeight: 700, fontSize: 14, padding: 15, borderRadius: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: isGeneratingTeams ? 0.6 : 1 }}
                >
                  Gerar próxima partida
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
