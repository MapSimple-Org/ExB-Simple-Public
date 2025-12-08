const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-variables-left')

const validTests = [
  {
    code: 'const style = `border-color: ${theme.ref.palette.neutral[200]};`'
  },
  {
    code: 'const style = `border-color: ${theme.sys.color.primary.main};`'
  },
  {
    code: 'const style = `border-color: ${theme.mixin.sharedTheme?.button.bg};`'
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme.ref.palette.neutral[200] }} /> }'
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${theme.sys.color.primary.main}` }} /> }'
  },
  {
    code: 'const component = () => { return <div style={{ border: theme.mixin.sharedTheme?.button.bg }} /> }'
  }
]

const invalidTests = [
  {
    code: 'const style = `border-color: ${theme.colors.primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.colors.light }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const primary = theme.colors && theme.colors.primary; const style = `color: ${primary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const primary = theme.colors && theme.colors.primary; return <div style={{ color: primary }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const primary100 = theme.colors && theme.colors.palette && theme.colors.palette.primary[100]; const style = `color: ${primary100};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const primary100 = theme.colors && theme.colors.palette && theme.colors.palette.primary[100]; return <div style={{ color: primary100 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border-color: ${theme.border.color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.border.color }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const color = theme.border && theme.border.color; const style = `color: ${color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const color = theme.border && theme.border.color; return <div style={{ color }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border-color: ${theme.borderRadiuses.sm};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.borderRadiuses.sm }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const borderRadius = theme.borderRadiuses && theme.borderRadiuses.sm; const style = `border-adius: ${borderRadius};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const borderRadius = theme.borderRadiuses && theme.borderRadiuses.sm; return <div style={{ borderRadius }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `box-shadow: ${theme.boxShadows.default};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ boxShadow: props.theme.boxShadows.default }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const shadow = theme.boxShadows && theme.boxShadows.default; const style = `box-shadow: ${shadow};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const shadow = theme.boxShadows && theme.boxShadows.default; return <div style={{ boxShadow: shadow }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `margin: ${theme.sizes[1]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ margin: props.theme.sizes[1] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const size = theme.sizes && theme.sizes[1]; const style = `margin: ${size};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const size = theme.sizes && theme.sizes[1]; return <div style={{ margin: size }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `background: ${theme.surfaces[1].bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ background: props.theme.surfaces[1].bg }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const background = theme.surfaces && theme.surfaces[1] && theme.surfaces[1].bg; const style = `background: ${background};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const background = theme.surfaces && theme.surfaces[1] && theme.surfaces[1].bg; return <div style={{ background }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `font-size: ${theme.typography.size.display1};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ fontWeight: props.theme.typography.weights.bold }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const color = theme.typography && theme.typography.variants && theme.typography.variants.body1.color; const style = `color: ${color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { theme.typography && theme.typography.variants && theme.typography.variants.body1.color; return <div style={{ color }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.header.color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.header.color }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const background = theme.header && theme.footer.bg; const style = `background: ${background};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const background = theme.header && theme.footer.bg; return <div style={{ background }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `color: ${theme.footer.color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.footer.color }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const background = theme.footer && theme.footer.bg; const style = `background: ${background};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const background = theme.footer && theme.footer.bg; return <div style={{ background }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `color: ${theme.body.color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.body.color }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const background = theme.body && theme.body.bg; const style = `background: ${background};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const background = theme.body && theme.body.bg; return <div style={{ background }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const fontSize = theme.body && theme.body.fontSize; return <div style={{ fontSize }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `color: ${theme.link.color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ textDecoration: props.theme.link.decoration }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const color = theme.link && theme.link.color; const style = `color: ${color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const decoration = theme.link && theme.link.decoration; return <div style={{ textDecoration: decoration }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const color = theme.link && theme.link.hover && theme.link.hover.color; const style = `color: ${color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const decoration = theme.link && theme.link.hover && theme.link.hover.decoration; return <div style={{ texDecoration: decoration }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `color: ${theme.darkTheme ? \'black\' : \'white\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ color: theme.darkTheme ? \'black\' : \'white\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `color: ${theme.colors.primary[100]};`',
    errors: [{ messageId: 'invalid', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `color: ${colors.primary[100]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'invalid', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ color: theme.colors.primary[100] }} /> }',
    errors: [{ messageId: 'invalid', type: 'MemberExpression' }, { messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ color: colors.primary[100] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'invalid', type: 'MemberExpression' }]
  },
]

ruleTester.run('no-classic-variables-left', rule, {
  valid: validTests,
  invalid: invalidTests
})
