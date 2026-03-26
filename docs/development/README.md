# DebugLogger for ArcGIS Experience Builder Custom Widgets

A portable, zero-dependency debug logging utility for Experience Builder Developer Edition custom widgets. URL-activated, feature-scoped, and zero overhead when disabled.

## What's in this folder

| File | Description |
|------|-------------|
| `debug-logger-standalone.ts` | Drop-in TypeScript file. Copy into your widget, edit the bottom, import where needed. |
| `DEBUG_LOGGER_GUIDE.md` | Full implementation guide with examples, best practices, and troubleshooting. |

## Quick Start

**1. Copy** `debug-logger-standalone.ts` into your widget:

```
your-widget/
  src/
    utils/
      debug-logger.ts    <-- paste here
    runtime/
      widget.tsx
```

**2. Edit** the bottom of the file — set your widget name and tags:

```ts
export const debugLogger = createDebugLogger('MYWIDGET', [
  'FETCH',      // API/network calls
  'RENDER',     // UI rendering
  'CONFIG',     // Settings, configuration
  'MAP',        // Map interactions
  'SELECTION',  // Record selection
  'LIFECYCLE'   // Widget open/close
])
```

**3. Import** in any file that needs logging:

```ts
import { debugLogger } from '../utils/debug-logger'

debugLogger.log('FETCH', { action: 'request', url, status: 200 })
```

**4. Activate** in your browser — add `?debug=` to the URL:

```
https://your-exb-app.com/experience/1/?debug=FETCH
https://your-exb-app.com/experience/1/?debug=FETCH,RENDER
https://your-exb-app.com/experience/1/?debug=all
```

Open the browser console to see the output.

## Features

- **URL-driven** — No code changes to toggle. Works in dev, test, and production.
- **Feature-scoped** — Each tag isolates a subsystem. No firehose of unrelated logs.
- **BUG level** — Always logs via `console.warn`, even when `?debug` is not set. Use for known issues that should always surface.
- **ExB iframe-aware** — Automatically checks the parent window for `?debug=` (ExB renders widgets inside iframes).
- **Zero overhead** — When no `?debug` param is present, `log()` returns immediately. No string formatting, no console calls.
- **No dependencies** — Pure TypeScript. No npm packages required.

## BUG Level

The `BUG` tag is special — it always logs regardless of URL parameters. Use it for known issues you're investigating:

```ts
debugLogger.log('BUG', {
  bugId: 'BUG-042',
  category: 'SELECTION',
  description: 'Record deselects on second click'
})
```

This outputs via `console.warn` so it stands out in the console, even in production.

## Compatibility

- Experience Builder Developer Edition 1.19+
- TypeScript ES2015+ target
- Any custom widget (functional or class-based)

## Full Documentation

See [DEBUG_LOGGER_GUIDE.md](DEBUG_LOGGER_GUIDE.md) for:
- Detailed setup instructions
- Tag naming conventions
- Performance optimization patterns
- Troubleshooting guide
- Advanced usage (conditional logging, structured data, loops)

## License

MIT — use it however you like.
