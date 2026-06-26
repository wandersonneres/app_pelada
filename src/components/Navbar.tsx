import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home,
  Calendar,
  Users,
  Menu as MenuIcon,
  User,
  LogOut,
  ChevronLeft,
  DollarSign,
  BarChart2,
  Sun,
  Moon,
} from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const commonItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Início', path: '/' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Nova Pelada', path: '/new-game' },
    { icon: <BarChart2 className="w-5 h-5" />, label: 'Ranking', path: '/ranking' },
  ];

  const adminItems = user?.role === 'admin'
    ? [
        { icon: <Users className="w-5 h-5" />, label: 'Jogadores', path: '/players' },
        { icon: <DollarSign className="w-5 h-5" />, label: 'Financeiro', path: '/financeiro' },
      ]
    : [];

  const menuItems = [...commonItems, ...adminItems];

  return (
    <>
    <nav className="sticky top-0 z-50 bg-[var(--navbar-bg)] backdrop-blur border-b border-divider shadow-[0_4px_20px_-8px_rgba(0,0,0,0.35)]">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-ink-soft hover:bg-surface-hover transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
              <span className="font-heading font-extrabold text-base tracking-wide text-heading hidden sm:block">
                INIMIGOS BOLA FC
              </span>
            </button>
          </div>

          {user && (
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-surface-hover transition-colors"
                >
                  <div className="w-9 h-9 rounded-full avatar-grad flex items-center justify-center text-white font-heading font-bold text-lg ring-2 ring-divider">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                </button>

                <AnimatePresence>
                  {isAvatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-52 rounded-xl bg-[var(--surface-solid)] shadow-xl border border-divider py-1 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsAvatarOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-ink-soft hover:bg-surface-hover transition-colors"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Perfil
                      </button>
                      <button
                        onClick={toggleTheme}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-ink-soft hover:bg-surface-hover transition-colors"
                      >
                        <span className="flex items-center">
                          {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                          {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
                        </span>
                        <span className="text-xs text-ink-dim">{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
                      </button>
                      <div className="my-1 border-t border-divider" />
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsAvatarOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-danger-soft hover:bg-surface-hover transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>

      {/* Menu Lateral — fora da <nav> para o position:fixed referenciar o viewport
          (a nav usa backdrop-blur, que criaria um containing block e prenderia o overlay) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[80vw] z-[70]"
              style={{ background: 'var(--menu-grad)' }}
            >
              <div className="flex items-center justify-between p-5 border-b border-divider">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="" className="w-9 h-9 object-contain" />
                  <h2 className="font-heading text-lg font-extrabold tracking-wide text-heading">MENU</h2>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg text-ink-muted hover:bg-surface-hover transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-1">
                  {menuItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsMenuOpen(false);
                        }}
                        className={`flex items-center w-full p-3 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-team-blue/15 text-heading border border-team-blue/30'
                            : 'text-ink-soft hover:bg-surface-hover border border-transparent'
                        }`}
                      >
                        <span className={isActive ? 'text-team-blue-soft' : 'text-ink-muted'}>
                          {item.icon}
                        </span>
                        <span className="ml-3 font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
