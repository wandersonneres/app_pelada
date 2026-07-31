import { Clock } from 'lucide-react';
import { Player, convertTimestampToDate } from '../../types';
import { POSITION_LABEL, POSITION_HEX } from './gameStats';

interface PlayerCardProps {
  player: Player;
  canManage: boolean;
  isDiaristaPaid: boolean;
  onDiaristaPayment: () => void;
  onOpenOptions: () => void;
}

function formatArrivalTime(date: Player['arrivalTime']) {
  if (!date) return '--:--';
  try {
    const d = convertTimestampToDate(date);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

function Stars({ level }: { level: number }) {
  return (
    <span className="tracking-[0.5px] leading-none" style={{ color: '#d99a1a' }}>
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} style={{ color: i < level ? '#d99a1a' : '#ded8c9' }}>★</span>
      ))}
    </span>
  );
}

function PaymentBadge({ paid, mensal }: { paid: boolean; mensal: boolean }) {
  if (mensal) {
    return <span className="text-[10px] font-bold text-wine bg-wine-tint px-2 py-[3px] rounded-md whitespace-nowrap">Mensal</span>;
  }
  if (paid) {
    return <span className="text-[10px] font-bold text-wine bg-wine-tint px-2 py-[3px] rounded-md whitespace-nowrap">Diária ✓</span>;
  }
  return <span className="text-[10px] font-bold px-2 py-[3px] rounded-md whitespace-nowrap" style={{ color: '#9a6a10', background: '#f6ecca' }}>Diária • pagar</span>;
}

export function PlayerCard({ player, canManage, isDiaristaPaid, onDiaristaPayment, onOpenOptions }: PlayerCardProps) {
  const isMensal = player.paymentType === 'mensalista';

  return (
    <div className="plr bg-surface border border-[#eee7d8] rounded-xl px-3 py-[11px] flex items-center gap-[11px]">
      <span className="chip w-[34px] h-[34px] flex-none rounded-full bg-ink text-white font-stat font-bold text-[13px] flex items-center justify-center">
        {player.arrivalOrder}
      </span>

      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold text-ink truncate">{player.name}</div>
        <div className="flex items-center gap-[9px] mt-0.5 text-[11px] text-ink-soft">
          <Stars level={player.skillLevel} />
          <span className="flex items-center gap-[3px]">
            <Clock className="w-2.5 h-2.5" strokeWidth={2.4} />
            {formatArrivalTime(player.arrivalTime)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-[5px] flex-none">
        <span
          className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.04em] px-[7px] py-[3px] rounded-md"
          style={{ color: '#5c5647', background: '#ece5d6' }}
        >
          <span className="w-[5px] h-[5px] rounded-full" style={{ background: POSITION_HEX[player.position] }} />
          {POSITION_LABEL[player.position]}
        </span>

        {isMensal ? (
          <PaymentBadge paid={false} mensal />
        ) : canManage ? (
          <button onClick={onDiaristaPayment} title={isDiaristaPaid ? 'Desfazer pagamento' : 'Registrar pagamento'}>
            <PaymentBadge paid={isDiaristaPaid} mensal={false} />
          </button>
        ) : (
          <PaymentBadge paid={isDiaristaPaid} mensal={false} />
        )}
      </div>

      {canManage && (
        <button
          className="flex-none self-start text-ink-icon hover:text-ink text-lg leading-none px-1"
          onClick={onOpenOptions}
          title="Editar/Remover"
        >
          ⋮
        </button>
      )}
    </div>
  );
}
