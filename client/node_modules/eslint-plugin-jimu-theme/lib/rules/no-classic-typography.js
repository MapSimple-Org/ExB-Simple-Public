'use strict'
const {
  DocURL,
  getMatchNodeIdentifiers,
  getVariableMappingInNewTheme, reportMessages,
  TypographyVariantsMap,
  TypographyStylesMap,
  TypographyColorsMap,
  TypographyWeightsMap,
  TypographyLineHeightsMap,
  DefaultThemeAliases,
} = require('../utils')
/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'This rule facilitates the deprecation of `typography` variables in the classic theme and provides automatic fixes to replace these typography variables with variables from the new theme or fallback values.',
      recommended: false,
      url: `${DocURL}no-classic-colors.md`,
    },
    fixable: 'code',
    messages: {
      message: 'Deprecate classic theme typography variables and replace them with variables from the new theme or fallback values. (\'{{oldVar}}\' → \'{{newVar}}\')',
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
          },
          
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
        if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'variants', Object.keys(TypographyVariantsMap), Object.keys(TypographyStylesMap)], stop: themeAliases }, { value: variables, level: 2 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'variants', Object.keys(TypographyVariantsMap)], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'sizes', Object.keys(TypographyVariantsMap)], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'colors', Object.keys(TypographyColorsMap)], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'weights', Object.keys(TypographyWeightsMap)], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'lineHeights', Object.keys(TypographyLineHeightsMap)], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', ['fontFamilyBase', 'fontSizeRoot', 'fontSizeBase']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        }
      }
    }
  }
}
