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
    <div className="pelada-page flex flex-col items-center justify-center px-4 py-10">

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="rounded-3xl bg-surface border border-divider p-4 mb-4 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]">
          <img
            src="/logo.png"
            alt="Inimigos Bola FC"
            className="w-24 h-24 object-contain drop-shadow-lg"
          />
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-heading tracking-wide">Inimigos Bola FC</h1>
        <p className="text-sm text-ink-muted mt-1">Entre para gerenciar suas peladas</p>
      </div>

      {/* Card */}
      <div className="glass-card relative z-10 w-full max-w-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium text-ink-soft">
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
                'h-11 bg-surface border-divider text-ink placeholder:text-ink-dim focus-visible:border-team-blue focus-visible:ring-team-blue/30',
                fieldErrors.username && 'border-danger/70 focus-visible:ring-danger/30'
              )}
            />
            {fieldErrors.username && (
              <p className="text-xs text-danger-soft">{fieldErrors.username}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-ink-soft">
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
                  'h-11 pr-10 bg-surface border-divider text-ink placeholder:text-ink-dim focus-visible:border-team-blue focus-visible:ring-team-blue/30',
                  fieldErrors.password && 'border-danger/70 focus-visible:ring-danger/30'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink-soft transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-danger-soft">{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <p className="text-xs text-danger-soft bg-danger/10 border border-danger/25 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-team-blue hover:brightness-110 active:brightness-95 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_rgba(59,130,246,0.7)] disabled:opacity-50"
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

      <p className="relative z-10 text-ink-dim text-xs mt-8">© {new Date().getFullYear()} Inimigos Bola FC</p>
    </div>
  );
}
