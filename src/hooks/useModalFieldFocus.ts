import { RefObject, useEffect, useLayoutEffect } from 'react';

/**
 * Campos que realmente levantam o teclado. `<select>` fica de fora de
 * propósito: abre lista suspensa, não teclado, e focá-lo num modal que só tem
 * select (ex.: a folha de "próxima partida") não ajudaria em nada.
 *
 * `:not([readonly])` é o que faz o modal de diarista do Financeiro pular o
 * campo de nome (readOnly e primeiro na ordem do DOM) e cair no valor.
 */
const EDITABLE_SELECTOR = [
  'input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset])' +
    ':not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range])' +
    ':not([type=color]):not([readonly]):not(:disabled)',
  'textarea:not([readonly]):not(:disabled)',
].join(',');

interface Options {
  isOpen: boolean;
  /** Painel inteiro — a busca segue a ordem do DOM, então um campo no header ganha. */
  panelRef: RefObject<HTMLElement>;
  /** Área rolável; só o que está aqui dentro é rolado para a vista. */
  bodyRef: RefObject<HTMLElement>;
  autoFocus: boolean;
}

/**
 * Foca o primeiro campo editável ao abrir o modal e mantém o campo em foco
 * visível quando o teclado virtual encolhe a viewport.
 */
export function useModalFieldFocus({ isOpen, panelRef, bodyRef, autoFocus }: Options) {
  // Foco SÍNCRONO, em layout effect, sem rAF nem setTimeout de propósito: o
  // Chromium só levanta o teclado num focus() programático enquanto a ativação
  // do usuário (o toque que abriu o modal) ainda está viva. Adiar um frame
  // perde essa janela e o teclado não sobe.
  useLayoutEffect(() => {
    if (!isOpen || !autoFocus) return;
    const target = panelRef.current?.querySelector<HTMLElement>(EDITABLE_SELECTOR);
    // preventScroll: a rolagem fica por conta do efeito abaixo, que roda depois
    // que o teclado já encolheu a viewport — aqui ainda mediríamos o layout antigo.
    target?.focus({ preventScroll: true });
  }, [isOpen, autoFocus, panelRef]);

  useEffect(() => {
    if (!isOpen) return;

    const scrollFocusedIntoView = () => {
      const body = bodyRef.current;
      const el = document.activeElement as HTMLElement | null;
      if (!body || !el || !body.contains(el)) return; // ignora campos do header
      // 'nearest' é no-op quando o campo já está visível, então não briga com a
      // rolagem que o próprio Chromium faz ao focar um campo editável.
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    const body = bodyRef.current;
    body?.addEventListener('focusin', scrollFocusedIntoView);

    // Duplo rAF: useVisualViewportVars escreve --vvh dentro do rAF dele, então
    // só no frame seguinte o painel realmente redimensionou. Este é o gatilho
    // que importa — no momento do foco o teclado ainda não encolheu nada.
    let frame = 0;
    const onViewportResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(scrollFocusedIntoView);
      });
    };
    window.visualViewport?.addEventListener('resize', onViewportResize);

    return () => {
      cancelAnimationFrame(frame);
      body?.removeEventListener('focusin', scrollFocusedIntoView);
      window.visualViewport?.removeEventListener('resize', onViewportResize);
    };
  }, [isOpen, bodyRef]);
}
