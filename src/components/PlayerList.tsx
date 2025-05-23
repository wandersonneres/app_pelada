import { Timestamp } from 'firebase/firestore';
import {
  Box,
  Flex,
  Text,
  Avatar,
  HStack,
  VStack,
  IconButton,
  useColorModeValue,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { FaEllipsisV, FaFutbol, FaHandsHelping } from 'react-icons/fa';
import { Player, Goal } from '../types';
import { StarIcon } from '@chakra-ui/icons';

interface PlayerListProps {
  players: Player[];
  onPlayerOptions?: (player: Player) => void;
  goals?: Goal[];
  showStats?: boolean;
  showOrder?: boolean;
  variant?: 'lineup' | 'arrival';
  teamColor?: string;
  renderSkillLevel?: (level: number) => React.ReactNode;
  formatArrivalTime?: (date: Date | Timestamp | undefined) => string;
  consecutiveMatches?: (playerId: string) => number;
}

export const PlayerList = ({ 
  players, 
  onPlayerOptions, 
  goals = [], 
  showStats = true,
  showOrder = true,
  variant = 'arrival',
  teamColor = 'gray.600',
  renderSkillLevel,
  formatArrivalTime = (date) => {
    if (!date) return '--:--';
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleTimeString();
    }
    return new Date(date).toLocaleTimeString();
  },
  consecutiveMatches
}: PlayerListProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

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

  const getPlayerStats = (playerId: string) => {
    const playerGoals = goals.filter(g => g.scorerId === playerId).length;
    const playerAssists = goals.filter(g => g.assisterId === playerId).length;
    return { goals: playerGoals, assists: playerAssists };
  };

  // Função para ordenar os jogadores
  const sortPlayers = (players: Player[]) => {
    return [...players].sort((a, b) => {
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
    });
  };

  if (variant === 'arrival') {
    return (
      <VStack spacing={2} align="stretch">
        {players.map((player, index) => {
          const stats = getPlayerStats(player.id);
          const hasStats = stats.goals > 0 || stats.assists > 0;

          return (
            <Box
              key={player.id}
              p={{ base: 1, md: 3 }}
              bg={bgColor}
              borderRadius="lg"
              shadow="sm"
              _hover={{ shadow: 'md' }}
              transition="all 0.2s"
            >
              <Flex align="center" justify="space-between" p={{ base: 2, md: 4 }}>
                <HStack spacing={{ base: 2, md: 4 }}>
                  {showOrder && (
                    <Flex
                      align="center"
                      justify="center"
                      w={{ base: '18px', md: '28px' }}
                      h={{ base: '18px', md: '28px' }}
                      borderRadius="lg"
                      bg={useColorModeValue('gray.100', 'gray.700')}
                    >
                      <Text
                        color={mutedColor}
                        //fontSize={{ base: 'xs', md: 'sm' }}
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        {(index + 1).toString().padStart(2, '0')}
                      </Text>
                    </Flex>
                  )}
                  <Avatar
                    //size={{ base: 'sm', md: 'md' }}
                    size="sm"
                    name={player.name}
                    bg={`${getPositionColor(player.position)}.500`}
                    color="white"
                  />
                  <VStack align="start" spacing={1} minW={0}>
                    <Text
                      color={textColor}
                      fontWeight="semibold"
                      fontSize={{ base: 'sm', md: 'md' }}
                      isTruncated
                    >
                      {player.name}
                    </Text>
                    <HStack spacing={{ base: 1, md: 2 }} align="center">
                      <Badge
                        colorScheme={getPositionColor(player.position)}
                        fontSize={{ base: '2xs', md: 'xs' }}
                        textTransform="uppercase"
                        fontWeight="medium"
                      >
                        {typeof window !== 'undefined' /*&& window.innerWidth < 768*/
                          ? player.position === 'defesa'
                            ? 'DEF'
                            : player.position === 'meio'
                              ? 'MEI'
                              : player.position === 'ataque'
                                ? 'ATA'
                                : player.position
                          : player.position}
                      </Badge>
                      <Text
                        color={mutedColor}
                        fontSize={{ base: '2xs', md: 'xs' }}
                      >
                        {player.ageGroup}
                      </Text>
                      <Text color={mutedColor} fontSize={{ base: '2xs', md: 'xs' }}>
                        {renderSkillLevel ? renderSkillLevel(player.skillLevel) : (
                          <HStack spacing={0.5}>
                            {[1, 2, 3, 4, 5].map((l) => (
                              <Icon
                                key={l}
                                as={StarIcon}
                                boxSize={{ base: 2, md: 3 }}
                                color={l <= player.skillLevel ? "yellow.400" : "gray.200"}
                              />
                            ))}
                          </HStack>
                        )}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
                <HStack spacing={{ base: 2, md: 4 }}>
                  {showStats && hasStats && (
                    <HStack spacing={{ base: 1, md: 3 }}>
                      {stats.goals > 0 && (
                        <HStack spacing={1}>
                          <FaFutbol color={mutedColor} size={14} />
                          <Text color={mutedColor} fontSize={{ base: '2xs', md: 'sm' }} fontWeight="medium">
                            {stats.goals}
                          </Text>
                        </HStack>
                      )}
                      {stats.assists > 0 && (
                        <HStack spacing={1}>
                          <FaHandsHelping color={mutedColor} size={14} />
                          <Text color={mutedColor} fontSize={{ base: '2xs', md: 'sm' }} fontWeight="medium">
                            {stats.assists}
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                  )}
                  <Text fontSize={{ base: '2xs', md: 'sm' }} color="gray.500">
                    {formatArrivalTime(player.arrivalTime)}
                  </Text>
                  {onPlayerOptions && (
                    <IconButton
                      aria-label="Opções do jogador"
                      icon={<FaEllipsisV />}
                      variant="ghost"
                      colorScheme="gray"
                      size={{ base: 'xs', md: 'sm' }}
                      onClick={() => onPlayerOptions(player)}
                    />
                  )}
                </HStack>
              </Flex>
            </Box>
          );
        })}
      </VStack>
    );
  }

  // Variant === 'lineup'
  return (
    <VStack spacing={2} align="stretch">
      {sortPlayers(players).map((player) => {
        const stats = getPlayerStats(player.id);
        const hasStats = stats.goals > 0 || stats.assists > 0;

        return (
          <Box
            key={player.id}
            bg={bgColor}
            p={3}
            borderRadius="md"
            _hover={{ bg: hoverBgColor }}
            transition="all 0.2s"
          >
            <Flex align="center" justify="space-between">
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  name={player.name}
                  bg={teamColor}
                  color="white"
                />
                <Text
                  color={textColor}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  {player.name}
                </Text>
              </HStack>

              <HStack spacing={3}>
                {showStats && hasStats && (
                  <HStack spacing={2}>
                    {stats.goals > 0 && (
                      <HStack spacing={1}>
                        <FaFutbol color={mutedColor} size={12} />
                        <Text color={mutedColor} fontSize="xs" fontWeight="medium">
                          {stats.goals}
                        </Text>
                      </HStack>
                    )}
                    {stats.assists > 0 && (
                      <HStack spacing={1}>
                        <FaHandsHelping color={mutedColor} size={12} />
                        <Text color={mutedColor} fontSize="xs" fontWeight="medium">
                          {stats.assists}
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                )}
                <Badge
                  colorScheme={getPositionColor(player.position)}
                  fontSize={{ base: '2xs', md: 'xs' }}
                  textTransform="uppercase"
                >
                  {typeof window !== 'undefined' /*&& window.innerWidth < 768*/
                    ? player.position === 'defesa'
                      ? 'DEF'
                      : player.position === 'meio'
                        ? 'MEI'
                        : player.position === 'ataque'
                          ? 'ATA'
                          : player.position
                    : player.position}
                </Badge>
                {onPlayerOptions && (
                  <IconButton
                    aria-label="Opções do jogador"
                    icon={<FaEllipsisV />}
                    variant="ghost"
                    colorScheme="gray"
                    size="xs"
                    onClick={() => onPlayerOptions(player)}
                  />
                )}
              </HStack>
            </Flex>
          </Box>
        );
      })}
    </VStack>
  );
}; 