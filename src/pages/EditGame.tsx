import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from '../components/Loader';

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
    return <PageLoader full={false} />;
  }

  return (
    <div className="w-full py-10 px-4">
      <div className="max-w-lg mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-line-soft transition-colors text-ink-icon"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-heading font-bold text-center flex-1 text-ink">Editar Pelada</h1>
        <div className="w-8" />
      </div>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-surface border border-line rounded-xl p-6 flex flex-col gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1">Data</label>
          <input
            type="date"
            className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wine focus:border-wine text-ink"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1">Local</label>
          <input
            className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wine focus:border-wine text-ink"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1">Observações</label>
          <textarea
            className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wine focus:border-wine min-h-[80px] text-ink"
            value={formData.observations}
            onChange={e => setFormData({ ...formData, observations: e.target.value })}
            placeholder="Adicione observações sobre a pelada (opcional)"
          />
        </div>
        {error && <div className="text-state-live text-sm font-medium">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-wine text-white font-semibold text-lg hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
} 