import { useState } from 'react';
import { Swords } from 'lucide-react';
import { FormatSheet } from './FormatSheet';

interface EmptyMatchesProps {
  playersCount: number;
  playersPerTeam: number;
  setPlayersPerTeam: (n: number) => void;
  isGeneratingTeams: boolean;
  generateTeams: () => void;
  canManage: boolean;
}

export function EmptyMatches({
  playersCount,
  playersPerTeam,
  setPlayersPerTeam,
  isGeneratingTeams,
  generateTeams,
  canManage,
}: EmptyMatchesProps) {
  const [formatOpen, setFormatOpen] = useState(false);
  const needed = playersPerTeam * 2;
  const enough = playersCount >= needed;

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="bg-surface border border-line rounded-2xl p-8 w-full max-w-md text-center flex flex-col items-center gap-4">
        <span className="w-14 h-14 rounded-2xl bg-wine-tint text-wine flex items-center justify-center">
          <Swords className="w-7 h-7" />
        </span>
        <div>
          <div className="font-heading font-extrabold text-[20px] text-ink">Nenhuma partida ainda</div>
          <p className="text-[13px] text-ink-soft mt-1">
            {canManage
              ? 'Escolha o formato e gere a primeira partida — times equilibrados por skill + lista de espera.'
              : 'Aguarde o organizador gerar a primeira partida.'}
          </p>
        </div>

        {canManage && (
          <>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[13px] font-semibold text-ink-medium">Formato</span>
              <button
                onClick={() => setFormatOpen(true)}
                className="border border-[#ded8c9] rounded-[10px] px-3.5 py-2 text-[14px] font-bold text-ink bg-surface hover:bg-paper transition-colors"
              >
                {playersPerTeam}×{playersPerTeam} ▾
              </button>
            </div>

            <div
              className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-lg ${
                enough ? 'text-state-success bg-state-success/10' : 'text-state-warning bg-state-warningBg'
              }`}
            >
              {enough
                ? `${playersCount} jogadores confirmados`
                : `Faltam jogadores — ${needed} necessários (${playersCount} confirmados)`}
            </div>

            <button
              onClick={generateTeams}
              disabled={!enough || isGeneratingTeams}
              className="w-full bg-wine text-white font-semibold text-[14px] py-3 rounded-xl hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingTeams ? 'Gerando...' : 'Gerar primeira partida'}
            </button>
          </>
        )}
      </div>

      <FormatSheet
        isOpen={formatOpen}
        onClose={() => setFormatOpen(false)}
        playersPerTeam={playersPerTeam}
        onSelect={n => { setPlayersPerTeam(n); setFormatOpen(false); }}
      />
    </div>
  );
}
