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
      <div className="pelada-page flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-blue"></div>
      </div>
    );
  }

  return (
    <div className="pelada-page w-full flex items-start justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-lg">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-ink-muted"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="font-heading text-2xl font-extrabold tracking-wide text-heading text-center flex-1">Editar Pelada</h1>
        <div className="w-8" />
      </div>
      <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-6">
        <div className="space-y-2">
          <label className="field-label">Data</label>
          <input
            type="date"
            className="field-input"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="field-label">Local</label>
          <input
            className="field-input"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="field-label">Observações</label>
          <textarea
            className="field-input min-h-[80px] resize-y"
            value={formData.observations}
            onChange={e => setFormData({ ...formData, observations: e.target.value })}
            placeholder="Adicione observações sobre a pelada (opcional)"
          />
        </div>
        {error && <div className="text-danger-soft text-sm font-medium">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-team-blue text-white font-semibold text-lg hover:brightness-110 transition-all shadow-[0_8px_20px_-8px_rgba(59,130,246,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
      </div>
    </div>
  );
} 