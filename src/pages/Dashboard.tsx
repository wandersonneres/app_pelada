import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game } from '../types';
import { GameCard } from '../components/GameCard';

export function Dashboard() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const bg = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    const q = query(
      collection(db, 'games'),
      where('date', '>=', new Date()),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gamesList: Game[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        gamesList.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Game);
      });
      setGames(gamesList);
    });

    return () => unsubscribe();
  }, []);

  const handleNewGame = () => {
    navigate('/new-game');
  };

  return (
    <Box minH="100vh" bg={bg}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Heading>Minhas Peladas</Heading>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={handleNewGame}
            >
              Nova Pelada
            </Button>
          </Box>

          {games.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              Nenhuma pelada agendada. Crie uma nova pelada!
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onGameUpdate={() => {
                    // A atualização é automática através do onSnapshot
                  }}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
} 