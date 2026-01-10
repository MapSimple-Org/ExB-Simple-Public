# SQL Expression Builder - Feature Analysis for SimpleQEngine

**Purpose:** Document all features of Esri's `SqlExpressionRuntime` component to ensure feature parity if we build a replacement "SimpleQEngine" component.

**Sources:**
- [Query Widget Documentation](https://developers.arcgis.com/experience-builder/guide/query-widget/)
- [Filter Widget - SQL Expression Builder](https://developers.arcgis.com/experience-builder/guide/filter-widget/#sql-expression-builder)
- [Filter Widget - Operators](https://developers.arcgis.com/experience-builder/guide/filter-widget/#operators)

---

## Core Features

### 1. Expression Structure
- **General Form:** `<Field name> <operator> <Value or Field>`
- **Example:** `Shelter capacity is greater than 200`
- **Clause Building:** Click "Add clause" or "Add clause set"
- **Logical Grouping:** Support for AND/OR clause sets

### 2. Field Selection
The SQL Expression Builder supports three primary field types with visual indicators:

| Field Type | Icon Indicator | Notes |
|------------|---------------|-------|
| **Number** | Number icon | Integer, double, float, etc. |
| **String** | Text icon | Text, varchar, etc. |
| **Date** | Calendar icon | Date, datetime, timestamp |

**Special Field Types:**
- **GlobalID** - Only supports exact match queries (no `starts with`, `ends with`, `contains`)
- **GUID** - Only supports exact match queries (no pattern matching)

### 3. Operators by Field Type

#### Complete Operator Matrix

| Operator | Number | String | Date | Date Only | Time Only |
|----------|--------|--------|------|-----------|-----------|
| **is** | ✓ | ✓ | | | |
| **is not** | ✓ | ✓ | | | |
| **is at least** | ✓ | | | | |
| **is at most** | ✓ | | | | |
| **is less than** | ✓ | | | | |
| **is greater than** | ✓ | | | | |
| **is between** | ✓ | | ✓ | ✓ | ✓ |
| **is not between** | ✓ | | ✓ | ✓ | ✓ |
| **starts with** | | ✓ | | | |
| **does not start with** | | ✓ | | | |
| **ends with** | | ✓ | | | |
| **does not end with** | | ✓ | | | |
| **contains** | | ✓ | | | |
| **does not contain** | | ✓ | | | |
| **is any of** | ✓ | ✓ | | | |
| **is none of** | ✓ | ✓ | | | |
| **is on** | | | ✓ | ✓ | |
| **is not on** | | | ✓ | ✓ | |
| **is in** | | | ✓ | | |
| **is not in** | | | ✓ | | |
| **is before** | | | ✓ | ✓ | ✓ |
| **is after** | | | ✓ | ✓ | ✓ |
| **is before or equal to** | | | ✓ | ✓ | ✓ |
| **is after or equal to** | | | ✓ | ✓ | ✓ |
| **is in the last** | | | ✓ | | |
| **is not in the last** | | | ✓ | | |
| **is in the next** | | | ✓ | | |
| **is not in the next** | | | ✓ | | |
| **is blank** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **is not blank** | ✓ | ✓ | ✓ | ✓ | ✓ |

**Total Operators:** 30 unique operators across all field types

### 4. Value Source Types

The "Select source type" button provides multiple input methods:

| Source Type | Description | Use Case |
|------------|-------------|----------|
| **User Input** | Free-text entry | Manual value entry at runtime |
| **Field** | Select from layer fields | Compare two fields (e.g., `StartDate < EndDate`) |
| **Unique** | Dynamically generated list | Dropdown of unique values from the layer |
| **Unique (predefined)** | Pre-configured list | Designer sets specific values, preserves order |
| **Multiple** | Multi-select dynamically generated | Select multiple values at runtime |
| **Multiple (predefined)** | Pre-configured multi-select | Designer sets specific values |

**Value Sorting:**
- **Attribute fields:** Sort by value (ascending by default)
- **Domain fields:** Sort by label or domain value
- **Predefined unique:** Preserves configuration order

**Output Data Source Limitation:**
> **Note:** If you connect the filter to an [output data source](https://developers.arcgis.com/experience-builder/guide/filter-widget/#output-data-source), you can't choose the values for it in the settings (except for coded values). The list of values is dynamically generated at run time after the output data is created by the source widget. For this reason, **Ask for values** is checked by default and predefined values can only be typed in.

### 5. Interactive Features

#### Label Customization
- **Attribute Filter Label:** Customizable section header
- **Description:** Hover text on information icon for user guidance

#### Ask for Values
- **Runtime prompting:** Force user to provide values before executing query
- **Default behavior:** Checked by default for output data sources

#### Sorting
- Field-based sorting for results
- Configurable sort order

### 6. Group SQL Expression Builder

**Advanced Feature:** Mentioned in the documentation as a separate, more complex filtering option.

**Key Characteristics:**
- **Main Field:** Central field that sets operator/values for other fields
- **All Fields:** Multiple fields filtered simultaneously
- **Field Type Matching:** Only fields matching the main field's type can be included
- **Shared Operator:** One operator applied across all selected fields

**Configuration:**
- Main field selection
- Multi-field selection from data source
- Operator selection (based on main field type)
- Value input (same source type options as standard builder)

---

## Additional Capabilities

### 7. Clause Management
- **Add Clause:** Create individual filter conditions
- **Add Clause Set:** Group multiple clauses with AND/OR logic
- **Delete Clauses:** Remove unwanted conditions
- **Reorder Clauses:** Drag-and-drop support (likely)

### 8. Runtime Behavior

#### Dynamic Value Population
- Unique/Multiple source types generate dropdowns from actual layer data
- Values refresh when source data changes

#### Query Validation
- Field type validation (can't compare string to number)
- Operator availability based on field type
- GlobalID/GUID restrictions enforced

#### Output Data Source Integration
- Generated output DS can be used by other widgets
- Dynamic value lists for output DS connections

### 9. SQL Translation
- Builder generates valid SQL WHERE clauses
- Handles proper escaping for strings
- Date formatting handled automatically
- NULL handling for "is blank"/"is not blank"

---

## Current QuerySimple Implementation

### What We Use Now
Our widget uses `SqlExpressionRuntime` from `jimu-ui/advanced/sql-expression-runtime` for:
- **Attribute Query Input:** Text-based SQL expression entry
- **Field Picker:** Access to layer fields
- **Basic Operators:** Limited subset exposed to users

### What We DON'T Use (By Design)
We intentionally simplified Query widget functionality:
- ❌ No clause sets (AND/OR grouping)
- ❌ No "Select source type" dropdown (we use simple text input)
- ❌ No unique value dropdowns
- ❌ No multi-select predefined values
- ❌ No Group SQL Expression Builder

### Our Workaround for SqlExpressionRuntime
**Problem:** `SqlExpressionRuntime` is a black box that doesn't update its display when the `expression` prop changes after mounting.

**Solution:** DOM manipulation with `MutationObserver` + double `requestAnimationFrame` to:
1. Wait for the input field to render
2. Ensure React's event handlers are fully attached
3. Set the native input value
4. Trigger focus/blur to fire `onChange` naturally

**Documentation:** See `SQLEXPRESSION_RUNTIME_DOM_WORKAROUND.md`

---

## Recommendations for SimpleQEngine

### Phase 1: Core Feature Parity (Minimum Viable)
✅ **Must Have:**
1. Three field type support (Number, String, Date)
2. Complete operator matrix (30 operators)
3. User input value source
4. Field comparison value source
5. "is blank"/"is not blank" for NULL handling
6. Proper SQL generation with escaping
7. Visual field type indicators
8. GlobalID/GUID restrictions

### Phase 2: Enhanced Features
🔄 **Should Have:**
1. Unique value dropdown (dynamically generated)
2. Multiple value selection
3. Predefined value lists
4. Sort by value/label
5. "Ask for values" toggle
6. Label/description customization

### Phase 3: Advanced Features
🚀 **Nice to Have:**
1. Clause sets (AND/OR grouping)
2. Group SQL Expression Builder
3. Drag-and-drop clause reordering
4. Date-only and Time-only field types
5. Relative date operators ("in the last N days")

---

## Benefits of Building SimpleQEngine

### 1. No More DOM Manipulation
- Clean, testable React component
- Predictable prop-based updates
- No workarounds or hacks

### 2. Full Control
- Customize UI/UX for our audience
- Add MapSimple-specific features
- Better mobile responsiveness

### 3. Simplified Testing
- Unit testable with Jest
- E2E testable with Playwright
- No black-box behavior

### 4. Performance
- Lighter weight (no Esri overhead)
- Faster rendering
- Optimized for our use cases

### 5. Maintainability
- We own the code
- No dependency on Esri's internal changes
- Clear debugging path

---

## Risks & Considerations

### 1. Development Time
- Building 30 operators takes time
- SQL generation logic must be bulletproof
- Date handling is complex (timezones, formats)

### 2. Edge Cases
- GlobalID/GUID behavior must match exactly
- NULL handling must be consistent
- Special characters in strings (escaping)
- Domain fields vs. regular fields

### 3. Ongoing Maintenance
- We become responsible for SQL bugs
- Must keep up with ArcGIS Server SQL dialect changes
- Testing burden increases

### 4. Migration Path
- Need a feature flag to toggle old/new implementations
- Backward compatibility for existing configs
- User training if UI changes significantly

---

## Decision Framework

### Build SimpleQEngine IF:
- ✓ We're adding custom query features Esri doesn't support
- ✓ We need predictable prop updates for hash execution
- ✓ We want to own the user experience
- ✓ We have time for comprehensive testing

### Keep SqlExpressionRuntime IF:
- ✓ Current workaround is stable and tested
- ✓ We don't need features beyond basic text input
- ✓ We want Esri to handle SQL dialect changes
- ✓ We can live with the DOM manipulation hack

---

## Next Steps

1. **Review this analysis** with the team
2. **Decide on scope:** Phase 1 only, or include Phase 2?
3. **Create a design mockup** for SimpleQEngine UI
4. **Estimate development time:** Breaking change vs. incremental
5. **Plan feature flag strategy:** Allow toggling during migration
6. **Write test suite FIRST:** Unit tests for SQL generation, E2E for UI interactions

---

## References

- [Query Widget Documentation](https://developers.arcgis.com/experience-builder/guide/query-widget/)
- [Filter Widget - SQL Expression Builder](https://developers.arcgis.com/experience-builder/guide/filter-widget/#sql-expression-builder)
- [Filter Widget - Operators](https://developers.arcgis.com/experience-builder/guide/filter-widget/#operators)
- [Group SQL Expression Builder](https://developers.arcgis.com/experience-builder/guide/filter-widget/#group-sql-expression-builder)
- Our Implementation: `/query-simple/src/runtime/query-task-form.tsx`
- Our Workaround Doc: `/SQLEXPRESSION_RUNTIME_DOM_WORKAROUND.md`
