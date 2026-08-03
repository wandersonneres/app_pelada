/**
 * Presets de atributos de teclado para campos de formulário.
 *
 * Só 3 dos ~40 campos do app passam por `ui/input.tsx`; o resto é <input> cru
 * com Tailwind inline. Criar um componente compartilhado exigiria migrar todos
 * os call sites, então a opção de menor atrito é espalhar estes presets:
 *
 *     <input {...searchInputProps} value={busca} onChange={...} className="..." />
 *
 * O que cada atributo faz no teclado virtual:
 * - `type` / `inputMode` → QUAL teclado abre (numérico, e-mail com @, etc.)
 * - `enterKeyHint`       → o rótulo da tecla de ação (Buscar, OK, Enviar)
 * - `autoCapitalize` / `autoCorrect` / `spellCheck` → se o sistema "corrige" o que
 *   foi digitado. Em busca e login isso atrapalha mais do que ajuda.
 *
 * O tamanho e a posição do teclado NÃO são controláveis por aqui (nem por
 * lugar nenhum no app) — pertencem ao sistema operacional.
 */

/** Busca com filtro ao vivo: Enter não envia nada, só fecha o teclado. */
export const searchInputProps = {
  type: 'search',
  enterKeyHint: 'search',
  autoCapitalize: 'none',
  autoCorrect: 'off',
  spellCheck: false,
} as const;

/** Valores em reais, inteiros. Abre o teclado numérico. */
export const moneyInputProps = {
  type: 'text',
  inputMode: 'numeric',
  pattern: '[0-9]*',
  enterKeyHint: 'done',
  autoCorrect: 'off',
  spellCheck: false,
} as const;

/** Nome de pessoa: capitaliza cada palavra, sem corretor. */
export const personNameProps = {
  type: 'text',
  autoCapitalize: 'words',
  autoCorrect: 'off',
  spellCheck: false,
  enterKeyHint: 'done',
} as const;

export const emailInputProps = {
  type: 'email',
  inputMode: 'email',
  autoComplete: 'email',
  autoCapitalize: 'none',
  autoCorrect: 'off',
  spellCheck: false,
} as const;

export const usernameInputProps = {
  type: 'text',
  autoComplete: 'username',
  autoCapitalize: 'none',
  autoCorrect: 'off',
  spellCheck: false,
} as const;
