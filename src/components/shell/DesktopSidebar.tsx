import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageNavValue } from '../../contexts/PageNavContext';
import { GLOBAL_NAV_ITEMS } from './navItems';

export function DesktopSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageNav = usePageNavValue();

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
    <nav className="w-[248px] flex-none bg-surface border-r border-line flex flex-col p-3.5 sticky top-0 h-screen overflow-y-auto">
      <div className="flex items-center gap-2.5 px-1.5 pb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wine to-[#9e2a3d] text-white font-bold text-base flex items-center justify-center flex-none">
          P
        </div>
        <div>
          <div className="font-heading font-extrabold text-sm text-ink">App Pelada</div>
        </div>
      </div>

      <div className="text-[10px] font-bold text-ink-icon tracking-wide px-2.5 pt-2 pb-1.5">GRUPO</div>
      {items.map(({ key, label, icon: Icon, path }) => {
        const active = location.pathname === path;
        return (
          <button
            key={key}
            onClick={() => navigate(path)}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors text-left ${
              active ? 'bg-wine-tint text-wine' : 'text-ink-medium hover:bg-paper'
            }`}
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </button>
        );
      })}

      {pageNav && (
        <>
          <div className="text-[10px] font-bold text-ink-icon tracking-wide px-2.5 pt-4 pb-1.5 truncate">
            {pageNav.title}
          </div>
          {pageNav.items.map(({ key, label, icon: Icon, badge }) => {
            const active = pageNav.active === key;
            return (
              <button
                key={key}
                onClick={() => pageNav.onSelect(key)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-semibold transition-colors text-left ${
                  active ? 'bg-wine-tint text-wine' : 'text-ink-medium hover:bg-paper'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {label}
                {badge && <span className="ml-auto text-[10px] text-ink-icon">{badge}</span>}
              </button>
            );
          })}
        </>
      )}

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
    </nav>
  );
}
