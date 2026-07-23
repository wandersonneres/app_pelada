import { Team } from '../types';
import { useState, useEffect } from 'react';

interface GoalScorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  opponentTeam?: Team;
  onConfirm: (scorerId: string, assisterId?: string, ownGoal?: boolean) => void;
}

const POS_LABEL: Record<string, string> = { defesa: 'DEF', meio: 'MEI', ataque: 'ATA' };
const POS_HEX: Record<string, string> = { defesa: '#d99a1a', meio: '#0d7a72', ataque: '#c2560f' };

function PosBadge({ position }: { position: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.04em] px-[7px] py-[3px] rounded-md flex-none"
      style={{ color: '#5c5647', background: '#ece5d6' }}
    >
      <span className="w-[5px] h-[5px] rounded-full" style={{ background: POS_HEX[position] }} />
      {POS_LABEL[position] ?? position}
    </span>
  );
}

export const GoalScorerModal = ({ isOpen, onClose, team, opponentTeam, onConfirm }: GoalScorerModalProps) => {
  const [step, setStep] = useState<'scorer' | 'assister' | 'ownGoal'>('scorer');
  const [scorerId, setScorerId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('scorer');
      setScorerId('');
    }
  }, [isOpen]);

  const isAzul = team.id === 'teamA';
  const accent = isAzul ? '#24499c' : '#c2560f';

  const sortPlayers = (players: Team['players']) =>
    [...players].sort((a, b) => {
      const pos = { defesa: 1, meio: 2, ataque: 3 } as Record<string, number>;
      if (pos[a.position] !== pos[b.position]) return pos[a.position] - pos[b.position];
      return a.name.localeCompare(b.name, 'pt-BR');
    });

  const handleSelectScorer = (id: string) => { setScorerId(id); setStep('assister'); };
  const handleSelectAssister = (assisterId?: string) => { onConfirm(scorerId, assisterId, false); onClose(); };
  const handleSelectOwnGoal = (ownScorerId: string) => { onConfirm(ownScorerId, undefined, true); onClose(); };

  if (!isOpen) return null;
  const scorer = team.players.find(p => p.id === scorerId);

  const PlayerRow = ({ p, onClick, hover }: { p: Team['players'][number]; onClick: () => void; hover: string }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#eee7d8] bg-surface transition-colors text-left ${hover}`}
    >
      <span
        className="chip w-8 h-8 flex-none rounded-full text-white font-stat font-bold text-[12px] flex items-center justify-center"
        style={{ background: accent }}
      >
        {p.arrivalOrder}
      </span>
      <span className="flex-1 font-semibold text-[14px] text-ink truncate">{p.name}</span>
      <PosBadge position={p.position} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:p-4" onClick={onClose}>
      <div
        className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm max-h-[80vh] flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-line">
          <div>
            {step === 'scorer' && (
              <>
                <div className="font-heading font-bold text-[16px] text-ink">Registrar gol</div>
                <div className="text-[12px] text-ink-soft">{team.name} — quem fez o gol?</div>
              </>
            )}
            {step === 'assister' && (
              <>
                <div className="font-heading font-bold text-[16px] text-ink">Assistência</div>
                <div className="text-[12px] text-ink-soft">Gol de {scorer?.name.split(' ')[0]}</div>
              </>
            )}
            {step === 'ownGoal' && (
              <>
                <div className="font-heading font-bold text-[16px] text-ink">Gol contra</div>
                <div className="text-[12px] text-ink-soft">Ponto p/ {team.name} — quem fez contra?</div>
              </>
            )}
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-icon hover:text-ink hover:bg-paper text-xl"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {step === 'scorer' && (
            <>
              {sortPlayers(team.players).map(p => (
                <PlayerRow key={p.id} p={p} onClick={() => handleSelectScorer(p.id)} hover="hover:bg-paper" />
              ))}
              {opponentTeam && opponentTeam.players.length > 0 && (
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-1 rounded-xl border border-dashed border-state-live/40 bg-red-50 hover:bg-red-100 transition text-state-live font-semibold text-[13px]"
                  onClick={() => setStep('ownGoal')}
                >
                  ⚽ Gol contra (jogador do {opponentTeam.name})
                </button>
              )}
            </>
          )}

          {step === 'assister' && (
            <>
              <button
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-line-soft hover:bg-line transition text-ink-medium font-semibold text-[14px]"
                onClick={() => handleSelectAssister(undefined)}
              >
                Sem assistência
              </button>
              {sortPlayers(team.players.filter(p => p.id !== scorerId)).map(p => (
                <PlayerRow key={p.id} p={p} onClick={() => handleSelectAssister(p.id)} hover="hover:bg-state-success/5" />
              ))}
            </>
          )}

          {step === 'ownGoal' && (
            <>
              <button className="w-full text-left px-1 pb-1 text-[12px] text-wine font-semibold hover:underline" onClick={() => setStep('scorer')}>
                ← Voltar
              </button>
              {sortPlayers(opponentTeam?.players ?? []).map(p => (
                <PlayerRow key={p.id} p={p} onClick={() => handleSelectOwnGoal(p.id)} hover="hover:bg-red-50" />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
