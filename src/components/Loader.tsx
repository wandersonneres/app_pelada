// Loading no padrão do app (paleta vinho / papel).

interface PageLoaderProps {
  label?: string;
  /** Ocupa a tela toda (default) ou só o container pai. */
  full?: boolean;
}

export function PageLoader({ label = 'Carregando…', full = true }: PageLoaderProps) {
  return (
    <div className={`${full ? 'min-h-screen' : 'h-full min-h-[240px]'} w-full flex items-center justify-center bg-paper cursor-default select-none`}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-wine/15 border-t-wine animate-spin" />
          <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-wine to-[#9e2a3d] text-white font-heading font-extrabold text-xl flex items-center justify-center shadow-sm">
            P
          </div>
        </div>
        {label && <div className="text-ink-soft text-[13px] font-medium">{label}</div>}
      </div>
    </div>
  );
}

// Spinner inline (botões, modais, seções).
export function Spinner({ className = 'w-6 h-6' }: { className?: string }) {
  return <div className={`rounded-full border-[3px] border-wine/25 border-t-wine animate-spin ${className}`} />;
}
