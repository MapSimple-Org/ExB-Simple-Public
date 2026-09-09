/**
 * Jest launch config for the MapSimple widget unit tests.
 *
 * WHERE THIS FILE EXPECTS TO LIVE
 *   <ExB 1.20 Developer Edition>/client/your-extensions/widgets/feed-simple/tests/jest.config.js
 *   i.e. the widget folders were copied (not symlinked) into client/your-extensions/widgets/.
 *
 * HOW TO RUN (from the client/ folder, after `npm ci` there)
 *   npx jest --config your-extensions/widgets/feed-simple/tests/jest.config.js your-extensions/widgets
 *
 * WHAT IT DOES
 *   Loads Esri's own client/jest.config.js at runtime and adds the one thing it lacks: a module
 *   mapping for the `widgets/...` import path the MapSimple widgets use to reach shared-code.
 *   Nothing from Esri's config is copied or overridden, so it stays correct across ExB patches.
 *   Expected result on ExB 1.20: every suite present passes (FeedSimple-only install: 9 suites, 298 tests; full package: 39 suites, 856 tests).
 *
 * If you would rather not use a second config, the equivalent manual step is adding this line
 * inside moduleNameMapper in client/jest.config.js:
 *   "^widgets/(.*)": "<rootDir>/your-extensions/widgets/$1",
 */
const fs = require('fs')
const path = require('path')

// tests/ -> query-simple/ -> widgets/ -> your-extensions/ -> client/
const clientDir = path.resolve(__dirname, '..', '..', '..', '..')
const baseConfigPath = path.join(clientDir, 'jest.config.js')

if (!fs.existsSync(baseConfigPath)) {
  throw new Error(
    '[mapsimple tests] Expected Esri\'s jest.config.js at ' + baseConfigPath + '\n' +
    'This config must sit at client/your-extensions/widgets/feed-simple/tests/ inside an ' +
    'Experience Builder 1.20 Developer Edition install (copy the widget folders in; symlinks ' +
    'resolve to the wrong location). Run from the client/ folder.'
  )
}

const base = require(baseConfigPath)

module.exports = {
  ...base,
  rootDir: clientDir,
  moduleNameMapper: {
    '^widgets/(.*)': '<rootDir>/your-extensions/widgets/$1',
    ...(base.moduleNameMapper || {})
  }
}
