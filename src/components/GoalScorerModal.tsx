import { Team } from '../types';
import { useState, useEffect } from 'react';

interface GoalScorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onConfirm: (scorerId: string, assisterId?: string) => void;
}

const POSITION_LABEL: Record<string, string> = {
  defesa: 'DEF',
  meio: 'MEI',
  ataque: 'ATA',
};

export const GoalScorerModal = ({ isOpen, onClose, team, onConfirm }: GoalScorerModalProps) => {
  const [step, setStep] = useState<'scorer' | 'assister'>('scorer');
  const [scorerId, setScorerId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('scorer');
      setScorerId('');
    }
  }, [isOpen]);

  const handleSelectScorer = (id: string) => {
    setScorerId(id);
    setStep('assister');
  };

  const handleSelectAssister = (assisterId?: string) => {
    onConfirm(scorerId, assisterId);
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
            {step === 'scorer' ? (
              <>
                <div className="font-bold text-base text-gray-800">Registrar Gol</div>
                <div className="text-xs text-gray-500">{team.name} — Quem fez o gol?</div>
              </>
            ) : (
              <>
                <div className="font-bold text-base text-gray-800">Assistência</div>
                <div className="text-xs text-gray-500">Gol de {scorer?.name.split(' ')[0]}</div>
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
          {step === 'scorer' ? (
            [...team.players].sort((a, b) => {
              const pos = { defesa: 1, meio: 2, ataque: 3 };
              if (pos[a.position] !== pos[b.position]) return pos[a.position] - pos[b.position];
              return a.name.localeCompare(b.name, 'pt-BR');
            }).map(player => (
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
            ))
          ) : (
            <>
              <button
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition text-gray-600 font-medium text-base"
                onClick={() => handleSelectAssister(undefined)}
              >
                Sem assistência
              </button>
              {[...team.players].filter(p => p.id !== scorerId).sort((a, b) => {
                const pos = { defesa: 1, meio: 2, ataque: 3 };
                if (pos[a.position] !== pos[b.position]) return pos[a.position] - pos[b.position];
                return a.name.localeCompare(b.name, 'pt-BR');
              }).map(player => (
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
        </div>
      </div>
    </div>
  );
};
