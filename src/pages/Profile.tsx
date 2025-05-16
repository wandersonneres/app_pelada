import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StarRating } from '../components/StarRating';
import { FaChevronLeft, FaUser, FaEnvelope, FaFutbol, FaStar, FaUserEdit, FaCamera } from 'react-icons/fa';
import { useToast } from '@chakra-ui/react';

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
  const toast = useToast();

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

      toast({
        title: 'Perfil atualizado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message || 'Ocorreu um erro ao tentar atualizar o perfil',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FaChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-center flex-1">Meu Perfil</h1>
        <div className="w-8" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center space-y-4">
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
              onClick={() => {/* Implementar upload de foto */}}
            >
              <FaCamera className="w-6 h-6 text-white" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Clique para alterar a foto</p>
        </div>

        {/* Informações Básicas */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaUser className="w-4 h-4 text-blue-600" />
            Informações Básicas
          </h2>

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nome de Usuário
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite o nome de usuário"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o email"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Informações do Jogador */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaFutbol className="w-4 h-4 text-blue-600" />
            Informações do Jogador
          </h2>

          <div className="space-y-2">
            <label htmlFor="playerInfo.name" className="block text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <input
              type="text"
              id="playerInfo.name"
              value={playerInfo.name}
              onChange={(e) => setPlayerInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome completo"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            {errors['playerInfo.name'] && <p className="text-red-500 text-sm mt-1">{errors['playerInfo.name']}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="playerInfo.position" className="block text-sm font-medium text-gray-700">
                Posição
              </label>
              <select
                id="playerInfo.position"
                value={playerInfo.position}
                onChange={(e) => setPlayerInfo(prev => ({ ...prev, position: e.target.value as Position }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="defesa">Defesa</option>
                <option value="meio">Meio Campo</option>
                <option value="ataque">Ataque</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="playerInfo.ageGroup" className="block text-sm font-medium text-gray-700">
                Faixa Etária
              </label>
              <select
                id="playerInfo.ageGroup"
                value={playerInfo.ageGroup}
                onChange={(e) => setPlayerInfo(prev => ({ ...prev, ageGroup: e.target.value as AgeGroup }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="15-20">15-20 anos</option>
                <option value="21-30">21-30 anos</option>
                <option value="31-40">31-40 anos</option>
                <option value="41-50">41-50 anos</option>
                <option value="+50">+50 anos</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaStar className="w-4 h-4 text-yellow-500" />
              Nível de Habilidade
            </label>
            <div className="p-2 bg-gray-50 rounded-lg">
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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
  );
} 