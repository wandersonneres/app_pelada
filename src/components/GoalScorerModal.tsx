import { Team } from '../types';
import { useState, useEffect } from 'react';

interface GoalScorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  opponentTeam?: Team;
  onConfirm: (scorerId: string, assisterId?: string, ownGoal?: boolean) => void;
}

const POSITION_LABEL: Record<string, string> = {
  defesa: 'DEF',
  meio: 'MEI',
  ataque: 'ATA',
};

export const GoalScorerModal = ({ isOpen, onClose, team, opponentTeam, onConfirm }: GoalScorerModalProps) => {
  const [step, setStep] = useState<'scorer' | 'assister' | 'ownGoal'>('scorer');
  const [scorerId, setScorerId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('scorer');
      setScorerId('');
    }
  }, [isOpen]);

  const sortPlayers = (players: Team['players']) =>
    [...players].sort((a, b) => {
      const pos = { defesa: 1, meio: 2, ataque: 3 };
      if (pos[a.position] !== pos[b.position]) return pos[a.position] - pos[b.position];
      return a.name.localeCompare(b.name, 'pt-BR');
    });

  const handleSelectScorer = (id: string) => {
    setScorerId(id);
    setStep('assister');
  };

  const handleSelectAssister = (assisterId?: string) => {
    onConfirm(scorerId, assisterId, false);
    onClose();
  };

  const handleSelectOwnGoal = (ownScorerId: string) => {
    onConfirm(ownScorerId, undefined, true);
    onClose();
  };

  if (!isOpen) return null;

  const scorer = team.players.find(p => p.id === scorerId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
          <div>
            {step === 'scorer' && (
              <>
                <div className="font-bold text-base text-gray-800">Registrar Gol</div>
                <div className="text-xs text-gray-500">{team.name} — Quem fez o gol?</div>
              </>
            )}
            {step === 'assister' && (
              <>
                <div className="font-bold text-base text-gray-800">Assistência</div>
                <div className="text-xs text-gray-500">Gol de {scorer?.name.split(' ')[0]}</div>
              </>
            )}
            {step === 'ownGoal' && (
              <>
                <div className="font-bold text-base text-gray-800">Gol Contra</div>
                <div className="text-xs text-gray-500">Ponto p/ {team.name} — quem fez contra?</div>
              </>
            )}
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-xl font-bold"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Player list */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {step === 'scorer' && (
            <>
              {sortPlayers(team.players).map(player => (
                <button
                  key={player.id}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-blue-50 active:bg-blue-100 transition text-left"
                  onClick={() => handleSelectScorer(player.id)}
                >
                  <span className="font-medium text-gray-800 text-base">{player.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                    {POSITION_LABEL[player.position] ?? player.position}
                  </span>
                </button>
              ))}
              {opponentTeam && opponentTeam.players.length > 0 && (
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-1 rounded-xl border border-dashed border-red-300 bg-red-50 hover:bg-red-100 active:bg-red-200 transition text-red-600 font-semibold text-sm"
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
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition text-gray-600 font-medium text-base"
                onClick={() => handleSelectAssister(undefined)}
              >
                Sem assistência
              </button>
              {sortPlayers(team.players.filter(p => p.id !== scorerId)).map(player => (
                <button
                  key={player.id}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-green-50 active:bg-green-100 transition text-left"
                  onClick={() => handleSelectAssister(player.id)}
                >
                  <span className="font-medium text-gray-800 text-base">{player.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                    {POSITION_LABEL[player.position] ?? player.position}
                  </span>
                </button>
              ))}
            </>
          )}

          {step === 'ownGoal' && (
            <>
              <button
                className="w-full text-left px-1 pb-1 text-xs text-blue-600 hover:underline"
                onClick={() => setStep('scorer')}
              >
                ← Voltar
              </button>
              {sortPlayers(opponentTeam?.players ?? []).map(player => (
                <button
                  key={player.id}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-red-50 active:bg-red-100 transition text-left"
                  onClick={() => handleSelectOwnGoal(player.id)}
                >
                  <span className="font-medium text-gray-800 text-base">{player.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                    {POSITION_LABEL[player.position] ?? player.position}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
