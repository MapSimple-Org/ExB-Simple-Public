const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-variables')
const { validTests: radiusValidTests, invalidTests: radiusInvalidTests } = require('./no-classic-border-radius')
const { validTests: borderValidTests, invalidTests: borderInvalidTests } = require('./no-classic-border')
const { validTests: colorsValidTests, invalidTests: colorsInvalidTests } = require('./no-classic-colors')
const { validTests: darkThemeValidTests, invalidTests: darkThemeInvalidTests } = require('./no-classic-dark-theme')
const { validTests: elementsValidTests, invalidTests: elementsInvalidTests } = require('./no-classic-elements')
const { validTests: focusedStyleValidTests, invalidTests: focusedStyleInvalidTests } = require('./no-classic-focused-styles')
const { validTests: shadowValidTests, invalidTests: shadowInvalidTests } = require('./no-classic-shadow')
const { validTests: sizesValidTests, invalidTests: sizesInvalidTests } = require('./no-classic-sizes')
const { validTests: surfaceValidTests, invalidTests: surfaceInvalidTests } = require('./no-classic-surface')
const { validTests: typographyValidTests, invalidTests: typographyInvalidTests } = require('./no-classic-typography')



ruleTester.run('no-classic-variables', rule, {
  valid: [
    ...radiusValidTests,
    ...borderValidTests,
    ...colorsValidTests,
    ...darkThemeValidTests,
    ...elementsValidTests,
    ...focusedStyleValidTests,
    ...shadowValidTests,
    ...sizesValidTests,
    ...surfaceValidTests,
    ...typographyValidTests,
  ],

  invalid: [
    ...radiusInvalidTests,
    ...borderInvalidTests,
    ...colorsInvalidTests,
    ...darkThemeInvalidTests,
    ...elementsInvalidTests,
    ...focusedStyleInvalidTests,
    ...shadowInvalidTests,
    ...sizesInvalidTests,
    ...surfaceInvalidTests,
    ...typographyInvalidTests,
  ]
})
