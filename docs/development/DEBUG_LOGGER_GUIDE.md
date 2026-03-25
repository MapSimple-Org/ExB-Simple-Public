# DebugLogger — URL-Activated Debug Logging for ExB Custom Widgets

A portable, zero-overhead debug logging utility for ArcGIS Experience Builder custom widgets. Activates via URL parameters — no code changes needed to toggle logging in development, testing, or production.

## Why This Exists

Custom ExB widgets are hard to debug. `console.log()` scattered through code creates noise, leaks into production, and forces code changes to toggle. The DebugLogger solves this:

- **URL-driven** — `?debug=FETCH,RENDER` in the browser URL. No rebuilds.
- **Feature-scoped** — Each tag isolates a subsystem. See only what you're investigating.
- **Zero overhead** — If `?debug` isn't in the URL, nothing logs. No performance cost.
- **BUG level** — Critical issues always surface via `console.warn`, even with `?debug=false`.
- **ExB iframe-aware** — Checks the parent window for the `?debug` param since ExB runs widgets in iframes.

## Quick Start

### 1. Add to Your Widget

If your widget already uses `shared-code/`, import the factory:

```ts
import { createDebugLogger } from '../utils/debug-logger'

const debugLogger = createDebugLogger('MYWIDGET', [
  'FETCH',    // API/network calls
  'RENDER',   // UI rendering
  'AUTH',     // Authentication flow
  'CONFIG'    // Configuration loading
])
```

If your widget is standalone (no `shared-code` dependency), follow these steps:

**Step 1:** Copy the standalone file into your widget:

- **Source:** `docs/development/debug-logger-standalone.ts` (this repo)
- **Destination:** `your-widget/src/utils/debug-logger.ts`

```text
your-widget/
  src/
    utils/
      debug-logger.ts    <-- copy here
    runtime/
      widget.tsx
```

The file is ready to use as-is — no cleanup or deletions needed. It contains the `DebugLogger` class, the `createDebugLogger()` factory, and a pre-configured example instance at the bottom. Zero external dependencies. Requires TypeScript with ES2015+ target (for `Set`).

**Step 2:** Open the copied file and edit the bottom section labeled **"YOUR WIDGET CONFIGURATION"**. Replace the widget name and tags with your own:

```ts
// Already in the file — just edit these values:
export const debugLogger = createDebugLogger('MYWIDGET', [
  'FETCH',      // API/network calls
  'RENDER',     // UI rendering
  'CONFIG',     // Settings load
  'MAP',        // Map interactions
  'SELECTION',  // Record selection
  'LIFECYCLE'   // Widget open/close
])
```

**Step 3:** Import and use in any file that needs logging:

```ts
// runtime/widget.tsx
import { debugLogger } from '../utils/debug-logger'

debugLogger.log('RENDER', { action: 'mount', widgetId: this.props.id })
```

```ts
// utils/api-client.ts
import { debugLogger } from './debug-logger'

debugLogger.log('FETCH', { action: 'request', url })
```

That's it. No build config changes, no package installs, no wiring. The logger reads `?debug=` from the URL on first use.

### 2. Use It

Replace every `console.log()` with a tagged log call:

```ts
// Before (bad — always logs, no context, no toggle)
console.log('fetching data', url)

// After (good — only logs when ?debug=FETCH is in the URL)
debugLogger.log('FETCH', { action: 'start', url, timestamp: Date.now() })
```

### 3. Activate in Browser

| URL Parameter | Effect |
|---|---|
| `?debug=all` | Enable all registered tags |
| `?debug=FETCH` | Enable one tag |
| `?debug=FETCH,RENDER,AUTH` | Enable multiple tags (comma-separated) |
| `?debug=false` | Explicitly disable all logging |
| _(no param)_ | Logging disabled (default) |

Tags are **case-insensitive** — `?debug=fetch` works the same as `?debug=FETCH`.

