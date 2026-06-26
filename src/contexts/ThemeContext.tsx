import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export type Theme = 'dark' | 'light';

interface ThemeContextData {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return 'dark';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* ignore */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);
  // avoids writing back to Firestore the value we just read from it
  const hydratedUserId = useRef<string | null>(null);

  // keep the <html> class + localStorage in sync with state
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // On login, Firestore preference wins (cross-device sync)
  useEffect(() => {
    const userTheme = (user as { theme?: Theme } | null)?.theme;
    if (user && hydratedUserId.current !== user.id) {
      hydratedUserId.current = user.id;
      if (userTheme === 'light' || userTheme === 'dark') {
        setThemeState(userTheme);
      }
    }
    if (!user) hydratedUserId.current = null;
  }, [user]);

  const persist = (next: Theme) => {
    setThemeState(next);
    if (user?.id) {
      // fire-and-forget cross-device sync
      updateDoc(doc(db, 'users', user.id), { theme: next }).catch(() => {});
    }
  };

  const setTheme = (t: Theme) => persist(t);
  const toggleTheme = () => persist(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
