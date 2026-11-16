# siku_notification

The official notification system of the SIKU ecosystem: nine screen positions, a queue per position, merged repeats, images, and the `@siku/ui` design system shared with every SIKU resource.

![Version](https://img.shields.io/badge/version-2.0.0-4785bd)
![FiveM](https://img.shields.io/badge/fx__version-cerulean-4785bd)
![Lua](https://img.shields.io/badge/Lua-5.4-4785bd)
![Svelte](https://img.shields.io/badge/NUI-Svelte%205-4785bd)
![Design system](https://img.shields.io/badge/%40siku%2Fui-1.21.0-4785bd)

## Features

- **Design system cards** — every notification is the `Toast` of `@siku/ui`: tokens only, glacier accent for what is running, no blur, legible over the game.
- **5 types** — `default`, `success`, `warning`, `error`, `info`, each with its tone and default icon.
- **Rich content** — title, description, a value aligned on the right (`+1 250 $`, `×1`), any icon of the design system, and an optional image as a thumbnail or as the card background under a veil.
- **9 positions** inside the GTA safe zone, each with its own stack: the newest card is always nearest the screen edge.
- **Queue per position** — up to `maxVisiblePerPosition` cards at once, the overflow waits in order of arrival and a small counter says how many. Every notification expires, so a stack can never stall.
- **Merged repeats** — a notification identical to one on screen bumps a `×N` counter and restarts the timer instead of stacking the same card twice.
- **CSS timer** — the remaining lifetime melts away without any JavaScript per frame.
- **Ids** — `show` returns an id, `dismiss` removes one notification, on screen or still waiting.
- **Validation on both sides** — the Lua layer refuses what cannot be shown and logs why; the interface never trusts a payload.

## Dependencies

| Resource | Required | Purpose |
|---|---|---|
| [`siku_core`](https://github.com/siku-project/siku_core) ≥ 1.7.1 | Yes | Dependency guard, version check, logs, translations, and the `Siku.notification` proxy other resources call. |

`siku_core` must be started **before** `siku_notification`.

## Installation

### From a release (recommended)

Download the latest [release](https://github.com/siku-project/siku_notification/releases) zip and extract it into your resources folder. The zip ships with the interface **already built** (`web/dist` only), ready to run.

### From source

The repository holds the interface source but **no build** (`web/dist` is not versioned):

```bash
git clone git@github.com:siku-project/siku_notification.git
cd siku_notification/web
bun install
bun run build
```

### server.cfg

```cfg
ensure siku_core
ensure siku_notification
```

## Configuration

All options live in `config/` and are documented inline.

| File | Options |
|---|---|
| `config/notification.lua` | `maxVisiblePerPosition`, `defaultPosition`, `defaultDuration`, `maxDuration`, `coalesce` |
| `config/translation.lua` | `language` (`fr` / `en`) |

## API

### Payload

```lua
{
  type = 'success',                  -- 'default' | 'success' | 'warning' | 'error' | 'info'
  title = 'Objet reçu',              -- up to 64 characters; a lone description becomes the title
  description = 'Trousse de soin.',  -- up to 256 characters
  value = '×1',                      -- up to 32 characters, aligned on the right
  icon = 'medkit',                   -- an icon of @siku/ui, defaults to the icon of the type
  image = 'https://…/photo.webp',    -- https://, nui:// or data:image/
  imageMode = 'side',                -- 'side' (thumbnail) | 'background' (full card under a veil)
  position = 'top-right',            -- one of the 9 positions, defaults to the config
  duration = 5000,                   -- ms, strictly positive, capped by maxDuration
}
```

A title or a description is required. `subtitle` is still read as the old name of `value`; `center-left` and `center-right` as the old names of `left` and `right`.

### Server exports

```lua
local id = exports.siku_notification:show(source, payload) -- source or -1 for everyone
exports.siku_notification:dismiss(source, id)
exports.siku_notification:hide(source)                     -- everything, queue included
exports.siku_notification:hide(source, 'top-right')        -- one position
```

### Client exports

Same surface, scoped to the local player: `show(payload)`, `dismiss(id)`, `hide(position?)`.

### Through siku_core (recommended)

SIKU resources do not call the exports directly: `siku_core` proxies them with a started-state guard and graceful degradation.

```lua
Siku.notification.show(source, payload) -- server
Siku.notification.show(payload)         -- client
```

### Events

`siku_notification:client:show`, `siku_notification:client:dismiss` and `siku_notification:client:clear` (server → client) carry the normalized payload, an id, or a position.

### Positions

`top-left`, `top-center`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom-center`, `bottom-right`.

## Lifecycle

1. `show` validates and normalizes the payload (type, texts, icon, image, position, duration) and refuses what has nothing to show.
2. If the identical notification is already on screen at that position, it gains a `×N` counter and a fresh timer (`coalesce`).
3. If fewer than `maxVisiblePerPosition` cards occupy the position, the card mounts and its timer starts; otherwise it waits in that position's queue.
4. When a card expires or is dismissed, the next waiting one takes its place at once.
5. `hide` clears one position or every position, queue included.

## Logs

| Event | Level | When |
|---|---|---|
| `notification.rejected` | warn | An export was refused: `data.reason` is `target_invalid`, `invalid_payload`, `empty`, `id_invalid` or `position_invalid`, `data.resource` names the caller. |

## Translations

`translations/fr.lua` and `translations/en.lua` hold the interface strings in their `web` block. The active language (`config/translation.lua`) is pushed to the interface at runtime; `bun run locales` derives the Paraglide messages from the Lua files, which stay the only place a string is written.

## Development

The interface lives in `web/` (Svelte 5, `@siku/ui`, Tailwind, Paraglide, Vite, built with [bun](https://bun.sh)).

```bash
cd web
bun install
bun run dev          # playground with a simulation panel: presets, burst, every field
bun run check        # locales, format, type-check, lint
bun run test:unit    # vitest
bun run lint:siku    # design-system rules and doctor
bun run build        # production build → web/dist
```

In development the app boots into the playground; in production only the notification layer ships.

```
siku_notification/
├── client/            # siku_ui bridge, NUI transport, exports, net events
├── server/            # dependency guard, exports
├── shared/            # payload normalization shared by both sides
├── config/            # all configuration
├── translations/      # fr / en
└── web/               # Svelte 5 interface
```

## Credits

Part of the [SIKU project](https://github.com/siku-project) — © Siku Studio.