**Important — ExB iframe behavior:** Experience Builder renders widgets inside iframes. When you add `?debug=FETCH` to the browser URL, you're adding it to the **parent** ExB page, not the iframe. The DebugLogger handles this automatically — it checks `window.location` first, then falls back to `window.parent.location` (wrapped in a try/catch for cross-origin safety). You do not need to modify the iframe URL directly. Just add `?debug=` to the main ExB URL in your browser's address bar.

When using `?debug=all`, the logger will also emit a diagnostic line listing all enabled tags:
```
[MYWIDGET-DEBUG] Enabled ALL features: ['FETCH', 'RENDER', 'CONFIG', 'MAP']
```

## Console Output

When enabled, logs appear as structured JSON with a prefixed tag:

```
[MYWIDGET-FETCH] {
  "feature": "FETCH",
  "timestamp": "2026-03-25T10:30:00.000Z",
  "action": "start",
  "url": "https://services.arcgis.com/..."
}
```

BUG-level logs use `console.warn` with a distinct format:

```
[MYWIDGET ⚠️ BUG] {
  "feature": "BUG",
  "bugId": "BUG-042",
  "category": "RENDER",
  "timestamp": "2026-03-25T10:30:00.000Z",
  "description": "Card height exceeds container"
}
```

## API Reference

### `createDebugLogger(widgetName, features)`

Creates a new DebugLogger instance.

| Parameter | Type | Description |
|---|---|---|
| `widgetName` | `string` | Prefix for log output (e.g., `'MYWIDGET'`) |
| `features` | `string[]` | Registered feature tags for `?debug=all` enumeration |

Returns a `DebugLogger` instance.

### `debugLogger.log(feature, data)`

Logs structured data if the feature tag is enabled.

| Parameter | Type | Description |
|---|---|---|
| `feature` | `string` | Tag name (e.g., `'FETCH'`, `'RENDER'`, `'BUG'`). Must be registered in the `features` array, or it will be silently ignored. |
| `data` | `any` | Data to log (serialized as JSON). Typically an object, but strings and primitives are also accepted. |

**Special behavior for `'BUG'`**: Always logs via `console.warn`, even when `?debug=false`. Use for known issues that should always surface. Include `bugId`, `category`, and `description` fields.

### `debugLogger.getConfig()`

Returns the current debug configuration. Useful for displaying the current debug state in a status bar or diagnostic output.

```ts
const config = debugLogger.getConfig()
// { enabledFeatures: ['FETCH', 'RENDER'], debugValue: 'FETCH,RENDER' }
// debugValue is null when no ?debug param is present
```

| Property | Type | Description |
|---|---|---|
| `enabledFeatures` | `string[]` | Currently active feature tags |
| `debugValue` | `string \| null` | Raw `?debug=` value from URL, or `null` if not set |

## Design Patterns

### Singleton Per Widget

Create one logger instance per widget, shared across all modules:

```ts
// utils/debug-logger.ts
import { createDebugLogger } from '../utils/debug-logger'

export const debugLogger = createDebugLogger('MYWIDGET', [
  'FETCH', 'RENDER', 'CONFIG', 'AUTH'
])

// runtime/widget.tsx
import { debugLogger } from '../utils/debug-logger'
debugLogger.log('RENDER', { action: 'mount', widgetId: props.id })

// utils/api-client.ts
import { debugLogger } from './debug-logger'
debugLogger.log('FETCH', { action: 'request', url })
```

### Tag Naming Conventions

| Pattern | Use For | Examples |
|---|---|---|
| Noun | Subsystem | `FETCH`, `RENDER`, `CONFIG`, `AUTH` |
| Noun-NOUN | Sub-feature | `HASH-EXEC`, `FEED-LAYER`, `DARK-MODE` |
| BUG | Known issues | Always use `BUG` — it bypasses the debug switch |

Keep tags **short** and **uppercase**. They appear in the URL and in console output.

### Recommended Tags for Common ExB Patterns

| Tag | What to Log |
|---|---|
| `CONFIG` | Settings load, config validation, migration |
| `RENDER` | Component mount/unmount, template rendering, card display |
| `FETCH` | Network requests, responses, errors |
| `SELECTION` | Record selection, highlight, deselection |
| `MAP` | Map view interactions, layer operations, popups |
| `DARK-MODE` | Theme mode detection and switching |
| `LIFECYCLE` | Widget open/close, visibility changes |

