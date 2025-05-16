import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@chakra-ui/react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username) newErrors.username = 'Usuário é obrigatório';
    if (!password) newErrors.password = 'Senha é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await signIn(username, password);
      navigate('/');
    } catch (error: any) {
      let errorMessage = 'Erro ao fazer login';
      
      if (error.message.includes('user-not-found')) {
        errorMessage = 'Usuário não encontrado';
      } else if (error.message.includes('wrong-password')) {
        errorMessage = 'Senha incorreta';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Email inválido';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      }

      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Login</h1>
        <p className="text-gray-500 text-center mb-6">Entre com suas credenciais para acessar o sistema</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Usuário</label>
            <div className="relative">
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.username ? 'border-red-400' : 'border-gray-200'
                }`}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
              />
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.username && <span className="text-xs text-red-500 mt-1 block">{errors.username}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password ? 'border-red-400' : 'border-gray-200'
                }`}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Digite sua senha"
              />
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <FaEyeSlash className="w-4 h-4" />
                ) : (
                  <FaEye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password}</span>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 