const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-border')

const validTests = [
  {
    code: 'const style = `border: 1px solid ${theme.sys.color.divider.primary};`'
  },
  {
    code: 'const component = () => { return <div style={{ margin: `1px solid ${theme.sys.color.divider.primary}` }} /> }'
  },
]

const invalidTests = [
  {
    code: 'const style = `border: ${theme.border.width} ${theme.border.type} ${theme.border.color};`',
    output: 'const style = `border: ${\'1px\'} ${\'solid\'} ${theme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-width: ${theme.border.width};`',
    output: 'const style = `border-width: ${\'1px\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.border.color};`',
    output: 'const style = `border-color: ${theme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderStyle: theme.border.type }} /> }',
    output: 'const component = () => { return <div style={{ borderStyle: \'solid\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `${theme.border.width} ${theme.border.type} ${theme.border.color}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `${\'1px\'} ${\'solid\'} ${theme.sys.color.divider.primary}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border: ${theme.border.width} ${theme.border.type} ${theme?.border.color};`',
    output: 'const style = `border: ${\'1px\'} ${\'solid\'} ${theme?.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.border?.color};`',
    output: 'const style = `border-color: ${theme.sys.color.divider?.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `${theme.border.width} ${theme.border.type} ${theme?.border.color}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `${\'1px\'} ${\'solid\'} ${theme?.sys.color.divider.primary}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border: ${props.theme.border.width} ${props.theme.border.type} ${props.theme.border.color};`',
    output: 'const style = `border: ${\'1px\'} ${\'solid\'} ${props.theme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-width: ${props.theme.border.width};`',
    output: 'const style = `border-width: ${\'1px\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.border.color};`',
    output: 'const style = `border-color: ${props.theme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderStyle: props.theme.border.type }} /> }',
    output: 'const component = () => { return <div style={{ borderStyle: \'solid\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `${props.theme.border.width} ${props.theme.border.type} ${props.theme.border.color}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `${\'1px\'} ${\'solid\'} ${props.theme.sys.color.divider.primary}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border: ${props.theme.border.width} ${props.theme.border.type} ${theme?.border.color};`',
    output: 'const style = `border: ${\'1px\'} ${\'solid\'} ${theme?.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.border?.color};`',
    output: 'const style = `border-color: ${props.theme.sys.color.divider?.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `${props.theme.border.width} ${props.theme.border.type} ${theme?.border.color}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `${\'1px\'} ${\'solid\'} ${theme?.sys.color.divider.primary}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  
  {
    code: 'const border = theme.border; const style = `border: ${border.width} ${border.type} ${border.color};`',
    output: 'const border = theme.border; const style = `border: ${\'1px\'} ${\'solid\'} ${theme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const border = theme.border; const style = `border-width: ${border.width};`',
    output: 'const border = theme.border; const style = `border-width: ${\'1px\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const border = theme.border; const style = `border-color: ${border.color};`',
    output: 'const border = theme.border; const style = `border-color: ${theme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const border = theme.border; return <div style={{ borderStyle: theme.border.type }} /> }',
    output: 'const component = () => { const border = theme.border; return <div style={{ borderStyle: \'solid\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const border = theme.border; const style = `border-color: ${border?.color};`',
    output: 'const border = theme.border; const style = `border-color: ${theme.sys.color.divider?.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const border = theme.border; return <div style={{ border: `${border.width} ${border.type} ${border.color}` }} /> }',
    output: 'const component = () => { const border = theme.border; return <div style={{ border: `${\'1px\'} ${\'solid\'} ${theme.sys.color.divider.primary}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border: ${theme2.border.width} ${theme2.border.type} ${theme2.border.color};`',
    output: 'const style = `border: ${\'1px\'} ${\'solid\'} ${theme2.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.border.color};`',
    output: 'const style = `border-color: ${theme2.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border: ${props.theme2.border.width} ${props.theme2.border.type} ${props.theme2.border.color};`',
    output: 'const style = `border: ${\'1px\'} ${\'solid\'} ${props.theme2.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme2.border.color};`',
    output: 'const style = `border-color: ${props.theme2.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderStyle: props.theme2.border.type }} /> }',
    output: 'const component = () => { return <div style={{ borderStyle: \'solid\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const border = theme2.border; const style = `border: ${border.width} ${border.type} ${border.color};`',
    output: 'const border = theme2.border; const style = `border: ${\'1px\'} ${\'solid\'} ${theme2.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const border = theme2.border; const style = `border-color: ${border.color};`',
    output: 'const border = theme2.border; const style = `border-color: ${theme2.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border: ${builderTheme.border.width} ${builderTheme.border.type} ${builderTheme.border.color};`',
    output: 'const style = `border: ${\'1px\'} ${\'solid\'} ${builderTheme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${builderTheme.border.color};`',
    output: 'const style = `border-color: ${builderTheme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border: ${props.builderTheme.border.width} ${props.builderTheme.border.type} ${props.builderTheme.border.color};`',
    output: 'const style = `border: ${\'1px\'} ${\'solid\'} ${props.builderTheme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.builderTheme.border.color};`',
    output: 'const style = `border-color: ${props.builderTheme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderStyle: props.builderTheme.border.type }} /> }',
    output: 'const component = () => { return <div style={{ borderStyle: \'solid\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const border = builderTheme.border; const style = `border: ${border.width} ${border.type} ${border.color};`',
    output: 'const border = builderTheme.border; const style = `border: ${\'1px\'} ${\'solid\'} ${builderTheme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const border = builderTheme.border; const style = `border-color: ${border.color};`',
    output: 'const border = builderTheme.border; const style = `border-color: ${builderTheme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border: ${this.theme.border.width} ${this.theme.border.type} ${this.theme.border.color};`',
    output: 'const style = `border: ${\'1px\'} ${\'solid\'} ${this.theme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${this.theme.border.color};`',
    output: 'const style = `border-color: ${this.theme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const border = this.theme.border; const style = `border: ${border.width} ${border.type} ${border.color};`',
    output: 'const border = this.theme.border; const style = `border: ${\'1px\'} ${\'solid\'} ${theme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const border = this.theme.border; const style = `border-color: ${border.color};`',
    output: 'const border = this.theme.border; const style = `border-color: ${theme.sys.color.divider.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
]

ruleTester.run('no-classic-border', rule, {
  valid: validTests,
  invalid: invalidTests
})

module.exports = { validTests, invalidTests }