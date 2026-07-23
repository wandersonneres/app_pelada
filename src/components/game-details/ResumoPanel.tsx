import { Calendar, MapPin, Users } from 'lucide-react';
import { Game, convertTimestampToDate } from '../../types';
import { computeGameTotals } from './gameStats';
import { GameSection } from './SectionNav';

interface ResumoPanelProps {
  game: Game;
  onGoToSection: (section: GameSection) => void;
}

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-surface border border-line rounded-[15px] p-[18px]">
      <div className="text-[12px] text-ink-soft font-semibold">{label}</div>
      <div className="font-heading font-extrabold text-[32px] leading-none mt-1 text-ink">{value}</div>
      {hint && <div className="text-[11px] text-ink-soft mt-1">{hint}</div>}
    </div>
  );
}

const STEPS = [
  { n: 1, title: 'Confirme os jogadores', desc: 'Na aba Jogadores, marque quem chegou — a ordem de chegada define a prioridade para entrar.' },
  { n: 2, title: 'Gere os times', desc: 'Escolha o formato e gere times equilibrados por skill + lista de espera.' },
  { n: 3, title: 'Jogue e registre', desc: 'Marque gols e assistências, defina quem continua e gere a próxima partida até encerrar.' },
];

export function ResumoPanel({ game, onGoToSection }: ResumoPanelProps) {
  const totals = computeGameTotals(game);
  const d = convertTimestampToDate(game.date);
  const dateLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const weekday = WEEKDAYS[d.getDay()];

  return (
    <div className="p-6 md:px-[28px] md:py-6 flex flex-col gap-[18px] min-h-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Confirmados" value={game.players.length} />
        <StatCard
          label="Partidas"
          value={totals.totalMatches}
          hint={totals.liveMatches > 0 ? `${totals.liveMatches} em andamento` : `${totals.finishedMatches} finalizadas`}
        />
        <StatCard label="Gols" value={totals.totalGoals} hint={`${totals.goalsPerMatch} por partida`} />
        <StatCard label="Na espera" value={game.waitingList?.length ?? 0} hint="rotação automática" />
      </div>

      <div className="grid gap-[18px] grid-cols-1 lg:grid-cols-[1.4fr_1fr] lg:flex-1 lg:min-h-0">
        <div className="bg-surface border border-line rounded-2xl p-[22px] flex flex-col gap-4">
          <div className="font-heading font-bold text-[16px] text-ink">Como funciona a pelada</div>
          {STEPS.map(step => (
            <div key={step.n} className="flex gap-3.5 items-start">
              <span className="chip w-7 h-7 flex-none rounded-full bg-wine text-white text-[13px] font-bold flex items-center justify-center">
                {step.n}
              </span>
              <div>
                <div className="text-[14px] font-semibold text-ink">{step.title}</div>
                <div className="text-[13px] text-ink-soft">{step.desc}</div>
              </div>
            </div>
          ))}
          <div className="mt-auto flex flex-wrap gap-2.5 pt-2">
            <button
              onClick={() => onGoToSection('partidas')}
              className="bg-wine text-white font-semibold text-[13px] px-[18px] py-3 rounded-[11px] hover:bg-wine-dark transition-colors"
            >
              Ir para Partidas
            </button>
            <button
              onClick={() => onGoToSection('jogadores')}
              className="border border-[#ded8c9] bg-surface text-ink-medium font-semibold text-[13px] px-[18px] py-3 rounded-[11px] hover:bg-paper transition-colors"
            >
              Ver jogadores
            </button>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-[22px] flex flex-col gap-3.5">
          <div className="font-heading font-bold text-[16px] text-ink">Informações</div>
          <div className="flex items-center gap-[11px] text-[13.5px] text-ink">
            <MapPin className="w-[18px] h-[18px] flex-none text-wine" strokeWidth={2} />
            {game.location}
          </div>
          <div className="flex items-center gap-[11px] text-[13.5px] text-ink">
            <Calendar className="w-[18px] h-[18px] flex-none text-team-blue" strokeWidth={2} />
            <span className="capitalize">{weekday}, {dateLabel}</span> · {time}
          </div>
          <div className="flex items-center gap-[11px] text-[13.5px] text-ink">
            <Users className="w-[18px] h-[18px] flex-none text-ink-soft" strokeWidth={2} />
            {game.players.length} confirmados
          </div>
          {game.observations && (
            <div className="border-t border-line-soft pt-3.5 mt-1">
              <div className="text-[11px] text-ink-soft font-semibold mb-1.5">OBSERVAÇÕES</div>
              <div className="text-[13px] text-ink-medium">{game.observations}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
