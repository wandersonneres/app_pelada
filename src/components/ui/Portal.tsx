import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders children into document.body, escaping any ancestor stacking context
 * (transforms, filters, backdrop-blur, etc.) so fixed overlays/modals always
 * paint above the sticky navbar.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
