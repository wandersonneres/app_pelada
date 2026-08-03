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
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-10">

      {/* Logo */}
      <div className="flex flex-col items-center gap-2.5 mb-7">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-wine to-[#9e2a3d] text-white font-bold text-2xl flex items-center justify-center flex-none shadow-sm">
          P
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-ink tracking-wide">App Pelada</h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface rounded-2xl shadow-md border border-line p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium text-ink-medium">
              Usuário
            </Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="Seu usuário"
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                setFieldErrors(p => ({ ...p, username: undefined }));
                setError('');
              }}
              className={cn(
                'h-11 focus-visible:border-wine focus-visible:ring-wine/30',
                fieldErrors.username && 'border-state-warning focus-visible:ring-state-warning/30'
              )}
            />
            {fieldErrors.username && (
              <p className="text-xs text-state-warning">{fieldErrors.username}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-ink-medium">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                placeholder="Sua senha"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setFieldErrors(p => ({ ...p, password: undefined }));
                  setError('');
                }}
                className={cn(
                  'h-11 pr-10 focus-visible:border-wine focus-visible:ring-wine/30',
                  fieldErrors.password && 'border-state-warning focus-visible:ring-state-warning/30'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-icon hover:text-ink-medium transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-state-warning">{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <p className="text-xs text-state-warning bg-state-warningBg border border-state-warning/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-lg bg-wine hover:bg-wine-dark active:bg-wine-dark text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

      <p className="text-ink-soft text-xs mt-8">© {new Date().getFullYear()} App Pelada</p>
    </div>
  );
}
