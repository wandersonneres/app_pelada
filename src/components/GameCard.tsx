import { Game, convertTimestampToDate } from '../types';
import { Timestamp } from 'firebase/firestore';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  game: Game;
  onDelete?: (gameId: string) => void;
}

export function GameCard({ game, onDelete }: GameCardProps) {
  const navigate = useNavigate();

  const formatDate = (date: Date | Timestamp) => {
    return convertTimestampToDate(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md cursor-pointer"
      onClick={() => navigate(`/game/${game.id}`)}
    >
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {game.location}
          </h2>
          <span
            className={`px-2 py-1 border border-${getStatusColor(game.status)} rounded-full`}
          >
            {getStatusText(game.status)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {formatDate(game.date)}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {game.players.length} / {game.maxPlayers} jogadores
          </span>
        </div>
      </div>

      {onDelete && (
        <div className="flex justify-end p-2 border-t border-gray-100">
          <button
            className="text-red-500 bg-transparent border border-red-500 rounded-md text-sm px-2 py-1"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(game.id);
            }}
          >
            Excluir pelada
          </button>
        </div>
      )}
    </div>
  );
} 