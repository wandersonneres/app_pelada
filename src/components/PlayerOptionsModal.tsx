import { FaUserMinus } from 'react-icons/fa';
import { Player } from '../types';
import { StarRating } from './StarRating';

interface PlayerOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  totalPlayers: number;
  onUpdatePosition: (position: 'defesa' | 'meio' | 'ataque') => void;
  onUpdateArrivalOrder: (order: number) => void;
  onUpdateSkillLevel: (skillLevel: 1 | 2 | 3 | 4 | 5) => void;
  onUpdateAgeGroup: (ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50') => void;
  onUpdatePaymentType: (paymentType: 'mensalista' | 'diarista') => void;
  onRemovePlayer: () => void;
  onDiaristaPayment: () => void;
  isDiaristaPaid: boolean;
}

export function PlayerOptionsModal({
  isOpen,
  onClose,
  player,
  totalPlayers,
  onUpdatePosition,
  onUpdateArrivalOrder,
  onUpdateSkillLevel,
  onUpdateAgeGroup,
  onUpdatePaymentType,
  onRemovePlayer,
  onDiaristaPayment,
  isDiaristaPaid
}: PlayerOptionsModalProps) {
  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] mx-4 relative animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg text-gray-800">Opções do Jogador</h2>
          <button
            className="text-gray-400 hover:text-gray-700 text-xl font-bold"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Alterar Posição */}
          <div>
            <div className="font-medium mb-3 text-gray-700">Alterar Posição</div>
            <div className="grid grid-cols-3 gap-2">
              {(['defesa', 'meio', 'ataque'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => onUpdatePosition(pos)}
                  className={`py-2 rounded-lg font-semibold transition-colors
                    ${player.position === pos
                      ? pos === 'defesa'
                        ? 'bg-yellow-400 text-white'
                        : pos === 'meio'
                        ? 'bg-blue-600 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {pos === 'defesa' ? 'Defesa' : pos === 'meio' ? 'Meio' : 'Ataque'}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Nível de Habilidade */}
          <div>
            <div className="font-medium mb-3 text-gray-700">Nível de Habilidade</div>
            <StarRating
              value={player.skillLevel}
              onChange={(level) => onUpdateSkillLevel(level as 1 | 2 | 3 | 4 | 5)}
              size="md"
              showLabel={true}
            />
          </div>

          <hr className="border-gray-200" />

          {/* Faixa Etária */}
          <div>
            <div className="font-medium mb-3 text-gray-700">Faixa Etária</div>
            <div className="grid grid-cols-2 gap-2">
              {(['15-20', '21-30', '31-40', '41-50', '+50'] as const).map((age) => (
                <button
                  key={age}
                  onClick={() => onUpdateAgeGroup(age)}
                  className={`py-2 rounded-lg font-semibold transition-colors
                    ${player.ageGroup === age
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {age} anos
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Ordem de Chegada */}
          <div>
            <div className="font-medium mb-3 text-gray-700">Ordem de Chegada</div>
            <div className="max-h-32 overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-2">
                {[...Array(totalPlayers).keys()].map((i) => {
                  const order = i + 1;
                  return (
                    <button
                      key={order}
                      onClick={() => onUpdateArrivalOrder(order)}
                      className={`py-2 rounded-lg font-semibold transition-colors
                        ${player.arrivalOrder === order
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      {order}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Tipo de Pagamento */}
          <div>
            <div className="font-medium mb-3 text-gray-700">Tipo de Pagamento</div>
            <div className="grid grid-cols-2 gap-2">
              {(['mensalista', 'diarista'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onUpdatePaymentType(type)}
                  className={`py-2 rounded-lg font-semibold transition-colors
                    ${player.paymentType === type
                      ? type === 'mensalista'
                        ? 'bg-green-500 text-white'
                        : 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {type === 'mensalista' ? 'Mensalista' : 'Diarista'}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Pagamento do Diarista */}
          {player.paymentType === 'diarista' && (
            <div>
              <button
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-white font-semibold transition"
                onClick={onDiaristaPayment}
                style={{
                  backgroundColor: isDiaristaPaid ? '#22c55e' : '#3b82f6',
                  borderColor: isDiaristaPaid ? '#22c55e' : '#3b82f6'
                }}
              >
                {isDiaristaPaid ? 'Pago ✓' : 'Confirmar Pagamento'}
              </button>
            </div>
          )}

          <hr className="border-gray-200" />

          {/* Remover Jogador */}
          <div>
            <button
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500 text-red-600 font-semibold hover:bg-red-50 transition"
              onClick={onRemovePlayer}
            >
              <FaUserMinus />
              Remover Jogador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 