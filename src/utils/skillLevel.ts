import { IconType } from 'react-icons';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

export const getSkillLevelIcon = (level: number): IconType => {
  switch (level) {
    case 1:
      return FaStar;
    case 2:
      return FaStar;
    case 3:
      return FaStar;
    case 4:
      return FaStar;
    case 5:
      return FaStar;
    default:
      return FaStar;
  }
};

export const getSkillLevelColor = (level: number): string => {
  switch (level) {
    case 1:
      return 'gray.400';
    case 2:
      return 'yellow.400';
    case 3:
      return 'orange.400';
    case 4:
      return 'red.400';
    case 5:
      return 'purple.400';
    default:
      return 'gray.400';
  }
};

export const getSkillLevelLabel = (level: number): string => {
  switch (level) {
    case 1:
      return 'Iniciante';
    case 2:
      return 'Intermediário';
    case 3:
      return 'Avançado';
    case 4:
      return 'Profissional';
    case 5:
      return 'Elite';
    default:
      return 'Desconhecido';
  }
}; 