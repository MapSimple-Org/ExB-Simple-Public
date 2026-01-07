# R018 Chunks 1 & 2 Changelog

## r018.19 (December 23, 2025) - ROLLED BACK

**Status:** Rolled back due to selection bug

**Issue:** Records not selecting in data source when graphics layer highlighting is enabled. Graphics populate correctly, but `selectRecordsByIds` is called with empty arrays because filtering fails (records don't have `getDataSource()` attached).

**Preserved:** Chunks 1 & 2 code preserved in `preserved/r018-chunks/` directory.

---

## r018.18 (December 23, 2025)

**Changes:**
- Fixed trash icon size on Results tab header
- Fixed visibility tracking state updates
- Fixed selection restoration on panel open/close
- Fixed selection restoration when identify popup closes

**Bugs Fixed:**
- Trash icon was small (`size="s"`) - removed size prop
- Visibility state not updating correctly - fixed state update logic
- Selection not restoring when panel opens - fixed restore logic
- Selection not restoring when identify popup closes - fixed visibility check

---

## r018.17 (December 23, 2025)

**Changes:**
- Fixed `r.getDataSource is not a function` error
- Added optional chaining to `r.getDataSource?.()` calls

**Bugs Fixed:**
- Runtime error when records don't have `getDataSource()` method

---

## r018.16 (December 23, 2025)

**Changes:**
- Clean re-implementation of Chunks 1 & 2 after rollback to r017.48
- Converted hooks to utility classes for class component compatibility
- Integrated UrlConsumptionManager and WidgetVisibilityManager into widget.tsx

**Architecture:**
- Chunk 1: UrlConsumptionManager class for URL parameter handling
- Chunk 2: WidgetVisibilityManager class for visibility detection

---

## r018.15 (December 23, 2025)

**Changes:**
- Fixed SVG attribute errors (`Expected length, "sm"`)
- Fixed icon import errors

**Bugs Fixed:**
- Icon components using string `"sm"` instead of numeric size
- `require()` usage in common-components.tsx

---

## r018.14 (December 23, 2025)

**Changes:**
- Fixed multi-layer clearing bug
- Enhanced `clearSelectionInDataSources` to iterate over all origin data sources

**Bugs Fixed:**
- "Clear All" not removing graphics/selection for multi-layer results

---

## r018.13 (December 23, 2025)

**Changes:**
- Fixed Expand/Collapse button state persistence bug

**Bugs Fixed:**
- Button state flipping after single record removal

---

## r018.12 (December 23, 2025)

**Changes:**
- Rolled back Chunk 3 selection logic
- Fixed resurrection bug (manually deleted records reappearing)

**Bugs Fixed:**
- Records resurrecting after mode switch or new search

---

## r018.11 and earlier

**Status:** Initial Chunks 1, 2, and 3 implementation attempts

**Issues:**
- Chunk 3 introduced resurrection bug
- Selection logic became unstable
- Multiple bugs introduced during refactoring

---

**End of Changelog**




