import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StarRating } from '../components/StarRating';
import { FaChevronLeft, FaUser, FaEnvelope, FaFutbol, FaStar, FaUserEdit, FaCamera } from 'react-icons/fa';

type Position = 'defesa' | 'meio' | 'ataque';
type AgeGroup = '15-20' | '21-30' | '31-40' | '41-50' | '+50';
type SkillLevel = 1 | 2 | 3 | 4 | 5;

interface FormErrors {
  username?: string;
  email?: string;
  'playerInfo.name'?: string;
}

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [playerInfo, setPlayerInfo] = useState({
    name: user?.playerInfo?.name || '',
    position: user?.playerInfo?.position || 'defesa' as Position,
    ageGroup: user?.playerInfo?.ageGroup || '21-30' as AgeGroup,
    skillLevel: user?.playerInfo?.skillLevel || 3 as SkillLevel,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!username) {
      newErrors.username = 'Nome de usuário é obrigatório';
    }

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!playerInfo.name) {
      newErrors['playerInfo.name'] = 'Nome do jogador é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        username,
        email,
        photoURL,
        playerInfo,
        updatedAt: new Date().toISOString(),
      });

      // Exemplo: <div className="bg-blue-500 text-white p-4 rounded">...</div>
    } catch (error: any) {
      // Exemplo: <div className="bg-red-500 text-white p-4 rounded">...</div>
    } finally {
      setIsLoading(false);
    }
  };

  const positionMeta: Record<Position, { label: string; color: string }> = {
    defesa: { label: 'Defesa', color: '#d99a1a' },
    meio: { label: 'Meio Campo', color: '#0d7a72' },
    ataque: { label: 'Ataque', color: '#c2560f' },
  };

  const avatarInitial = (playerInfo.name || username || 'P').trim().charAt(0).toUpperCase();

  return (
    <div className="w-full max-w-lg px-4 py-8 sm:py-12">
      <div className="bg-surface border border-line rounded-2xl shadow-sm overflow-hidden">
        {/* Cabeçalho com avatar */}
        <div className="relative px-6 pt-6 pb-8 sm:px-8">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-line-soft transition-colors"
              aria-label="Voltar"
            >
              <FaChevronLeft className="w-5 h-5 text-ink-icon" />
            </button>
            <h1 className="font-heading font-bold text-lg text-ink-medium tracking-wide">Meu Perfil</h1>
            <div className="w-8" />
          </div>

          <div className="mt-5 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-wine to-[#9e2a3d] text-white flex items-center justify-center overflow-hidden shadow-md ring-4 ring-surface">
              {photoURL ? (
                <img src={photoURL} alt={username} className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading font-extrabold text-4xl">{avatarInitial}</span>
              )}
            </div>
            <h2 className="mt-4 font-heading font-extrabold text-2xl text-ink leading-tight">
              {playerInfo.name || username || 'Jogador'}
            </h2>
            {email && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                <FaEnvelope className="w-3.5 h-3.5" />
                {email}
              </p>
            )}
            <span
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.05em] px-3 py-1 rounded-md"
              style={{ color: '#5c5647', background: '#ece5d6' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: positionMeta[playerInfo.position].color }} />
              {positionMeta[playerInfo.position].label}
            </span>
          </div>
        </div>

        <div className="border-t border-line-soft" />

        <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 space-y-7">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-ink-soft flex items-center gap-2">
              <FaUser className="w-3.5 h-3.5 text-wine" />
              Informações Básicas
            </h3>

            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-medium text-ink-medium">
                Nome de Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite o nome de usuário"
                  className="w-full pl-10 pr-4 py-2.5 border border-line rounded-lg bg-surface text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-wine focus:border-transparent transition-all"
                />
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-icon w-4 h-4" />
              </div>
              {errors.username && <p className="text-state-warning text-xs mt-1">{errors.username}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-ink-medium">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite o email"
                  className="w-full pl-10 pr-4 py-2.5 border border-line rounded-lg bg-surface text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-wine focus:border-transparent transition-all"
                />
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-icon w-4 h-4" />
              </div>
              {errors.email && <p className="text-state-warning text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Informações do Jogador */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-ink-soft flex items-center gap-2">
              <FaFutbol className="w-3.5 h-3.5 text-wine" />
              Informações do Jogador
            </h3>

            <div className="space-y-1.5">
              <label htmlFor="playerInfo.name" className="block text-sm font-medium text-ink-medium">
                Nome Completo
              </label>
              <input
                type="text"
                id="playerInfo.name"
                value={playerInfo.name}
                onChange={(e) => setPlayerInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome completo"
                className="w-full px-4 py-2.5 border border-line rounded-lg bg-surface text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-wine focus:border-transparent transition-all"
              />
              {errors['playerInfo.name'] && <p className="text-state-warning text-xs mt-1">{errors['playerInfo.name']}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="playerInfo.position" className="block text-sm font-medium text-ink-medium">
                  Posição
                </label>
                <select
                  id="playerInfo.position"
                  value={playerInfo.position}
                  onChange={(e) => setPlayerInfo(prev => ({ ...prev, position: e.target.value as Position }))}
                  className="w-full px-4 py-2.5 border border-line rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-wine focus:border-transparent transition-all"
                >
                  <option value="defesa">Defesa</option>
                  <option value="meio">Meio Campo</option>
                  <option value="ataque">Ataque</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="playerInfo.ageGroup" className="block text-sm font-medium text-ink-medium">
                  Faixa Etária
                </label>
                <select
                  id="playerInfo.ageGroup"
                  value={playerInfo.ageGroup}
                  onChange={(e) => setPlayerInfo(prev => ({ ...prev, ageGroup: e.target.value as AgeGroup }))}
                  className="w-full px-4 py-2.5 border border-line rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-wine focus:border-transparent transition-all"
                >
                  <option value="15-20">15-20 anos</option>
                  <option value="21-30">21-30 anos</option>
                  <option value="31-40">31-40 anos</option>
                  <option value="41-50">41-50 anos</option>
                  <option value="+50">+50 anos</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink-medium flex items-center gap-2">
                <FaStar className="w-4 h-4 text-position-def" />
                Nível de Habilidade
              </label>
              <div className="py-3 bg-paper border border-line rounded-lg">
                <StarRating
                  value={playerInfo.skillLevel}
                  onChange={(value) => setPlayerInfo(prev => ({ ...prev, skillLevel: value as SkillLevel }))}
                  size="lg"
                  showLabel
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-wine hover:bg-wine-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <FaUserEdit className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}