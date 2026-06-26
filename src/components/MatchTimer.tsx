import { useState } from 'react';
import { Play, RotateCcw, Target } from 'lucide-react';
import { Team, Match, Player, getGoalTeamId, convertTimestampToDate } from '../types';
import { GoalScorerModal } from './GoalScorerModal';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';

interface MatchTimerProps {
  teamA: Team;
  teamB: Team;
  isFirstMatch: boolean;
  onGoalScored: (teamId: string, scorerId: string, assisterId?: string, ownGoal?: boolean) => void;
  onRemoveGoal: (goalId: string) => void;
  match: Match;
  roster?: Player[]; // Elenco completo do jogo (para resolver nomes de jogadores substituídos)
  onTimerUpdate?: (timerData: {
    isRunning: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    startedAt?: Date;
  }) => void;
}

export const MatchTimer = ({ teamA, teamB, isFirstMatch, onGoalScored, onRemoveGoal, match, roster, onTimerUpdate }: MatchTimerProps) => {
  // Duração apenas para calcular o horário de término previsto (sem contagem regressiva)
  const [durationMin, setDurationMin] = useState(() => {
    if (match.timer?.totalSeconds) return Math.floor(match.timer.totalSeconds / 60);
    return isFirstMatch ? 15 : 10;
  });

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startedAt = match.timer?.startedAt ? convertTimestampToDate(match.timer.startedAt) : null;
  const started = !!startedAt;
  const endsAt = startedAt ? new Date(startedAt.getTime() + durationMin * 60000) : null;

  const scoreA = match.goals?.filter(goal => getGoalTeamId(goal, match.teams) === teamA.id).length || 0;
  const scoreB = match.goals?.filter(goal => getGoalTeamId(goal, match.teams) === teamB.id).length || 0;

  const allPlayers = [...teamA.players, ...teamB.players, ...(roster ?? [])];

  const fmtTime = (d: Date | null) =>
    d ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

  const handleStart = () => {
    onTimerUpdate?.({
      isRunning: true,
      remainingSeconds: durationMin * 60,
      totalSeconds: durationMin * 60,
      startedAt: new Date(),
    });
  };

  const handleDurationChange = (m: number) => {
    setDurationMin(m);
    onTimerUpdate?.({
      isRunning: started,
      remainingSeconds: m * 60,
      totalSeconds: m * 60,
      startedAt: startedAt ?? undefined,
    });
  };

  const handleGoalScored = (team: Team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleGoalConfirmed = (scorerId: string, assisterId?: string, ownGoal?: boolean) => {
    if (selectedTeam) {
      onGoalScored(selectedTeam.id, scorerId, assisterId, ownGoal);
    }
    setIsModalOpen(false);
    setSelectedTeam(null);
  };

  const initialA = (teamA.name || 'A').charAt(0).toUpperCase();
  const initialB = (teamB.name || 'B').charAt(0).toUpperCase();

  return (
    <div className="glass-card p-4 sm:p-5 mb-4">
      {/* Topo: status + horário de início/término */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-team-blue/15 text-team-blue-soft border border-team-blue/25">
          <span className="w-1.5 h-1.5 rounded-full bg-team-blue" /> Em andamento
        </span>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {!started ? (
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-team-blue text-white text-sm font-semibold hover:brightness-110 transition-all shadow-[0_8px_20px_-8px_rgba(59,130,246,0.7)]"
            >
              <Play className="w-4 h-4" /> Iniciar partida
            </button>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ink-muted">Início</span>
              <span className="font-heading font-extrabold text-lg text-heading leading-none">{fmtTime(startedAt)}</span>
              <span className="text-ink-dim">→</span>
              <span className="text-ink-muted">Fim</span>
              <span className="font-heading font-extrabold text-lg text-heading leading-none">{fmtTime(endsAt)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Select value={String(durationMin)} onValueChange={v => handleDurationChange(Number(v))}>
              <SelectTrigger className="h-7 text-xs">
                <span className="flex-1 text-left">{durationMin} min</span>
              </SelectTrigger>
              <SelectContent>
                {[10, 15, 20, 30].map(m => (
                  <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {started && (
              <button onClick={handleStart} title="Redefinir horário de início" className="p-1.5 rounded-lg text-ink-muted hover:text-team-blue-soft hover:bg-surface-hover transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Placar interativo — clique no time para marcar um gol */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-3">
        <button
          onClick={() => handleGoalScored(teamA)}
          className="group flex flex-col items-center gap-1 rounded-2xl p-2.5 border bg-team-blue/10 border-team-blue/25 hover:bg-team-blue/20 active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-extrabold text-lg text-white shadow-[0_6px_16px_rgba(0,0,0,0.4)]" style={{ background: 'linear-gradient(155deg,#5b9bf6,#2c5fb0)' }}>{initialA}</div>
          <span className="font-heading font-bold text-xs sm:text-sm uppercase tracking-wide text-team-blue-soft text-center leading-tight">{teamA.name || 'Time Azul'}</span>
          <span className="font-heading font-extrabold text-4xl text-team-blue-soft leading-none">{scoreA}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted group-hover:text-team-blue-soft transition-colors">
            <Target className="w-3 h-3" /> Marcar gol
          </span>
        </button>
        <div className="flex items-center font-heading font-extrabold text-2xl sm:text-3xl text-ink-dim">×</div>
        <button
          onClick={() => handleGoalScored(teamB)}
          className="group flex flex-col items-center gap-1 rounded-2xl p-2.5 border bg-team-orange/10 border-team-orange/25 hover:bg-team-orange/20 active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-extrabold text-lg text-white shadow-[0_6px_16px_rgba(0,0,0,0.4)]" style={{ background: 'linear-gradient(155deg,#fba56a,#d2691e)' }}>{initialB}</div>
          <span className="font-heading font-bold text-xs sm:text-sm uppercase tracking-wide text-team-orange-soft text-center leading-tight">{teamB.name || 'Time Laranja'}</span>
          <span className="font-heading font-extrabold text-4xl text-team-orange-soft leading-none">{scoreB}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted group-hover:text-team-orange-soft transition-colors">
            <Target className="w-3 h-3" /> Marcar gol
          </span>
        </button>
      </div>

      {/* Histórico de gols */}
      {match.goals && match.goals.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <div className="text-[11px] text-ink-muted font-semibold uppercase tracking-wide mb-1">Gols</div>
          {match.goals.map(goal => {
            const scorer = allPlayers.find(p => p.id === goal.scorerId);
            const assister = goal.assisterId ? allPlayers.find(p => p.id === goal.assisterId) : null;
            const isTeamA = getGoalTeamId(goal, match.teams) === teamA.id;
            return (
              <div key={goal.id} className="flex items-center justify-between bg-surface border border-divider rounded-lg px-3 py-2 text-xs text-ink-soft">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isTeamA ? 'bg-team-blue' : 'bg-team-orange'}`} />
                  <span className="truncate">
                    <span className="font-semibold text-heading">{scorer?.name.split(' ')[0] ?? '?'}</span>
                    {goal.ownGoal ? (
                      <span className="text-danger-soft"> (contra)</span>
                    ) : assister && (
                      <span className="text-ink-muted"> ({assister.name.split(' ')[0]})</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveGoal(goal.id)}
                  className="ml-3 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-danger-soft hover:text-white hover:bg-danger transition font-bold text-sm"
                  aria-label="Remover gol"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Gols */}
      {selectedTeam && (
        <GoalScorerModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedTeam(null); }}
          team={selectedTeam}
          opponentTeam={selectedTeam.id === teamA.id ? teamB : teamA}
          onConfirm={handleGoalConfirmed}
        />
      )}
    </div>
  );
};
