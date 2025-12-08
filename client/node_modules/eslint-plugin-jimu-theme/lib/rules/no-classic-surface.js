'use strict'
const { DocURL, getMatchNodeIdentifiers, getVariableMappingInNewTheme, reportMessages, getSurfaceVariableStyleMappingInNewTheme, DefaultThemeAliases } = require('../utils')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'This rule facilitates the deprecation of `surfaces` variables in the classic theme and provides automatic fixes to replace these border variables with variables from the new theme or fallback values.',
      recommended: false,
      url: `${DocURL}no-classic-surface.md`,
    },
    fixable: 'code',
    messages: {
      message:
        'Deprecate classic theme surfaces variables and and replace them with variables from the new theme or fallback values. (\'{{oldVar}}\' → \'{{newVar}}\')',
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
        if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'surfaces', ['1', '2'], ['bg', 'shadow'],], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'surfaces', ['1', '2'], 'border', ['color', 'width', 'type'],], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'surfaces', ['1', '2'],], stop: themeAliases }, { value: variables, level: 1 }))) {
          const level = props[2].identifier
          const isSpreadElementArgument = node.parent && node.parent.type === 'SpreadElement'
          const fixedText = getSurfaceVariableStyleMappingInNewTheme(level, isSpreadElementArgument)
          reportMessages(node, context, fixedText)
        }
      },
    }
  },
}
