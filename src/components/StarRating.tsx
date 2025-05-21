// import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizes = {
  sm: 24,
  md: 32,
  lg: 40,
};

const getLabel = (level: number) => {
  switch (level) {
    case 1: return "Iniciante";
    case 2: return "Básico";
    case 3: return "Intermediário";
    case 4: return "Avançado";
    case 5: return "Profissional";
    default: return "";
  }
};

export function StarRating({ value, onChange, size = 'md', showLabel = true }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const starSize = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center select-none">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            aria-label={`Selecionar nível ${level}`}
            tabIndex={0}
            onClick={() => onChange(level)}
            onMouseEnter={() => setHoverValue(level)}
            onMouseLeave={() => setHoverValue(null)}
            className="focus:outline-none"
            style={{ background: 'none', border: 'none', padding: 0, lineHeight: 0, cursor: 'pointer' }}
          >
            <svg
              width={starSize}
              height={starSize}
              viewBox="0 0 24 24"
              fill={(hoverValue || value) >= level ? '#facc15' : '#e5e7eb'}
              stroke="#facc15"
              strokeWidth="1"
              className="transition-colors duration-150"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        ))}
      </div>
      {showLabel && (
        <span className="text-sm text-gray-500 mt-1">
          {getLabel(hoverValue || value)}
        </span>
      )}
    </div>
  );
} 