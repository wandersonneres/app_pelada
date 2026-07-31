import { useCallback, useEffect, useState } from 'react';
import { Match } from '../../types';

interface TimerUpdate {
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  startedAt?: Date;
}

export function useMatchClock(match: Match, isFirstMatch: boolean, onTimerUpdate: (data: TimerUpdate) => void) {
  const [totalMinutes] = useState(() => {
    if (match.timer?.totalSeconds) return Math.floor(match.timer.totalSeconds / 60);
    return isFirstMatch ? 15 : 10;
  });
  const [running, setRunning] = useState(match.timer?.isRunning || false);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    match.timer?.remainingSeconds !== undefined ? match.timer.remainingSeconds : totalMinutes * 60
  );

  const pushUpdate = useCallback(
    (newRunning: boolean, newRemaining: number) => {
      onTimerUpdate({
        isRunning: newRunning,
        remainingSeconds: newRemaining,
        totalSeconds: totalMinutes * 60,
        startedAt: newRunning ? new Date() : undefined,
      });
    },
    [onTimerUpdate, totalMinutes]
  );

  const toggleRunning = useCallback(() => {
    const next = !running;
    setRunning(next);
    pushUpdate(next, remainingSeconds);
  }, [running, remainingSeconds, pushUpdate]);

  useEffect(() => {
    if (!running || remainingSeconds <= 0) {
      if (running && remainingSeconds <= 0) {
        setRunning(false);
        pushUpdate(false, 0);
      }
      return;
    }
    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        const next = prev - 1;
        onTimerUpdate({
          isRunning: true,
          remainingSeconds: next,
          totalSeconds: totalMinutes * 60,
          startedAt: match.timer?.startedAt,
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, remainingSeconds]);

  return { remainingSeconds, running, toggleRunning };
}

export function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
