import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types/index';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaUsers, FaUserClock, FaUserCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageLoader } from '../components/Loader';

function Stars({ level }: { level: number }) {
  return (
    <span className="tracking-[1px] leading-none text-[13px]">
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} style={{ color: i < level ? '#d99a1a' : '#ded8c9' }}>★</span>
      ))}
    </span>
  );
}

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
    return <PageLoader label="Carregando jogadores…" />;
  }

  const POSITION_LABEL: Record<string, string> = { defesa: 'DEF', meio: 'MEI', ataque: 'ATA' };
  const POSITION_DOT: Record<string, string> = {
    defesa: '#d99a1a',
    meio: '#0d7a72',
    ataque: '#c2560f',
  };

  // Contadores (derivados dos jogadores carregados)
  const mensalistas = players.filter(p => p.playerInfo?.paymentType === 'mensalista').length;
  const diaristas = players.filter(p => p.playerInfo?.paymentType === 'diarista').length;
  const byPos = {
    def: players.filter(p => p.playerInfo?.position === 'defesa').length,
    mei: players.filter(p => p.playerInfo?.position === 'meio').length,
    ata: players.filter(p => p.playerInfo?.position === 'ataque').length,
  };

  return (
    <div className="w-full min-h-screen bg-paper py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
              Todos os jogadores
            </h1>
            <p className="text-sm text-ink-soft mt-1">
              {filteredPlayers.length === players.length
                ? `${players.length} jogador${players.length !== 1 ? 'es' : ''} cadastrado${players.length !== 1 ? 's' : ''} no grupo`
                : `${filteredPlayers.length} de ${players.length} jogador${players.length !== 1 ? 'es' : ''} encontrado${filteredPlayers.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-wine hover:bg-wine-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <FaUserPlus className="w-4 h-4" />
            Novo jogador
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="bg-surface border border-line rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <span className="w-11 h-11 flex-none rounded-full bg-ink text-white font-stat font-bold text-base flex items-center justify-center">
              {players.length}
            </span>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-ink-soft font-semibold">Cadastrados</div>
              <div className="text-xs text-ink-medium mt-0.5">no grupo</div>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-2xl px-4 py-3.5">
            <div className="text-[11px] uppercase tracking-wide text-ink-soft font-semibold">Mensalistas</div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-heading font-extrabold text-2xl text-wine">{mensalistas}</span>
              <span className="text-[11px] text-ink-soft">· Diaristas {diaristas}</span>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-2xl px-4 py-3.5">
            <div className="text-[11px] uppercase tracking-wide text-ink-soft font-semibold">Por posição</div>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs font-bold text-ink">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#d99a1a' }} />{byPos.def} DEF</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#0d7a72' }} />{byPos.mei} MEI</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#c2560f' }} />{byPos.ata} ATA</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Barra de Busca */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-icon w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar jogador por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 text-sm border border-line rounded-xl bg-surface text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-wine focus:border-transparent transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-icon hover:text-wine transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filtro de Tipo de Pagamento */}
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentTypeFilter('all')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                paymentTypeFilter === 'all'
                  ? 'bg-wine-tint border-wine text-wine'
                  : 'border-line bg-surface text-ink-medium hover:bg-paper'
              }`}
            >
              <FaUsers className="w-4 h-4" />
              <span>Todos</span>
            </button>
            <button
              onClick={() => setPaymentTypeFilter('mensalista')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                paymentTypeFilter === 'mensalista'
                  ? 'bg-wine-tint border-wine text-wine'
                  : 'border-line bg-surface text-ink-medium hover:bg-paper'
              }`}
            >
              <FaUserCheck className="w-4 h-4" />
              <span>Mensalistas</span>
            </button>
            <button
              onClick={() => setPaymentTypeFilter('diarista')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                paymentTypeFilter === 'diarista'
                  ? 'bg-state-warningBg border-state-warning text-state-warning'
                  : 'border-line bg-surface text-ink-medium hover:bg-paper'
              }`}
            >
              <FaUserClock className="w-4 h-4" />
              <span>Diaristas</span>
            </button>
          </div>
        </div>

        {/* Lista */}
        {filteredPlayers.length === 0 ? (
          <div className="bg-surface border border-line rounded-2xl py-14 flex flex-col items-center justify-center gap-2 text-center">
            <FaUsers className="w-8 h-8 text-ink-icon" />
            <p className="text-ink-soft text-sm">Nenhum jogador encontrado</p>
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {filteredPlayers.map(player => {
              const displayName = player.playerInfo?.name || player.username;
              const position = player.playerInfo?.position;
              const paymentType = player.playerInfo?.paymentType;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-surface border border-line rounded-2xl p-4 flex items-start gap-3.5 hover:border-[#ded8c9] hover:shadow-sm transition-all"
                >
                  <span className="w-11 h-11 flex-none rounded-full bg-ink text-white font-stat font-bold text-base flex items-center justify-center">
                    {displayName.charAt(0).toUpperCase()}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[15px] text-ink truncate">
                        {displayName}
                      </span>
                      {position && (
                        <span
                          className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.04em] px-2 py-0.5 rounded-md"
                          style={{ color: '#5c5647', background: '#ece5d6' }}
                        >
                          <span className="w-[5px] h-[5px] rounded-full" style={{ background: POSITION_DOT[position] }} />
                          {POSITION_LABEL[position]}
                        </span>
                      )}
                    </div>

                    <div className="text-[13px] text-ink-soft truncate mt-0.5">
                      {player.email}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 mt-2">
                      {player.playerInfo?.skillLevel && (
                        <Stars level={player.playerInfo.skillLevel} />
                      )}
                      {player.playerInfo?.ageGroup && (
                        <span className="text-[11px] text-ink-soft">{player.playerInfo.ageGroup} anos</span>
                      )}
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        paymentType === 'mensalista'
                          ? 'bg-wine-tint text-wine'
                          : paymentType === 'diarista'
                          ? 'text-state-warning'
                          : 'bg-line-soft text-ink-soft'
                      }`}
                      style={paymentType === 'diarista' ? { color: '#9a6a10', background: '#f6ecca' } : undefined}
                      >
                        {paymentType === 'mensalista' ? 'Mensalista' : paymentType === 'diarista' ? 'Diarista' : 'Não informado'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-none items-center gap-1">
                    <button
                      onClick={() => navigate(`/users/${player.id}/edit`)}
                      className="p-2 rounded-lg text-ink-icon hover:text-wine hover:bg-wine-tint transition-colors"
                      title="Editar jogador"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      disabled={isDeleting === player.id}
                      className="p-2 rounded-lg text-ink-icon hover:text-state-live hover:bg-state-live/10 transition-colors disabled:opacity-50"
                      title="Remover jogador"
                    >
                      {isDeleting === player.id ? (
                        <div className="w-4 h-4 border-2 border-wine border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaTrash className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
