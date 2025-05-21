import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function EditGame() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    observations: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    setIsLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, 'games', id),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const gameData = {
            id: docSnap.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          } as Game;
          setGame(gameData);

          let gameDate;
          if (gameData.date instanceof Date) {
            gameDate = gameData.date;
          } else if (gameData.date && typeof gameData.date.toDate === 'function') {
            gameDate = gameData.date.toDate();
          } else {
            gameDate = new Date();
          }
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
          setError('Pelada não encontrada.');
          navigate('/');
        }
        setIsLoading(false);
      },
      (error) => {
        setError('Erro ao buscar pelada.');
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('teste',user);  
    console.log('teste',id);
    if (!user || !id) {
      setError('Usuário não autenticado.');
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      const [year, month, day] = formData.date.split('-').map(Number);
      const date = new Date(year, month - 1, day, 0, 0, 0, 0);
      
      console.log('Dados do usuário:', user);
      console.log('ID do jogo:', id);
      
      const gameData = {
        date,
        location: formData.location,
        observations: formData.observations || null,
        updatedAt: new Date(),
        updatedBy: user.username,
      };
      
      console.log('Dados a serem salvos:', gameData);
      
      await updateDoc(doc(db, 'games', id), gameData);
      navigate('/');
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError('Erro ao atualizar pelada. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-center flex-1">Editar Pelada</h1>
        <div className="w-8" />
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Data</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Local</label>
          <input
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
            value={formData.observations}
            onChange={e => setFormData({ ...formData, observations: e.target.value })}
            placeholder="Adicione observações sobre a pelada (opcional)"
          />
        </div>
        {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
} 