const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-sizes')

const validTests = [
  {
    code: 'const style = `margin: ${theme.sys.spacing(1)}};`'
  },
  {
    code: 'const component = () => { return <div style={{ margin: theme.sys.spacing(2) }} /> }'
  },
]

const invalidTests = [
  {
    code: 'const style = `margin: ${theme.sizes[1]};`',
    output: 'const style = `margin: ${theme.sys.spacing(1)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `margin: ${theme.sizes[0]};`',
    output: 'const style = `margin: ${theme.sys.spacing(0)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ margin: theme.sizes[1] }} /> }',
    output: 'const component = () => { return <div style={{ margin: theme.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `margin: ${theme?.sizes[1]};`',
    output: 'const style = `margin: ${theme?.sys.spacing(1)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `margin: ${theme.sizes?.[0]};`',
    output: 'const style = `margin: ${theme.sys.spacing?.(0)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ margin: theme?.sizes[1] }} /> }',
    output: 'const component = () => { return <div style={{ margin: theme?.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `margin: ${props.theme.sizes[1]};`',
    output: 'const style = `margin: ${props.theme.sys.spacing(1)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `margin: ${props.theme.sizes[0]};`',
    output: 'const style = `margin: ${props.theme.sys.spacing(0)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ margin: props.theme.sizes[1] }} /> }',
    output: 'const component = () => { return <div style={{ margin: props.theme.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `margin: ${props.theme?.sizes[1]};`',
    output: 'const style = `margin: ${props.theme?.sys.spacing(1)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `margin: ${props.theme.sizes?.[0]};`',
    output: 'const style = `margin: ${props.theme.sys.spacing?.(0)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ margin: props.theme?.sizes[1] }} /> }',
    output: 'const component = () => { return <div style={{ margin: props.theme?.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const sizes = theme.sizes; const style = `margin: ${sizes[1]};`',
    output: 'const sizes = theme.sizes; const style = `margin: ${theme.sys.spacing(1)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const sizes = theme.sizes; const style = `margin: ${sizes[0]};`',
    output: 'const sizes = theme.sizes; const style = `margin: ${theme.sys.spacing(0)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const sizes = theme.sizes; return <div style={{ margin: sizes[1] }} /> }',
    output: 'const component = () => { const sizes = theme.sizes; return <div style={{ margin: theme.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const sizes = theme.sizes; const style = `margin: ${theme?.sizes[1]};`',
    output: 'const sizes = theme.sizes; const style = `margin: ${theme?.sys.spacing(1)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const sizes = theme.sizes; const style = `margin: ${sizes?.[0]};`',
    output: 'const sizes = theme.sizes; const style = `margin: ${theme.sys.spacing?.(0)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const sizes = theme.sizes; return <div style={{ margin: theme?.sizes[1] }} /> }',
    output: 'const component = () => { const sizes = theme.sizes; return <div style={{ margin: theme?.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `margin: ${theme2.sizes[1]};`',
    output: 'const style = `margin: ${theme2.sys.spacing(1)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ margin: theme2.sizes[1] }} /> }',
    output: 'const component = () => { return <div style={{ margin: theme2.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const sizes = theme2.sizes; const style = `margin: ${sizes[0]};`',
    output: 'const sizes = theme2.sizes; const style = `margin: ${theme2.sys.spacing(0)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const sizes = theme2.sizes; return <div style={{ margin: sizes[1] }} /> }',
    output: 'const component = () => { const sizes = theme2.sizes; return <div style={{ margin: theme2.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `margin: ${builderTheme.sizes[1]};`',
    output: 'const style = `margin: ${builderTheme.sys.spacing(1)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ margin: builderTheme.sizes[1] }} /> }',
    output: 'const component = () => { return <div style={{ margin: builderTheme.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const sizes = builderTheme.sizes; const style = `margin: ${sizes[0]};`',
    output: 'const sizes = builderTheme.sizes; const style = `margin: ${builderTheme.sys.spacing(0)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const sizes = builderTheme.sizes; return <div style={{ margin: sizes[1] }} /> }',
    output: 'const component = () => { const sizes = builderTheme.sizes; return <div style={{ margin: builderTheme.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `margin: ${this.theme.sizes[1]};`',
    output: 'const style = `margin: ${this.theme.sys.spacing(1)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ margin: this.theme.sizes[1] }} /> }',
    output: 'const component = () => { return <div style={{ margin: this.theme.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const sizes = this.theme.sizes; const style = `margin: ${sizes[0]};`',
    output: 'const sizes = this.theme.sizes; const style = `margin: ${theme.sys.spacing(0)};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const sizes = this.theme.sizes; return <div style={{ margin: sizes[1] }} /> }',
    output: 'const component = () => { const sizes = this.theme.sizes; return <div style={{ margin: theme.sys.spacing(1) }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
]


ruleTester.run('no-classic-sizes', rule, {
  valid: validTests,
  invalid: invalidTests
})

module.exports = { validTests, invalidTests }
