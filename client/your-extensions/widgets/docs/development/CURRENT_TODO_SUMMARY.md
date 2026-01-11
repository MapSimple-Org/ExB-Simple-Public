# QuerySimple TODO Summary - Team Deployment Ready

**Date:** 2026-01-10  
**Current Version:** v1.19.0-r019.22  
**Status:** ✅ Ready for Team Testing

---

## 📋 **Pre-Team Deployment (Do Now)**

### ✅ **COMPLETE - Ready to Deploy**
All critical work is complete. Widget is stable and tested.

**Deployment Workflow:**
1. ✅ Configure test page with all required searches
2. ✅ Test thoroughly (E2E + manual smoke test)
3. 🔲 Export site via ExB (flattens to HTML/JS)
4. 🔲 Add BugHerd to exported `index.html` (visual feedback + Kanban board)
5. 🔲 Deploy to team with testing instructions

**Reference:** [`TEAM_TESTING_DEPLOYMENT.md`](TEAM_TESTING_DEPLOYMENT.md) for detailed steps

---

## 🔥 **Post-Team Deployment (High Priority)**

### 1. **Esri Standards Alignment** (Before Submission)
**Priority:** HIGH  
**Reference:** [`ESRI_STANDARDS_ALIGNMENT.md`](ESRI_STANDARDS_ALIGNMENT.md)

**Action Items:**
- [ ] Add comment in `version.ts` explaining internal development tracking format
- [ ] Document `version-manager.ts` purpose (config schema upgrades)
- [ ] Clarify in README that `v1.19.0-r019.22` is internal, public version is `1.19.0`
- [ ] (Optional) Review JSDoc comments - simplify to Esri style if requested
- [ ] (Optional) Verify GitHub remote branch has clean distribution (no .md files)

**Current Assessment:** 95%+ Esri-compliant

---

### 2. **Tab-Level Component Extraction** (Before Graphics Tab)
**Priority:** CRITICAL (Architectural Foundation)  
**Reference:** [`TODO.md`](../../TODO.md) Section 2b

**Problem:** 
- `query-task.tsx` is currently 2999 lines ("God Component")
- Graphics tab would push it to 4000+ lines → unmaintainable

**Solution:**
Extract Query tab logic into separate component FIRST, then build Graphics tab.

**Phase 1: Extract Query Tab** (1-2 weeks)
- [ ] Create `tabs/QueryTabContent.tsx` (~800 lines)
- [ ] Create `use-sql-expression.ts` hook
- [ ] Create `use-attribute-filter.ts` hook
- [ ] Create `use-spatial-filter.ts` hook
- [ ] Refactor `query-task.tsx` to orchestration only (~800 lines)
- [ ] Test existing features (E2E regression)

**Phase 2: Build Graphics Tab** (1-2 weeks)
- [ ] Create `tabs/GraphicsTabContent.tsx` (~600 lines)
- [ ] Implement `use-draw-tools.ts` (Sketch widget integration)
- [ ] Implement `use-shape-selection.ts` (spatial query by shape)
- [ ] Implement `use-spatial-operators.ts` (intersects, contains, within)
- [ ] Add buffer/distance options
- [ ] E2E testing

**Critical Rule:** 🚨 DO NOT build Graphics tab inline in current `query-task.tsx`

**Files:**
```
query-simple/src/runtime/
├── query-task.tsx (800 lines - orchestration)
├── tabs/
│   ├── QueryTabContent.tsx (NEW - 800 lines)
│   ├── ResultsTabContent.tsx (rename query-result.tsx)
│   └── GraphicsTabContent.tsx (NEW - 600 lines)
└── hooks/
    ├── query-tab/
    │   ├── use-sql-expression.ts
    │   ├── use-attribute-filter.ts
    │   └── use-spatial-filter.ts
    └── graphics-tab/
        ├── use-draw-tools.ts
        ├── use-shape-selection.ts
        └── use-spatial-operators.ts
```

**Benefits:**
- ✅ Each tab independently testable
- ✅ Parallel development (multiple devs)
- ✅ Feature flags possible
- ✅ Reusable components
- ✅ Easy to add more tabs (Search, Bookmarks)

**Estimated Effort:** 2-4 weeks total

---

### 3. **REST API Network Monitoring** (Strategic)
**Priority:** MEDIUM  
**Reference:** [`REST_ENDPOINT_MONITORING.md`](../technical/REST_ENDPOINT_MONITORING.md)

