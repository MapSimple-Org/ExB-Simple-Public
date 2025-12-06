# ExB-Simple

A monorepo containing user-focused Experience Builder widgets following the "Simple, clean, real, raw" philosophy.

## Repository Structure

This repository contains custom widgets for ArcGIS Experience Builder (ExB) version 1.19.0.

### Widgets

- **QuerySimple** (`client/your-extensions/widgets/query-simple/`) - A query widget with support for attribute filters, spatial filters, and result display customization
- **HelperSimple** (`client/your-extensions/widgets/helper-simple/`) - A helper widget that manages opening other widgets via hash parameters

### Shared Code

Common utilities and components are shared between widgets using Experience Builder's [shared entry pattern](https://developers.arcgis.com/experience-builder/guide/share-code-between-widgets/).

Location: `client/your-extensions/widgets/shared-code/common/`

## Installation

See [INSTALLATION.md](./INSTALLATION.md) for detailed installation instructions.

### Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/MapSimple-Org/ExB-Simple.git
   ```

2. Copy widgets to your Experience Builder installation:
   ```bash
   cp -r ExB-Simple/client/your-extensions/widgets/* \
     /path/to/your/exb/client/your-extensions/widgets/
   ```

3. Rebuild your Experience Builder application

## Branching Strategy

This repository uses a `main`/`develop` branching strategy:

- **`main`** - Production-ready, stable code (protected, merge-only via PRs)
- **`develop`** - Integration branch for active development
- **Feature branches** - Created from `develop`, merged back via Pull Requests

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## Development

### Prerequisites

- ArcGIS Experience Builder SDK 1.19.0
- Node.js (version specified in Experience Builder requirements)
- Git

### Building Widgets

Widgets are built using Experience Builder's standard build process. See the [Experience Builder Widget Development Guide](https://developers.arcgis.com/experience-builder/guide/) for details.

### Testing

E2E tests are located in `client/tests/e2e/`:
- `query-simple/` - QuerySimple widget tests
- `helper-simple/` - HelperSimple widget tests

Run tests with:
```bash
cd client
npx playwright test
```

## Documentation

- [INSTALLATION.md](./INSTALLATION.md) - Installation and deployment guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines and branching strategy
- [client/your-extensions/widgets/README.md](./client/your-extensions/widgets/README.md) - Widget-specific documentation
- [client/your-extensions/widgets/DEVELOPMENT_GUIDE.md](./client/your-extensions/widgets/DEVELOPMENT_GUIDE.md) - Development guide and best practices

## License

See [3rd-party-license.txt](./3rd-party-license.txt) for license information.

## Links

- [ArcGIS Experience Builder Documentation](https://developers.arcgis.com/experience-builder/guide/)
- [MapSimple.org](https://mapsimple.org)

