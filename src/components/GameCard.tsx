import {
  Box,
  Text,
  Badge,
  Flex,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onDelete: (id: string) => void;
}

export function GameCard({ game, onDelete }: GameCardProps) {
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'yellow';
      case 'in_progress':
        return 'blue';
      case 'finished':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Aguardando';
      case 'in_progress':
        return 'Em andamento';
      case 'finished':
        return 'Finalizado';
      default:
        return status;
    }
  };

  return (
    <Box
      p={4}
      bg={bg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontWeight="bold" fontSize="lg">
          {formatDate(game.date)}
        </Text>
        <Badge colorScheme={getStatusColor(game.status)}>
          {getStatusText(game.status)}
        </Badge>
      </Flex>

      <Flex align="center" mb={2}>
        <FaMapMarkerAlt style={{ marginRight: '8px' }} />
        <Text>{game.location}</Text>
      </Flex>

      <Flex align="center" mb={4}>
        <FaUsers style={{ marginRight: '8px' }} />
        <Text>
          {game.players.length} / {game.maxPlayers} jogadores
        </Text>
      </Flex>

      <Flex justify="flex-end" gap={2}>
        <IconButton
          aria-label="Editar pelada"
          icon={<FaEdit />}
          colorScheme="blue"
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/game/${game.id}/edit`)}
        />
        <IconButton
          aria-label="Excluir pelada"
          icon={<FaTrash />}
          colorScheme="red"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(game.id)}
        />
      </Flex>
    </Box>
  );
} 