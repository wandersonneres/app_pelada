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
    <div className="w-full py-4 sm:py-6">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FaChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-xl font-bold text-center flex-1">Nova Pelada</h1>
            <div className="w-8" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border-gray-200"
                value={observations}
                onChange={e => setObservations(e.target.value)}
                placeholder="Adicione observações sobre a pelada (opcional)"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
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