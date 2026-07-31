import { useMemo } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { Game, Player } from '../../types';
import { PlayerCard } from './PlayerCard';

interface JogadoresMobileProps {
  game: Game;
  canManage: boolean;
  diaristaPayments: Record<string, { value: number; date: string; playerName: string; matchId: string; recordBy?: string }>;
  onDiaristaPayment: (playerId: string, name: string) => void;
  onOpenPlayerOptions: (player: Player) => void;
  onAddPlayer: () => void;
  onSelectPlayer: () => void;
}

function MiniTile({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex-1 bg-surface border border-line rounded-[11px] px-[11px] py-[9px]">
      <div className="text-[10px] text-ink-soft font-semibold">{label}</div>
      <div className="font-heading font-extrabold text-[17px]" style={{ color }}>{value}</div>
    </div>
  );
}

export function JogadoresMobile({
  game,
  canManage,
  diaristaPayments,
  onDiaristaPayment,
  onOpenPlayerOptions,
  onAddPlayer,
  onSelectPlayer,
}: JogadoresMobileProps) {
  const players = useMemo(() => [...game.players].sort((a, b) => a.arrivalOrder - b.arrivalOrder), [game.players]);
  const mensalistas = players.filter(p => p.paymentType === 'mensalista').length;
  const diaristas = players.length - mensalistas;
  const aPagar = players.filter(p => p.paymentType === 'diarista' && !diaristaPayments[p.id]).length;
  const canEdit = canManage && game.status !== 'finished';

  return (
    <div className="p-3.5 pb-4 flex flex-col gap-[11px]">
      <div className="flex items-center gap-2.5">
        <div className="font-heading font-extrabold text-[17px] text-ink">Confirmados</div>
        <span className="bg-wine-tint text-wine text-[11px] font-bold px-[9px] py-0.5 rounded-full">{players.length}</span>
        <span className="ml-auto text-[11px] text-ink-soft">ordem de chegada</span>
      </div>

      <div className="flex gap-2">
        <MiniTile label="Mensalistas" value={mensalistas} color="#6e1a28" />
        <MiniTile label="Diaristas" value={diaristas} />
        <MiniTile label="A pagar" value={aPagar} color="#9a6a10" />
      </div>

      {canEdit && (
        <div className="flex gap-2">
          <button
            onClick={onSelectPlayer}
            className="flex-1 flex items-center justify-center gap-2 border border-[#ded8c9] bg-surface text-ink-medium text-[13px] font-semibold py-2.5 rounded-xl active:opacity-70"
          >
            <UserPlus className="w-4 h-4" /> Selecionar do grupo
          </button>
          <button
            onClick={onAddPlayer}
            className="flex-1 flex items-center justify-center gap-2 bg-wine text-white text-[13px] font-semibold py-2.5 rounded-xl active:opacity-80"
          >
            <Plus className="w-4 h-4" /> Adicionar novo
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {players.length === 0 && (
          <div className="bg-surface border border-line rounded-2xl p-8 text-ink-soft text-center text-sm">Nenhum jogador confirmado ainda.</div>
        )}
        {players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            canManage={canManage}
            isDiaristaPaid={!!diaristaPayments[player.id]}
            onDiaristaPayment={() => onDiaristaPayment(player.id, player.name)}
            onOpenOptions={() => onOpenPlayerOptions(player)}
          />
        ))}
      </div>
    </div>
  );
}
