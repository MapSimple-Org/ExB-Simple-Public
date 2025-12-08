'use strict'
const { DocURL, getMatchNodeIdentifiers, DefaultThemeAliases, NewThemeColors, NewThemeColorShade } = require('../utils')

const regexp = /var\(--sys-color-\b(primary|secondary|error|warning|info|success)-\b(light|main|dark)\)/g
const sharedThemeRegexp = /var\(--mixin-shared-theme-\b(header|body|button)-\b(color|bg|link)\)/g
const SystemColors = NewThemeColors.filter(color => color !== 'neutral')

function reportLiteral(context, node, match, isTemplateLiteral) {
  const colorName = match[1]
  const colorShade = match[2]
  if (!colorName && !colorShade) return

  const variable = match[0]

  const reports = {
    node: node,
    messageId: 'message',
    data: { variable }
  }
  if (isTemplateLiteral) {
    const start = node.range[0] + match.index + 1
    const end = start + match[0].length
    reports.loc = {
      start: context.sourceCode.getLocFromIndex(start),
      end: context.sourceCode.getLocFromIndex(end),
    }
  }
  context.report(reports)
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'This rule is meant to identify the improper use of theme color variables in widgets or components.',
      recommended: false,
      url: `${DocURL}no-improperly-color.md`,
    },
    fixable: 'code',
    messages: {
      message: 'The theme color variable `{{variable}}` may be used inappropriately. Please consider replacing it with a theme color variable that better suits the current context.',
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
  create: function (context) {
    const option = context.options[0] || {}
    const themeAliases = option.themeAliases || DefaultThemeAliases

    return {
      MemberExpression(node) {
        const variables = context.sourceCode.getScope(node).variables
        if ((getMatchNodeIdentifiers(node, { value: [themeAliases, 'sys', 'color', SystemColors, NewThemeColorShade], stop: themeAliases }, { value: variables, level: 2 }, true))) {
          const variable = context.sourceCode.getText(node)
          context.report({
            node: node,
            messageId: 'message',
            data: {  variable }
          })
        } else if ((getMatchNodeIdentifiers(node, { value: [themeAliases, 'mixin', 'sharedTheme', ['header', 'body', 'button'], ['bg', 'color', 'link']], stop: themeAliases }, { value: variables, level: 2 }, true))) {
          const variable = context.sourceCode.getText(node)
          context.report({
            node: node,
            messageId: 'message',
            data: { variable }
          })
        }
      },
      Literal(node) {
        if (typeof node.value === 'string') {
          const text = node.value
          let match
          while ((match = regexp.exec(text)) !== null) {
            reportLiteral(context, node, match, false)
          }
          while ((match = sharedThemeRegexp.exec(text)) !== null) {
            reportLiteral(context, node, match, false)
          }
        }
      },
      TemplateLiteral(node) {
        node.quasis.forEach((quasi) => {
          if (quasi.value && typeof quasi.value.raw === 'string') {
            const text = quasi.value.raw
            let match
            while ((match = regexp.exec(text)) !== null) {
              reportLiteral(context, node, match, true)
            }
            while ((match = sharedThemeRegexp.exec(text)) !== null) {
              reportLiteral(context, node, match, true)
            }
          }
        })
      }
    }
  },
}
