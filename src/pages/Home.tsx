import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  useToast,
  Spinner,
  Center,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from '@chakra-ui/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game, convertTimestampToDate } from '../types';
import { FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaEye } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const q = query(
      collection(db, 'games'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const gamesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestampToDate(doc.data().date),
        createdAt: convertTimestampToDate(doc.data().createdAt),
        updatedAt: convertTimestampToDate(doc.data().updatedAt),
      })) as Game[];

      setGames(gamesData);
      setIsLoading(false);
    }, (error) => {
      console.error('Erro ao carregar jogos:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao carregar os jogos.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM", { locale: ptBR });
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

  const activeGames = games.filter(game => game.status !== 'finished');
  const allGames = games;

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={{ base: 2, md: 8 }} px={{ base: 2, md: 6 }}>
      <Flex 
        justify="space-between" 
        align="center" 
        mb={{ base: 4, md: 8 }}
        flexDir={{ base: 'column', sm: 'row' }}
        gap={{ base: 4, sm: 0 }}
      >
        <Box textAlign={{ base: 'center', sm: 'left' }} w={{ base: 'full', sm: 'auto' }}>
          <Heading size={{ base: 'md', md: 'lg' }}>Peladas</Heading>
          <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Cadastre e gerencie suas peladas</Text>
        </Box>
        <Button
          leftIcon={<FaPlus />}
          colorScheme="blue"
          onClick={() => navigate('/new-game')}
          size={{ base: 'md', md: 'lg' }}
          w={{ base: 'full', sm: 'auto' }}
        >
          Nova Pelada
        </Button>
      </Flex>

      {activeGames.length > 0 && (
        <>
          <Heading size={{ base: 'sm', md: 'md' }} mb={4}>Peladas Ativas</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 3, md: 6 }} mb={6}>
            {activeGames.map((game) => (
              <Card 
                key={game.id} 
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{ shadow: 'md' }}
                transition="all 0.2s"
                cursor="pointer"
                onClick={() => navigate(`/game/${game.id}`)}
              >
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <Badge
                      colorScheme={getStatusColor(game.status)}
                      fontSize={{ base: 'xs', md: 'sm' }}
                    >
                      {getStatusText(game.status)}
                    </Badge>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                      {game.players?.length || 0} / {game.maxPlayers} jogadores
                    </Text>
                  </Flex>
                </CardHeader>

                <CardBody py={2}>
                  <Flex direction="column" gap={2}>
                    <Flex align="center">
                      <FaCalendarAlt style={{ marginRight: '8px', color: '#3182CE' }} />
                      <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{formatDate(convertTimestampToDate(game.date))}</Text>
                    </Flex>

                    <Flex align="center">
                      <FaMapMarkerAlt style={{ marginRight: '8px', color: '#38A169' }} />
                      <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>{game.location}</Text>
                    </Flex>

                    {game.observations && (
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" noOfLines={2}>
                        {game.observations}
                      </Text>
                    )}
                  </Flex>
                </CardBody>

                <Divider />

                <CardFooter py={2}>
                  <Button
                    variant="ghost"
                    colorScheme="blue"
                    size={{ base: 'xs', md: 'sm' }}
                    width="full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/game/${game.id}`);
                    }}
                  >
                    Ver Detalhes
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}

      <Heading size={{ base: 'sm', md: 'md' }} mb={4}>Todas as Peladas</Heading>
      <Box overflowX="auto" mb={4}>
        <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
          <Thead>
            <Tr>
              <Th>Data</Th>
              <Th>Local</Th>
              <Th>Status</Th>
              <Th>Jogadores</Th>
              <Th>Partidas</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {allGames.map((game) => (
              <Tr key={game.id} _hover={{ bg: 'gray.50' }} cursor="pointer" onClick={() => navigate(`/game/${game.id}`)}>
                <Td fontSize={{ base: 'xs', md: 'sm' }}>{formatDate(convertTimestampToDate(game.date))}</Td>
                <Td fontSize={{ base: 'xs', md: 'sm' }}>{game.location}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(game.status)} fontSize={{ base: 'xs', md: 'sm' }}>
                    {getStatusText(game.status)}
                  </Badge>
                </Td>
                <Td fontSize={{ base: 'xs', md: 'sm' }}>{game.players?.length || 0} / {game.maxPlayers}</Td>
                <Td fontSize={{ base: 'xs', md: 'sm' }}>{game.matches?.length || 0}</Td>
                <Td>
                  <IconButton
                    aria-label="Ver detalhes"
                    icon={<FaEye />}
                    size={{ base: 'xs', md: 'sm' }}
                    colorScheme="blue"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/game/${game.id}`);
                    }}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {games.length === 0 && (
        <Center py={8}>
          <Box textAlign="center">
            <Text color="gray.500" mb={4} fontSize={{ base: 'sm', md: 'md' }}>
              Nenhuma pelada encontrada
            </Text>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="blue"
              onClick={() => navigate('/new-game')}
              size={{ base: 'md', md: 'lg' }}
              w={{ base: 'full', sm: 'auto' }}
            >
              Criar Primeira Pelada
            </Button>
          </Box>
        </Center>
      )}
    </Container>
  );
} 