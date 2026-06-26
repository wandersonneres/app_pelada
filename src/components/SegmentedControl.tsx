interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
  /** when true, options keep natural width and wrap (good for 4+ options) */
  wrap?: boolean;
  className?: string;
}

/**
 * Modern segmented control — replaces native <select> for small enum fields.
 * Touch-friendly (good on tablet) and visually consistent with the dark design system.
 */
export function SegmentedControl({ value, onChange, options, wrap = false, className = '' }: SegmentedControlProps) {
  return (
    <div
      className={`flex ${wrap ? 'flex-wrap' : ''} gap-1 p-1 rounded-xl bg-surface border border-divider ${className}`}
    >
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`${wrap ? 'flex-1 min-w-[64px]' : 'flex-1'} px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              active
                ? 'bg-team-blue text-white shadow-[0_6px_16px_-8px_rgba(59,130,246,0.8)]'
                : 'text-ink-muted hover:text-heading hover:bg-surface-hover'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
