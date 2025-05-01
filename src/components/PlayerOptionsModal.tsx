import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Button,
  SimpleGrid,
  Divider,
  Box,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaUserMinus } from 'react-icons/fa';
import { Player } from '../types';

interface PlayerOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  totalPlayers: number;
  onUpdatePosition: (position: 'defesa' | 'meio' | 'ataque') => void;
  onUpdateArrivalOrder: (order: number) => void;
  onRemovePlayer: () => void;
}

export function PlayerOptionsModal({
  isOpen,
  onClose,
  player,
  totalPlayers,
  onUpdatePosition,
  onUpdateArrivalOrder,
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
              <Text fontWeight="medium" mb={2}>Alterar Ordem de Chegada</Text>
              <SimpleGrid 
                columns={3} 
                spacing={2}
                maxH="200px"
                overflowY="auto"
              >
                {Array.from({ length: totalPlayers }, (_, i) => (
                  <Button
                    key={i}
                    size={{ base: 'sm', md: 'md' }}
                    variant="ghost"
                    onClick={() => onUpdateArrivalOrder(i + 1)}
                    colorScheme={player.arrivalOrder === i + 1 ? "blue" : "gray"}
                  >
                    {i + 1}º
                  </Button>
                ))}
              </SimpleGrid>
            </Box>

            <Divider />

            <Button
              leftIcon={<FaUserMinus />}
              colorScheme="red"
              variant="ghost"
              onClick={onRemovePlayer}
              size={{ base: 'sm', md: 'md' }}
            >
              Remover Jogador
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 