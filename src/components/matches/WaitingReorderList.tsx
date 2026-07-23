import { useEffect, useRef, useState } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Player } from '../../types';

const POS_LABEL: Record<string, string> = { defesa: 'DEF', meio: 'MEI', ataque: 'ATA' };
const POS_HEX: Record<string, string> = { defesa: '#d99a1a', meio: '#0d7a72', ataque: '#c2560f' };

interface WaitingReorderListProps {
  players: Player[];
  canManage: boolean;
  onReorder: (orderedIds: string[]) => void;
  onRemove: (player: Player) => void;
}

// Lista de espera reordenável (arrastar no desktop; setas ↑/↓ em qualquer dispositivo).
export function WaitingReorderList({ players, canManage, onReorder, onRemove }: WaitingReorderListProps) {
  const [order, setOrder] = useState<Player[]>(players);
  const dragFrom = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => { setOrder(players); }, [players]);

  const commit = (arr: Player[]) => { setOrder(arr); onReorder(arr.map(p => p.id)); };

  const moveTo = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    const arr = [...order];
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    commit(arr);
  };

  const onDrop = (i: number) => {
    const from = dragFrom.current;
    dragFrom.current = null;
    setOverIndex(null);
    if (from === null || from === i) return;
    const arr = [...order];
    const [m] = arr.splice(from, 1);
    arr.splice(i, 0, m);
    commit(arr);
  };

  return (
    <div className="space-y-1.5">
      {order.map((player, i) => (
        <div
          key={player.id}
          draggable={canManage}
          onDragStart={() => { dragFrom.current = i; }}
          onDragOver={e => { e.preventDefault(); setOverIndex(i); }}
          onDrop={() => onDrop(i)}
          onDragEnd={() => { dragFrom.current = null; setOverIndex(null); }}
          className={`flex items-center gap-2 p-2.5 rounded-xl border bg-surface transition-colors ${overIndex === i ? 'border-wine' : 'border-[#eee7d8]'}`}
          style={{ cursor: canManage ? 'grab' : 'default' }}
        >
          {canManage && <GripVertical className="w-4 h-4 text-ink-icon flex-none" />}
          <span className="font-stat text-[12px] text-[#c8c1b0] w-4 text-center flex-none">{i + 1}</span>
          <span className="chip w-8 h-8 flex-none rounded-full bg-ink text-white font-stat font-bold text-[12px] flex items-center justify-center">{player.arrivalOrder}</span>
          <span className="flex-1 font-semibold text-[14px] text-ink truncate">{player.name}</span>
          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.04em] px-[7px] py-[3px] rounded-md flex-none" style={{ color: '#5c5647', background: '#ece5d6' }}>
            <span className="w-[5px] h-[5px] rounded-full" style={{ background: POS_HEX[player.position] }} />
            {POS_LABEL[player.position]}
          </span>
          {canManage && (
            <div className="flex items-center flex-none">
              <button onClick={() => moveTo(i, i - 1)} disabled={i === 0} title="Subir" className="p-1 rounded text-ink-icon hover:text-ink hover:bg-paper disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => moveTo(i, i + 1)} disabled={i === order.length - 1} title="Descer" className="p-1 rounded text-ink-icon hover:text-ink hover:bg-paper disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronDown className="w-4 h-4" />
              </button>
              <button onClick={() => onRemove(player)} title="Remover da espera" className="p-1 rounded text-red-500 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
