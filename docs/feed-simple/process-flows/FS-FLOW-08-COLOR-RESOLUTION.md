# FS-FLOW-08: Color Resolution and Range Label Pipeline

## Overview

Describes the color resolution system that determines card background colors
from feed item values, supporting both exact string matching and numeric range
matching. Includes the virtual field enrichment that enables searching and
sorting by range labels.

**Key files:**
- `feed-simple/src/utils/color-resolver.ts` -- Color resolution + range label enrichment (~139 lines)
- `feed-simple/src/runtime/feed-card.tsx` -- Calls `resolveCardColor()` for card background
- `feed-simple/src/runtime/feed-controls.tsx` -- "Range label" sort option in dropdown
- `feed-simple/src/runtime/widget.tsx` -- Enrichment call + sort sentinel handling
- `feed-simple/src/config.ts` -- `RangeColorBreak` type, `colorMode` config field

---

## Color Resolution Flow

```
 FeedCard render                             <- feed-card.tsx
      |
      +-- resolveCardColor(item, config)     <- color-resolver.ts:29
          |
          +-- Guard: no statusField or       :31
          |   no item[statusField]
          |   → return 'transparent'
          |
          +-- colorMode === 'range'?         :35
          |   +-- YES → resolveRangeColor()
          |   +-- NO  → resolveExactColor()
```

### Exact Match (`colorMode = 'exact'`)

```
 resolveExactColor(value, colorMap)          <- color-resolver.ts:46
      |
      +-- Guard: no colorMap → null          :47
      +-- mapped = colorMap[value]           :48
      +-- No match → null                   :49
      +-- Ensure '#' prefix                  :50
      → '#FF0000'
```

### Range Match (`colorMode = 'range'`)

```
 resolveRangeColor(value, breaks)            <- color-resolver.ts:58
      |
      +-- findMatchingBreak(value, breaks)   :59
          |
          +-- Guard: no breaks → null        :68
          +-- parseFloat(value)              :70
          |   NaN → null
          |
          +-- For each break:               :73-79
              aboveMin: min === null OR num >= min
              belowMax: max === null OR num < max
              Both true → return break
          |
          +-- No match → null               :81
```

**Matching rule:** `min <= value < max` (lower-inclusive, upper-exclusive).
`null` bounds are treated as unbounded (-∞ or +∞).

### Example

```
Config: rangeColorBreaks = [
  { min: null, max: 2.5,  color: '#D9EAD3', label: 'Low' },
  { min: 2.5,  max: 5.0,  color: '#FFE0B2', label: 'Moderate' },
  { min: 5.0,  max: null, color: '#F4CCCC', label: 'Severe' }
]

Item: { magnitude: '3.7' }

Resolution:
  parseFloat('3.7') → 3.7
  Break 0: null <= 3.7 < 2.5 → false (3.7 >= 2.5)
  Break 1: 2.5 <= 3.7 < 5.0 → true ✓
  → '#FFE0B2' (Moderate)
```

---

## Range Label Enrichment

`enrichItemsWithRangeLabels()` adds virtual fields to feed items so that range
labels (e.g., "Low", "Moderate", "Severe") are available for search and sort
without modifying the source data structure.

### Virtual Fields

| Field | Constant | Value | Purpose |
|-------|----------|-------|---------|
| `__colorRangeLabel` | `RANGE_LABEL_FIELD` | Break label text (e.g., "Moderate") | Search target |
| `__colorRangeOrder` | `RANGE_ORDER_FIELD` | Break index as string (e.g., "1") | Sort ordering |

### Enrichment Flow

```
 getProcessedItems()                         <- widget.tsx
      |
      +-- enrichItemsWithRangeLabels(items, config)  <- color-resolver.ts:100
          |
          +-- Guard: colorMode !== 'range'?  :104
          |   → return items unchanged
          |
          +-- Guard: no breaks or no labels? :108-110
          |   → return items unchanged
          |
          +-- For each item:                 :112-135
              |
              +-- Get rawValue from statusField  :113
              |
              +-- No value?                  :114-118
              |   → label = '', order = breaks.length (last)
              |
              +-- Find matching break index  :120-126
              |   (same min/max logic as resolveRangeColor)
              |
              +-- Match found?               :128-130
              |   → label = breaks[idx].label
              |   → order = String(idx)
              |
              +-- No match?                  :131-133
                  → label = '', order = String(breaks.length)
```

**Sort ordering:** Uses the break's array index (0, 1, 2...) so items sort
in the order the user defined the breaks — not alphabetically. Unmatched items
sort last (`index = breaks.length`).

**In-place mutation:** Items are modified in-place for performance. The virtual
fields are added before the processing pipeline runs, so they're available to
both search and sort stages.

---

## Sort Dropdown Integration

```
 FeedControls                                <- feed-controls.tsx
      |
      +-- hasRangeLabels prop?
      |   (colorMode='range' && breaks have labels)
      |   +-- YES → show "Range label" option
      |   +-- NO  → hidden
      |
      +-- User selects "Range label"
      |   → sortField = '__rangeLabel__' (sentinel)
      |
      v
 getProcessedItems()                         <- widget.tsx
      |
      +-- rawSortField === '__rangeLabel__'?
      |   → effectiveSortField = RANGE_ORDER_FIELD
      |     ('__colorRangeOrder')
      |
      +-- Pipeline sorts by '__colorRangeOrder'
          (numeric string comparison: '0', '1', '2', ...)
```

The direction toggle (asc/desc) works with range label sort, allowing users
to reverse the range ordering.

---

## Search Integration

Range labels are automatically searchable because `enrichItemsWithRangeLabels()`
runs before the pipeline's `searchItems()` stage. When search is configured to
search all fields (default), `__colorRangeLabel` is included. Users can type
"Moderate" to filter to only items in the moderate range.

---

*Last updated: r002.030 (2026-03-14)*
