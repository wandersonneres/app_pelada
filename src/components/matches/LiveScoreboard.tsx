interface LiveScoreboardProps {
  variant: 'tablet' | 'mobile';
  scoreA: number;
  scoreB: number;
  matchBadge: string; // "P3"
}

// Placar da partida. O cronômetro foi removido temporariamente — para reativar,
// reintroduzir useMatchClock + os controles de play/pause aqui e nos layouts.
export function LiveScoreboard({ variant, scoreA, scoreB, matchBadge }: LiveScoreboardProps) {
  const badge = (
    <span
      style={{
        fontSize: 10,
        color: '#e8c39a',
        background: 'rgba(255,255,255,.12)',
        padding: '3px 9px',
        borderRadius: 6,
        fontWeight: 700,
        letterSpacing: '.06em',
        fontFamily: "'Space Grotesk',sans-serif",
      }}
    >
      {matchBadge}
    </span>
  );

  if (variant === 'tablet') {
    return (
      <div
        style={{
          flex: 'none',
          background: 'linear-gradient(120deg,#1e1c16,#16150f)',
          borderRadius: 14,
          padding: '10px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          boxShadow: '0 8px 22px -12px rgba(15,30,54,.55)',
        }}
      >
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div className="hd" style={{ color: '#9fb2dd', fontWeight: 700, fontSize: 12.5, letterSpacing: '.04em' }}>TIME AZUL</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 34, color: '#fff', lineHeight: 1 }}>{scoreA}</span>
          {badge}
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 34, color: '#fff', lineHeight: 1 }}>{scoreB}</span>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div className="hd" style={{ color: '#e3a874', fontWeight: 700, fontSize: 12.5, letterSpacing: '.04em' }}>TIME LARANJA</div>
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
        <div style={{ textAlign: 'center', padding: '0 6px' }}>{badge}</div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="hd" style={{ color: '#e3a874', fontSize: 11, fontWeight: 700, letterSpacing: '.04em' }}>LARANJA</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 44, lineHeight: 1, marginTop: 2 }}>{scoreB}</div>
        </div>
      </div>
    </div>
  );
}
