import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Divider,
  Avatar,
  AvatarGroup,
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
} from '@chakra-ui/react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game, Team, Player, Match } from '../types';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaUserPlus, FaUserMinus, FaRandom, FaTrophy, FaTrash, FaExchangeAlt, FaEdit, FaCheck, FaEye, FaSignOutAlt, FaEllipsisV } from 'react-icons/fa';
import { PlayerOptionsModal } from '../components/PlayerOptionsModal';
import { PlayerSwapModal } from '../components/PlayerSwapModal';

const AddPlayerModal = React.memo(({ 
  isOpen, 
  onClose, 
  onAddPlayer, 
  isJoining 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAddPlayer: (name: string, position: 'defesa' | 'meio' | 'ataque') => void; 
  isJoining: boolean;
}) => {
  const [playerName, setPlayerName] = useState('');
  const [playerPosition, setPlayerPosition] = useState<'defesa' | 'meio' | 'ataque'>('meio');

  const handleSubmit = useCallback(() => {
    if (playerName.trim()) {
      onAddPlayer(playerName.trim(), playerPosition);
      setPlayerName('');
      setPlayerPosition('meio');
    }
  }, [playerName, playerPosition, onAddPlayer]);

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
              <Select
                value={playerPosition}
                onChange={(e) => setPlayerPosition(e.target.value as 'defesa' | 'meio' | 'ataque')}
              >
                <option value="defesa">Defesa</option>
                <option value="meio">Meio</option>
                <option value="ataque">Ataque</option>
              </Select>
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
        // Se o jogador não está na partida, marca que encontrou uma quebra
        foundBreak = true;
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatArrivalTime = (date: Date | undefined | { seconds: number; nanoseconds: number }) => {
    if (!date) return '--:--';
    try {
      let d: Date;
      if ('seconds' in date) {
        // É um Timestamp do Firestore
        d = new Date(date.seconds * 1000);
      } else {
        d = new Date(date);
      }
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

  const handleJoinGame = useCallback(async (name: string, position: 'defesa' | 'meio' | 'ataque') => {
    if (!game || !id || !name.trim()) return;

    try {
      setIsJoining(true);
      const newPlayer: Player = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        email: '',
        confirmed: true,
        arrivalTime: new Date(),
        position,
      };

      await updateDoc(doc(db, 'games', id), {
        players: arrayUnion(newPlayer),
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
      await updateDoc(doc(db, 'games', id), {
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
      await updateDoc(doc(db, 'games', id), {
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
      await deleteDoc(doc(db, 'games', id));
      
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
      await updateDoc(doc(db, 'games', id), {
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
    if (!game || !id || game.players.length < 4) {
      toast({
        title: 'Erro',
        description: 'É necessário pelo menos 4 jogadores para gerar os times.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsGeneratingTeams(true);

      let availablePlayers: Player[] = [];
      let winningTeam: Team | null = null;

      // Se for a primeira partida, usa os primeiros 18 jogadores
      if (!game.matches || game.matches.length === 0) {
        // Ordena os jogadores por ordem de chegada
        const sortedPlayers = [...game.players].sort((a, b) => {
          const timeA = a.arrivalTime ? new Date(a.arrivalTime) : new Date();
          const timeB = b.arrivalTime ? new Date(b.arrivalTime) : new Date();
          return timeA.getTime() - timeB.getTime();
        });

        // Pega os primeiros 18 jogadores
        const first18Players = sortedPlayers.slice(0, 18);

        // Inicializa os times
        let teamA: Player[] = [];
        let teamB: Player[] = [];

        // Função para distribuir jogadores mantendo o equilíbrio
        const distributePlayers = () => {
          // Limpa os times
          teamA = [];
          teamB = [];

          // Agrupa jogadores por posição
          const defesa = first18Players.filter(p => p.position === 'defesa');
          const meio = first18Players.filter(p => p.position === 'meio');
          const ataque = first18Players.filter(p => p.position === 'ataque');

          // Calcula quantos jogadores de cada posição cada time deve ter
          const totalDefesa = defesa.length;
          const totalMeio = meio.length;
          const totalAtaque = ataque.length;

          // Distribui defensores
          const defesaPorTime = Math.floor(totalDefesa / 2);
          const defesaRestante = totalDefesa % 2;

          // Distribui meio-campistas
          const meioPorTime = Math.floor(totalMeio / 2);
          const meioRestante = totalMeio % 2;

          // Distribui atacantes
          const ataquePorTime = Math.floor(totalAtaque / 2);
          const ataqueRestante = totalAtaque % 2;

          // Distribui os jogadores de cada posição
          teamA.push(...defesa.slice(0, defesaPorTime));
          teamB.push(...defesa.slice(defesaPorTime, defesaPorTime * 2));

          teamA.push(...meio.slice(0, meioPorTime));
          teamB.push(...meio.slice(meioPorTime, meioPorTime * 2));

          teamA.push(...ataque.slice(0, ataquePorTime));
          teamB.push(...ataque.slice(ataquePorTime, ataquePorTime * 2));

          // Distribui os jogadores restantes de cada posição
          const jogadoresRestantes = [
            ...defesa.slice(defesaPorTime * 2),
            ...meio.slice(meioPorTime * 2),
            ...ataque.slice(ataquePorTime * 2)
          ];

          // Ordena os jogadores restantes por ordem de chegada
          const jogadoresRestantesOrdenados = jogadoresRestantes.sort((a, b) => {
            const timeA = a.arrivalTime ? new Date(a.arrivalTime) : new Date();
            const timeB = b.arrivalTime ? new Date(b.arrivalTime) : new Date();
            return timeA.getTime() - timeB.getTime();
          });

          // Distribui os jogadores restantes alternadamente
          jogadoresRestantesOrdenados.forEach((player, index) => {
            if (index % 2 === 0) {
              teamA.push(player);
            } else {
              teamB.push(player);
            }
          });

          // Se algum time tiver menos de 9 jogadores, completa com os jogadores restantes
          if (teamA.length < 9 || teamB.length < 9) {
            const remainingPlayers = first18Players.filter(
              p => !teamA.includes(p) && !teamB.includes(p)
            );

            const remainingForA = 9 - teamA.length;
            const remainingForB = 9 - teamB.length;

            teamA.push(...remainingPlayers.slice(0, remainingForA));
            teamB.push(...remainingPlayers.slice(remainingForA, remainingForA + remainingForB));
          }

          // Se ainda assim não tiver 9 jogadores em cada time, redistribui
          if (teamA.length !== 9 || teamB.length !== 9) {
            teamA = first18Players.slice(0, 9);
            teamB = first18Players.slice(9, 18);
          }
        };

        // Tenta distribuir os jogadores
        distributePlayers();

        // Verifica se a distribuição está equilibrada
        const teamAPositions = {
          defesa: teamA.filter(p => p.position === 'defesa').length,
          meio: teamA.filter(p => p.position === 'meio').length,
          ataque: teamA.filter(p => p.position === 'ataque').length
        };

        const teamBPositions = {
          defesa: teamB.filter(p => p.position === 'defesa').length,
          meio: teamB.filter(p => p.position === 'meio').length,
          ataque: teamB.filter(p => p.position === 'ataque').length
        };

        // Se a diferença entre as posições for muito grande, tenta reequilibrar
        const maxDifference = 1;
        const needsRebalance = 
          Math.abs(teamAPositions.defesa - teamBPositions.defesa) > maxDifference ||
          Math.abs(teamAPositions.meio - teamBPositions.meio) > maxDifference ||
          Math.abs(teamAPositions.ataque - teamBPositions.ataque) > maxDifference;

        if (needsRebalance) {
          distributePlayers();
        }

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
          updatedAt: serverTimestamp(),
        });
      } else {
        // Pega a última partida
        const lastMatch = game.matches[game.matches.length - 1];
        
        // Se a última partida tiver um vencedor, mantém esse time
        if (lastMatch.winner) {
          winningTeam = lastMatch.teams.find(team => team.id === lastMatch.winner) || null;
        }

        // Pega os jogadores que ainda não jogaram na última partida
        const lastMatchPlayers = lastMatch.teams.flatMap(team => team.players);
        const remainingPlayers = game.players.filter(
          player => !lastMatchPlayers.some(p => p.id === player.id)
        );

        // Se tiver time vencedor, mantém ele e pega os próximos jogadores
        if (winningTeam) {
          const nextPlayers = [...winningTeam.players];

          // Se não tiver 9 jogadores suficientes, pega os próximos da lista completa
          if (nextPlayers.length < 9) {
            // Pega o time perdedor da última partida
            const losingTeam = lastMatch.teams.find(team => team.id !== lastMatch.winner);
            if (!losingTeam) return;

            // Ordena os jogadores do time perdedor por número de partidas consecutivas
            const sortedLosingTeamPlayers = [...losingTeam.players]
              .filter(player => !nextPlayers.some(np => np.id === player.id))
              .sort((a, b) => {
                const aConsecutiveMatches = getConsecutiveMatchesWithoutBreak(a.id);
                const bConsecutiveMatches = getConsecutiveMatchesWithoutBreak(b.id);

                // Quem jogou MAIS partidas consecutivas sai primeiro
                if (aConsecutiveMatches !== bConsecutiveMatches) {
                  return bConsecutiveMatches - aConsecutiveMatches;
                }

                // Em caso de empate, quem chegou mais tarde sai primeiro
                const timeA = a.arrivalTime ? new Date(a.arrivalTime) : new Date();
                const timeB = b.arrivalTime ? new Date(b.arrivalTime) : new Date();
                return timeB.getTime() - timeA.getTime();
              });

            // Pega os jogadores que não estão no time vencedor nem nos próximos jogadores
            const waitingPlayers = game.players
              .filter(p => !winningTeam!.players.some(wp => wp.id === p.id))
              .filter(p => !nextPlayers.some(np => np.id === p.id));

            // Ordena os jogadores da lista de espera por tempo de espera
            const sortedWaitingPlayers = [...waitingPlayers].sort((a, b) => {
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
              const timeA = a.arrivalTime ? new Date(a.arrivalTime) : new Date();
              const timeB = b.arrivalTime ? new Date(b.arrivalTime) : new Date();
                return timeA.getTime() - timeB.getTime();
            });

            const additionalPlayers = sortedWaitingPlayers.slice(0, 9 - nextPlayers.length);
            const newTeamPlayers = [...nextPlayers, ...additionalPlayers];

            // Garante que o time branco sempre seja o primeiro
            const teams: Team[] = winningTeam.id === 'teamA' ? [
              {
                ...winningTeam,
                id: 'teamA',
                name: 'Time Branco',
              },
              {
                id: 'teamB',
                name: 'Time Laranja',
                players: newTeamPlayers,
                score: 0,
                formation: {
                  defesa: newTeamPlayers.filter(p => p.position === 'defesa'),
                  meio: newTeamPlayers.filter(p => p.position === 'meio'),
                  ataque: newTeamPlayers.filter(p => p.position === 'ataque'),
                },
              },
            ] : [
              {
                id: 'teamA',
                name: 'Time Branco',
                players: newTeamPlayers,
                score: 0,
                formation: {
                  defesa: newTeamPlayers.filter(p => p.position === 'defesa'),
                  meio: newTeamPlayers.filter(p => p.position === 'meio'),
                  ataque: newTeamPlayers.filter(p => p.position === 'ataque'),
                },
              },
              {
                ...winningTeam,
                id: 'teamB',
                name: 'Time Laranja',
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
              updatedAt: serverTimestamp(),
            });
          } else {
            // Se já tiver 9 jogadores, gera o time normalmente
            const waitingPlayers = game.players
              .filter(p => !winningTeam!.players.some(wp => wp.id === p.id));

            // Ordena os jogadores da lista de espera
            const sortedWaitingPlayers = [...waitingPlayers].sort((a, b) => {
              const aLastMatchIndex = game.matches.findLastIndex((match: Match) => 
                match.teams.some((team: Team) => team.players.some((p: Player) => p.id === a.id))
              );
              const bLastMatchIndex = game.matches.findLastIndex((match: Match) => 
                match.teams.some((team: Team) => team.players.some((p: Player) => p.id === b.id))
              );

              if (aLastMatchIndex !== bLastMatchIndex) {
                return aLastMatchIndex - bLastMatchIndex;
              }

              const aConsecutiveMatches = getConsecutiveMatchesWithoutBreak(a.id);
              const bConsecutiveMatches = getConsecutiveMatchesWithoutBreak(b.id);

              if (aConsecutiveMatches !== bConsecutiveMatches) {
                return aConsecutiveMatches - bConsecutiveMatches;
              }

              const timeA = a.arrivalTime ? new Date(a.arrivalTime) : new Date();
              const timeB = b.arrivalTime ? new Date(b.arrivalTime) : new Date();
              return timeA.getTime() - timeB.getTime();
            });

            const newTeamPlayers = sortedWaitingPlayers.slice(0, 9);

            // Garante que o time branco sempre seja o primeiro
            const teams: Team[] = winningTeam.id === 'teamA' ? [
              {
                ...winningTeam,
                id: 'teamA',
                name: 'Time Branco',
              },
              {
                id: 'teamB',
                name: 'Time Laranja',
                players: newTeamPlayers,
                score: 0,
                formation: {
                  defesa: newTeamPlayers.filter(p => p.position === 'defesa'),
                  meio: newTeamPlayers.filter(p => p.position === 'meio'),
                  ataque: newTeamPlayers.filter(p => p.position === 'ataque'),
                },
              },
            ] : [
              {
                id: 'teamA',
                name: 'Time Branco',
                players: newTeamPlayers,
                score: 0,
                formation: {
                  defesa: newTeamPlayers.filter(p => p.position === 'defesa'),
                  meio: newTeamPlayers.filter(p => p.position === 'meio'),
                  ataque: newTeamPlayers.filter(p => p.position === 'ataque'),
                },
              },
              {
                ...winningTeam,
                id: 'teamB',
                name: 'Time Laranja',
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
              updatedAt: serverTimestamp(),
            });
          }
        } else {
          // Se não tiver time vencedor, pega os próximos jogadores da lista
          const sortedPlayers = [...game.players].sort((a, b) => {
            const aConsecutiveMatches = getConsecutiveMatchesWithoutBreak(a.id);
            const bConsecutiveMatches = getConsecutiveMatchesWithoutBreak(b.id);

            // Quem jogou MENOS partidas consecutivas entra primeiro
            if (aConsecutiveMatches !== bConsecutiveMatches) {
              return aConsecutiveMatches - bConsecutiveMatches;
            }

            // Em caso de empate, quem chegou primeiro entra primeiro
            const timeA = a.arrivalTime ? new Date(a.arrivalTime) : new Date();
            const timeB = b.arrivalTime ? new Date(b.arrivalTime) : new Date();
            return timeA.getTime() - timeB.getTime();
          });

          const teams: Team[] = [
            {
              id: 'teamA',
              name: 'Time Branco',
              players: sortedPlayers.slice(0, 9),
              score: 0,
              formation: {
                defesa: sortedPlayers.slice(0, 9).filter(p => p.position === 'defesa'),
                meio: sortedPlayers.slice(0, 9).filter(p => p.position === 'meio'),
                ataque: sortedPlayers.slice(0, 9).filter(p => p.position === 'ataque'),
              },
            },
            {
              id: 'teamB',
              name: 'Time Laranja',
              players: sortedPlayers.slice(9, 18),
              score: 0,
              formation: {
                defesa: sortedPlayers.slice(9, 18).filter(p => p.position === 'defesa'),
                meio: sortedPlayers.slice(9, 18).filter(p => p.position === 'meio'),
                ataque: sortedPlayers.slice(9, 18).filter(p => p.position === 'ataque'),
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
            updatedAt: serverTimestamp(),
          });
        }
      }

      toast({
        title: 'Times gerados!',
        description: 'Os times foram formados com sucesso.',
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

      await updateDoc(doc(db, 'games', id), {
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

      await updateDoc(doc(db, 'games', id), {
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

      await updateDoc(doc(db, 'games', id), {
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
        const timeA = a.arrivalTime ? new Date(a.arrivalTime) : new Date();
        const timeB = b.arrivalTime ? new Date(b.arrivalTime) : new Date();
        return timeA.getTime() - timeB.getTime();
      });

      // Encontra o jogador que está sendo movido
      const playerToMove = sortedPlayers.find(p => p.id === playerId);
      if (!playerToMove) return;

      // Remove o jogador da posição atual
      const playersWithoutMoved = sortedPlayers.filter(p => p.id !== playerId);

      // Insere o jogador na nova posição
      playersWithoutMoved.splice(newPosition - 1, 0, playerToMove);

      // Mantém os horários originais de chegada
      const updatedPlayers = playersWithoutMoved.map(player => ({
          ...player,
        // Preserva o horário original de chegada
        arrivalTime: player.arrivalTime
      }));

      await updateDoc(doc(db, 'games', id), {
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
          const timeA = a.arrivalTime ? new Date(a.arrivalTime) : new Date();
          const timeB = b.arrivalTime ? new Date(b.arrivalTime) : new Date();
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
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Box bg="white" borderRadius="lg" shadow="sm" p={{ base: 3, md: 4 }}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size={{ base: 'sm', md: 'md' }}>Ordem de Chegada</Heading>
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
              </Flex>

              <Box mb={6}>
                {game.players && game.players.length > 0 ? (
                  <VStack align="stretch" spacing={3}>
                    <Box mt={4}>
                      <VStack align="stretch" spacing={2}>
                        {game.players
                          .sort((a, b) => {
                            const timeA = a.arrivalTime ? new Date(a.arrivalTime).getTime() : 0;
                            const timeB = b.arrivalTime ? new Date(b.arrivalTime).getTime() : 0;
                            return timeA - timeB;
                          })
                          .map((player, index) => (
                            <Box 
                              key={index} 
                              p={{ base: 3, md: 4 }} 
                              bg="gray.50" 
                              borderRadius="md"
                              _hover={{ bg: 'gray.100' }}
                              transition="all 0.2s"
                            >
                              <Flex align="center" justify="space-between">
                                <Flex align="center" gap={3}>
                                  <Text 
                                    fontWeight="bold" 
                                    fontSize={{ base: 'sm', md: 'md' }}
                                    color="gray.500"
                                  >
                                    {index + 1}º
                                  </Text>
                                  <Avatar 
                                    size={{ base: 'sm', md: 'md' }} 
                                    name={player.name} 
                                    bg={getPositionColor(player.position)} 
                                  />
                                  <Box textAlign="left">
                                    <Text 
                                      fontWeight="medium" 
                                      fontSize={{ base: 'sm', md: 'md' }}
                                      lineHeight="short"
                                    >
                                      {player.name}
                                    </Text>
                                    <Text 
                                      fontSize="xs"
                                      color="gray.500"
                                      textTransform="capitalize"
                                    >
                                      {player.position}
                                    </Text>
                                  </Box>
                              </Flex>
                                <Flex align="center" gap={2}>
                                  <Text 
                                    fontSize={{ base: 'xs', md: 'sm' }}
                                    color="gray.500"
                                  >
                                    {formatArrivalTime(player.arrivalTime)}
                                </Text>
                                  <IconButton
                                    aria-label="Opções do jogador"
                                    icon={<FaEllipsisV />}
                                    size={{ base: 'sm', md: 'md' }}
                                    variant="ghost"
                                    onClick={() => {
                                      if (player) {
                                        setSelectedPlayer(player);
                                        setIsPlayerOptionsOpen(true);
                                      }
                                    }}
                                  />
                            </Flex>
                              </Flex>
                            </Box>
                          ))}
                      </VStack>
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

          <TabPanel>
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

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {match.teams.map((team) => (
                            <Card 
                              key={team.id} 
                              bg={team.id === 'teamA' ? 'white' : 'orange.50'}
                              borderWidth="1px"
                              borderColor={team.id === 'teamA' ? 'gray.200' : 'orange.200'}
                            >
                              <CardBody>
                                <Heading size={{ base: 'sm', md: 'md' }} mb={4}>
                                  {team.name}
                                </Heading>
                                <VStack align="stretch" spacing={4}>
                                  <Box>
                                    <Text fontWeight="bold" mb={2} fontSize={{ base: 'sm', md: 'md' }}>Defesa</Text>
                                    <VStack align="stretch" spacing={2}>
                                      {team.formation?.defesa.map((player, index) => {
                                        const { players } = getPlayersNotInNextMatch(match);
                                        const isNotInNextMatch = players.some(p => p.id === player.id);
                                        return (
                                        <Flex key={index} align="center" justify="space-between">
                                          <Flex align="center">
                                              <Avatar size={{ base: 'xs', md: 'sm' }} name={player.name} mr={2} bg={getPositionColor(player.position)} />
                                              <Text 
                                                color={isNotInNextMatch ? "red.500" : "inherit"}
                                                fontSize={{ base: 'sm', md: 'md' }}
                                              >
                                                {player.name}
                                              </Text>
                                          </Flex>
                                          {match.status === 'in_progress' && (
                                            <IconButton
                                              aria-label="Trocar jogador"
                                              icon={<FaExchangeAlt />}
                                              size={{ base: 'xs', md: 'sm' }}
                                              variant="ghost"
                                              onClick={() => {
                                                setSelectedPlayer(player);
                                                setSelectedTeam(team);
                                                setSelectedMatchForSwap(match);
                                                setIsPlayerSwapOpen(true);
                                              }}
                                            />
                                          )}
                                        </Flex>
                                        );
                                      })}
                                    </VStack>
                                  </Box>
                                  <Box>
                                    <Text fontWeight="bold" mb={2} fontSize={{ base: 'sm', md: 'md' }}>Meio</Text>
                                    <VStack align="stretch" spacing={2}>
                                      {team.formation?.meio.map((player, index) => {
                                        const { players } = getPlayersNotInNextMatch(match);
                                        const isNotInNextMatch = players.some(p => p.id === player.id);
                                        return (
                                        <Flex key={index} align="center" justify="space-between">
                                          <Flex align="center">
                                              <Avatar size={{ base: 'xs', md: 'sm' }} name={player.name} mr={2} bg={getPositionColor(player.position)} />
                                              <Text 
                                                color={isNotInNextMatch ? "red.500" : "inherit"}
                                                fontSize={{ base: 'sm', md: 'md' }}
                                              >
                                                {player.name}
                                              </Text>
                                          </Flex>
                                          {match.status === 'in_progress' && (
                                            <IconButton
                                              aria-label="Trocar jogador"
                                              icon={<FaExchangeAlt />}
                                              size={{ base: 'xs', md: 'sm' }}
                                              variant="ghost"
                                              onClick={() => {
                                                setSelectedPlayer(player);
                                                setSelectedTeam(team);
                                                setSelectedMatchForSwap(match);
                                                setIsPlayerSwapOpen(true);
                                              }}
                                            />
                                          )}
                                        </Flex>
                                        );
                                      })}
                                    </VStack>
                                  </Box>
                                  <Box>
                                    <Text fontWeight="bold" mb={2} fontSize={{ base: 'sm', md: 'md' }}>Ataque</Text>
                                    <VStack align="stretch" spacing={2}>
                                      {team.formation?.ataque.map((player, index) => {
                                        const { players } = getPlayersNotInNextMatch(match);
                                        const isNotInNextMatch = players.some(p => p.id === player.id);
                                        return (
                                        <Flex key={index} align="center" justify="space-between">
                                          <Flex align="center">
                                              <Avatar size={{ base: 'xs', md: 'sm' }} name={player.name} mr={2} bg={getPositionColor(player.position)} />
                                              <Text 
                                                color={isNotInNextMatch ? "red.500" : "inherit"}
                                                fontSize={{ base: 'sm', md: 'md' }}
                                              >
                                                {player.name}
                                              </Text>
                                          </Flex>
                                          {match.status === 'in_progress' && (
                                            <IconButton
                                              aria-label="Trocar jogador"
                                              icon={<FaExchangeAlt />}
                                              size={{ base: 'xs', md: 'sm' }}
                                              variant="ghost"
                                              onClick={() => {
                                                setSelectedPlayer(player);
                                                setSelectedTeam(team);
                                                setSelectedMatchForSwap(match);
                                                setIsPlayerSwapOpen(true);
                                              }}
                                            />
                                          )}
                                        </Flex>
                                        );
                                      })}
                                    </VStack>
                                  </Box>
                                </VStack>
                              </CardBody>
                            </Card>
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
                        <Badge 
                          ml="auto"
                          colorScheme={getPositionColor(player.position)}
                        >
                          {player.position}
                        </Badge>
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
                          Jogadores que não entraram:
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
