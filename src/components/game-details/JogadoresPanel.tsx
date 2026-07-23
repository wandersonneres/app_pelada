import { useMemo, useState } from 'react';
import { Plus, Search, UserPlus } from 'lucide-react';
import { Game, Player } from '../../types';
import { PlayerCard } from './PlayerCard';

interface JogadoresPanelProps {
  game: Game;
  canManage: boolean;
  diaristaPayments: Record<string, { value: number; date: string; playerName: string; matchId: string; recordBy?: string }>;
  onDiaristaPayment: (playerId: string, name: string) => void;
  onOpenPlayerOptions: (player: Player) => void;
  onAddPlayer: () => void;
  onSelectPlayer: () => void;
}

export function JogadoresPanel({
  game,
  canManage,
  diaristaPayments,
  onDiaristaPayment,
  onOpenPlayerOptions,
  onAddPlayer,
  onSelectPlayer,
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
    <div className="p-5 md:px-[28px] md:py-[22px] flex flex-col gap-4 h-full min-h-0">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h2 className="font-heading font-extrabold text-[20px] text-ink">Jogadores confirmados</h2>
          <div className="text-[12.5px] text-ink-soft mt-px">A ordem de chegada define a prioridade para entrar em campo</div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 border border-[#ded8c9] bg-surface rounded-[10px] px-3">
            <Search className="w-[15px] h-[15px] text-ink-soft" strokeWidth={2} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar jogador"
              className="border-none outline-none bg-transparent text-[13px] py-[9px] w-[130px] md:w-[150px]"
            />
          </div>
          {canEdit && (
            <>
              <button
                onClick={onSelectPlayer}
                className="border border-[#ded8c9] bg-surface text-ink-medium text-[12.5px] font-semibold px-[15px] py-[9px] rounded-[10px] hover:bg-paper transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden lg:inline">Selecionar do grupo</span>
              </button>
              <button
                onClick={onAddPlayer}
                className="bg-wine text-white text-[12.5px] font-semibold px-4 py-[9px] rounded-[10px] hover:bg-wine-dark transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        <div className="bg-surface border border-line rounded-[13px] px-4 py-[13px] flex items-center gap-3">
          <span className="chip w-[38px] h-[38px] flex-none rounded-full bg-ink text-white font-stat font-bold text-[15px] flex items-center justify-center">
            {players.length}
          </span>
          <div>
            <div className="text-[11px] text-ink-soft font-semibold">Confirmados</div>
            <div className="text-[12px] text-ink-medium">de {game.maxPlayers} vagas</div>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-[13px] px-4 py-[13px]">
          <div className="text-[11px] text-ink-soft font-semibold">Mensalistas</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-heading font-extrabold text-[24px] text-wine">{mensalistas}</span>
            <span className="text-[11px] text-ink-soft">· Diaristas {diaristas}</span>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-[13px] px-4 py-[13px]">
          <div className="text-[11px] text-ink-soft font-semibold">Por posição</div>
          <div className="flex gap-[11px] mt-1.5 text-[12px] font-bold text-ink">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#d99a1a' }} />{byPos.def} DEF</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#0d7a72' }} />{byPos.mei} MEI</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#c2560f' }} />{byPos.ata} ATA</span>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-[13px] px-4 py-[13px]">
          <div className="text-[11px] text-ink-soft font-semibold">Pagamentos</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-heading font-extrabold text-[24px] text-ink">{diariaPaid}/{diariaList.length}</span>
            <span className="text-[11px]" style={{ color: '#9a6a10' }}>
              {diariaPending > 0 ? `${diariaPending} pendentes` : 'em dia'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      {players.length > 0 ? (
        <div
          className="bg-surface border border-line rounded-2xl p-3.5 grid gap-2.5 content-start flex-1 min-h-0 overflow-y-auto"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
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
        <div className="bg-surface border border-line rounded-2xl p-8 text-ink-soft text-center">Nenhum jogador confirmado ainda.</div>
      )}
    </div>
  );
}
