import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types/index';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaUsers, FaUserClock, FaUserCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarRating } from '../components/StarRating';

export function Players() {
  const [players, setPlayers] = useState<User[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<'all' | 'mensalista' | 'diarista'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        const playersList = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data } as User;
          })
          .filter(user => user.username !== 'admin')
          .sort((a, b) => {
            const nameA = a.playerInfo?.name || a.username;
            const nameB = b.playerInfo?.name || b.username;
            return nameA.localeCompare(nameB);
          });

        setPlayers(playersList);
        setFilteredPlayers(playersList);
      } catch (error) {
        console.error('Erro ao buscar jogadores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    const filtered = players.filter(player => {
      const searchLower = searchTerm.toLowerCase();
      const name = (player.playerInfo?.name || player.username).toLowerCase();
      const email = (player.email || '').toLowerCase();
      
      // Filtro de busca
      const matchesSearch = name.includes(searchLower) || email.includes(searchLower);
      
      // Filtro de tipo de pagamento
      const matchesPaymentType = paymentTypeFilter === 'all' || 
        player.playerInfo?.paymentType === paymentTypeFilter;

      return matchesSearch && matchesPaymentType;
    });
    setFilteredPlayers(filtered);
  }, [searchTerm, players, paymentTypeFilter]);

  const handleDeletePlayer = async (playerId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este jogador? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsDeleting(playerId);
    try {
      await deleteDoc(doc(db, 'users', playerId));
      
      // Atualizar as listas de jogadores
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      setFilteredPlayers(prev => prev.filter(p => p.id !== playerId));
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="pelada-page flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-team-blue"></div>
      </div>
    );
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'defesa':
        return 'bg-team-blue/15 text-team-blue-soft';
      case 'meio':
        return 'bg-meio/15 text-meio-soft';
      case 'ataque':
        return 'bg-danger/15 text-danger-soft';
      default:
        return 'bg-surface-hover text-ink-muted';
    }
  };

  return (
    <div className="pelada-page w-full py-6 sm:py-8">
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10">
        <div className="glass-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-5 sm:mb-6">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-wide text-heading">Jogadores</h1>
              <p className="text-sm sm:text-base text-ink-muted mt-0.5 sm:mt-1">
                {filteredPlayers.length === players.length
                  ? `${players.length} jogador${players.length !== 1 ? 'es' : ''} cadastrado${players.length !== 1 ? 's' : ''}`
                  : `${filteredPlayers.length} de ${players.length} jogador${players.length !== 1 ? 'es' : ''} encontrado${filteredPlayers.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-team-blue hover:brightness-110 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-[0_8px_20px_-8px_rgba(59,130,246,0.7)]"
            >
              <FaUserPlus className="w-4 h-4" />
              Novo Jogador
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Barra de Busca */}
            <div className="relative flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar jogador por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="field-input pl-10 text-sm sm:text-base"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim w-4 h-4" />
              </div>
              {searchTerm && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-ink-muted hover:text-heading text-sm"
                  >
                    Limpar
                  </button>
                </div>
              )}
            </div>

            {/* Filtro de Tipo de Pagamento */}
            <div className="w-full sm:w-auto">
              <div className="grid grid-cols-3 gap-2 sm:flex">
                <button
                  onClick={() => setPaymentTypeFilter('all')}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-colors ${
                    paymentTypeFilter === 'all'
                      ? 'bg-team-blue/15 border-team-blue/30 text-team-blue-soft'
                      : 'bg-surface border-divider text-ink-muted hover:bg-surface-hover'
                  }`}
                >
                  <FaUsers className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">Todos</span>
                </button>
                <button
                  onClick={() => setPaymentTypeFilter('mensalista')}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-colors ${
                    paymentTypeFilter === 'mensalista'
                      ? 'bg-success/15 border-success/30 text-success-soft'
                      : 'bg-surface border-divider text-ink-muted hover:bg-surface-hover'
                  }`}
                >
                  <FaUserCheck className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">Mensalistas</span>
                </button>
                <button
                  onClick={() => setPaymentTypeFilter('diarista')}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-colors ${
                    paymentTypeFilter === 'diarista'
                      ? 'bg-team-orange/15 border-team-orange/30 text-team-orange-soft'
                      : 'bg-surface border-divider text-ink-muted hover:bg-surface-hover'
                  }`}
                >
                  <FaUserClock className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">Diaristas</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-ink-muted md:col-span-2 lg:col-span-3 2xl:col-span-4">
                Nenhum jogador encontrado
              </div>
            ) : (
              filteredPlayers.map(player => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface border border-divider rounded-2xl p-4 hover:border-divider-strong transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full avatar-grad flex items-center justify-center text-white font-heading font-bold text-xl ring-1 ring-black/10 shrink-0">
                      {player.playerInfo?.name?.charAt(0).toUpperCase() || player.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-heading leading-snug break-words">
                        {player.playerInfo?.name || player.username}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {player.playerInfo?.position && (
                          <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold font-heading tracking-wide ${getPositionColor(player.playerInfo.position)}`}>
                            {player.playerInfo.position === 'defesa' ? 'DEF' :
                             player.playerInfo.position === 'meio' ? 'MEI' : 'ATA'}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${player.playerInfo?.paymentType === 'mensalista' ? 'bg-success/15 text-success-soft' : player.playerInfo?.paymentType === 'diarista' ? 'bg-team-orange/15 text-team-orange-soft' : 'bg-surface-hover text-ink-muted'}`}>{player.playerInfo?.paymentType === 'mensalista' ? 'Mensalista' : player.playerInfo?.paymentType === 'diarista' ? 'Diarista' : 'N/D'}</span>
                        {player.playerInfo?.ageGroup && (
                          <span className="text-[11px] text-ink-muted">{player.playerInfo.ageGroup} anos</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => navigate(`/users/${player.id}/edit`)}
                        className="p-2 text-ink-muted hover:text-team-blue-soft hover:bg-team-blue/10 rounded-lg transition-colors"
                        title="Editar jogador"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        disabled={isDeleting === player.id}
                        className="p-2 text-ink-muted hover:text-danger-soft hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Remover jogador"
                      >
                        {isDeleting === player.id ? (
                          <div className="w-4 h-4 border-2 border-danger border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaTrash className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {player.playerInfo?.skillLevel && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-divider">
                      <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">Habilidade</span>
                      <StarRating value={player.playerInfo.skillLevel} size="sm" readOnly />
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 