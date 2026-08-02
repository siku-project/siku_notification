# SIKU Notification System — Web View Design

- **Date:** 2026-08-02
- **Status:** Approved (design)
- **Scope:** Web view only (NUI). The Lua client/server/API/networking layer is a separate spec that follows.
- **Repository:** `siku_notification`
- **Branch:** `feature/interface`

## Context

`siku_notification` is the official notification system of the SIKU ecosystem — the service every SIKU resource will use to display notifications. It must feel like a premium operating-system notification: modern, minimal, highly readable over hundreds of hours, and instantly recognizable as SIKU even with no logo. It strictly follows the SIKU Design System (Ice Glass, Scandinavian minimalism, cold colors, no blur, thin frozen borders, subtle lighting, expensive-feeling animations).

This spec covers the **web view**: the visual notification engine, fully iterable in the dev boilerplate through an interactive control panel. It does not cover the Lua exports, server networking, or the public API — those are the next spec. The web view exposes a single prod entry point (`siku:notification:show` NUI message) so the Lua layer can plug in later without changing the view.

## Goals

- Render a notification from any subset of optional fields with a layout that adapts automatically — no gaps, no placeholders.
- Two image modes: side image and full background image (with auto overlay).
- Nine positions, each an independent elegant stack; never overlap.
- Professional queue management: lifetime timers, smooth enter/leave, smooth reorder (FLIP), soft visible cap with FIFO overflow.
- A mandatory progress indicator integrated into the material (not a generic bar).
- Ice Glass material, strict SIKU palette, perfect readability over GTA V.
- A Pinia store as the central queue manager.
- An interactive dev control panel to fire and iterate notifications without FiveM.

## Non-goals (this increment)

- No Lua exports, client/server scripts, networking, or config.lua.
- No sounds, actions/buttons, categories, priorities, persistence — reserved as schema hooks only.

## Architecture

Store-driven manager + presentational card (mirrors the `siku_chat` separation).

```
web/src/
  stores/notifications.ts          Pinia store = queue manager (state, getters, actions, timers)
  utils/notifications.ts           Schema types, defaults, normalization, position/layout helpers
  components/notification/
    NotificationCenter.vue         Orchestrator: 9 position stacks + TransitionGroup/FLIP
    NotificationCard.vue           Pure presentational: adaptive layout + Ice Glass + animations
    NotificationProgress.vue       Integrated receding-ice progress indicator
  components/dev/
    NotificationDevPanel.vue       Dev control panel (all fields + presets + spam), boilerplate view
  views/NotificationView.vue       Prod: mounts NotificationCenter + NUI listener
```

Reuses existing DA infrastructure already ported to this repo: `components/ui/IcePanel.vue`, the `glacier` Tailwind palette, and the `--ice-*` / `.ice-*` layer in `assets/main.css`.

## Data model

The notification object accepted by `store.show(input)` (and later mirrored by the Lua API):

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | number | auto | — | Assigned by the store |
| `title` | string | no | — | Large, bold, highest priority |
| `subtitle` | string | no | — | Smaller, medium weight |
| `description` | string | no | — | Multi-line, wraps |
| `icon` | string | no | — | Outline icon (mdi), optional |
| `image` | string | no | — | URL / asset reference |
| `imageMode` | `'side' \| 'background'` | no | `'side'` | Only meaningful when `image` is set |
| `position` | 9 anchors | no | `'top-right'` | See Positions |
| `duration` | number (ms) | no | `5000` | `0` or `nil` = infinite |

Reserved hooks (declared in the type, not implemented now): `color`, `priority`, `sound`, `actions`.

`utils/notifications.ts` normalizes raw input: fills defaults, validates `imageMode`/`position` against allowed sets, and computes a `layout` descriptor (which regions render) from which fields exist. The store stamps `createdAt` and `status`.

## Store design (`stores/notifications.ts`)

Pinia setup store — the single source of truth and the queue manager.

**State**
- `notifications: NotificationItem[]` — active (mounted) notifications across all positions.
- `queue: NotificationItem[]` — overflow waiting for a free slot (FIFO, ordered).
- `maxVisiblePerPosition: number` — soft cap, default `5`.
- `defaults` — position/duration/imageMode defaults used by normalization.
- `nextId: number`.
- Internal timer handles keyed by id (not reactive state).

**Getters**
- `visibleByPosition: Record<Position, NotificationItem[]>` — active items grouped per anchor, ordered for stacking, respecting the cap. Drives the 9 stacks in `NotificationCenter`.

**Actions**
- `show(input): NotificationItem` — normalize → assign `id`/`createdAt` → if the target position has a free slot push to `notifications` and start its lifetime timer, else push to `queue`.
- `dismiss(id)` — clear timer, remove from `notifications`, then promote the oldest queued item for that position (start its timer).
- `clear(position?)` — dismiss all (optionally for one position), clearing timers.
- `setConfig(config)` — apply `maxVisiblePerPosition`/defaults (used by prod config later).

Lifetime timers live in the store: on `show`, a `setTimeout(duration)` schedules `dismiss(id)`; infinite (`duration <= 0`) starts no timer. The card never owns dismissal — it only reads `createdAt` + `duration` to drive the progress animation via CSS.

