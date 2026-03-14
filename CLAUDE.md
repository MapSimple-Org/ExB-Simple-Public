# Claude Code Instructions for MapSimple ExB Project

This project uses centralized documentation. Read these files for context:

## Required Reading (in order)

1. **Project Rules**: `client/your-extensions/widgets/.cursorrules`
   - Git workflow and branch management
   - Technical standards (versioning, logging, SQL performance)
   - Tone and style requirements
   - Architecture patterns

2. **Development Guide**: `client/your-extensions/widgets/docs/development/DEVELOPMENT_GUIDE.md`
   - Compatibility matrix (ExB 1.19, JSAPI 4.34, React 19)
   - Common errors quick reference
   - JSAPI deprecation notes
   - Widget architecture patterns
   - Data sources and actions
   - Debug logging system

3. **Active Bugs**: `client/your-extensions/widgets/docs/bugs/`
   - Check for ongoing investigations before making related changes

Then read docs for the widget you're working on:

### QuerySimple / HelperSimple Docs

| Doc | Location |
|-----|----------|
| Status | `client/your-extensions/widgets/CURRENT_STATUS.md` |
| TODOs | `client/your-extensions/widgets/TODO.md` |
| Changelog | `client/your-extensions/widgets/docs/query-simple/CHANGELOG.md` |
| Process Flows | `client/your-extensions/widgets/docs/query-simple/process-flows/README.md` |

### FeedSimple Docs

| Doc | Location |
|-----|----------|
| Status | `client/your-extensions/widgets/feed-simple/CURRENT_STATUS.md` |
| TODOs | `client/your-extensions/widgets/feed-simple/TODO.md` |
| Changelog | `client/your-extensions/widgets/docs/feed-simple/CHANGELOG.md` |
| Dev Spec | `client/your-extensions/widgets/docs/specs/FEEDSIMPLE_SPEC.md` |
| Architecture | `client/your-extensions/widgets/docs/feed-simple/ARCHITECTURE.md` |
| Process Flows | `client/your-extensions/widgets/docs/feed-simple/process-flows/README.md` |

## Critical Rules Summary

These are extracted from .cursorrules - read the full file for details:

- **Logging**: Never use `console.log()` - always use `debugLogger`
- **Versioning**: Increment `MINOR_VERSION` in `version.ts` for every code change
- **Git**: Never commit without explicit user approval
- **Branches**: Never develop on `main` or `develop` - use feature branches
- **Imports**: Import React from `jimu-core`, never from `'react'` directly
- **Git Commits**: NEVER include `Co-Authored-By` or any co-author attribution in commit messages. All commits are authored solely by the developer.
- **Process Flows**: When changing QS code that affects a documented flow, update the corresponding `docs/query-simple/process-flows/FLOW-XX.md`. For FS, update `docs/feed-simple/process-flows/FS-FLOW-XX.md`. When adding a new distinct flow, create a new doc and add it to the README index.

## Widget Locations

Custom widgets are in `client/your-extensions/widgets/`:
- `query-simple/` - Main search widget
- `helper-simple/` - URL monitoring orchestrator
- `shared-code/` - Common utilities shared between query-simple and helper-simple
- `feed-simple/` - XML feed consumer widget (standalone, does not use shared-code)
