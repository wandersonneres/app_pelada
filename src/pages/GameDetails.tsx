import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, deleteDoc, Timestamp, getDocs, collection, setDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game, Team, Player, Match, convertTimestampToDate } from '../types';
import { ArrowLeft, Calendar, MapPin, Users, Edit, Trash2, Check, ArrowLeftRight, User, Plus, Target, Footprints } from 'lucide-react';
import { PlayerOptionsModal } from '../components/PlayerOptionsModal';
import { Portal } from '../components/ui/Portal';
import { CombinedPitch } from '../components/CombinedPitch';
import { StarRating } from '../components/StarRating';
import { TacticalView } from '../components/TacticalView';
import { MatchTimer } from '../components/MatchTimer';
import { GameAnalytics } from '../components/GameAnalytics';
import { MatchScore } from '../components/MatchScore';
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
    <Portal>
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-40 max-h-screen overflow-y-auto">
      <div className="bg-[var(--surface-solid)] text-ink rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-heading">Adicionar Jogador</h2>
          <button onClick={onClose} className="text-ink-dim hover:text-ink-soft text-xl">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-ink-soft">Nome do Jogador</label>
            <input
              className="field-input"
                value={playerName}
              onChange={e => setPlayerName(e.target.value)}
                placeholder="Digite o nome do jogador"
              />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-ink-soft">Posição</label>
            <div className="grid grid-cols-3 gap-2">
              {['defesa', 'meio', 'ataque'].map(pos => (
                <button
                  key={pos}
                  type="button"
                  className={`px-3 py-2 rounded-lg border ${playerPosition === pos ? 'bg-team-blue text-white' : 'bg-surface-hover text-ink-soft'} transition-colors`}
                  onClick={() => setPlayerPosition(pos as any)}
                >
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-ink-soft">Nível de Habilidade</label>
            <StarRating value={playerSkillLevel} onChange={handleSkillChange} size="md" showLabel={true} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-ink-soft">Faixa Etária</label>
            <div className="grid grid-cols-2 gap-2">
              {['15-20', '21-30', '31-40', '41-50', '+50'].map(age => (
                <button
                  key={age}
                  type="button"
                  className={`px-3 py-2 rounded-lg border ${playerAgeGroup === age ? 'bg-team-blue text-white' : 'bg-surface-hover text-ink-soft'} transition-colors`}
                  onClick={() => setPlayerAgeGroup(age as any)}
                >
                  {age} anos
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-ink-soft">Tipo de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {['mensalista', 'diarista'].map(type => (
                <button
                  key={type}
                  type="button"
                  className={`px-3 py-2 rounded-lg border ${playerPaymentType === type ? 'bg-team-blue text-white' : 'bg-surface-hover text-ink-soft'} transition-colors`}
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
            className="px-4 py-2 text-sm font-medium text-ink-soft bg-surface-hover rounded-lg hover:bg-surface-hover transition-colors"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-team-blue rounded-lg hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            disabled={isJoining || !playerName.trim()}
          >
            {isJoining ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
    </Portal>
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

  return (
    <Portal>
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40">
      <div className="bg-[var(--surface-solid)] rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] mx-4 relative animate-fade-in flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg text-ink-soft">Trocar Jogador</h2>
          <button
            className="text-ink-dim hover:text-ink-soft text-xl font-bold"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Trocar com jogador do outro time */}
          <div>
            <div className="font-medium mb-3 text-ink-soft">Trocar com jogador do outro time</div>
            <div className="space-y-2">
              {otherTeamPlayers.length === 0 ? (
                <div className="text-ink-dim text-sm py-2">Nenhum jogador disponível no outro time.</div>
              ) : (
                otherTeamPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onSwapPlayers(player)}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-team-blue/10 transition-colors text-left border border-divider"
                  >
                    <div className="w-8 h-8 rounded-full bg-team-blue/15 flex items-center justify-center font-bold text-team-blue-soft text-sm mr-3">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-heading truncate">{player.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          player.position === 'defesa' ? 'bg-warning/15 text-warning-soft' :
                          player.position === 'meio' ? 'bg-team-blue/15 text-team-blue-soft' :
                          'bg-danger/15 text-danger-soft'
                        }`}>
                          {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                        </span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < player.skillLevel ? 'text-yellow-400' : 'text-ink-dim'}`} fill="currentColor" viewBox="0 0 20 20">
                              <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ArrowLeftRight className="w-4 h-4 text-team-blue ml-2" />
                  </button>
                ))
              )}
            </div>
          </div>

          <hr className="border-divider" />

          {/* Substituir por jogador da lista de espera */}
          <div>
            <div className="font-medium mb-3 text-ink-soft">Substituir por jogador da lista de espera</div>
            <div className="space-y-2">
              {waitingPlayers.length === 0 ? (
                <div className="text-ink-dim text-sm py-2">Nenhum jogador na lista de espera.</div>
              ) : (
                waitingPlayers.map((player) => (
                  <div key={player.id} className="flex items-center w-full p-3 rounded-lg border border-divider">
                    <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center font-bold text-success-soft text-sm mr-3">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-heading truncate">{player.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          player.position === 'defesa' ? 'bg-warning/15 text-warning-soft' :
                          player.position === 'meio' ? 'bg-team-blue/15 text-team-blue-soft' :
                          'bg-danger/15 text-danger-soft'
                        }`}>
                          {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                        </span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < player.skillLevel ? 'text-yellow-400' : 'text-ink-dim'}`} fill="currentColor" viewBox="0 0 20 20">
                              <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => onReplacePlayer(player)}
                        className="p-2 rounded-lg hover:bg-success/10 transition-colors"
                        title="Substituir jogador"
                      >
                        <ArrowLeftRight className="w-4 h-4 text-green-500" />
                      </button>
                      <button
                        onClick={() => onRemoveFromWaitingList(player)}
                        className="p-2 rounded-lg hover:bg-danger/10 transition-colors"
                        title="Remover da lista de espera"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}

export function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  const [selectedTab, setSelectedTab] = useState<'jogadores' | 'partidas' | 'analises'>('jogadores');
  const partidaGridRef = useRef<HTMLDivElement>(null);
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

  // Tablet na horizontal (~1280x800): faz a aba Partidas caber na tela sem rolar
  // a página — mede a posição do grid e fixa a altura para o restante do viewport.
  // Cada coluna rola internamente (CSS). Fora dessa faixa, limpa a altura inline.
  useLayoutEffect(() => {
    const mql = window.matchMedia(
      '(min-width: 1180px) and (max-width: 1366px) and (max-height: 834px) and (orientation: landscape)'
    );
    const recompute = () => {
      const el = partidaGridRef.current;
      if (!el) return;
      el.style.height = ''; // volta ao natural antes de medir
      if (mql.matches && selectedTab === 'partidas') {
        // Quanto a página transborda do viewport com o layout natural.
        // Encolher o grid exatamente por esse valor faz tudo caber, sem depender
        // da altura do que está acima/abaixo (offset-free nas duas pontas).
        const overflow = document.documentElement.scrollHeight - window.innerHeight;
        if (overflow > 0) {
          const naturalH = el.getBoundingClientRect().height;
          el.style.height = `${Math.max(320, naturalH - overflow - 8)}px`;
        }
      }
    };
    recompute();
    window.addEventListener('resize', recompute);
    mql.addEventListener('change', recompute);
    return () => {
      window.removeEventListener('resize', recompute);
      mql.removeEventListener('change', recompute);
      if (partidaGridRef.current) partidaGridRef.current.style.height = '';
    };
  }, [selectedTab, expandedMatchId, game?.matches?.length]);

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
      if (!id) return;
      const gameRef = doc(db, 'games', id);
      await updateDoc(gameRef, {
        matches: updatedMatches,
        currentMatch: null,
        status: 'waiting',
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-team-blue"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-ink-muted text-lg">Jogo não encontrado</span>
      </div>
    );
  }

  const isGameFull = game.players?.length >= game.maxPlayers;

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

  const handleTimerUpdate = async (matchId: string, timerData: {
    isRunning: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    startedAt?: Date;
  }) => {
    if (!game || !id) return;

    try {
      const updatedMatches = game.matches.map(match => {
        if (match.id === matchId) {
          return {
            ...match,
            timer: timerData,
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
    <div className={`pelada-page${selectedTab === 'partidas' ? ' partida-page' : ''}`}>
    <div className="pelada-inner relative z-10 w-full px-4 sm:px-6 lg:px-10 py-5">
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${toastMsg.type === 'success' ? 'bg-success/100' : 'bg-danger/100'}`}>{toastMsg.message}</div>
      )}
      <div className="pelada-header flex flex-wrap items-center gap-x-4 gap-y-3 mb-6">
        <button
          onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-surface-hover transition-colors shrink-0" aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-wide text-heading leading-none">Detalhes da Pelada</h1>
          <p className="text-xs text-ink-muted mt-1">{game && formatDate(game.date)}</p>
        </div>
        {/* Info em chips (compacto) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="glass-pill"><MapPin className="w-3.5 h-3.5 text-success" />{game?.location}</span>
          <span className="glass-pill"><Users className="w-3.5 h-3.5 text-team-blue-soft" />{game?.players.length}</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${game?.status === 'waiting' ? 'bg-warning/15 text-warning-soft border border-warning/30' : game?.status === 'in_progress' ? 'bg-team-blue/15 text-team-blue-soft border border-team-blue/30' : 'bg-success/15 text-success-soft border border-success/30'}`}>{game && getStatusText(game.status)}</span>
        </div>
        <div className="flex-1 hidden md:block" />
        <div className="flex gap-2 w-full md:w-auto md:justify-end">
          {(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
            <>
              <button
                onClick={handleFinishGame}
                className={`flex-1 md:flex-none inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  game?.status === 'finished'
                    ? 'bg-warning/15 text-warning-soft hover:bg-warning/25'
                    : 'bg-success/15 text-success-soft hover:bg-success/25'
                }`}
                aria-label={game?.status === 'finished' ? 'Reabrir pelada' : 'Finalizar pelada'}
              >
                <Check className="w-4 h-4 mr-1.5 shrink-0" />
                {game?.status === 'finished' ? 'Reabrir' : 'Finalizar'}
              </button>
              <button
                onClick={() => navigate(`/game/${game?.id}/edit`)}
                className="flex-1 md:flex-none inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-team-blue/15 text-team-blue-soft hover:bg-team-blue/25 transition-colors"
                aria-label="Editar pelada"
              >
                <Edit className="w-4 h-4 mr-1.5 shrink-0" />
                Editar
              </button>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex-1 md:flex-none inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-danger/15 text-danger-soft hover:bg-danger/25 transition-colors"
                aria-label="Excluir pelada"
              >
                <Trash2 className="w-4 h-4 mr-1.5 shrink-0" />
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      <Portal>
      <AnimatePresence>
        {isDeleteDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--surface-solid)] rounded-xl shadow-lg p-6 w-full max-w-md mx-4"
            >
              <h2 className="text-lg font-bold text-heading mb-2">
                Excluir Pelada
              </h2>
              <p className="text-ink-soft mb-6">
                Tem certeza que deseja excluir esta pelada? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-ink-soft bg-surface-hover rounded-lg hover:bg-surface-hover transition-colors"
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
      </Portal>


      {/* Observações */}
      {game?.observations && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mb-4">
          <span className="text-ink-soft text-sm">{game.observations}</span>
        </motion.div>
      )}

                        {/* Lista de Jogadores */}
      <div className="pelada-content-card glass-card p-4 sm:p-5 mb-4">
        {/* Tabs */}
        <div className="pelada-tabs flex gap-2 mb-4 border-b border-divider">
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${selectedTab === 'jogadores' ? 'border-team-blue text-team-blue-soft' : 'border-transparent text-ink-muted hover:text-team-blue'}`}
            onClick={() => setSelectedTab('jogadores')}
          >
            Jogadores
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${selectedTab === 'partidas' ? 'border-team-blue text-team-blue-soft' : 'border-transparent text-ink-muted hover:text-team-blue'}`}
            onClick={() => setSelectedTab('partidas')}
          >
            Partidas
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${selectedTab === 'analises' ? 'border-team-blue text-team-blue-soft' : 'border-transparent text-ink-muted hover:text-team-blue'}`}
            onClick={() => setSelectedTab('analises')}
          >
            Análises
          </button>
        </div>

        {/* Conteúdo das tabs */}
        {selectedTab === 'jogadores' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-heading">Jogadores Confirmados</h2>
              {(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && game.status !== 'finished' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddPlayerModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-team-blue text-white rounded-lg hover:brightness-110 transition-colors text-sm"
                    title="Adicionar Jogador"
                  >
                    <Plus className="w-4 h-3" />
                    <span className="hidden lg:inline">Adicionar Jogador</span>
                  </button>
                  <button
                    onClick={handleOpenSelectPlayerModal}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-hover text-ink-soft rounded-lg hover:bg-surface-hover transition-colors text-sm"
                    title="Selecionar Jogador"
                  >
                    <User className="w-4 h-3" />
                    <span className="hidden lg:inline">Selecionar Jogador</span>
                  </button>
                </div>
              )}
            </div>
                {game.players && game.players.length > 0 ? (
              <ul className="divide-y divide-divider">
                {game.players
                  .sort((a, b) => a.arrivalOrder - b.arrivalOrder)
                  .map((player, idx) => (
                    <li key={player.id} className="py-2">
                      <div className="flex flex-row items-center w-full">
                        {/* Bloco esquerdo: ordem, nome, estrelas, idade */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {/* Ordem */}
                            <span className="w-7 text-xs text-center font-mono text-ink-dim">{String(player.arrivalOrder).padStart(2, '0')}</span>
                            {/* Nome */}
                            <span className="font-medium text-ink-soft text-sm truncate max-w-[200px] md:max-w-[250px]">
                              {player.name}
                              {/* <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${player.paymentType === 'mensalista' ? 'bg-success/15 text-success-soft' : 'bg-team-orange/15 text-team-orange-soft'}`}>{player.paymentType === 'mensalista' ? 'Mensalista' : 'Diarista'}</span> */}
                            </span>
                            {/* {player.paymentType === 'diarista' && diaristaPayments[player.id] && (
                              <span className="ml-2 px-2 py-0.5 rounded-lg text-xs font-medium bg-success/15 text-success-soft" title={`Pago em ${new Date(diaristaPayments[player.id].date).toLocaleDateString('pt-BR')} - R$ ${diaristaPayments[player.id].value.toFixed(2)}`}>
                                Pago ✓
                              </span>
                            )} */}
                          </div>
                          <div className="flex gap-2 mt-0.5 ml-7">
                            {/* Estrelas */}
                            <span className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < player.skillLevel ? 'text-yellow-400' : 'text-ink-dim'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" />
                                </svg>
                              ))}
                            </span>
                            {/* Idade */}
                            <span className="text-xs text-ink-dim">{player.ageGroup} anos</span>
                            <span className="text-xs text-ink-dim ml-2">{player.arrivalTime ? convertTimestampToDate(player.arrivalTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</span>
                            {(player.paymentType === 'diarista') && (user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (                              
                              <button
                                onClick={() => handleDiaristaPayment(player.id, player.name)}
                                className={`ml-2 px-2 py-0.5 rounded-lg text-xs font-medium ${
                                  diaristaPayments[player.id]
                                    ? 'bg-success/15 text-success-soft'
                                    : 'bg-team-blue/15 text-team-blue-soft hover:bg-team-blue/25'
                                } transition-colors`}
                                title={diaristaPayments[player.id] ? `Pago em ${new Date(diaristaPayments[player.id].date).toLocaleDateString('pt-BR')} - R$ ${diaristaPayments[player.id].value.toFixed(2)} - Registrado por: ${diaristaPayments[player.id].recordBy}` : 'Pagou'}
                              >
                                {diaristaPayments[player.id] ? 'Pago ✓' : 'Pagou'}
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Bloco direito: posição e botão */}
                        <div className="flex flex-col items-end justify-center gap-1 ml-2">
                          <span className={`px-1.5 py-0.5 rounded-full font-semibold text-[10px] flex items-center ${player.position === 'defesa' ? 'bg-warning/15 text-warning-soft' : player.position === 'meio' ? 'bg-team-blue/15 text-team-blue-soft' : 'bg-danger/15 text-danger-soft'}`}>
                            {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                          </span>
                          <button
                            className="p-2 rounded hover:bg-surface-hover flex items-center justify-center"
                            onClick={() => { setSelectedPlayer(player); setIsPlayerOptionsOpen(true); }}
                            title="Editar/Remover"
                            style={{ display: (user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && game.status !== 'finished' ? 'flex' : 'none' }}
                          >
                            <span className="text-lg leading-none">⋮</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="text-ink-muted text-center py-8">Nenhum jogador confirmado ainda.</div>
            )}
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
                    </>
                  )}

        {selectedTab === 'partidas' && (
          <div className="space-y-3">
            {game.matches && game.matches.length > 0 ? (() => {
              const matches = game.matches;
              const selId = expandedMatchId && matches.some(m => m.id === expandedMatchId)
                ? expandedMatchId
                : matches[matches.length - 1].id;
              const match = matches.find(m => m.id === selId)!;
              const idx = matches.findIndex(m => m.id === match.id);
              const team0 = match.teams[0];
              const team1 = match.teams[1];
              const team0Players = team0?.players || [];
              const team1Players = team1?.players || [];
              const avg = (vals: number[]) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0);
              const t0Age = avg(team0Players.map(p => getAgeValue(p.ageGroup)));
              const t1Age = avg(team1Players.map(p => getAgeValue(p.ageGroup)));
              const t0Skill = avg(team0Players.map(p => p.skillLevel));
              const t1Skill = avg(team1Players.map(p => p.skillLevel));
              const t0Score = calculateTeamScore(team0Players);
              const t1Score = calculateTeamScore(team1Players);
              const scoreA = team0?.score ?? 0;
              const scoreB = team1?.score ?? 0;
              const stats = (id: string) => ({
                goals: match.goals?.filter(g => g.scorerId === id && !g.ownGoal).length || 0,
                assists: match.goals?.filter(g => g.assisterId === id).length || 0,
              });
              const isAdmin = user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista';
              const canManage = isAdmin && game.status !== 'finished';
              const posOrder = { defesa: 0, meio: 1, ataque: 2 } as const;
              const sortRoster = (ps: typeof team0Players) => [...ps].sort((a, b) => posOrder[a.position] - posOrder[b.position]);
              const posBadge = (pos: string) =>
                pos === 'defesa' ? 'bg-team-blue/15 text-team-blue-soft' : pos === 'meio' ? 'bg-meio/15 text-meio-soft' : 'bg-danger/15 text-danger-soft';
              const h2hRows = [
                { label: 'Força do time', a: t0Score, b: t1Score },
                { label: 'Média de idade', a: t0Age, b: t1Age },
                { label: 'Habilidade média', a: t0Skill, b: t1Skill },
              ];

              const rosterCard = (team: typeof team0, players: typeof team0Players, isTeamA: boolean, scoreVal: number, ageVal: number, skillVal: number) => (
                <div className={`glass-card p-3.5 ${isTeamA ? 'bg-team-blue/[0.06] border-team-blue/20' : 'bg-team-orange/[0.06] border-team-orange/20'}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-heading font-extrabold text-white shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.35)]" style={{ background: isTeamA ? 'linear-gradient(155deg,#5b9bf6,#2c5fb0)' : 'linear-gradient(155deg,#fba56a,#d2691e)' }}>{(team?.name || (isTeamA ? 'A' : 'B')).charAt(0).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-extrabold text-base text-heading truncate leading-tight">{team?.name || (isTeamA ? 'Time Azul' : 'Time Laranja')}</h3>
                      <span className="text-[11px] text-ink-muted">Idade {ageVal.toFixed(1)} · Habilidade {skillVal.toFixed(1)}</span>
                    </div>
                    <span className={`font-heading font-extrabold text-xl ${isTeamA ? 'text-team-blue-soft' : 'text-team-orange-soft'}`}>{scoreVal.toFixed(1)}</span>
                  </div>
                  {sortRoster(players).map(player => {
                    const st = stats(player.id);
                    return (
                      <div key={player.id} className="flex items-center gap-2 py-1 border-t border-divider">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-white text-xs shrink-0" style={{ background: isTeamA ? 'linear-gradient(155deg,#5b9bf6,#2c5fb0)' : 'linear-gradient(155deg,#fba56a,#d2691e)' }}>{player.name.charAt(0).toUpperCase()}</div>
                        <span className="flex-1 min-w-0 text-sm font-medium text-ink-soft truncate">{player.name}</span>
                        <span className={`w-9 text-center shrink-0 px-1 py-0.5 rounded text-[10px] font-bold font-heading tracking-wide ${posBadge(player.position)}`}>{player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}</span>
                        <span className="w-8 shrink-0 flex items-center justify-end gap-0.5 text-xs font-bold text-ink-soft">
                          {st.goals > 0 && (<><Target className="w-3 h-3" />{st.goals}</>)}
                        </span>
                        <span className="w-7 shrink-0 flex justify-center">
                          {st.assists > 0 && (<span className="text-[11px] font-extrabold text-ink-muted px-1.5 py-0.5 rounded bg-surface-hover">A{st.assists > 1 ? st.assists : ''}</span>)}
                        </span>
                        {match.status === 'in_progress' && canManage && (
                          <button
                            className="shrink-0 p-1.5 rounded-full hover:bg-team-blue/15 transition"
                            title="Trocar jogador"
                            onClick={() => { setIsPlayerSwapOpen(true); setSelectedPlayer(player); setSelectedTeam(team); setSelectedMatch(match); }}
                          >
                            <ArrowLeftRight className="w-4 h-4 text-team-blue" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );

              return (
                <div className="space-y-4">
                  {/* Faixa superior: seletor de jogos + ações */}
                  <div className="glass-card p-2.5 flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto no-scrollbar">
                      <span className="font-heading font-bold text-[11px] uppercase tracking-wider text-ink-muted shrink-0 px-1 hidden sm:inline">Jogos</span>
                      {matches.map((mm, i) => {
                        const sel = mm.id === match.id;
                        return (
                          <button
                            key={mm.id}
                            onClick={() => { setExpandedMatchId(mm.id); }}
                            className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-xl border shrink-0 transition-all ${sel ? 'bg-surface-strong border-divider-strong shadow-[0_8px_20px_-12px_rgba(0,0,0,0.7)]' : 'bg-surface border-divider hover:bg-surface-hover'}`}
                          >
                            <span className="font-heading font-semibold text-[10px] uppercase tracking-wider text-ink-muted">Jogo {i + 1}</span>
                            <span className="flex items-baseline gap-1 font-heading font-extrabold text-base leading-none">
                              <span className="text-team-blue-soft">{mm.teams[0]?.score ?? 0}</span>
                              <span className="text-ink-dim text-[11px]">×</span>
                              <span className="text-team-orange-soft">{mm.teams[1]?.score ?? 0}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {canManage && (
                        <>
                          <button
                            onClick={() => setIsPlayersPerTeamOpen(true)}
                            title="Jogadores por time"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface border border-divider text-sm font-semibold text-ink-soft hover:bg-surface-hover transition"
                          >
                            {playersPerTeam}x{playersPerTeam}
                            <svg className="w-2.5 h-2.5 text-ink-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          <button
                            onClick={generateTeams}
                            disabled={isGeneratingTeams || game.players.length < 4 || (game.matches && game.matches.length > 0 && game.matches[game.matches.length - 1].status !== 'finished')}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-team-blue text-white text-sm font-semibold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {isGeneratingTeams ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Nova partida</span>
                          </button>
                          <div className="w-px h-6 bg-divider mx-0.5" />
                        </>
                      )}
                      <button className="p-2 rounded-lg hover:bg-surface-hover transition" title="Lista de espera" onClick={() => setWaitingListMatchId(match.id)}>
                        <Users className="w-4 h-4 text-team-blue-soft" />
                      </button>
                      {canManage && (
                        <button
                          className="p-2 rounded-lg hover:bg-danger/15 transition"
                          title="Excluir partida"
                          onClick={() => { if (window.confirm('Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.')) deleteMatch(match.id); }}
                        >
                          <Trash2 className="w-4 h-4 text-danger-soft" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grid principal */}
                  <div ref={partidaGridRef} className="partida-fit grid grid-cols-1 min-[1180px]:grid-cols-[minmax(300px,340px)_minmax(0,1fr)_minmax(300px,340px)] gap-4 items-stretch">
                  {/* COLUNA ESQUERDA */}
                  <div className="flex flex-col gap-3">
                    {/* Placar / Timer */}
                    {match.status === 'in_progress' ? (
                      <MatchTimer
                        teamA={team0}
                        teamB={team1}
                        isFirstMatch={idx === 0}
                        onGoalScored={(teamId, scorerId, assisterId, ownGoal) => handleGoalScored(match.id, teamId, scorerId, assisterId, ownGoal)}
                        onRemoveGoal={(goalId) => handleRemoveGoal(match.id, goalId)}
                        match={match}
                        roster={game.players}
                        onTimerUpdate={createTimerUpdateHandler(match.id)}
                      />
                    ) : (
                      <div className="glass-card p-4 sm:p-5">
                        <div className="flex justify-center mb-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-success/15 text-success-soft border border-success/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Finalizada
                          </span>
                        </div>
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-extrabold text-xl text-white shadow-[0_6px_16px_rgba(0,0,0,0.4)]" style={{ background: 'linear-gradient(155deg,#5b9bf6,#2c5fb0)' }}>{(team0?.name || 'A').charAt(0).toUpperCase()}</div>
                            <span className="font-heading font-bold text-xs uppercase tracking-wide text-ink-soft text-center leading-tight">{team0?.name || 'Time Azul'}</span>
                          </div>
                          <div className="flex items-center gap-2 font-heading font-extrabold leading-none">
                            <span className="text-4xl text-team-blue-soft">{scoreA}</span>
                            <span className="text-xl text-ink-dim">×</span>
                            <span className="text-4xl text-team-orange-soft">{scoreB}</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-extrabold text-xl text-white shadow-[0_6px_16px_rgba(0,0,0,0.4)]" style={{ background: 'linear-gradient(155deg,#fba56a,#d2691e)' }}>{(team1?.name || 'B').charAt(0).toUpperCase()}</div>
                            <span className="font-heading font-bold text-xs uppercase tracking-wide text-ink-soft text-center leading-tight">{team1?.name || 'Time Laranja'}</span>
                          </div>
                        </div>
                        <div className="h-px bg-divider my-3" />
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex flex-col gap-1.5 items-end">
                            {team0Players.filter(p => stats(p.id).goals > 0).map(p => (
                              <span key={p.id} className="flex items-center gap-1.5 text-ink-soft"><span className="font-medium">{p.name.split(' ')[0]}</span>{stats(p.id).goals > 1 && <span className="text-ink-muted">×{stats(p.id).goals}</span>}<Target className="w-3 h-3 text-team-blue-soft" /></span>
                            ))}
                            {team0Players.filter(p => stats(p.id).goals > 0).length === 0 && <span className="text-ink-dim">Sem gols</span>}
                          </div>
                          <div className="flex flex-col gap-1.5 items-start">
                            {team1Players.filter(p => stats(p.id).goals > 0).map(p => (
                              <span key={p.id} className="flex items-center gap-1.5 text-ink-soft"><Target className="w-3 h-3 text-team-orange-soft" /><span className="font-medium">{p.name.split(' ')[0]}</span>{stats(p.id).goals > 1 && <span className="text-ink-muted">×{stats(p.id).goals}</span>}</span>
                            ))}
                            {team1Players.filter(p => stats(p.id).goals > 0).length === 0 && <span className="text-ink-dim">Sem gols</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confronto dos times — compacto, preenche a coluna esquerda */}
                    <div className="glass-card p-3 grid grid-cols-3 gap-3">
                      {h2hRows.map(row => {
                        const tot = (row.a + row.b) || 1;
                        return (
                          <div key={row.label} className="flex flex-col gap-1.5">
                            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted text-center truncate">{row.label}</div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-heading font-extrabold text-base leading-none text-team-blue-soft">{row.a.toFixed(1)}</span>
                              <span className="font-heading font-extrabold text-base leading-none text-team-orange-soft">{row.b.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="flex-1 h-1.5 rounded-full bg-surface-hover overflow-hidden flex justify-end"><div className="h-full rounded-full" style={{ width: `${(row.a / tot) * 100}%`, background: '#3B82F6' }} /></div>
                              <div className="flex-1 h-1.5 rounded-full bg-surface-hover overflow-hidden flex justify-start"><div className="h-full rounded-full" style={{ width: `${(row.b / tot) * 100}%`, background: '#F97316' }} /></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Botões de finalização — desktop (na coluna); no mobile aparecem no fim */}
                    {match.status === 'in_progress' && canManage && (
                      <div className="hidden min-[1180px]:flex flex-col gap-2 mt-auto pt-2">
                        <button className="py-2.5 rounded-xl bg-team-blue text-white font-semibold hover:brightness-110 transition" onClick={() => finishMatch(match.id, team0.id)}>{team0?.name} Venceu</button>
                        <button className="py-2.5 rounded-xl bg-team-orange text-white font-semibold hover:brightness-110 transition" onClick={() => finishMatch(match.id, team1.id)}>{team1?.name} Venceu</button>
                      </div>
                    )}
                  </div>

                  {/* COLUNA CENTRAL: campo */}
                  <CombinedPitch
                    teamA={team0}
                    teamB={team1}
                    goals={match.goals}
                    formationA={team0?.formation?.tactical || '4-3-2'}
                    formationB={team1?.formation?.tactical || '4-3-2'}
                    onFormationChange={(teamId, f) => handleFormationChange(match.id, teamId, f)}
                  />

                  {/* COLUNA DIREITA: escalações — no tablet vertical (grid empilhado) ficam lado a lado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 min-[1180px]:grid-cols-1 gap-3 items-start">
                    {rosterCard(team0, team0Players, true, t0Score, t0Age, t0Skill)}
                    {rosterCard(team1, team1Players, false, t1Score, t1Age, t1Skill)}
                  </div>
                  </div>

                  {/* Botões de finalização — só mobile/tablet (no desktop ficam na coluna esquerda) */}
                  {match.status === 'in_progress' && canManage && (
                    <div className="flex flex-col sm:flex-row gap-2 min-[1180px]:hidden">
                      <button className="flex-1 py-2.5 rounded-xl bg-team-blue text-white font-semibold hover:brightness-110 transition" onClick={() => finishMatch(match.id, team0.id)}>{team0?.name} Venceu</button>
                      <button className="flex-1 py-2.5 rounded-xl bg-team-orange text-white font-semibold hover:brightness-110 transition" onClick={() => finishMatch(match.id, team1.id)}>{team1?.name} Venceu</button>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="glass-card text-center py-12 px-6">
                <p className="text-ink-muted mb-5">Nenhuma partida registrada ainda.</p>
                {game.status !== 'finished' && (user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setIsPlayersPerTeamOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface border border-divider text-sm font-semibold text-ink-soft hover:bg-surface-hover transition"
                    >
                      {playersPerTeam}x{playersPerTeam}
                      <svg className="w-2.5 h-2.5 text-ink-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button
                      onClick={generateTeams}
                      disabled={isGeneratingTeams || game.players.length < 4}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-team-blue text-white text-sm font-semibold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingTeams ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Gerar Nova Partida
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Modal: jogadores por time (acionado pela barra de jogos / estado vazio) */}
            {isPlayersPerTeamOpen && (
              <Portal>
              <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50" onClick={() => setIsPlayersPerTeamOpen(false)}>
                <div className="bg-[var(--surface-solid)] rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-divider">
                    <div>
                      <div className="font-bold text-base text-ink-soft">Jogadores por time</div>
                      <div className="text-xs text-ink-muted">Selecione o formato da partida</div>
                    </div>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full text-ink-dim hover:text-ink-soft hover:bg-surface-hover text-xl font-bold"
                      onClick={() => setIsPlayersPerTeamOpen(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    {[4, 5, 6, 7, 8, 9, 10].map(n => (
                      <button
                        key={n}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition text-left ${
                          playersPerTeam === n
                            ? 'bg-team-blue text-white'
                            : 'bg-surface hover:bg-team-blue/10 active:bg-team-blue/15 text-ink-soft'
                        }`}
                        onClick={() => { setPlayersPerTeam(n); setIsPlayersPerTeamOpen(false); }}
                      >
                        <span className="font-semibold text-base">{n}x{n}</span>
                        <span className={`text-xs ${playersPerTeam === n ? 'text-white/80' : 'text-ink-dim'}`}>
                          {n * 2} jogadores em campo
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              </Portal>
            )}
          </div>
        )}

        {selectedTab === 'analises' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-heading mb-4">Análises e Estatísticas</h2>
            <GameAnalytics game={game} />
          </div>
        )}
      </div>

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
        <Portal>
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40">
          <div className="bg-[var(--surface-solid)] text-ink shadow-xl w-full h-full rounded-none flex flex-col md:rounded-2xl md:w-full md:max-w-md md:h-auto md:max-h-[85vh] md:mx-4">
            <div className="flex items-center justify-between p-4 border-b border-divider">
              <h2 className="font-bold text-lg text-heading">Selecionar Jogador</h2>
              <button
                className="text-ink-dim hover:text-ink-soft text-xl font-bold"
                onClick={() => {
                  setIsSelectPlayerModalOpen(false);
                  setSearchTerm('');
                }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            
            {/* Campo de busca */}
            <div className="p-4 border-b border-divider">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="field-input pl-10 text-base md:text-sm"
                />
                <svg
                  className="absolute left-3 top-2.5 w-4 h-4 text-ink-dim"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingPlayers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-team-blue"></div>
                </div>
              ) : filteredPlayers.length > 0 ? (
                <>
                  <div className="text-sm text-ink-muted mb-2">
                    {filteredPlayers.length} jogador{filteredPlayers.length !== 1 ? 'es' : ''} disponível{filteredPlayers.length !== 1 ? 'is' : ''}
                  </div>
                  <ul className="space-y-2">
                    {filteredPlayers.map((user) => (
                      <li key={user.id}>
                        <button
                          onClick={() => handleAddExistingPlayer(user)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-team-blue/15 flex items-center justify-center font-bold text-team-blue-soft">
                            {user.playerInfo?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-heading truncate">{user.playerInfo?.name}</div>
                            <div className="text-sm text-ink-muted truncate">{user.email}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.playerInfo?.position === 'defesa' ? 'bg-team-blue/15 text-team-blue-soft' :
                              user.playerInfo?.position === 'meio' ? 'bg-meio/15 text-meio-soft' :
                              'bg-danger/15 text-danger-soft'
                            }`}>
                              {user.playerInfo?.position?.toUpperCase() || 'N/A'}
                            </span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < (user.playerInfo?.skillLevel || 0) ? 'text-yellow-400' : 'text-ink-dim'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="text-center py-8 text-ink-muted">
                  {searchTerm 
                    ? 'Nenhum jogador encontrado com esse termo.' 
                    : 'Nenhum jogador disponível para adicionar.'}
                </div>
              )}
            </div>
          </div>
        </div>
        </Portal>
      )}

      {/* Modal da Lista de Espera */}
      {waitingListMatchId && (
        <Portal>
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40">
          <div className="bg-[var(--surface-solid)] rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] mx-4 relative animate-fade-in flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg text-ink-soft">Lista de Espera</h2>
              <button
                className="text-ink-dim hover:text-ink-soft text-xl font-bold"
                onClick={() => setWaitingListMatchId(null)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                const match = game?.matches.find(m => m.id === waitingListMatchId);
                if (!match) return null;

                // Se a partida está em andamento, mostra a lista de espera
                if (match.status === 'in_progress') {
                  // Usa a waitingList do banco de dados em vez de calcular dinamicamente
                  const waitingPlayers = (game.waitingList || [])
                    .map(pid => game.players.find(p => p.id === pid))
                    .filter(Boolean) as Player[];

                  if (waitingPlayers.length === 0) {
                    return <div className="text-ink-dim text-sm">Nenhum jogador na lista de espera.</div>;
                  }

                  return (
                    <div className="space-y-2">
                      {waitingPlayers.map((player) => (
                        <div key={player.id} className="flex items-center p-3 rounded-lg bg-surface border border-divider">
                          <div className="w-8 h-8 rounded-full bg-team-blue/15 flex items-center justify-center font-bold text-team-blue-soft text-sm mr-3">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-heading truncate">{player.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                player.position === 'defesa' ? 'bg-warning/15 text-warning-soft' :
                                player.position === 'meio' ? 'bg-team-blue/15 text-team-blue-soft' :
                                'bg-danger/15 text-danger-soft'
                              }`}>
                                {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                              </span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-3 h-3 ${i < player.skillLevel ? 'text-yellow-400' : 'text-ink-dim'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                          {(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
                            <button
                              onClick={() => {
                                handleRemoveFromWaitingList(player);
                                // Fecha o modal após remover
                                setTimeout(() => setWaitingListMatchId(null), 500);
                              }}
                              className="p-2 rounded-lg hover:bg-danger/10 transition-colors ml-2"
                              title="Remover da lista de espera"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }

                // Se a partida está finalizada, mostra quem entrou e saiu
                const { playersOut, playersIn } = getPlayersNotInNextMatch(match);
                return (
                  <>
                    <div className="mb-6">
                      <div className="font-medium mb-2">Jogadores que saíram</div>
                      <div className="space-y-2">
                        {playersOut.length === 0 ? (
                          <div className="text-ink-dim text-sm">Nenhum jogador saiu.</div>
                        ) : (
                          playersOut.map((player) => (
                            <div key={player.id} className="flex items-center p-2 rounded-lg bg-danger/10">
                              <User className="w-5 h-5 text-red-400 mr-2" />
                              <span className="flex-1 text-left">{player.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                player.position === 'defesa' ? 'bg-warning/15 text-warning-soft' :
                                player.position === 'meio' ? 'bg-team-blue/15 text-team-blue-soft' :
                                'bg-danger/15 text-danger-soft'
                              }`}>
                                {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium mb-2">Jogadores que entraram</div>
                      <div className="space-y-2">
                        {playersIn.length === 0 ? (
                          <div className="text-ink-dim text-sm">Nenhum jogador entrou.</div>
                        ) : (
                          playersIn.map((player) => (
                            <div key={player.id} className="flex items-center p-2 rounded-lg bg-success/10">
                              <User className="w-5 h-5 text-green-400 mr-2" />
                              <span className="flex-1 text-left">{player.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                player.position === 'defesa' ? 'bg-warning/15 text-warning-soft' :
                                player.position === 'meio' ? 'bg-team-blue/15 text-team-blue-soft' :
                                'bg-danger/15 text-danger-soft'
                              }`}>
                                {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
        </Portal>
      )}

      {/* Modal de Pagamento do Diarista */}
      {showDiaristaModal && (
        <Portal>
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40">
          <div className="bg-[var(--surface-solid)] text-ink rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in">
            <button
              className="absolute top-3 right-4 text-2xl text-ink-dim hover:text-ink-soft"
              onClick={() => setShowDiaristaModal(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4 text-heading">Confirmar Pagamento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-ink-soft">Nome do Diarista</label>
                <input
                  className="field-input"
                  value={selectedDiarista?.name || ''}
                  readOnly
                  placeholder="Nome do diarista"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-ink-soft">Valor do Pagamento</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="field-input pl-9"
                    value={diaristaPaymentValue === 0 ? '' : diaristaPaymentValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setDiaristaPaymentValue(value === '' ? 0 : Number(value));
                    }}
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDiaristaModal(false)}
                className="px-4 py-2 text-sm font-medium text-ink-soft bg-surface-hover rounded-lg hover:bg-surface-hover transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={() => {              
                  setDiaristaFree(true);                  
                }}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-success/15 rounded-lg hover:bg-success/25 transition-colors"
                type="button"
                disabled={!selectedDiarista}
              >
                Gratis
              </button>
              <button
                onClick={confirmDiaristaPayment}
                className="px-4 py-2 text-sm font-medium text-white bg-team-blue rounded-lg hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={!selectedDiarista}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
    </div>
  );
}
