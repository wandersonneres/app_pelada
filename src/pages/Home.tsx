import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game, convertTimestampToDate } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from '../components/Loader';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Eye,
  CalendarPlus,
  Trophy,
  ChevronRight,
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
        return 'bg-state-warningBg text-state-warning';
      case 'in_progress':
        return 'bg-wine-tint text-wine';
      case 'finished':
        return 'bg-state-success/10 text-state-success';
      default:
        return 'bg-line-soft text-ink-medium';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-state-warning';
      case 'in_progress':
        return 'bg-wine';
      case 'finished':
        return 'bg-state-success';
      default:
        return 'bg-ink-soft';
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
    return <PageLoader full={false} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-[28px] md:text-[34px] leading-none text-ink tracking-tight">
            Peladas
          </h1>
          <p className="text-[13.5px] text-ink-soft mt-2">Cadastre e gerencie suas peladas</p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          {(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
            <button
              onClick={() => navigate('/new-game')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-wine text-white text-[13.5px] font-semibold rounded-xl hover:bg-wine-dark transition-colors flex-1 sm:flex-none"
            >
              <CalendarPlus className="w-[18px] h-[18px]" strokeWidth={2.2} />
              Nova Pelada
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/players')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#ded8c9] bg-surface text-ink-medium text-[13.5px] font-semibold rounded-xl hover:bg-paper transition-colors flex-1 sm:flex-none"
            >
              <Users className="w-[18px] h-[18px]" strokeWidth={2.2} />
              Jogadores
            </button>
          )}
        </div>
      </div>

      {/* Peladas Ativas */}
      {activeGames.length > 0 ? (
        <section className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <h2 className="font-heading font-bold text-[17px] text-ink">Peladas ativas</h2>
            <span className="text-[12px] font-bold text-wine bg-wine-tint px-2 py-0.5 rounded-full">
              {activeGames.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {activeGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="group bg-surface border border-line rounded-2xl p-5 cursor-pointer hover:border-[#d8d2c2] hover:shadow-[0_6px_24px_-12px_rgba(27,26,22,0.25)] transition-all"
                onClick={() => navigate(`/game/${game.id}`)}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${getStatusColor(game.status)}`}>
                    <span className={`w-[6px] h-[6px] rounded-full ${getStatusDot(game.status)}`} />
                    {getStatusText(game.status)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-soft">
                    <Users className="w-3.5 h-3.5" strokeWidth={2.2} />
                    {game.players?.length || 0} 
                  </span>
                </div>

                <div className="flex items-start gap-2.5 mb-3">
                  <div className="w-9 h-9 flex-none rounded-xl bg-wine-tint text-wine flex items-center justify-center">
                    <Calendar className="w-[18px] h-[18px]" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-bold text-[16px] text-ink capitalize leading-tight">
                      {formatDate(convertTimestampToDate(game.date))}
                    </div>
                    <div className="flex items-center gap-1 text-[12.5px] text-ink-medium mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 flex-none text-ink-icon" strokeWidth={2.2} />
                      <span className="truncate">{game.location}</span>
                    </div>
                  </div>
                </div>

                {game.observations && (
                  <p className="text-[12.5px] text-ink-soft line-clamp-2 mb-1">
                    {game.observations}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-line-soft">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/game/${game.id}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#ded8c9] bg-surface text-ink-medium text-[13px] font-semibold rounded-xl hover:bg-paper group-hover:border-wine/30 transition-colors"
                  >
                    <Eye className="w-4 h-4" strokeWidth={2.2} />
                    Ver Detalhes
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ) : (
        <div className="bg-surface border border-line rounded-2xl px-5 py-4 mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-wine-tint text-wine flex items-center justify-center flex-none">
            <Trophy className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-bold text-[15px] text-ink">Nenhuma pelada ativa</div>
            <div className="text-[13px] text-ink-soft">Crie uma nova pelada para começar a organizar o jogo.</div>
          </div>
          {(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
            <button
              onClick={() => navigate('/new-game')}
              className="flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-wine text-white text-[13.5px] font-semibold rounded-xl hover:bg-wine-dark transition-colors"
            >
              <Plus className="w-[18px] h-[18px]" strokeWidth={2.2} />
              Criar pelada
            </button>
          )}
        </div>
      )}

      {/* Todas as Peladas */}
      {games.length > 0 && (
        <section>
          <h2 className="font-heading font-bold text-[17px] text-ink mb-4">Todas as peladas</h2>
          <div className="bg-surface border border-line rounded-2xl overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <thead className="sticky top-0 z-10 bg-paper">
                  <tr>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-ink-soft uppercase tracking-wide">Data</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-ink-soft uppercase tracking-wide">Local</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-ink-soft uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-ink-soft uppercase tracking-wide">Jogadores</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-ink-soft uppercase tracking-wide">Partidas</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold text-ink-soft uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {games.map((game) => (
                    <tr
                      key={game.id}
                      className="hover:bg-paper cursor-pointer transition-colors"
                      onClick={() => navigate(`/game/${game.id}`)}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap text-[13px] font-medium text-ink capitalize">
                        {formatDate(convertTimestampToDate(game.date))}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[13px] text-ink-medium">
                        {game.location}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(game.status)}`}>
                          <span className={`w-[5px] h-[5px] rounded-full ${getStatusDot(game.status)}`} />
                          {getStatusText(game.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-stat text-[13px] text-ink-medium">
                        {game.players?.length || 0}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-stat text-[13px] text-ink-medium">
                        {game.matches?.length || 0}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/game/${game.id}`);
                          }}
                          className="inline-flex items-center gap-1 text-wine hover:text-wine-dark text-[12.5px] font-semibold transition-colors"
                        >
                          Ver
                          <ChevronRight className="w-4 h-4" strokeWidth={2.4} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
