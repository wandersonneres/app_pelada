import { useLayoutEffect } from 'react';

/**
 * Mantém `--vvh` / `--vvo` no <html> sincronizados com a visual viewport.
 *
 * Por que não basta `100vh`/`100dvh`: nenhuma das duas reage ao teclado virtual.
 * `dvh` acompanha só a barra de endereço que colapsa. Quando o teclado abre, a
 * layout viewport continua do mesmo tamanho e o teclado simplesmente cobre a
 * parte de baixo — por isso um modal centralizado some atrás do teclado.
 * `window.visualViewport` é a única API que enxerga isso, no iOS e no Android.
 *
 * --vvh = altura realmente visível
 * --vvo = quanto a visual viewport está deslocada do topo (iOS empurra a página
 *         para cima ao focar um input perto do rodapé)
 */
export function useVisualViewportVars(enabled: boolean) {
  useLayoutEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const root = document.documentElement;
    const vv = window.visualViewport;
    let frame = 0;

    const apply = () => {
      frame = 0;
      const height = vv ? vv.height : window.innerHeight;
      const offsetTop = vv ? vv.offsetTop : 0;
      root.style.setProperty('--vvh', `${height}px`);
      root.style.setProperty('--vvo', `${offsetTop}px`);
    };

    // O iOS dispara resize/scroll em rajada enquanto o teclado anima.
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    apply();

    vv?.addEventListener('resize', schedule);
    vv?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      vv?.removeEventListener('resize', schedule);
      vv?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
    };
  }, [enabled]);
}
