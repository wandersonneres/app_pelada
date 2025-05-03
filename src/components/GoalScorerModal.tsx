import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Button,
  VStack,
  Text,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { Team, Player } from '../types';
import { useState } from 'react';

interface GoalScorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onConfirm: (scorerId: string, assisterId?: string) => void;
}

export const GoalScorerModal = ({ isOpen, onClose, team, onConfirm }: GoalScorerModalProps) => {
  const [scorerId, setScorerId] = useState('');
  const [assisterId, setAssisterId] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleConfirm = () => {
    if (scorerId) {
      onConfirm(scorerId, assisterId || undefined);
      setScorerId('');
      setAssisterId('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs">
      <ModalOverlay />
      <ModalContent bg={bgColor} border="1px solid" borderColor={borderColor}>
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="lg" color={textColor}>Registrar Gol</Text>
            <Text fontSize="sm" color="gray.500">{team.name}</Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" color={textColor}>Goleador</FormLabel>
              <Select
                placeholder="Selecione o goleador"
                value={scorerId}
                onChange={(e) => setScorerId(e.target.value)}
                size="sm"
                bg="white"
                borderColor={borderColor}
              >
                {team.players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" color={textColor}>Assistência (opcional)</FormLabel>
              <Select
                placeholder="Selecione o assistente"
                value={assisterId}
                onChange={(e) => setAssisterId(e.target.value)}
                size="sm"
                bg="white"
                borderColor={borderColor}
              >
                <option value="">Sem assistência</option>
                {team.players
                  .filter((player) => player.id !== scorerId)
                  .map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
              </Select>
            </FormControl>

            <Box w="100%" pt={4}>
              <Button
                colorScheme="green"
                onClick={handleConfirm}
                w="100%"
                size="sm"
                isDisabled={!scorerId}
              >
                Confirmar Gol
              </Button>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}; 