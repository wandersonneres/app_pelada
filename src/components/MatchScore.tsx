import { Box, Flex, Text } from '@chakra-ui/react';
import { Match } from '../types';

interface MatchScoreProps {
  match: Match;
}

export function MatchScore({ match }: MatchScoreProps) {
  // Calcula os gols de cada time
  const teamAGoals = match.goals?.filter(goal => 
    match.teams[0].players.some(p => p.id === goal.scorerId)
  ).length || 0;

  const teamBGoals = match.goals?.filter(goal => 
    match.teams[1].players.some(p => p.id === goal.scorerId)
  ).length || 0;

  return (
    <Flex 
      justify="center" 
      align="center" 
      gap={4} 
      bg="gray.100" 
      p={3} 
      borderRadius="md"
      mb={4}
    >
      <Text fontWeight="bold" fontSize="xl" color="gray.600">
        Time Branco
      </Text>
      <Flex 
        bg="white" 
        px={4} 
        py={2} 
        borderRadius="md" 
        shadow="sm"
        align="center"
        gap={3}
      >
        <Text fontSize="2xl" fontWeight="bold" color="gray.600">
          {teamAGoals}
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color="gray.400">
          x
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color="orange.500">
          {teamBGoals}
        </Text>
      </Flex>
      <Text fontWeight="bold" fontSize="xl" color="orange.500">
        Time Laranja
      </Text>
    </Flex>
  );
} 