import { Match } from '../../types';
import { matchOutcome } from '../game-details/gameStats';

interface MatchNavigatorProps {
  matches: Match[];
  activeMatchId: string | null;
  onSelect: (matchId: string) => void;
  compact?: boolean; // true no celular (chips menores)
}

export function MatchNavigator({ matches, activeMatchId, onSelect, compact }: MatchNavigatorProps) {
  if (matches.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: compact ? 8 : 10, overflowX: 'auto', paddingBottom: 2 }}>
      {matches.map((match, idx) => {
        const outcome = matchOutcome(match);
        const { scoreA, scoreB } = outcome;
        const isActive = match.id === activeMatchId;
        const isLive = match.status === 'in_progress';
        // Rótulo do resultado sempre pelo placar (empate ou vencedor por gols).
        const resultLabel = match.status === 'finished' ? (outcome.draw ? 'Empate' : outcome.winner?.name) : null;

        return (
          <button
            key={match.id}
            onClick={() => onSelect(match.id)}
            style={{
              flex: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              border: isActive ? '2px solid #6e1a28' : '1px solid #e6e1d4',
              background: isActive ? '#fdf7f3' : '#f9f7f1',
              borderRadius: compact ? 11 : 12,
              padding: isActive ? (compact ? '6px 11px' : '8px 13px') : (compact ? '7px 11px' : '9px 14px'),
              minWidth: compact ? 96 : 150,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span style={{ fontSize: compact ? 10 : 11, color: '#8b8578', fontWeight: 600 }}>
                {compact ? `P${idx + 1}` : `Partida ${idx + 1}`}
              </span>
              {isLive ? (
                <span
                  style={{
                    fontSize: 9,
                    color: '#dc2626',
                    background: compact ? 'transparent' : '#f6dcd6',
                    padding: compact ? 0 : '1px 7px',
                    borderRadius: 5,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: '#dc2626' }} />
                  {compact ? 'VIVO' : 'AO VIVO'}
                </span>
              ) : (
                <span style={{ fontSize: 9, color: '#1f6b46', background: '#e6f0e9', padding: '1px 7px', borderRadius: 5, fontWeight: 700 }}>
                  FIM
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: compact ? 14 : 17 }}>
              <span style={{ color: '#1c3576' }}>{scoreA}</span>
              <span style={{ color: '#c8c1b0', fontSize: 13 }}>×</span>
              <span style={{ color: '#9e440a' }}>{scoreB}</span>
              {!compact && resultLabel && (
                <span style={{ fontSize: 10, color: '#8b8578', marginLeft: 'auto', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  {resultLabel}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
