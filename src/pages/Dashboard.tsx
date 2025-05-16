import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game } from '../types';
import { GameCard } from '../components/GameCard';
import { FaCalendarAlt } from 'react-icons/fa';

export function Dashboard() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'games'),
      where('date', '>=', new Date()),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gamesList: Game[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        gamesList.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Game);
      });
      setGames(gamesList);
    });

    return () => unsubscribe();
  }, []);

  const handleNewGame = () => {
    navigate('/new-game');
  };

  const handleDeleteGame = (gameId: string) => {
    // Implemente a lógica para deletar um jogo
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Próximas Peladas</h1>
          <button
            onClick={handleNewGame}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            <FaCalendarAlt className="w-4 h-4" />
            Nova Pelada
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map(game => (
            <GameCard key={game.id} game={game} onDelete={handleDeleteGame} />
              ))}
        </div>
      </div>
    </div>
  );
} 