import { useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface GroupPlayer {
  id: string;
  email?: string;
  playerInfo?: {
    name: string;
    position: string;
    skillLevel: number;
    ageGroup: string;
    paymentType?: string;
  };
}

const POS_LABEL: Record<string, string> = { defesa: 'DEF', meio: 'MEI', ataque: 'ATA' };
const POS_HEX: Record<string, string> = { defesa: '#d99a1a', meio: '#0d7a72', ataque: '#c2560f' };

/** Linha de jogador do grupo. Usada pela coluna (desktop/tablet) e pelo modal (celular). */
export function GroupPlayerRow({
  user,
  onAdd,
  isAdding,
  isPending,
}: {
  user: GroupPlayer;
  onAdd: () => void;
  /** Desabilita a linha (a lista toda trava durante uma gravação). */
  isAdding?: boolean;
  /** Esta é a linha que está sendo gravada. */
  isPending?: boolean;
}) {
  const pos = user.playerInfo?.position ?? '';
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={isAdding}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#eee7d8] bg-surface hover:bg-paper active:opacity-70 transition-colors text-left disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? (
        <span className="w-9 h-9 flex-none flex items-center justify-center">
          <span className="animate-spin rounded-full h-5 w-5 border-2 border-wine/30 border-t-wine" />
        </span>
      ) : (
        <span className="w-9 h-9 flex-none rounded-full bg-wine-tint text-wine font-bold text-sm flex items-center justify-center">
          {user.playerInfo?.name?.charAt(0).toUpperCase() || '?'}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[13.5px] text-ink truncate">
          {user.playerInfo?.name || user.email}
        </div>
        <div className="text-[11px] text-ink-soft truncate">{user.email}</div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-none">
        <span
          className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.04em] px-[7px] py-[3px] rounded-md"
          style={{ color: '#5c5647', background: '#ece5d6' }}
        >
          <span className="w-[5px] h-[5px] rounded-full" style={{ background: POS_HEX[pos] }} />
          {POS_LABEL[pos] ?? '—'}
        </span>
        <span className="tracking-[0.5px] leading-none text-[11px]">
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} style={{ color: i < (user.playerInfo?.skillLevel || 0) ? '#d99a1a' : '#ded8c9' }}>
              ★
            </span>
          ))}
        </span>
      </div>
    </button>
  );
}

interface GroupPlayersColumnProps {
  /** Já filtrada para excluir quem está confirmado. */
  players: GroupPlayer[];
  isLoading: boolean;
  onAdd: (user: GroupPlayer) => void | Promise<void>;
  className?: string;
}

/**
 * Coluna da esquerda (tablet na horizontal e desktop): jogadores do grupo que
 * ainda não foram confirmados. Substitui o modal "Selecionar do grupo" nessas
 * larguras — clicar na linha confirma o jogador, que some daqui e aparece na
 * coluna da direita.
 */
export function GroupPlayersColumn({ players, isLoading, onAdd, className }: GroupPlayersColumnProps) {
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? players.filter(
          u =>
            (u.playerInfo?.name || '').toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term)
        )
      : players;
    return [...list].sort((a, b) =>
      (a.playerInfo?.name || a.email || '').localeCompare(b.playerInfo?.name || b.email || '')
    );
  }, [players, search]);

  const handleAdd = async (user: GroupPlayer) => {
    setAddingId(user.id);
    try {
      await onAdd(user);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className={cn('bg-surface border border-line rounded-2xl flex flex-col min-h-0', className)}>
      <div className="flex-none p-3 pb-2.5 border-b border-line">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-ink-soft flex-none" />
          <h3 className="font-heading font-extrabold text-[15px] text-ink">Do grupo</h3>
          <span className="text-[11px] text-ink-soft truncate">· clique para confirmar</span>
          <span className="ml-auto flex-none bg-paper text-ink-soft text-[11px] font-bold px-2 py-0.5 rounded-full">
            {players.length}
          </span>
        </div>
        <div className="flex items-center gap-2 border border-[#ded8c9] bg-surface rounded-[10px] px-3 mt-2">
          <Search className="w-[15px] h-[15px] text-ink-soft flex-none" strokeWidth={2} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email"
            className="flex-1 min-w-0 border-none outline-none bg-transparent text-[13px] py-[9px]"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2.5 flex flex-col gap-1.5">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-wine/30 border-t-wine" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map(user => (
            <GroupPlayerRow
              key={user.id}
              user={user}
              // Bloqueia a lista inteira durante a gravação: o arrivalOrder é
              // calculado a partir do game atual, então dois cliques seguidos
              // antes do snapshot chegar gravariam a mesma posição.
              isAdding={addingId !== null}
              isPending={addingId === user.id}
              onAdd={() => handleAdd(user)}
            />
          ))
        ) : (
          <div className="text-center py-10 px-3 text-ink-soft text-[13px]">
            {search
              ? 'Nenhum jogador encontrado com esse termo.'
              : players.length === 0
              ? 'Todos os jogadores do grupo já estão confirmados.'
              : 'Nenhum jogador disponível.'}
          </div>
        )}
      </div>
    </div>
  );
}
