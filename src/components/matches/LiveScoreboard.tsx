import { Pause, Play } from 'lucide-react';
import { formatClock } from './useMatchClock';

interface LiveScoreboardProps {
  variant: 'tablet' | 'mobile';
  scoreA: number;
  scoreB: number;
  remainingSeconds: number;
  running: boolean;
  onToggleRunning: () => void;
  matchBadge: string; // "P3"
  isLive?: boolean;
}

export function LiveScoreboard({ variant, scoreA, scoreB, remainingSeconds, running, onToggleRunning, matchBadge, isLive = true }: LiveScoreboardProps) {
  const PlayPauseIcon = running ? Pause : Play;

  const clockButton = (size: number) => (
    <button
      onClick={onToggleRunning}
      style={{
        width: size,
        height: size === 26 ? 26 : 34,
        borderRadius: 8,
        border: 'none',
        background: 'rgba(255,255,255,.14)',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      <PlayPauseIcon className="w-3 h-3" fill="currentColor" />
    </button>
  );

  if (variant === 'tablet') {
    return (
      <div
        style={{
          flex: 'none',
          background: 'linear-gradient(120deg,#1e1c16,#16150f)',
          borderRadius: 16,
          padding: '13px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          boxShadow: '0 8px 22px -10px rgba(15,30,54,.6)',
        }}
      >
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div className="hd" style={{ color: '#9fb2dd', fontWeight: 700, fontSize: 13, letterSpacing: '.04em' }}>TIME AZUL</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 40, color: '#fff', lineHeight: 1 }}>{scoreA}</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 19, color: '#fff', letterSpacing: '.5px' }}>
              {formatClock(remainingSeconds)}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 5 }}>
              {isLive && clockButton(26)}
              <span
                style={{
                  fontSize: 9.5,
                  color: '#9e2a3d',
                  background: 'rgba(34,197,94,.16)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontWeight: 700,
                  letterSpacing: '.06em',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {matchBadge}
              </span>
            </div>
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 40, color: '#fff', lineHeight: 1 }}>{scoreB}</span>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div className="hd" style={{ color: '#e3a874', fontWeight: 700, fontSize: 13, letterSpacing: '.04em' }}>TIME LARANJA</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(120deg,#1e1c16,#16150f)', borderRadius: 18, padding: 16, color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="hd" style={{ color: '#9fb2dd', fontSize: 11, fontWeight: 700, letterSpacing: '.04em' }}>AZUL</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 44, lineHeight: 1, marginTop: 2 }}>{scoreA}</div>
        </div>
        <div style={{ textAlign: 'center', padding: '0 6px' }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, letterSpacing: '.5px' }}>
            {formatClock(remainingSeconds)}
          </div>
          {isLive && <div style={{ marginTop: 6, display: 'flex', justifyContent: 'center' }}>{clockButton(34)}</div>}
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="hd" style={{ color: '#e3a874', fontSize: 11, fontWeight: 700, letterSpacing: '.04em' }}>LARANJA</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 44, lineHeight: 1, marginTop: 2 }}>{scoreB}</div>
        </div>
      </div>
    </div>
  );
}
