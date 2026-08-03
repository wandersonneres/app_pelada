import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StarRating } from '../components/StarRating';
import { ArrowLeft, User as UserIcon, Mail, Lock, UserPlus } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../config/firebase';
import { emailInputProps, personNameProps, usernameInputProps } from '../lib/inputProps';

type Position = 'defesa' | 'meio' | 'ataque';
type AgeGroup = '15-20' | '21-30' | '31-40' | '41-50' | '+50';
type SkillLevel = 1 | 2 | 3 | 4 | 5;
type Role = 'admin' | 'player';
type PaymentType = 'mensalista' | 'diarista';

interface PlayerInfo {
  name: string;
  position: Position;
  ageGroup: AgeGroup;
  skillLevel: SkillLevel;
  paymentType: PaymentType;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  'playerInfo.name'?: string;
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

export function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('player');
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo>({
    name: '',
    position: 'defesa',
    ageGroup: '21-30',
    skillLevel: 3,
    paymentType: 'mensalista',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!username) newErrors.username = 'Nome de usuário é obrigatório';
    if (!email) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido';
    if (!password) newErrors.password = 'Senha é obrigatória';
    else if (password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    if (!playerInfo.name) newErrors['playerInfo.name'] = 'Nome do jogador é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateForm()) return;

    setIsLoading(true);
    let secondaryApp;
    try {
      // Inicializa um app secundário para não deslogar o admin
      secondaryApp = initializeApp(firebaseConfig, 'Secondary');
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = userCredential.user.uid;

      const usersRef = collection(db, 'users');
      await setDoc(doc(usersRef, uid), {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        role,
        playerInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      navigate('/players');
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      let errorMessage = 'Erro ao criar usuário';
      if (error.code === 'permission-denied') {
        errorMessage = 'Você não tem permissão para cadastrar usuários';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso.';
      }
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
      if (secondaryApp) {
        try { await secondaryApp.delete(); } catch {}
      }
    }
  };

  const inputClass =
    'w-full border border-line rounded-lg px-3 py-2.5 text-ink bg-surface placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine transition-colors';
  const labelClass = 'block text-[13px] font-medium text-ink-medium mb-1.5';
  const sectionLabel = 'text-[12px] font-semibold uppercase tracking-wide text-ink-soft flex items-center gap-1.5';

  return (
    <div className="min-h-screen w-full bg-paper flex flex-col items-center justify-center px-4 py-10">
      <div className="flex items-center gap-3 mb-7">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-wine to-[#9e2a3d] flex items-center justify-center text-white font-heading font-extrabold text-lg shadow-sm">
          P
        </div>
        <span className="font-heading font-extrabold text-xl text-ink">App Pelada</span>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-sm overflow-hidden">
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
          <div className="w-16 h-16 mx-auto rounded-full bg-white/15 ring-4 ring-white/20 text-white flex items-center justify-center">
            <UserPlus className="w-7 h-7" />
          </div>
          <div className="mt-3 font-heading font-bold text-lg text-white">Cadastrar usuário</div>
          <div className="text-[12.5px] text-white/80 mt-0.5">Adicione um novo jogador ao grupo</div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {submitError && (
            <div className="bg-state-warningBg text-state-warning text-[13px] font-medium rounded-lg px-3 py-2.5">
              {submitError}
            </div>
          )}

          {/* Informações Básicas */}
          <div className="space-y-4">
            <h2 className={sectionLabel}><UserIcon className="w-3.5 h-3.5 text-wine" /> Informações básicas</h2>

            <div>
              <label htmlFor="username" className={labelClass}>Nome de usuário</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-icon w-4 h-4" />
                <input id="username" {...usernameInputProps} enterKeyHint="next" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nome de usuário" className={`${inputClass} pl-9`} />
              </div>
              {errors.username && <p className="text-state-warning text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-icon w-4 h-4" />
                <input id="email" {...emailInputProps} enterKeyHint="next" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={`${inputClass} pl-9`} />
              </div>
              {errors.email && <p className="text-state-warning text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-icon w-4 h-4" />
                <input id="password" type="password" autoComplete="new-password" enterKeyHint="next" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" className={`${inputClass} pl-9`} />
              </div>
              {errors.password && <p className="text-state-warning text-xs mt-1">{errors.password}</p>}
            </div>

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
          </div>

          {/* Informações do Jogador */}
          <div className="space-y-4 border-t border-line-soft pt-5">
            <h2 className={sectionLabel}>⚽ Informações do jogador</h2>

            <div>
              <label htmlFor="playerName" className={labelClass}>Nome completo</label>
              <input id="playerName" {...personNameProps} value={playerInfo.name} onChange={e => setPlayerInfo(p => ({ ...p, name: e.target.value }))} placeholder="Nome completo" className={inputClass} />
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
              {isLoading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Cadastrando…</> : <><UserPlus className="w-4 h-4" /> Cadastrar usuário</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
