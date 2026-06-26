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
  const [showAllGames, setShowAllGames] = useState(false);
  const INITIAL_GAMES_SHOWN = 6;

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
        return 'bg-warning/15 text-warning-soft border border-warning/30';
      case 'in_progress':
        return 'bg-team-blue/15 text-team-blue-soft border border-team-blue/30';
      case 'finished':
        return 'bg-success/15 text-success-soft border border-success/30';
      default:
        return 'bg-surface-hover text-ink-muted border border-divider';
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
      <div className="pelada-page flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-blue"></div>
      </div>
    );
  }

  return (
    <div className="pelada-page">
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex flex-row justify-between items-center gap-3 mb-8">
          <div className="min-w-0">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-heading tracking-wide">Peladas</h1>
            <p className="text-sm text-ink-muted mt-1 hidden xs:block sm:block">Cadastre e gerencie suas peladas</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {activeGames.length > 0 && (user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
              <button
                onClick={() => navigate('/new-game')}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-team-blue text-white font-semibold rounded-xl hover:brightness-110 transition-all shadow-[0_8px_20px_-8px_rgba(59,130,246,0.7)] whitespace-nowrap"
              >
                <Calendar className="w-5 h-5 shrink-0" />
                Nova Pelada
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/players')}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-surface text-ink-soft font-semibold rounded-xl border border-divider hover:bg-surface-hover transition-colors whitespace-nowrap"
              >
                <Users className="w-5 h-5 shrink-0" />
                Jogadores
              </button>
            )}
          </div>
        </div>

        {activeGames.length > 0 ? (
          <>
            <h2 className="font-heading text-xl font-bold text-heading tracking-wide mb-4">Peladas Ativas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {activeGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 cursor-pointer hover:border-divider-strong transition-colors"
                  onClick={() => navigate(`/game/${game.id}`)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(game.status)}`}>
                        {getStatusText(game.status)}
                    </span>
                    <span className="text-sm text-ink-muted">
                        {game.players?.length || 0} / {game.maxPlayers} jogadores
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-team-blue" />
                      <span className="font-semibold text-heading">{formatDate(convertTimestampToDate(game.date))}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-success" />
                      <span className="text-ink-soft">{game.location}</span>
                    </div>

                      {game.observations && (
                      <p className="text-sm text-ink-muted line-clamp-2">
                          {game.observations}
                      </p>
                      )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-divider">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/game/${game.id}`);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface text-ink-soft font-semibold rounded-xl border border-divider hover:bg-surface-hover transition-colors"
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
          <div className="glass-card text-center py-14 px-6 mb-10">
            <AlertCircle className="w-12 h-12 text-ink-dim mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold text-heading mb-2">Nenhuma pelada ativa</h3>
            <p className="text-ink-muted mb-6">Crie uma nova pelada para começar</p>
            {(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
            <button
              onClick={() => navigate('/new-game')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-team-blue text-white font-semibold rounded-xl hover:brightness-110 transition-all shadow-[0_8px_20px_-8px_rgba(59,130,246,0.7)]"
            >
              <Plus className="w-5 h-5" />
                Criar Primeira Pelada
              </button>
            )}
          </div>
        )}

        {games.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold text-heading tracking-wide">Todas as Peladas</h2>
              <span className="text-sm text-ink-muted">{games.length} no total</span>
            </div>
            <div className="glass-card overflow-hidden">
              <div className={`overflow-x-auto ${showAllGames ? 'max-h-[55vh] overflow-y-auto' : ''}`}>
                <table className="w-full">
                  <thead className="bg-[var(--surface-solid)] sticky top-0 z-10">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Data</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider hidden sm:table-cell">Local</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wider hidden md:table-cell">Jogadores</th>
                      <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wider hidden md:table-cell">Partidas</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider">
                    {(showAllGames ? games : games.slice(0, INITIAL_GAMES_SHOWN)).map((game) => (
                      <tr
                        key={game.id}
                        className="hover:bg-surface-hover cursor-pointer transition-colors"
                        onClick={() => navigate(`/game/${game.id}`)}
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-heading">
                          {formatDate(convertTimestampToDate(game.date))}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-ink-soft hidden sm:table-cell">
                          {game.location}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(game.status)}`}>
                      {getStatusText(game.status)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-ink-soft text-center hidden md:table-cell font-heading">
                          {game.players?.length || 0} / {game.maxPlayers}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-ink-soft text-center hidden md:table-cell font-heading">
                          {game.matches?.length || 0}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                          <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/game/${game.id}`);
                      }}
                            className="inline-flex p-2 rounded-lg text-team-blue-soft hover:text-heading hover:bg-surface-hover transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {games.length > INITIAL_GAMES_SHOWN && (
                <button
                  onClick={() => setShowAllGames(v => !v)}
                  className="w-full py-3 text-sm font-semibold text-team-blue-soft hover:text-heading hover:bg-surface-hover border-t border-divider transition-colors"
                >
                  {showAllGames ? 'Ver menos' : `Ver todas (${games.length})`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 