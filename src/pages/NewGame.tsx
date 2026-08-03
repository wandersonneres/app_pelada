import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ChevronLeft, MapPin, Calendar, Users } from 'lucide-react';
import { Spinner } from '../components/Loader';

export function NewGame() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [observations, setObservations] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const date = new Date();
      date.setHours(0, 0, 0, 0);

      const gameData = {
        date,
        location: 'Vargem',
        maxPlayers: 18,
        status: 'waiting',
        players: [],
        matches: [],
        observations: observations.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'games'), gameData);

      navigate(`/game/${docRef.id}`);
    } catch (error) {
      console.error('Erro ao criar pelada:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <div className="w-full py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex-none flex items-center justify-center rounded-full border border-line bg-surface text-ink-icon hover:text-ink hover:bg-line-soft transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.2} />
          </button>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink leading-tight">Nova Pelada</h1>
            <p className="text-sm text-ink-soft">Confira os detalhes e crie a partida</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Resumo dos padrões */}
          <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-4">
              Detalhes da pelada
            </h2>''
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-paper/60 border border-line-soft px-3.5 py-3">
                <span className="w-9 h-9 flex-none rounded-lg bg-wine-tint text-wine flex items-center justify-center">
                  <MapPin className="w-[18px] h-[18px]" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] text-ink-soft font-semibold uppercase tracking-wide">Local</div>
                  <div className="text-sm font-semibold text-ink truncate">Vargem</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-paper/60 border border-line-soft px-3.5 py-3">
                <span className="w-9 h-9 flex-none rounded-lg bg-wine-tint text-wine flex items-center justify-center">
                  <Calendar className="w-[18px] h-[18px]" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] text-ink-soft font-semibold uppercase tracking-wide">Data</div>
                  <div className="text-sm font-semibold text-ink capitalize truncate">{todayLabel}</div>
                </div>
              </div>

              {/* <div className="flex items-center gap-3 rounded-xl bg-paper/60 border border-line-soft px-3.5 py-3">
                <span className="w-9 h-9 flex-none rounded-lg bg-wine-tint text-wine flex items-center justify-center">
                  <Users className="w-[18px] h-[18px]" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] text-ink-soft font-semibold uppercase tracking-wide">Vagas</div>
                  <div className="text-sm font-semibold text-ink truncate">18 jogadores</div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Observações */}
          <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6">
            <label
              htmlFor="observations"
              className="block text-sm font-medium text-ink-medium mb-2"
            >
              Observações
            </label>
            <textarea
              id="observations"
              rows={4}
              autoCapitalize="sentences"
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-icon resize-none focus:outline-none focus:ring-2 focus:ring-wine focus:border-wine transition"
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder="Adicione observações sobre a pelada (opcional)"
            />
            <p className="text-xs text-ink-soft mt-2">Opcional — visível para todos os jogadores.</p>
          </div>

          {/* Ações */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isLoading}
              className="h-11 px-5 rounded-lg border border-[#ded8c9] bg-surface text-ink-medium font-semibold text-sm hover:bg-paper transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 px-6 rounded-lg bg-wine hover:bg-wine-dark active:bg-wine-dark text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Criando...
                </>
              ) : (
                'Criar Pelada'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
