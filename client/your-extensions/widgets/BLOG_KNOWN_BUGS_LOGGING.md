# Known Bugs: Always Visible, Never Hidden

**Status:** ✅ Complete  
**Date:** December 2024  
**Widget:** QuerySimple for ArcGIS Experience Builder  
**Version:** v1.19.0-r018.21

---

## The Problem

You're debugging a widget. Something isn't working. You check the console. Nothing. You enable debug logging. Still nothing. You start wondering: "Is this something I broke? Did I configure it wrong? Is this a framework issue?"

Turns out, it's a **known bug** that was documented months ago, but you had no way of knowing that without digging through bug trackers or asking the original developer.

## The Solution: Bug-Level Logging

We've added a special **BUG** logging level that always writes to the console, regardless of debug switches. When you encounter a known issue, you'll see:

```
[QUERYSIMPLE ⚠️ BUG] {
  "bugId": "BUG-GRAPHICS-001",
  "category": "GRAPHICS",
  "event": "zoom-operation-failed-graphics-layer-disabled",
  "description": "Zoom operation attempted but mapView is unavailable because useGraphicsLayerForHighlight is disabled",
  "workaround": "Enable useGraphicsLayerForHighlight in widget settings",
  "targetResolution": "r019.0"
}
```

No more head-scratching. No more wasted debugging time. You know immediately: "This is a known issue, here's the workaround, and here's when it'll be fixed."

## How It Works

### Always Visible

Unlike regular debug logs that require `?debug=FEATURE`, bug logs appear automatically:

- ✅ Works even with `?debug=false`
- ✅ Works with no debug parameter at all
- ✅ Uses `console.warn()` so it stands out (yellow/orange in most browsers)
- ✅ Includes emoji (⚠️) for quick visual identification

### Structured Information

Each bug log includes:

- **bugId**: Unique identifier like `BUG-GRAPHICS-001` for easy tracking
- **category**: Bug type (SELECTION, UI, URL, DATA, GRAPHICS, PERFORMANCE, GENERAL)
- **description**: Clear explanation of what's happening
- **workaround**: How to avoid or work around the issue
- **targetResolution**: When the bug will be fixed (e.g., `r019.0`)

### Professional Tracking

Bug IDs make it easy to:
- Reference bugs in code comments
- Track which bugs are fixed vs. still present
- Search for specific bugs
- Document bugs in `BUGS.md` with resolution notes

## Example: Bug in Action

Let's say you're testing the widget with graphics layer disabled (`useGraphicsLayerForHighlight: false`). You click a result item expecting it to zoom to the feature. Nothing happens.

Instead of wondering what went wrong, you see:

```
[QUERYSIMPLE ⚠️ BUG] {
  "bugId": "BUG-GRAPHICS-001",
  "category": "GRAPHICS",
  "event": "zoom-operation-failed-graphics-layer-disabled",
  "widgetId": "widget_12",
  "operation": "result-item-click-zoom",
  "recordId": "451377",
  "description": "Zoom operation attempted on result item click but mapView is unavailable because useGraphicsLayerForHighlight is disabled",
  "workaround": "Enable useGraphicsLayerForHighlight in widget settings",
  "targetResolution": "r019.0"
}
```

**Ah.** It's a known bug. The workaround is right there. And you know it'll be fixed in r019.0. No wasted time.

## Bug Categories

Bugs are categorized for easier tracking:

- **SELECTION**: Issues related to record selection, map highlighting, or selection restoration
- **UI**: User interface issues (buttons, tabs, expand/collapse, etc.)
- **URL**: Deep linking, hash parameters, query string parameters
- **DATA**: Data source issues, query execution, record handling
- **GRAPHICS**: Graphics layer highlighting issues
- **PERFORMANCE**: Performance-related issues
- **GENERAL**: Other issues that don't fit into above categories

## Current Known Bugs

See `query-simple/BUGS.md` for a complete list. As of r018.21:

- **BUG-GRAPHICS-001**: Zoom operations fail when graphics layer is disabled (Target: r019.0)

## Why This Matters

### For Developers

- **No wasted debugging time**: Know immediately if something is a known issue
- **Clear workarounds**: Don't have to hunt through documentation
- **Resolution timeline**: Know when to expect a fix

### For Users

- **Transparency**: Know when something is a bug vs. a configuration issue
- **Workarounds**: Get immediate guidance on how to proceed
- **Confidence**: Understand that issues are tracked and will be resolved

## Implementation Details

Bug logging is implemented in `shared-code/common/debug-logger.ts`. The `BUG` feature:

1. Always returns `true` in `isEnabled()` check (even if `debug=false`)
2. Uses `console.warn()` instead of `console.log()` for visibility
3. Includes emoji formatting: `[QUERYSIMPLE ⚠️ BUG]`
4. Requires `bugId` and `category` fields (defaults to 'UNKNOWN' and 'GENERAL' if not provided)

### Usage in Code

```typescript
debugLogger.log('BUG', {
  bugId: 'BUG-GRAPHICS-001',
  category: 'GRAPHICS',
  event: 'zoom-operation-failed-graphics-layer-disabled',
  widgetId: this.props.id,
  operation: 'result-item-click-zoom',
  description: 'Zoom operation attempted but mapView is unavailable',
  workaround: 'Enable useGraphicsLayerForHighlight in widget settings',
  targetResolution: 'r019.0'
})
```

## The Philosophy

Some code goes out the door with bugs. That's reality. But developers shouldn't bang their heads against the wall thinking they're doing something wrong when they encounter a known issue.

**Known bugs should be visible.** Not hidden. Not buried in documentation. Right there in the console, where developers are already looking.

---

## Related Documentation

- `query-simple/BUGS.md` - Complete bug tracking and resolution history
- `README.md` - Debug system overview
- `shared-code/common/debug-logger.ts` - Implementation details





