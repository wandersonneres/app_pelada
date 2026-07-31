import { Player } from '../../types';

export const TEAM_PIN_STYLE = {
  azul: { gradient: 'radial-gradient(circle at 34% 28%, #3a63c0, #1e3f8e)', shadowColor: 'rgba(18,28,66,.4)' },
  laranja: { gradient: 'radial-gradient(circle at 34% 28%, #e07220, #b04d0d)', shadowColor: 'rgba(90,40,8,.4)' },
};

interface PinProps {
  player: Player;
  team: 'azul' | 'laranja';
  size: number;
  fontSize: number;
  labelFontSize: number;
  onClick?: () => void;
}

export function Pin({ player, team, size, fontSize, labelFontSize, onClick }: PinProps) {
  const { gradient, shadowColor } = TEAM_PIN_STYLE[team];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <button
        onClick={onClick}
        disabled={!onClick}
        title={onClick ? `Trocar ${player.name}` : player.name}
        style={{
          width: size,
          height: size,
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontFamily: "'Space Grotesk', Inter, sans-serif",
          fontSize,
          background: gradient,
          boxShadow: `0 6px 13px ${shadowColor}, inset 0 1px 0 rgba(255,255,255,.28)`,
          flex: 'none',
          border: 'none',
          cursor: onClick ? 'pointer' : 'default',
          padding: 0,
        }}
      >
        {player.arrivalOrder}
      </button>
      <span
        style={{
          background: 'rgba(0,0,0,.6)',
          color: '#fff',
          fontSize: labelFontSize,
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
        }}
      >
        {player.name.split(' ')[0]}
      </span>
    </div>
  );
}

interface PitchLinesProps {
  lines: Player[][];
  team: 'azul' | 'laranja';
  axis: 'rows' | 'columns'; // rows = linhas empilhadas verticalmente; columns = linhas lado a lado
  reverse?: boolean; // inverte a ordem das linhas (lado espelhado do campo)
  chipSize: number;
  chipFont: number;
  labelFont: number;
  onPlayerClick?: (player: Player) => void;
}

export function PitchLines({ lines, team, axis, reverse, chipSize, chipFont, labelFont, onPlayerClick }: PitchLinesProps) {
  const ordered = reverse ? [...lines].reverse() : lines;
  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: axis === 'rows' ? 'column' : 'row', justifyContent: 'space-around' }}>
      {ordered.map((line, i) => (
        <div
          key={i}
          style={{ display: 'flex', flexDirection: axis === 'rows' ? 'row' : 'column', justifyContent: 'space-around', alignItems: 'center' }}
        >
          {line.map(player => (
            <Pin
              key={player.id}
              player={player}
              team={team}
              size={chipSize}
              fontSize={chipFont}
              labelFontSize={labelFont}
              onClick={onPlayerClick ? () => onPlayerClick(player) : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
