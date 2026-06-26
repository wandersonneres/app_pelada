import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StarRating } from '../components/StarRating';
import { SegmentedControl } from '../components/SegmentedControl';
import { FaChevronLeft, FaUser, FaEnvelope, FaFutbol, FaStar, FaUserEdit } from 'react-icons/fa';

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

  return (
    <div className="pelada-page w-full flex items-start justify-center px-4 py-10">
      <div className="glass-card relative z-10 w-full max-w-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-full text-ink-muted hover:bg-surface-hover transition-colors"
        >
          <FaChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-2xl font-extrabold tracking-wide text-heading text-center flex-1">Meu Perfil</h1>
        <div className="w-9" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        {/* <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {implementar upload de foto}}
            >
              <FaCamera className="w-6 h-6 text-white" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Clique para alterar a foto</p>
        </div> */}

        {/* Informações Básicas */}
        <div className="space-y-4">
          <h2 className="section-title">
            <FaUser className="w-4 h-4 text-team-blue" />
            Informações Básicas
          </h2>

          <div className="space-y-2">
            <label htmlFor="username" className="field-label">
              Nome de Usuário
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite o nome de usuário"
                className="field-input pl-10"
              />
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim w-4 h-4" />
            </div>
            {errors.username && <p className="text-danger-soft text-sm mt-1">{errors.username}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o email"
                className="field-input pl-10"
              />
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim w-4 h-4" />
            </div>
            {errors.email && <p className="text-danger-soft text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Informações do Jogador */}
        <div className="space-y-4">
          <h2 className="section-title">
            <FaFutbol className="w-4 h-4 text-team-blue" />
            Informações do Jogador
          </h2>

          <div className="space-y-2">
            <label htmlFor="playerInfo.name" className="field-label">
              Nome Completo
            </label>
            <input
              type="text"
              id="playerInfo.name"
              value={playerInfo.name}
              onChange={(e) => setPlayerInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome completo"
              className="field-input"
            />
            {errors['playerInfo.name'] && <p className="text-danger-soft text-sm mt-1">{errors['playerInfo.name']}</p>}
          </div>

          <div className="space-y-2">
            <label className="field-label">Posição</label>
            <SegmentedControl
              value={playerInfo.position}
              onChange={(v) => setPlayerInfo(prev => ({ ...prev, position: v as Position }))}
              options={[
                { value: 'defesa', label: 'Defesa' },
                { value: 'meio', label: 'Meio Campo' },
                { value: 'ataque', label: 'Ataque' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="field-label">Faixa Etária</label>
            <SegmentedControl
              wrap
              value={playerInfo.ageGroup}
              onChange={(v) => setPlayerInfo(prev => ({ ...prev, ageGroup: v as AgeGroup }))}
              options={[
                { value: '15-20', label: '15-20' },
                { value: '21-30', label: '21-30' },
                { value: '31-40', label: '31-40' },
                { value: '41-50', label: '41-50' },
                { value: '+50', label: '+50' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="field-label flex items-center gap-2">
              <FaStar className="w-4 h-4 text-warning" />
              Nível de Habilidade
            </label>
            <div className="p-3 bg-surface border border-divider rounded-lg">
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
          className="w-full bg-team-blue hover:brightness-110 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_8px_20px_-8px_rgba(59,130,246,0.7)] disabled:opacity-60 flex items-center justify-center gap-2"
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