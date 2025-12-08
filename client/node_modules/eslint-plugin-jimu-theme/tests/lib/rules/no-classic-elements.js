const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-elements')

const validTests = [
  {
    code: 'const style = `color: ${theme.sys?.color.surface.headerText};`'
  },
]

const invalidTests = [
  {
    code: 'const style = `color: ${theme.header.color};`',
    output: 'const style = `color: ${theme.sys?.color.surface.headerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme?.footer.color};`',
    output: 'const style = `color: ${theme?.sys?.color.surface.footerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.footer?.color};`',
    output: 'const style = `color: ${theme.sys?.color.surface?.footerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme?.link.color};`',
    output: 'const style = `color: ${theme?.sys.color.action.link.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme?.link?.color};`',
    output: 'const style = `color: ${theme?.sys.color.action.link?.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `text-decoration: ${theme?.link.decoration};`',
    output: 'const style = `text-decoration: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme?.link?.hover.color};`',
    output: 'const style = `color: ${theme?.sys.color.action.link?.hover};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `text-decoration: ${theme?.link.hover.decoration};`',
    output: 'const style = `text-decoration: ${\'underline\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.body.bg};`',
    output: 'const style = `color: ${theme.sys.color.surface.background};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.body.color};`',
    output: 'const style = `color: ${theme.sys.color.surface.backgroundText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.body.fontFamily};`',
    output: 'const style = `color: ${theme.sys.typography.body2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.body.fontWeight};`',
    output: 'const style = `color: ${theme.sys.typography.body2.fontWeight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.body.fontSize};`',
    output: 'const style = `color: ${theme.sys.typography.body2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.body.lineHeight};`',
    output: 'const style = `color: ${theme.sys.typography.body2.lineHeight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.body.fontStyle};`',
    output: 'const style = `color: ${\'unset\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme?.body.bg};`',
    output: 'const style = `color: ${theme?.sys.color.surface.background};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.body?.color};`',
    output: 'const style = `color: ${theme.sys.color.surface?.backgroundText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme?.body?.fontFamily};`',
    output: 'const style = `color: ${theme?.sys.typography.body2?.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `color: ${this.props.theme.header.color};`',
    output: 'const style = `color: ${this.props.theme.sys?.color.surface.headerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme?.footer.color};`',
    output: 'const style = `color: ${this.props.theme?.sys?.color.surface.footerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme.footer?.color};`',
    output: 'const style = `color: ${this.props.theme.sys?.color.surface?.footerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme?.link.color};`',
    output: 'const style = `color: ${this.props.theme?.sys.color.action.link.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme?.link?.color};`',
    output: 'const style = `color: ${this.props.theme?.sys.color.action.link?.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `text-decoration: ${this.props.theme?.link.decoration};`',
    output: 'const style = `text-decoration: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme?.link?.hover.color};`',
    output: 'const style = `color: ${this.props.theme?.sys.color.action.link?.hover};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `text-decoration: ${this.props.theme?.link.hover.decoration};`',
    output: 'const style = `text-decoration: ${\'underline\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme.body.bg};`',
    output: 'const style = `color: ${this.props.theme.sys.color.surface.background};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme.body.color};`',
    output: 'const style = `color: ${this.props.theme.sys.color.surface.backgroundText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme.body.fontFamily};`',
    output: 'const style = `color: ${this.props.theme.sys.typography.body2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme.body.fontWeight};`',
    output: 'const style = `color: ${this.props.theme.sys.typography.body2.fontWeight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme.body.fontSize};`',
    output: 'const style = `color: ${this.props.theme.sys.typography.body2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme.body.lineHeight};`',
    output: 'const style = `color: ${this.props.theme.sys.typography.body2.lineHeight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme.body.fontStyle};`',
    output: 'const style = `color: ${\'unset\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme?.body.bg};`',
    output: 'const style = `color: ${this.props.theme?.sys.color.surface.background};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme.body?.color};`',
    output: 'const style = `color: ${this.props.theme.sys.color.surface?.backgroundText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.props.theme?.body?.fontFamily};`',
    output: 'const style = `color: ${this.props.theme?.sys.typography.body2?.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const header = theme.header; const style = `color: ${header.color};`',
    output: 'const header = theme.header; const style = `color: ${theme.sys?.color.surface.headerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const footer = theme.footer; const style = `color: ${footer.color};`',
    output: 'const footer = theme.footer; const style = `color: ${theme.sys?.color.surface.footerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const footer = theme.footer; const style = `color: ${footer?.color};`',
    output: 'const footer = theme.footer; const style = `color: ${theme.sys?.color.surface?.footerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const link = theme.link; const style = `color: ${link.color};`',
    output: 'const link = theme.link; const style = `color: ${theme.sys.color.action.link.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const link = theme.link; const style = `color: ${link?.color};`',
    output: 'const link = theme.link; const style = `color: ${theme.sys.color.action.link?.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const link = theme.link; const style = `text-decoration: ${link.decoration};`',
    output: 'const link = theme.link; const style = `text-decoration: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const link = theme.link; const style = `color: ${link?.hover.color};`',
    output: 'const link = theme.link; const style = `color: ${theme.sys.color.action.link?.hover};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const link = theme.link; const style = `text-decoration: ${link.hover.decoration};`',
    output: 'const link = theme.link; const style = `text-decoration: ${\'underline\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = theme.body; const style = `color: ${body.bg};`',
    output: 'const body = theme.body; const style = `color: ${theme.sys.color.surface.background};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = theme.body; const style = `color: ${body.color};`',
    output: 'const body = theme.body; const style = `color: ${theme.sys.color.surface.backgroundText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = theme.body; const style = `color: ${body.fontFamily};`',
    output: 'const body = theme.body; const style = `color: ${theme.sys.typography.body2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = theme.body; const style = `color: ${body.fontWeight};`',
    output: 'const body = theme.body; const style = `color: ${theme.sys.typography.body2.fontWeight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = theme.body; const style = `color: ${body.fontSize};`',
    output: 'const body = theme.body; const style = `color: ${theme.sys.typography.body2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = theme.body; const style = `color: ${body.lineHeight};`',
    output: 'const body = theme.body; const style = `color: ${theme.sys.typography.body2.lineHeight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = theme.body; const style = `color: ${body.fontStyle};`',
    output: 'const body = theme.body; const style = `color: ${\'unset\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = theme.body; const style = `color: ${body?.color};`',
    output: 'const body = theme.body; const style = `color: ${theme.sys.color.surface?.backgroundText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = theme.body; const style = `color: ${body?.fontFamily};`',
    output: 'const body = theme.body; const style = `color: ${theme.sys.typography.body2?.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `color: ${theme2.header.color};`',
    output: 'const style = `color: ${theme2.sys?.color.surface.headerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme2?.link.color};`',
    output: 'const style = `color: ${theme2?.sys.color.action.link.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const link = theme2.link; const style = `color: ${link?.color};`',
    output: 'const link = theme2.link; const style = `color: ${theme2.sys.color.action.link?.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const link = theme2.link; const style = `color: ${link?.hover.color};`',
    output: 'const link = theme2.link; const style = `color: ${theme2.sys.color.action.link?.hover};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = theme2.body; const style = `color: ${body?.fontFamily};`',
    output: 'const body = theme2.body; const style = `color: ${theme2.sys.typography.body2?.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `color: ${builderTheme.header.color};`',
    output: 'const style = `color: ${builderTheme.sys?.color.surface.headerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${builderTheme?.link.color};`',
    output: 'const style = `color: ${builderTheme?.sys.color.action.link.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const link = builderTheme.link; const style = `color: ${link?.color};`',
    output: 'const link = builderTheme.link; const style = `color: ${builderTheme.sys.color.action.link?.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const link = builderTheme.link; const style = `color: ${link?.hover.color};`',
    output: 'const link = builderTheme.link; const style = `color: ${builderTheme.sys.color.action.link?.hover};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = builderTheme.body; const style = `color: ${body?.fontFamily};`',
    output: 'const body = builderTheme.body; const style = `color: ${builderTheme.sys.typography.body2?.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `color: ${this.theme.header.color};`',
    output: 'const style = `color: ${this.theme.sys?.color.surface.headerText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${this.theme?.link.color};`',
    output: 'const style = `color: ${this.theme?.sys.color.action.link.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const link = this.theme.link; const style = `color: ${link?.color};`',
    output: 'const link = this.theme.link; const style = `color: ${theme.sys.color.action.link?.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const link = this.theme.link; const style = `color: ${link?.hover.color};`',
    output: 'const link = this.theme.link; const style = `color: ${theme.sys.color.action.link?.hover};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const body = this.theme.body; const style = `color: ${body?.fontFamily};`',
    output: 'const body = this.theme.body; const style = `color: ${theme.sys.typography.body2?.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  }
]

ruleTester.run('no-classic-elements', rule, {
  valid: validTests,
  invalid: invalidTests
})

module.exports = { validTests, invalidTests }
