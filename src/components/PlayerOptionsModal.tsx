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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in">
        {/* Header */}
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4">Opções do Jogador</h2>

        {/* Alterar Posição */}
        <div className="mb-4">
          <div className="font-medium mb-2">Alterar Posição</div>
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

        <hr className="my-4" />

        {/* Nível de Habilidade */}
        <div className="mb-4">
          <div className="font-medium mb-2">Nível de Habilidade</div>
              <StarRating
                value={player.skillLevel}
            onChange={(level) => onUpdateSkillLevel(level as 1 | 2 | 3 | 4 | 5)}
                size="md"
                showLabel={true}
              />
        </div>

        <hr className="my-4" />

        {/* Faixa Etária */}
        <div className="mb-4">
          <div className="font-medium mb-2">Faixa Etária</div>
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

        <hr className="my-4" />

        {/* Ordem de Chegada */}
        <div className="mb-4">
          <div className="font-medium mb-2">Ordem de Chegada</div>
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

        <hr className="my-4" />

        {/* Tipo de Pagamento */}
        <div className="mb-4">
          <div className="font-medium mb-2">Tipo de Pagamento</div>
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

        <hr className="my-4" />

        {/* Pagamento do Diarista */}
        {player.paymentType === 'diarista' && (
          <div className="mb-4">
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

        <hr className="my-4" />

        {/* Remover Jogador */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500 text-red-600 font-semibold hover:bg-red-50 transition"
          onClick={onRemovePlayer}
        >
          <FaUserMinus />
          Remover Jogador
        </button>
      </div>
    </div>
  );
} 