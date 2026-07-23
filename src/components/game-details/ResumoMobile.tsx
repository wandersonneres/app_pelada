import { Game, convertTimestampToDate } from '../../types';
import { computeGameTotals } from './gameStats';
import { GameSection } from './SectionNav';

interface ResumoMobileProps {
  game: Game;
  canManage: boolean;
  onEdit: () => void;
  onToggleFinish: () => void;
  onDelete: () => void;
  onGoToSection: (s: GameSection) => void;
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const WEEKDAYS_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const STEPS = [
  { n: 1, title: 'Confirme os jogadores', desc: 'A ordem de chegada define a prioridade.' },
  { n: 2, title: 'Gere os times', desc: 'Escolha o formato, times equilibrados + espera.' },
  { n: 3, title: 'Jogue e registre', desc: 'Gols, quem continua e próxima partida.' },
];

function Tile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-paper rounded-[11px] p-[11px]">
      <div className="text-[11px] text-ink-soft font-semibold">{label}</div>
      <div className="font-heading font-extrabold text-[22px] leading-none mt-0.5 text-ink">{value}</div>
    </div>
  );
}

export function ResumoMobile({ game, canManage, onEdit, onToggleFinish, onDelete }: ResumoMobileProps) {
  const totals = computeGameTotals(game);
  const d = convertTimestampToDate(game.date);
  const weekday = WEEKDAYS[d.getDay()];
  const dateShort = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const isFinished = game.status === 'finished';

  return (
    <div className="p-3.5 pb-4 flex flex-col gap-[13px]">
      <div className="bg-surface border border-line rounded-2xl p-4">
        <div className="font-heading font-extrabold text-[17px] text-ink">Pelada de {weekday}</div>
        <div className="text-[12px] text-ink-soft mt-0.5">
          {game.location} · {WEEKDAYS_ABBR[d.getDay()]}, {dateShort} · {time}
        </div>
        <div className="grid grid-cols-2 gap-[9px] mt-3.5">
          <Tile label="Confirmados" value={game.players.length} />
          <Tile label="Partidas" value={totals.totalMatches} />
          <Tile label="Gols" value={totals.totalGoals} />
          <Tile label="Na espera" value={game.waitingList?.length ?? 0} />
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-4 flex flex-col gap-3">
        <div className="font-heading font-bold text-[14px] text-ink">Como funciona</div>
        {STEPS.map(s => (
          <div key={s.n} className="flex gap-[11px] items-start">
            <span className="chip w-6 h-6 flex-none rounded-full bg-wine text-white text-[11px] font-bold flex items-center justify-center">{s.n}</span>
            <div>
              <div className="text-[12.5px] font-semibold text-ink">{s.title}</div>
              <div className="text-[11.5px] text-ink-soft">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {canManage && (
        <>
          <div className="flex gap-2.5">
            <button
              onClick={onEdit}
              className="flex-1 border border-[#ded8c9] bg-surface text-ink-medium font-semibold text-[13px] py-3 rounded-xl active:opacity-70 transition"
            >
              Editar
            </button>
            <button
              onClick={onToggleFinish}
              className={`flex-1 font-semibold text-[13px] py-3 rounded-xl text-white active:opacity-70 transition ${isFinished ? 'bg-ink' : 'bg-wine'}`}
            >
              {isFinished ? 'Reabrir pelada' : 'Finalizar pelada'}
            </button>
          </div>
          <button onClick={onDelete} className="text-[12.5px] text-red-600 font-semibold py-1 active:opacity-70">
            Excluir pelada
          </button>
        </>
      )}
    </div>
  );
}
