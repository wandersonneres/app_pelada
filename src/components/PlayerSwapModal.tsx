// Removendo a importação do Chakra UI
// import { useToast } from '@chakra-ui/react';

// Substituindo por classes do Tailwind CSS
// Exemplo: <div className="bg-blue-500 text-white p-4 rounded">...</div>

import { Player } from '../types';
import { User, ArrowLeftRight } from 'lucide-react';

interface PlayerSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player | null;
  otherTeamPlayers: Player[];
  waitingPlayers: Player[];
  onSwapPlayers: (otherPlayer: Player) => void;
  onReplacePlayer: (waitingPlayer: Player) => void;
}

export function PlayerSwapModal({
  isOpen,
  onClose,
  currentPlayer,
  otherTeamPlayers,
  waitingPlayers,
  onSwapPlayers,
  onReplacePlayer,
}: PlayerSwapModalProps) {
  if (!isOpen || !currentPlayer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] mx-4 relative animate-fade-in flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg text-gray-800">Trocar Jogador</h2>
          <button
            className="text-gray-400 hover:text-gray-700 text-xl font-bold"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Trocar com jogador do outro time */}
          <div>
            <div className="font-medium mb-3 text-gray-700">Trocar com jogador do outro time</div>
            <div className="space-y-2">
              {otherTeamPlayers.length === 0 ? (
                <div className="text-gray-400 text-sm py-2">Nenhum jogador disponível no outro time.</div>
              ) : (
                otherTeamPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onSwapPlayers(player)}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-blue-50 transition-colors text-left border border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm mr-3">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{player.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          player.position === 'defesa' ? 'bg-yellow-100 text-yellow-800' :
                          player.position === 'meio' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                        </span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < player.skillLevel ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ArrowLeftRight className="w-4 h-4 text-blue-500 ml-2" />
                  </button>
                ))
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Substituir por jogador da lista de espera */}
          <div>
            <div className="font-medium mb-3 text-gray-700">Substituir por jogador da lista de espera</div>
            <div className="space-y-2">
              {waitingPlayers.length === 0 ? (
                <div className="text-gray-400 text-sm py-2">Nenhum jogador na lista de espera.</div>
              ) : (
                waitingPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onReplacePlayer(player)}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 transition-colors text-left border border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 text-sm mr-3">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{player.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          player.position === 'defesa' ? 'bg-yellow-100 text-yellow-800' :
                          player.position === 'meio' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                        </span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < player.skillLevel ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ArrowLeftRight className="w-4 h-4 text-green-500 ml-2" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 