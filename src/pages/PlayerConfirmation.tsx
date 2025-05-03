import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  useToast,
  Avatar,
  Flex,
  Badge,
  Select,
} from '@chakra-ui/react';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game, Player, convertTimestampToDate } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { getSkillLevelIcon } from '../utils/skillLevel';

export function PlayerConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerSkillLevel, setPlayerSkillLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [playerAgeGroup, setPlayerAgeGroup] = useState<'15-20' | '21-30' | '31-40' | '41-50' | '+50'>('21-30');
  const toast = useToast();

  const handleStarClick = useCallback((level: number) => {
    setPlayerSkillLevel(level as 1 | 2 | 3 | 4 | 5);
  }, []);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, 'games', id), (doc) => {
      if (doc.exists()) {
        setGame({ id: doc.id, ...doc.data() } as Game);
      }
    });

    return () => unsubscribe();
  }, [id]);

  const handleConfirm = async () => {
    if (!game || !id || !playerName.trim()) return;

    try {
      const newPlayer: Player = {
        id: Math.random().toString(36).substr(2, 9),
        name: playerName.trim(),
        email: '',
        confirmed: true,
        arrivalTime: new Date(),
        position: 'meio',
        arrivalOrder: game.players.length + 1,
        skillLevel: playerSkillLevel,
        ageGroup: playerAgeGroup,
      };

      await updateDoc(doc(db, 'games', id), {
        players: arrayUnion(newPlayer),
        updatedAt: new Date(),
      });

      setPlayerName('');
      setPlayerSkillLevel(3);
      setPlayerAgeGroup('21-30');
      toast({
        title: 'Presença confirmada!',
        description: 'Sua presença foi confirmada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao confirmar sua presença.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!game) {
    return (
      <Container maxW="container.md" py={8}>
        <Text>Carregando...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg">
            {format(convertTimestampToDate(game.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </Heading>
          <Text fontSize="xl" color="gray.600">
            {game.location}
          </Text>
          <Badge colorScheme={game.status === 'waiting' ? 'yellow' : game.status === 'in_progress' ? 'green' : 'gray'}>
            {game.status === 'waiting' ? 'Aguardando jogadores' : game.status === 'in_progress' ? 'Em andamento' : 'Finalizado'}
          </Badge>
        </Box>

        <Box>
          <Text fontSize="lg" mb={4}>
            {game.players.length} / {game.maxPlayers} jogadores confirmados
          </Text>

          <FormControl mb={4}>
            <FormLabel>Seu nome</FormLabel>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Digite seu nome"
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Nível de Habilidade</FormLabel>
            <Flex gap={1} justify="center">
              {[1, 2, 3, 4, 5].map((level) => (
                <Box
                  key={level}
                  as="button"
                  onClick={() => handleStarClick(level)}
                  fontSize="2xl"
                  color={playerSkillLevel >= level ? "yellow.400" : "gray.300"}
                  _hover={{ color: "yellow.400" }}
                  transition="color 0.2s"
                  cursor="pointer"
                >
                  ⭐
                </Box>
              ))}
            </Flex>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Faixa Etária</FormLabel>
            <Select
              value={playerAgeGroup}
              onChange={(e) => setPlayerAgeGroup(e.target.value as '15-20' | '21-30' | '31-40' | '41-50' | '+50')}
            >
              <option value="15-20">15-20 anos</option>
              <option value="21-30">21-30 anos</option>
              <option value="31-40">31-40 anos</option>
              <option value="41-50">41-50 anos</option>
              <option value="+50">+50 anos</option>
            </Select>
          </FormControl>

          <Button
            colorScheme="green"
            onClick={handleConfirm}
            isDisabled={!playerName.trim() || game.players.length >= game.maxPlayers}
            leftIcon={<FaCheck />}
            width="full"
          >
            Confirmar Presença
          </Button>
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            Jogadores Confirmados
          </Heading>
          <VStack spacing={4} align="stretch">
            {game.players.map((player) => (
              <Flex
                key={player.id}
                align="center"
                p={4}
                borderWidth={1}
                borderRadius="md"
                bg="white"
                _dark={{ bg: 'gray.700' }}
              >
                <Avatar name={player.name} mr={4} />
                <Box flex={1}>
                  <Text fontWeight="bold">{player.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    Confirmado em {format(convertTimestampToDate(player.arrivalTime!), 'HH:mm', { locale: ptBR })}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Nível: {'⭐'.repeat(player.skillLevel)}
                  </Text>
                </Box>
                <Badge colorScheme={player.confirmed ? 'green' : 'red'}>
                  {player.confirmed ? <FaCheck /> : <FaTimes />}
                </Badge>
              </Flex>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 