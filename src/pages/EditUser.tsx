import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types/index';
import { StarRating } from '../components/StarRating';
import { SegmentedControl } from '../components/SegmentedControl';
import { FaChevronLeft, FaUser, FaEnvelope, FaFutbol, FaStar, FaUserEdit, FaUserShield } from 'react-icons/fa';

type Position = 'defesa' | 'meio' | 'ataque';
type AgeGroup = '15-20' | '21-30' | '31-40' | '41-50' | '+50';
type SkillLevel = 1 | 2 | 3 | 4 | 5;
type Role = 'admin' | 'player';
type PaymentType = 'mensalista' | 'diarista';

// Mapeamento para exibição visual dos papéis
const roleDisplayMap = {
  admin: 'Administrador',
  player: 'Jogador'
} as const;

interface FormErrors {
  username?: string;
  email?: string;
  'playerInfo.name'?: string;
}

// Atualizar tipagem de playerInfo para incluir paymentType
interface PlayerInfo {
  name: string;
  position: Position;
  ageGroup: AgeGroup;
  skillLevel: SkillLevel;
  paymentType: PaymentType;
}

export function EditUser() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [role, setRole] = useState<Role>('player');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo>({
    name: '',
    position: 'defesa',
    ageGroup: '21-30',
    skillLevel: 3,
    paymentType: 'mensalista',
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          setUsername(userData.username);
          setEmail(userData.email || '');
          setPhotoURL(userData.photoURL || '');
          setRole(userData.role || 'player');
          setPlayerInfo({
            name: userData.playerInfo?.name || '',
            position: userData.playerInfo?.position || 'defesa',
            ageGroup: userData.playerInfo?.ageGroup || '21-30',
            skillLevel: userData.playerInfo?.skillLevel || 3,
            paymentType: userData.playerInfo?.paymentType || 'mensalista',
          });
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };

    fetchUser();
  }, [userId]);

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

    // Verificar permissões
    if (currentUser?.role !== 'admin' && currentUser?.username !== user.username) {
      return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', userId!);
      await updateDoc(userRef, {
        username,
        email,
        photoURL,
        role: currentUser?.role === 'admin' ? role : user.role,
        playerInfo,
        updatedAt: new Date().toISOString(),
      });

      navigate(-1);
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="pelada-page flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-team-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pelada-page w-full flex items-start justify-center px-4 py-10">
      <div className="glass-card relative z-10 w-full max-w-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-full text-ink-muted hover:bg-surface-hover transition-colors"
        >
          <FaChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-full avatar-grad flex items-center justify-center text-white font-heading font-bold text-lg shadow-[0_4px_12px_rgba(0,0,0,0.4)] shrink-0">
            {(playerInfo.name || username).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold tracking-wide text-heading truncate">Editar Usuário</h1>
            <p className="text-sm text-ink-muted truncate">{playerInfo.name || username}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Campo de papel (role) visível apenas para administradores */}
          {currentUser?.role === 'admin' && (
            <div className="space-y-2">
              <label className="field-label flex items-center gap-2">
                <FaUserShield className="w-4 h-4 text-team-blue" />
                Papel do Usuário
              </label>
              <SegmentedControl
                value={role}
                onChange={(v) => setRole(v as Role)}
                options={[
                  { value: 'player', label: 'Jogador' },
                  { value: 'admin', label: 'Administrador' },
                ]}
              />
              <p className="text-sm text-ink-muted mt-1">
                Administradores têm acesso a todas as funcionalidades do sistema
              </p>
            </div>
          )}
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

          <div className="space-y-2">
            <label className="field-label">Tipo de Pagamento</label>
            <SegmentedControl
              value={playerInfo.paymentType}
              onChange={(v) => setPlayerInfo(prev => ({ ...prev, paymentType: v as PaymentType }))}
              options={[
                { value: 'mensalista', label: 'Mensalista' },
                { value: 'diarista', label: 'Diarista' },
              ]}
            />
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