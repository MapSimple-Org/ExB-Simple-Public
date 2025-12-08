'use strict'
const {
  DocURL,
  getMatchNodeIdentifiers,
  getVariableMappingInNewTheme,
  reportMessages,
  DefaultThemeAliases,
  ThemeAllColors,
  ThemeLightDarkColors,
  ThemePaletteShades
} = require('../utils')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'This rule updates `colors` variables from old classic theme to new theme.',
      recommended: false,
      url: `${DocURL}no-classic-colors.md`,
    },
    fixable: 'code',
    messages: {
      message: 'Color variable upgraded from \'{{oldVar}}\' to \'{{newVar}}\' to align with the new theme.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          themeAliases: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: DefaultThemeAliases,
            description: 'The plug-in determines whether a variable is a theme variable based on the "theme" keyword. If you use another name, define it through this property.'
          }
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const option = context.options[0] || {}
    const themeAliases = option.themeAliases || DefaultThemeAliases
    return {
      MemberExpression(node) {
        const variables = context.sourceCode.getScope(node).variables
        let props = null
        if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'colors', [...ThemeAllColors, 'transparent']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'colors', 'palette', ThemeLightDarkColors, ThemePaletteShades], stop: themeAliases }, { value: variables, level: 2 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'colors', 'orgSharedColors', ['header', 'body', 'button'], ['color', 'bg', 'link']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        }
      }
    }
  }
}
