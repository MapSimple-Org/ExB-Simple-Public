# QuerySimple Widget TODOs

## Bugs to Address (Presentation Discovery)

### 1. Expansion State Sticky on Hash Switch
**Status:** ✅ RESOLVED (r017.41)  
**Issue**: When switching between queries via URL hash (e.g., `#pin` to `#major`), the widget remembers the expansion state of the *previous* query instead of honoring the `resultExpandByDefault` config of the new query.
**Cause**: `QueryTaskResult` state persistence during rapid `configId` transitions.

### 2. "Dirty" Hash Switching
**Status:** ✅ RESOLVED (r017.41)  
**Issue**: Switching from one hash parameter to another (e.g., `#pin=123` to `#pin=456` or `#major=789`) sometimes "remembers" the first query's value or fails to fully refresh the form/results for the new parameter.
**Cause**: State persistence in `QueryTask` or `QueryTaskList` consumption logic.

### 3. HelperSimple URL Parameter Support
**Status:** ✅ RESOLVED (r017.41)  
**Feature**: HS should listen for both `#shortid=value` (hash) and `?shortid=value` (query string).
**Task**: Update HS listener logic and info discovery icon to reflect both supported formats.

---

## High Priority - Immediate Next Steps

### 0. Esri Standards & Architectural Hardening
**Status:** Pending (Targeting Separate Branch)
**Priority:** Critical
**Source:** Architectural Review
**Goal:** Align codebase with official Esri patterns to ensure "human-readable" and "Esri-standard" code for external review.
- **Thin Shell Pattern**: Refactor `widget.tsx` (1,600+ lines) into a "dumb shell" by moving logic into custom hooks (`useUrlConsumption`, `useSelectionRestoration`, `useVisibility`).
- **Standardized JSDoc**: Apply consistent JSDoc headers to all exported functions and components to match `@esri` standards.
- **React Ref Migration**: Replace direct DOM selectors (`document.querySelector`) with React Refs in `QueryTaskForm` for cleaner component isolation.
- **Modular State Persistence**: Isolate the "Add/Remove Results" state management to prevent side effects in standard data source selection.

### 0. Adopt TDD Workflow
**Status:** ✅ IMPLEMENTED (r017.43)  
**Priority:** Critical  
**Source:** User Request  
**Goal:** Write tests *before* implementation to ensure stability and define clear win conditions.
- **Documentation**: Updated `DEVELOPMENT_GUIDE.md` with TDD section.
- **Execution**: Applied TDD to SQL sanitization hardening in r017.43.

### 1. SQL Injection & Input Validation
**Status:** ✅ INITIAL HARDENING (r017.47)  
**Priority:** High  
**Source:** Security/Stability  
- **Validation**: Added `isQueryInputValid` to prevent empty string submittals.
- **Sanitization**: Added `sanitizeQueryInput` to strip whitespace and escape single quotes.
- **Form Hardening**: Integrated validation into `QueryTaskForm` UI to disable "Apply" when input is invalid.
- **Smart Validation**: Exempted list-based selectors (Regional Trails) from mandatory text rules.
- **Stability**: Resolved circular structure crash in `clearResult` (r017.47).
- **TDD**: Verified logic with unit tests in `query-utils.test.ts`.

### 2. Solidify Playwright Testing & Auth
**Status:** ✅ Substantially Improved (r017.35+)  
**Priority:** High  
**Source:** User Request - Development Velocity

**Update**: Playwright tests have been "humanized" with intelligent delays and scoped locators. A "Fresh Data Key" system was implemented to ensure tests wait for new data to render before asserting. Methodical sessions are now reliable across multiple widgets.

---

### 2. Kill Query Performance Bottlenecks
**Status:** ✅ Completed (r017.39)  
**Priority:** Critical  
**Source:** User Feedback - Slowness

**Issues Resolved**: 21s queries reduced to 1.4s via Universal SQL Optimizer, Attribute Stripping, Geometry Generalization, and Instant UI response.

---

### 3. Structural Refactor (Class to Hooks)
**Status:** 🔴 DEFERRED (User requested rollback)  
**Priority:** Low  
**Source:** Development Strategy

**Update**: An attempt was made to refactor `widget.tsx` into Custom Hooks, but it was rolled back to maintain the stable, high-performance r017.39 build. This task is currently on hold.
**Status:** Pending  
**Priority:** High  
**Source:** Code Review - "Simple is Key"

**Issue:** The codebase has become complex with manual syncs, brittle timeouts, and large component files. This likely contributes to perceived slowness and flakiness.

**Implementation Plan:**
1. **De-bloat `widget.tsx`**: Move orchestrator logic into custom hooks (`useVisibility`, `useRestoration`, `useHashConsumption`).
2. **Remove Brittle Timeouts**: Replace `setTimeout(..., 50)` calls with robust Promise chaining or framework hooks (e.g., `useUpdateEffect`).
3. **Event-Driven UI**: Replace polling for identify popups with native framework events if available.
4. ** ESM Imports**: Resolve circular dependencies to allow standard `import` syntax instead of `require()`.
5. **Deduplication Logic**: Standardize composite record keys (`${dsId}_${objectId}`) earlier in the data pipeline.

---

## High Priority - Best Practices

### 3. Standardize Error Handling Pattern
**Status:** ✅ Completed  
**Priority:** High  
**Date Completed:** 2025-12-06

---

### 4. Ensure WCAG 2.x Compliance
**Status:** Pending  
**Priority:** High  

---

### 5. Fix Graphics Layer Clearing and Sticky Selection (Bug #1 & #2)
**Status:** ✅ Completed  
**Priority:** High  
**Date Completed:** 2025-12-18

---

## Medium Priority - Code Quality Improvements

### 6. Update Version Managers
**Status:** Pending  
**Priority:** Medium  

---

### 7. Add React.memo() to Function Components
**Status:** Pending  
**Priority:** Medium  

---

### 8. Add Marker.io for User Feedback
**Status:** Pending  
**Priority:** Medium  

---

### 9. Set Up GitHub Actions CI/CD
**Status:** Pending  
**Priority:** Medium  

---

## Low Priority - Code Consistency

### 10. Standardize i18n Pattern
**Status:** Pending  
**Priority:** Low  

---

### 11. Enhance Widget Context Structure
**Status:** Pending  
**Priority:** Low  

---

## Feature Requests & Pending Tasks

### 1. Multiple QS Widgets Results Interference
**Status:** Pending

### 2. HelperSimple Widget Display Selected Features
**Status:** Pending

### 3. No Results Feedback - Missing User Notification
**Status:** Pending  

### 4. Update Paging Configuration Options in Settings UI
**Status:** Pending  
