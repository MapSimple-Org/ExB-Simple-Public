# Release Notes: v1.19.0-r023.13

**Release Date**: January 25, 2026  
**Type**: Architecture + Bug Fixes + Settings Enhancement

---

## Overview

This release overhauls the selection architecture in QuerySimple. Automatic blue map outlines have been removed from all query execution paths. Blue outlines now only appear when the user explicitly clicks "Select on Map." The release also fixes several bugs related to panel close/reopen behavior and adds a settings validation warning for map widget configuration.

---

## Changes

### Selection Architecture (r023.5-9)

**Automatic blue outlines removed from:**
- Query execution (auto-select after results return)
- Cross-layer grouping loops (origin DS selection during result processing)
- Query switch reselection in Add/Remove mode (372-line block simplified to ~30 lines)
- Panel reopen restoration
- Popup close restoration

**Still active (explicit user actions):**
- "Select on Map" button
- Individual record click
- Remove (X) on individual records
- Clear All

### Bug Fixes (r023.10-12)

- **Blue outlines on panel reopen/popup close (r023.10):** Origin data source was incorrectly passed as the output data source parameter to the selection function, causing framework-level blue outline creation. Removed the origin DS loop from restoration entirely.
- **"Select on Map" outlines lost on panel close (r023.11):** Explicit user selections now persist when the widget panel closes.
- **Dirty URL hash after panel close (r023.12):** The `data_s` hash parameter is now cleaned independently of origin DS clearing.

### Settings Validation (r023.13)

- Red validation warning appears below the Map Widget selector when no map widget is configured. Message: "A map widget is required. Query results will not display on the map without one."

### UI Change (r023.7)

- "Add to map" action renamed to "Select on map" to reflect the new explicit selection model.

---

## Selection Behavior Reference

| Action | Purple Graphics | Blue Outlines | 
|---|---|---|
| Query execution | Yes | No (changed) |
| Query switch (Add/Remove) | Yes | No (changed) |
| Panel close then reopen | Restored | Preserved if set (changed) |
| Popup close | Restored | No (changed) |
| "Select on Map" (user click) | Yes | Yes |
| Record click | Yes | Yes |
| Remove X / Clear All | Cleared | Cleared |

---

## Known Issues

- **Intermittent hash query non-execution**: URL hash value populates in the textbox but query occasionally does not auto-execute. Timing race under investigation. Not related to selection changes.

---

## Upgrade Notes

- No configuration changes required. Existing widget configurations will work without modification.
- The "Add to map" data action label has been renamed to "Select on map." If you have custom translations referencing `addToMap`, update them to match.
- A map widget should be configured in Highlight Options for graphics to display. The new validation warning will indicate if this is missing.
