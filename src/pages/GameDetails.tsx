import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, deleteDoc, Timestamp, getDocs, collection, setDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game, Team, Player, Match, convertTimestampToDate } from '../types';
import { ArrowLeft, Calendar, MapPin, Users, Edit, Trash2, Check, ArrowLeftRight, User, Plus, Target, Footprints } from 'lucide-react';
import { PlayerOptionsModal } from '../components/PlayerOptionsModal';
import { StarRating } from '../components/StarRating';
import { MatchesPanel } from '../components/matches/MatchesPanel';
import { WaitingReorderList } from '../components/matches/WaitingReorderList';
import { PageLoader } from '../components/Loader';
import { SectionNav, GameSection } from '../components/game-details/SectionNav';
import { ResumoPanel } from '../components/game-details/ResumoPanel';
import { JogadoresPanel } from '../components/game-details/JogadoresPanel';
import { AnalisesPanel } from '../components/game-details/AnalisesPanel';
import { ResumoMobile } from '../components/game-details/ResumoMobile';
import { JogadoresMobile } from '../components/game-details/JogadoresMobile';
import { AnalisesMobile } from '../components/game-details/AnalisesMobile';
import { GameTopbar } from '../components/game-details/GameTopbar';
import { useViewport } from '../hooks/useViewport';
import { usePageNav, PageNavItem } from '../contexts/PageNavContext';
import { BarChart2, LayoutGrid, Swords } from 'lucide-react';

