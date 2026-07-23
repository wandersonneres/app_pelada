import { useState } from 'react';
import { Match } from '../../types';
import { GoalScorerModal } from '../GoalScorerModal';

interface GoalButtonProps {
  match: Match;
  which: 'azul' | 'laranja';
  onGoalScored: (teamId: string, scorerId: string, assisterId?: string, ownGoal?: boolean) => void;
  size: 'md' | 'lg';
}

export function GoalButton({ match, which, onGoalScored, size }: GoalButtonProps) {
  const [open, setOpen] = useState(false);
  const teamA = match.teams[0];
  const teamB = match.teams[1];
  const team = which === 'azul' ? teamA : teamB;
  const opponent = which === 'azul' ? teamB : teamA;
  const big = size === 'lg';

  return (
    <>
      <button
        className="gbtn"
        onClick={() => setOpen(true)}
        style={{
          flex: 1,
          justifyContent: 'center',
          border: 'none',
          background: which === 'azul' ? '#24499c' : '#c2560f',
          color: '#fff',
          fontWeight: big ? 700 : 600,
          fontSize: big ? 15 : 14,
          padding: big ? 15 : 13,
          borderRadius: big ? 14 : 12,
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        ⚽ Gol {which === 'azul' ? 'Azul' : 'Laranja'}
      </button>

      {open && (
        <GoalScorerModal
          isOpen={open}
          onClose={() => setOpen(false)}
          team={team}
          opponentTeam={opponent}
          onConfirm={(scorerId, assisterId, ownGoal) => {
            onGoalScored(team.id, scorerId, assisterId, ownGoal);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
