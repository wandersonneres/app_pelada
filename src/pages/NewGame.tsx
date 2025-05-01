import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game } from '../types';

export function NewGame() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [observations, setObservations] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      
      const gameData = {
        date,
        location: 'Vargem',
        maxPlayers: 18,
        status: 'waiting',
        players: [],
        matches: [],
        observations: observations.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'games'), gameData);
      
      toast({
        title: 'Pelada criada!',
        description: 'Sua pelada foi criada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate(`/game/${docRef.id}`);
    } catch (error) {
      console.error('Erro ao criar pelada:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar a pelada.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Nova Pelada</Heading>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Observações</FormLabel>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Adicione observações sobre a pelada (opcional)"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={isLoading}
            >
              Criar Pelada
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 