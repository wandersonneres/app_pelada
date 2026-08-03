import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game, convertTimestampToDate } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useViewport } from '../hooks/useViewport';
import { PageLoader } from '../components/Loader';
import { searchInputProps } from '../lib/inputProps';
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
  ChevronLeft,
  Search,
} from 'lucide-react';

type StatusFilter = 'all' | 'in_progress' | 'waiting' | 'finished';
const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'in_progress', label: 'Em andamento' },
  { key: 'finished', label: 'Finalizadas' },
];

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const viewport = useViewport();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

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

  const filteredGames = games.filter(game => {
    if (statusFilter !== 'all' && game.status !== statusFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const dateStr = formatDate(convertTimestampToDate(game.date)).toLowerCase();
    return (game.location || '').toLowerCase().includes(q) || dateStr.includes(q);
  });

  const pageSize = viewport === 'desktop' ? 6 : 4;
  const totalPages = Math.max(1, Math.ceil(filteredGames.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedGames = filteredGames.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Volta para a primeira página quando o filtro ou a busca muda.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

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
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-2.5 sm:mr-auto">
              <h2 className="font-heading font-bold text-[17px] text-ink">Todas as peladas</h2>
              <span className="text-[12px] font-bold text-wine bg-wine-tint px-2 py-0.5 rounded-full">
                {filteredGames.length}
              </span>
            </div>
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-icon" strokeWidth={2.2} />
              <input
                {...searchInputProps}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por local ou data"
                className="w-full pl-9 pr-3 py-2 text-[13px] bg-surface border border-line rounded-xl placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine transition-colors appearance-none [&::-webkit-search-cancel-button]:appearance-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors ${
                  statusFilter === f.key
                    ? 'bg-wine text-white'
                    : 'bg-surface border border-line text-ink-medium hover:bg-paper'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredGames.length === 0 ? (
            <div className="bg-surface border border-line rounded-2xl px-5 py-8 text-center text-[13px] text-ink-soft">
              Nenhuma pelada encontrada.
            </div>
          ) : (
            <>
              {/* Cards — todos os dispositivos (2 colunas no desktop) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {pagedGames.map(game => (
                  <button
                    key={game.id}
                    onClick={() => navigate(`/game/${game.id}`)}
                    className="w-full text-left bg-surface border border-line rounded-2xl p-4 flex items-center gap-3 hover:border-[#d8d2c2] hover:shadow-[0_6px_24px_-12px_rgba(27,26,22,0.25)] transition-all"
                  >
                    <div className="w-10 h-10 flex-none rounded-xl bg-wine-tint text-wine flex items-center justify-center">
                      <Calendar className="w-[18px] h-[18px]" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-[15px] text-ink capitalize leading-tight">
                          {formatDate(convertTimestampToDate(game.date))}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${getStatusColor(game.status)}`}>
                          <span className={`w-[5px] h-[5px] rounded-full ${getStatusDot(game.status)}`} />
                          {getStatusText(game.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-x-3 gap-y-1 text-[12px] text-ink-soft mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 min-w-0">
                          <MapPin className="w-3.5 h-3.5 flex-none text-ink-icon" strokeWidth={2.2} />
                          <span className="truncate">{game.location}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-ink-icon" strokeWidth={2.2} />
                          <span className="font-stat">{game.players?.length || 0}/{game.maxPlayers}</span>
                        </span>
                        <span className="font-stat">
                          {game.matches?.length || 0} {game.matches?.length === 1 ? 'partida' : 'partidas'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 flex-none text-ink-icon" strokeWidth={2.2} />
                  </button>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2.5 mt-4">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-2 text-[13px] font-semibold rounded-xl border border-line bg-surface text-ink-medium hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={2.4} />
                    Anterior
                  </button>
                  <span className="text-[12.5px] text-ink-soft font-medium tabular-nums px-1">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-2 text-[13px] font-semibold rounded-xl border border-line bg-surface text-ink-medium hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4" strokeWidth={2.4} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
