import { BarChart2, LayoutGrid, Swords, Users } from 'lucide-react';
import { useViewport } from '../../hooks/useViewport';

export type GameSection = 'resumo' | 'jogadores' | 'partidas' | 'analises';

interface SectionNavProps {
  active: GameSection;
  onChange: (section: GameSection) => void;
}

const ITEMS: { key: GameSection; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'resumo', label: 'Resumo', icon: LayoutGrid },
  { key: 'jogadores', label: 'Jogadores', icon: Users },
  { key: 'partidas', label: 'Partidas', icon: Swords },
  { key: 'analises', label: 'Análises', icon: BarChart2 },
];

export function SectionNav({ active, onChange }: SectionNavProps) {
  const viewport = useViewport();

  if (viewport === 'tablet') {
    return (
      <div className="flex justify-center">
        <div className="inline-flex gap-1 bg-line-soft rounded-xl p-1">
          {ITEMS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                active === key ? 'bg-surface text-ink shadow-sm' : 'text-ink-medium hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-line flex">
      {ITEMS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
            active === key ? 'text-wine' : 'text-ink-icon'
          }`}
        >
          <Icon className="w-5 h-5" />
          {label}
        </button>
      ))}
    </nav>
  );
}
