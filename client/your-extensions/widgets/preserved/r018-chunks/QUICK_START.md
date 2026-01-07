# Quick Start: Re-Implementing Chunks 1 & 2

## ⚠️ CRITICAL: Fix Selection Bug First

**DO NOT re-implement Chunks 1 & 2 until you fix the selection bug in `selection-utils.ts`.**

See `README.md` → "Bugs Encountered" → "Critical Bug: Selection Not Working with Graphics Layer"

---

## Quick Steps

1. **Fix Selection Bug** (see README.md for details)
2. **Copy Files:**
   ```bash
   cp preserved/r018-chunks/use-url-consumption.ts query-simple/src/runtime/hooks/
   cp preserved/r018-chunks/use-widget-visibility.ts query-simple/src/runtime/hooks/
   ```
3. **Follow Integration Guide:** See `INTEGRATION_GUIDE.md`
4. **Test Thoroughly:** See `INTEGRATION_GUIDE.md` → "Testing Checklist"

---

## Files to Reference

- **README.md** - Full documentation, bugs, lessons learned
- **INTEGRATION_GUIDE.md** - Step-by-step integration instructions
- **CHANGELOG.md** - Version history and changes
- **use-url-consumption.ts** - Chunk 1 source code
- **use-widget-visibility.ts** - Chunk 2 source code

---

## The Selection Bug Fix (Required Before Re-Implementation)

In `query-simple/src/runtime/selection-utils.ts`, around line 137-148:

**BEFORE (Broken):**
```typescript
const recordsForThisDS = records.filter(r => {
  const ds = r.getDataSource?.()
  const origin = ds?.getOriginDataSources()?.[0] || ds
  return origin?.id === originDS.id
})
const idsForThisDS = recordsForThisDS.map(r => r.getId())

originDS.selectRecordsByIds(idsForThisDS, recordsForThisDS) // ← Calls with [] if filtering fails
```

**AFTER (Fixed):**
```typescript
const recordsForThisDS = records.filter(r => {
  const ds = r.getDataSource?.()
  const origin = ds?.getOriginDataSources()?.[0] || ds
  return origin?.id === originDS.id
})
const idsForThisDS = recordsForThisDS.map(r => r.getId())

// FIX: Fall back to all recordIds if filtering fails
const finalIds = idsForThisDS.length > 0 ? idsForThisDS : recordIds
const finalRecords = recordsForThisDS.length > 0 ? recordsForThisDS : records

originDS.selectRecordsByIds(finalIds, finalRecords) // ← Always has records
```

---

**End of Quick Start**




