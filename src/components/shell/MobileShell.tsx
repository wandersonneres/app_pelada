import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageNavValue } from '../../contexts/PageNavContext';
import { GLOBAL_NAV_ITEMS } from './navItems';

export function MobileShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageNav = usePageNavValue();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const items = GLOBAL_NAV_ITEMS.filter(item => {
    if (item.requiresAdmin && !isAdmin) return false;
    if (item.requiresFinanceiro && !isAdmin) return false;
    return true;
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface border-b border-line flex items-center gap-3 px-4 py-2">
        <button
          onClick={() => setMenuOpen(true)}
          className="w-[38px] h-[38px] rounded-[11px] bg-paper flex items-center justify-center flex-none"
        >
          <Menu className="w-[18px] h-[18px] text-ink-medium" />
        </button>
        <div className="flex-1 min-w-0">
          {pageNav ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-[15px] text-ink truncate">{pageNav.title}</span>
                {pageNav.live && <span className="w-[7px] h-[7px] rounded-full flex-none" style={{ background: '#9e2a3d' }} />}
              </div>
              {pageNav.subtitle && <div className="text-[11px] text-ink-soft truncate">{pageNav.subtitle}</div>}
            </>
          ) : (
            <div className="font-heading font-extrabold text-[15px] text-ink">App Pelada</div>
          )}
        </div>
        <div className="relative flex-none">
          <button
            onClick={() => setAvatarOpen(o => !o)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-wine to-[#9e2a3d] text-white font-semibold text-xs flex items-center justify-center"
          >
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </button>
          {avatarOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-surface shadow-lg border border-line py-1 z-40">
              <button
                onClick={() => { navigate('/profile'); setAvatarOpen(false); }}
                className="flex items-center w-full px-3.5 py-2 text-sm text-ink-medium hover:bg-paper"
              >
                <User className="w-4 h-4 mr-2" /> Perfil
              </button>
              <button
                onClick={() => { handleSignOut(); setAvatarOpen(false); }}
                className="flex items-center w-full px-3.5 py-2 text-sm text-red-600 hover:bg-paper"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute left-0 right-0 bottom-0 bg-surface rounded-t-[26px] p-4 pb-8 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 rounded-full bg-line mx-auto mb-4" />
            <div className="flex items-center gap-2.5 pb-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-wine to-[#9e2a3d] text-white font-bold flex items-center justify-center flex-none">
                P
              </div>
              <div className="font-heading font-extrabold text-base text-ink">App Pelada</div>
            </div>
            {items.map(({ key, label, icon: Icon, path }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={key}
                  onClick={() => { navigate(path); setMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full py-3 border-t border-line-soft text-[14.5px] font-medium text-left ${
                    active ? 'text-wine' : 'text-ink-medium'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
