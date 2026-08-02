import { ReactNode, useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { useVisualViewportVars } from '../../hooks/useVisualViewport';

let openModalCount = 0;

/** Trava o scroll do body enquanto houver ao menos um modal aberto. */
function useBodyScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const body = document.body;
    // Sem salvar/restaurar valor anterior de propósito: quando um modal abre
    // outro (opções do jogador → pagamento), o efeito do novo roda antes da
    // limpeza do antigo e o valor salvo seria o 'hidden' do próprio modal,
    // deixando o body travado. Nada mais no app mexe em body.style.overflow.
    if (openModalCount === 0) body.style.overflow = 'hidden';
    openModalCount += 1;
    return () => {
      openModalCount -= 1;
      if (openModalCount === 0) body.style.overflow = '';
    };
  }, [enabled]);
}

const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
} as const;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Título no cabeçalho padrão. Omita junto com `header` para não renderizar cabeçalho. */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Substitui todo o cabeçalho padrão (inclusive o botão de fechar). */
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  size?: keyof typeof SIZE_CLASS;
  /**
   * `sheet` (padrão) cola no rodapé em telas pequenas e centraliza a partir de `sm`.
   * `center` centraliza sempre.
   */
  variant?: 'sheet' | 'center';
  closeOnBackdrop?: boolean;
  /** Classes extras para a área rolável. */
  bodyClassName?: string;
  panelClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  header,
  footer,
  children,
  size = 'md',
  variant = 'sheet',
  closeOnBackdrop = true,
  bodyClassName,
  panelClassName,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropArmed = useRef(false);
  const titleId = useId();

  useVisualViewportVars(isOpen);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Só fecha quando o gesto COMEÇA e TERMINA no backdrop. Sem isso, arrastar
  // para selecionar texto dentro de um input e soltar fora fecha o modal.
  const onBackdropPointerDown = useCallback((e: React.PointerEvent) => {
    backdropArmed.current = e.target === e.currentTarget;
  }, []);

  const onBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (!closeOnBackdrop) return;
      if (backdropArmed.current && e.target === e.currentTarget) onClose();
      backdropArmed.current = false;
    },
    [closeOnBackdrop, onClose]
  );

  if (!isOpen) return null;

  const showHeader = header !== undefined || title !== undefined;

  return createPortal(
    <div
      className={cn(
        'fixed left-0 top-0 w-full z-[100] flex justify-center bg-black/40 overflow-hidden',
        variant === 'sheet' ? 'items-end sm:items-center p-0 sm:p-4' : 'items-center p-3 sm:p-4'
      )}
      style={{
        // Ver useVisualViewportVars: acompanha o teclado virtual, o que vh/dvh não fazem.
        height: 'var(--vvh, 100dvh)',
        transform: 'translateY(var(--vvo, 0px))',
      }}
      onPointerDown={onBackdropPointerDown}
      onClick={onBackdropClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title !== undefined ? titleId : undefined}
        className={cn(
          'bg-surface shadow-xl w-full flex flex-col min-h-0 max-h-full animate-fade-in',
          SIZE_CLASS[size],
          variant === 'sheet' ? 'rounded-t-2xl sm:rounded-2xl' : 'rounded-2xl',
          panelClassName
        )}
      >
        {showHeader &&
          (header ?? (
            <div className="flex items-start justify-between gap-3 p-4 border-b border-line flex-none">
              <div className="min-w-0">
                <h2 id={titleId} className="font-heading font-bold text-[17px] text-ink truncate">
                  {title}
                </h2>
                {subtitle && <p className="text-[12px] text-ink-soft mt-px">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="w-8 h-8 flex-none rounded-lg flex items-center justify-center text-ink-icon hover:text-ink hover:bg-paper transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>
          ))}

        <div className={cn('flex-1 min-h-0 overflow-y-auto overscroll-contain p-4', bodyClassName)}>
          {children}
        </div>

        {footer && <div className="flex-none border-t border-line p-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
