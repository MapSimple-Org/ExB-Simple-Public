# QuerySimple Widget TODOs

## High Priority - Immediate Next Steps

### 1. Solidify Playwright Testing & Auth
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

### 3. Refactor & Simplify (Code Quality)
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
