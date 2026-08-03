import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Game, Player } from '../../types';
import { PlayerCard } from './PlayerCard';
import { GroupPlayer, GroupPlayersColumn } from './GroupPlayersColumn';
import { searchInputProps } from '../../lib/inputProps';

interface JogadoresPanelProps {
  game: Game;
  canManage: boolean;
  diaristaPayments: Record<string, { value: number; date: string; playerName: string; matchId: string; recordBy?: string }>;
  onDiaristaPayment: (playerId: string, name: string) => void;
  onOpenPlayerOptions: (player: Player) => void;
  onAddPlayer: () => void;
  /** Jogadores do grupo ainda não confirmados (coluna da esquerda). */
  groupPlayers: GroupPlayer[];
  isLoadingGroupPlayers: boolean;
  onAddGroupPlayer: (user: GroupPlayer) => void | Promise<void>;
}

export function JogadoresPanel({
  game,
  canManage,
  diaristaPayments,
  onDiaristaPayment,
  onOpenPlayerOptions,
  onAddPlayer,
  groupPlayers,
  isLoadingGroupPlayers,
  onAddGroupPlayer,
}: JogadoresPanelProps) {
  const [search, setSearch] = useState('');

  const players = useMemo(
    () => [...game.players].sort((a, b) => a.arrivalOrder - b.arrivalOrder),
    [game.players]
  );
  const filtered = useMemo(
    () => players.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase())),
    [players, search]
  );

  const mensalistas = players.filter(p => p.paymentType === 'mensalista').length;
  const diaristas = players.length - mensalistas;
  const byPos = {
    def: players.filter(p => p.position === 'defesa').length,
    mei: players.filter(p => p.position === 'meio').length,
    ata: players.filter(p => p.position === 'ataque').length,
  };
  const diariaList = players.filter(p => p.paymentType === 'diarista');
  const diariaPaid = diariaList.filter(p => !!diaristaPayments[p.id]).length;
  const diariaPending = diariaList.length - diariaPaid;

  const canEdit = canManage && game.status !== 'finished';

  return (
    <div className="p-4 xl:px-[28px] xl:py-[22px] flex flex-col gap-3 h-full min-h-0">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 flex-none">
        <div className="min-w-0">
          <h2 className="font-heading font-extrabold text-[19px] text-ink">Jogadores confirmados</h2>
          <div className="text-[12px] text-ink-soft mt-px">A ordem de chegada define a prioridade para entrar em campo</div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 border border-[#ded8c9] bg-surface rounded-[10px] px-3">
            <Search className="w-[15px] h-[15px] text-ink-soft" strokeWidth={2} />
            <input
              {...searchInputProps}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar jogador"
              className="border-none outline-none bg-transparent text-[13px] py-[9px] w-[130px] xl:w-[150px] appearance-none [&::-webkit-search-cancel-button]:appearance-none"
            />
          </div>
          {/* Sem botão "Selecionar do grupo": aqui (tablet/desktop) a coluna da
              esquerda já mostra o grupo inteiro. O botão só existe no celular. */}
          {canEdit && (
            <button
              onClick={onAddPlayer}
              className="bg-wine text-white text-[12.5px] font-semibold px-4 py-[9px] rounded-[10px] hover:bg-wine-dark transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          )}
        </div>
      </div>

      {/* Faixa de estatísticas compacta e em linha única: com as duas colunas
          embaixo, a altura é curta (iPad deitado = 768px) e o grid antigo
          quebrava em 2x2, comendo ~90px da lista. */}
      <div className="grid grid-cols-4 gap-2 flex-none">
        <div className="bg-surface border border-line rounded-[11px] px-3 py-2 flex items-center gap-2.5 min-w-0">
          <span className="chip w-[30px] h-[30px] flex-none rounded-full bg-ink text-white font-stat font-bold text-[13px] flex items-center justify-center">
            {players.length}
          </span>
          <div className="text-[11px] text-ink-soft font-semibold truncate">Confirmados</div>
        </div>

        <div className="bg-surface border border-line rounded-[11px] px-3 py-2 min-w-0">
          <div className="text-[10.5px] text-ink-soft font-semibold truncate">Mensalistas</div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-[18px] text-wine leading-tight">{mensalistas}</span>
            <span className="text-[10.5px] text-ink-soft truncate">· Diaristas {diaristas}</span>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-[11px] px-3 py-2 min-w-0">
          <div className="text-[10.5px] text-ink-soft font-semibold truncate">Por posição</div>
          <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-0.5 text-[11.5px] font-bold text-ink">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: '#d99a1a' }} />{byPos.def} DEF</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: '#0d7a72' }} />{byPos.mei} MEI</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: '#c2560f' }} />{byPos.ata} ATA</span>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-[11px] px-3 py-2 min-w-0">
          <div className="text-[10.5px] text-ink-soft font-semibold truncate">Pagamentos</div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-[18px] text-ink leading-tight">{diariaPaid}/{diariaList.length}</span>
            <span className="text-[10.5px] truncate" style={{ color: '#9a6a10' }}>
              {diariaPending > 0 ? `${diariaPending} pendentes` : 'em dia'}
            </span>
          </div>
        </div>
      </div>

      {/* Duas colunas: grupo à esquerda, confirmados à direita. Sem media query
          de propósito — este painel só renderiza em tablet/desktop, e o tablet
          deitado cai logo abaixo de lg (1024), onde a versão anterior perdia as
          duas colunas justamente no aparelho que elas atendem. */}
      <div
        className={`flex-1 min-h-0 grid gap-3 ${
          canEdit ? 'grid-cols-[minmax(230px,290px)_1fr]' : 'grid-cols-1'
        }`}
      >
        {canEdit && (
          <GroupPlayersColumn
            players={groupPlayers}
            isLoading={isLoadingGroupPlayers}
            onAdd={onAddGroupPlayer}
          />
        )}

        {players.length > 0 ? (
          <div
            className="bg-surface border border-line rounded-2xl p-3 grid gap-2 content-start min-h-0 overflow-y-auto overscroll-contain"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
          >
            {filtered.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                canManage={canManage}
                isDiaristaPaid={!!diaristaPayments[player.id]}
                onDiaristaPayment={() => onDiaristaPayment(player.id, player.name)}
                onOpenOptions={() => onOpenPlayerOptions(player)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-ink-soft text-center py-8 text-sm">Nenhum jogador encontrado.</div>
            )}
            {canEdit && (
              <button
                onClick={onAddPlayer}
                className="flex items-center justify-center gap-2 min-h-[60px] rounded-xl border-[1.5px] border-dashed border-[#d9d2c2] bg-paper text-ink-soft text-[12.5px] font-semibold hover:text-ink transition-colors"
              >
                <Plus className="w-4 h-4" /> Adicionar jogador
              </button>
            )}
          </div>
        ) : (
          <div className="bg-surface border border-line rounded-2xl p-8 text-ink-soft text-center min-h-0 overflow-y-auto">
            Nenhum jogador confirmado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
