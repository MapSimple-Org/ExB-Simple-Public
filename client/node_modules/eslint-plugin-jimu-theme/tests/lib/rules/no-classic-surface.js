const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-surface')

const validTests = [
  {
    code: 'const style = `background: ${theme.sys.color.surface.paper};`'
  },
  {
    code: 'const component = () => { return <div style={{ margin: theme.sys.color.surface.paper }} /> }'
  },
]

const invalidTests = [
  {
    code: 'const style = `background: ${theme.surfaces[1].bg};`',
    output: 'const style = `background: ${theme.sys.color.surface.paper};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `boxShadow: ${theme.surfaces[1].shadow};`',
    output: 'const style = `boxShadow: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `borderColor: ${theme.surfaces[1].border.color};`',
    output: 'const style = `borderColor: ${theme.sys.color.divider.secondary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `background: ${theme.surfaces[2].bg};`',
    output: 'const style = `background: ${theme.sys.color.surface.overlay};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `boxShadow: ${theme.surfaces[2].shadow};`',
    output: 'const style = `boxShadow: ${theme.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `borderColor: ${theme.surfaces[2].border.color};`',
    output: 'const style = `borderColor: ${theme.sys.color.divider.secondary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `background: ${theme?.surfaces[1].bg};`',
    output: 'const style = `background: ${theme?.sys.color.surface.paper};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `borderColor: ${theme.surfaces?.[1].border.color};`',
    output: 'const style = `borderColor: ${theme.sys.color.divider?.secondary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `background: ${theme?.surfaces?.[2].bg};`',
    output: 'const style = `background: ${theme?.sys.color.surface?.overlay};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `background: ${props.theme.surfaces[1].bg};`',
    output: 'const style = `background: ${props.theme.sys.color.surface.paper};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `boxShadow: ${props.theme.surfaces[1].shadow};`',
    output: 'const style = `boxShadow: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `borderColor: ${props.theme.surfaces[1].border.color};`',
    output: 'const style = `borderColor: ${props.theme.sys.color.divider.secondary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `background: ${props.theme.surfaces[2].bg};`',
    output: 'const style = `background: ${props.theme.sys.color.surface.overlay};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `boxShadow: ${props.theme.surfaces[2].shadow};`',
    output: 'const style = `boxShadow: ${props.theme.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `borderColor: ${props.theme.surfaces[2].border.color};`',
    output: 'const style = `borderColor: ${props.theme.sys.color.divider.secondary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `background: ${props.theme?.surfaces[1].bg};`',
    output: 'const style = `background: ${props.theme?.sys.color.surface.paper};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `borderColor: ${props.theme.surfaces?.[1].border.color};`',
    output: 'const style = `borderColor: ${props.theme.sys.color.divider?.secondary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `background: ${props.theme?.surfaces?.[2].bg};`',
    output: 'const style = `background: ${props.theme?.sys.color.surface?.overlay};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const surfaces = theme.surfaces; const style = `background: ${surfaces[1].bg};`',
    output: 'const surfaces = theme.surfaces; const style = `background: ${theme.sys.color.surface.paper};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const surfaces = theme.surfaces; const style = `boxShadow: ${surfaces[1].shadow};`',
    output: 'const surfaces = theme.surfaces; const style = `boxShadow: ${\'none\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const surfaces = theme.surfaces; const style = `borderColor: ${surfaces[1].border.color};`',
    output: 'const surfaces = theme.surfaces; const style = `borderColor: ${theme.sys.color.divider.secondary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const surfaces = theme.surfaces; const style = `background: ${surfaces[2].bg};`',
    output: 'const surfaces = theme.surfaces; const style = `background: ${theme.sys.color.surface.overlay};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const surfaces = theme.surfaces; const style = `boxShadow: ${surfaces[2].shadow};`',
    output: 'const surfaces = theme.surfaces; const style = `boxShadow: ${theme.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const surfaces = theme.surfaces; const style = `borderColor: ${surfaces[2].border.color};`',
    output: 'const surfaces = theme.surfaces; const style = `borderColor: ${theme.sys.color.divider.secondary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const surfaces = theme.surfaces; const style = `background: ${theme?.surfaces[1].bg};`',
    output: 'const surfaces = theme.surfaces; const style = `background: ${theme?.sys.color.surface.paper};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const surfaces = theme.surfaces; const style = `borderColor: ${surfaces?.[1].border.color};`',
    output: 'const surfaces = theme.surfaces; const style = `borderColor: ${theme.sys.color.divider?.secondary};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const surfaces = theme.surfaces; const style = `background: ${theme?.surfaces?.[2].bg};`',
    output: 'const surfaces = theme.surfaces; const style = `background: ${theme?.sys.color.surface?.overlay};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const surfaces = theme.surfaces; const style = surfaces?.[2];',
    output: `const surfaces = theme.surfaces; const style = {
    bg: theme.sys.color.surface.overlay,
    border: {
      color: theme.sys.color.divider.secondary,
      width: '1px'
    },
    shadow: theme.sys.shadow.shadow2
  };`,
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `background: ${theme2.surfaces[1].bg};`',
    output: 'const style = `background: ${theme2.sys.color.surface.paper};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const surfaces = theme2.surfaces; const style = `boxShadow: ${surfaces[2].shadow};`',
    output: 'const surfaces = theme2.surfaces; const style = `boxShadow: ${theme2.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `background: ${builderTheme.surfaces[1].bg};`',
    output: 'const style = `background: ${builderTheme.sys.color.surface.paper};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const surfaces = builderTheme.surfaces; const style = `boxShadow: ${surfaces[2].shadow};`',
    output: 'const surfaces = builderTheme.surfaces; const style = `boxShadow: ${builderTheme.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `background: ${this.theme.surfaces[1].bg};`',
    output: 'const style = `background: ${this.theme.sys.color.surface.paper};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const surfaces = this.theme.surfaces; const style = `boxShadow: ${surfaces[2].shadow};`',
    output: 'const surfaces = this.theme.surfaces; const style = `boxShadow: ${theme.sys.shadow.shadow2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  }
]


ruleTester.run('no-classic-surface', rule, {
  valid: validTests,
  invalid: invalidTests
})

module.exports = { validTests, invalidTests }
