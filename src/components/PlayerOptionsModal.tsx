import { Trash2 } from 'lucide-react';
import { Player } from '../types';
import { StarRating } from './StarRating';
import { Modal } from './ui/Modal';

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

const POS_ACTIVE: Record<string, string> = {
  defesa: 'text-white',
  meio: 'text-white',
  ataque: 'text-white',
};
const POS_BG: Record<string, string> = { defesa: '#d99a1a', meio: '#0d7a72', ataque: '#c2560f' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-2">{title}</div>
      {children}
    </div>
  );
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
  isDiaristaPaid,
}: PlayerOptionsModalProps) {
  if (!player) return null;

  const pill = 'py-2 rounded-lg font-semibold text-[13px] transition-colors';
  const inactive = 'bg-line-soft text-ink-medium hover:bg-line';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-line flex-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="chip w-9 h-9 flex-none rounded-full bg-ink text-white font-stat font-bold text-sm flex items-center justify-center">
              {player.arrivalOrder}
            </span>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-[15px] text-ink truncate">{player.name}</h2>
              <div className="text-[11px] text-ink-soft">Opções do jogador</div>
            </div>
          </div>
          <button className="w-8 h-8 flex-none flex items-center justify-center rounded-lg text-ink-icon hover:text-ink hover:bg-paper text-xl" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
      }
      bodyClassName="space-y-5"
      footer={
        <div className="flex gap-2">
          {player.paymentType === 'diarista' && (
            <button
              onClick={onDiaristaPayment}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-[13px] transition ${
                isDiaristaPaid ? 'bg-state-success/10 text-state-success' : 'bg-wine text-white hover:bg-wine-dark'
              }`}
            >
              {isDiaristaPaid ? 'Pago ✓ (desfazer)' : 'Confirmar pagamento'}
            </button>
          )}
          <button
            onClick={onRemovePlayer}
            className={`${player.paymentType !== 'diarista' ? 'flex-1' : ''} flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-red-500 text-red-600 font-semibold text-[13px] hover:bg-red-50 transition`}
          >
            <Trash2 className="w-4 h-4" /> Remover
          </button>
        </div>
      }
    >
          <Section title="Posição">
            <div className="grid grid-cols-3 gap-2">
              {(['defesa', 'meio', 'ataque'] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => onUpdatePosition(pos)}
                  className={`${pill} ${player.position === pos ? POS_ACTIVE[pos] : inactive}`}
                  style={player.position === pos ? { background: POS_BG[pos] } : undefined}
                >
                  {pos === 'defesa' ? 'Defesa' : pos === 'meio' ? 'Meio' : 'Ataque'}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Nível de habilidade">
            <StarRating value={player.skillLevel} onChange={level => onUpdateSkillLevel(level as 1 | 2 | 3 | 4 | 5)} size="md" showLabel />
          </Section>

          <Section title="Faixa etária">
            <div className="grid grid-cols-3 gap-2">
              {(['15-20', '21-30', '31-40', '41-50', '+50'] as const).map(age => (
                <button
                  key={age}
                  onClick={() => onUpdateAgeGroup(age)}
                  className={`${pill} ${player.ageGroup === age ? 'bg-wine text-white' : inactive}`}
                >
                  {age}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Ordem de chegada">
            <div className="max-h-32 overflow-y-auto pr-1">
              <div className="grid grid-cols-6 gap-2">
                {[...Array(totalPlayers).keys()].map(i => {
                  const order = i + 1;
                  return (
                    <button
                      key={order}
                      onClick={() => onUpdateArrivalOrder(order)}
                      className={`py-2 rounded-lg font-stat font-bold text-[13px] transition-colors ${player.arrivalOrder === order ? 'bg-wine text-white' : inactive}`}
                    >
                      {order}
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section title="Tipo de pagamento">
            <div className="grid grid-cols-2 gap-2">
              {(['mensalista', 'diarista'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => onUpdatePaymentType(type)}
                  className={`${pill} ${player.paymentType === type ? 'bg-wine text-white' : inactive}`}
                >
                  {type === 'mensalista' ? 'Mensalista' : 'Diarista'}
                </button>
              ))}
            </div>
          </Section>
    </Modal>
  );
}
