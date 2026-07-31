import { ArrowLeftRight } from 'lucide-react';
import { Match, Player, Team } from '../../types';

interface TeamRosterListProps {
  team: Team;
  match: Match;
  teamKey: 'azul' | 'laranja';
  canSwap: boolean;
  onSwapClick: (player: Player) => void;
  chipSize?: number;
  fontSize?: number;
}

const POSITION_LABEL: Record<string, string> = { defesa: 'DEF', meio: 'MEI', ataque: 'ATA' };
const POSITION_DOT: Record<string, string> = { defesa: '#d99a1a', meio: '#0d7a72', ataque: '#c2560f' };
const TEAM_SOLID: Record<'azul' | 'laranja', string> = { azul: '#24499c', laranja: '#c2560f' };
const POS_ORDER: Record<string, number> = { defesa: 1, meio: 2, ataque: 3 };

export function TeamRosterList({ team, match, teamKey, canSwap, onSwapClick, chipSize = 26, fontSize = 12.5 }: TeamRosterListProps) {
  // Ordena por posição (DEF → MEI → ATA) e, dentro da posição, por ordem de chegada.
  const players = [...(team.players || [])].sort((a, b) => {
    const d = (POS_ORDER[a.position] ?? 9) - (POS_ORDER[b.position] ?? 9);
    return d !== 0 ? d : a.arrivalOrder - b.arrivalOrder;
  });

  const getStats = (playerId: string) => {
    const goals = match.goals?.filter(g => g.scorerId === playerId && !g.ownGoal).length || 0;
    const assists = match.goals?.filter(g => g.assisterId === playerId).length || 0;
    return { goals, assists };
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 6 }}>
      {players.map(player => {
        const stats = getStats(player.id);
        return (
          <div
            key={player.id}
            className="plr"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 9 }}
          >
            <span
              style={{
                width: chipSize,
                height: chipSize,
                borderRadius: '999px',
                background: TEAM_SOLID[teamKey],
                color: '#fff',
                fontFamily: "'Space Grotesk', Inter, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              {player.arrivalOrder}
            </span>
            <span className="pos">
              <span className="dot" style={{ background: POSITION_DOT[player.position] }} />
              {POSITION_LABEL[player.position]}
            </span>
            <span style={{ fontSize, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {player.name}
            </span>
            {stats.goals > 0 && (
              <span style={{ fontSize: 10, color: TEAM_SOLID[teamKey], fontWeight: 600, flex: 'none' }}>⚽{stats.goals}</span>
            )}
            {stats.assists > 0 && (
              <span style={{ fontSize: 10, color: '#1f6b46', fontWeight: 600, flex: 'none' }}>👟{stats.assists}</span>
            )}
            {canSwap && (
              <button
                onClick={() => onSwapClick(player)}
                title="Trocar"
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#a6a093', flex: 'none', display: 'flex' }}
              >
                <ArrowLeftRight className="w-[15px] h-[15px]" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
