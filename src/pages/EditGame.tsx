import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Textarea,
  VStack,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game } from '../types';

export function EditGame() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    observations: '',
  });

  useEffect(() => {
    const fetchGame = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, 'games', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const gameData = { id: docSnap.id, ...docSnap.data() } as Game;
          setGame(gameData);
          
          // Tratamento seguro da data
          let gameDate;
          if (gameData.date instanceof Date) {
            gameDate = gameData.date;
          } else if (gameData.date && typeof gameData.date.toDate === 'function') {
            gameDate = gameData.date.toDate();
          } else {
            gameDate = new Date();
          }

          // Formata a data para YYYY-MM-DD
          const year = gameDate.getFullYear();
          const month = String(gameDate.getMonth() + 1).padStart(2, '0');
          const day = String(gameDate.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          
          setFormData({
            date: formattedDate,
            location: gameData.location,
            observations: gameData.observations || '',
          });
        } else {
          toast({
            title: 'Erro',
            description: 'Pelada não encontrada.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao buscar pelada:', error);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao buscar os dados da pelada.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !game) return;

    setIsSaving(true);

    try {
      const date = new Date(formData.date);
      date.setHours(0, 0, 0, 0);

      await updateDoc(doc(db, 'games', id), {
        date,
        location: formData.location,
        observations: formData.observations.trim() || null,
        updatedAt: new Date(),
      });

      toast({
        title: 'Sucesso',
        description: 'Pelada atualizada com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate(`/game/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar pelada:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar a pelada.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Editar Pelada</Heading>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Data</FormLabel>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Local</FormLabel>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Observações</FormLabel>
              <Textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Adicione observações sobre a pelada (opcional)"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={isSaving}
            >
              Salvar Alterações
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 