import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types/index';
import { StarRating } from '../components/StarRating';
import { Spinner } from '../components/Loader';
import { ArrowLeft, User as UserIcon, Mail, Shield, Save } from 'lucide-react';

type Position = 'defesa' | 'meio' | 'ataque';
type AgeGroup = '15-20' | '21-30' | '31-40' | '41-50' | '+50';
type SkillLevel = 1 | 2 | 3 | 4 | 5;
type Role = 'admin' | 'player';
type PaymentType = 'mensalista' | 'diarista';

interface FormErrors {
  username?: string;
  email?: string;
  'playerInfo.name'?: string;
}

interface PlayerInfo {
  name: string;
  position: Position;
  ageGroup: AgeGroup;
  skillLevel: SkillLevel;
  paymentType: PaymentType;
}

const POSITION_HEX: Record<Position, string> = { defesa: '#d99a1a', meio: '#0d7a72', ataque: '#c2560f' };
const POSITIONS: { key: Position; label: string }[] = [
  { key: 'defesa', label: 'Defesa' },
  { key: 'meio', label: 'Meio' },
  { key: 'ataque', label: 'Ataque' },
];
const AGE_GROUPS: AgeGroup[] = ['15-20', '21-30', '31-40', '41-50', '+50'];

const pillBase = 'py-2 rounded-lg text-[13px] font-semibold transition-colors';
const pillInactive = 'bg-line-soft text-ink-medium hover:bg-line';

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
    if (!username) newErrors.username = 'Nome de usuário é obrigatório';
    if (!email) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido';
    if (!playerInfo.name) newErrors['playerInfo.name'] = 'Nome do jogador é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;
    if (currentUser?.role !== 'admin' && currentUser?.username !== user.username) return;

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

  const inputClass =
    'w-full border border-line rounded-lg px-3 py-2.5 text-ink bg-surface placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine transition-colors';
  const labelClass = 'block text-[13px] font-medium text-ink-medium mb-1.5';
  const sectionLabel = 'text-[12px] font-semibold uppercase tracking-wide text-ink-soft flex items-center gap-1.5';

  if (!user) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8">
        <div className="bg-surface border border-line rounded-2xl shadow-sm p-6 sm:p-8 flex items-center justify-center h-40">
          <Spinner className="w-8 h-8" />
        </div>
      </div>
    );
  }

  const initials = username ? username.slice(0, 2).toUpperCase() : '??';

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-wine to-[#9e2a3d] px-6 pt-5 pb-6 text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-4 top-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-20 h-20 mx-auto rounded-full bg-white/15 ring-4 ring-white/20 text-white font-heading font-extrabold text-2xl flex items-center justify-center overflow-hidden">
            {photoURL ? <img src={photoURL} alt={username} className="w-full h-full object-cover" /> : initials}
          </div>
          <div className="mt-3 font-heading font-bold text-lg text-white">{username || 'Editar usuário'}</div>
          <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-white">
            <Shield className="w-3 h-3" /> {role === 'admin' ? 'Administrador' : 'Jogador'}
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h2 className={sectionLabel}><UserIcon className="w-3.5 h-3.5 text-wine" /> Informações básicas</h2>

            <div>
              <label htmlFor="username" className={labelClass}>Nome de usuário</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-icon w-4 h-4" />
                <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nome de usuário" className={`${inputClass} pl-9`} />
              </div>
              {errors.username && <p className="text-state-warning text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-icon w-4 h-4" />
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={`${inputClass} pl-9`} />
              </div>
              {errors.email && <p className="text-state-warning text-xs mt-1">{errors.email}</p>}
            </div>

            {currentUser?.role === 'admin' && (
              <div>
                <label className={labelClass}>Papel do usuário</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['player', 'admin'] as Role[]).map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)} className={`${pillBase} ${role === r ? 'bg-wine text-white' : pillInactive}`}>
                      {r === 'admin' ? 'Administrador' : 'Jogador'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-ink-soft mt-1.5">Administradores têm acesso a todas as funcionalidades.</p>
              </div>
            )}
          </div>

          {/* Informações do Jogador */}
          <div className="space-y-4 border-t border-line-soft pt-5">
            <h2 className={sectionLabel}>⚽ Informações do jogador</h2>

            <div>
              <label htmlFor="playerName" className={labelClass}>Nome completo</label>
              <input id="playerName" type="text" value={playerInfo.name} onChange={e => setPlayerInfo(p => ({ ...p, name: e.target.value }))} placeholder="Nome completo" className={inputClass} />
              {errors['playerInfo.name'] && <p className="text-state-warning text-xs mt-1">{errors['playerInfo.name']}</p>}
            </div>

            <div>
              <label className={labelClass}>Posição</label>
              <div className="grid grid-cols-3 gap-2">
                {POSITIONS.map(pos => (
                  <button
                    key={pos.key}
                    type="button"
                    onClick={() => setPlayerInfo(p => ({ ...p, position: pos.key }))}
                    className={`${pillBase} ${playerInfo.position === pos.key ? 'text-white' : pillInactive}`}
                    style={playerInfo.position === pos.key ? { background: POSITION_HEX[pos.key] } : undefined}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Faixa etária</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {AGE_GROUPS.map(age => (
                  <button key={age} type="button" onClick={() => setPlayerInfo(p => ({ ...p, ageGroup: age }))} className={`${pillBase} ${playerInfo.ageGroup === age ? 'bg-wine text-white' : pillInactive}`}>
                    {age}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Nível de habilidade</label>
              <div className="p-3 bg-paper border border-line rounded-xl">
                <StarRating value={playerInfo.skillLevel} onChange={value => setPlayerInfo(p => ({ ...p, skillLevel: value as SkillLevel }))} size="lg" showLabel />
              </div>
            </div>

            <div>
              <label className={labelClass}>Tipo de pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                {(['mensalista', 'diarista'] as PaymentType[]).map(t => (
                  <button key={t} type="button" onClick={() => setPlayerInfo(p => ({ ...p, paymentType: t }))} className={`${pillBase} ${playerInfo.paymentType === t ? 'bg-wine text-white' : pillInactive}`}>
                    {t === 'mensalista' ? 'Mensalista' : 'Diarista'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 border border-[#ded8c9] bg-surface text-ink-medium text-sm font-semibold rounded-xl hover:bg-paper transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 bg-wine hover:bg-wine-dark text-white font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60">
              {isLoading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Salvando…</> : <><Save className="w-4 h-4" /> Salvar alterações</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
