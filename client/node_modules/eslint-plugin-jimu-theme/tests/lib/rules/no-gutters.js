const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-gutters')


ruleTester.run('no-gutters', rule, {
  valid: [
    {
      code: 'const style = `margin: 1px};`'
    },
    {
      code: 'const component = () => { return <div style={{ margin: \'1px\' }} /> }'
    },
  ],

  invalid: [
    {
      code: 'const style = `margin: ${theme.gutters[1]};`',
      output: 'const style = `margin: ${\'1px\'};`',
      errors: [{ messageId: 'message', type: 'MemberExpression' }]
    },
    {
      code: 'const style = `margin: ${theme.gutters[0]};`',
      output: 'const style = `margin: ${\'0px\'};`',
      errors: [{ messageId: 'message', type: 'MemberExpression' }]
    },
    {
      code: 'const gutters= theme.gutters; const style = `margin: ${gutters[5]};`',
      output: 'const gutters= theme.gutters; const style = `margin: ${\'10px\'};`',
      errors: [{ messageId: 'message', type: 'MemberExpression' }]
    },
    {
      code: 'const component = () => { return <div style={{ margin: theme.gutters[1] }} /> }',
      output: 'const component = () => { return <div style={{ margin: \'1px\' }} /> }',
      errors: [{ messageId: 'message', type: 'MemberExpression' }]
    },
    {
      code: 'const component = () => { const gutters= theme.gutters; return <div style={{ margin: gutters[5] }} /> }',
      output: 'const component = () => { const gutters= theme.gutters; return <div style={{ margin: \'10px\' }} /> }',
      errors: [{ messageId: 'message', type: 'MemberExpression' }]
    },
    {
      code: 'const style = `margin: ${theme?.gutters[1]};`',
      output: 'const style = `margin: ${\'1px\'};`',
      errors: [{ messageId: 'message', type: 'MemberExpression' }]
    },
    {
      code: 'const component = () => { return <div style={{ margin: theme.gutters?.[1] }} /> }',
      output: 'const component = () => { return <div style={{ margin: \'1px\' }} /> }',
      errors: [{ messageId: 'message', type: 'MemberExpression' }]
    },
    {
      code: 'const component = () => { const gutters= theme.gutters; return <div style={{ margin: gutters?.[5] }} /> }',
      output: 'const component = () => { const gutters= theme.gutters; return <div style={{ margin: \'10px\' }} /> }',
      errors: [{ messageId: 'message', type: 'MemberExpression' }]
    },
  ]
})
