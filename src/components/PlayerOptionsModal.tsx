import { FaUserMinus } from 'react-icons/fa';
import { Player } from '../types';
import { StarRating } from './StarRating';
import { Portal } from './ui/Portal';

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
    <Portal>
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 md:items-center">
      <div className="bg-[var(--surface-solid)] shadow-xl w-full h-full max-w-none max-h-none mx-0 rounded-none relative animate-fade-in flex flex-col md:rounded-2xl md:w-full md:max-w-md md:max-h-[90vh] md:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b">
          <h2 className="ml-2 font-medium text-sm text-heading">Opções do Jogador</h2>
          <button
            className="text-ink-dim hover:text-ink-soft text-xl font-bold"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Alterar Posição */}
          <div>
            <div className="font-medium mb-2 text-ink-soft">Alterar Posição</div>
            <div className="grid grid-cols-3 gap-2">
              {(['defesa', 'meio', 'ataque'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => onUpdatePosition(pos)}
                  className={`py-1 rounded-lg font-medium transition-colors
                    ${player.position === pos
                      ? pos === 'defesa'
                        ? 'bg-warning text-white'
                        : pos === 'meio'
                        ? 'bg-team-blue text-white'
                        : 'bg-danger text-white'
                      : 'bg-surface-hover text-ink-soft hover:bg-surface-hover'}
                  `}
                >
                  {pos === 'defesa' ? 'Defesa' : pos === 'meio' ? 'Meio' : 'Ataque'}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-divider" />

          {/* Nível de Habilidade */}
          <div>
            <div className="font-medium mb-1 text-ink-soft">Nível de Habilidade</div>
            <StarRating
              value={player.skillLevel}
              onChange={(level) => onUpdateSkillLevel(level as 1 | 2 | 3 | 4 | 5)}
              size="md"
              showLabel={true}
            />
          </div>

          <hr className="border-divider" />

          {/* Faixa Etária */}
          <div>
            <div className="font-medium mb-1 text-ink-soft">Faixa Etária</div>
            <div className="grid grid-cols-3 gap-2">
              {(['15-20', '21-30', '31-40', '41-50', '+50'] as const).map((age) => (
                <button
                  key={age}
                  onClick={() => onUpdateAgeGroup(age)}
                  className={`py-1 rounded-lg font-medium transition-colors
                    ${player.ageGroup === age
                      ? 'bg-team-blue text-white'
                      : 'bg-surface-hover text-ink-soft hover:bg-surface-hover'}
                  `}
                >
                  {age} anos
                </button>
              ))}
            </div>
          </div>

          <hr className="border-divider" />

          {/* Ordem de Chegada */}
          <div>
            <div className="font-medium mb-3 text-ink-soft">Ordem de Chegada</div>
            <div className="max-h-32 overflow-y-auto pr-1">
              <div className="grid grid-cols-5 gap-2">
                {[...Array(totalPlayers).keys()].map((i) => {
                  const order = i + 1;
                  return (
                    <button
                      key={order}
                      onClick={() => onUpdateArrivalOrder(order)}
                      className={`py-2 rounded-lg font-medium transition-colors
                        ${player.arrivalOrder === order
                          ? 'bg-team-blue text-white'
                          : 'bg-surface-hover text-ink-soft hover:bg-surface-hover'}
                      `}
                    >
                      {order}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <hr className="border-divider" />

          {/* Tipo de Pagamento */}
          <div>
            <div className="font-medium mb-2 text-ink-soft">Tipo de Pagamento</div>
            <div className="grid grid-cols-2 gap-2">
              {(['mensalista', 'diarista'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onUpdatePaymentType(type)}
                  className={`py-1 rounded-lg font-medium transition-colors
                    ${player.paymentType === type
                      ? type === 'mensalista'
                        ? 'bg-success text-white'
                        : 'bg-team-orange text-white'
                      : 'bg-surface-hover text-ink-soft hover:bg-surface-hover'}
                  `}
                >
                  {type === 'mensalista' ? 'Mensalista' : 'Diarista'}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-divider" />

          {/* Ações finais: Pagamento do Diarista + Remover Jogador
              - Se tiver dois botões: cada um ocupa uma coluna
              - Se tiver só o de remover: ele ocupa as duas colunas (100% da largura) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Pagamento do Diarista */}
            {player.paymentType === 'diarista' && (
              <button
                className="w-full flex items-center justify-center gap-2 py-1 rounded-lg border text-white font-semibold transition"
                onClick={onDiaristaPayment}
                style={{
                  backgroundColor: isDiaristaPaid ? '#22c55e' : '#3b82f6',
                  borderColor: isDiaristaPaid ? '#22c55e' : '#3b82f6'
                }}
              >
                {isDiaristaPaid ? 'Pago ✓' : 'Confirmar Pagamento'}
              </button>
            )}

            {/* Remover Jogador */}
            <button
              className={`w-full flex items-center justify-center gap-2 py-1 rounded-lg border border-red-500 text-danger-soft font-medium hover:bg-danger/10 transition ${
                player.paymentType !== 'diarista' ? 'col-span-2' : ''
              }`}
              onClick={onRemovePlayer}
            >
              <FaUserMinus />
              Remover Jogador
            </button>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}