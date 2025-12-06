# Installation Guide

This guide explains how to install MapSimple Experience Builder widgets into your own Experience Builder installation.

## Prerequisites

- ArcGIS Experience Builder SDK 1.19.0 installed
- Git (for cloning the repository)
- Access to your Experience Builder installation directory

## Installation Methods

### Method 1: Clone and Copy (Recommended)

This method gives you access to the full source code and allows you to customize widgets.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MapSimple-Org/ExB-Simple.git
   cd ExB-Simple
   ```

2. **Checkout the desired branch:**
   ```bash
   # For stable/production widgets
   git checkout main
   
   # For latest development widgets
   git checkout develop
   ```

3. **Copy widgets to your Experience Builder installation:**
   ```bash
   # Replace /path/to/your/exb with your actual Experience Builder installation path
   cp -r client/your-extensions/widgets/* \
     /path/to/your/exb/client/your-extensions/widgets/
   ```

4. **Rebuild your Experience Builder application:**
   ```bash
   cd /path/to/your/exb/client
   npm run build
   ```

### Method 2: Download Specific Widgets

If you only need specific widgets:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MapSimple-Org/ExB-Simple.git
   cd ExB-Simple
   ```

2. **Copy only the widgets you need:**
   ```bash
   # Copy QuerySimple only
   cp -r client/your-extensions/widgets/query-simple \
     /path/to/your/exb/client/your-extensions/widgets/
   
   # Copy HelperSimple only
   cp -r client/your-extensions/widgets/helper-simple \
     /path/to/your/exb/client/your-extensions/widgets/
   ```

3. **Copy shared code (required for widgets to work):**
   ```bash
   cp -r client/your-extensions/widgets/shared-code \
     /path/to/your/exb/client/your-extensions/widgets/
   ```

4. **Rebuild your Experience Builder application**

### Method 3: Git Submodule (Advanced)

If you want to track updates via Git:

1. **Add as a submodule:**
   ```bash
   cd /path/to/your/exb/client/your-extensions/widgets
   git submodule add https://github.com/MapSimple-Org/ExB-Simple.git temp-repo
   cp -r temp-repo/client/your-extensions/widgets/* .
   rm -rf temp-repo
   git submodule deinit temp-repo
   ```

   **Note:** This method is more complex and not recommended for most users.

## Widget Structure

Widgets are installed at:
```
your-exb-installation/
└── client/
    └── your-extensions/
        └── widgets/
            ├── query-simple/
            ├── helper-simple/
            └── shared-code/
```

This structure matches Experience Builder's expected widget location.

## Verifying Installation

After installation, verify widgets are available:

1. **Start Experience Builder:**
   ```bash
   cd /path/to/your/exb
   npm start
   ```

2. **Open Experience Builder Builder:**
   - Navigate to `http://localhost:3001/builder`
   - Create a new experience or open an existing one
   - In the widget panel, you should see:
     - **QuerySimple** widget
     - **HelperSimple** widget

3. **Add widgets to your experience:**
   - Drag widgets from the widget panel onto your layout
   - Configure widgets using the settings panel

## Updating Widgets

To update widgets to the latest version:

1. **Pull latest changes:**
   ```bash
   cd ExB-Simple
   git pull origin main  # or develop for latest
   ```

2. **Copy updated widgets:**
   ```bash
   cp -r client/your-extensions/widgets/* \
     /path/to/your/exb/client/your-extensions/widgets/
   ```

3. **Rebuild your Experience Builder application**

## Troubleshooting

### Widgets Not Appearing

- **Check widget location:** Ensure widgets are in `client/your-extensions/widgets/`
- **Rebuild application:** Run `npm run build` in the `client` directory
- **Check console:** Look for errors in the browser console
- **Verify shared code:** Ensure `shared-code/` directory is present

### Build Errors

- **Check Node.js version:** Ensure you're using the version required by Experience Builder
- **Clear node_modules:** Try `rm -rf node_modules && npm install`
- **Check dependencies:** Ensure all Experience Builder dependencies are installed

### Widget Configuration Issues

- **Check manifest.json:** Ensure widget manifests are valid JSON
- **Verify data sources:** Ensure required data sources are configured
- **Check translations:** Ensure translation files are present

## Getting Help

- **Documentation:** See [README.md](./README.md) and widget-specific docs
- **Issues:** Report issues on [GitHub Issues](https://github.com/MapSimple-Org/ExB-Simple/issues)
- **Development Guide:** See [DEVELOPMENT_GUIDE.md](./client/your-extensions/widgets/DEVELOPMENT_GUIDE.md)

## Next Steps

After installation:

1. **Read widget documentation:** See `client/your-extensions/widgets/README.md`
2. **Configure widgets:** Set up data sources and widget settings
3. **Test widgets:** Create a test experience to verify functionality
4. **Customize:** Modify widgets to fit your needs (see DEVELOPMENT_GUIDE.md)

