import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game, Player, convertTimestampToDate } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StarRating } from '../components/StarRating';

export function PlayerConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerSkillLevel, setPlayerSkillLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [playerAgeGroup, setPlayerAgeGroup] = useState<'15-20' | '21-30' | '31-40' | '41-50' | '+50'>('21-30');
  const [isLoading, setIsLoading] = useState(false);

  const handleStarClick = useCallback((level: number) => {
    setPlayerSkillLevel(level as 1 | 2 | 3 | 4 | 5);
  }, []);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, 'games', id), (doc) => {
      if (doc.exists()) {
        setGame({ id: doc.id, ...doc.data() } as Game);
      }
    });

    return () => unsubscribe();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !id || !playerName.trim()) return;

    try {
      setIsLoading(true);
      const newPlayer: Player = {
        id: Math.random().toString(36).substr(2, 9),
        name: playerName.trim(),
        email: '',
        confirmed: true,
        arrivalTime: new Date(),
        position: 'meio',
        arrivalOrder: game.players.length + 1,
        skillLevel: playerSkillLevel,
        ageGroup: playerAgeGroup,
      };

      await updateDoc(doc(db, 'games', id), {
        players: arrayUnion(newPlayer),
        updatedAt: new Date(),
      });

      setPlayerName('');
      setPlayerSkillLevel(3);
      setPlayerAgeGroup('21-30');
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Confirmação de Jogador</h1>
          <p className="text-gray-500 text-center mb-6">
            Confirme sua presença e preencha seus dados para participar da pelada.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Seu nome</label>
              <input
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border-gray-200"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Digite seu nome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nível de Habilidade</label>
              <StarRating value={playerSkillLevel} onChange={handleStarClick} size="md" showLabel={true} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Faixa Etária</label>
              <select
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border-gray-200"
                value={playerAgeGroup}
                onChange={(e) => setPlayerAgeGroup(e.target.value as '15-20' | '21-30' | '31-40' | '41-50' | '+50')}
              >
                <option value="15-20">15-20 anos</option>
                <option value="21-30">21-30 anos</option>
                <option value="31-40">31-40 anos</option>
                <option value="41-50">41-50 anos</option>
                <option value="+50">+50 anos</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
              disabled={isLoading}
            >
              Confirmar Presença
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Confirmação de Jogador</h1>
        <p className="text-gray-500 text-center mb-6">
          Confirme sua presença e preencha seus dados para participar da pelada.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Seu nome</label>
            <input
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border-gray-200"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Digite seu nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nível de Habilidade</label>
            <StarRating value={playerSkillLevel} onChange={handleStarClick} size="md" showLabel={true} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Faixa Etária</label>
            <select
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border-gray-200"
              value={playerAgeGroup}
              onChange={(e) => setPlayerAgeGroup(e.target.value as '15-20' | '21-30' | '31-40' | '41-50' | '+50')}
            >
              <option value="15-20">15-20 anos</option>
              <option value="21-30">21-30 anos</option>
              <option value="31-40">31-40 anos</option>
              <option value="41-50">41-50 anos</option>
              <option value="+50">+50 anos</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
            disabled={isLoading}
          >
            Confirmar Presença
          </button>
        </form>
      </div>
    </div>
  );
} 