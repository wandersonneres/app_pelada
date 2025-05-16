import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, StopCircle, Circle } from 'lucide-react';
import { Team } from '../types';
import { GoalScorerModal } from './GoalScorerModal';

interface MatchTimerProps {
  teamA: Team;
  teamB: Team;
  isFirstMatch: boolean;
  onGoalScored: (teamId: string, scorerId: string, assisterId?: string) => void;
}

export const MatchTimer = ({ teamA, teamB, isFirstMatch, onGoalScored }: MatchTimerProps) => {
  const [time, setTime] = useState(isFirstMatch ? 15 : 10);
  const [running, setRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(time * 60);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resetTimer = useCallback(() => {
    setRemainingSeconds(time * 60);
    setRunning(false);
  }, [time]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0) {
      setRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running, remainingSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoalScored = (team: Team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleGoalConfirmed = (scorerId: string, assisterId?: string) => {
    if (selectedTeam) {
      if (selectedTeam.id === teamA.id) {
        setScoreA((prev) => prev + 1);
      } else {
        setScoreB((prev) => prev + 1);
      }
      onGoalScored(selectedTeam.id, scorerId, assisterId);
    }
    setIsModalOpen(false);
    setSelectedTeam(null);
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl shadow-lg mb-4 overflow-hidden border border-blue-200">
      <div className="flex w-full justify-between items-center px-4 py-6 gap-2">
        {/* Time A */}
        <div className="flex flex-col items-center w-1/3">
          <span className="font-bold text-white text-lg mb-1">{teamA.name}</span>
          <span className="text-5xl font-extrabold text-white drop-shadow mb-2">{scoreA}</span>
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition ${!running ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleGoalScored(teamA)}
            disabled={!running}
          >
            <Circle className="w-4 h-4" /> Gol
          </button>
        </div>
        {/* Timer */}
        <div className="flex flex-col items-center w-1/3 relative">
          <select
            className="absolute -top-4 left-15 text-xs bg-white/80 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={time}
            onChange={e => {
              setTime(Number(e.target.value));
              setRemainingSeconds(Number(e.target.value) * 60);
            }}
            disabled={running}
          >
            <option value={10}>10 min</option>
            <option value={15}>15 min</option>
            <option value={20}>20 min</option>
            <option value={30}>30 min</option>
          </select>
          <span className="text-4xl font-mono font-bold text-white mt-4 mb-2">{formatTime(remainingSeconds)}</span>
          <div className="flex gap-2 mt-1">
            <button
              className={`p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition ${running ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}
              onClick={() => setRunning(!running)}
              aria-label={running ? 'Pausar' : 'Iniciar'}
            >
              {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition bg-red-500 hover:bg-red-600"
              onClick={resetTimer}
              aria-label="Parar"
            >
              <StopCircle className="w-5 h-5" />
            </button>
          </div>
          <span className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded ${running ? 'bg-green-500 text-white' : remainingSeconds === 0 ? 'bg-red-500 text-white' : 'bg-yellow-400 text-gray-900'}`}>
            {running ? 'Em Andamento' : remainingSeconds === 0 ? 'Finalizado' : 'Aguardando'}
          </span>
        </div>
        {/* Time B */}
        <div className="flex flex-col items-center w-1/3">
          <span className="font-bold text-white text-lg mb-1">{teamB.name}</span>
          <span className="text-5xl font-extrabold text-white drop-shadow mb-2">{scoreB}</span>
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition ${!running ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleGoalScored(teamB)}
            disabled={!running}
          >
            <Circle className="w-4 h-4" /> Gol
          </button>
        </div>
      </div>
      {/* Modal de Gols */}
      {selectedTeam && (
        <GoalScorerModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedTeam(null); }}
          team={selectedTeam}
          onConfirm={handleGoalConfirmed}
        />
      )}
    </div>
  );
}; 