import { useEffect, useState } from 'react';

export type ViewportKind = 'mobile' | 'tablet' | 'desktop';

function getViewportKind(width: number): ViewportKind {
  if (width < 768) return 'mobile';
  if (width < 1280) return 'tablet';
  return 'desktop';
}

export function useViewport(): ViewportKind {
  const [kind, setKind] = useState<ViewportKind>(() =>
    typeof window === 'undefined' ? 'desktop' : getViewportKind(window.innerWidth)
  );

  useEffect(() => {
    const onResize = () => setKind(getViewportKind(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return kind;
}
