# siku_notification

The official notification system of the SIKU ecosystem — a modern, modular and high-performance resource delivering immersive, consistent, and seamlessly integrated player notifications.

![Version](https://img.shields.io/badge/version-1.0.0-4785bd)
![FiveM](https://img.shields.io/badge/fx__version-cerulean-4785bd)
![Lua](https://img.shields.io/badge/Lua-5.4-4785bd)
![Vue](https://img.shields.io/badge/NUI-Vue%203-4785bd)

## Features

- **Ice Glass interface** — a Vue 3 NUI following the SIKU art direction: no blur, glacier palette, thin luminous borders, frozen-glass panels.
- **5 notification types** — `default`, `success`, `warning`, `error`, `info` — each with its own accent and default icon.
- **Rich content** — title, subtitle, description, icon, and an optional image rendered as a side thumbnail or as the card background.
- **9 screen positions**, each with its own stack and enter/leave/reorder animations.
- **Guaranteed delivery** — up to 5 visible notifications per position; the overflow waits in a FIFO queue and is promoted as soon as a slot frees. Every notification expires (durations are strictly positive and clamped), so the queue can never stall.
- **CSS progress line** — the remaining lifetime melts away, zero JavaScript per frame.
- **Lean bundle** — ~500 KB of NUI assets, with tree-shaken SVG icons instead of icon fonts.
- **i18n pipeline** — the server language is pushed to the NUI at runtime.

## Dependencies

| Resource | Required | Purpose |
|---|---|---|
| [`siku_core`](https://github.com/siku-project/siku_core) | Yes | Framework core: dependency guard, version check, and the `Siku.Notification` proxy other resources call. |

`siku_core` must be started **before** `siku_notification`.

## Installation

### From a release (recommended)

Download the latest [release](https://github.com/siku-project/siku_notification/releases) zip and extract it into your server resources folder. The zip ships with the NUI **already built** (`web/dist` only) — no build step, ready to run.

> The release does not include the NUI source code. If you want to customize the interface, install from source instead.

### From source

The repository contains the full NUI source but **no build** (`web/dist` is not versioned) — you must build it yourself:

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
| `config/notification.lua` | `maxVisiblePerPosition`, `defaultPosition`, `defaultDuration` |
| `config/translation.lua` | `language` (`fr` / `en`) |

## API

### Server exports

```lua
exports.siku_notification:show(source, {
  type = 'success',                  -- 'default' | 'success' | 'warning' | 'error' | 'info'
  title = 'Item received',           -- short heading
  subtitle = 'x1 First aid kit',     -- optional secondary line
  description = 'Added to your inventory.', -- optional body text
  icon = 'mdi-medical-bag',          -- optional, defaults to the type icon
  image = 'https://…/photo.jpg',     -- optional image
  imageMode = 'side',                -- 'side' (thumbnail) | 'background' (full card)
  position = 'top-right',            -- one of the 9 positions, defaults to config
  duration = 5000,                   -- ms, strictly positive, defaults to config
})

exports.siku_notification:hide(source)   -- clears every notification of the player
```

### Client exports

Same surface, scoped to the local player: `show(data)`, `hide()`.

### Through siku_core (recommended)

SIKU resources should not call the exports directly — `siku_core` proxies them with a
started-state guard and graceful degradation:

```lua
Siku.Notification(source, data)   -- server
Siku.Notification(data)           -- client
```

### Events

`siku:notification:show` and `siku:notification:hide` (server → client) mirror the export payloads.

### Positions

`top-left`, `top-center`, `top-right`, `center-left`, `center`, `center-right`, `bottom-left`, `bottom-center`, `bottom-right`.

### Icons

Icons are resolved from a curated SVG set (`web/src/utils/icons.ts`, tree-shaken from `@mdi/js`). An unknown name falls back to the default bell icon. Supporting a new icon is a one-line addition to the map, followed by a rebuild.

## Lifecycle

1. A call to `show` validates and normalizes the payload (type, position, duration, image mode).
2. If fewer than `maxVisiblePerPosition` notifications occupy the target position, the card mounts and its timer starts; otherwise it waits in that position's FIFO queue.
3. When a notification expires, the next queued one is promoted immediately — nothing is ever dropped.
4. `hide` clears the player's active notifications and queue at once.

## Translations

`translations/fr.lua` and `translations/en.lua` hold the player-facing strings. The active language (`config/translation.lua`) is loaded by the server and pushed to the NUI at runtime — no rebuild needed to switch.

## Development

The NUI lives in `web/` (Vue 3, Pinia, Tailwind, Vite — built with [bun](https://bun.sh)).

```bash
cd web
bun install
bun dev          # dev playground with a full notification control panel
bun run build    # production build → web/dist
bun run check    # format + type-check + lint
```

In development the app boots into a playground with a control panel covering every field, presets and a spam test; in production only the notification view ships.

```
siku_notification/
├── client/            # NUI bridge, exports, net event handlers
├── server/            # dependency guard, exports
├── shared/utils/      # locale loading
├── config/            # all configuration
├── translations/      # fr / en
├── docs/              # design specs
└── web/               # Vue 3 NUI
```

## Credits

Part of the [SIKU project](https://github.com/siku-project) — © Siku Studio.