const SECTION_NAV_ITEMS: PageNavItem[] = [
  { key: 'resumo', label: 'Resumo', icon: LayoutGrid },
  { key: 'jogadores', label: 'Jogadores', icon: Users },
  { key: 'partidas', label: 'Partidas', icon: Swords },
  { key: 'analises', label: 'Análises', icon: BarChart2 },
];
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Novo modal de adicionar jogador com Tailwind
function AddPlayerModalTailwind({ isOpen, onClose, onAddPlayer, isJoining }: {
  isOpen: boolean; 
  onClose: () => void; 
  onAddPlayer: (name: string, position: 'defesa' | 'meio' | 'ataque', skillLevel: 1 | 2 | 3 | 4 | 5, ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50', paymentType: 'mensalista' | 'diarista') => void; 
  isJoining: boolean;
}) {
  const [playerName, setPlayerName] = useState('');
  const [playerPosition, setPlayerPosition] = useState<'defesa' | 'meio' | 'ataque'>('meio');
  const [playerSkillLevel, setPlayerSkillLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [playerAgeGroup, setPlayerAgeGroup] = useState<'15-20' | '21-30' | '31-40' | '41-50' | '+50'>('21-30');
  const [playerPaymentType, setPlayerPaymentType] = useState<'mensalista' | 'diarista'>('mensalista');

  const handleSubmit = useCallback(() => {
    if (playerName.trim()) {
      onAddPlayer(playerName.trim(), playerPosition, playerSkillLevel, playerAgeGroup, playerPaymentType);
      setPlayerName('');
      setPlayerPosition('meio');
      setPlayerSkillLevel(3);
      setPlayerAgeGroup('21-30');
    }
  }, [playerName, playerPosition, playerSkillLevel, playerAgeGroup, playerPaymentType, onAddPlayer]);

  const handleSkillChange = (value: number) => {
    setPlayerSkillLevel(value as 1 | 2 | 3 | 4 | 5);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 max-h-screen overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Adicionar Jogador</h2>
          <button onClick={onClose} className="text-ink-icon hover:text-ink">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Jogador</label>
            <input
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wine"
                value={playerName}
              onChange={e => setPlayerName(e.target.value)}
                placeholder="Digite o nome do jogador"
              />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Posição</label>
            <div className="grid grid-cols-3 gap-2">
              {['defesa', 'meio', 'ataque'].map(pos => (
                <button
                  key={pos}
                  type="button"
                  className={`px-3 py-2 rounded-lg border ${playerPosition === pos ? 'bg-wine text-white' : 'bg-line-soft text-ink-medium'} transition-colors`}
                  onClick={() => setPlayerPosition(pos as any)}
                >
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nível de Habilidade</label>
            <StarRating value={playerSkillLevel} onChange={handleSkillChange} size="md" showLabel={true} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Faixa Etária</label>
            <div className="grid grid-cols-2 gap-2">
              {['15-20', '21-30', '31-40', '41-50', '+50'].map(age => (
                <button
                  key={age}
                  type="button"
                  className={`px-3 py-2 rounded-lg border ${playerAgeGroup === age ? 'bg-wine text-white' : 'bg-line-soft text-ink-medium'} transition-colors`}
                  onClick={() => setPlayerAgeGroup(age as any)}
                >
                  {age} anos
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {['mensalista', 'diarista'].map(type => (
                <button
                  key={type}
                  type="button"
                  className={`px-3 py-2 rounded-lg border ${playerPaymentType === type ? 'bg-wine text-white' : 'bg-line-soft text-ink-medium'} transition-colors`}
                  onClick={() => setPlayerPaymentType(type as any)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-ink-medium bg-line-soft rounded-lg hover:bg-line transition-colors"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-wine rounded-lg hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            disabled={isJoining || !playerName.trim()}
          >
            {isJoining ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface PlayerSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player | null;
  otherTeamPlayers: Player[];
  waitingPlayers: Player[];
  onSwapPlayers: (otherPlayer: Player) => void;
  onReplacePlayer: (waitingPlayer: Player) => void;
  onRemoveFromWaitingList: (player: Player) => void;
}

export function PlayerSwapModal({
  isOpen,
  onClose,
  currentPlayer,
  otherTeamPlayers,
  waitingPlayers,
  onSwapPlayers,
  onReplacePlayer,
  onRemoveFromWaitingList,
}: PlayerSwapModalProps) {
  if (!isOpen || !currentPlayer) return null;

  const SWAP_POS_LABEL: Record<string, string> = { defesa: 'DEF', meio: 'MEI', ataque: 'ATA' };
  const SWAP_POS_HEX: Record<string, string> = { defesa: '#d99a1a', meio: '#0d7a72', ataque: '#c2560f' };
  const posBadge = (position: string) => (
    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.04em] px-[7px] py-[3px] rounded-md flex-none" style={{ color: '#5c5647', background: '#ece5d6' }}>
      <span className="w-[5px] h-[5px] rounded-full" style={{ background: SWAP_POS_HEX[position] }} />
      {SWAP_POS_LABEL[position]}
    </span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="chip w-9 h-9 flex-none rounded-full bg-ink text-white font-stat font-bold text-sm flex items-center justify-center">{currentPlayer.arrivalOrder}</span>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-[15px] text-ink truncate">Trocar {currentPlayer.name}</h2>
              <div className="text-[11px] text-ink-soft">Trocar de time ou substituir pela espera</div>
            </div>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-icon hover:text-ink hover:bg-paper text-xl" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div>
            <div className="text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-2">Trocar com o outro time</div>
            <div className="space-y-1.5">
              {otherTeamPlayers.length === 0 ? (
                <div className="text-ink-soft text-sm py-2">Nenhum jogador disponível no outro time.</div>
              ) : (
                otherTeamPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onSwapPlayers(player)}
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-[#eee7d8] bg-surface hover:bg-paper transition-colors text-left"
                  >
                    <span className="chip w-8 h-8 flex-none rounded-full bg-ink text-white font-stat font-bold text-[12px] flex items-center justify-center">{player.arrivalOrder}</span>
                    <span className="flex-1 font-semibold text-[14px] text-ink truncate">{player.name}</span>
                    {posBadge(player.position)}
                    <ArrowLeftRight className="w-4 h-4 text-wine flex-none" />
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-2">Substituir pela espera</div>
            <div className="space-y-1.5">
              {waitingPlayers.length === 0 ? (
                <div className="text-ink-soft text-sm py-2">Nenhum jogador na lista de espera.</div>
              ) : (
                waitingPlayers.map((player) => (
                  <div key={player.id} className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-[#eee7d8] bg-surface">
                    <span className="chip w-8 h-8 flex-none rounded-full bg-ink text-white font-stat font-bold text-[12px] flex items-center justify-center">{player.arrivalOrder}</span>
                    <span className="flex-1 font-semibold text-[14px] text-ink truncate">{player.name}</span>
                    {posBadge(player.position)}
                    <button onClick={() => onReplacePlayer(player)} title="Substituir" className="p-2 rounded-lg text-state-success hover:bg-state-success/10 transition-colors flex-none">
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => onRemoveFromWaitingList(player)} title="Remover da espera" className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-none">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const viewport = useViewport();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(7);
  const [isPlayersPerTeamOpen, setIsPlayersPerTeamOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isPlayerOptionsOpen, setIsPlayerOptionsOpen] = useState(false);
  const [isPlayerSwapOpen, setIsPlayerSwapOpen] = useState(false);
  const { user } = useAuth();
  const [isSelectPlayerModalOpen, setIsSelectPlayerModalOpen] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<Array<{
    id: string;
    email?: string;
    playerInfo?: {
      name: string;
      position: string;
      skillLevel: number;
      ageGroup: string;
      paymentType?: string;
    };
  }>>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const VALID_SECTIONS: GameSection[] = ['resumo', 'jogadores', 'partidas', 'analises'];
  const initialTab = searchParams.get('tab') as GameSection | null;
  const [selectedTab, setSelectedTab] = useState<GameSection>(
    initialTab && VALID_SECTIONS.includes(initialTab) ? initialTab : 'resumo'
  );
  const handleSelectSection = useCallback((key: string) => setSelectedTab(key as GameSection), []);

  // Mantém a aba ativa na URL (?tab=) para sobreviver a refresh.
  useEffect(() => {
    if (searchParams.get('tab') === selectedTab) return;
    const next = new URLSearchParams(searchParams);
    next.set('tab', selectedTab);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  const WEEKDAYS_SHORT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  usePageNav(
    game
      ? {
          title: `Pelada de ${WEEKDAYS_SHORT[convertTimestampToDate(game.date).getDay()]}`,
          items: SECTION_NAV_ITEMS,
          active: selectedTab,
          onSelect: handleSelectSection,
          subtitle: `${game.location} · ${game.players.length} confirmados`,
          live: game.status === 'in_progress',
        }
      : null
  );

  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [waitingListMatchId, setWaitingListMatchId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDiaristaModal, setShowDiaristaModal] = useState(false);
  const [selectedDiarista, setSelectedDiarista] = useState<{id: string, name: string} | null>(null);
  const [diaristaPaymentValue, setDiaristaPaymentValue] = useState(30);
  const [diaristaFree, setDiaristaFree] = useState(false);
  const [diaristaPayments, setDiaristaPayments] = useState<Record<string, { 
    value: number; 
    date: string;
    playerName: string;
    matchId: string;
    recordBy?: string;
  }>>({});

  useEffect(() => {
    if (game?.playersPerTeam) setPlayersPerTeam(game.playersPerTeam);
  }, [game?.playersPerTeam]);

  useEffect(() => {
    console.log('diaristaPaymentValue', diaristaFree);
    if (diaristaFree) {
      confirmDiaristaPayment();
      setDiaristaFree(false);
    }
  }, [diaristaFree]);

  useEffect(() => {
    if (!id) return;
    const fetchDiaristaPayments = async () => {
      const paymentsRef = collection(db, 'diaristaPayments');
      const q = query(
        paymentsRef,
        where('gameId', '==', id),
        where('status', '==', 'paid')
      );
      const snapshot = await getDocs(q);
      const payments: Record<string, { value: number; date: string; playerName: string; matchId: string; recordBy?: string }> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        payments[data.playerId] = {
          value: data.value,
          date: data.date,
          playerName: data.playerName,
          matchId: data.matchId,
          recordBy: data.recordBy
        };
      });
      setDiaristaPayments(payments);
    };
    fetchDiaristaPayments();
  }, [id]);

  const handleUndoDiaristaPayment = async (playerId: string) => {
    if (!id) return;
    
    try {
      const paymentsRef = collection(db, 'diaristaPayments');
      const q = query(
        paymentsRef,
        where('playerId', '==', playerId),
        where('gameId', '==', id),
        where('status', '==', 'paid')
      );
      const snapshot = await getDocs(q);
      
      // Deleta o documento do pagamento
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Atualiza o estado local
      setDiaristaPayments(prev => {
        const newPayments = { ...prev };
        delete newPayments[playerId];
        return newPayments;
      });

      setToastMsg({ type: 'success', message: 'Pagamento desfeito com sucesso!' });
    } catch (error) {
      console.error('Erro ao desfazer pagamento:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao desfazer o pagamento.' });
    }
  };

  const handleDiaristaPayment = (userId: string, name: string) => {
    if (diaristaPayments[userId]) {
      // Se já está pago, pergunta se quer desfazer
      if (window.confirm(`Deseja desfazer o pagamento de R$ ${diaristaPayments[userId].value.toFixed(2)} deste diarista?`)) {
        handleUndoDiaristaPayment(userId);
      }
    } else {
      setSelectedDiarista({ id: userId, name });
      setShowDiaristaModal(true);
    }
  };

  const handleFormationChange = async (matchId: string, teamId: string, newFormation: string) => {
    if (!game || !id) return;

    try {
      const updatedMatches = game.matches.map(match => {
        if (match.id === matchId) {
          return {
            ...match,
            teams: match.teams.map(team => {
              if (team.id === teamId) {
                return {
                  ...team,
                  formation: {
                    ...team.formation,
                    tactical: newFormation
                  }
                };
              }
              return team;
            })
          };
        }
        return match;
      });

      // Atualiza o estado local imediatamente para feedback visual
      setGame(prev => prev ? {
        ...prev,
        matches: updatedMatches
      } : null);

      await updateDoc(doc(db, 'games', id), {
        matches: updatedMatches,
        updatedAt: serverTimestamp()
      });

      setToastMsg({ type: 'success', message: 'Formação atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar formação:', error);
      setToastMsg({ type: 'error', message: 'Erro ao atualizar a formação.' });
      
      // Reverte o estado local em caso de erro
      setGame(prev => prev ? {
        ...prev,
        matches: game.matches
      } : null);
    }
  };

  // Função para contar partidas consecutivas sem ir para lista de espera
  const getConsecutiveMatchesWithoutBreak = (playerId: string) => {
    if (!game || !game.matches) return 0;
    
    let consecutiveCount = 0;
    let foundBreak = false;

    // Percorre as partidas de trás para frente
    for (let i = game.matches.length - 1; i >= 0; i--) {
      const match = game.matches[i];
      const playerInMatch = match.teams.some(team => 
        team.players.some(p => p.id === playerId)
      );

      if (playerInMatch) {
        if (foundBreak) break;
        consecutiveCount++;
      } else {
        // Se o jogador não jogou a última partida, retorna 0 imediatamente
        if (i === game.matches.length - 1) return 0;
        foundBreak = true;
      }
    }

    return consecutiveCount;
  };

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }


    const unsubscribe = onSnapshot(
      doc(db, 'games', id),
      (doc) => {
        
        if (doc.exists()) {
          const data = doc.data();
          
          const gameData = {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            players: data.players || [],
            matches: data.matches || [],
          } as Game;
          
          setGame(gameData);
        } else {
          
          setToastMsg({ type: 'error', message: 'Jogo não encontrado.' });
          navigate('/');
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar jogo:', error);
        setToastMsg({ type: 'error', message: 'Ocorreu um erro ao carregar o jogo.' });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, navigate]);

  const formatDate = (date: Date | Timestamp) => {
    return convertTimestampToDate(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatArrivalTime = (date: Date | Timestamp | undefined) => {
    if (!date) return '--:--';
    try {
      const d = convertTimestampToDate(date);
      if (isNaN(d.getTime())) return '--:--';
      return d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '--:--';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'yellow';
      case 'in_progress':
        return 'blue';
      case 'finished':
        return 'green';
      default:
        return 'gray';
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

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'defesa':
        return 'yellow';
      case 'meio':
        return 'blue';
      case 'ataque':
        return 'red';
      default:
        return 'gray';
    }
  };

  const handleJoinGame = useCallback(async (name: string, position: 'defesa' | 'meio' | 'ataque', skillLevel: 1 | 2 | 3 | 4 | 5, ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50', paymentType: 'mensalista' | 'diarista') => {
    if (!game || !id || !name.trim()) return;

    try {
      setIsJoining(true);
      
      // Pega o último horário de chegada dos jogadores existentes
      const lastArrivalTime = game.players.length > 0 
        ? Math.max(...game.players.map(p => 
            p.arrivalTime ? convertTimestampToDate(p.arrivalTime).getTime() : 0
          ))
        : new Date().getTime();

      // Define o horário do novo jogador como 1 minuto após o último
      const newArrivalTime = new Date(lastArrivalTime + 60000);

      const newPlayer: Player = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        email: '',
        confirmed: true,
        arrivalTime: Timestamp.fromDate(newArrivalTime),
        position,
        arrivalOrder: game.players.length + 1,
        skillLevel,
        ageGroup,
        paymentType,
      };

      // Adiciona o novo jogador à lista existente
      const updatedPlayers = [...game.players, newPlayer];

      // Atualiza a lista de espera se já existem partidas
      let updatedWaitingList = game.waitingList || [];
      if (game.matches && game.matches.length > 0) {
        // Se já existem partidas, adiciona o novo jogador à lista de espera
        if (!updatedWaitingList.includes(newPlayer.id)) {
          updatedWaitingList = [...updatedWaitingList, newPlayer.id];
        }
      }

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        waitingList: updatedWaitingList,
        updatedAt: serverTimestamp(),
      });
      setToastMsg({ type: 'success', message: 'Jogador adicionado com sucesso!' });
    } catch (error) {
      console.error('Erro ao entrar no jogo:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao adicionar o jogador.' });
    } finally {
      setIsJoining(false);
    }
  }, [game, id]);

  const handleRemovePlayer = async (playerId: string) => {
    if (!game || !id) return;

    try {
      // Remove o jogador
      const updatedPlayers = game.players.filter(p => p.id !== playerId);
      // Reordena e atualiza arrivalOrder sequencialmente
      const reorderedPlayers = updatedPlayers
        .sort((a, b) => a.arrivalOrder - b.arrivalOrder)
        .map((p, idx) => ({ ...p, arrivalOrder: idx + 1 }));
      
      // Remove o jogador da lista de espera também
      const updatedWaitingList = (game.waitingList || []).filter(id => id !== playerId);
      
      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: reorderedPlayers,
        waitingList: updatedWaitingList,
        updatedAt: serverTimestamp(),
      });
      setToastMsg({ type: 'success', message: 'Jogador removido da lista com sucesso.' });
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao remover o jogador.' });
    }
  };

  const handleLeaveGame = async (playerId: string) => {
    if (!game || !id) return;

    try {
      const updatedPlayers = game.players.filter(p => p.id !== playerId);
      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
      });
      setToastMsg({ type: 'success', message: 'Jogador removido da lista com sucesso.' });
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao remover o jogador.' });
    }
  };

  const handleDeleteGame = async () => {
    if (!game || !id) return;

    try {
      setIsDeleting(true);
      const gameRef = doc(db, 'games', id);
      await deleteDoc(gameRef);
      
      setToastMsg({ type: 'success', message: 'A pelada foi excluída com sucesso.' });
      navigate('/');
    } catch (error) {
      console.error('Erro ao excluir pelada:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao excluir a pelada.' });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!game || !id) return;

    try {
      const updatedMatches = game.matches.filter(match => match.id !== matchId);
      const lastMatch = updatedMatches[updatedMatches.length - 1];

      // Reconstrói a lista de espera a partir do estado real: quem NÃO está na
      // última partida restante entra na fila por ordem de chegada. Sem isso, a
      // waitingList ficava dessincronizada e duplicava jogadores ao regenerar
      // (a partir da 2ª partida). Na 1ª não quebrava porque não havia fila anterior.
      let newWaitingList: string[] = [];
      if (lastMatch) {
        const inGame = new Set(lastMatch.teams.flatMap(t => t.players.map(p => p.id)));
        newWaitingList = [...game.players]
          .filter(p => !inGame.has(p.id))
          .sort((a, b) => a.arrivalOrder - b.arrivalOrder)
          .map(p => p.id);
      }

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        matches: updatedMatches,
        currentMatch: null,
        status: updatedMatches.length === 0 ? 'waiting' : 'in_progress',
        waitingList: newWaitingList,
        updatedAt: serverTimestamp(),
      });

      setToastMsg({ type: 'success', message: 'A partida foi excluída com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir partida:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao excluir a partida.' });
    }
  };

  const generateTeams = async () => {
    if (!game || !id) return;

    try {
      setIsGeneratingTeams(true);
      console.log('waitingList do banco:', game.waitingList);
      
      // Verifica se é a primeira partida ou se a última partida foi finalizada
      const isFirstMatch = !game.matches || game.matches.length === 0;
      const lastMatch = game.matches?.[game.matches.length - 1];
      
      if (!isFirstMatch && (!lastMatch || lastMatch.status !== 'finished')) {
        setToastMsg({ 
          type: 'error', 
          message: 'A última partida precisa ser finalizada antes de gerar uma nova.' 
        });
        return;
      }

      // 1. Definir o horário de corte --> trocar o 4 por 8 para voltar a regra do horario;
      const prioridadeHorario = convertTimestampToDate(game.date);
      prioridadeHorario.setHours(4, 35, 0, 0);

      // 2. Identificar IDs de quem já jogou pelo menos uma partida
      const jogadoresJaJogaram = (game.matches || []).flatMap(m => m.teams.flatMap(t => t.players.map(p => p.id)));

      // 3. Mensalistas prioritários: chegaram até 8:35 e ainda não jogaram
      const mensalistasPrioritarios = game.players.filter(p =>
        p.paymentType === 'mensalista' &&
        convertTimestampToDate(p.arrivalTime) <= prioridadeHorario &&
        !jogadoresJaJogaram.includes(p.id)
      );
      const mensalistasOrdenados = [...mensalistasPrioritarios].sort((a, b) => convertTimestampToDate(a.arrivalTime).getTime() - convertTimestampToDate(b.arrivalTime).getTime());

      // 4. Preencher o restante das vagas com os demais jogadores por ordem de chegada
      const idsPrioritarios = new Set(mensalistasOrdenados.map(p => p.id));
      const outros = game.players.filter(p => !idsPrioritarios.has(p.id));
      //outros.sort((a, b) => convertTimestampToDate(a.arrivalTime).getTime() - convertTimestampToDate(b.arrivalTime).getTime());
      outros.sort((a, b) => a.arrivalOrder - b.arrivalOrder);

      // 5. Lista final de prioridade para entrar
      const jogadoresParaEntrar = [...mensalistasOrdenados, ...outros];

      // 6. Use jogadoresParaEntrar.slice(0, N) para montar playersForFirstMatch ou nextTeamPlayers
      // (N = 18 ou menos, conforme já implementado)
      // Exemplo para o primeiro jogo:
      // playersForFirstMatch = jogadoresParaEntrar.slice(0, totalPlayersInMatch);
      // Para jogos seguintes, use para montar nextTeamPlayers

      let waitingList = (game.waitingList && game.waitingList.length > 0)
        ? [...game.waitingList]
        : game.players
            .sort((a, b) => a.arrivalOrder - b.arrivalOrder)
            .map(p => p.id);

      console.log('waitingList local (antes):', waitingList);

      if (isFirstMatch) {
        const totalPlayers = game.players.length;
        const totalPlayersInMatch = playersPerTeam * 2;

        if (totalPlayers < totalPlayersInMatch) {
          setToastMsg({
            type: 'error',
            message: `Jogadores insuficientes. São necessários ${totalPlayersInMatch} para ${playersPerTeam}x${playersPerTeam} (${totalPlayers} presentes).`,
          });
          return;
        }

        // Pega os primeiros jogadores por ordem de chegada
        const playersForFirstMatch = [...game.players]
          .sort((a, b) => a.arrivalOrder - b.arrivalOrder)
          .slice(0, totalPlayersInMatch);

        // Jogadores restantes vão para a lista de espera
        waitingList = game.players
          .filter(p => !playersForFirstMatch.map(p => p.id).includes(p.id))
          .sort((a, b) => a.arrivalOrder - b.arrivalOrder)
          .map(p => p.id);

        console.log('Jogadores selecionados para primeira partida:', 
          playersForFirstMatch.map(p => ({ 
            name: p.name, 
            order: p.arrivalOrder,
            arrivalTime: p.arrivalTime ? convertTimestampToDate(p.arrivalTime).toLocaleTimeString() : 'N/A'
          }))
        );

        // Balanceia os times
        const { teamA, teamB } = findBalancedTeams(playersForFirstMatch);

        const teams: Team[] = [
          {
            id: 'teamA',
            name: 'Time Azul',
            players: teamA,
            score: 0,
            formation: {
              defesa: teamA.filter(p => p.position === 'defesa'),
              meio: teamA.filter(p => p.position === 'meio'),
              ataque: teamA.filter(p => p.position === 'ataque'),
            },
          },
          {
            id: 'teamB',
            name: 'Time Laranja',
            players: teamB,
            score: 0,
            formation: {
              defesa: teamB.filter(p => p.position === 'defesa'),
              meio: teamB.filter(p => p.position === 'meio'),
              ataque: teamB.filter(p => p.position === 'ataque'),
            },
          },
        ];

        const newMatch: Match = {
          id: Math.random().toString(36).substr(2, 9),
          teams,
          status: 'in_progress',
          createdAt: new Date(),
          updatedAt: new Date(),
          waitingList: [...waitingList], // snapshot da fila desta partida (ordem preservada)
        };

        await updateDoc(doc(db, 'games', id), {
          matches: arrayUnion(newMatch),
          currentMatch: newMatch.id,
          status: 'in_progress',
          waitingList,
          playersPerTeam,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Partidas subsequentes
        if (!lastMatch?.winner) {
          setToastMsg({ type: 'error', message: 'A última partida precisa ter um vencedor definido.' });
          return;
        }

        const winnerTeam = lastMatch.teams.find(t => t.id === lastMatch.winner);
        const loserTeam = lastMatch.teams.find(t => t.id !== lastMatch.winner);
        
        if (!winnerTeam || !loserTeam) {
          setToastMsg({ type: 'error', message: 'Não foi possível identificar os times da última partida.' });
          return;
        }

        // 1. Primeiro adiciona o time perdedor na lista de espera
        const loserPlayers = loserTeam.players.sort((a, b) => {
          const aConsecutiveMatches = getConsecutiveMatchesWithoutBreak(a.id);
          const bConsecutiveMatches = getConsecutiveMatchesWithoutBreak(b.id);
          if (aConsecutiveMatches !== bConsecutiveMatches) {
            return aConsecutiveMatches - bConsecutiveMatches;
          }
          const timeA = a.arrivalTime ? convertTimestampToDate(a.arrivalTime).getTime() : 0;
          const timeB = b.arrivalTime ? convertTimestampToDate(b.arrivalTime).getTime() : 0;
          return timeA - timeB;
        });

        console.log('waitingList local (antes de adicionar perdedores):', waitingList);
        waitingList = [...waitingList, ...loserPlayers.map(p => p.id)];
        console.log('waitingList local (depois de adicionar perdedores):', waitingList);

        const nextTeamIds = waitingList.slice(0, playersPerTeam);
        if (nextTeamIds.length < playersPerTeam) {
          setToastMsg({
            type: 'error',
            message: `Não há jogadores suficientes na lista de espera para ${playersPerTeam}x${playersPerTeam}.`,
          });
          return;
        }

        waitingList = waitingList.slice(playersPerTeam);
        console.log('waitingList local (após remover quem entrou):', waitingList);

        // 5. Monta os times
        const nextTeamPlayers = nextTeamIds.map(pid => game.players.find(p => p.id === pid)).filter(Boolean) as Player[];

        const teams: Team[] = [
          {
            id: 'teamA',
            name: 'Time Azul',
            players: winnerTeam.id === 'teamA' ? winnerTeam.players : nextTeamPlayers,
            score: 0,
            formation: {
              defesa: (winnerTeam.id === 'teamA' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'defesa'),
              meio: (winnerTeam.id === 'teamA' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'meio'),
              ataque: (winnerTeam.id === 'teamA' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'ataque'),
            },
          },
          {
            id: 'teamB',
            name: 'Time Laranja',
            players: winnerTeam.id === 'teamB' ? winnerTeam.players : nextTeamPlayers,
            score: 0,
            formation: {
              defesa: (winnerTeam.id === 'teamB' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'defesa'),
              meio: (winnerTeam.id === 'teamB' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'meio'),
              ataque: (winnerTeam.id === 'teamB' ? winnerTeam.players : nextTeamPlayers).filter(p => p.position === 'ataque'),
            },
          },
        ];

        const newMatch: Match = {
          id: Math.random().toString(36).substr(2, 9),
          teams,
          status: 'in_progress',
          createdAt: new Date(),
          updatedAt: new Date(),
          waitingList: [...waitingList], // snapshot da fila desta partida (ordem preservada)
        };

        await updateDoc(doc(db, 'games', id), {
          matches: arrayUnion(newMatch),
          currentMatch: newMatch.id,
          status: 'in_progress',
          waitingList,
          playersPerTeam,
          updatedAt: serverTimestamp(),
        });
      }

      setToastMsg({ type: 'success', message: 'Os times foram gerados com sucesso.' });
    } catch (error) {
      console.error('Erro ao gerar times:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao gerar os times.' });
    } finally {
      setIsGeneratingTeams(false);
    }
  };

  // Função auxiliar para encontrar times balanceados (usada apenas na primeira partida)
  const findBalancedTeams = (players: Player[]) => {
    let bestTeamA: Player[] = [];
    let bestTeamB: Player[] = [];
    let bestScoreDiff = Infinity;

    // Tenta diferentes combinações para encontrar o melhor equilíbrio
    for (let i = 0; i < 100; i++) {
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
      const teamA = shuffledPlayers.slice(0, Math.ceil(shuffledPlayers.length / 2));
      const teamB = shuffledPlayers.slice(Math.ceil(shuffledPlayers.length / 2));

      if (!isPositionDistributionValid(teamA, teamB)) continue;

      const scoreA = calculateTeamScore(teamA);
      const scoreB = calculateTeamScore(teamB);
      const scoreDiff = Math.abs(scoreA - scoreB);

      if (scoreDiff < bestScoreDiff) {
        bestScoreDiff = scoreDiff;
        bestTeamA = teamA;
        bestTeamB = teamB;
      }
    }

    return { teamA: bestTeamA, teamB: bestTeamB };
  };

  // Funções auxiliares para o balanceamento
  const calculateTeamScore = (players: Player[]) => {
    return players.reduce((sum, player) => sum + calculatePlayerScore(player), 0);
  };

  const calculatePlayerScore = (player: Player) => {
    const ageValue = getAgeBalanceScore(player.ageGroup);
    const positionValue = getPositionValue(player.position);
    const skillValue = player.skillLevel;
    
    return (skillValue * 0.6) + (ageValue * 0.3) + (positionValue * 0.1);
  };

  // Score de idade para balanceamento (quanto mais velho, menor o score)
  const getAgeBalanceScore = (ageGroup: string) => {
    switch (ageGroup) {
      case '15-20': return 5;
      case '21-30': return 4;
      case '31-40': return 3;
      case '41-50': return 2;
      case '+50': return 1;
      default: return 4;
    }
  };

  const getAgeValue = (ageGroup: string) => {
    switch (ageGroup) {
      case '15-20': return 17.5;
      case '21-30': return 25.5;
      case '31-40': return 35.5;
      case '41-50': return 45.5;
      case '+50': return 55;
      default: return 25.5;
    }
  };

  const getPositionValue = (position: string) => {
    switch (position) {
      case 'defesa': return 1;
      case 'meio': return 2;
      case 'ataque': return 3;
      default: return 2;
    }
  };

  const isPositionDistributionValid = (teamA: Player[], teamB: Player[]) => {
    const distA = calculatePositionDistribution(teamA);
    const distB = calculatePositionDistribution(teamB);
    
    const maxDiff = 1;
    
    return Math.abs(distA.defesa - distB.defesa) <= maxDiff &&
           Math.abs(distA.meio - distB.meio) <= maxDiff &&
           Math.abs(distA.ataque - distB.ataque) <= maxDiff;
  };

  const calculatePositionDistribution = (players: Player[]) => {
    return {
      defesa: players.filter(p => p.position === 'defesa').length,
      meio: players.filter(p => p.position === 'meio').length,
      ataque: players.filter(p => p.position === 'ataque').length
    };
  };

  const finishMatch = async (matchId: string, winnerTeamId: string) => {
    if (!game || !id) return;

    try {
      const updatedMatches = game.matches.map(match => {
        if (match.id === matchId) {
          return {
            ...match,
            status: 'finished',
            winner: winnerTeamId,
            // Congela a ordem da fila exatamente como estava ao finalizar.
            waitingList: [...(game.waitingList || [])],
            updatedAt: new Date(),
          };
        }
        return match;
      });

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        matches: updatedMatches,
        currentMatch: null,
        updatedAt: serverTimestamp(),
      });

      setToastMsg({ type: 'success', message: 'A partida foi finalizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao finalizar partida:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao finalizar a partida.' });
    }
  };

  const handleSwapPlayers = async (matchId: string, playerA: Player, playerB: Player) => {
    if (!game || !id) return;

    try {
      const gameRef = doc(db, 'games', id as string);
      const updatedMatches = game.matches.map(match => {
        if (match.id === matchId) {
          const updatedTeams = match.teams.map(team => {
            const updatedPlayers = team.players.map(player => {
              if (player.id === playerA.id) return playerB;
              if (player.id === playerB.id) return playerA;
              return player;
            });

            return {
              ...team,
              players: updatedPlayers,
              formation: {
                defesa: updatedPlayers.filter(p => p.position === 'defesa'),
                meio: updatedPlayers.filter(p => p.position === 'meio'),
                ataque: updatedPlayers.filter(p => p.position === 'ataque'),
              },
            };
          });

          return {
            ...match,
            teams: updatedTeams,
          };
        }
        return match;
      });

      if (!id) return;
      await updateDoc(gameRef, {
        matches: updatedMatches,
        updatedAt: serverTimestamp(),
      });

      setToastMsg({ type: 'success', message: 'Os jogadores foram trocados com sucesso.' });
    } catch (error) {
      console.error('Erro ao trocar jogadores:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao trocar os jogadores.' });
    }
  };

  const handleReplacePlayer = async (matchId: string, currentPlayer: Player, newPlayer: Player) => {
    if (!game || !id) return;

    try {
      // Atualiza os times da partida
      const updatedMatches = game.matches.map(match => {
        if (match.id === matchId) {
          const updatedTeams = match.teams.map(team => {
            const updatedPlayers = team.players.map(player => {
              if (player.id === currentPlayer.id) return newPlayer;
              return player;
            });

            return {
              ...team,
              players: updatedPlayers,
              formation: {
                defesa: updatedPlayers.filter(p => p.position === 'defesa'),
                meio: updatedPlayers.filter(p => p.position === 'meio'),
                ataque: updatedPlayers.filter(p => p.position === 'ataque'),
              },
            };
          });

          return {
            ...match,
            teams: updatedTeams,
          };
        }
        return match;
      });

      // Atualiza a lista de espera
      let updatedWaitingList = [...(game.waitingList || [])];
      
      // Remove o jogador que entrou da lista de espera
      updatedWaitingList = updatedWaitingList.filter(id => id !== newPlayer.id);
      
      // Adiciona o jogador que saiu à lista de espera
      if (!updatedWaitingList.includes(currentPlayer.id)) {
        updatedWaitingList.push(currentPlayer.id);
      }

      // Atualiza o documento no Firestore
      await updateDoc(doc(db, 'games', id), {
        matches: updatedMatches,
        waitingList: updatedWaitingList,
        updatedAt: serverTimestamp(),
      });

      setToastMsg({ type: 'success', message: 'O jogador foi substituído com sucesso.' });
    } catch (error) {
      console.error('Erro ao substituir jogador:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao substituir o jogador.' });
    }
  };

  const handleUpdatePlayer = async (playerId: string, updates: Partial<Player>) => {
    if (!game || !id) return;

    try {
      const updatedPlayers = game.players.map(player => {
        if (player.id === playerId) {
          return { 
            ...player, 
            ...updates,
            // Mantém o horário original de chegada
            arrivalTime: player.arrivalTime 
          };
        }
        return player;
      });

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });

      setToastMsg({ type: 'success', message: 'As informações do jogador foram atualizadas com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao atualizar o jogador.' });
    }
  };

  const handleUpdateArrivalOrder = async (playerId: string, newPosition: number) => {
    if (!game || !id) return;

    try {
      // Ordena os jogadores por ordem de chegada atual
      const sortedPlayers = [...game.players].sort((a, b) => a.arrivalOrder - b.arrivalOrder);

      // Encontra o jogador que está sendo movido
      const playerToMove = sortedPlayers.find(p => p.id === playerId);
      if (!playerToMove) return;

      // Remove o jogador da posição atual
      const playersWithoutMoved = sortedPlayers.filter(p => p.id !== playerId);

      // Insere o jogador na nova posição
      playersWithoutMoved.splice(newPosition - 1, 0, playerToMove);

      // Atualiza a ordem de todos os jogadores
      const updatedPlayers = playersWithoutMoved.map((player, index) => ({
          ...player,
        arrivalOrder: index + 1
      }));

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });

      setToastMsg({ type: 'success', message: 'A ordem de chegada foi atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao atualizar a ordem de chegada.' });
    }
  };

  const getPlayersNotInNextMatch = (currentMatch: Match) => {
    if (!game || !game.matches) return { players: [], playersOut: [], playersIn: [] };
    const currentMatchIndex = game.matches.findIndex(m => m.id === currentMatch.id);
    if (currentMatchIndex === -1) return { players: [], playersOut: [], playersIn: [] };
    
    const nextMatch = game.matches[currentMatchIndex + 1];
    const currentPlayers = currentMatch.teams.flatMap(team => team.players);
    
    if (currentMatch.status === 'in_progress') {
      // Se a partida está em andamento, mostra todos os jogadores que não estão nela
      const waitingPlayers = game.players
        .filter(player => !currentPlayers.some(p => p.id === player.id))
        .sort((a, b) => {
          // Primeiro critério: Quem está há mais tempo na lista de espera entra primeiro
          const aLastMatchIndex = game.matches.findLastIndex((match: Match) => 
            match.teams.some((team: Team) => team.players.some((p: Player) => p.id === a.id))
          );
          const bLastMatchIndex = game.matches.findLastIndex((match: Match) => 
            match.teams.some((team: Team) => team.players.some((p: Player) => p.id === b.id))
          );

          if (aLastMatchIndex !== bLastMatchIndex) {
            return aLastMatchIndex - bLastMatchIndex;
          }

          // Segundo critério: Quem jogou menos partidas consecutivas entra primeiro
          const aConsecutiveMatches = getConsecutiveMatchesWithoutBreak(a.id);
          const bConsecutiveMatches = getConsecutiveMatchesWithoutBreak(b.id);

          if (aConsecutiveMatches !== bConsecutiveMatches) {
            return aConsecutiveMatches - bConsecutiveMatches;
          }

          // Terceiro critério: Quem chegou primeiro entra primeiro
          const timeA = a.arrivalTime ? convertTimestampToDate(a.arrivalTime) : new Date();
          const timeB = b.arrivalTime ? convertTimestampToDate(b.arrivalTime) : new Date();
          return timeA.getTime() - timeB.getTime();
        });

      return { 
        players: waitingPlayers,
        playersOut: [],
        playersIn: []
      };
    } else if (currentMatch.status === 'finished' && nextMatch) {
      // Se a partida está finalizada e existe próxima partida, mostra quem saiu e quem entrou
      const nextPlayers = nextMatch.teams.flatMap(team => team.players);
      return {
        players: [],
        playersOut: currentPlayers.filter(player => 
          !nextPlayers.some(p => p.id === player.id)
        ),
        playersIn: nextPlayers.filter(player => 
          !currentPlayers.some(p => p.id === player.id)
        )
      };
    }
    
    return { players: [], playersOut: [], playersIn: [] };
  };

  const handleUpdateSkillLevel = async (playerId: string, skillLevel: 1 | 2 | 3 | 4 | 5) => {
    if (!game || !id) return;

    try {
      const updatedPlayers = game.players.map(player => {
        if (player.id === playerId) {
          return { ...player, skillLevel };
        }
        return player;
      });

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });

      setToastMsg({ type: 'success', message: 'O nível de habilidade do jogador foi atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar nível de habilidade:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao atualizar o nível de habilidade do jogador.' });
    }
  };

  const handleUpdateAgeGroup = async (playerId: string, ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50') => {
    if (!game || !id) return;

    try {
      const updatedPlayers = game.players.map(player => {
        if (player.id === playerId) {
          return { ...player, ageGroup };
        }
        return player;
      });

      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });

      setToastMsg({ type: 'success', message: 'A faixa etária do jogador foi atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar faixa etária:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao atualizar a faixa etária do jogador.' });
    }
  };

  const handleGoalScored = async (matchId: string, teamId: string, scorerId: string, assisterId?: string, ownGoal?: boolean) => {
    if (!game || !id) return;

    try {
      if (typeof id !== 'string') {
        throw new Error('ID do jogo inválido');
      }

      const gameRef = doc(db, 'games', id);
      const goalData: any = {
        id: Math.random().toString(36).substr(2, 9),
        matchId,
        teamId,
        scorerId,
        timestamp: new Date()
      };

      // Gol contra credita o ponto ao adversário (teamId) sem dar assistência
      if (ownGoal) {
        goalData.ownGoal = true;
      } else if (assisterId) {
        goalData.assisterId = assisterId;
      }

      const updatedMatches = game.matches.map(match => {
        if (match.id === matchId) {
          const updatedTeams = match.teams.map(team => {
            if (team.id === teamId) {
              return {
                ...team,
                score: (team.score || 0) + 1
              };
            }
            return team;
          });

          return {
            ...match,
            goals: match.goals ? [...match.goals, goalData] : [goalData],
            teams: updatedTeams,
            updatedAt: new Date()
          };
        }
        return match;
      });

      // Atualiza o estado local imediatamente para feedback visual
      setGame(prev => prev ? {
        ...prev,
        matches: updatedMatches
      } : null);

      await updateDoc(gameRef, {
        matches: updatedMatches,
        updatedAt: serverTimestamp()
      });

      setToastMsg({ type: 'success', message: 'O gol foi registrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao registrar gol:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao registrar o gol.' });
      
      // Reverte o estado local em caso de erro
      setGame(prev => prev ? {
        ...prev,
        matches: game.matches
      } : null);
    }
  };

  const handleRemoveGoal = async (matchId: string, goalId: string) => {
    if (!game || !id) return;

    try {
      const updatedMatches = game.matches.map(match => {
        if (match.id !== matchId) return match;

        const goal = match.goals?.find(g => g.id === goalId);
        if (!goal) return match;

        // Decrementa o time que o gol contabilizou (teamId), com fallback à posse para gols antigos
        const scoringTeamId = goal.teamId
          ?? match.teams.find(t => t.players.some(p => p.id === goal.scorerId))?.id;

        const updatedTeams = match.teams.map(team => {
          if (team.id === scoringTeamId) {
            return { ...team, score: Math.max(0, (team.score || 0) - 1) };
          }
          return team;
        });

        return {
          ...match,
          goals: (match.goals ?? []).filter(g => g.id !== goalId),
          teams: updatedTeams,
          updatedAt: new Date()
        };
      });

      setGame(prev => prev ? { ...prev, matches: updatedMatches } : null);

      await updateDoc(doc(db, 'games', id), {
        matches: updatedMatches,
        updatedAt: serverTimestamp()
      });

      setToastMsg({ type: 'success', message: 'Gol removido com sucesso.' });
    } catch (error) {
      console.error('Erro ao remover gol:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao remover o gol.' });
      setGame(prev => prev ? { ...prev, matches: game.matches } : null);
    }
  };

  const getSkillLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return '⚪'; // Iniciante
      case 2:
        return '🔵'; // Amador
      case 3:
        return '🟢'; // Intermediário
      case 4:
        return '🟡'; // Avançado
      case 5:
        return '🟠'; // Profissional
      default:
        return '⚪';
    }
  };

  const getSkillLevelText = (level: number) => {
    switch (level) {
      case 1:
        return 'Iniciante';
      case 2:
        return 'Amador';
      case 3:
        return 'Intermediário';
      case 4:
        return 'Avançado';
      case 5:
        return 'Profissional';
      default:
        return 'Não definido';
    }
  };

  const handleOpenSelectPlayerModal = async () => {
    setIsSelectPlayerModalOpen(true);
    setIsLoadingPlayers(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const playersList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(user => user.username !== 'admin')
        // Filtra jogadores que já estão confirmados
        .filter(user => !game?.players.some(p => p.id === user.id));
      setAvailablePlayers(playersList);
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
      setAvailablePlayers([]);
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  const handleAddExistingPlayer = async (user: any) => {
    if (!game || !id) return;
    try {
      // Pega o último horário de chegada dos jogadores existentes
      const lastArrivalTime = game.players.length > 0 
        ? Math.max(...game.players.map(p => 
            p.arrivalTime ? (p.arrivalTime instanceof Date ? p.arrivalTime.getTime() : p.arrivalTime.toDate().getTime()) : 0
          ))
        : new Date().getTime();
      const newArrivalTime = new Date(lastArrivalTime + 60000);
      const playerInfo = user.playerInfo;
      if (!playerInfo) throw new Error('Usuário não possui informações de jogador.');
      const newPlayer: Player = {
        id: user.id,
        name: playerInfo.name,
        email: user.email || '',
        confirmed: true,
        arrivalTime: Timestamp.fromDate(newArrivalTime),
        position: playerInfo.position,
        arrivalOrder: game.players.length + 1,
        skillLevel: playerInfo.skillLevel,
        ageGroup: playerInfo.ageGroup,
        paymentType: playerInfo.paymentType || 'mensalista',
      };
      const updatedPlayers = [...game.players, newPlayer];
      
      // Atualiza a lista de espera se já existem partidas
      let updatedWaitingList = game.waitingList || [];
      if (game.matches && game.matches.length > 0) {
        // Se já existem partidas, adiciona o novo jogador à lista de espera
        if (!updatedWaitingList.includes(newPlayer.id)) {
          updatedWaitingList = [...updatedWaitingList, newPlayer.id];
        }
      }
      
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        players: updatedPlayers,
        waitingList: updatedWaitingList,
        updatedAt: serverTimestamp(),
      });
      setToastMsg({ type: 'success', message: 'Jogador adicionado! Jogador confirmado com sucesso.' });
    } catch (error) {
      setToastMsg({ type: 'error', message: (error as any).message || 'Ocorreu um erro ao adicionar o jogador.' });
    }
  };

  // Expandir automaticamente a última partida em andamento
  useEffect(() => {
    if (selectedTab === 'partidas' && game?.matches?.length) {
      const inProgress = game.matches.findLast(m => m.status === 'in_progress');
      if (inProgress && expandedMatchId !== inProgress.id) {
        setExpandedMatchId(inProgress.id);
      }
    }
  }, [selectedTab, game?.matches]);

  // Toast com timeout para sumir
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Loading
  if (isLoading) {
    return <PageLoader label="Carregando pelada…" />;
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-ink-soft text-lg">Jogo não encontrado</span>
      </div>
    );
  }

  const isGameFull = game.players?.length >= game.maxPlayers;
  const framed = viewport === 'desktop' || viewport === 'tablet';
  const canManage = !!(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista');

  const formatMatchDate = (date: any) => {
    if (!date) return '';
    try {
      let d;
      if (date instanceof Date) d = date;
      else if (typeof date === 'string') d = new Date(date);
      else if (date instanceof Timestamp) d = date.toDate();
      else d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  // Função para filtrar jogadores baseado no termo de busca
  const filteredPlayers = availablePlayers
    // Primeiro filtra jogadores que já estão confirmados
    .filter(player => !game?.players.some(p => p.id === player.id))
    // Depois filtra pelo termo de busca
    .filter(player => 
      player.playerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // Ordena alfabeticamente por nome
    .sort((a, b) => (a.playerInfo?.name || '').localeCompare(b.playerInfo?.name || ''));

  const confirmDiaristaPayment = async () => {
    if (!selectedDiarista || !id) return;
    
    try {
      const paymentRef = doc(collection(db, 'diaristaPayments'));
      const currentMatch = game?.matches?.find(m => m.status === 'in_progress');
      
      const paymentData = {
        id: paymentRef.id,
        playerId: selectedDiarista.id,
        playerName: selectedDiarista.name,
        gameId: id,
        matchId: currentMatch?.id || 'pending',
        date: new Date().toISOString(),
        value: diaristaFree ? 0 : diaristaPaymentValue,
        status: 'paid',
        paidAt: new Date().toISOString(),
        recordBy: user?.playerInfo?.name || user?.email || 'Sistema',
      };

      await setDoc(paymentRef, paymentData);

      // Atualiza o estado local
      setDiaristaPayments(prev => ({
        ...prev,
        [selectedDiarista.id]: {
          value: diaristaFree ? 0 : diaristaPaymentValue,
          date: paymentData.date,
          playerName: selectedDiarista.name,
          matchId: paymentData.matchId,
          recordBy: paymentData.recordBy
        }
      }));

      setToastMsg({ type: 'success', message: 'Pagamento registrado com sucesso!' });
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao registrar o pagamento.' });
    } finally {
      setShowDiaristaModal(false);
      setSelectedDiarista(null);
    }
  };

  const handleFinishGame = async () => {
    if (!game || !id) return;

    try {
      const newStatus = game.status === 'finished' ? 'waiting' : 'finished';
      
      // Atualiza apenas o status da pelada, sem afetar as partidas
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Atualiza o estado local para feedback visual imediato
      setGame(prev => prev ? {
        ...prev,
        status: newStatus
      } : null);

      setToastMsg({ 
        type: 'success', 
        message: newStatus === 'finished' 
          ? 'Pelada finalizada com sucesso.' 
          : 'Pelada reaberta com sucesso.' 
      });
    } catch (error) {
      console.error('Erro ao atualizar status da pelada:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao atualizar o status da pelada.' });
      
      // Reverte o estado local em caso de erro
      setGame(prev => prev ? {
        ...prev,
        status: game.status
      } : null);
    }
  };

  const handleRemoveFromWaitingList = async (player: Player) => {
    if (!game || !id) return;

    try {
      // Remove o jogador da lista de espera
      const updatedWaitingList = (game.waitingList || []).filter(id => id !== player.id);
      
      // Atualiza o estado local imediatamente para feedback visual
      setGame(prev => prev ? {
        ...prev,
        waitingList: updatedWaitingList
      } : null);
      
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        waitingList: updatedWaitingList,
        updatedAt: serverTimestamp(),
      });

      setToastMsg({ type: 'success', message: `${player.name} foi removido da lista de espera.` });
    } catch (error) {
      console.error('Erro ao remover da lista de espera:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao remover o jogador da lista de espera.' });

      // Reverte o estado local em caso de erro
      setGame(prev => prev ? {
        ...prev,
        waitingList: game.waitingList
      } : null);
    }
  };

  // Reordena a lista de espera (arrastar). Persiste a nova ordem da fila.
  const handleReorderWaitingList = async (orderedIds: string[]) => {
    if (!game || !id) return;
    const prevList = game.waitingList;
    setGame(prev => prev ? { ...prev, waitingList: orderedIds } : prev);
    try {
      await updateDoc(doc(db, 'games', id), {
        waitingList: orderedIds,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao reordenar lista de espera:', error);
      setToastMsg({ type: 'error', message: 'Ocorreu um erro ao reordenar a lista de espera.' });
      setGame(prev => prev ? { ...prev, waitingList: prevList } : prev);
    }
  };

  const handleTimerUpdate = async (matchId: string, timerData: {
    isRunning: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    startedAt?: Date;
  }) => {
    if (!game || !id) return;

    try {
      // Firestore rejeita undefined: monta o timer só com campos definidos.
      const cleanTimer: {
        isRunning: boolean;
        remainingSeconds: number;
        totalSeconds: number;
        startedAt?: Date;
      } = {
        isRunning: timerData.isRunning,
        remainingSeconds: timerData.remainingSeconds,
        totalSeconds: timerData.totalSeconds,
      };
      if (timerData.startedAt) cleanTimer.startedAt = timerData.startedAt;

      const updatedMatches = game.matches.map(match => {
        if (match.id === matchId) {
          return {
            ...match,
            timer: cleanTimer,
            updatedAt: new Date()
          };
        }
        return match;
      });

      // Atualiza o estado local imediatamente para feedback visual
      setGame(prev => prev ? {
        ...prev,
        matches: updatedMatches
      } : null);

      await updateDoc(doc(db, 'games', id), {
        matches: updatedMatches,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar timer:', error);
      // Reverte o estado local em caso de erro
      setGame(prev => prev ? {
        ...prev,
        matches: game.matches
      } : null);
    }
  };

  const createTimerUpdateHandler = (matchId: string) => {
    return (timerData: {
      isRunning: boolean;
      remainingSeconds: number;
      totalSeconds: number;
      startedAt?: Date;
    }) => {
      handleTimerUpdate(matchId, timerData);
    };
  };

  // Layout principal
  return (
    <div className={framed ? 'h-screen flex flex-col overflow-hidden bg-paper' : 'min-h-screen flex flex-col bg-paper'}>
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${toastMsg.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{toastMsg.message}</div>
      )}

      {framed && (
        <GameTopbar
          game={game}
          canManage={canManage}
          onEdit={() => navigate(`/game/${game.id}/edit`)}
          onToggleFinish={handleFinishGame}
          onDelete={() => setIsDeleteDialogOpen(true)}
          centerContent={viewport === 'tablet' ? <SectionNav active={selectedTab} onChange={setSelectedTab} /> : undefined}
          editInMenu={viewport === 'tablet'}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      <AnimatePresence>
        {isDeleteDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4"
            >
              <h2 className="font-heading text-lg font-bold text-ink mb-2">
                Excluir Pelada
              </h2>
              <p className="text-ink-medium mb-6">
                Tem certeza que deseja excluir esta pelada? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-ink-medium bg-line-soft rounded-lg hover:bg-line transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteGame}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo da pelada */}
      <div className={framed ? 'flex-1 min-h-0' : 'flex-1 pb-24'}>
        {selectedTab === 'partidas' ? (
          <MatchesPanel
            game={game}
            user={user}
            playersPerTeam={playersPerTeam}
            isPlayersPerTeamOpen={isPlayersPerTeamOpen}
            setIsPlayersPerTeamOpen={setIsPlayersPerTeamOpen}
            setPlayersPerTeam={setPlayersPerTeam}
            isGeneratingTeams={isGeneratingTeams}
            generateTeams={generateTeams}
            deleteMatch={deleteMatch}
            finishMatch={finishMatch}
            handleFormationChange={handleFormationChange}
            handleGoalScored={handleGoalScored}
            handleRemoveGoal={handleRemoveGoal}
            createTimerUpdateHandler={createTimerUpdateHandler}
            onOpenSwap={(team, player, match) => {
              setSelectedTeam(team);
              setSelectedPlayer(player);
              setSelectedMatch(match);
              setIsPlayerSwapOpen(true);
            }}
            setWaitingListMatchId={setWaitingListMatchId}
          />
        ) : viewport === 'mobile' ? (
          <>
            {selectedTab === 'resumo' && (
              <ResumoMobile
                game={game}
                canManage={canManage}
                onEdit={() => navigate(`/game/${game.id}/edit`)}
                onToggleFinish={handleFinishGame}
                onDelete={() => setIsDeleteDialogOpen(true)}
                onGoToSection={setSelectedTab}
              />
            )}
            {selectedTab === 'jogadores' && (
              <JogadoresMobile
                game={game}
                canManage={canManage}
                diaristaPayments={diaristaPayments}
                onDiaristaPayment={handleDiaristaPayment}
                onOpenPlayerOptions={(player) => { setSelectedPlayer(player); setIsPlayerOptionsOpen(true); }}
                onAddPlayer={() => setShowAddPlayerModal(true)}
                onSelectPlayer={handleOpenSelectPlayerModal}
              />
            )}
            {selectedTab === 'analises' && <AnalisesMobile game={game} />}
          </>
        ) : (
          <div className={framed ? (selectedTab === 'jogadores' ? 'h-full min-h-0' : 'h-full overflow-y-auto') : ''}>
            {selectedTab === 'resumo' && (
              <ResumoPanel game={game} onGoToSection={setSelectedTab} />
            )}
            {selectedTab === 'jogadores' && (
              <JogadoresPanel
                game={game}
                canManage={canManage}
                diaristaPayments={diaristaPayments}
                onDiaristaPayment={handleDiaristaPayment}
                onOpenPlayerOptions={(player) => { setSelectedPlayer(player); setIsPlayerOptionsOpen(true); }}
                onAddPlayer={() => setShowAddPlayerModal(true)}
                onSelectPlayer={handleOpenSelectPlayerModal}
              />
            )}
            {selectedTab === 'analises' && (
              <AnalisesPanel game={game} />
            )}
          </div>
        )}
      </div>

      {/* Navegação inferior (celular) */}
      {viewport === 'mobile' && <SectionNav active={selectedTab} onChange={setSelectedTab} />}

      {/* Modal de opções do jogador */}
      <PlayerOptionsModal
        isOpen={isPlayerOptionsOpen}
        onClose={() => { setIsPlayerOptionsOpen(false); setSelectedPlayer(null); }}
        player={selectedPlayer}
        totalPlayers={game.players.length}
        onUpdatePosition={(position) => { if (selectedPlayer) { handleUpdatePlayer(selectedPlayer.id, { position }); setIsPlayerOptionsOpen(false); setSelectedPlayer(null); } }}
        onUpdateArrivalOrder={(order) => { if (selectedPlayer) { handleUpdateArrivalOrder(selectedPlayer.id, order); setIsPlayerOptionsOpen(false); setSelectedPlayer(null); } }}
        onUpdateSkillLevel={(skillLevel) => { if (selectedPlayer) { handleUpdatePlayer(selectedPlayer.id, { skillLevel }); setIsPlayerOptionsOpen(false); setSelectedPlayer(null); } }}
        onUpdateAgeGroup={(ageGroup) => { if (selectedPlayer) { handleUpdatePlayer(selectedPlayer.id, { ageGroup }); setIsPlayerOptionsOpen(false); setSelectedPlayer(null); } }}
        onUpdatePaymentType={(paymentType) => { if (selectedPlayer) { handleUpdatePlayer(selectedPlayer.id, { paymentType }); setIsPlayerOptionsOpen(false); setSelectedPlayer(null); } }}
        onRemovePlayer={() => { if (selectedPlayer) { handleRemovePlayer(selectedPlayer.id); setIsPlayerOptionsOpen(false); setSelectedPlayer(null); } }}
        onDiaristaPayment={() => {
          if (selectedPlayer) {
            if (diaristaPayments[selectedPlayer.id]) {
              if (window.confirm(`Deseja desfazer o pagamento de R$ ${diaristaPayments[selectedPlayer.id].value.toFixed(2)} deste diarista?`)) {
                handleUndoDiaristaPayment(selectedPlayer.id);
              }
            } else {
              setSelectedDiarista({ id: selectedPlayer.id, name: selectedPlayer.name });
              setShowDiaristaModal(true);
            }
            setIsPlayerOptionsOpen(false);
            setSelectedPlayer(null);
          }
        }}
        isDiaristaPaid={selectedPlayer ? !!diaristaPayments[selectedPlayer.id] : false}
      />

      {/* Modal de adicionar jogador */}
      <AddPlayerModalTailwind
        isOpen={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        onAddPlayer={handleJoinGame}
        isJoining={isJoining}
      />
      <PlayerSwapModal
        isOpen={isPlayerSwapOpen}
        onClose={() => setIsPlayerSwapOpen(false)}
        currentPlayer={selectedPlayer}
        otherTeamPlayers={selectedTeam && selectedMatch
          ? selectedMatch.teams.find(t => t.id !== selectedTeam.id)?.players || []
          : []}
        waitingPlayers={
          (game.waitingList
            ?.map(pid => game.players.find(p => p.id === pid))
            .filter(Boolean) as Player[]) || []
        }
        onSwapPlayers={(otherPlayer) => {
          if (!selectedMatch || !selectedPlayer) return;
          handleSwapPlayers(selectedMatch.id, selectedPlayer, otherPlayer);
          setIsPlayerSwapOpen(false);
        }}
        onReplacePlayer={(waitingPlayer) => {
          if (!selectedMatch || !selectedPlayer) return;
          handleReplacePlayer(selectedMatch.id, selectedPlayer, waitingPlayer);
          setIsPlayerSwapOpen(false);
        }}
        onRemoveFromWaitingList={(player) => {
          handleRemoveFromWaitingList(player);
          setIsPlayerSwapOpen(false);
        }}
      />
      {/* Modal de seleção de jogador */}
      {isSelectPlayerModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => { setIsSelectPlayerModalOpen(false); setSearchTerm(''); }}
        >
          <div
            className="bg-surface rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-line">
              <div>
                <h2 className="font-heading font-bold text-lg text-ink">Selecionar do grupo</h2>
                <p className="text-[12px] text-ink-soft">Adicione um jogador já cadastrado</p>
              </div>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-icon hover:text-ink hover:bg-paper transition-colors text-xl"
                onClick={() => { setIsSelectPlayerModalOpen(false); setSearchTerm(''); }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="p-4 pb-2">
              <div className="flex items-center gap-2 border border-[#ded8c9] bg-surface rounded-[10px] px-3">
                <Users className="w-[15px] h-[15px] text-ink-soft" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border-none outline-none bg-transparent text-[14px] md:text-[13px] py-2.5"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
              {isLoadingPlayers ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-wine/30 border-t-wine" />
                </div>
              ) : filteredPlayers.length > 0 ? (
                <>
                  <div className="text-[11px] text-ink-soft font-semibold px-1 py-2">
                    {filteredPlayers.length} disponíve{filteredPlayers.length !== 1 ? 'is' : 'l'}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {filteredPlayers.map((u) => {
                      const pos = u.playerInfo?.position;
                      const posLabel = pos === 'defesa' ? 'DEF' : pos === 'meio' ? 'MEI' : pos === 'ataque' ? 'ATA' : '—';
                      const posHex = pos === 'defesa' ? '#d99a1a' : pos === 'meio' ? '#0d7a72' : '#c2560f';
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleAddExistingPlayer(u)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#eee7d8] hover:bg-paper transition-colors text-left"
                        >
                          <span className="w-9 h-9 flex-none rounded-full bg-wine-tint text-wine font-bold text-sm flex items-center justify-center">
                            {u.playerInfo?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[13.5px] text-ink truncate">{u.playerInfo?.name || u.email}</div>
                            <div className="text-[11px] text-ink-soft truncate">{u.email}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-none">
                            <span
                              className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.04em] px-[7px] py-[3px] rounded-md"
                              style={{ color: '#5c5647', background: '#ece5d6' }}
                            >
                              <span className="w-[5px] h-[5px] rounded-full" style={{ background: posHex }} />
                              {posLabel}
                            </span>
                            <span className="tracking-[0.5px] leading-none text-[11px]">
                              {[0, 1, 2, 3, 4].map(i => (
                                <span key={i} style={{ color: i < (u.playerInfo?.skillLevel || 0) ? '#d99a1a' : '#ded8c9' }}>★</span>
                              ))}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-ink-soft text-sm">
                  {searchTerm ? 'Nenhum jogador encontrado com esse termo.' : 'Nenhum jogador disponível para adicionar.'}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-line flex items-center justify-between">
              <span className="text-[12px] text-ink-soft">Toque para adicionar · a lista some ao confirmar</span>
              <button
                onClick={() => { setIsSelectPlayerModalOpen(false); setSearchTerm(''); }}
                className="bg-wine text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] hover:bg-wine-dark transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal da Lista de Espera */}
      {waitingListMatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setWaitingListMatchId(null)}>
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-line">
              <h2 className="font-heading font-bold text-lg text-ink">Lista de espera</h2>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-icon hover:text-ink hover:bg-paper text-xl"
                onClick={() => setWaitingListMatchId(null)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                const POS_LABEL: Record<string, string> = { defesa: 'DEF', meio: 'MEI', ataque: 'ATA' };
                const POS_HEX: Record<string, string> = { defesa: '#d99a1a', meio: '#0d7a72', ataque: '#c2560f' };
                const badge = (position: string) => (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.04em] px-[7px] py-[3px] rounded-md flex-none" style={{ color: '#5c5647', background: '#ece5d6' }}>
                    <span className="w-[5px] h-[5px] rounded-full" style={{ background: POS_HEX[position] }} />
                    {POS_LABEL[position]}
                  </span>
                );
                const chip = (order: number) => (
                  <span className="chip w-8 h-8 flex-none rounded-full bg-ink text-white font-stat font-bold text-[12px] flex items-center justify-center">{order}</span>
                );

                const match = game?.matches.find(m => m.id === waitingListMatchId);
                if (!match) return null;
                const canManage2 = user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista';

                if (match.status === 'in_progress') {
                  const waitingPlayers = (game.waitingList || [])
                    .map(pid => game.players.find(p => p.id === pid))
                    .filter(Boolean) as Player[];

                  if (waitingPlayers.length === 0) {
                    return <div className="text-ink-soft text-sm py-4 text-center">Nenhum jogador na lista de espera.</div>;
                  }

                  return (
                    <>
                      {canManage2 && (
                        <div className="text-[11px] text-ink-soft mb-2">Arraste (ou use ↑/↓) para mudar a ordem da fila.</div>
                      )}
                      <WaitingReorderList
                        players={waitingPlayers}
                        canManage={canManage2}
                        onReorder={handleReorderWaitingList}
                        onRemove={handleRemoveFromWaitingList}
                      />
                    </>
                  );
                }

                const { playersOut, playersIn } = getPlayersNotInNextMatch(match);
                const row = (player: Player, tone: 'out' | 'in') => (
                  <div key={player.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-[#eee7d8] bg-surface">
                    <span className="w-1.5 h-8 rounded-full flex-none" style={{ background: tone === 'out' ? '#dc2626' : '#1f6b46' }} />
                    {chip(player.arrivalOrder)}
                    <span className="flex-1 font-semibold text-[14px] text-ink truncate">{player.name}</span>
                    {badge(player.position)}
                  </div>
                );
                return (
                  <div className="space-y-4">
                    <div>
                      <div className="text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-2">Saíram</div>
                      <div className="space-y-1.5">
                        {playersOut.length === 0 ? <div className="text-ink-soft text-sm">Ninguém saiu.</div> : playersOut.map(p => row(p, 'out'))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-ink-soft uppercase tracking-wide mb-2">Entraram</div>
                      <div className="space-y-1.5">
                        {playersIn.length === 0 ? <div className="text-ink-soft text-sm">Ninguém entrou.</div> : playersIn.map(p => row(p, 'in'))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento do Diarista */}
      {showDiaristaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDiaristaModal(false)}>
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-line">
              <div>
                <h2 className="font-heading font-bold text-lg text-ink">Confirmar pagamento</h2>
                <p className="text-[12px] text-ink-soft">Diária de {selectedDiarista?.name}</p>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-icon hover:text-ink hover:bg-paper text-xl"
                onClick={() => setShowDiaristaModal(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <label className="block text-[13px] font-medium text-ink-medium mb-1.5">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft font-stat font-semibold">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full border border-line rounded-lg pl-10 pr-3 py-2.5 font-stat text-lg text-ink focus:outline-none focus:ring-2 focus:ring-wine focus:border-transparent"
                  value={diaristaPaymentValue === 0 ? '' : diaristaPaymentValue}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setDiaristaPaymentValue(value === '' ? 0 : Number(value));
                  }}
                  placeholder="30"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {[15, 20, 25, 30].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDiaristaPaymentValue(v)}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${diaristaPaymentValue === v ? 'bg-wine text-white' : 'bg-line-soft text-ink-medium hover:bg-line'}`}
                  >
                    R$ {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-line flex items-center gap-2">
              <button
                onClick={() => setDiaristaFree(true)}
                className="text-[13px] font-semibold text-state-success bg-state-success/10 px-3.5 py-2 rounded-lg hover:bg-state-success/20 transition-colors disabled:opacity-50"
                type="button"
                disabled={!selectedDiarista}
              >
                Marcar grátis
              </button>
              <button
                onClick={() => setShowDiaristaModal(false)}
                className="ml-auto text-[13px] font-semibold text-ink-medium bg-line-soft px-4 py-2 rounded-lg hover:bg-line transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDiaristaPayment}
                className="text-[13px] font-semibold text-white bg-wine px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={!selectedDiarista}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
