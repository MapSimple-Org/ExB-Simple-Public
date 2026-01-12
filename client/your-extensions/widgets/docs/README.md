# Documentation Index

**Last Updated:** 2026-01-10  
**Purpose:** Centralized documentation hub for MapSimple widget suite development

---

## 📂 **Quick Navigation**

- **[Development](#development)** - Core development guides, testing, standards
- **[Architecture](#architecture)** - Design patterns, migration plans, refactoring strategies
- **[Technical](#technical)** - Deep dives into specific technical challenges and solutions
- **[Features](#features)** - Feature specifications and integration guides
- **[Bugs](#bugs)** - Bug reports and resolution documentation
- **[Blog](#blog)** - Development insights, lessons learned, and best practices
- **[Presentations](#presentations)** - Presentation materials and summaries

---

## 📚 **Development**

Core development guides, workflows, and standards.

| Document | Description | Key Topics |
|----------|-------------|------------|
| **[DEVELOPMENT_GUIDE.md](development/DEVELOPMENT_GUIDE.md)** | 📖 **Master Reference** - Complete development standards and patterns | Architecture, Testing, Git, Performance, Shared Code |
| [TESTING_WALKTHROUGH.md](development/TESTING_WALKTHROUGH.md) | Comprehensive testing guide for E2E and unit tests | Playwright, Jest, Test Patterns |
| [UNIT_TESTING_PROGRESS.md](development/UNIT_TESTING_PROGRESS.md) | Unit test coverage tracking | Test Coverage, Progress Tracking |
| [ESRI_STANDARDS_ALIGNMENT.md](development/ESRI_STANDARDS_ALIGNMENT.md) | Alignment analysis with Esri widget standards | Compliance, Submission Readiness |
| [CURRENT_WORK.md](development/CURRENT_WORK.md) | Active development status and recent releases | Current Sprint, Release Notes |
| [CURRENT_TODO_SUMMARY.md](development/CURRENT_TODO_SUMMARY.md) | Executive summary of pending tasks | Priorities, Roadmap |
| [TEAM_TESTING_DEPLOYMENT.md](development/TEAM_TESTING_DEPLOYMENT.md) | Guide for deploying to team for user testing | Export, BugHerd, Kanban |
| [BUGHERD_QUICK_REFERENCE.md](development/BUGHERD_QUICK_REFERENCE.md) | Quick reference for BugHerd integration | Visual Feedback, Kanban, Setup |

**Start Here:** [`DEVELOPMENT_GUIDE.md`](development/DEVELOPMENT_GUIDE.md)

---

## 🏗️ **Architecture**

Design patterns, migration strategies, and architectural decisions.

| Document | Description | Key Topics |
|----------|-------------|------------|
| **[COMPLETE_MIGRATION_PLAN.md](architecture/COMPLETE_MIGRATION_PLAN.md)** | 📋 **Master Plan** - Full Hook & Shell migration strategy | 7 Chunks, Manager Pattern |
| [CHUNK_IMPLEMENTATION_PLAN.md](architecture/CHUNK_IMPLEMENTATION_PLAN.md) | Detailed implementation plan for each chunk | Chunk-by-Chunk Strategy |
| [CHUNK_TESTING_GUIDE.md](architecture/CHUNK_TESTING_GUIDE.md) | Testing instructions for each migration chunk | E2E Tests, Verification |
| [CHUNK_3_REMOVAL_ANALYSIS.md](architecture/CHUNK_3_REMOVAL_ANALYSIS.md) | Post-migration code removal analysis | Cleanup Strategy |
| [CHUNK_3_REMOVAL_STRATEGIES.md](architecture/CHUNK_3_REMOVAL_STRATEGIES.md) | Strategies for safe code removal | Risk Assessment |
| [CHUNK_3_EMPIRICAL_DATA.md](architecture/CHUNK_3_EMPIRICAL_DATA.md) | Measured data supporting removal strategies | Metrics, Analysis |
| [COORDINATE_CAPTURE_SUMMARY.md](architecture/COORDINATE_CAPTURE_SUMMARY.md) | Framework for capturing map coordinates in tests | E2E Testing, Coordinates |

**Migration Status:** ✅ All 7 chunks complete (r019.22)

---

## 🔧 **Technical**

Deep technical documentation for complex implementations and workarounds.

| Document | Description | Key Topics |
|----------|-------------|------------|
| **[SQLEXPRESSION_RUNTIME_DOM_WORKAROUND.md](technical/SQLEXPRESSION_RUNTIME_DOM_WORKAROUND.md)** | 🚨 **Critical** - DOM manipulation workaround for SqlExpressionRuntime | DOM, MutationObserver, RAF |
| [SQLEXPRESSIONRUNTIME_FEATURE_ANALYSIS.md](technical/SQLEXPRESSIONRUNTIME_FEATURE_ANALYSIS.md) | Comprehensive analysis of SqlExpressionRuntime capabilities | Operators, Features, Assessment |
| [SQLEXPRESSIONRUNTIME_CONTINGENCY_PLAN.md](technical/SQLEXPRESSIONRUNTIME_CONTINGENCY_PLAN.md) | "Break Glass" strategy if DOM workaround fails | Escalation, SimpleQEngine Spec |
| [REST_ENDPOINT_MONITORING.md](technical/REST_ENDPOINT_MONITORING.md) | Strategy for intercepting and analyzing ArcGIS REST calls | Network Monitoring, Debugging |
| [EVENT_DRIVEN_HASH_EXECUTION.md](technical/EVENT_DRIVEN_HASH_EXECUTION.md) | Event-driven hash parameter execution implementation | URL Consumption, Events |
| [FIXES_HASH_TAB_ACTIVE.md](technical/FIXES_HASH_TAB_ACTIVE.md) | Fix for hash parameter tab activation | Tab Switching, Hash |
| [RESULTS_MANAGEMENT_MODES_PLAN.md](technical/RESULTS_MANAGEMENT_MODES_PLAN.md) | Results management modes (New/Add/Remove) architecture | Selection Modes |
| [SELECTION_RESTORATION.md](technical/SELECTION_RESTORATION.md) | Selection restoration across widget open/close cycles | State Persistence |
| [POPUP_RENDERING_DETECTION.md](technical/POPUP_RENDERING_DETECTION.md) | Detection of popup rendering in HelperSimple | HelperSimple, Popups |

**Most Critical:** [`SQLEXPRESSION_RUNTIME_DOM_WORKAROUND.md`](technical/SQLEXPRESSION_RUNTIME_DOM_WORKAROUND.md)

---

## ✨ **Features**

Feature specifications, integration guides, and planning documents.

| Document | Description | Key Topics |
|----------|-------------|------------|
| **[MAP_IDENTIFY_INTEGRATION.md](features/MAP_IDENTIFY_INTEGRATION.md)** | 🎯 Map Identify to QuerySimple integration architecture | Data Actions, Event Bus |
| [MAP_IDENTIFY_TEST_NOTES.md](features/MAP_IDENTIFY_TEST_NOTES.md) | Testing approach for Map Identify feature | E2E Testing, Manual Tests |
| [HELPER_QUERY_INTERACTION.md](features/HELPER_QUERY_INTERACTION.md) | HelperSimple and QuerySimple interaction patterns | Widget Communication |

---

## 🐛 **Bugs**

Bug reports, analysis, and resolution documentation.

| Document | Description | Status |
|----------|-------------|--------|
| [BUG_HASH_PARAMETER_AFTER_CLEAR.md](bugs/BUG_HASH_PARAMETER_AFTER_CLEAR.md) | Hash parameters remaining after clear | ✅ Resolved |
| [BUGS.md](bugs/BUGS.md) | General bug tracking for QuerySimple | Ongoing |

---

## 📝 **Blog**

Development insights, lessons learned, and best practices.

| Document | Description | Theme |
|----------|-------------|-------|
| [BLOG_01_THE_PEN_AND_THE_ARCHITECT.md](blog/BLOG_01_THE_PEN_AND_THE_ARCHITECT.md) | The importance of design before implementation | Planning |
| [BLOG_DEBUGGER_VERIFY_DONT_ASSUME.md](blog/BLOG_DEBUGGER_VERIFY_DONT_ASSUME.md) | Empirical debugging over assumptions | Debugging |
| [BLOG_DISPLAY_ORDER.md](blog/BLOG_DISPLAY_ORDER.md) | Managing display order in UI | UI/UX |
| [BLOG_IDEAS.md](blog/BLOG_IDEAS.md) | Collection of blog post ideas | Ideation |
| [BLOG_KNOWN_BUGS_LOGGING.md](blog/BLOG_KNOWN_BUGS_LOGGING.md) | Logging strategies for known bugs | Logging |
| [BLOG_MEGA_JOURNEY_TESTING.md](blog/BLOG_MEGA_JOURNEY_TESTING.md) | Comprehensive testing journey | Testing |
| [BLOG_RESULTS_MANAGEMENT_MODES.md](blog/BLOG_RESULTS_MANAGEMENT_MODES.md) | Results management mode architecture | Architecture |
| [BLOG_SELECTION_RESTORATION.md](blog/BLOG_SELECTION_RESTORATION.md) | Selection restoration patterns | State Management |
| [BLOG_TAMING_LAZY_LOAD_SCROLL.md](blog/BLOG_TAMING_LAZY_LOAD_SCROLL.md) | Lazy loading and scroll virtualization | Performance |

---

## 🎤 **Presentations**

Presentation materials and summaries.

| Document | Description | Date |
|----------|-------------|------|
| [PRESENTATION_SUMMARY.md](presentations/PRESENTATION_SUMMARY.md) | Summary of widget presentation | 2025 |

---

## 🔗 **Cross-Reference Guide**

### **Documentation References in Code**

- `.cursor/rules/*.mdc` → References `docs/development/DEVELOPMENT_GUIDE.md`
- `TODO.md` → References multiple docs (see individual entries)
- `CHANGELOG.md` → May reference technical docs

### **Key Documentation Chains**

**For New Developers:**
1. Start: `docs/development/DEVELOPMENT_GUIDE.md`
2. Then: `docs/architecture/COMPLETE_MIGRATION_PLAN.md`
3. Then: `docs/development/TESTING_WALKTHROUGH.md`

**For Debugging SqlExpressionRuntime:**
1. Start: `docs/technical/SQLEXPRESSION_RUNTIME_DOM_WORKAROUND.md`
2. Then: `docs/technical/SQLEXPRESSIONRUNTIME_CONTINGENCY_PLAN.md`
3. Reference: `docs/technical/SQLEXPRESSIONRUNTIME_FEATURE_ANALYSIS.md`

**For Understanding Migration:**
1. Start: `docs/architecture/COMPLETE_MIGRATION_PLAN.md`
2. Then: `docs/architecture/CHUNK_TESTING_GUIDE.md`
3. Reference: `docs/development/CURRENT_WORK.md` for status

**For Testing:**
1. Start: `docs/development/TESTING_WALKTHROUGH.md`
2. Then: `docs/architecture/CHUNK_TESTING_GUIDE.md`
3. Reference: `docs/architecture/COORDINATE_CAPTURE_SUMMARY.md` for E2E helpers

---

## 📋 **Document Maintenance**

### **Living Documents** (Updated Frequently)
- `development/CURRENT_WORK.md` - Updated each release
- `development/CURRENT_TODO_SUMMARY.md` - Updated each sprint
- `development/UNIT_TESTING_PROGRESS.md` - Updated as tests are added
- `bugs/BUGS.md` - Updated as bugs are discovered/resolved

### **Reference Documents** (Stable)
- `development/DEVELOPMENT_GUIDE.md` - Updated for major process changes
- `architecture/COMPLETE_MIGRATION_PLAN.md` - Updated only for architectural shifts
- `technical/*.md` - Updated when implementation changes

### **Historical Documents** (Read-Only)
- `architecture/CHUNK_3_*.md` - Historical analysis
- `blog/*.md` - Development insights (time-stamped)
- `presentations/*.md` - Past presentations

---

## 🚀 **Quick Links by Role**

### **I'm a New Developer**
Start here:
1. [`docs/development/DEVELOPMENT_GUIDE.md`](development/DEVELOPMENT_GUIDE.md) - Read this first
2. [`docs/development/TESTING_WALKTHROUGH.md`](development/TESTING_WALKTHROUGH.md) - Learn testing
3. [`docs/development/CURRENT_TODO_SUMMARY.md`](development/CURRENT_TODO_SUMMARY.md) - See what's next

### **I'm Debugging an Issue**
1. [`docs/bugs/BUGS.md`](bugs/BUGS.md) - Check known bugs
2. [`docs/technical/`](technical/) - Check technical deep dives
3. [`docs/blog/BLOG_DEBUGGER_VERIFY_DONT_ASSUME.md`](blog/BLOG_DEBUGGER_VERIFY_DONT_ASSUME.md) - Debugging philosophy

### **I'm Adding a Feature**
1. [`docs/development/DEVELOPMENT_GUIDE.md`](development/DEVELOPMENT_GUIDE.md) - Standards
2. [`docs/architecture/COMPLETE_MIGRATION_PLAN.md`](architecture/COMPLETE_MIGRATION_PLAN.md) - Architecture patterns
3. [`docs/development/TESTING_WALKTHROUGH.md`](development/TESTING_WALKTHROUGH.md) - Test first!

### **I'm Preparing for Esri Submission**
1. [`docs/development/ESRI_STANDARDS_ALIGNMENT.md`](development/ESRI_STANDARDS_ALIGNMENT.md) - Compliance review
2. [`../README.md`](../README.md) - Public-facing docs
3. [`../CHANGELOG.md`](../CHANGELOG.md) - Version history

---

## 📖 **Root-Level Files**

Files that remain in the project root:

- **`../README.md`** - Public-facing project overview
- **`../CHANGELOG.md`** - Version history and release notes
- **`../TODO.md`** - Active development task list

---

**Need to add a new document?** Follow this structure:
- **Development docs** → `docs/development/`
- **Architecture docs** → `docs/architecture/`
- **Technical deep dives** → `docs/technical/`
- **Feature specs** → `docs/features/`
- **Bug reports** → `docs/bugs/`
- **Blog posts** → `docs/blog/`
- **Presentations** → `docs/presentations/`

**Last Updated:** 2026-01-10
