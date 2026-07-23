import { ReactNode } from 'react';
import { useViewport } from '../../hooks/useViewport';
import { DesktopSidebar } from './DesktopSidebar';
import { TabletShell } from './TabletShell';
import { MobileShell } from './MobileShell';

export function AppShell({ children }: { children: ReactNode }) {
  const viewport = useViewport();

  if (viewport === 'desktop') {
    return (
      <div className="flex min-h-screen">
        <DesktopSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    );
  }

  if (viewport === 'tablet') {
    return (
      <div className="flex min-h-screen">
        <TabletShell />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MobileShell />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
