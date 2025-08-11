import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, deleteDoc, Timestamp, getDocs, collection, setDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Game, Team, Player, Match, convertTimestampToDate } from '../types';
import { ArrowLeft, Calendar, MapPin, Users, Edit, Trash2, Check, ArrowLeftRight, User, Plus, Target, Footprints } from 'lucide-react';
import { PlayerOptionsModal } from '../components/PlayerOptionsModal';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Adicionar Jogador</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Jogador</label>
            <input
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  className={`px-3 py-2 rounded-lg border ${playerPosition === pos ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} transition-colors`}
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
                  className={`px-3 py-2 rounded-lg border ${playerAgeGroup === age ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} transition-colors`}
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
                  className={`px-3 py-2 rounded-lg border ${playerPaymentType === type ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} transition-colors`}
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] mx-4 relative animate-fade-in flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg text-gray-800">Trocar Jogador</h2>
          <button
            className="text-gray-400 hover:text-gray-700 text-xl font-bold"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Trocar com jogador do outro time */}
          <div>
            <div className="font-medium mb-3 text-gray-700">Trocar com jogador do outro time</div>
            <div className="space-y-2">
              {otherTeamPlayers.length === 0 ? (
                <div className="text-gray-400 text-sm py-2">Nenhum jogador disponível no outro time.</div>
              ) : (
                otherTeamPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onSwapPlayers(player)}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-blue-50 transition-colors text-left border border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm mr-3">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{player.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          player.position === 'defesa' ? 'bg-yellow-100 text-yellow-800' :
                          player.position === 'meio' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                        </span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < player.skillLevel ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ArrowLeftRight className="w-4 h-4 text-blue-500 ml-2" />
                  </button>
                ))
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Substituir por jogador da lista de espera */}
          <div>
            <div className="font-medium mb-3 text-gray-700">Substituir por jogador da lista de espera</div>
            <div className="space-y-2">
              {waitingPlayers.length === 0 ? (
                <div className="text-gray-400 text-sm py-2">Nenhum jogador na lista de espera.</div>
              ) : (
                waitingPlayers.map((player) => (
                  <div key={player.id} className="flex items-center w-full p-3 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 text-sm mr-3">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{player.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          player.position === 'defesa' ? 'bg-yellow-100 text-yellow-800' :
                          player.position === 'meio' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                        </span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < player.skillLevel ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => onReplacePlayer(player)}
                        className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Substituir jogador"
                      >
                        <ArrowLeftRight className="w-4 h-4 text-green-500" />
                      </button>
                      <button
                        onClick={() => onRemoveFromWaitingList(player)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
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
  );
}

export function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);
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

      // 1. Definir o horário de corte
      const prioridadeHorario = convertTimestampToDate(game.date);
      prioridadeHorario.setHours(8, 35, 0, 0);

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
        // Verifica se tem menos de 18 jogadores
        const totalPlayers = game.players.length;
        const isLowPlayerCount = totalPlayers < 18;

        if (totalPlayers < 4) {
          setToastMsg({ type: 'error', message: 'É necessário pelo menos 4 jogadores para gerar os times.' });
          return;
        }

        // Se tiver menos de 18 jogadores, divide pelo número máximo possível
        let playersForFirstMatch;
        if (isLowPlayerCount) {
          // Calcula o número máximo de jogadores por time (par)
          const maxPlayersPerTeam = Math.floor(totalPlayers / 2);
          const totalPlayersInMatch = maxPlayersPerTeam * 2;
          
          // Pega os primeiros jogadores por ordem de chegada
          playersForFirstMatch = [...game.players]
            .sort((a, b) => a.arrivalOrder - b.arrivalOrder)
            .slice(0, totalPlayersInMatch);

          // Jogadores restantes vão para a lista de espera
          waitingList = game.players
            .filter(p => !playersForFirstMatch.map(p => p.id).includes(p.id))
            .sort((a, b) => a.arrivalOrder - b.arrivalOrder)
            .map(p => p.id);

          console.log(`Adaptação para ${totalPlayers} jogadores: ${maxPlayersPerTeam} por time`);
        } else {
          // Comportamento normal para 18+ jogadores
          playersForFirstMatch = jogadoresParaEntrar.slice(0, 18);

        // Jogadores que não estão jogando vão para a lista de espera
          const playingIds = playersForFirstMatch.map(p => p.id);
        waitingList = game.players
          .filter(p => !playingIds.includes(p.id))
            .sort((a, b) => a.arrivalOrder - b.arrivalOrder)
          .map(p => p.id);
        }

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
            name: 'Time Branco',
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

        const nextTeamIds = waitingList.slice(0, 9);
        if (nextTeamIds.length < 4) {
          setToastMsg({ type: 'error', message: 'Não há jogadores suficientes na lista de espera.' });
          return;
        }

        waitingList = waitingList.slice(9);
        console.log('waitingList local (após remover quem entrou):', waitingList);

        // 5. Monta os times
        const nextTeamPlayers = nextTeamIds.map(pid => game.players.find(p => p.id === pid)).filter(Boolean) as Player[];

        const teams: Team[] = [
          {
            id: 'teamA',
            name: 'Time Branco',
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

  const handleGoalScored = async (matchId: string, teamId: string, scorerId: string, assisterId?: string) => {
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

      if (assisterId) {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500 text-lg">Jogo não encontrado</span>
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${toastMsg.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{toastMsg.message}</div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Detalhes da Pelada</h1>
            <p className="text-sm text-gray-500">{game && formatDate(game.date)}</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto justify-end">
          {(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
            <>
              <button
                onClick={handleFinishGame}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  game?.status === 'finished'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
                aria-label={game?.status === 'finished' ? 'Reabrir pelada' : 'Finalizar pelada'}
              >
                <Check className="w-4 h-4 mr-2" />
                {game?.status === 'finished' ? 'Reabrir' : 'Finalizar'}
              </button>
              <button
                onClick={() => navigate(`/game/${game?.id}/edit`)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                aria-label="Editar pelada"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                aria-label="Excluir pelada"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

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
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Excluir Pelada
              </h2>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir esta pelada? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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

      {/* Cards de informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-green-500" />
            <span className="font-medium">{game?.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-gray-600">{game?.players.length} / {game?.maxPlayers} jogadores</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Status</span>
          </div>
          <span className={`badge ${game?.status === 'waiting' ? 'badge-waiting' : game?.status === 'in_progress' ? 'badge-in-progress' : 'badge-finished'}`}>{game && getStatusText(game.status)}</span>
        </motion.div>
      </div>

      {/* Observações */}
      {game?.observations && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
          <span className="text-gray-600 text-sm">{game.observations}</span>
        </motion.div>
      )}

                        {/* Lista de Jogadores */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${selectedTab === 'jogadores' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500'}`}
            onClick={() => setSelectedTab('jogadores')}
          >
            Jogadores
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${selectedTab === 'partidas' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500'}`}
            onClick={() => setSelectedTab('partidas')}
          >
            Partidas
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${selectedTab === 'analises' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500'}`}
            onClick={() => setSelectedTab('analises')}
          >
            Análises
          </button>
        </div>

        {/* Conteúdo das tabs */}
        {selectedTab === 'jogadores' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Jogadores Confirmados</h2>
              {(user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && game.status !== 'finished' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddPlayerModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    title="Adicionar Jogador"
                  >
                    <Plus className="w-4 h-3" />
                    <span className="hidden lg:inline">Adicionar Jogador</span>
                  </button>
                  <button
                    onClick={handleOpenSelectPlayerModal}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    title="Selecionar Jogador"
                  >
                    <User className="w-4 h-3" />
                    <span className="hidden lg:inline">Selecionar Jogador</span>
                  </button>
                </div>
              )}
            </div>
                {game.players && game.players.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {game.players
                  .sort((a, b) => a.arrivalOrder - b.arrivalOrder)
                  .map((player, idx) => (
                    <li key={player.id} className="py-2">
                      <div className="flex flex-row items-center w-full">
                        {/* Bloco esquerdo: ordem, nome, estrelas, idade */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {/* Ordem */}
                            <span className="w-7 text-xs text-center font-mono text-gray-400">{String(player.arrivalOrder).padStart(2, '0')}</span>
                            {/* Nome */}
                            <span className="font-medium text-gray-800 text-sm truncate max-w-[200px] md:max-w-[250px]">
                              {player.name}
                              {/* <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${player.paymentType === 'mensalista' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{player.paymentType === 'mensalista' ? 'Mensalista' : 'Diarista'}</span> */}
                            </span>
                            {/* {player.paymentType === 'diarista' && diaristaPayments[player.id] && (
                              <span className="ml-2 px-2 py-0.5 rounded-lg text-xs font-medium bg-green-100 text-green-800" title={`Pago em ${new Date(diaristaPayments[player.id].date).toLocaleDateString('pt-BR')} - R$ ${diaristaPayments[player.id].value.toFixed(2)}`}>
                                Pago ✓
                              </span>
                            )} */}
                          </div>
                          <div className="flex gap-2 mt-0.5 ml-7">
                            {/* Estrelas */}
                            <span className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < player.skillLevel ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" />
                                </svg>
                              ))}
                            </span>
                            {/* Idade */}
                            <span className="text-xs text-gray-400">{player.ageGroup} anos</span>
                            <span className="text-xs text-gray-400 ml-2">{player.arrivalTime ? convertTimestampToDate(player.arrivalTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</span>
                            {(player.paymentType === 'diarista') && (user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (                              
                              <button
                                onClick={() => handleDiaristaPayment(player.id, player.name)}
                                className={`ml-2 px-2 py-0.5 rounded-lg text-xs font-medium ${
                                  diaristaPayments[player.id]
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
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
                          <span className={`px-1.5 py-0.5 rounded-full font-semibold text-[10px] flex items-center ${player.position === 'defesa' ? 'bg-yellow-100 text-yellow-800' : player.position === 'meio' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                            {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                          </span>
                          <button
                            className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
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
              <div className="text-gray-500 text-center py-8">Nenhum jogador confirmado ainda.</div>
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
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Partidas</h2>
              {game.matches && game.matches.length > 0 ? (
              <ul className="space-y-4">
                {game.matches.map((match, idx) => {
                  const isExpanded = expandedMatchId === match.id;
                  // Função para contar gols e assistências de um jogador
                  const getPlayerStats = (playerId: string) => {
                    const goals = match.goals?.filter(g => g.scorerId === playerId).length || 0;
                    const assists = match.goals?.filter(g => g.assisterId === playerId).length || 0;
                    return { goals, assists };
                  };
                  
                  // Métricas por time: score, média de idade e média de habilidade
                  const team0 = match.teams[0];
                  const team1 = match.teams[1];
                  const team0Players = (team0?.players || []);
                  const team1Players = (team1?.players || []);
                  const average = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                  const team0AvgAge = average(team0Players.map(p => getAgeValue(p.ageGroup)));
                  const team0AvgSkill = average(team0Players.map(p => p.skillLevel));
                  const team1AvgAge = average(team1Players.map(p => getAgeValue(p.ageGroup)));
                  const team1AvgSkill = average(team1Players.map(p => p.skillLevel));
                  const team0Score = calculateTeamScore(team0Players);
                  const team1Score = calculateTeamScore(team1Players);
                  const { players: waitingList, playersIn, playersOut } = getPlayersNotInNextMatch(match);
                  return (
                    <li key={match.id} className="bg-gray-50 rounded-xl p-4 shadow-sm relative">
                      {/* Cabeçalho fixo da partida */}
                      <div className="flex flex-col gap-2">
                        {/* Primeira linha: Status e Ver Detalhes */}
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${match.status === 'finished' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {match.status === 'finished' ? 'Finalizada' : 'Em andamento'}
                            </span>
                        </div>
                        {!isExpanded && (                         
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">{match.teams[0]?.name || 'Time A'}</span>
                            <span className="text-lg font-bold text-blue-600">{match.teams[0]?.score ?? 0}</span>
                            <span className="text-gray-400">x</span>
                            <span className="text-lg font-bold text-orange-500">{match.teams[1]?.score ?? 0}</span>
                            <span className="font-semibold text-gray-700">{match.teams[1]?.name || 'Time B'}</span>
                          </div>
                        )}
                          <button
                              className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
                              onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                            >
                              {isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                            </button>
                        </div>

                        {/* Botões de ação (só aparecem quando expandido) */}
                        {isExpanded && (
                          <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 rounded-full hover:bg-gray-200 transition"
                            title="Ver lista de espera"
                            onClick={() => setWaitingListMatchId(match.id)}
                          >
                            <Users className="w-5 h-5 text-blue-500" />
                          </button>
                          <button
                            className="p-2 rounded-full hover:bg-red-100 transition"
                            title="Excluir partida"
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.')) {
                                deleteMatch(match.id);
                              }
                            }}
                            style={{ display: (user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && game.status !== 'finished' ? 'block' : 'none' }}
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                              </div>
                            )}
                              </div>

                      {/* Conteúdo expandido */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mt-4"
                          >
                            <div className="mt-4">
                              <MatchScore match={match} />
                            </div>
                            {/* Campinho, etc... */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <TacticalView
                                team={match.teams[0]}
                                formation={match.teams[0].formation?.tactical || '4-3-2'}
                                onFormationChange={(newFormation) => handleFormationChange(match.id, match.teams[0].id, newFormation)}
                                goals={match.goals}
                                teamColor="#3b82f6"
                                isHomeTeam={false}
                              />
                              <TacticalView
                                team={match.teams[1]}
                                formation={match.teams[1].formation?.tactical || '4-3-2'}
                                onFormationChange={(newFormation) => handleFormationChange(match.id, match.teams[1].id, newFormation)}
                                    goals={match.goals}
                                teamColor="#f59e42"
                                isHomeTeam={false}
                              />
                            </div>
                            {/* MatchTimer apenas para partidas em progresso */}
                            {match.status === 'in_progress' && (
                              <MatchTimer
                                teamA={match.teams[0]}
                                teamB={match.teams[1]}
                                isFirstMatch={idx === 0}
                                onGoalScored={(teamId, scorerId, assisterId) => handleGoalScored(match.id, teamId, scorerId, assisterId)}
                                match={match}
                                onTimerUpdate={createTimerUpdateHandler(match.id)}
                              />
                            )}

                            {/* Lista de jogadores dos times - visível em partidas em progresso e finalizadas */}
                            {(match.status === 'in_progress' || match.status === 'finished') && (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">Jogadores {match.teams[0]?.name}</h3>
                                    <div className="mb-2 flex flex-wrap gap-2 text-xs">
                                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">Score: {team0Score.toFixed(1)}</span>
                                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">Média idade: {team0AvgAge.toFixed(1)}</span>
                                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">Média habilidade: {team0AvgSkill.toFixed(1)}</span>
                                    </div>
                                    <ul className="space-y-2">
                                      {[...(match.teams[0]?.players || [])]
                                        .sort((a, b) => {
                                          const posOrder = { defesa: 0, meio: 1, ataque: 2 };
                                          return posOrder[a.position] - posOrder[b.position];
                                        })
                                        .map((player) => {
                                          const stats = getPlayerStats(player.id);
                                          return (
                                            <li key={player.id} className="flex items-center gap-2 text-xs bg-white rounded-lg px-2 py-1.5 shadow-sm">
                                              {/* Avatar */}
                                              <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white"
                                                   style={{ backgroundColor: '#3b82f6' }}>
                                                {player.name.charAt(0).toUpperCase()}
                                              </div>
                                              {/* Nome + posição */}
                                              <span className={`px-1 py-0.5 rounded text-[10px] font-bold ml-1 ${player.position === 'defesa' ? 'bg-yellow-100 text-yellow-800' : player.position === 'meio' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                                {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                                              </span>
                                              <span className="font-medium truncate max-w-[200px]">{player.name}</span>
                                              {/* Gols */}
                                              {stats.goals > 0 && (
                                                <span className="flex items-center gap-1 text-blue-600 ml-1">
                                                  <Target className="w-3 h-3" /> {stats.goals}
                                                </span>
                                              )}
                                              {/* Assistências */}
                                              {stats.assists > 0 && (
                                                <span className="flex items-center gap-1 text-green-600 ml-1">
                                                  <Footprints className="w-3 h-3" /> {stats.assists}
                                                </span>
                                              )}
                                              {match.status === 'in_progress' && (user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
                                                <button
                                                  className="p-1.5 rounded-full hover:bg-blue-100 transition ml-auto"
                                                  title="Trocar jogador"
                                                  onClick={() => {
                                                    setIsPlayerSwapOpen(true);
                                                    setSelectedPlayer(player);
                                                    setSelectedTeam(match.teams[0]);
                                                    setSelectedMatch(match);
                                                  }}
                                                >
                                                  <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                                                </button>
                                              )}
                                            </li>
                                          );
                                        })}
                                    </ul>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">Jogadores {match.teams[1]?.name}</h3>
                                    <div className="mb-2 flex flex-wrap gap-2 text-xs">
                                      <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700">Score: {team1Score.toFixed(1)}</span>
                                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">Média idade: {team1AvgAge.toFixed(1)}</span>
                                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">Média habilidade: {team1AvgSkill.toFixed(1)}</span>
                                    </div>
                                    <ul className="space-y-2">
                                      {[...(match.teams[1]?.players || [])]
                                        .sort((a, b) => {
                                          const posOrder = { defesa: 0, meio: 1, ataque: 2 };
                                          return posOrder[a.position] - posOrder[b.position];
                                        })
                                        .map((player) => {
                                          const stats = getPlayerStats(player.id);
                                          return (
                                            <li key={player.id} className="flex items-center gap-2 text-xs bg-white rounded-lg px-2 py-1.5 shadow-sm">
                                              {/* Avatar */}
                                              <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white"
                                                   style={{ backgroundColor: '#f59e42' }}>
                                                {player.name.charAt(0).toUpperCase()}
                                              </div>
                                              {/* Nome + posição */}
                                              <span className={`px-1 py-0.5 rounded text-[10px] font-bold ml-1 ${player.position === 'defesa' ? 'bg-yellow-100 text-yellow-800' : player.position === 'meio' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                                {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                                              </span>
                                              <span className="font-medium truncate max-w-[200px]">{player.name}</span>
                                              {/* Gols */}
                                              {stats.goals > 0 && (
                                                <span className="flex items-center gap-1 text-blue-600 ml-1">
                                                  <Target className="w-3 h-3" /> {stats.goals}
                                                </span>
                                              )}
                                              {/* Assistências */}
                                              {stats.assists > 0 && (
                                                <span className="flex items-center gap-1 text-green-600 ml-1">
                                                  <Footprints className="w-3 h-3" /> {stats.assists}
                                                </span>
                                              )}
                                              {match.status === 'in_progress' && (user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
                                                <button
                                                  className="p-1.5 rounded-full hover:bg-blue-100 transition ml-auto"
                                                  title="Trocar jogador"
                                                  onClick={() => {
                                                    setIsPlayerSwapOpen(true);
                                                    setSelectedPlayer(player);
                                                    setSelectedTeam(match.teams[1]);
                                                    setSelectedMatch(match);
                                                  }}
                                                >
                                                  <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                                                </button>
                                              )}
                                            </li>
                                          );
                                        })}
                                    </ul>
                                  </div>
                                </div>

                                {/* Botões de finalização - apenas para partidas em andamento */}
                                {match.status === 'in_progress' && (user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
                                  <div className="flex flex-col md:flex-row gap-2 mt-4">
                                    <button
                                      className="flex-1 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                                      onClick={() => finishMatch(match.id, match.teams[0].id)}
                                    >
                                      {match.teams[0]?.name} Venceu
                                    </button>
                                    <button
                                      className="flex-1 py-2 rounded bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
                                      onClick={() => finishMatch(match.id, match.teams[1].id)}
                                    >
                                      {match.teams[1]?.name} Venceu
                                    </button>
                                  </div>
                                )}
                  </>
                )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-gray-500 text-center py-8">Nenhuma partida registrada ainda.</div>
            )}
            {/* Botão Gerar Nova Partida */}
            {selectedTab === 'partidas' && game.status !== 'finished' && (user?.role === 'admin' || user?.playerInfo?.paymentType === 'mensalista') && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={generateTeams}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  disabled={isGeneratingTeams || game.players.length < 4 || (game.matches && game.matches.length > 0 && game.matches[game.matches.length - 1].status !== 'finished')}
                >
                  {isGeneratingTeams && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  )}
                  Gerar Nova Partida
                </button>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'analises' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Análises e Estatísticas</h2>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full h-full md:h-auto md:max-h-[90vh] md:max-w-md relative animate-fadeIn flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg text-gray-800">Selecionar Jogador</h2>
              <button
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
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
            <div className="p-4 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredPlayers.length > 0 ? (
                <>
                  <div className="text-sm text-gray-500 mb-2">
                    {filteredPlayers.length} jogador{filteredPlayers.length !== 1 ? 'es' : ''} disponível{filteredPlayers.length !== 1 ? 'is' : ''}
                  </div>
                  <ul className="space-y-2">
                    {filteredPlayers.map((user) => (
                      <li key={user.id}>
                        <button
                          onClick={() => handleAddExistingPlayer(user)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                            {user.playerInfo?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{user.playerInfo?.name}</div>
                            <div className="text-sm text-gray-500 truncate">{user.email}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.playerInfo?.position === 'defesa' ? 'bg-yellow-100 text-yellow-800' :
                              user.playerInfo?.position === 'meio' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {user.playerInfo?.position?.toUpperCase() || 'N/A'}
                            </span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < (user.playerInfo?.skillLevel || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
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
                <div className="text-center py-8 text-gray-500">
                  {searchTerm 
                    ? 'Nenhum jogador encontrado com esse termo.' 
                    : 'Nenhum jogador disponível para adicionar.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal da Lista de Espera */}
      {waitingListMatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] mx-4 relative animate-fade-in flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg text-gray-800">Lista de Espera</h2>
              <button
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
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
                    return <div className="text-gray-400 text-sm">Nenhum jogador na lista de espera.</div>;
                  }

                  return (
                    <div className="space-y-2">
                      {waitingPlayers.map((player) => (
                        <div key={player.id} className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm mr-3">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{player.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                player.position === 'defesa' ? 'bg-yellow-100 text-yellow-800' :
                                player.position === 'meio' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {player.position === 'defesa' ? 'DEF' : player.position === 'meio' ? 'MEI' : 'ATA'}
                              </span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-3 h-3 ${i < player.skillLevel ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
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
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors ml-2"
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
                          <div className="text-gray-400 text-sm">Nenhum jogador saiu.</div>
                        ) : (
                          playersOut.map((player) => (
                            <div key={player.id} className="flex items-center p-2 rounded-lg bg-red-50">
                              <User className="w-5 h-5 text-red-400 mr-2" />
                              <span className="flex-1 text-left">{player.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                player.position === 'defesa' ? 'bg-yellow-100 text-yellow-800' :
                                player.position === 'meio' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
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
                          <div className="text-gray-400 text-sm">Nenhum jogador entrou.</div>
                        ) : (
                          playersIn.map((player) => (
                            <div key={player.id} className="flex items-center p-2 rounded-lg bg-green-50">
                              <User className="w-5 h-5 text-green-400 mr-2" />
                              <span className="flex-1 text-left">{player.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                player.position === 'defesa' ? 'bg-yellow-100 text-yellow-800' :
                                player.position === 'meio' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
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
      )}

      {/* Modal de Pagamento do Diarista */}
      {showDiaristaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in">
            <button
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-gray-700"
              onClick={() => setShowDiaristaModal(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">Confirmar Pagamento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Diarista</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={selectedDiarista?.name || ''}
                  readOnly
                  placeholder="Nome do diarista"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor do Pagamento</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full border rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={() => {              
                  setDiaristaFree(true);                  
                }}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                type="button"
                disabled={!selectedDiarista}
              >
                Gratis
              </button>
              <button
                onClick={confirmDiaristaPayment}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
