'use strict'
const { DocURL, getColorCSSVariableMappingInNewTheme, getSharedColorCSSVariableMappingInNewTheme } = require('../utils')
const { minimatch } = require('minimatch')

const regex1 = /var\(--\b(primary|secondary|danger|warning|info|success|light|dark)-\b(100|200|300|400|500|600|700|800|900)\)/g
const regex2 = /var\(--\b(primary|secondary|danger|warning|info|success|white|black|light|dark|transparent)\)/g
const regex3 = /var\(--\borg-\b(body|header|button)-\b(color|bg|link)\)/g

function reportLiteral(context, node, match, isTemplateLiteral, isSharedColor, invertShadeLightDark) {
  const oldVar = match[0]
  const colorName = match[1]
  const colorShade = match[2]
  if (!colorName && !colorShade) return
  const newVar = isSharedColor
    ? getSharedColorCSSVariableMappingInNewTheme(colorName, colorShade)
    : getColorCSSVariableMappingInNewTheme(colorName, colorShade, invertShadeLightDark)

  const reports = {
    node: node,
    messageId: 'message',
    data: { oldVar, newVar },
  }
  if (isTemplateLiteral) {
    const start = node.range[0] + match.index + 1
    const end = start + match[0].length
    reports.loc = {
      start: context.sourceCode.getLocFromIndex(start),
      end: context.sourceCode.getLocFromIndex(end),
    }
    reports.fix = function (fixer) {
      return fixer.replaceTextRange([start, end], newVar)
    }
  } else {
    const quote = node.raw.startsWith('"') ? '"' : '\''
    const fixedText = `${quote}${node.value.replace(oldVar, newVar)}${quote}`
    reports.fix = function (fixer) {
      return fixer.replaceText(node, fixedText)
    }
  }
  context.report(reports)
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'This rule facilitates the transition of CSS variables representing colors from the classic theme to the new theme.',
      recommended: false,
      url: `${DocURL}no-classic-css-vars.md`,
    },
    fixable: 'code',
    messages: {
      message: 'Upgrade CSS variables representing colors from the classic theme ({{oldVar}}) to the new theme ({{newVar}}).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          invertShadeLightDarkPaths: {
            type: 'array',
            items: { type: 'string' },
            default: ['builder/**/*.{ts,tsx}'],
            description: 'Each item of this option is a glob-expression string. When automatically fixing theme color variables in the matched files, the light and dark shades are reversed.'
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create: function (context) {
    const options = context.options[0] || {}
    const invertShadeLightDarkPaths = options.invertShadeLightDarkPaths || ['**/client/builder/**/*.{ts,tsx}']
    const filePath = context.filename
    const invertShadeLightDark = invertShadeLightDarkPaths.some((pattern) => minimatch(filePath, pattern))

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          const text = node.value
          let match
          while ((match = regex1.exec(text)) !== null) {
            reportLiteral(context, node, match, false, false, invertShadeLightDark)
          }
          while ((match = regex2.exec(text)) !== null) {
            reportLiteral(context, node, match, false, false, invertShadeLightDark)
          }
          while ((match = regex3.exec(text)) !== null) {
            reportLiteral(context, node, match, false, true, invertShadeLightDark)
          }
        }
      },
      TemplateLiteral(node) {
        node.quasis.forEach((quasi) => {
          if (quasi.value && typeof quasi.value.raw === 'string') {
            const text = quasi.value.raw
            let match
            while ((match = regex1.exec(text)) !== null) {
              reportLiteral(context, node, match, true, false, invertShadeLightDark)
            }
            while ((match = regex2.exec(text)) !== null) {
              reportLiteral(context, node, match, true, false, invertShadeLightDark)
            }
            while ((match = regex3.exec(text)) !== null) {
              reportLiteral(context, node, match, true, true, invertShadeLightDark)
            }
          }
        })
      }
    }
  },
}
