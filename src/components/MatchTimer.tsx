import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Select,
  HStack,
  VStack,
  IconButton,
  Badge,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaStop, FaFutbol } from 'react-icons/fa';
import { Team } from '../types';
import { GoalScorerModal } from './GoalScorerModal';

interface MatchTimerProps {
  teamA: Team;
  teamB: Team;
  isFirstMatch: boolean;
  onGoalScored: (teamId: string, scorerId: string, assisterId?: string) => void;
}

export const MatchTimer = ({ teamA, teamB, isFirstMatch, onGoalScored }: MatchTimerProps) => {
  const [time, setTime] = useState(isFirstMatch ? 15 : 10);
  const [running, setRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(time * 60);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('#1a2c38', '#1a2c38');
  const textColor = useColorModeValue('white', 'white');
  const borderColor = useColorModeValue('rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)');

  const resetTimer = useCallback(() => {
    setRemainingSeconds(time * 60);
    setRunning(false);
  }, [time]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (running && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0) {
      setRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running, remainingSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoalScored = (team: Team) => {
    setSelectedTeam(team);
    onOpen();
  };

  const handleGoalConfirmed = (scorerId: string, assisterId?: string) => {
    if (selectedTeam) {
      if (selectedTeam.id === teamA.id) {
        setScoreA((prev) => prev + 1);
      } else {
        setScoreB((prev) => prev + 1);
      }
      onGoalScored(selectedTeam.id, scorerId, assisterId);
    }
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      shadow="sm"
      mb={4}
      overflow="hidden"
    >
      {/* Placar e Timer */}
      <Flex
        w="100%"
        justify="space-between"
        align="center"
        p={4}
        position="relative"
      >
        {/* Time A */}
        <VStack align="center" w="35%">
          <Text fontWeight="bold" fontSize="lg" color={textColor}>{teamA.name}</Text>
          <Text fontSize="6xl" fontWeight="bold" color={textColor}>{scoreA}</Text>
          <Button
            leftIcon={<FaFutbol />}
            colorScheme="whiteAlpha"
            variant="ghost"
            onClick={() => handleGoalScored(teamA)}
            isDisabled={!running}
            size="sm"
            color={textColor}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            Gol
          </Button>
        </VStack>

        {/* Timer */}
        <VStack align="center" w="30%" position="relative">
          <Box position="absolute" top={-2}>
            <Select
              size="xs"
              value={time}
              onChange={(e) => {
                setTime(Number(e.target.value));
                setRemainingSeconds(Number(e.target.value) * 60);
              }}
              isDisabled={running}
              bg="transparent"
              color={textColor}
              border="none"
              fontSize="xs"
              _hover={{ bg: 'whiteAlpha.100' }}
            >
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
            </Select>
          </Box>
          <Text 
            fontSize="5xl" 
            fontWeight="bold" 
            fontFamily="mono" 
            color={textColor}
            mt={8}
          >
            {formatTime(remainingSeconds)}
          </Text>
          <HStack spacing={2} mt={2}>
            <IconButton
              aria-label={running ? "Pausar" : "Iniciar"}
              icon={running ? <FaPause /> : <FaPlay />}
              colorScheme={running ? "orange" : "green"}
              onClick={() => setRunning(!running)}
              size="xs"
              variant="ghost"
              color={textColor}
              _hover={{ bg: 'whiteAlpha.200' }}
            />
            <IconButton
              aria-label="Parar"
              icon={<FaStop />}
              colorScheme="red"
              onClick={resetTimer}
              size="xs"
              variant="ghost"
              color={textColor}
              _hover={{ bg: 'whiteAlpha.200' }}
            />
          </HStack>
          <Badge
            colorScheme={running ? "green" : remainingSeconds === 0 ? "red" : "yellow"}
            fontSize="xs"
            mt={2}
          >
            {running ? "Em Andamento" : remainingSeconds === 0 ? "Finalizado" : "Aguardando"}
          </Badge>
        </VStack>

        {/* Time B */}
        <VStack align="center" w="35%">
          <Text fontWeight="bold" fontSize="lg" color={textColor}>{teamB.name}</Text>
          <Text fontSize="6xl" fontWeight="bold" color={textColor}>{scoreB}</Text>
          <Button
            leftIcon={<FaFutbol />}
            colorScheme="whiteAlpha"
            variant="ghost"
            onClick={() => handleGoalScored(teamB)}
            isDisabled={!running}
            size="sm"
            color={textColor}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            Gol
          </Button>
        </VStack>
      </Flex>

      {/* Modal de Gols */}
      {selectedTeam && (
        <GoalScorerModal
          isOpen={isOpen}
          onClose={onClose}
          team={selectedTeam}
          onConfirm={handleGoalConfirmed}
        />
      )}
    </Box>
  );
}; 