**Goal:** Monitor ArcGIS REST API calls for debugging and validation

**Action Items:**
- [ ] Add `network-monitor.ts` utility class
- [ ] Enable monitoring via debug flag
- [ ] Add E2E tests with Playwright network interception
- [ ] Log query URLs, WHERE clauses, performance metrics
- [ ] Create comparison reports (our queries vs. Esri's)

**Rationale:**
- Early warning if SQL expression translation changes
- Validation of query construction
- Fallback if `SqlExpressionRuntime` DOM workaround breaks

**Estimated Effort:** 1-2 days

---

### 4. **Remove Non-Graphics Layer Implementation** (BREAKING CHANGE)
**Priority:** MEDIUM (Code Simplification)  
**Reference:** [`TODO.md`](../../TODO.md) Section 3a  
**Target Release:** r020.0 (breaking change)

**Problem:**
- Dual-path implementation (graphics layer vs. layer selection) adds complexity
- ~44 conditional checks throughout codebase
- Zoom breaks when graphics layer disabled
- Non-graphics path is not tested or maintained

**Solution:**
Remove `useGraphicsLayerForHighlight` config option entirely. Always use graphics layer.

**Benefits:**
- Removes ~44 conditional checks
- Fixes zoom issue
- Consistent behavior
- Simpler codebase

**Estimated Effort:** 1-2 days

---

## 💡 **Future Features (Lower Priority)**

### 5. **Map Identify to QS Integration** ("Add to Results" Action)
**Priority:** MEDIUM  
**Reference:** [`MAP_IDENTIFY_INTEGRATION.md`](../features/MAP_IDENTIFY_INTEGRATION.md)

**Goal:** Allow users to identify features on map and add them to QS result list

**Features:**
- Custom Data Action for Map Popups
- Smart visibility (only when QS is open)
- Dynamic toggle (Add/Remove based on current results)
- Automatic mode evolution (New → Add)

---

### 6. **SQL Injection & Input Validation** (Enhanced)
**Priority:** HIGH (Security)  
**Current Status:** ✅ Initial hardening complete (r017.47)

**Future Enhancements:**
- [ ] Configurable validation rules per query (min chars, regex)
- [ ] Widget Setting page UI for validation config
- [ ] More robust UI feedback

---

### 7. **Code Quality & Best Practices**
**Priority:** LOW

- [ ] Update Version Managers (if needed)
- [ ] Add React.memo() to function components
- [ ] Add BugHerd for user feedback (visual + Kanban)
- [ ] Set up GitHub Actions CI/CD
- [ ] Standardize i18n pattern
- [ ] Enhance Widget Context structure

---

## 📊 **What's Currently on TODO (by count)**

**HIGH Priority:** 2 items (Esri Standards, Tab Extraction)  
**MEDIUM Priority:** 3 items (Network Monitoring, Breaking Change Removal, Map Identify)  
**LOW Priority:** 6 items (Code quality improvements)  

**CRITICAL for next sprint:** Tab extraction (before Graphics development)

---

## 🎯 **Recommended Sequence After Team Feedback**

1. **Week 1:** Address any team feedback, make small fixes
2. **Week 2:** Esri Standards alignment (version.ts docs, README updates)
3. **Week 3-4:** Extract Query tab to `QueryTabContent.tsx`
4. **Week 5-6:** Build Graphics tab in new `GraphicsTabContent.tsx`
5. **Week 7:** Network monitoring implementation
6. **Week 8:** Breaking change removal (non-graphics layer path)

---

## 📚 **Reference Documentation**

- [`TODO.md`](../../TODO.md) - Full task list with implementation details
- [`ESRI_STANDARDS_ALIGNMENT.md`](ESRI_STANDARDS_ALIGNMENT.md) - Esri compliance analysis
- [`DEVELOPMENT_GUIDE.md`](DEVELOPMENT_GUIDE.md) - Development standards and patterns
- [`CHUNK_TESTING_GUIDE.md`](../architecture/CHUNK_TESTING_GUIDE.md) - Testing procedures
- [`REST_ENDPOINT_MONITORING.md`](../technical/REST_ENDPOINT_MONITORING.md) - Network monitoring strategy
- [`MAP_IDENTIFY_INTEGRATION.md`](../features/MAP_IDENTIFY_INTEGRATION.md) - Map identify integration architecture

---

**Last Updated:** 2026-01-10  
**Widget Status:** ✅ Production-ready for team testing
