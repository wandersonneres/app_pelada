import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const validate = () => {
    const errs: { username?: string; password?: string } = {};
    if (!username.trim()) errs.username = 'Informe o usuário';
    if (!password) errs.password = 'Informe a senha';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      await signIn(username.trim(), password);
      navigate('/');
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.includes('user-not-found') || msg.includes('Usuário não encontrado')) {
        setError('Usuário não encontrado');
      } else if (msg.includes('wrong-password')) {
        setError('Senha incorreta');
      } else if (msg.includes('too-many-requests')) {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else {
        setError('Usuário ou senha incorretos');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">

      {/* Logo */}
      <div className="flex flex-col items-center mb-7">
        <img
          src="/logo.png"
          alt="Inimigos Bola FC"
          className="w-28 h-28 object-contain drop-shadow-lg mb-3"
        />
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-wide">Inimigos Bola FC</h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Usuário
            </Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Seu usuário"
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                setFieldErrors(p => ({ ...p, username: undefined }));
                setError('');
              }}
              className={cn(
                'h-11',
                fieldErrors.username && 'border-red-400 focus-visible:ring-red-300'
              )}
            />
            {fieldErrors.username && (
              <p className="text-xs text-red-500">{fieldErrors.username}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Sua senha"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setFieldErrors(p => ({ ...p, password: undefined }));
                  setError('');
                }}
                className={cn(
                  'h-11 pr-10',
                  fieldErrors.password && 'border-red-400 focus-visible:ring-red-300'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>

        </form>
      </div>

      <p className="text-gray-400 text-xs mt-8">© {new Date().getFullYear()} Inimigos Bola FC</p>
    </div>
  );
}
