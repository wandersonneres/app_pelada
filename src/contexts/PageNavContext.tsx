import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface PageNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export interface PageNavValue {
  title: string;
  items: PageNavItem[];
  active: string;
  onSelect: (key: string) => void;
  /** Subtítulo contextual para o header mobile/tablet (ex.: "Society Boa Vista · 20 confirmados"). */
  subtitle?: string;
  /** Indicador "ao vivo" no header contextual. */
  live?: boolean;
}

interface PageNavContextData {
  value: PageNavValue | null;
  setValue: (value: PageNavValue | null) => void;
}

const PageNavContext = createContext<PageNavContextData>({ value: null, setValue: () => {} });

export function PageNavProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<PageNavValue | null>(null);
  return (
    <PageNavContext.Provider value={{ value, setValue }}>
      {children}
    </PageNavContext.Provider>
  );
}

export function usePageNav(value: PageNavValue | null) {
  const { setValue } = useContext(PageNavContext);
  const itemsKey = value?.items.map(i => i.key).join(',') ?? '';

  useEffect(() => {
    setValue(value);
    return () => setValue(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.title, value?.active, value?.onSelect, value?.subtitle, value?.live, itemsKey]);
}

export function usePageNavValue() {
  return useContext(PageNavContext).value;
}

export function usePageNavItems(items: PageNavItem[]) {
  return useMemo(() => items, [items.map(i => i.key).join(',')]);
}
