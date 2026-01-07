# Chunks 1 & 2 Integration Guide

Quick reference for re-integrating Chunks 1 & 2 into widget.tsx.

---

## File Locations

- **Chunk 1:** `query-simple/src/runtime/hooks/use-url-consumption.ts`
- **Chunk 2:** `query-simple/src/runtime/hooks/use-widget-visibility.ts`

---

## widget.tsx Changes Required

### 1. Add Imports (after line 17)

```typescript
import { UrlConsumptionManager } from './hooks/use-url-consumption'
import { WidgetVisibilityManager } from './hooks/use-widget-visibility'
```

### 2. Add Class Properties (after line 41)

```typescript
// Chunk 1 & 2: Managers for URL consumption and visibility
private urlConsumptionManager = new UrlConsumptionManager()
private visibilityManager = new WidgetVisibilityManager()
```

### 3. componentDidMount Integration

Add this code at the START of `componentDidMount()`:

```typescript
// Chunk 1: Set up URL parameter consumption
this.urlConsumptionManager.setup(
  this.props,
  this.state.resultsMode,
  {
    onInitialValueFound: (value) => {
      const needsModeReset = this.state.resultsMode !== SelectionType.NewSelection
      this.setState({ 
        initialQueryValue: value,
        ...(needsModeReset ? { 
          resultsMode: SelectionType.NewSelection,
          accumulatedRecords: []
        } : {})
      })
    },
    onModeResetNeeded: () => {
      this.setState({ 
        resultsMode: SelectionType.NewSelection,
        accumulatedRecords: []
      })
    }
  }
)

// Chunk 2: Set up visibility detection (wait for ref to be set)
setTimeout(() => {
  if (this.widgetRef.current) {
    this.visibilityManager.setup(
      this.widgetRef.current,
      this.props,
      {
        onVisibilityChange: (isVisible) => {
          this.setState(
            (prevState) => {
              if (prevState.isPanelVisible === isVisible) {
                return null
              }
              return { isPanelVisible: isVisible }
            },
            () => {
              this.logVisibilityChange(isVisible, 'visibility-manager')
            }
          )
        }
      },
      (isVisible) => {
        // Compatibility callback
      }
    )
  }
}, 100)

// Notify HelperSimple on mount
this.visibilityManager.notifyMount(this.props.id)
```

### 4. componentWillUnmount Integration

Add this code at the START of `componentWillUnmount()`:

```typescript
// Chunk 1: Clean up URL consumption
this.urlConsumptionManager.cleanup()

// Chunk 2: Clean up visibility detection
this.visibilityManager.cleanup()
this.visibilityManager.notifyUnmount(this.props.id)
```

### 5. componentDidUpdate Integration

Add this code in `componentDidUpdate()`:

```typescript
// Chunk 1: Re-check URL parameters when query items change
if (prevProps.config.queryItems !== this.props.config.queryItems) {
  this.urlConsumptionManager.checkUrlParameters(
    this.props,
    this.state.resultsMode,
    {
      onInitialValueFound: (value) => {
        const needsModeReset = this.state.resultsMode !== SelectionType.NewSelection
        this.setState({ 
          initialQueryValue: value,
          ...(needsModeReset ? { 
            resultsMode: SelectionType.NewSelection,
            accumulatedRecords: []
          } : {})
        })
      },
      onModeResetNeeded: () => {
        this.setState({ 
          resultsMode: SelectionType.NewSelection,
          accumulatedRecords: []
        })
      }
    }
  )
}
```

### 6. handleHashParameterUsed Method

Replace existing `handleHashParameterUsed` with:

```typescript
handleHashParameterUsed = (shortId: string) => {
  this.urlConsumptionManager.removeHashParameter(shortId, this.props.id)
}
```

### 7. logVisibilityChange Method

Ensure `logVisibilityChange` method exists and handles restore/clear logic (see preserved code for full implementation).

---

## Critical Fix Required Before Re-Implementation

**MUST FIX:** The selection bug in `selection-utils.ts` before re-implementing Chunks 1 & 2.

See `README.md` "Bugs Encountered" section for details and fix.

---

## Testing Checklist

After re-implementation, test:

- [ ] Hash parameter detection (`#shortId=value`)
- [ ] Query string detection (`?shortId=value`)
- [ ] Hash priority over query string
- [ ] Mode reset on hash detection
- [ ] Hash consumption on mode switch
- [ ] Panel open detection
- [ ] Panel close detection
- [ ] Selection restore on panel open
- [ ] Selection clear on panel close
- [ ] **CRITICAL:** Selection works with graphics layer enabled
- [ ] **CRITICAL:** "Add to Map" action selects records
- [ ] Identify popup restore when panel open
- [ ] Identify popup skip when panel closed

---

**End of Integration Guide**




