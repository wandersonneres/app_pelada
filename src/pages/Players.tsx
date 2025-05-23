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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'defesa':
        return 'bg-yellow-100 text-yellow-800';
      case 'meio':
        return 'bg-blue-100 text-blue-800';
      case 'ataque':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full py-4 sm:py-6">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Jogadores</h1>
              <p className="text-sm sm:text-base text-gray-500 mt-0.5 sm:mt-1">
                {filteredPlayers.length === players.length 
                  ? `${players.length} jogador${players.length !== 1 ? 'es' : ''} cadastrado${players.length !== 1 ? 's' : ''}`
                  : `${filteredPlayers.length} de ${players.length} jogador${players.length !== 1 ? 'es' : ''} encontrado${filteredPlayers.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <FaUserPlus className="w-4 h-4" />
              Novo Jogador
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Barra de Busca */}
            <div className="relative flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar jogador por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {searchTerm && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    Limpar
                  </button>
                </div>
              )}
            </div>

            {/* Filtro de Tipo de Pagamento */}
            <div className="w-full sm:w-auto">
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentTypeFilter('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    paymentTypeFilter === 'all'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaUsers className="w-4 h-4" />
                  <span className="text-sm font-medium">Todos</span>
                </button>
                <button
                  onClick={() => setPaymentTypeFilter('mensalista')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    paymentTypeFilter === 'mensalista'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaUserCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Mensalistas</span>
                </button>
                <button
                  onClick={() => setPaymentTypeFilter('diarista')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    paymentTypeFilter === 'diarista'
                      ? 'bg-orange-50 border-orange-200 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaUserClock className="w-4 h-4" />
                  <span className="text-sm font-medium">Diaristas</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum jogador encontrado
              </div>
            ) : (
              filteredPlayers.map(player => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base sm:text-lg">
                        {player.playerInfo?.name?.charAt(0).toUpperCase() || player.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {player.playerInfo?.name || player.username}
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${player.playerInfo?.paymentType === 'mensalista' ? 'bg-green-100 text-green-800' : player.playerInfo?.paymentType === 'diarista' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500'}`}>{player.playerInfo?.paymentType === 'mensalista' ? 'Mensalista' : player.playerInfo?.paymentType === 'diarista' ? 'Diarista' : 'Tipo não informado'}</span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate">
                          {player.email}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                          {player.playerInfo?.position && (
                            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getPositionColor(player.playerInfo.position)}`}>
                              {player.playerInfo.position === 'defesa' ? 'DEF' : 
                               player.playerInfo.position === 'meio' ? 'MEI' : 'ATA'}
                            </span>
                          )}
                          {player.playerInfo?.ageGroup && (
                            <span className="text-[10px] sm:text-xs text-gray-500">{player.playerInfo.ageGroup} anos</span>
                          )}
                          {player.playerInfo?.skillLevel && (
                            <div className="scale-75 sm:scale-100 origin-left">
                              <StarRating 
                                value={player.playerInfo.skillLevel} 
                                size="sm" 
                                showLabel={false}
                                onChange={() => {}}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => navigate(`/users/${player.id}/edit`)}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar jogador"
                      >
                        <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        disabled={isDeleting === player.id}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Remover jogador"
                      >
                        {isDeleting === player.id ? (
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 