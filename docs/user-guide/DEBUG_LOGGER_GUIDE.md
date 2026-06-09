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
import { createDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createDebugLogger('MYWIDGET', [
  'FETCH',    // API/network calls
  'RENDER',   // UI rendering
  'AUTH',     // Authentication flow
  'CONFIG'    // Configuration loading
])
```

If your widget is standalone (no `shared-code` dependency), follow these steps:

**Step 1:** Create `your-widget/src/utils/debug-logger.ts` and paste in the full source from the [Standalone source](#standalone-source) section at the end of this guide. Then edit the `YOUR WIDGET CONFIGURATION` block at the bottom of it (your widget name and tags).

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
import { createDebugLogger } from 'widgets/shared-code/mapsimple-common'

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

## Widget-Specific Factory Functions

The shared `debug-logger.ts` exports factory functions for the MapSimple widget family. These are pre-configured with each widget's registered tags:

| Function | Widget | Tags |
|---|---|---|
| `createQuerySimpleDebugLogger()` | QuerySimple | HASH, SELECTION, SPATIAL, POPUP, REBIND, + 20 more |
| `createHelperSimpleDebugLogger()` | HelperSimple | HASH, HASH-EXEC, SELECTION, WIDGET-STATE, RESTORE |
| `createFeedSimpleDebugLogger()` | FeedSimple | FETCH, PARSE, RENDER, POLL, JOIN, FEED-LAYER, + 7 more |
| `createDebugLogger(name, features)` | Any widget | You define the tags |

If you're building a widget outside the MapSimple family, use `createDebugLogger()` or instantiate `DebugLogger` directly.

## File Locations

| File | Purpose |
|---|---|
| [Standalone source](#standalone-source) (in this guide) | **Drop-in for any widget** — copy the code block, edit the bottom, done |
| `docs/user-guide/DEBUG_LOGGER_GUIDE.md` | This guide |
| `shared-code/mapsimple-common/debug-logger.ts` | MapSimple internal — core class + widget-specific factories |
| `shared-code/mapsimple-common.ts` | MapSimple internal — barrel export |
| `feed-simple/src/utils/debug-logger.ts` | MapSimple internal — FS singleton via `createFeedSimpleDebugLogger()` |

---

## Standalone source

Copy this entire block into `your-widget/src/utils/debug-logger.ts`, then edit the
`YOUR WIDGET CONFIGURATION` block at the bottom (your widget name and tags). No npm dependencies.

```ts
/**
 * DebugLogger — URL-activated, feature-scoped debug logging for ExB custom widgets.
 *
 * A portable, zero-overhead logging utility that activates via URL parameters.
 * No code changes needed to toggle logging in dev, test, or production.
 *
 * SETUP:
 *   1. Copy this file into your widget (e.g., src/utils/debug-logger.ts)
 *   2. Edit the bottom of this file to set your widget name and tags
 *   3. Import and use: debugLogger.log('TAG', { key: 'value' })
 *   4. Activate in browser: add ?debug=TAG to your ExB URL
 *
 * URL ACTIVATION:
 *   ?debug=all           — Enable all registered tags
 *   ?debug=FETCH,RENDER  — Enable specific tags (comma-separated, case-insensitive)
 *   ?debug=false         — Explicitly disable all logging
 *   (no param)           — Logging disabled (zero overhead)
 *
 * FEATURES:
 *   - URL-driven: No code changes to toggle. Works in dev, test, prod.
 *   - Feature-scoped: Each tag isolates a subsystem. No firehose.
 *   - BUG level: Always logs via console.warn, even when debug=false.
 *   - ExB iframe-aware: Checks parent window for ?debug param.
 *   - Zero overhead: isEnabled() returns false immediately when no ?debug param.
 *   - Lazy init: URL params not parsed until first log() call.
 *   - No dependencies: Pure TypeScript, no npm packages.
 *
 * Full documentation: See the accompanying DEBUG_LOGGER_GUIDE.md file.
 */

// ── Types ────────────────────────────────────────────────────────

/** Feature tag type — any uppercase string is valid */
export type DebugFeature = string

export interface DebugLoggerOptions {
  /** Display name for log prefixes (e.g., 'MYWIDGET') */
  widgetName: string
  /** Registered feature tags — used for ?debug=all enumeration */
  features: string[]
}

// ── DebugLogger Class ────────────────────────────────────────────

export class DebugLogger {
  private enabledFeatures: Set<DebugFeature> = new Set()
  private initialized = false
  private widgetName: string
  private features: DebugFeature[]

  constructor (options: DebugLoggerOptions) {
    this.widgetName = options.widgetName
    this.features = options.features
  }

  /**
   * Parse ?debug= from the URL on first use.
   * Checks both the current window and the parent window (for ExB iframes).
   */
  private initialize (): void {
    if (this.initialized) return

    // Check URL parameters (both current window and parent for iframes)
    let urlParams = new URLSearchParams(window.location.search)
    let debugValue = urlParams.get('debug')

    // If not found in current window, check parent (needed for ExB iframes).
    // ExB renders widgets inside iframes, so ?debug= is on the parent URL.
    if (debugValue === null && window.parent !== window) {
      try {
        urlParams = new URLSearchParams(window.parent.location.search)
        debugValue = urlParams.get('debug')
      } catch (e) {
        // Cross-origin restriction may prevent access to parent location.
        // This is normal when the ExB host and widget preview are on different origins.
      }
    }

    if (debugValue === 'false') {
      // Explicitly disabled
      this.initialized = true
      return
    }

    if (debugValue === 'all') {
      // Enable all registered features
      this.features.forEach(feature => {
        if (feature !== 'all' && feature !== 'false') {
          this.enabledFeatures.add(feature)
        }
      })
      console.log(`[${this.widgetName}-DEBUG] Enabled ALL features:`, Array.from(this.enabledFeatures))
    } else if (debugValue !== null) {
      // Parse comma-separated feature list (case-insensitive)
      const requestedFeatures = debugValue.split(',').map(f => f.trim().toUpperCase() as DebugFeature)
      requestedFeatures.forEach(feature => {
        if (feature === 'ALL') {
          this.features.forEach(f => {
            if (f !== 'all' && f !== 'false') {
              this.enabledFeatures.add(f)
            }
          })
        } else if (this.features.includes(feature)) {
          this.enabledFeatures.add(feature)
        }
        // Note: tags NOT in the features array are silently ignored.
        // If you see no output, verify the tag is registered in your features array.
      })
    }

    this.initialized = true
  }

  /**
   * Check if a feature tag is currently enabled.
   * BUG level always returns true, regardless of URL params.
   */
  private isEnabled (feature: DebugFeature): boolean {
    this.initialize()

    // BUG level always enabled — bypasses all debug switches
    if (feature === 'BUG') {
      return true
    }

    return this.enabledFeatures.has(feature)
  }

  /**
   * Log structured data if the feature tag is enabled.
   *
   * @param feature - Tag name (must be registered in features array, or 'BUG')
   * @param data - Any data to log (serialized as JSON)
   *
   * BUG level: Always logs via console.warn, even with ?debug=false.
   * Use for known issues that should always surface. Include bugId, category,
   * and description fields for consistency.
   */
  log (feature: DebugFeature, data: any): void {
    // BUG level always logs, even if debug=false
    if (feature === 'BUG') {
      const logData = {
        feature: 'BUG',
        bugId: data.bugId || 'UNKNOWN',
        category: data.category || 'GENERAL',
        timestamp: new Date().toISOString(),
        ...data
      }

      console.warn(`[${this.widgetName.toUpperCase()} ⚠️ BUG]`, JSON.stringify(logData, null, 2))
      return
    }

    // Regular feature logging — only logs when tag is enabled via ?debug=
    if (!this.isEnabled(feature)) {
      return
    }

    const logData = {
      feature,
      timestamp: new Date().toISOString(),
      ...data
    }

    console.log(`[${this.widgetName.toUpperCase()}-${feature}]`, JSON.stringify(logData, null, 2))
  }

  /**
   * Returns the current debug configuration.
   * Useful for diagnostic output or status displays.
   *
   * @returns enabledFeatures (active tags) and debugValue (raw URL param, or null)
   */
  getConfig (): { enabledFeatures: string[], debugValue: string | null } {
    this.initialize()

    // Check current window first, then parent (same iframe logic as initialize())
    let debugValue = new URLSearchParams(window.location.search).get('debug')
    if (debugValue === null && window.parent !== window) {
      try {
        debugValue = new URLSearchParams(window.parent.location.search).get('debug')
      } catch (e) {
        // Cross-origin — parent not accessible
      }
    }

    return {
      enabledFeatures: Array.from(this.enabledFeatures),
      debugValue
    }
  }
}

// ── Factory Function ─────────────────────────────────────────────

/**
 * Creates a DebugLogger instance for any custom widget.
 *
 * @param widgetName - Display name for log prefixes (e.g., 'MYWIDGET')
 * @param features - Array of feature tags to register
 * @returns A configured DebugLogger instance
 *
 * @example
 * const debugLogger = createDebugLogger('MYWIDGET', ['FETCH', 'RENDER', 'CONFIG'])
 * debugLogger.log('FETCH', { action: 'start', url: '...' })
 */
export function createDebugLogger (widgetName: string, features: string[]): DebugLogger {
  return new DebugLogger({ widgetName, features })
}

// ══════════════════════════════════════════════════════════════════
// YOUR WIDGET CONFIGURATION — Edit the section below
// ══════════════════════════════════════════════════════════════════

/**
 * Create your widget's logger instance here.
 * Replace 'MYWIDGET' with your widget name and update the tags array
 * with the subsystems you want to debug.
 *
 * Then import this in any file:
 *   import { debugLogger } from '../utils/debug-logger'
 *   debugLogger.log('FETCH', { action: 'request', url })
 */
export const debugLogger = createDebugLogger('MYWIDGET', [
  'FETCH',      // API/network calls
  'RENDER',     // UI rendering, template processing
  'CONFIG',     // Settings load, config validation
  'MAP',        // Map view interactions, layer operations
  'SELECTION',  // Record selection, highlighting
  'LIFECYCLE'   // Widget open/close, visibility changes
  // Add your own tags here — they appear in the URL as ?debug=TAG
  // Note: 'BUG' is always available without registration.
  // Use debugLogger.log('BUG', { bugId: 'BUG-001', ... }) for known issues
  // that should always surface, even when ?debug is not set.
])
```
