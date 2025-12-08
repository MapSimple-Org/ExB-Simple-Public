const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-focused-styles')

const validTests = [
  {
    code: 'const style = `outline: 2px solid ${theme.sys.color.action.focus};`'
  },
  {
    code: 'const component = () => { return <div style={{ outline: `2px solid ${theme.sys.color.action.focus}` }} /> }'
  },
]

const invalidTests = [
  {
    code: 'const style = `outline: ${theme.focusedStyles.width} solid ${theme.focusedStyles.color};`',
    output: 'const style = `outline: ${\'2px\'} solid ${theme.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `outline-width: ${theme.focusedStyles.width};`',
    output: 'const style = `outline-width: ${\'2px\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `outline-color: ${theme.focusedStyles.color};`',
    output: 'const style = `outline-color: ${theme.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ outline: `${theme.focusedStyles.width} solid ${theme.focusedStyles.color}` }} /> }',
    output: 'const component = () => { return <div style={{ outline: `${\'2px\'} solid ${theme.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `outline: ${theme.focusedStyles.width} solid ${theme?.focusedStyles.color};`',
    output: 'const style = `outline: ${\'2px\'} solid ${theme?.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `outline-color: ${theme.focusedStyles?.color};`',
    output: 'const style = `outline-color: ${theme.sys.color.action?.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ outline: `${theme.focusedStyles.width} solid ${theme?.focusedStyles.color}` }} /> }',
    output: 'const component = () => { return <div style={{ outline: `${\'2px\'} solid ${theme?.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `outline: ${props.theme.focusedStyles.width} solid ${props.theme.focusedStyles.color};`',
    output: 'const style = `outline: ${\'2px\'} solid ${props.theme.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `outline-width: ${props.theme.focusedStyles.width};`',
    output: 'const style = `outline-width: ${\'2px\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `outline-color: ${props.theme.focusedStyles.color};`',
    output: 'const style = `outline-color: ${props.theme.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ outline: `${props.theme.focusedStyles.width} solid ${props.theme.focusedStyles.color}` }} /> }',
    output: 'const component = () => { return <div style={{ outline: `${\'2px\'} solid ${props.theme.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `outline: ${props.theme.focusedStyles.width} solid ${props.theme?.focusedStyles.color};`',
    output: 'const style = `outline: ${\'2px\'} solid ${props.theme?.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `outline-color: ${props.theme.focusedStyles?.color};`',
    output: 'const style = `outline-color: ${props.theme.sys.color.action?.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ outline: `${props.theme.focusedStyles.width} solid ${props.theme?.focusedStyles.color}` }} /> }',
    output: 'const component = () => { return <div style={{ outline: `${\'2px\'} solid ${props.theme?.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const focusedStyles = theme.focusedStyles; const style = `outline: ${focusedStyles.width} solid ${focusedStyles.color};`',
    output: 'const focusedStyles = theme.focusedStyles; const style = `outline: ${\'2px\'} solid ${theme.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const focusedStyles = theme.focusedStyles; const style = `outline-width: ${focusedStyles.width};`',
    output: 'const focusedStyles = theme.focusedStyles; const style = `outline-width: ${\'2px\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const focusedStyles = theme.focusedStyles; const style = `outline-color: ${focusedStyles.color};`',
    output: 'const focusedStyles = theme.focusedStyles; const style = `outline-color: ${theme.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const focusedStyles = theme.focusedStyles; return <div style={{ outline: `${focusedStyles.width} solid ${focusedStyles.color}` }} /> }',
    output: 'const component = () => { const focusedStyles = theme.focusedStyles; return <div style={{ outline: `${\'2px\'} solid ${theme.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const focusedStyles = theme.focusedStyles; const style = `outline: ${focusedStyles.width} solid ${theme?.focusedStyles.color};`',
    output: 'const focusedStyles = theme.focusedStyles; const style = `outline: ${\'2px\'} solid ${theme?.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const focusedStyles = theme.focusedStyles; const style = `outline-color: ${focusedStyles?.color};`',
    output: 'const focusedStyles = theme.focusedStyles; const style = `outline-color: ${theme.sys.color.action?.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const focusedStyles = theme.focusedStyles; return <div style={{ outline: `${focusedStyles.width} solid ${theme?.focusedStyles.color}` }} /> }',
    output: 'const component = () => { const focusedStyles = theme.focusedStyles; return <div style={{ outline: `${\'2px\'} solid ${theme?.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `outline: ${theme2.focusedStyles.width} solid ${theme2.focusedStyles.color};`',
    output: 'const style = `outline: ${\'2px\'} solid ${theme2.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ outline: `${theme2.focusedStyles.width} solid ${theme2.focusedStyles.color}` }} /> }',
    output: 'const component = () => { return <div style={{ outline: `${\'2px\'} solid ${theme2.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const focusedStyles = theme2.focusedStyles; const style = `outline: ${focusedStyles.width} solid ${focusedStyles.color};`',
    output: 'const focusedStyles = theme2.focusedStyles; const style = `outline: ${\'2px\'} solid ${theme2.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const focusedStyles = theme2.focusedStyles; return <div style={{ outline: `${focusedStyles.width} solid ${focusedStyles.color}` }} /> }',
    output: 'const component = () => { const focusedStyles = theme2.focusedStyles; return <div style={{ outline: `${\'2px\'} solid ${theme2.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `outline: ${builderTheme.focusedStyles.width} solid ${builderTheme.focusedStyles.color};`',
    output: 'const style = `outline: ${\'2px\'} solid ${builderTheme.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ outline: `${builderTheme.focusedStyles.width} solid ${builderTheme.focusedStyles.color}` }} /> }',
    output: 'const component = () => { return <div style={{ outline: `${\'2px\'} solid ${builderTheme.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const focusedStyles = builderTheme.focusedStyles; const style = `outline: ${focusedStyles.width} solid ${focusedStyles.color};`',
    output: 'const focusedStyles = builderTheme.focusedStyles; const style = `outline: ${\'2px\'} solid ${builderTheme.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const focusedStyles = builderTheme.focusedStyles; return <div style={{ outline: `${focusedStyles.width} solid ${focusedStyles.color}` }} /> }',
    output: 'const component = () => { const focusedStyles = builderTheme.focusedStyles; return <div style={{ outline: `${\'2px\'} solid ${builderTheme.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `outline: ${this.theme.focusedStyles.width} solid ${this.theme.focusedStyles.color};`',
    output: 'const style = `outline: ${\'2px\'} solid ${this.theme.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ outline: `${this.theme.focusedStyles.width} solid ${this.theme.focusedStyles.color}` }} /> }',
    output: 'const component = () => { return <div style={{ outline: `${\'2px\'} solid ${this.theme.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const focusedStyles = this.theme.focusedStyles; const style = `outline: ${focusedStyles.width} solid ${focusedStyles.color};`',
    output: 'const focusedStyles = this.theme.focusedStyles; const style = `outline: ${\'2px\'} solid ${theme.sys.color.action.focus};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const focusedStyles = this.theme.focusedStyles; return <div style={{ outline: `${focusedStyles.width} solid ${focusedStyles.color}` }} /> }',
    output: 'const component = () => { const focusedStyles = this.theme.focusedStyles; return <div style={{ outline: `${\'2px\'} solid ${theme.sys.color.action.focus}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
]


ruleTester.run('no-classic-focused-styles', rule, {
  valid: validTests,

  invalid: invalidTests
})

module.exports = { validTests, invalidTests }
