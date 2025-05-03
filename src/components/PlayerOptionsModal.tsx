import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Select,
  FormControl,
  FormLabel,
  useColorModeValue,
  Divider,
  Box,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';
import { FaUserMinus } from 'react-icons/fa';
import { Player } from '../types';
import { StarRating } from './StarRating';

interface PlayerOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  totalPlayers: number;
  onUpdatePosition: (position: 'defesa' | 'meio' | 'ataque') => void;
  onUpdateArrivalOrder: (order: number) => void;
  onUpdateSkillLevel: (skillLevel: 1 | 2 | 3 | 4 | 5) => void;
  onUpdateAgeGroup: (ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50') => void;
  onRemovePlayer: () => void;
}

export function PlayerOptionsModal({
  isOpen,
  onClose,
  player,
  totalPlayers,
  onUpdatePosition,
  onUpdateArrivalOrder,
  onUpdateSkillLevel,
  onUpdateAgeGroup,
  onRemovePlayer,
}: PlayerOptionsModalProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!player) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', sm: 'md' }}>
      <ModalOverlay />
      <ModalContent bg={bg} borderColor={borderColor}>
        <ModalHeader>Opções do Jogador</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="medium" mb={2}>Alterar Posição</Text>
              <SimpleGrid columns={3} spacing={2}>
                <Button
                  onClick={() => onUpdatePosition('defesa')}
                  colorScheme={player.position === 'defesa' ? 'yellow' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  Defesa
                </Button>
                <Button
                  onClick={() => onUpdatePosition('meio')}
                  colorScheme={player.position === 'meio' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  Meio
                </Button>
                <Button
                  onClick={() => onUpdatePosition('ataque')}
                  colorScheme={player.position === 'ataque' ? 'red' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  Ataque
                </Button>
              </SimpleGrid>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="medium" mb={2}>Nível de Habilidade</Text>
              <StarRating
                value={player.skillLevel}
                onChange={(level) => {
                  onUpdateSkillLevel(level as 1 | 2 | 3 | 4 | 5);
                  player.skillLevel = level as 1 | 2 | 3 | 4 | 5;
                }}
                size="md"
                showLabel={true}
              />
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="medium" mb={2}>Faixa Etária</Text>
              <SimpleGrid columns={2} spacing={2}>
                <Button
                  onClick={() => onUpdateAgeGroup('15-20')}
                  colorScheme={player.ageGroup === '15-20' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  15-20 anos
                </Button>
                <Button
                  onClick={() => onUpdateAgeGroup('21-30')}
                  colorScheme={player.ageGroup === '21-30' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  21-30 anos
                </Button>
                <Button
                  onClick={() => onUpdateAgeGroup('31-40')}
                  colorScheme={player.ageGroup === '31-40' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  31-40 anos
                </Button>
                <Button
                  onClick={() => onUpdateAgeGroup('41-50')}
                  colorScheme={player.ageGroup === '41-50' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  41-50 anos
                </Button>
                <Button
                  onClick={() => onUpdateAgeGroup('+50')}
                  colorScheme={player.ageGroup === '+50' ? 'blue' : 'gray'}
                  size={{ base: 'sm', md: 'md' }}
                >
                  +50 anos
                </Button>
              </SimpleGrid>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="medium" mb={2}>Ordem de Chegada</Text>
              <Box
                maxH="120px"
                overflowY="auto"
                p={1}
                borderRadius="md"
                borderWidth={0}
                borderColor={undefined}
                sx={{
                  '::-webkit-scrollbar': {
                    width: '4px',
                    background: 'transparent',
                  },
                  '::-webkit-scrollbar-thumb': {
                    background: 'rgba(0,0,0,0.08)',
                    borderRadius: '8px',
                  },
                  '::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(0,0,0,0.15)',
                  },
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0,0,0,0.08) transparent',
                }}
              >
                <SimpleGrid columns={3} spacing={2}>
                  {[...Array(totalPlayers).keys()].map((i) => {
                    const order = i + 1;
                    return (
                      <Button
                        key={order}
                        onClick={() => onUpdateArrivalOrder(order)}
                        colorScheme={player.arrivalOrder === order ? 'green' : 'gray'}
                        size={{ base: 'sm', md: 'md' }}
                        _focus={{ boxShadow: 'none', outline: 'none' }}
                      >
                        {order}
                      </Button>
                    );
                  })}
                </SimpleGrid>
              </Box>
            </Box>

            <Divider />

            <Button
              leftIcon={<FaUserMinus />}
              colorScheme="red"
              variant="outline"
              onClick={onRemovePlayer}
            >
              Remover Jogador
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 