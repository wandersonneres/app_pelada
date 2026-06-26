---
name: design-system-pelada
description: Dark "pelada" design system being rolled out page-by-page across the app_pelada UI
metadata:
  type: project
---

Visual redesign in progress (started 2026-06-24, branch `feat/up-visual`). The user wants a full visual repaint of the app — **no functionality changes**, only styling — rolled out **page by page**. Already done: Login, Home, Navbar/menu, NewGame, Register (cadastrar usuário/jogador), Profile (editar perfil), Players (consulta de jogadores). Still light/legacy: GameDetails, EditGame, EditUser, Financeiro, Ranking, PlayerConfirmation, Dashboard.

Gotcha fixed: the `<nav>` uses `backdrop-blur`, which creates a containing block for `position:fixed`. The slide-out menu + scrim MUST live OUTSIDE `<nav>` (siblings in a fragment) or they get trapped to the 64px bar — caused menu bleed-through on mobile/tablet.

**Source of truth:** Claude Design project "Modernização da tela de partidas" (projectId `0d0930c5-9fe7-4751-9672-f02fd3013d5f`), file `Partidas.dc.html`. Read it via DesignSync for component references.

**Design language (dark, premium, football):**
- Fonts: `font-heading` = Saira Condensed (titles, numbers, team names); `font-sans` = Hanken Grotesk (body). Loaded via Google Fonts in [index.html](index.html).
- Page background: `.pelada-page` utility in [src/index.css](src/index.css) — radial navy gradient + ambient blue/orange glow blobs. Apply per-page (NOT on global `body`, to avoid breaking not-yet-migrated light pages).
- Surfaces: `.glass-card` (translucent, for use inside dark pages only); `.glass-pill`.
- Tokens in [tailwind.config.js](tailwind.config.js): `pitch.{bg,deep,panel}`, `team.{blue,blue-soft,orange,orange-soft}`, `ink.{DEFAULT,soft,muted,dim}`, `success/warning/danger` (+`-soft`).
- Status badge mapping: waiting→warning(yellow), in_progress→team-blue, finished→success(green).
- Navbar ([src/components/Navbar.tsx](src/components/Navbar.tsx)) is a **solid** dark surface (not glass) since it's shared with still-light legacy pages; slide-out menu has a backdrop scrim.

**Why:** "global design system adoption" but gated rollout — legacy pages (Players, Ranking, Financeiro, GameDetails, NewGame, Profile, Register, EditGame, EditUser) still use light Tailwind classes and must keep working until their turn.

**How to apply:** when migrating a new page, wrap its root in `.pelada-page`, swap `bg-white`/`text-gray-*` for `.glass-card`/`text-ink-*`, recolor accents to the `team`/`success`/etc. tokens. Verify no logic/handler changes via diff.

**Don't just recolor — redesign.** User pushback (2026-06-24): theme-swapping alone "não gostei". Real improvements that landed: (1) replace native `<select>` for small enum fields with `<SegmentedControl>` ([src/components/SegmentedControl.tsx](src/components/SegmentedControl.tsx)) — used in Register/Profile/EditUser for posição/pagamento/papel/faixa-etária (pass `wrap` for 4+ options); (2) responsive grids to kill endless single columns — Players uses `md:grid-cols-2 2xl:grid-cols-3`; (3) cap long lists — Home "Todas as Peladas" shows 6 rows + "Ver todas (N)" toggle, no inner-scroll; (4) gate redundant CTAs — Home top "Nova Pelada" only when `activeGames.length > 0`.

**Breakpoint gotcha:** [tailwind.config.js](tailwind.config.js) has CUSTOM screens (sm:590 md:600 lg:1024 xl:1280 2xl:1536). `lg:` does NOT trigger at ~800px. Use `md:` for tablet/small-desktop two-up, `2xl:` for wide three-up.

