import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GLOBAL_NAV_ITEMS } from './navItems';

export function TabletShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      <nav className="w-[72px] flex-none bg-ink flex flex-col items-center py-4 gap-2 sticky top-0 h-screen">
        <button
          onClick={() => setDrawerOpen(true)}
          title="Menu do grupo"
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-wine to-[#9e2a3d] text-white font-bold text-base flex items-center justify-center"
        >
          P
        </button>
        <div className="w-[22px] h-px bg-white/10 my-1.5" />
        <button
          onClick={() => setDrawerOpen(true)}
          title="Menu"
          className="w-10 h-10 rounded-full bg-white/5 text-white/60 flex items-center justify-center"
        >
          <Menu className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={() => setDrawerOpen(true)}
          title="Menu do grupo"
          className="mt-auto w-9 h-9 rounded-full bg-white/10 text-white/80 font-semibold text-xs flex items-center justify-center"
        >
          {user?.username?.[0]?.toUpperCase() ?? '?'}
        </button>
      </nav>

      {drawerOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute top-0 left-0 bottom-0 w-[272px] bg-surface shadow-xl flex flex-col p-3.5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 px-1.5 pb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wine to-[#9e2a3d] text-white font-bold text-base flex items-center justify-center flex-none">
                P
              </div>
              <div className="flex-1">
                <div className="font-heading font-extrabold text-sm text-ink">App Pelada</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg bg-paper text-ink-icon">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[10px] font-bold text-ink-icon tracking-wide px-2.5 pb-1.5">GRUPO</div>
            {items.map(({ key, label, icon: Icon, path }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={key}
                  onClick={() => { navigate(path); setDrawerOpen(false); }}
                  className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    active ? 'bg-wine-tint text-wine' : 'text-ink-medium hover:bg-paper'
                  }`}
                >
                  <Icon className="w-[19px] h-[19px]" />
                  {label}
                </button>
              );
            })}

            <div className="mt-auto border-t border-line-soft pt-3 flex items-center gap-2.5 px-1">
              <div className="w-[34px] h-[34px] rounded-full bg-ink text-white font-semibold text-xs flex items-center justify-center flex-none">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-ink truncate">{user?.username}</div>
                <div className="text-[11px] text-ink-soft">{user?.role === 'admin' ? 'Administrador' : 'Jogador'}</div>
              </div>
              <button onClick={handleSignOut} className="text-red-600 hover:text-red-700" title="Sair">
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