### BUG Level — Always-On Alerting

Use `BUG` for conditions that indicate a known issue, even in production:

```ts
debugLogger.log('BUG', {
  bugId: 'BUG-007',
  category: 'SELECTION',
  description: 'Selected record ID not found in output DS',
  recordId: dataId,
  outputDsId: ds.id
})
```

This logs via `console.warn` regardless of the `?debug` parameter. Use it for:
- Race conditions you've identified but can't fully prevent
- Fallback paths that shouldn't normally execute
- Data integrity violations

## How It Works Internally

1. **Lazy initialization** — URL params aren't parsed until the first `log()` call.
2. **Feature set** — Parsed features stored in a `Set<string>` for O(1) lookup.
3. **ExB iframe detection** — If `window.location` doesn't have `?debug`, checks `window.parent.location` (wrapped in try/catch for cross-origin safety).
4. **BUG bypass** — `isEnabled('BUG')` returns `true` unconditionally, skipping the URL check entirely.
5. **No external dependencies** — Pure TypeScript, no imports beyond native browser APIs.

## Integration with ExB DevTools

The logger works alongside ExB's built-in debugging:

- ExB's `?locale=ar` for RTL testing + `?debug=RENDER` for render logging
- ExB's `?draft=true` for draft mode + `?debug=CONFIG` for config inspection
- Multiple params combine: `?debug=FETCH,RENDER&locale=en`

## Troubleshooting

### I added `?debug=FETCH` but nothing logs

1. **Is the tag registered?** The tag must be in your `features` array when creating the logger. If you pass `?debug=FETCH` but your features array doesn't include `'FETCH'`, the tag is silently ignored. Check spelling — `'FETCH'` and `'Fetch'` match (case-insensitive), but `'FTCH'` won't match `'FETCH'`.

2. **Is the logger imported?** Make sure the file where you call `debugLogger.log('FETCH', ...)` actually imports the logger instance. A missing import means the call never executes.

3. **Are you on the right URL?** Add `?debug=FETCH` to the ExB builder URL (the parent page), not to the iframe URL. The logger checks both automatically, but if you're navigating directly to an iframe URL, it may work differently.

4. **Is ExB caching?** Hard refresh with Ctrl+Shift+R (Cmd+Shift+R on Mac) to bypass the browser cache. ExB's dev server can serve stale JavaScript.

### Logs appear for some tags but not others

Each tag must be in the `features` array. If you added a new tag in code but forgot to register it, `?debug=all` will not include it. Open `debug-logger.ts` and verify the tag appears in the `features` array.

### BUG logs appear even with `?debug=false`

This is by design. The `BUG` level bypasses all debug switches, including explicit `?debug=false`. BUG logs use `console.warn` so they stand out in the console. If you don't want them, remove the `debugLogger.log('BUG', ...)` call from your code.

### I see `[MYWIDGET-DEBUG] Enabled ALL features:` but no other logs

This means `?debug=all` is working, but no code path has executed a `debugLogger.log()` call yet. Interact with the widget to trigger the relevant code paths.

## Performance Considerations

When debug is **off** (no `?debug` param), the logger is effectively zero-cost — `isEnabled()` returns `false` after a one-time URL parse, and the `log()` call returns immediately without serializing data.

When debug is **on**, each `log()` call runs `JSON.stringify()` on the data object. For most use cases this is negligible. However, avoid placing `debugLogger.log()` inside hot paths that execute many times per second (e.g., animation frames, scroll handlers, per-pixel render loops). If you need logging in a hot path, guard it:

```ts
// Hot path — only log every 100th iteration
if (i % 100 === 0) {
  debugLogger.log('RENDER', { iteration: i, fps: currentFps })
}
```

## File Locations

| File | Purpose |
|---|---|
| `docs/development/debug-logger-standalone.ts` | **Drop-in file for any widget** — copy this, edit the bottom, done |
| `docs/development/DEBUG_LOGGER_GUIDE.md` | This guide |
