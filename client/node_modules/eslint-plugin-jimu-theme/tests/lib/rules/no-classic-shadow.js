const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-shadow')

const validTests = [
  {
    code: 'const style = `box-shadow: none;`'
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: theme.sys.shadow.shadow2 }} /> }'
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: theme.sys.shadow.shadow3 }} /> }'
  },
]

const invalidTests = [
  {
    code: 'const style = `box-shadow: ${theme.boxShadows.default};`',
    output: 'const style = `box-shadow: ${theme.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${theme.boxShadows.lg};`',
    output: 'const style = `box-shadow: ${theme.sys.shadow.shadow3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${theme.boxShadows.none};`',
    output: 'const style = `box-shadow: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${theme.boxShadows.sm};`',
    output: 'const style = `box-shadow: ${theme.sys.shadow.shadow1};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: theme.boxShadows.default }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: theme.sys.shadow.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: theme.boxShadows.lg }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: theme.sys.shadow.shadow3 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: theme.boxShadows.none }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: \'none\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: theme.boxShadows.sm }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: theme.sys.shadow.shadow1 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${theme?.boxShadows.default};`',
    output: 'const style = `box-shadow: ${theme?.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${theme.boxShadows?.lg};`',
    output: 'const style = `box-shadow: ${theme.sys.shadow?.shadow3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${theme?.boxShadows.none};`',
    output: 'const style = `box-shadow: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${theme.boxShadows?.sm};`',
    output: 'const style = `box-shadow: ${theme.sys.shadow?.shadow1};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: theme.boxShadows?.default }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: theme.sys.shadow?.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: theme?.boxShadows.lg }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: theme?.sys.shadow.shadow3 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: theme?.boxShadows.none }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: \'none\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: theme.boxShadows?.sm }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: theme.sys.shadow?.shadow1 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `box-shadow: ${props.theme.boxShadows.default};`',
    output: 'const style = `box-shadow: ${props.theme.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${props.theme.boxShadows.lg};`',
    output: 'const style = `box-shadow: ${props.theme.sys.shadow.shadow3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${props.theme.boxShadows.none};`',
    output: 'const style = `box-shadow: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${props.theme.boxShadows.sm};`',
    output: 'const style = `box-shadow: ${props.theme.sys.shadow.shadow1};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: props.theme.boxShadows.default }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: props.theme.sys.shadow.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: props.theme.boxShadows.lg }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: props.theme.sys.shadow.shadow3 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: props.theme.boxShadows.none }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: \'none\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: props.theme.boxShadows.sm }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: props.theme.sys.shadow.shadow1 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${props.theme?.boxShadows.default};`',
    output: 'const style = `box-shadow: ${props.theme?.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${props.theme.boxShadows?.lg};`',
    output: 'const style = `box-shadow: ${props.theme.sys.shadow?.shadow3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${props.theme?.boxShadows.none};`',
    output: 'const style = `box-shadow: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `box-shadow: ${props.theme.boxShadows?.sm};`',
    output: 'const style = `box-shadow: ${props.theme.sys.shadow?.shadow1};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: props.theme.boxShadows?.default }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: props.theme.sys.shadow?.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: props.theme?.boxShadows.lg }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: props.theme?.sys.shadow.shadow3 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: props.theme?.boxShadows.none }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: \'none\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: props.theme.boxShadows?.sm }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: props.theme.sys.shadow?.shadow1 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${boxShadows.default};`',
    output: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${theme.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${boxShadows.lg};`',
    output: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${theme.sys.shadow.shadow3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${boxShadows.none};`',
    output: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${boxShadows.sm};`',
    output: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${theme.sys.shadow.shadow1};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: boxShadows.default }} /> }',
    output: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: theme.sys.shadow.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: boxShadows.lg }} /> }',
    output: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: theme.sys.shadow.shadow3 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: boxShadows.none }} /> }',
    output: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: \'none\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: boxShadows.sm }} /> }',
    output: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: theme.sys.shadow.shadow1 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${theme?.boxShadows.default};`',
    output: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${theme?.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${boxShadows?.lg};`',
    output: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${theme.sys.shadow?.shadow3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${theme?.boxShadows.none};`',
    output: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${boxShadows?.sm};`',
    output: 'const boxShadows = theme.boxShadows; const style = `box-shadow: ${theme.sys.shadow?.shadow1};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: boxShadows?.default }} /> }',
    output: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: theme.sys.shadow?.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: theme?.boxShadows.lg }} /> }',
    output: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: theme?.sys.shadow.shadow3 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: theme?.boxShadows.none }} /> }',
    output: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: \'none\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: boxShadows?.sm }} /> }',
    output: 'const component = () => { const boxShadows = theme.boxShadows; return <div style={{ boxShadow: theme.sys.shadow?.shadow1 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `box-shadow: ${theme2.boxShadows.lg};`',
    output: 'const style = `box-shadow: ${theme2.sys.shadow.shadow3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: theme2.boxShadows.default }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: theme2.sys.shadow.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const boxShadows = theme2.boxShadows; const style = `box-shadow: ${boxShadows.default};`',
    output: 'const boxShadows = theme2.boxShadows; const style = `box-shadow: ${theme2.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const boxShadows = theme2.boxShadows; return <div style={{ boxShadow: boxShadows.default }} /> }',
    output: 'const component = () => { const boxShadows = theme2.boxShadows; return <div style={{ boxShadow: theme2.sys.shadow.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `box-shadow: ${builderTheme.boxShadows.lg};`',
    output: 'const style = `box-shadow: ${builderTheme.sys.shadow.shadow3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: builderTheme.boxShadows.default }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: builderTheme.sys.shadow.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const boxShadows = builderTheme.boxShadows; const style = `box-shadow: ${boxShadows.default};`',
    output: 'const boxShadows = builderTheme.boxShadows; const style = `box-shadow: ${builderTheme.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const boxShadows = builderTheme.boxShadows; return <div style={{ boxShadow: boxShadows.default }} /> }',
    output: 'const component = () => { const boxShadows = builderTheme.boxShadows; return <div style={{ boxShadow: builderTheme.sys.shadow.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `box-shadow: ${this.theme.boxShadows.lg};`',
    output: 'const style = `box-shadow: ${this.theme.sys.shadow.shadow3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: this.theme.boxShadows.default }} /> }',
    output: 'const component = () => { return <div style={{ boxShadow: this.theme.sys.shadow.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const boxShadows = this.theme.boxShadows; const style = `box-shadow: ${boxShadows.default};`',
    output: 'const boxShadows = this.theme.boxShadows; const style = `box-shadow: ${theme.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const boxShadows = this.theme.boxShadows; return <div style={{ boxShadow: boxShadows.default }} /> }',
    output: 'const component = () => { const boxShadows = this.theme.boxShadows; return <div style={{ boxShadow: theme.sys.shadow.shadow2 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  }
]


ruleTester.run('no-classic-shadow', rule, {
  valid: validTests,
  invalid: invalidTests
})

module.exports = { validTests, invalidTests }

