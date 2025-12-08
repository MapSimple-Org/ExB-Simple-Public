const { ruleTester } = require('../utils.js')
const rule = require('../../../lib/rules/no-unnecessary-template-vars.js')

ruleTester.run('no-unnecessary-template-vars.js', rule, {
  valid: [
    {
      code: 'const style = `color: transparent;`'
    },
    {
      code: 'const style = `margin: 1px;`'
    }
  ],
  invalid: [
    {
      code: 'const style = `color: ${\'transparent\'};`',
      output: 'const style = `color: transparent;`',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const style = `margin: ${\'1px\'};`',
      output: 'const style = `margin: 1px;`',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const style = `line-height: ${10};`',
      output: 'const style = `line-height: 10;`',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const style = `line-height: ${1.5};`',
      output: 'const style = `line-height: 1.5;`',
      errors: [{ messageId: 'message', type: 'Literal' }]
    }
  ],
})
