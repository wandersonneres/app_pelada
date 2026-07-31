import { Game, Match } from '../../types';

interface WaitingPanelProps {
  game: Game;
  match: Match;
  canManage: boolean;
  onOpenWaitingList: () => void;
}

const POS_LABEL: Record<string, string> = { defesa: 'DEF', meio: 'MEI', ataque: 'ATA' };
const POS_HEX: Record<string, string> = { defesa: '#d99a1a', meio: '#0d7a72', ataque: '#c2560f' };

// Painel "Espera" (4ª coluna do desktop).
// - Partida ao vivo: fila atual (game.waitingList).
// - Partida finalizada: banco daquela partida (quem não estava em campo), por ordem de chegada.
export function WaitingPanel({ game, match, canManage, onOpenWaitingList }: WaitingPanelProps) {
  const finished = match.status === 'finished';
  let waiting: Game['players'];
  if (finished && match.waitingList && match.waitingList.length > 0) {
    // Ordem exata da fila no momento em que a partida foi gerada (snapshot).
    waiting = match.waitingList
      .map(id => game.players.find(p => p.id === id))
      .filter(Boolean) as Game['players'];
  } else if (finished) {
    // Fallback para partidas antigas sem snapshot: banco por ordem de chegada.
    waiting = [...game.players]
      .filter(p => !match.teams.some(t => t.players.some(pl => pl.id === p.id)))
      .sort((a, b) => a.arrivalOrder - b.arrivalOrder);
  } else {
    waiting = (game.waitingList || [])
      .map(id => game.players.find(p => p.id === id))
      .filter(Boolean) as Game['players'];
  }

  return (
    <div style={{ flex: '0.8 1 0', minWidth: 208, maxWidth: 300, background: '#fff', border: '1px solid #e6e1d4', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '14px 15px', borderBottom: '1px solid #efe9dc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 13.5 }}>Espera</span>
        <span style={{ background: '#f3e5e8', color: '#6e1a28', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{waiting.length}</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 9, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {waiting.length === 0 && (
          <div style={{ fontSize: 12, color: '#8b8578', textAlign: 'center', padding: '16px 4px' }}>Ninguém na espera.</div>
        )}
        {waiting.map((p, i) => (
          <button
            key={p.id}
            onClick={onOpenWaitingList}
            className="plr"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', border: '1px solid #f0eadd', borderRadius: 10, background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#c8c1b0', width: 12, flex: 'none' }}>{i + 1}</span>
            <span className="chip" style={{ width: 26, height: 26, borderRadius: 999, background: '#262319', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{p.arrivalOrder}</span>
            <span style={{ fontSize: 12, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
            <span className="pos" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: "800 9px Inter, sans-serif", letterSpacing: '.04em', textTransform: 'uppercase', color: '#5c5647', background: '#ece5d6', padding: '3px 7px 3px 6px', borderRadius: 6, flex: 'none' }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: POS_HEX[p.position], flex: 'none' }} />
              {POS_LABEL[p.position]}
            </span>
          </button>
        ))}
      </div>

      <div style={{ padding: 10, borderTop: '1px solid #efe9dc' }}>
        <div style={{ background: '#faf8f2', border: '1px dashed #d9d2c2', borderRadius: 11, padding: 10, textAlign: 'center', fontSize: 11, color: '#8b8578' }}>
          {finished ? 'Toque para ver quem saiu e entrou' : 'Perdedor entra na fila · vencedor continua'}
        </div>
      </div>
    </div>
  );
}
