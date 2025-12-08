module.exports = {
  testEnvironment: 'jsdom',
  globals: {
    // the default config is for AGOL app
    jimuConfig: {
      isBuilder: false,
      isSite: false,
      isInBuilder: false,
      isOutOfExb: false,
      rootPath: '/',
      appFolderName: '',
      baseUrl: '/',
      useStructuralUrl: true,
      isInPortal: false,
      mountPath: '/',
      hostEnv: 'prod',
      isDevEdition: false,
      arcgisJsApiUrl: '',
      buildNumber: '',
      exbVersion: '1.5.0'
    }
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { isolatedModules: true }],
    "^.+(node_modules).+\\.js$": ["ts-jest", { isolatedModules: true }],
    "\\.js$": "./jest-systemjs-transformer.js"
  },
  transformIgnorePatterns: [
  ],
  testEnvironmentOptions: {
    testURL: "http://localhost",
    globalsCleanup: 'on'
  },
  resolver: '<rootDir>/jimu-for-test/resolver-import.js',
  testRegex: "\\.(test|spec)\\.(tsx?)$",
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/woodpecker/",
    "<rootDir>/dist/",
    "<rootDir>/dist-tests/",
    "<rootDir>/dist-doc/",
    "<rootDir>/dist-report/",
    "<rootDir>/tests/testing-library-examples",
    "<rootDir>/__mocks__/",
    "<rootDir>/experience/",
    "<rootDir>/for-release/",
    "<rootDir>/pwa/",
    "<rootDir>/scripts/",
    "<rootDir>/test-loader/",
    "<rootDir>/tsconfig/",
    "<rootDir>/types/",
    "<rootDir>/webpack/"
  ],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx"
  ],
  moduleNameMapper: {
    "^jimu-core$": "<rootDir>/dist/jimu-core/index.js",
    '^jimu-theme$': '<rootDir>/dist/jimu-theme/index.js',
    "^jimu-ui$": "<rootDir>/dist/jimu-ui/index.js",
    "^jimu-for-builder$": "<rootDir>/dist/jimu-for-builder/index.js",
    "^jimu-data-source$": "<rootDir>/dist/jimu-data-source/index.js",
    "^jimu-arcgis$": "<rootDir>/dist/jimu-arcgis/index.js",
    "^jimu-for-test$": "<rootDir>/jimu-for-test/index.tsx",

    "^jimu-ui/lib/icons/(.*)\\.svg": "<rootDir>/__mocks__/icon-mock.js",
    '^jimu-icons/svg/(.*)\\.svg': '<rootDir>/__mocks__/icon-mock.js',

    "^jimu-core/(.*)": "<rootDir>/dist/jimu-core/$1",
    '^jimu-theme/(.*)': '<rootDir>/dist/jimu-theme/$1',
    "^jimu-ui/(.*)": "<rootDir>/dist/jimu-ui/$1",
    '^jimu-icons/(.*)': '<rootDir>/jimu-icons/$1',
    "^jimu-for-builder/(.*)": "<rootDir>/dist/jimu-for-builder/$1",
    "^jimu-arcgis/(.*)": "<rootDir>/dist/jimu-arcgis/$1",
    "^jimu-layouts/(.*)": "<rootDir>/dist/jimu-layouts/$1",
    "^jimu-data-source/(.*)": "<rootDir>/dist/jimu-data-source/$1",
    "^builder/(.*)": "<rootDir>/dist/builder/$1",
    "^site/(.*)": "<rootDir>/dist/site/$1",

    'arcgis-charts-components': '<rootDir>/dist/arcgis-charts-components/index.js',
    'arcgis-map-components': '<rootDir>/dist/arcgis-map-components/index.js',
    'arcgis-coding-components': '<rootDir>/dist/arcgis-coding-components/index.js',
    'arcgis-portal-components': '<rootDir>/dist/arcgis-portal-components/index.js',
    'calcite-components': '<rootDir>/dist/calcite-components/index.js',

    '^@arcgis/map-components-react': '<rootDir>/__mocks__/esri-package-mock.js',
    '^@arcgis/charts-components-react': '<rootDir>/__mocks__/esri-package-mock.js',
    '^@arcgis/coding-components-react': '<rootDir>/__mocks__/esri-package-mock.js',
    '@esri/calcite-components-react': '<rootDir>/__mocks__/esri-package-mock.js',
    '^esri/(.*)': '<rootDir>/node_modules/@arcgis/core/$1',

    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/file-mock.js",
    "\\.(css|scss)$": "<rootDir>/__mocks__/style-mock.js",
    "themes/(.*)\\variables.json": "<rootDir>/__mocks__/theme-mock.js"
  },
  collectCoverage: false,
  silent: true,
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/woodpecker/**",
    "!**/dist*/**",
    "!**/arcgis-js-api/**",
    "!**/translations/**",
    "!tests/**",
    "!widgets/arcgis/**"
  ],
  coverageDirectory: "<rootDir>/dist-report/tests-coverage",
  coverageReporters: ["json", "html", "cobertura"],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "dist-report",
        outputName: "ut-report.xml"
      }
    ]
  ],
  setupFiles: [
    './jimu-for-test/setup-jest.js'
  ]
}
