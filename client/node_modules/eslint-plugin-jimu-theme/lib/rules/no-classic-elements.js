'use strict'
const { DocURL, FontStyles, getMatchNodeIdentifiers, getVariableMappingInNewTheme, reportMessages, DefaultThemeAliases } = require('../utils')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'This rule facilitates the deprecation of elements(e.g header, footer, body, link) variables in the classic theme and provides automatic fixes to replace these elements variables with variables from the new theme or fallback values.',
      recommended: false,
      url: `${DocURL}no-classic-elements.md`,
    },
    fixable: 'code',
    messages: {
      message:
        'Deprecate classic theme elements(e.g header, footer, body, link) variables and and replace them with variables from the new theme or fallback values. (\'{{oldVar}}\' → \'{{newVar}}\')',
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
        if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'header', ['color', 'bg'],], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if (
          (props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'footer', ['color', 'bg'],], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'body', ['color', 'bg', ...FontStyles],], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'link', ['color', 'decoration'],], stop: themeAliases }, { value: variables, level: 1 }))
        ) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'link', 'hover', ['color', 'decoration'],], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        }
      },
    }
  },
}
