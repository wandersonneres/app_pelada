import { Modal } from '../ui/Modal';

interface FormatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  playersPerTeam: number;
  onSelect: (n: number) => void;
}

export function FormatSheet({ isOpen, onClose, playersPerTeam, onSelect }: FormatSheetProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Jogadores por time"
      subtitle="Selecione o formato da partida"
      bodyClassName="p-3 space-y-2"
    >
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
    </Modal>
  );
}
