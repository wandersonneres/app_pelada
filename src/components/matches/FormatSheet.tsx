interface FormatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  playersPerTeam: number;
  onSelect: (n: number) => void;
}

export function FormatSheet({ isOpen, onClose, playersPerTeam, onSelect }: FormatSheetProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-line-soft">
          <div>
            <div className="font-bold text-base text-ink">Jogadores por time</div>
            <div className="text-xs text-ink-soft">Selecione o formato da partida</div>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-ink-icon hover:text-ink hover:bg-paper text-xl font-bold" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-3 space-y-2">
          {[4, 5, 6, 7, 8, 9, 10].map(n => (
            <button
              key={n}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition text-left ${
                playersPerTeam === n ? 'bg-wine text-white' : 'bg-paper hover:bg-wine-tint text-ink'
              }`}
              onClick={() => onSelect(n)}
            >
              <span className="font-semibold text-base">{n}x{n}</span>
              <span className={`text-xs ${playersPerTeam === n ? 'text-white/70' : 'text-ink-soft'}`}>{n * 2} jogadores em campo</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
