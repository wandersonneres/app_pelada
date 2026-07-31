import { BarChart2, Calendar, DollarSign, Home, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface GlobalNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
  requiresAdmin?: boolean;
  requiresFinanceiro?: boolean;
}

export const GLOBAL_NAV_ITEMS: GlobalNavItem[] = [
  { key: 'home', label: 'Início', icon: Home, path: '/' },
  { key: 'new-game', label: 'Nova Pelada', icon: Calendar, path: '/new-game' },
  { key: 'ranking', label: 'Ranking geral', icon: BarChart2, path: '/ranking' },
  { key: 'players', label: 'Todos os jogadores', icon: Users, path: '/players', requiresAdmin: true },
  { key: 'financeiro', label: 'Financeiro', icon: DollarSign, path: '/financeiro', requiresFinanceiro: true },
];
