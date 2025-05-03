import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { useState } from 'react';
import { StarIcon } from '@chakra-ui/icons';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StarRating({ value, onChange, size = 'md', showLabel = true }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const getSize = () => {
    switch (size) {
      case 'sm': return '1.5rem';
      case 'md': return '2rem';
      case 'lg': return '2.5rem';
      default: return '2rem';
    }
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

  return (
    <Box>
      <Flex gap={1} justify="center">
        {[1, 2, 3, 4, 5].map((level) => (
          <Box
            key={level}
            as="button"
            onClick={() => onChange(level)}
            onMouseEnter={() => setHoverValue(level)}
            onMouseLeave={() => setHoverValue(null)}
            fontSize={getSize()}
            color={level <= (hoverValue || value) ? "yellow.400" : "gray.300"}
            transition="color 0.2s"
            cursor="pointer"
            type="button"
            p={1}
          >
            <Icon as={StarIcon} boxSize={getSize()} />
          </Box>
        ))}
      </Flex>
      {showLabel && (
        <Text fontSize="sm" color="gray.500" textAlign="center" mt={1}>
          {getLabel(hoverValue || value)}
        </Text>
      )}
    </Box>
  );
} 