import { Box, Text, Avatar, Flex, Select, Badge, HStack, Tooltip, VStack, useColorModeValue } from '@chakra-ui/react';
import { Player, Team, Goal } from '../types';
import { useState, useEffect } from 'react';
import { FaFutbol, FaHandsHelping, FaStar } from 'react-icons/fa';

interface TacticalViewProps {
  team: Team;
  formation: string;
  onFormationChange: (formation: string) => void;
  goals?: Goal[];
  teamColor: string;
  isHomeTeam?: boolean;
}

const FORMATIONS = ['4-3-2', '3-3-3', '3-4-2', '2-4-3', '3-3-2', '2-3-3', '3-2-3'];

export const TacticalView = ({ team, formation = '4-3-2', onFormationChange, goals = [], teamColor, isHomeTeam = false }: TacticalViewProps) => {
  const [positions, setPositions] = useState<Player[][]>([]);
  const bgColor = useColorModeValue('#1a2c38', '#1a2c38');
  const lineColor = useColorModeValue('rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)');

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

  const renderSkillLevel = (level: number) => {
    return (
      <HStack spacing={0.5}>
        {[...Array(5)].map((_, index) => (
          <Box 
            key={index}
            color={index < level ? 'yellow.400' : 'gray.600'}
            fontSize="8px"
          >
            <FaStar />
          </Box>
        ))}
      </HStack>
    );
  };

  useEffect(() => {
    const formationArray = formation.split('-').map(Number);
    const sortedPlayers = [...team.players].sort((a, b) => {
      // Primeiro por posição (defesa -> meio -> ataque)
      const positionOrder = { defesa: 1, meio: 2, ataque: 3 };
      if (positionOrder[a.position] !== positionOrder[b.position]) {
        return positionOrder[a.position] - positionOrder[b.position];
      }
      
      // Depois por idade (mais velho -> mais novo)
      const ageOrder = {
        '+50': 1,
        '41-50': 2,
        '31-40': 3,
        '21-30': 4,
        '15-20': 5
      };
      if (ageOrder[a.ageGroup] !== ageOrder[b.ageGroup]) {
        return ageOrder[a.ageGroup] - ageOrder[b.ageGroup];
      }
      
      // Por fim por habilidade (menos habilidoso -> mais habilidoso)
      return a.skillLevel - b.skillLevel;
    });

    // Distribuir os jogadores nas posições da formação
    const newPositions: Player[][] = [];
    let playerIndex = 0;
    
    formationArray.forEach((playersInLine) => {
      const line: Player[] = [];
      for (let i = 0; i < playersInLine && playerIndex < sortedPlayers.length; i++) {
        line.push(sortedPlayers[playerIndex++]);
      }
      newPositions.push(line);
    });

    setPositions(newPositions);
  }, [formation, team.players]);

  return (
    <Box
      h="300px"
      bg={bgColor}
      borderRadius="md"
      position="relative"
      overflow="hidden"
      transform={isHomeTeam ? 'rotate(180deg)' : 'none'}
    >
      {/* Seletor de Formação */}
      <Box position="absolute" top={2} right={2} zIndex={1}>
        <Select
          size="xs"
          value={formation}
          onChange={(e) => onFormationChange(e.target.value)}
          bg="whiteAlpha.200"
          color="white"
          border="none"
          width="70px"
          fontSize="xs"
          transform={isHomeTeam ? 'rotate(180deg)' : 'none'}
          _hover={{ bg: 'whiteAlpha.300' }}
        >
          {FORMATIONS.map((f) => (
            <option key={f} value={f} style={{ backgroundColor: '#1a2c38' }}>{f}</option>
          ))}
        </Select>
      </Box>

      {/* Campo de futebol */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        borderWidth="1px"
        borderColor={lineColor}
        m={2}
      >
        {/* Linha do meio */}
        <Box
          position="absolute"
          top="50%"
          left="0"
          right="0"
          height="1px"
          bg={lineColor}
          transform="translateY(-50%)"
        />
        
        {/* Círculo central */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="40px"
          h="40px"
          borderRadius="50%"
          border="1px solid"
          borderColor={lineColor}
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="2px"
            h="2px"
            borderRadius="50%"
            bg={lineColor}
          />
        </Box>

        {/* Área superior */}
        <Box
          position="absolute"
          top="0"
          left="50%"
          transform="translateX(-50%)"
          w="120px"
          h="40px"
          border="1px solid"
          borderColor={lineColor}
          borderTop="none"
        >
          <Box
            position="absolute"
            top="0"
            left="50%"
            transform="translateX(-50%)"
            w="60px"
            h="20px"
            border="1px solid"
            borderColor={lineColor}
            borderTop="none"
          />
        </Box>

        {/* Área inferior */}
        <Box
          position="absolute"
          bottom="0"
          left="50%"
          transform="translateX(-50%)"
          w="120px"
          h="40px"
          border="1px solid"
          borderColor={lineColor}
          borderBottom="none"
        >
          <Box
            position="absolute"
            bottom="0"
            left="50%"
            transform="translateX(-50%)"
            w="60px"
            h="20px"
            border="1px solid"
            borderColor={lineColor}
            borderBottom="none"
          />
        </Box>

        {/* Jogadores */}
        {positions.map((line, lineIndex) => (
          <Flex
            key={lineIndex}
            position="absolute"
            left="0"
            right="0"
            justify="space-evenly"
            align="center"
            style={{
              top: `${((lineIndex + 1) * 100) / (positions.length + 1)}%`,
              transform: 'translateY(-50%)',
            }}
          >
            {line.map((player) => {
              const stats = getPlayerStats(player.id);
              return (
                <Box 
                  key={player.id} 
                  textAlign="center" 
                  transform={isHomeTeam ? 'rotate(180deg)' : 'none'}
                >
                  <VStack spacing={1}>
                    <Avatar
                      size="sm"
                      name={player.name}
                      bg={teamColor}
                      color="white"
                      cursor="pointer"
                    />
                    <Text
                      fontSize="xs"
                      color="white"
                      fontWeight="medium"
                      textShadow="0 0 4px rgba(0,0,0,0.8)"
                      width="60px"
                      noOfLines={1}
                    >
                      {player.name.split(' ')[0]}
                    </Text>
                  </VStack>
                </Box>
              );
            })}
          </Flex>
        ))}
      </Box>
    </Box>
  );
}; 