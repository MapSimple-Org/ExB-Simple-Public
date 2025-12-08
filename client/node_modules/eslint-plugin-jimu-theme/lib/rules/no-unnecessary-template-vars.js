'use strict'
const { DocURL } = require('../utils')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Remove unnecessary template string variables. Note: If it is used for theme upgrade, this rule should be called after other rules for upgrading the theme to fix abnormal results caused by the upgrade.',
      recommended: false,
      url: `${DocURL}no-unnecessary-template-vars.md`,
    },
    fixable: 'code',
    messages: {
      message: 'Prefer \'{{newVar}}\' over \'{{oldVar}}\''
    },
    schema: []
  },
  create: function (context) {
    const regexp1 = /^'\w+'$/g
    const regexp2 = /^-?\d+(\.\d+)?$/g
    const sourceCode = context.sourceCode
    return {
      TemplateLiteral(node) {
        node.expressions.forEach(expression => {
          if (expression.type === 'Literal') {
            while (regexp1.exec(expression.raw) !== null || regexp2.exec(expression.raw) !== null) {
              const start = expression.range[0] - 2
              const end = expression.range[1] + 1
              const fixedText = expression.value
              context.report({
                node: expression,
                loc: {
                  start: sourceCode.getLocFromIndex(start),
                  end: sourceCode.getLocFromIndex(end)
                },
                messageId: 'message',
                data: {
                  newVar: expression.value,
                  oldVar: `$\{${expression.raw}}`
                },
                fix: function (fixer) {
                  return fixer.replaceTextRange([start, end], fixedText)
                }
              })
            }
          }
        })
      }
    }
  }
}
