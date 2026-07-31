import { Match, Player, Team } from '../../types';
import { TeamRosterList } from './TeamRosterList';
import { average, calculateTeamScore, getAgeValue } from './teamStats';

interface RosterPanelProps {
  team: Team;
  match: Match;
  teamKey: 'azul' | 'laranja';
  canSwap: boolean;
  onSwapClick: (player: Player) => void;
  variant: 'desktop' | 'tablet';
  side: 'left' | 'right';
}

const TEAM_COLOR: Record<'azul' | 'laranja', { dot: string; text: string }> = {
  azul: { dot: '#24499c', text: '#1c3576' },
  laranja: { dot: '#c2560f', text: '#9e440a' },
};

export function RosterPanel({ team, match, teamKey, canSwap, onSwapClick, variant, side }: RosterPanelProps) {
  const players = team.players || [];
  const avgSkill = average(players.map(p => p.skillLevel));
  const avgAge = average(players.map(p => getAgeValue(p.ageGroup)));
  const score = calculateTeamScore(players);
  const color = TEAM_COLOR[teamKey];

  const containerStyle: React.CSSProperties =
    variant === 'desktop'
      ? { flex: '1 1 0', minWidth: 232, maxWidth: 316, background: '#fff', border: '1px solid #e6e1d4', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
      : side === 'left'
        ? {
            width: 236,
            flex: 'none',
            background: '#fff',
            borderRight: '1px solid #e6e1d4',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }
        : {
            // Coluna direita (tablet): preenche a altura para empurrar os botões ao rodapé.
            flex: 1,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          };

  return (
    <div style={containerStyle}>
      <div style={{ padding: variant === 'desktop' ? '14px 16px' : '13px 15px 10px', borderBottom: '1px solid #efe9dc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: variant === 'desktop' ? 8 : 7 }}>
          <span style={{ width: variant === 'desktop' ? 11 : 10, height: variant === 'desktop' ? 11 : 10, borderRadius: 3, background: color.dot, flex: 'none' }} />
          <span style={{ fontWeight: 700, fontSize: variant === 'desktop' ? 14 : 13.5, color: color.text }}>{team.name}</span>
          {variant === 'desktop' && (
            <span style={{ marginLeft: 'auto', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: color.text }}>
              {team.score ?? 0}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: variant === 'desktop' ? 8 : 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: color.text, background: teamKey === 'azul' ? '#eef1fa' : '#f8efe4', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>
            Score {score.toFixed(1)}
          </span>
          <span style={{ fontSize: 10, color: teamKey === 'azul' ? '#1c3576' : '#9e440a', background: teamKey === 'azul' ? '#eef1fa' : '#f8efe4', padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>
            Skill {avgSkill.toFixed(1)}
          </span>
          <span style={{ fontSize: 10, color: '#8b8578', background: '#f4f0ea', padding: '2px 7px', borderRadius: 6 }}>
            Idade {Math.round(avgAge)}
          </span>
        </div>
      </div>
      <TeamRosterList
        team={team}
        match={match}
        teamKey={teamKey}
        canSwap={canSwap}
        onSwapClick={onSwapClick}
        chipSize={variant === 'desktop' ? 28 : 26}
        fontSize={variant === 'desktop' ? 13 : 12.5}
      />
    </div>
  );
}
