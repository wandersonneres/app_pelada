import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaChevronLeft } from 'react-icons/fa';

export function NewGame() {
  const navigate = useNavigate();
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
      
      navigate(`/game/${docRef.id}`);
    } catch (error) {
      console.error('Erro ao criar pelada:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pelada-page w-full py-6 sm:py-8">
      <div className="relative z-10 max-w-2xl mx-auto px-3 sm:px-4">
        <div className="glass-card p-5 sm:p-7">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full text-ink-muted hover:bg-surface-hover transition-colors"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="font-heading text-2xl font-extrabold tracking-wide text-heading text-center flex-1">Nova Pelada</h1>
            <div className="w-9" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="field-label">Observações</label>
              <textarea
                className="field-input min-h-[110px] resize-y"
                value={observations}
                onChange={e => setObservations(e.target.value)}
                placeholder="Adicione observações sobre a pelada (opcional)"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-team-blue hover:brightness-110 text-white font-semibold py-2.5 rounded-xl transition-all shadow-[0_8px_20px_-8px_rgba(59,130,246,0.7)] disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Pelada'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 