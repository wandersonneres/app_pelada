import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game, convertTimestampToDate } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Eye,
  AlertCircle,
  Circle
} from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'games'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const gamesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestampToDate(doc.data().date),
        createdAt: convertTimestampToDate(doc.data().createdAt),
        updatedAt: convertTimestampToDate(doc.data().updatedAt),
      })) as Game[];

      setGames(gamesData);
      setIsLoading(false);
    }, (error) => {
      console.error('Erro ao carregar jogos:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'finished':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Aguardando';
      case 'in_progress':
        return 'Em andamento';
      case 'finished':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const activeGames = games.filter(game => game.status !== 'finished');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Peladas</h1>
          <p className="text-sm text-gray-500">Cadastre e gerencie suas peladas</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          {(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
            <button
              onClick={() => navigate('/new-game')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Nova Pelada
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/players')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Users className="w-5 h-5" />
              Jogadores
            </button>
          )}
        </div>
      </div>

      {activeGames.length > 0 ? (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Peladas Ativas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {activeGames.map((game, index) => (
              <motion.div
                key={game.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
                onClick={() => navigate(`/game/${game.id}`)}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(game.status)}`}>
                      {getStatusText(game.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                      {game.players?.length || 0} / {game.maxPlayers} jogadores
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{formatDate(convertTimestampToDate(game.date))}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">{game.location}</span>
                  </div>

                    {game.observations && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                        {game.observations}
                    </p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/game/${game.id}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalhes
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : ( 
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma pelada ativa</h3>
          <p className="text-gray-500 mb-6">Crie uma nova pelada para começar</p>
          {(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
          <button
            onClick={() => navigate('/new-game')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
              Criar Primeira Pelada
            </button>
          )}
        </div>
      )}

      {games.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Todas as Peladas</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jogadores</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partidas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {games.map((game) => (
                    <tr
                      key={game.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/game/${game.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(convertTimestampToDate(game.date))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                    {getStatusText(game.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.players?.length || 0} / {game.maxPlayers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.matches?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/game/${game.id}`);
                    }}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 