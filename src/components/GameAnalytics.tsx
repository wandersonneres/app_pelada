import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Game, Player, Match, Team } from '../types';

interface GameAnalyticsProps {
  game: Game;
}

interface PlayerStats {
  id: string;
  name: string;
  position: string;
  goals: number;
  assists: number;
  victories: number;
  matches: number;
  winRate: number;
}

export function GameAnalytics({ game }: GameAnalyticsProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const calculatePlayerStats = (): PlayerStats[] => {
    const stats: { [key: string]: PlayerStats } = {};

    // Inicializa estatísticas para todos os jogadores
    game.players.forEach(player => {
      stats[player.id] = {
        id: player.id,
        name: player.name,
        position: player.position,
        goals: 0,
        assists: 0,
        victories: 0,
        matches: 0,
        winRate: 0
      };
    });

    // Calcula estatísticas baseado nas partidas
    game.matches.forEach(match => {
      if (match.status === 'finished') {
        // Contabiliza gols e assistências
        if (match.goals) {
          match.goals.forEach(goal => {
            if (goal.scorerId && stats[goal.scorerId]) {
              stats[goal.scorerId].goals += 1;
            }
            if (goal.assisterId && stats[goal.assisterId]) {
              stats[goal.assisterId].assists += 1;
            }
          });
        }

        // Contabiliza vitórias e partidas jogadas
        match.teams.forEach(team => {
          team.players.forEach(player => {
            if (stats[player.id]) {
              stats[player.id].matches += 1;
              if (match.winner === team.id) {
                stats[player.id].victories += 1;
              }
            }
          });
        });
      }
    });

    // Calcula taxa de vitória
    Object.values(stats).forEach(player => {
      player.winRate = player.matches > 0 
        ? Math.round((player.victories / player.matches) * 100) 
        : 0;
    });

    return Object.values(stats)
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.winRate - a.winRate);
  };

  const playerStats = calculatePlayerStats();

  const totalMatches = game.matches.filter(m => m.status === 'finished').length;
  const totalGoals = game.matches.reduce((sum, match) => {
    if (match.status === 'finished' && match.goals) {
      return sum + match.goals.length;
    }
    return sum;
  }, 0);

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'defesa':
        return 'yellow';
      case 'meio':
        return 'blue';
      case 'ataque':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Stat bg={bgColor} p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Total de Partidas</StatLabel>
          <StatNumber>{totalMatches}</StatNumber>
        </Stat>
        <Stat bg={bgColor} p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Total de Gols</StatLabel>
          <StatNumber>{totalGoals}</StatNumber>
          <StatHelpText>
            Média de {totalGoals > 0 && totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0.0'} por partida
          </StatHelpText>
        </Stat>
        <Stat bg={bgColor} p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Total de Jogadores</StatLabel>
          <StatNumber>{game.players.length}</StatNumber>
        </Stat>
      </SimpleGrid>

      <Box bg={bgColor} p={4} borderRadius="lg" shadow="sm">
        <Heading size="md" mb={4}>Estatísticas dos Jogadores</Heading>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Jogador</Th>
                <Th>Posição</Th>
                <Th isNumeric>Gols</Th>
                <Th isNumeric>Assistências</Th>
                <Th isNumeric>Partidas</Th>
                <Th isNumeric>Vitórias</Th>
                <Th isNumeric>Taxa de Vitória</Th>
              </Tr>
            </Thead>
            <Tbody>
              {playerStats.map((player) => (
                <Tr key={player.id}>
                  <Td>
                    <Text fontWeight="medium">{player.name}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={getPositionColor(player.position)} fontWeight="medium">
                      {player.position}
                    </Badge>
                  </Td>
                  <Td isNumeric>{player.goals}</Td>
                  <Td isNumeric>{player.assists}</Td>
                  <Td isNumeric>{player.matches}</Td>
                  <Td isNumeric>{player.victories}</Td>
                  <Td isNumeric>{player.winRate}%</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
} 