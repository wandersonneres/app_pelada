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
  Divider,
  Box,
  Text,
  useColorModeValue,
  Avatar,
  Flex,
} from '@chakra-ui/react';
import { FaExchangeAlt } from 'react-icons/fa';
import { Player } from '../types';

interface PlayerSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player;
  otherTeamPlayers: Player[];
  waitingPlayers: Player[];
  onSwapPlayers: (otherPlayer: Player) => void;
  onReplacePlayer: (waitingPlayer: Player) => void;
}

export function PlayerSwapModal({
  isOpen,
  onClose,
  currentPlayer,
  otherTeamPlayers,
  waitingPlayers,
  onSwapPlayers,
  onReplacePlayer,
}: PlayerSwapModalProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', sm: 'md' }}>
      <ModalOverlay />
      <ModalContent bg={bg} borderColor={borderColor}>
        <ModalHeader>Trocar Jogador</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="medium" mb={2}>Trocar com jogador do outro time</Text>
              <VStack spacing={2} align="stretch">
                {otherTeamPlayers.map((player) => (
                  <Button
                    key={player.id}
                    onClick={() => onSwapPlayers(player)}
                    variant="ghost"
                    size={{ base: 'sm', md: 'md' }}
                    justifyContent="flex-start"
                  >
                    <Avatar size="sm" name={player.name} mr={2} />
                    {player.name}
                  </Button>
                ))}
              </VStack>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="medium" mb={2}>Substituir por jogador da lista de espera</Text>
              <VStack spacing={2} align="stretch">
                {waitingPlayers.map((player) => (
                  <Button
                    key={player.id}
                    onClick={() => onReplacePlayer(player)}
                    variant="ghost"
                    size={{ base: 'sm', md: 'md' }}
                    justifyContent="flex-start"
                  >
                    <Avatar size="sm" name={player.name} mr={2} />
                    {player.name}
                  </Button>
                ))}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 