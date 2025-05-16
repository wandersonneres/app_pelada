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
  HStack,
} from '@chakra-ui/react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game } from '../types';
import { FaChevronLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export function EditGame() {
  const { user } = useAuth();
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
    if (!id) {
      navigate('/');
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'games', id),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const gameData = {
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          } as Game;
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
            description: 'Jogo não encontrado.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          navigate('/');
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar jogo:', error);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao carregar o jogo.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSaving(true);
      // Monta a data a partir dos valores do input (ano, mês, dia) para evitar que a data seja interpretada como UTC e diminua um dia.
      const [year, month, day] = formData.date.split('-').map(Number);
      const date = new Date(year, month - 1, day, 0, 0, 0, 0);

      // Garante que todos os campos necessários existam antes de atualizar
      const gameData = {
        date,
        location: formData.location,
        observations: formData.observations || null,
        updatedAt: new Date(),
        updatedBy: user.id, // Usando user.id em vez de user.uid
      };

      await updateDoc(doc(db, 'games', id), gameData);
      toast({
        title: 'Pelada atualizada com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      console.error('Erro ao atualizar pelada:', error);
      toast({
        title: 'Erro ao atualizar pelada.',
        description: 'Tente novamente mais tarde.',
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
        <HStack justify="space-between" align="center">
          <Button
            leftIcon={<FaChevronLeft />}
            variant="ghost"
            onClick={() => navigate(-1)}
            size="md"
          />
          <Heading size="lg">Editar Pelada</Heading>
          <Box w="70px" /> {/* Espaçador para manter o título centralizado */}
        </HStack>

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