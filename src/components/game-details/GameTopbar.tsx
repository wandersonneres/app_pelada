import { ReactNode, useEffect, useRef, useState } from 'react';
import { MoreVertical, Trash2, Pencil } from 'lucide-react';
import { Game } from '../../types';

const STATUS: Record<string, { label: string; dot: string; cls: string }> = {
  waiting: { label: 'Aguardando', dot: '#9a6a10', cls: 'text-state-warning bg-state-warningBg' },
  in_progress: { label: 'Em andamento', dot: '#9e2a3d', cls: 'text-wine bg-wine-tint' },
  finished: { label: 'Finalizada', dot: '#1f6b46', cls: 'text-state-success bg-state-success/10' },
};

interface GameTopbarProps {
  game: Game;
  canManage: boolean;
  onEdit: () => void;
  onToggleFinish: () => void;
  onDelete: () => void;
  /** Conteúdo central (ex.: navegação de seções no tablet). */
  centerContent?: ReactNode;
  /** Move "Editar pelada" para o menu ⋮ (economiza espaço no tablet). */
  editInMenu?: boolean;
}

export function GameTopbar({ game, canManage, onEdit, onToggleFinish, onDelete, centerContent, editInMenu }: GameTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const status = STATUS[game.status] ?? STATUS.waiting;
  const isFinished = game.status === 'finished';

  return (
    <div className="flex-none bg-surface border-b border-line flex items-center gap-3.5 px-4 md:px-[26px]" style={{ height: 66 }}>
      <span className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-semibold flex-none ${status.cls}`}>
        <span className="w-2 h-2 rounded-full" style={{ background: status.dot }} />
        {status.label}
      </span>

      {centerContent && (
        <div className="flex-1 flex justify-center min-w-0 overflow-hidden">{centerContent}</div>
      )}

      {canManage && (
        <div className={`flex items-center gap-2.5 ${centerContent ? 'flex-none' : 'ml-auto'}`}>
          {!editInMenu && (
            <button
              onClick={onEdit}
              className="inline-flex items-center border border-[#ded8c9] bg-surface text-ink-medium text-[12.5px] font-semibold px-[15px] py-[9px] rounded-[10px] hover:bg-paper transition-colors"
            >
              Editar pelada
            </button>
          )}
          <button
            onClick={onToggleFinish}
            className={`inline-flex items-center text-[12.5px] font-semibold px-4 py-[9px] rounded-[10px] transition-colors ${
              isFinished ? 'bg-ink text-white hover:opacity-90' : 'bg-wine text-white hover:bg-wine-dark'
            }`}
          >
            {isFinished ? (editInMenu ? 'Reabrir' : 'Reabrir pelada') : (editInMenu ? 'Finalizar' : 'Finalizar pelada')}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-2 rounded-[10px] border border-[#ded8c9] bg-surface text-ink-medium hover:bg-paper transition-colors"
              aria-label="Mais opções"
            >
              <MoreVertical className="w-[18px] h-[18px]" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-surface border border-line rounded-xl shadow-lg py-1.5 z-50 animate-fade-in">
                {editInMenu && (
                  <button onClick={() => { setMenuOpen(false); onEdit(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-ink-medium hover:bg-paper text-left">
                    <Pencil className="w-4 h-4" /> Editar pelada
                  </button>
                )}
                <button onClick={() => { setMenuOpen(false); onDelete(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-red-600 hover:bg-red-50 text-left">
                  <Trash2 className="w-4 h-4" /> Excluir pelada
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