## Adaptive layout (`NotificationCard.vue`)

Renders any subset with no empty space:
- Text regions stack vertically: title → subtitle → description (each rendered only if present).
- **Side mode:** a square image at the left occupying the full card height; text content fills the remaining width; a thin inner divider separates image and content.
- **Background mode:** the image fills the card; an automatic dark translucent gradient overlay is applied (denser behind the text block) while the Ice Glass border, inner highlight and sheen stay visible over it; text gains a soft shadow for readability.
- **Minimum size:** even `"Saved."` looks premium — min-width ~300px with comfortable padding; never tiny.
- **Maximum width ~380px:** long text wraps and height grows smoothly.

## Positions & stacking (`NotificationCenter.vue`)

Nine anchors: `top-left`, `top-center`, `top-right`, `center-left`, `center`, `center-right`, `bottom-left`, `bottom-center`, `bottom-right`. Each anchor is an independent fixed-positioned stack container.

- top-* stacks grow **downward**; bottom-* grow **upward**; center-row stacks (`center-left`, `center`, `center-right`) are vertically **centered as a group** and grow downward, re-centering smoothly (via FLIP) as items are added or removed.
- Consistent gap between cards; stacks never overlap each other.
- `<TransitionGroup>` renders each stack; FLIP animates repositioning so when one card leaves, the rest glide into place with no snap.

## Queue & lifetime

- Each active notification runs its own lifetime timer (in the store); infinite ones never auto-dismiss.
- Soft cap of **5 visible per position**; additional notifications for that position wait in the FIFO `queue` and enter as slots free (on dismiss). This keeps dozens of notifications smooth instead of flooding the screen.

## Progress indicator (`NotificationProgress.vue`)

Signature element. A **thin glowing ice line inset into the bottom border**, spanning the full width, that **recedes smoothly toward the center down to 0** as the lifetime elapses, with a soft cold glow at its receding edges — reads like melting ice. Implemented as a single CSS transition (linear timing, `transform: scaleX`) started on mount from `duration`, so it is GPU-friendly and perfectly smooth with no per-frame JS. Hidden when `duration` is infinite. Integrated into the material — never a separate bar underneath.

## Animations

Expensive, never bouncy or arcade. Only `opacity` and `transform`.
- **Enter:** fade in + a few-px translate from the anchor side + very subtle scale `0.98 → 1`, ~0.45s ease-out (cubic-bezier settle).
- **Exit:** fade out + small translate + slight scale-down, ~0.3s.
- **Reorder:** FLIP, smooth glide.

## Ice Glass material

The card reuses the `IcePanel` material: soft gradients, semi-transparent cold background, thin white low-opacity border, inner highlight, subtle cold glow, faint noise texture — **no blur / no backdrop-filter**. Depth comes from lighting, not black shadows (shadows very soft). Strict SIKU palette mapped to the existing `glacier` scale plus white:

- Cold/Ice/Snow White → `white`, `glacier-50`, `glacier-100`
- Slate / Blue Gray → `glacier-200`, `glacier-300`
- Glacier Blue → `glacier-400`, `glacier-500`
- Dark Arctic Gray → `glacier-900`, `glacier-950`

Accent colors only if a future `color` field is set; otherwise none.

## Dev control panel (`NotificationDevPanel.vue`)

Registered as a boilerplate view named "Notifications" (in `BoilerplateView.vue`'s `viewComponents` registry). Contains:
- Inputs for every field: title, subtitle, description, image (url + a few bundled sample assets), imageMode toggle, icon, position picker (all 9), duration control including an "infinite" toggle.
- Quick presets: `"Saved."` (title-only minimum), item pickup (title + subtitle + side image), achievement (title + description + background image), long description (wrapping).
- A **spam** button that fires many notifications quickly to test queue, cap, stacking, and FLIP live.
- Feeds `store.show()` directly (dev bridge), exactly like the chat's mock — no NUI needed in the browser.

## Prod wiring (`views/NotificationView.vue`)

- Mounts `NotificationCenter` in a transparent, always-on layer.
- A `window` `message` listener maps `{ action: 'siku:notification:show', notification }` → `store.show(notification)` and `{ action: 'siku:notification:clear', position? }` → `store.clear(position)`.
- `App.vue`: `NotificationView` renders in prod (`v-if="!isDevelopment"`); the dev panel is reached through the boilerplate view registry in dev.

## Verification

- Iterate visually in the dev control panel; screenshot the main cases (each layout combination, both image modes, all 9 positions, queue/cap under spam, progress recede, enter/leave/FLIP).
- `bun run type-check`, `bun run build-only`, `bun run lint` all green.
- CI (`syntax`, `manifest`, `guard`) green on push.

## Resolved decisions

- Increment scope: web view only; Lua/API/networking is the next spec.
- Dev preview: interactive control panel.
- Architecture: Pinia store manager + presentational card.
- Min-width ~300px, max-width ~380px.
- Stack directions: top down, bottom up, center-row centered-as-a-group growing downward.
- Soft cap: 5 visible per position, FIFO overflow.
- Progress indicator: receding-ice line in the bottom border, CSS-driven.
