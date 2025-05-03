import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Avatar,
  IconButton,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
  Card,
  CardBody,
  Select,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Icon,
} from '@chakra-ui/react';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game, Team, Player, Match, convertTimestampToDate } from '../types';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaUserPlus, FaRandom, FaTrophy, FaTrash, FaExchangeAlt, FaEdit, FaCheck, FaEye, FaEllipsisV, FaFutbol, FaMedal, FaRunning } from 'react-icons/fa';
import { PlayerOptionsModal } from '../components/PlayerOptionsModal';
import { PlayerSwapModal } from '../components/PlayerSwapModal';
import { StarIcon } from '@chakra-ui/icons';
import { StarRating } from '../components/StarRating';
import { TacticalView } from '../components/TacticalView';
import { MatchTimer } from '../components/MatchTimer';
import { PlayerList } from '../components/PlayerList';
import { GameAnalytics } from '../components/GameAnalytics';
import { MatchScore } from '../components/MatchScore';
import { generateRandomPlayers } from '../utils/mockPlayers';

const AddPlayerModal = memo(({ 
  isOpen, 
  onClose, 
  onAddPlayer, 
  isJoining 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAddPlayer: (name: string, position: 'defesa' | 'meio' | 'ataque', skillLevel: 1 | 2 | 3 | 4 | 5, ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50') => void; 
  isJoining: boolean;
}) => {
  const [playerName, setPlayerName] = useState('');
  const [playerPosition, setPlayerPosition] = useState<'defesa' | 'meio' | 'ataque'>('meio');
  const [playerSkillLevel, setPlayerSkillLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [playerAgeGroup, setPlayerAgeGroup] = useState<'15-20' | '21-30' | '31-40' | '41-50' | '+50'>('21-30');

  const handleStarClick = useCallback((level: number) => {
    setPlayerSkillLevel(level as 1 | 2 | 3 | 4 | 5);
  }, []);

  const handleSubmit = useCallback(() => {
    if (playerName.trim()) {
      onAddPlayer(playerName.trim(), playerPosition, playerSkillLevel, playerAgeGroup);
      setPlayerName('');
      setPlayerPosition('meio');
      setPlayerSkillLevel(3);
      setPlayerAgeGroup('21-30');
    }
  }, [playerName, playerPosition, playerSkillLevel, playerAgeGroup, onAddPlayer]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Adicionar Jogador</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Nome do Jogador</FormLabel>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Digite o nome do jogador"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Posição</FormLabel>
              <SimpleGrid columns={3} spacing={2}>
                <Button
                  onClick={() => setPlayerPosition('defesa')}
                  colorScheme={playerPosition === 'defesa' ? 'yellow' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  Defesa
                </Button>
                <Button
                  onClick={() => setPlayerPosition('meio')}
                  colorScheme={playerPosition === 'meio' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  Meio
                </Button>
                <Button
                  onClick={() => setPlayerPosition('ataque')}
                  colorScheme={playerPosition === 'ataque' ? 'red' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  Ataque
                </Button>
              </SimpleGrid>
            </FormControl>

            <FormControl>
              <FormLabel>Nível de Habilidade</FormLabel>
              <StarRating
                value={playerSkillLevel}
                onChange={handleStarClick}
                size="md"
                showLabel={true}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Faixa Etária</FormLabel>
              <SimpleGrid columns={2} spacing={2}>
                <Button
                  onClick={() => setPlayerAgeGroup('15-20')}
                  colorScheme={playerAgeGroup === '15-20' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  15-20 anos
                </Button>
                <Button
                  onClick={() => setPlayerAgeGroup('21-30')}
                  colorScheme={playerAgeGroup === '21-30' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  21-30 anos
                </Button>
                <Button
                  onClick={() => setPlayerAgeGroup('31-40')}
                  colorScheme={playerAgeGroup === '31-40' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  31-40 anos
                </Button>
                <Button
                  onClick={() => setPlayerAgeGroup('41-50')}
                  colorScheme={playerAgeGroup === '41-50' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  41-50 anos
                </Button>
                <Button
                  onClick={() => setPlayerAgeGroup('+50')}
                  colorScheme={playerAgeGroup === '+50' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  +50 anos
                </Button>
              </SimpleGrid>
            </FormControl>

            <Flex justify="flex-end" width="full">
              <Button
                colorScheme="blue"
                mr={3}
                onClick={handleSubmit}
                isLoading={isJoining}
                isDisabled={!playerName.trim()}
              >
                Adicionar
              </Button>
              <Button onClick={onClose}>Cancelar</Button>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerPosition, setPlayerPosition] = useState<'defesa' | 'meio' | 'ataque'>('meio');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const { isOpen: isWaitingListOpen, onOpen: onWaitingListOpen, onClose: onWaitingListClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMatchForSwap, setSelectedMatchForSwap] = useState<Match | null>(null);
  const [isPlayerOptionsOpen, setIsPlayerOptionsOpen] = useState(false);
  const [isPlayerSwapOpen, setIsPlayerSwapOpen] = useState(false);

  // Função para contar partidas consecutivas sem ir para lista de espera
  const getConsecutiveMatchesWithoutBreak = (playerId: string) => {
    if (!game || !game.matches) return 0;
    
    let consecutiveCount = 0;
    let foundBreak = false;

    // Percorre as partidas de trás para frente
    for (let i = game.matches.length - 1; i >= 0; i--) {
      const match = game.matches[i];
      const playerInMatch = match.teams.some(team => 
        team.players.some(p => p.id === playerId)
      );

      // Se o jogador está na partida atual
      if (playerInMatch) {
        // Se já encontrou uma quebra antes, para de contar
        if (foundBreak) break;
        consecutiveCount++;
      } else {
        // Se o jogador não está na partida atual, verifica se tem próxima partida
        const nextMatch = game.matches[i + 1];
        
        // Se não tem próxima partida ou o jogador não está nela,
        // então ele realmente ficou uma partida fora e quebramos a sequência
        if (!nextMatch || !nextMatch.teams.some(team => 
          team.players.some(p => p.id === playerId)
        )) {
          foundBreak = true;
        }
        // Se tem próxima partida e o jogador está nela, continuamos contando
      }
    }

    return consecutiveCount;
  };

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }


    const unsubscribe = onSnapshot(
      doc(db, 'games', id),
      (doc) => {
        
        if (doc.exists()) {
          const data = doc.data();
          
          const gameData = {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            players: data.players || [],
            matches: data.matches || [],
          } as Game;
          
          setGame(gameData);
        } else {
          
          toast({
            title: 'Erro',
            description: 'Jogo não encontrado.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          navigate('/');
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar jogo:', error);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao carregar o jogo.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, navigate, toast]);

  const formatDate = (date: Date | Timestamp) => {
    return convertTimestampToDate(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatArrivalTime = (date: Date | Timestamp | undefined) => {
    if (!date) return '--:--';
    try {
      const d = convertTimestampToDate(date);
      if (isNaN(d.getTime())) return '--:--';
      return d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '--:--';
    }
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

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'defesa':
        return 'yellow.400';
      case 'meio':
        return 'blue.400';
      case 'ataque':
        return 'red.400';
      default:
        return 'gray.400';
    }
  };

  const handleJoinGame = useCallback(async (name: string, position: 'defesa' | 'meio' | 'ataque', skillLevel: 1 | 2 | 3 | 4 | 5, ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50') => {
    if (!game || !id || !name.trim()) return;

    try {
      setIsJoining(true);
      
      // Pega o último horário de chegada dos jogadores existentes
      const lastArrivalTime = game.players.length > 0 
        ? Math.max(...game.players.map(p => 
            p.arrivalTime ? convertTimestampToDate(p.arrivalTime).getTime() : 0
          ))
        : new Date().getTime();

      // Define o horário do novo jogador como 1 minuto após o último
      const newArrivalTime = new Date(lastArrivalTime + 60000);

      const newPlayer: Player = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        email: '',
        confirmed: true,
        arrivalTime: Timestamp.fromDate(newArrivalTime),
        position,
        skillLevel,
        ageGroup,
      };

      // Adiciona o novo jogador à lista existente
      const updatedPlayers = [...game.players, newPlayer];

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Sucesso',
        description: 'Jogador adicionado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao entrar no jogo:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao adicionar o jogador.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsJoining(false);
    }
  }, [game, id, toast, onClose]);

  const handleRemovePlayer = async (playerId: string) => {
    if (!game || !id) return;

    try {
      const updatedPlayers = game.players.filter(p => p.id !== playerId);
      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Jogador removido!',
        description: 'O jogador foi removido da lista com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao remover o jogador.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLeaveGame = async (playerId: string) => {
    if (!game || !id) return;

    try {
      setIsLeaving(true);
      const updatedPlayers = game.players.filter(p => p.id !== playerId);
      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
      });
      toast({
        title: 'Jogador removido!',
        description: 'O jogador foi removido da lista com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao remover o jogador.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!game || !id) return;

    try {
      setIsDeleting(true);
      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await deleteDoc(gameRef);
      
      toast({
        title: 'Pelada excluída!',
        description: 'A pelada foi excluída com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/');
    } catch (error) {
      console.error('Erro ao excluir pelada:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a pelada.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      onDeleteAlertClose();
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!game || !id) return;

    try {
      const updatedMatches = game.matches.filter(match => match.id !== matchId);
      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        matches: updatedMatches,
        currentMatch: null,
        status: 'waiting',
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Partida excluída!',
        description: 'A partida foi excluída com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao excluir partida:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a partida.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const generateTeams = async () => {
    if (!game || !id) return;

    try {
      setIsGeneratingTeams(true);
      const lastMatch = game.matches[game.matches.length - 1];
      let waitingList = game.waitingList || [];

      if (!lastMatch) {
        // Primeira partida: pega os primeiros 18 jogadores por ordem de chegada e balanceia os times
        const playersForFirstMatch = [...game.players]
          .sort((a, b) => {
            const timeA = a.arrivalTime ? convertTimestampToDate(a.arrivalTime).getTime() : 0;
            const timeB = b.arrivalTime ? convertTimestampToDate(b.arrivalTime).getTime() : 0;
            return timeA - timeB;
          })
          .slice(0, 18);

        if (playersForFirstMatch.length < 4) {
          toast({
            title: 'Erro',
            description: 'É necessário pelo menos 4 jogadores para gerar os times.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // Balanceia os times apenas na primeira partida
        const { teamA, teamB } = findBalancedTeams(playersForFirstMatch);

        // Jogadores que não estão jogando vão para a lista de espera
        const playingIds = [...teamA, ...teamB].map(p => p.id);
        waitingList = game.players
          .filter(p => !playingIds.includes(p.id))
          .sort((a, b) => {
            const timeA = a.arrivalTime ? convertTimestampToDate(a.arrivalTime).getTime() : 0;
            const timeB = b.arrivalTime ? convertTimestampToDate(b.arrivalTime).getTime() : 0;
            return timeA - timeB;
          })
          .map(p => p.id);

        const teams: Team[] = [
          {
            id: 'teamA',
            name: 'Time Branco',
            players: teamA,
            score: 0,
            formation: {
              defesa: teamA.filter(p => p.position === 'defesa'),
              meio: teamA.filter(p => p.position === 'meio'),
              ataque: teamA.filter(p => p.position === 'ataque'),
            },
          },
          {
            id: 'teamB',
            name: 'Time Laranja',
            players: teamB,
            score: 0,
            formation: {
              defesa: teamB.filter(p => p.position === 'defesa'),
              meio: teamB.filter(p => p.position === 'meio'),
              ataque: teamB.filter(p => p.position === 'ataque'),
            },
          },
        ];

        const newMatch: Match = {
          id: Math.random().toString(36).substr(2, 9),
          teams,
          status: 'in_progress',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await updateDoc(doc(db, 'games', id), {
          matches: arrayUnion(newMatch),
          currentMatch: newMatch.id,
          status: 'in_progress',
          waitingList,
          updatedAt: serverTimestamp(),
        });

      } else {
        // Partidas subsequentes
        const winnerTeam = lastMatch.teams.find(t => t.id === lastMatch.winner);
        const loserTeam = lastMatch.teams.find(t => t.id !== lastMatch.winner);
        
        if (!winnerTeam || !loserTeam) {
          toast({
            title: 'Erro',
            description: 'Não foi possível identificar os times da última partida.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // 1. Primeiro adiciona o time perdedor na lista de espera
        const loserPlayers = loserTeam.players.sort((a, b) => {
          // Primeiro critério: Quem jogou menos partidas consecutivas vai primeiro
          const aConsecutiveMatches = getConsecutiveMatchesWithoutBreak(a.id);
          const bConsecutiveMatches = getConsecutiveMatchesWithoutBreak(b.id);

          if (aConsecutiveMatches !== bConsecutiveMatches) {
            return aConsecutiveMatches - bConsecutiveMatches; // Ordem crescente (menos partidas primeiro)
          }

          // Segundo critério: Ordem de chegada
          const timeA = a.arrivalTime ? convertTimestampToDate(a.arrivalTime).getTime() : 0;
          const timeB = b.arrivalTime ? convertTimestampToDate(b.arrivalTime).getTime() : 0;
          return timeA - timeB;
        });
        
        // 2. Adiciona os IDs dos jogadores do time perdedor ao final da lista de espera
        waitingList = [...waitingList, ...loserPlayers.map(p => p.id)];

        // 3. Pega os próximos 9 jogadores da lista de espera
        const nextTeamIds = waitingList.slice(0, 9);
        if (nextTeamIds.length < 4) {
          toast({
            title: 'Erro',
            description: 'Não há jogadores suficientes na lista de espera.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // 4. Remove esses jogadores da lista de espera
        waitingList = waitingList.slice(9);

        // 5. Monta os times
        const nextTeamPlayers = nextTeamIds.map(pid => game.players.find(p => p.id === pid)).filter(Boolean) as Player[];

        const teams: Team[] = [
          {
            id: 'teamA',
            name: 'Time Branco',
            players: winnerTeam.id === 'teamA' ? winnerTeam.players : nextTeamPlayers,
            score: 0,
            formation: {
              defesa: (winnerTeam.id === 'teamA' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'defesa'),
              meio: (winnerTeam.id === 'teamA' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'meio'),
              ataque: (winnerTeam.id === 'teamA' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'ataque'),
            },
          },
          {
            id: 'teamB',
            name: 'Time Laranja',
            players: winnerTeam.id === 'teamB' ? winnerTeam.players : nextTeamPlayers,
            score: 0,
            formation: {
              defesa: (winnerTeam.id === 'teamB' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'defesa'),
              meio: (winnerTeam.id === 'teamB' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'meio'),
              ataque: (winnerTeam.id === 'teamB' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'ataque'),
            },
          },
        ];

        const newMatch: Match = {
          id: Math.random().toString(36).substr(2, 9),
          teams,
          status: 'in_progress',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await updateDoc(doc(db, 'games', id), {
          matches: arrayUnion(newMatch),
          currentMatch: newMatch.id,
          status: 'in_progress',
          waitingList,
          updatedAt: serverTimestamp(),
        });
      }

      toast({
        title: 'Times gerados!',
        description: 'Os times foram gerados com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao gerar times:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao gerar os times.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGeneratingTeams(false);
    }
  };

  // Função auxiliar para encontrar times balanceados (usada apenas na primeira partida)
  const findBalancedTeams = (players: Player[]) => {
    let bestTeamA: Player[] = [];
    let bestTeamB: Player[] = [];
    let bestScoreDiff = Infinity;

    // Tenta diferentes combinações para encontrar o melhor equilíbrio
    for (let i = 0; i < 100; i++) {
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
      const teamA = shuffledPlayers.slice(0, Math.ceil(shuffledPlayers.length / 2));
      const teamB = shuffledPlayers.slice(Math.ceil(shuffledPlayers.length / 2));

      if (!isPositionDistributionValid(teamA, teamB)) continue;

      const scoreA = calculateTeamScore(teamA);
      const scoreB = calculateTeamScore(teamB);
      const scoreDiff = Math.abs(scoreA - scoreB);

      if (scoreDiff < bestScoreDiff) {
        bestScoreDiff = scoreDiff;
        bestTeamA = teamA;
        bestTeamB = teamB;
      }
    }

    return { teamA: bestTeamA, teamB: bestTeamB };
  };

  // Funções auxiliares para o balanceamento
  const calculateTeamScore = (players: Player[]) => {
    return players.reduce((sum, player) => sum + calculatePlayerScore(player), 0);
  };

  const calculatePlayerScore = (player: Player) => {
    const ageValue = getAgeValue(player.ageGroup);
    const positionValue = getPositionValue(player.position);
    const skillValue = player.skillLevel;
    
    return (skillValue * 0.6) + (ageValue * 0.3) + (positionValue * 0.1);
  };

  const getAgeValue = (ageGroup: string) => {
    switch (ageGroup) {
      case '15-20': return 17.5;
      case '21-30': return 25.5;
      case '31-40': return 35.5;
      case '41-50': return 45.5;
      case '+50': return 55;
      default: return 25.5;
    }
  };

  const getPositionValue = (position: string) => {
    switch (position) {
      case 'defesa': return 1;
      case 'meio': return 2;
      case 'ataque': return 3;
      default: return 2;
    }
  };

  const isPositionDistributionValid = (teamA: Player[], teamB: Player[]) => {
    const distA = calculatePositionDistribution(teamA);
    const distB = calculatePositionDistribution(teamB);
    
    const maxDiff = 1;
    
    return Math.abs(distA.defesa - distB.defesa) <= maxDiff &&
           Math.abs(distA.meio - distB.meio) <= maxDiff &&
           Math.abs(distA.ataque - distB.ataque) <= maxDiff;
  };

  const calculatePositionDistribution = (players: Player[]) => {
    return {
      defesa: players.filter(p => p.position === 'defesa').length,
      meio: players.filter(p => p.position === 'meio').length,
      ataque: players.filter(p => p.position === 'ataque').length
    };
  };

  const finishMatch = async (matchId: string, winnerTeamId: string) => {
    if (!game || !id) return;

    try {
      const updatedMatches = game.matches.map(match => {
        if (match.id === matchId) {
          return {
            ...match,
            status: 'finished',
            winner: winnerTeamId,
            updatedAt: new Date(),
          };
        }
        return match;
      });

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        matches: updatedMatches,
        currentMatch: null,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Partida finalizada!',
        description: 'A partida foi finalizada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao finalizar partida:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao finalizar a partida.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSwapPlayers = async (matchId: string, playerA: Player, playerB: Player) => {
    if (!game || !id) return;

    try {
      const gameRef = doc(db, 'games', id as string);
      const updatedMatches = game.matches.map(match => {
        if (match.id === matchId) {
          const updatedTeams = match.teams.map(team => {
            const updatedPlayers = team.players.map(player => {
              if (player.id === playerA.id) return playerB;
              if (player.id === playerB.id) return playerA;
              return player;
            });

            return {
              ...team,
              players: updatedPlayers,
              formation: {
                defesa: updatedPlayers.filter(p => p.position === 'defesa'),
                meio: updatedPlayers.filter(p => p.position === 'meio'),
                ataque: updatedPlayers.filter(p => p.position === 'ataque'),
              },
            };
          });

          return {
            ...match,
            teams: updatedTeams,
          };
        }
        return match;
      });

      if (!id) return;
      await updateDoc(gameRef, {
        matches: updatedMatches,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Jogadores trocados!',
        description: 'Os jogadores foram trocados com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao trocar jogadores:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao trocar os jogadores.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReplacePlayer = async (matchId: string, currentPlayer: Player, newPlayer: Player) => {
    if (!game || !id) return;

    try {
      const updatedMatches = game.matches.map(match => {
        if (match.id === matchId) {
          const updatedTeams = match.teams.map(team => {
            const updatedPlayers = team.players.map(player => {
              if (player.id === currentPlayer.id) return newPlayer;
              return player;
            });

            return {
              ...team,
              players: updatedPlayers,
              formation: {
                defesa: updatedPlayers.filter(p => p.position === 'defesa'),
                meio: updatedPlayers.filter(p => p.position === 'meio'),
                ataque: updatedPlayers.filter(p => p.position === 'ataque'),
              },
            };
          });

          return {
            ...match,
            teams: updatedTeams,
          };
        }
        return match;
      });

      if (!id) return;
      await updateDoc(doc(db, 'games', id), {
        matches: updatedMatches,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Jogador substituído!',
        description: 'O jogador foi substituído com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao substituir jogador:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao substituir o jogador.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdatePlayer = async (playerId: string, updates: Partial<Player>) => {
    if (!game || !id) return;

    try {
      const updatedPlayers = game.players.map(player => {
        if (player.id === playerId) {
          return { 
            ...player, 
            ...updates,
            // Mantém o horário original de chegada
            arrivalTime: player.arrivalTime 
          };
        }
        return player;
      });

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Jogador atualizado!',
        description: 'As informações do jogador foram atualizadas com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar o jogador.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateArrivalOrder = async (playerId: string, newPosition: number) => {
    if (!game || !id) return;

    try {
      // Ordena os jogadores por ordem de chegada atual
      const sortedPlayers = [...game.players].sort((a, b) => {
        const timeA = a.arrivalTime ? convertTimestampToDate(a.arrivalTime).getTime() : 0;
        const timeB = b.arrivalTime ? convertTimestampToDate(b.arrivalTime).getTime() : 0;
        return timeA - timeB;
      });

      // Encontra o jogador que está sendo movido
      const playerToMove = sortedPlayers.find(p => p.id === playerId);
      if (!playerToMove) return;

      // Remove o jogador da posição atual
      const playersWithoutMoved = sortedPlayers.filter(p => p.id !== playerId);

      // Insere o jogador na nova posição
      playersWithoutMoved.splice(newPosition - 1, 0, playerToMove);

      // Atualiza os horários de chegada para refletir a nova ordem
      const updatedPlayers = playersWithoutMoved.map((player, index) => {
        // Se for o primeiro jogador, mantém o horário original
        if (index === 0) {
          return player;
        }
        
        // Para os demais, define um horário 1 minuto após o jogador anterior
        const previousPlayer = playersWithoutMoved[index - 1];
        const previousTime = previousPlayer.arrivalTime ? convertTimestampToDate(previousPlayer.arrivalTime) : new Date();
        const newTime = new Date(previousTime.getTime() + 60000); // Adiciona 1 minuto

        return {
          ...player,
          arrivalTime: Timestamp.fromDate(newTime)
        };
      });

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Ordem atualizada!',
        description: 'A ordem de chegada foi atualizada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar a ordem de chegada.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getPlayersNotInNextMatch = (currentMatch: Match) => {
    if (!game || !game.matches) return { players: [], playersOut: [], playersIn: [] };
    const currentMatchIndex = game.matches.findIndex(m => m.id === currentMatch.id);
    if (currentMatchIndex === -1) return { players: [], playersOut: [], playersIn: [] };
    
    const nextMatch = game.matches[currentMatchIndex + 1];
    const currentPlayers = currentMatch.teams.flatMap(team => team.players);
    
    if (currentMatch.status === 'in_progress') {
      // Se a partida está em andamento, mostra todos os jogadores que não estão nela
      const waitingPlayers = game.players
        .filter(player => !currentPlayers.some(p => p.id === player.id))
        .sort((a, b) => {
          // Primeiro critério: Quem está há mais tempo na lista de espera entra primeiro
          const aLastMatchIndex = game.matches.findLastIndex((match: Match) => 
            match.teams.some((team: Team) => team.players.some((p: Player) => p.id === a.id))
          );
          const bLastMatchIndex = game.matches.findLastIndex((match: Match) => 
            match.teams.some((team: Team) => team.players.some((p: Player) => p.id === b.id))
          );

          if (aLastMatchIndex !== bLastMatchIndex) {
            return aLastMatchIndex - bLastMatchIndex;
          }

          // Segundo critério: Quem jogou menos partidas consecutivas entra primeiro
          const aConsecutiveMatches = getConsecutiveMatchesWithoutBreak(a.id);
          const bConsecutiveMatches = getConsecutiveMatchesWithoutBreak(b.id);

          if (aConsecutiveMatches !== bConsecutiveMatches) {
            return aConsecutiveMatches - bConsecutiveMatches;
          }

          // Terceiro critério: Quem chegou primeiro entra primeiro
          const timeA = a.arrivalTime ? convertTimestampToDate(a.arrivalTime) : new Date();
          const timeB = b.arrivalTime ? convertTimestampToDate(b.arrivalTime) : new Date();
          return timeA.getTime() - timeB.getTime();
        });

      return { 
        players: waitingPlayers,
        playersOut: [],
        playersIn: []
      };
    } else if (currentMatch.status === 'finished' && nextMatch) {
      // Se a partida está finalizada e existe próxima partida, mostra quem saiu e quem entrou
      const nextPlayers = nextMatch.teams.flatMap(team => team.players);
      return {
        players: [],
        playersOut: currentPlayers.filter(player => 
          !nextPlayers.some(p => p.id === player.id)
        ),
        playersIn: nextPlayers.filter(player => 
          !currentPlayers.some(p => p.id === player.id)
        )
      };
    }
    
    return { players: [], playersOut: [], playersIn: [] };
  };

  const handleUpdateSkillLevel = async (playerId: string, skillLevel: 1 | 2 | 3 | 4 | 5) => {
    if (!game || !id) return;

    try {
      const updatedPlayers = game.players.map(player => {
        if (player.id === playerId) {
          return { ...player, skillLevel };
        }
        return player;
      });

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Nível de habilidade atualizado!',
        description: 'O nível de habilidade do jogador foi atualizado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao atualizar nível de habilidade:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar o nível de habilidade do jogador.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateAgeGroup = async (playerId: string, ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50') => {
    if (!game || !id) return;

    try {
      const updatedPlayers = game.players.map(player => {
        if (player.id === playerId) {
          return { ...player, ageGroup };
        }
        return player;
      });

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Faixa etária atualizada!',
        description: 'A faixa etária do jogador foi atualizada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao atualizar faixa etária:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar a faixa etária do jogador.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleGoalScored = async (matchId: string, teamId: string, scorerId: string, assisterId?: string) => {
    if (!game || !id) return;

    try {
      if (typeof id !== 'string') {
        throw new Error('ID do jogo inválido');
      }

      const gameRef = doc(db, 'games', id);
      const goalData: any = {
        id: Math.random().toString(36).substr(2, 9),
        matchId,
        teamId,
        scorerId,
        timestamp: new Date()
      };

      if (assisterId) {
        goalData.assisterId = assisterId;
      }

      const updatedMatches = game.matches.map(match => {
        if (match.id === matchId) {
          const updatedTeams = match.teams.map(team => {
            if (team.id === teamId) {
              return {
                ...team,
                score: (team.score || 0) + 1
              };
            }
            return team;
          });

          return {
            ...match,
            goals: match.goals ? [...match.goals, goalData] : [goalData],
            teams: updatedTeams,
            updatedAt: new Date()
          };
        }
        return match;
      });

      if (!id) return;
      await updateDoc(gameRef, {
        matches: updatedMatches,
        updatedAt: serverTimestamp()
      });

      toast({
        title: 'Gol registrado!',
        description: 'O gol foi registrado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao registrar gol:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao registrar o gol.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getSkillLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Icon as={FaRunning} color="gray.400" />;
      case 2:
        return <Icon as={FaRunning} color="blue.400" />;
      case 3:
        return <Icon as={FaFutbol} color="green.400" />;
      case 4:
        return <Icon as={FaMedal} color="yellow.400" />;
      case 5:
        return <Icon as={FaMedal} color="orange.400" />;
      default:
        return <Icon as={FaRunning} color="gray.400" />;
    }
  };

  const getSkillLevelText = (level: number) => {
    switch (level) {
      case 1:
        return 'Iniciante';
      case 2:
        return 'Amador';
      case 3:
        return 'Intermediário';
      case 4:
        return 'Avançado';
      case 5:
        return 'Profissional';
      default:
        return 'Não definido';
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!game) {
    return (
      <Center h="100vh">
        <Text>Jogo não encontrado</Text>
      </Center>
    );
  }

  const isGameFull = game.players?.length >= game.maxPlayers;

  return (
    <Container maxW="container.md" py={{ base: 4, md: 8 }} px={{ base: 4, md: 6 }}>
      <Flex 
        align="center" 
        justify="space-between" 
        mb={{ base: 4, md: 6 }}
        flexDir={{ base: 'column', sm: 'row' }}
        gap={{ base: 4, sm: 0 }}
      >
        <Flex align="center" w={{ base: 'full', sm: 'auto' }}>
          <IconButton
            aria-label="Voltar"
            icon={<FaArrowLeft />}
            variant="ghost"
            mr={4}
            onClick={() => navigate('/')}
            size={{ base: 'sm', md: 'md' }}
          />
          <Box>
            <Heading size={{ base: 'md', md: 'lg' }}>Detalhes da Pelada</Heading>
            <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
              {formatDate(game.date)}
            </Text>
          </Box>
        </Flex>
        <HStack spacing={2} w={{ base: 'full', sm: 'auto' }} justify={{ base: 'space-between', sm: 'flex-end' }}>
          <IconButton
            aria-label={game.status === 'finished' ? "Reabrir pelada" : "Finalizar pelada"}
            icon={<FaCheck />}
            colorScheme={game.status === 'finished' ? "yellow" : "green"}
            variant="ghost"
            size={{ base: 'sm', md: 'md' }}
            onClick={async () => {
              try {
                if (!id) return;
                await updateDoc(doc(db, 'games', id), {
                  status: game.status === 'finished' ? 'waiting' : 'finished',
                  updatedAt: new Date()
                });
                
                toast({
                  title: game.status === 'finished' ? 'Pelada reaberta!' : 'Pelada finalizada!',
                  description: game.status === 'finished' ? 'A pelada foi reaberta com sucesso.' : 'A pelada foi finalizada com sucesso.',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
              } catch (error) {
                console.error('Erro ao alterar status da pelada:', error);
                toast({
                  title: 'Erro',
                  description: 'Ocorreu um erro ao alterar o status da pelada.',
                  status: 'error',
                  duration: 3000,
                  isClosable: true,
                });
              }
            }}
          />
          <IconButton
            aria-label="Editar pelada"
            icon={<FaEdit />}
            colorScheme="blue"
            variant="ghost"
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate(`/game/${id}/edit`)}
          />
        <IconButton
          aria-label="Excluir pelada"
          icon={<FaTrash />}
          colorScheme="red"
          variant="ghost"
            size={{ base: 'sm', md: 'md' }}
          onClick={onDeleteAlertOpen}
        />
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
        <Box p={4} bg="white" borderRadius="lg" shadow="sm">
          <Flex align="center" mb={2}>
            <FaMapMarkerAlt style={{ marginRight: '8px', fontSize: '16px' }} />
            <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{game.location}</Text>
          </Flex>
          <Flex align="center">
            <FaUsers style={{ marginRight: '8px', fontSize: '16px' }} />
            <Text fontSize={{ base: 'sm', md: 'md' }}>
              {game.players.length} / {game.maxPlayers} jogadores
            </Text>
          </Flex>
          </Box>

        <Box p={4} bg="white" borderRadius="lg" shadow="sm">
          <Flex align="center" mb={2}>
            <FaCalendarAlt style={{ marginRight: '8px', fontSize: '16px' }} />
            <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>Status</Text>
        </Flex>
          <Badge colorScheme={getStatusColor(game.status)} fontSize={{ base: 'sm', md: 'md' }}>
            {getStatusText(game.status)}
          </Badge>
        </Box>
      </SimpleGrid>

        {game.observations && (
        <Box p={4} bg="white" borderRadius="lg" shadow="sm" mb={{ base: 4, md: 6 }}>
          <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
              {game.observations}
            </Text>
          </Box>
        )}

      <Tabs variant="enclosed" colorScheme="blue" size={{ base: 'sm', md: 'md' }}>
        <TabList>
          <Tab>Jogadores</Tab>
          <Tab>Partidas</Tab>
          <Tab>Análises</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Box bg="white" borderRadius="lg" shadow="sm" p={{ base: 3, md: 4 }}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size={{ base: 'sm', md: 'md' }}>Ordem de Chegada</Heading>
                <HStack>
                  {/* Botão para gerar 18 jogadores aleatórios */}
                  <IconButton
                    aria-label="Gerar 18 jogadores"
                    icon={<FaUsers />}
                    colorScheme="purple"
                    size="sm"
                    onClick={async () => {
                      if (!id) return;
                      try {
                        const randomPlayers = generateRandomPlayers(18);
                        await updateDoc(doc(db, 'games', id), {
                          players: randomPlayers,
                          waitingList: randomPlayers.slice(9).map(p => p.id)
                        });
                        toast({
                          title: 'Jogadores adicionados!',
                          description: '18 jogadores aleatórios foram adicionados com sucesso.',
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                      } catch (error) {
                        console.error('Erro ao adicionar jogadores:', error);
                        toast({
                          title: 'Erro',
                          description: 'Ocorreu um erro ao adicionar os jogadores.',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                  />

                  {/* Botão para adicionar um jogador fictício */}
                  <IconButton
                    aria-label="Adicionar jogador fictício"
                    icon={<FaUserPlus />}
                    colorScheme="purple"
                    size="sm"
                    onClick={async () => {
                      if (!id) return;
                      try {
                        const randomPlayer = generateRandomPlayers(1)[0];
                        await updateDoc(doc(db, 'games', id), {
                          players: arrayUnion(randomPlayer),
                          waitingList: game.waitingList ? [...game.waitingList, randomPlayer.id] : [randomPlayer.id],
                        });
                        toast({
                          title: 'Jogador adicionado!',
                          description: 'Jogador fictício adicionado com sucesso.',
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                      } catch (error) {
                        console.error('Erro ao adicionar jogador:', error);
                        toast({
                          title: 'Erro',
                          description: 'Ocorreu um erro ao adicionar o jogador.',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                  />

                  {game.status !== 'finished' && (
                    <Button
                      colorScheme="blue"
                      size={{ base: 'sm', md: 'md' }}
                      onClick={onOpen}
                      display={{ base: 'flex', md: 'inline-flex' }}
                      px={{ base: 2, md: 4 }}
                    >
                      <FaUserPlus />
                      <Text display={{ base: 'none', md: 'block' }} ml={2}>
                        Adicionar Jogador
                      </Text>
                    </Button>
                  )}
                </HStack>
              </Flex>

              <Box mb={6}>
                {game.players && game.players.length > 0 ? (
                  <VStack align="stretch" spacing={3}>
                    <Box mt={4}>
                      <PlayerList
                        players={game.players.sort((a, b) => {
                          const timeA = a.arrivalTime ? convertTimestampToDate(a.arrivalTime).getTime() : 0;
                          const timeB = b.arrivalTime ? convertTimestampToDate(b.arrivalTime).getTime() : 0;
                          return timeA - timeB;
                        })}
                        onPlayerOptions={(player) => {
                          setSelectedPlayer(player);
                          setIsPlayerOptionsOpen(true);
                        }}
                        goals={game.matches.flatMap(m => m.goals || [])}
                        variant="arrival"
                        showOrder={true}
                        formatArrivalTime={formatArrivalTime}
                      />
                    </Box>
                  </VStack>
                ) : (
                  <Text color="gray.500">
                    Nenhum jogador confirmado ainda.
                  </Text>
                )}
              </Box>
            </Box>
          </TabPanel>

          <TabPanel px={0}>
            <Box>
              {game.matches && game.matches.length > 0 ? (
                <VStack spacing={6} align="stretch">
                  {game.matches.map((match) => (
                    <Card key={match.id}>
                      <CardBody>
                        <Flex justify="space-between" align="center" mb={4}>
                          <Badge
                            colorScheme={match.status === 'finished' ? 'green' : 'blue'}
                            fontSize={{ base: 'sm', md: 'md' }}
                          >
                            {match.status === 'finished' ? 'Finalizada' : 'Em andamento'}
                          </Badge>
                          <Flex align="center" gap={2}>
                            {match.winner && (
                              <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.500">
                                Vencedor: {match.teams.find(t => t.id === match.winner)?.name}
                              </Text>
                            )}
                            {match.status === 'finished' && (
                              <IconButton
                                aria-label="Excluir partida"
                                icon={<FaTrash />}
                                size={{ base: 'sm', md: 'md' }}
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => deleteMatch(match.id)}
                              />
                            )}
                          </Flex>
                        </Flex>

                        {/* Placar quando a partida estiver finalizada */}
                        {match.status === 'finished' && (
                          <MatchScore match={match} />
                        )}

                        {/* Timer e Placar */}
                        {match.status === 'in_progress' && (
                          <MatchTimer
                            teamA={match.teams[0]}
                            teamB={match.teams[1]}
                            isFirstMatch={game.matches.length === 1}
                            onGoalScored={(teamId, scorerId, assisterId) => 
                              handleGoalScored(match.id, teamId, scorerId, assisterId)
                            }
                          />
                        )}

                        {/* Visualização Tática */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                          {match.teams.map((team) => (
                            <Box key={team.id}>
                              <TacticalView
                                team={team}
                                formation={team.formation?.tactical || '4-3-2'}
                                goals={match.goals}
                                teamColor={team.id === 'teamA' ? 'gray.600' : 'orange.500'}
                                onFormationChange={async (newFormation) => {
                                  try {
                                    const updatedTeams = match.teams.map(t => {
                                      if (t.id === team.id) {
                                        return {
                                          ...t,
                                          formation: {
                                            ...t.formation,
                                            tactical: newFormation
                                          }
                                        };
                                      }
                                      return t;
                                    });

                                    const updatedMatches = game.matches.map(m => {
                                      if (m.id === match.id) {
                                        return {
                                          ...m,
                                          teams: updatedTeams
                                        };
                                      }
                                      return m;
                                    });

                                    if (!id) return;
                                    const gameRef = doc(db, 'games', id);
                                    await updateDoc(gameRef, {
                                      matches: updatedMatches
                                    });
                                  } catch (error) {
                                    console.error('Erro ao atualizar formação:', error);
                                    toast({
                                      title: 'Erro',
                                      description: 'Ocorreu um erro ao atualizar a formação.',
                                      status: 'error',
                                      duration: 3000,
                                      isClosable: true,
                                    });
                                  }
                                }}
                              />
                                  </Box>
                          ))}
                        </SimpleGrid>

                        {/* Lista de Jogadores */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {match.teams.map((team) => (
                            <Box key={team.id}>
                              <Text fontWeight="bold" mb={2} fontSize={{ base: 'sm', md: 'md' }}>
                                {team.name}
                              </Text>
                              <VStack align="stretch" spacing={2}>
                                {team.players.sort((a, b) => {
                                  // Primeiro por posição (defesa -> meio -> ataque)
                                  const positionOrder = { defesa: 1, meio: 2, ataque: 3 };
                                  if (positionOrder[a.position] !== positionOrder[b.position]) {
                                    return positionOrder[a.position] - positionOrder[b.position];
                                  }
                                  
                                  // Depois por idade (mais novo -> mais velho)
                                  const ageOrder = {
                                    '15-20': 1,
                                    '21-30': 2,
                                    '31-40': 3,
                                    '41-50': 4,
                                    '+50': 5
                                  };
                                  if (ageOrder[a.ageGroup] !== ageOrder[b.ageGroup]) {
                                    return ageOrder[a.ageGroup] - ageOrder[b.ageGroup];
                                  }
                                  
                                  // Por fim por habilidade (menos habilidoso -> mais habilidoso)
                                  return a.skillLevel - b.skillLevel;
                                }).map((player) => (
                                  <PlayerList
                                    key={player.id}
                                    players={[player]}
                                    goals={match.goals}
                                    showStats={true}
                                    showOrder={false}
                                    variant="lineup"
                                    teamColor={team.id === 'teamA' ? 'gray.600' : 'orange.500'}
                                    onPlayerOptions={match.status === 'in_progress' ? (player) => {
                                      setSelectedPlayer(player);
                                      setSelectedTeam(team);
                                      setSelectedMatchForSwap(match);
                                      setIsPlayerSwapOpen(true);
                                    } : undefined}
                                    consecutiveMatches={getConsecutiveMatchesWithoutBreak}
                                  />
                                ))}
                              </VStack>
                            </Box>
                          ))}
                        </SimpleGrid>

                        <Flex justify="center" mt={4}>
                          <IconButton
                            aria-label="Ver lista de espera"
                            icon={<FaEye />}
                            colorScheme="blue"
                            variant="ghost"
                            size={{ base: 'sm', md: 'md' }}
                            onClick={() => {
                              setSelectedMatch(match);
                              onWaitingListOpen();
                            }}
                          />
                        </Flex>

                        {match.status === 'in_progress' && (
                          <Flex 
                            justify="center" 
                            mt={4} 
                            gap={4}
                            flexDir={{ base: 'column', sm: 'row' }}
                          >
                            <Button
                              leftIcon={<FaTrophy />}
                              colorScheme="gray"
                              size={{ base: 'sm', md: 'md' }}
                              onClick={() => finishMatch(match.id, 'teamA')}
                            >
                              Time Branco Venceu
                            </Button>
                            <Button
                              leftIcon={<FaTrophy />}
                              colorScheme="orange"
                              size={{ base: 'sm', md: 'md' }}
                              onClick={() => finishMatch(match.id, 'teamB')}
                            >
                              Time Laranja Venceu
                            </Button>
                          </Flex>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              ) : (
                <Center py={12}>
                  <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>
                    Nenhuma partida iniciada ainda.
                  </Text>
                </Center>
              )}

              {game.status !== 'finished' && (
                <Flex justify="center" mt={6}>
                  <Button
                    leftIcon={<FaRandom />}
                    colorScheme="blue"
                    size={{ base: 'sm', md: 'md' }}
                    onClick={generateTeams}
                    isLoading={isGeneratingTeams}
                    isDisabled={
                      game.players.length < 4 || 
                      (game.matches && game.matches.length > 0 && 
                       game.matches[game.matches.length - 1].status !== 'finished')
                    }
                  >
                    Gerar Nova Partida
                  </Button>
                </Flex>
              )}
            </Box>
          </TabPanel>

          <TabPanel px={0}>
            <GameAnalytics game={game} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <AddPlayerModal 
        isOpen={isOpen}
        onClose={onClose}
        onAddPlayer={handleJoinGame}
        isJoining={isJoining}
      />

      <PlayerOptionsModal
        isOpen={isPlayerOptionsOpen}
        onClose={() => {
          setIsPlayerOptionsOpen(false);
          setSelectedPlayer(null);
        }}
        player={selectedPlayer}
        totalPlayers={game.players.length}
        onUpdatePosition={(position) => {
          if (selectedPlayer) {
            handleUpdatePlayer(selectedPlayer.id, { position });
            setIsPlayerOptionsOpen(false);
            setSelectedPlayer(null);
          }
        }}
        onUpdateArrivalOrder={(order) => {
          if (selectedPlayer) {
            handleUpdateArrivalOrder(selectedPlayer.id, order);
            setIsPlayerOptionsOpen(false);
            setSelectedPlayer(null);
          }
        }}
        onUpdateSkillLevel={(skillLevel) => {
          if (selectedPlayer) {
            handleUpdateSkillLevel(selectedPlayer.id, skillLevel);
            setIsPlayerOptionsOpen(false);
            setSelectedPlayer(null);
          }
        }}
        onUpdateAgeGroup={(ageGroup) => {
          if (selectedPlayer) {
            handleUpdateAgeGroup(selectedPlayer.id, ageGroup);
            setIsPlayerOptionsOpen(false);
            setSelectedPlayer(null);
          }
        }}
        onRemovePlayer={() => {
          if (selectedPlayer) {
            handleRemovePlayer(selectedPlayer.id);
            setIsPlayerOptionsOpen(false);
            setSelectedPlayer(null);
          }
        }}
      />

      <PlayerSwapModal
        isOpen={isPlayerSwapOpen}
        onClose={() => {
          setIsPlayerSwapOpen(false);
          setSelectedPlayer(null);
          setSelectedTeam(null);
          setSelectedMatchForSwap(null);
        }}
        currentPlayer={selectedPlayer!}
        otherTeamPlayers={selectedMatchForSwap?.teams.find(t => t.id !== selectedTeam?.id)?.players || []}
        waitingPlayers={game.players.filter(p => !selectedMatchForSwap?.teams.some(t => t.players.some(tp => tp.id === p.id)))}
        onSwapPlayers={(otherPlayer) => {
          handleSwapPlayers(selectedMatchForSwap!.id, selectedPlayer!, otherPlayer);
          setIsPlayerSwapOpen(false);
          setSelectedPlayer(null);
          setSelectedTeam(null);
          setSelectedMatchForSwap(null);
        }}
        onReplacePlayer={(waitingPlayer) => {
          handleReplacePlayer(selectedMatchForSwap!.id, selectedPlayer!, waitingPlayer);
          setIsPlayerSwapOpen(false);
          setSelectedPlayer(null);
          setSelectedTeam(null);
          setSelectedMatchForSwap(null);
        }}
      />

      <Modal isOpen={isWaitingListOpen} onClose={onWaitingListClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Lista de Espera</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedMatch && (
              <VStack align="stretch" spacing={4}>
                {selectedMatch.status === 'in_progress' ? (
                  <>
                    <Text fontSize="sm" color="gray.600">
                      Jogadores na lista de espera:
                    </Text>
                    {getPlayersNotInNextMatch(selectedMatch).players.map((player) => (
                      <Flex 
                        key={player.id} 
                        align="center" 
                        p={2} 
                        bg="gray.50" 
                        borderRadius="md"
                      >
                        <Avatar 
                          size="sm" 
                          name={player.name} 
                          mr={2} 
                          bg={getPositionColor(player.position)} 
                        />
                        <Text fontWeight="medium">{player.name}</Text>
                      </Flex>
                    ))}
                    {getPlayersNotInNextMatch(selectedMatch).players.length === 0 && (
                      <Text color="gray.500" textAlign="center">
                        Não há jogadores na lista de espera.
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        Jogadores que saíram:
                      </Text>
                      {getPlayersNotInNextMatch(selectedMatch).playersOut?.map((player) => (
                        <Flex 
                          key={player.id} 
                          align="center" 
                          p={2} 
                          bg="red.50" 
                          borderRadius="md"
                          mb={2}
                        >
                          <Avatar 
                            size="sm" 
                            name={player.name} 
                            mr={2} 
                            bg={getPositionColor(player.position)} 
                          />
                          <Text fontWeight="medium">{player.name}</Text>
                          <Badge 
                            ml="auto"
                            colorScheme={getPositionColor(player.position)}
                          >
                            {player.position}
                          </Badge>
                        </Flex>
                      ))}
                      {(!getPlayersNotInNextMatch(selectedMatch).playersOut || 
                        getPlayersNotInNextMatch(selectedMatch).playersOut.length === 0) && (
                        <Text color="gray.500" textAlign="center" mb={4}>
                          Nenhum jogador saiu.
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        Jogadores que entraram:
                      </Text>
                      {getPlayersNotInNextMatch(selectedMatch).playersIn?.map((player) => (
                        <Flex 
                          key={player.id} 
                          align="center" 
                          p={2} 
                          bg="green.50" 
                          borderRadius="md"
                          mb={2}
                        >
                          <Avatar 
                            size="sm" 
                            name={player.name} 
                            mr={2} 
                            bg={getPositionColor(player.position)} 
                          />
                          <Text fontWeight="medium">{player.name}</Text>
                          <Badge 
                            ml="auto"
                            colorScheme={getPositionColor(player.position)}
                          >
                            {player.position}
                          </Badge>
                        </Flex>
                      ))}
                      {(!getPlayersNotInNextMatch(selectedMatch).playersIn || 
                        getPlayersNotInNextMatch(selectedMatch).playersIn.length === 0) && (
                        <Text color="gray.500" textAlign="center" mb={4}>
                          Nenhum jogador entrou.
                        </Text>
                      )}
                    </Box>

                    {selectedMatch.status === 'finished' && (
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          Lista de espera:
                        </Text>
                        <SimpleGrid columns={2} spacing={2}>
                          {game.players
                            .filter(p => !selectedMatch.teams.some(t => t.players.some(tp => tp.id === p.id)))
                            .map((player) => (
                              <Flex 
                                key={player.id} 
                                align="center" 
                                p={2} 
                                bg="gray.50" 
                                borderRadius="md"
                              >
                                <Avatar 
                                  size="xs" 
                                  name={player.name} 
                                  mr={2} 
                                  bg={getPositionColor(player.position)} 
                                />
                                <Text fontSize="sm">{player.name}</Text>
                                <Badge 
                                  ml="auto"
                                  colorScheme={getPositionColor(player.position)}
                                  fontSize="xs"
                                >
                                  {player.position}
                                </Badge>
              </Flex>
                            ))}
                        </SimpleGrid>
                      </Box>
                    )}
                  </>
                )}
            </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Pelada
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir esta pelada? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteGame}
                ml={3}
                isLoading={isDeleting}
              >
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
} 
