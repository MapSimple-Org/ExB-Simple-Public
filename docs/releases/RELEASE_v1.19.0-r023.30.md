# Release v1.19.0-r023.30

**Release Date:** 2026-02-13  
**Experience Builder Version:** 1.19.0+

## Highlights

### Cross-Layer Selection Removal Fixes (r023.28-30)

This release fixes several issues with removing records from accumulated results when working with multiple layers.

**r023.28 - Native selection clearing on single-item removal**
- Fixed: When removing a record via the X button after using "Select on Map", the blue outline now clears correctly
- Root cause: Composite key matching failed for records without `__queryConfigId`
- Solution: Falls back to simple recordId matching when composite key matching removes nothing

**r023.29 - Expand/collapse state preservation**
- Fixed: Expand/collapse state no longer resets when switching between New/Add/Remove modes
- Root cause: Component key changed based on resultsMode, forcing React remount
- Solution: Stable key that only changes on new query execution

**r023.30 - Cross-layer removal for accumulated results**
- Fixed: Native selection now clears correctly when removing records from non-current layers
- Root cause: Origin DS lookup fell back to single layer regardless of record source
- Solution: Records stamped with `__originDSId` attribute; lookup via DataSourceManager

### Results Mode UX Overhaul (r023.22-26)

- Redesigned mode selector as segmented control with per-mode colors
- Added logic summary bar confirming active mode behavior
- Visual differentiation: New (blue), Add (green), Remove (muted red)

### FeatureInfo DOM Leak Fix (r023.19-21)

- Fixed detached DOM accumulation from FeatureInfo component
- 82% reduction in detached div elements per cycle
- Added proper cleanup in componentWillUnmount

### Custom Template Mode (r023.18)

- New result display option: author Markdown templates with `{fieldName}` tokens
- Monospace editor with field picker
- Live preview panel

## Installation

Copy the widget folders to your Experience Builder installation:

```
your-extensions/widgets/
  query-simple/
  helper-simple/
  shared-code/
```

## Compatibility

- ArcGIS Experience Builder 1.19.0 or later
- Tested with ArcGIS Online and ArcGIS Enterprise

## Documentation

- [README](../../README.md) - Installation and configuration
- [CHANGELOG](../../CHANGELOG.md) - Full change history
