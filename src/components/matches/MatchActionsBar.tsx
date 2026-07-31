import { useState } from 'react';
import { Match } from '../../types';

interface MatchActionsBarProps {
  match: Match;
  onFinishMatch: (matchId: string, winnerTeamId: string) => void;
  variant: 'desktop' | 'tablet';
}

export function MatchActionsBar({ match, onFinishMatch, variant }: MatchActionsBarProps) {
  const teamA = match.teams[0];
  const teamB = match.teams[1];
  const [selected, setSelected] = useState<string | null>(null);

  const pillStyle = (active: boolean, kind: 'azul' | 'laranja'): React.CSSProperties =>
    kind === 'azul'
      ? {
          border: `1px solid ${active ? '#7f97cf' : '#b9c5e4'}`,
          background: '#eef1fa',
          color: '#1c3576',
          fontWeight: 700,
          fontSize: variant === 'desktop' ? 12.5 : 12,
          padding: variant === 'desktop' ? '7px 14px' : '6px 12px',
          borderRadius: variant === 'desktop' ? 9 : 8,
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          outline: active ? '2px solid #1c3576' : 'none',
        }
      : {
          border: `1px solid ${active ? '#d69f66' : '#ecceb0'}`,
          background: '#f8efe4',
          color: '#9e440a',
          fontWeight: 700,
          fontSize: variant === 'desktop' ? 12.5 : 12,
          padding: variant === 'desktop' ? '7px 14px' : '6px 12px',
          borderRadius: variant === 'desktop' ? 9 : 8,
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          outline: active ? '2px solid #9e440a' : 'none',
        };

  if (variant === 'desktop') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e6e1d4', borderRadius: 12, padding: '8px 12px' }}>
        <span style={{ fontSize: 12, color: '#8b8578', fontWeight: 600, whiteSpace: 'nowrap' }}>Quem continua?</span>
        <button style={pillStyle(selected === teamA.id, 'azul')} onClick={() => setSelected(teamA.id)}>Azul</button>
        <button style={pillStyle(selected === teamB.id, 'laranja')} onClick={() => setSelected(teamB.id)}>Laranja</button>
        <button
          disabled={!selected}
          onClick={() => selected && onFinishMatch(match.id, selected)}
          style={{
            marginLeft: 'auto',
            border: 'none',
            background: selected ? '#1b1a16' : '#c8c1b0',
            color: '#fff',
            fontWeight: 600,
            fontSize: 12,
            padding: '9px 14px',
            borderRadius: 9,
            cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          Encerrar
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', background: '#fff', border: '1px solid #e6e1d4', borderRadius: 11, padding: '7px 10px' }}>
      <span style={{ fontSize: 11, color: '#8b8578', fontWeight: 600 }}>Quem continua?</span>
      <button style={pillStyle(false, 'azul')} onClick={() => onFinishMatch(match.id, teamA.id)}>Azul</button>
      <button style={pillStyle(false, 'laranja')} onClick={() => onFinishMatch(match.id, teamB.id)}>Laranja</button>
    </div>
  );
}
