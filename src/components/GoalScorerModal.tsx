import { Team } from '../types';
import { useState } from 'react';

interface GoalScorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onConfirm: (scorerId: string, assisterId?: string) => void;
}

export const GoalScorerModal = ({ isOpen, onClose, team, onConfirm }: GoalScorerModalProps) => {
  const [scorerId, setScorerId] = useState('');
  const [assisterId, setAssisterId] = useState('');

  const handleConfirm = () => {
    if (scorerId) {
      onConfirm(scorerId, assisterId || undefined);
      setScorerId('');
      setAssisterId('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs relative animate-fadeIn">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <div className="mb-4">
          <div className="font-bold text-lg text-gray-800 mb-1">Registrar Gol</div>
          <div className="text-sm text-gray-500">{team.name}</div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goleador</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={scorerId}
              onChange={e => setScorerId(e.target.value)}
            >
              <option value="">Selecione o goleador</option>
              {team.players.map((player) => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assistência (opcional)</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={assisterId}
              onChange={e => setAssisterId(e.target.value)}
            >
              <option value="">Sem assistência</option>
              {team.players.filter((player) => player.id !== scorerId).map((player) => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
          </div>
          <button
            className={`w-full py-2 rounded font-semibold text-white transition ${scorerId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
            onClick={handleConfirm}
            disabled={!scorerId}
          >
            Confirmar Gol
          </button>
        </div>
      </div>
    </div>
  );
}; 