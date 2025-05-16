import { Game, convertTimestampToDate } from '../types';
import { Timestamp } from 'firebase/firestore';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Text, Badge, IconButton } from '@chakra-ui/react';

interface GameCardProps {
  game: Game;
  onDelete?: (gameId: string) => void;
}

export function GameCard({ game, onDelete }: GameCardProps) {
  const navigate = useNavigate();

  const formatDate = (date: Date | Timestamp) => {
    return convertTimestampToDate(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
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
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
      cursor="pointer"
      onClick={() => navigate(`/game/${game.id}`)}
    >
      <Flex p={4} direction="column" gap={2}>
        <Flex justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold">
            {game.field.name}
          </Text>
          <Badge
            colorScheme={game.status === 'in_progress' ? 'green' : 'gray'}
            px={2}
            py={1}
            borderRadius="full"
          >
            {game.status === 'in_progress' ? 'Em andamento' : 'Finalizada'}
          </Badge>
        </Flex>

        <Flex direction="column" gap={1}>
          <Flex align="center" gap={2}>
            <Text fontSize="sm" color="gray.600">
              {formatDate(game.date)}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {formatTime(game.time)}
            </Text>
          </Flex>
          <Text fontSize="sm" color="gray.600">
            {game.teams.team1.players.length + game.teams.team2.players.length} jogadores
          </Text>
        </Flex>
      </Flex>

      {onDelete && (
        <Flex justify="flex-end" p={2} borderTopWidth="1px" borderColor="gray.100">
          <IconButton
            aria-label="Excluir pelada"
            icon={<FaTrash />}
            colorScheme="red"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(game.id);
            }}
          />
        </Flex>
      )}
    </Box>
  );
} 