**Theming (light + dark) — token-driven.** `darkMode: 'class'`; `.dark`/`.light` on `<html>` (unified with shadcn's existing `.dark`). Pelada tokens are CSS vars defined per-class in [index.css](src/index.css): `--page-grad, --glow-*, --heading, --ink(-soft/-muted/-dim), --surface(-strong/-hover), --divider(-strong), --card-grad, --card-shadow, --navbar-bg, --surface-solid, --menu-grad, --team-blue-soft` + other `-soft` accents, `color-scheme`. Tailwind colors map to these vars: `text-heading`, `text-ink-*`, `bg-surface(-strong/-hover)`, `border-divider(-strong)`, `team-blue-soft`/`success-soft`/etc. **Rule: accent BASES stay hex** (`team-blue`,`success`,`danger`,`warning`) so `/opacity` modifiers (`bg-team-blue/15`) keep working; **`-soft` tints + surfaces/ink/borders are vars used WITHOUT `/opacity`**. Keep literal `text-white` only on colored buttons/avatars; primary text uses `text-heading`.
- `ThemeProvider` ([src/contexts/ThemeContext.tsx](src/contexts/ThemeContext.tsx)) sits INSIDE `AuthProvider` in [App.tsx](src/App.tsx). localStorage is source-of-truth for applying; Firestore `users/{id}.theme` is cross-device sync (fire-and-forget on toggle, hydrated on login). Anti-FOUC inline script in [index.html](index.html) sets the class before React mounts; **default dark**.
- Toggle lives in the Navbar avatar dropdown (Perfil / Tema / Sair).
- `body` left as `bg-white text-gray-900` on purpose so not-yet-converted legacy pages stay readable until Phase 2.

**Status:** ALL routed pages + their components are now theme-converted (work light+dark): the 7 original pages, GameDetails (+ PlayerOptionsModal, GameAnalytics, MatchScore), EditGame, Financeiro, Ranking. MatchTimer & TacticalView are intentionally colored "islands" (blue scoreboard / green pitch) — left as-is, read fine on both themes. Dashboard.tsx & PlayerConfirmation.tsx are NOT routed in AppRoutes (dead code) — skipped. Final sweep: zero stray `gray-N`/`bg-white` in routed files (only harmless ones inside Profile's commented avatar block).

**Partidas tab match cards** upgraded to the reference aesthetic: glass-card matches, status pill (live dot + uppercase), collapsed summary = scoreboard with crests + big Saira scores. Expanded view: reference-style scoreboard card (crests + scores + scorers per side), "Confronto dos times" h2h bars (força/idade/habilidade), team-tinted roster cards with crest headers. The inline scoreboard replaced the old `<MatchScore>` usage (MatchScore import now unused in GameDetails but harmless).

**MatchTimer was reworked (BEHAVIOR change, by user request):** the countdown is GONE. Now it records a **start time** (button "Iniciar partida" → `onTimerUpdate({startedAt:new Date(), totalSeconds})`) and displays **Início HH:MM → Término previsto** (start + duration; duration select kept just to compute end). **Goal = click the team panel** (each team is a big clickable panel → opens GoalScorerModal → `onGoalScored`). Goal history + remove kept. All persisted via the same `match.timer` model (startedAt/totalSeconds). `convertTimestampToDate` used to read `match.timer.startedAt`.

**GameDetails fits tablet 1280×800 (user's main device, landscape):** header compacted to ONE row (title + location/players/status chips + Finalizar/Editar/Excluir) — the two big info cards were removed. The Partidas dashboard grid is height-capped on desktop (`xl:h-[calc(100dvh-330px)]`, `items-stretch`) so the whole 3-column card fits the viewport; left & right columns get `xl:min-h-0 xl:overflow-y-auto no-scrollbar` to scroll internally (rosters with many players), and `CombinedPitch` fills its column (`h-full`, `flex-1`, minHeight 300). This was the only reliable way to show placar+campo+14 jogadores at once without huge empty gaps. Mobile (below xl) flows normally (no cap).

**Full-width layout (user wanted screen space used, no narrow centered column):** content pages dropped their `max-w-*` caps for `w-full px-4 sm:px-6 lg:px-10` — Home, GameDetails, Players, Financeiro, and the Navbar inner container. Players grid now `md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`. Ranking kept a cap (`max-w-5xl`) since a single-column list stretched edge-to-edge reads badly. Forms (Register/Profile/EditUser/NewGame/EditGame) intentionally stay centered (`max-w-2xl`) — full-width form inputs are bad UX.

**Partidas tab = 3-column dashboard (matches `Partidas Tablet.dc.html`, the real reference — read it, NOT just `Partidas.dc.html`).** Replaced the old accordion list. Layout: `xl:grid-cols-[330px_minmax(340px,1fr)_330px]`. LEFT = status/actions + scoreboard (or MatchTimer if in_progress) + win buttons + "Jogos do dia" match selector (sets `expandedMatchId` = selected match) + "Confronto dos times" h2h bars. CENTER = `CombinedPitch` ([src/components/CombinedPitch.tsx](src/components/CombinedPitch.tsx)) — single dark field, team A bottom / team B top, tokens positioned from each team's formation, goal badges, formation `<select>` in the corner tags, click a token → player info popup (`pitchPlayer` state). RIGHT = two roster cards (blue/orange tinted, crest + age/skill + score header, player rows with pos badge / goals / assists / swap button). All handlers preserved (finishMatch, deleteMatch, waiting list, swap, formation, MatchTimer scoring). The "Gerar nova partida" controls stay below the grid. Refinements: match selector moved to a horizontal top strip (chips + waiting/delete actions); "Confronto dos times" is now a COMPACT 3-up strip merged into the center column under the pitch (user found the full card too space-heavy); win buttons ("Time X Venceu") moved to a full-width bar at the bottom (before "Jogadores por time") so mobile order ends with the finish action.

**Unified scoreboard (in MatchTimer):** to kill the duplicate cards, the static scoreboard now renders ONLY when `match.status !== 'in_progress'`. When in progress, MatchTimer IS the scoreboard — one unified card: status pill + Início→Fim + duration on top, then the interactive crest/name/big-score columns (click a team column to mark a goal), then goal history. Same data/handlers.

**TacticalView** restyled from bright green to the reference dark "Grafite" pitch (dark gradient + subtle stripes + white markings); still per-team (NOT the single combined pitch from the reference — that would change the position logic). Formation selector kept (dark styled).

**Verification caveat:** the preview screenshot tool was wedged the entire session, so EVERYTHING was verified via `tsc` + production build + computed-style checks, NOT screenshots. A human visual once-over of GameDetails/Financeiro/Ranking in both themes is still recommended.

**Players refinements (latest):** StarRating has a `readOnly` mode (info-only, used in the Players list — no accidental editing); avatar uses `.avatar-grad` (refined single-hue blue, not the old blue→orange); empty stars use `--star-empty`.

**Tooling note:** the preview screenshot tool wedges this project (blur/backdrop-blur glow in headless capture). Verify themes via `preview_eval` reading computed styles / flipping `documentElement.className`.

**Visual verification:** auth-gates everything except `/login` and `/register`. To see gated pages locally, temporarily set a mock user in [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) (real Firestore data still loads) — REVERT before commit. Preview screenshot tool wedges after a resize+HMR-error; a clean `preview_stop`/`start` fixes capture.
