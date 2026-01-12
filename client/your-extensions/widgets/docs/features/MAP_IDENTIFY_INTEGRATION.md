# Map Identify to QuerySimple Integration Plan

## Overview
Allow users to identify a feature on the map (using the native Map Popup or Feature Info widget) and add that feature directly into the QuerySimple (QS) results list. This bridges the gap between ad-hoc map exploration and structured query results management.

## Architecture

### 1. Data Action (`src/data-actions/add-to-qs.ts`)
- **Type**: `AbstractDataAction`
- **Purpose**: Captures identified records and dispatches a custom event with specific intent (ADD/REMOVE).
- **Logic**:
  - `isSupported`: Checks if the action should be visible in the popup menu.
    - **Condition A**: Features are present in the current identify result.
    - **Condition B**: At least one `QuerySimple` widget is currently **Open** (checked via Redux `widgetsRuntimeInfo`).
    - **Condition C**: The open widget has `allowMapIdentifyAdd` enabled in its configuration.
  - **Dynamic Labeling**:
    - The action checks if the identified feature(s) already exist in the target QS widget's `accumulatedRecords`.
    - Shows **"Add to QS Results"** if new.
    - Shows **"Remove from QS Results"** if already present (acts as a toggle).
  - `onExecute`: Dispatches `querysimple-external-action` custom event with:
    - `records`: The identified features.
    - `actionType`: `'ADD'` or `'REMOVE'`.

### 2. Widget Runtime (`src/runtime/widget.tsx`)
- **Event Listener**: Listen for `querysimple-external-action` on the `window` object.
- **Priority Filter**: 
  - Only process the event if `isPanelVisible` is true (prioritizes the active widget).
  - Only process if `config.allowMapIdentifyAdd` is enabled.
- **Mode Evolution (Anti-Data Loss)**:
  - If the widget is in `SelectionType.NewSelection` mode, it **automatically upgrades** to `SelectionType.AddToSelection` when an external "Add" occurs. This prevents the map click from accidentally wiping out the user's previous query results.
- **State Update**:
  - If `'ADD'`: Merges records into `accumulatedRecords`.
  - If `'REMOVE'`: Filters records out of `accumulatedRecords`.
  - Switch to the "Results" tab to provide immediate feedback.
  - Call `addSelectionToMap()` or `removeRecordsFromOriginSelections()` to sync the map highlights.

### 3. Configuration (`src/config.ts`)
- Add `allowMapIdentifyAdd: boolean` (default: `true`).

### 4. Settings UI (`src/setting/setting.tsx`)
- Add a new `SettingSection` or `SettingRow` with a `Switch` component.
- Label: "Allow adding features from map"
- Tooltip: "Enable adding features from map popups directly into your results list."

## User Workflow
1. User clicks a parcel on the map.
2. Native Map Popup opens.
3. User clicks "..." menu in popup.
4. User selects "Add to QuerySimple Results".
5. QS widget (if open) switches to Results tab, showing the new parcel added to the list.

## Multi-Widget Handling
- **Visibility Based**: Only the currently "Open" widget will accept the features.
- **Optional Layer Matching**: If multiple QS widgets are open, we can optionally add logic to check if the feature's Data Source matches any of the widget's configured Query Items.

## Release Target
- Potential for **r17** (next patch) or **r18** (feature release).

