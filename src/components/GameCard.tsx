import { Box, Card, CardBody, Flex, Heading, Text, Badge, Icon, VStack, Button, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Game } from '../types';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaEdit, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from '@chakra-ui/react';

interface GameCardProps {
  game: Game & {
    date: Date | { seconds: number; nanoseconds: number };
  };
  onGameUpdate?: () => void;
}

export function GameCard({ game, onGameUpdate }: GameCardProps) {
  const navigate = useNavigate();
  const toast = useToast();

  const getStatusColor = (status: Game['status']) => {
    switch (status) {
      case 'waiting':
        return 'yellow';
      case 'in_progress':
        return 'green';
      case 'finished':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: Game['status']) => {
    switch (status) {
      case 'waiting':
        return 'Aguardando jogadores';
      case 'in_progress':
        return 'Em andamento';
      case 'finished':
        return 'Finalizado';
      default:
        return 'Desconhecido';
    }
  };

  const handleClick = () => {
    navigate(`/game/${game.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/game/${game.id}/edit`);
  };

  const handleFinish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'games', game.id), {
        status: 'finished',
        updatedAt: new Date()
      });

      toast({
        title: 'Pelada finalizada!',
        description: 'A pelada foi finalizada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onGameUpdate) {
        onGameUpdate();
      }
    } catch (error) {
      console.error('Erro ao finalizar pelada:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao finalizar a pelada.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Card onClick={handleClick} cursor="pointer">
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Flex justify="space-between" align="center">
            <Heading size="md">
              {(() => {
                const date = game.date instanceof Date 
                  ? game.date 
                  : new Date((game.date as any).seconds * 1000);
                return format(date, "dd/MM/yyyy", { locale: ptBR });
              })()}
            </Heading>
            <Badge colorScheme={getStatusColor(game.status)}>
              {getStatusText(game.status)}
            </Badge>
          </Flex>

          <Box>
            <Flex align="center" mb={2}>
              <Icon as={FaMapMarkerAlt} mr={2} />
              <Text>{game.location}</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaUsers} mr={2} />
              <Text>
                {game.players.length} / {game.maxPlayers} jogadores
              </Text>
            </Flex>
          </Box>

          {game.observations && (
            <Text fontSize="sm" color="gray.600">
              {game.observations}
            </Text>
          )}

          <HStack spacing={2} justify="flex-end">
            <Button
              leftIcon={<FaEdit />}
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={handleEdit}
            >
              Editar
            </Button>
            {game.status !== 'finished' && (
              <Button
                leftIcon={<FaCheck />}
                size="sm"
                colorScheme="green"
                variant="outline"
                onClick={handleFinish}
              >
                Finalizar
              </Button>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
} 