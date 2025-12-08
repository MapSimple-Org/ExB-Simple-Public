'use strict'
const { DocURL, getMatchNodeIdentifiers, getVariableMappingInNewTheme, reportMessages, DefaultThemeAliases } = require('../utils')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'This rule facilitates the deprecation of `sizes` variables in the classic theme and provides automatic fixes to replace these sizes variables with variables from the new theme.',
      recommended: false,
      url: `${DocURL}no-classic-sizes.md`,
    },
    fixable: 'code',
    messages: {
      message:
        'Deprecate classic theme sizes variables and replace them with variables from the new theme. (\'{{oldVar}}\' → \'{{newVar}}\')',
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
        if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'sizes', ['0', '1', '2', '3', '4', '5', '6'],], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        }
      },
    }
  },
}
