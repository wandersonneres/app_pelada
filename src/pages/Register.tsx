import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StarRating } from '../components/StarRating';
import { SegmentedControl } from '../components/SegmentedControl';
import { FaChevronLeft, FaUser, FaEnvelope, FaLock, FaFutbol, FaStar } from 'react-icons/fa';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../config/firebase';

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
  role?: string;
  'playerInfo.name'?: string;
}

export function Register() {
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
  
  const navigate = useNavigate();

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

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (!role) {
      newErrors.role = 'Papel é obrigatório';
    }

    if (!playerInfo.name) {
      newErrors['playerInfo.name'] = 'Nome do jogador é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    let secondaryApp;
    try {
      // Inicializa um app secundário para não deslogar o admin
      secondaryApp = initializeApp(firebaseConfig, 'Secondary');
      const secondaryAuth = getAuth(secondaryApp);

      // Cria usuário no Auth do app secundário
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = userCredential.user.uid;

      // Cria documento do usuário no Firestore (sem senha)
      const usersRef = collection(db, 'users');
      await setDoc(doc(usersRef, uid), {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        role,
        playerInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Mostra mensagem de sucesso
      // toast({
      //   title: 'Usuário cadastrado',
      //   description: 'O usuário foi cadastrado com sucesso!',
      //   status: 'success',
      //   duration: 3000,
      //   isClosable: true,
      //   position: 'top',
      // });

      // Redireciona para a página de jogadores
      navigate('/players');
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      let errorMessage = 'Erro ao criar usuário';

      if (error.code === 'permission-denied') {
        errorMessage = 'Você não tem permissão para cadastrar usuários';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso.';
      }

      // toast({
      //   title: 'Erro',
      //   description: errorMessage,
      //   status: 'error',
      //   duration: 5000,
      //   isClosable: true,
      //   position: 'top',
      // });
    } finally {
      setIsLoading(false);
      // Remove o app secundário para liberar recursos
      if (secondaryApp) {
        try { await secondaryApp.delete(); } catch {}
      }
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
        <h1 className="font-heading text-2xl font-extrabold tracking-wide text-heading text-center flex-1">Cadastrar Usuário</h1>
        <div className="w-9" />
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

          <div className="space-y-2">
            <label htmlFor="password" className="field-label">
              Senha
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="field-input pl-10"
              />
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim w-4 h-4" />
            </div>
            {errors.password && <p className="text-danger-soft text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label className="field-label">Papel</label>
            <SegmentedControl
              value={role}
              onChange={(v) => setRole(v as Role)}
              options={[
                { value: 'player', label: 'Jogador' },
                { value: 'admin', label: 'Administrador' },
              ]}
            />
            {errors.role && <p className="text-danger-soft text-sm mt-1">{errors.role}</p>}
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
              Cadastrando...
            </>
          ) : (
            'Cadastrar Usuário'
          )}
        </button>
      </form>
      </div>
    </div>
  );
} 