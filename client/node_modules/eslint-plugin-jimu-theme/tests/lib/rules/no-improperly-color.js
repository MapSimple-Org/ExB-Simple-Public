const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-improperly-color')

const validTests = [
  {
    code: 'const style = `border-color: ${theme.sys.color.divider.primary};`'
  },
  {
    code: 'const style = `border-color: ${theme.sys.color?.surface.paper};`'
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${theme.sys.color.action.selected.default}` }} /> }'
  },
  {
    code: 'const component = () => { return <div style={{ border: theme.sys.color?.surface.paper }} /> }'
  },
  {
    code: 'const paperText =  theme.sys.color && theme.sys.color.surface.paperText; const style = `color: ${paperText};`',
  },
  {
    code: 'const component = () => { const overlayText = theme.sys.color && theme.sys.color.surface.overlayText; return <div style={{ color: overlayText }} /> }',
  },

  {
    code: 'const style = `border-color: var(--sys-color-divider-primary);`'
  },
  {
    code: 'const style = `border-color: var(--sys-color-action-text);`'
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: \'var(--sys-color-divider-secondary)\' }} /> }'
  },
  {
    code: 'const component = () => { return <div style={{ border: \'1px solid var(--sys-color.action.selected.default)\' }} /> }'
  },
  {
    code: 'const color = \'var(--sys-color-divider-primary)\';',
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: \'var(--sys-color-divider-tertiary)\' }} /> }'
  },
]

const invalidTests = [
  {
    code: 'const style = `border-color: ${theme.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  
  {
    code: 'const component = () => { return <div style={{ borderColor: theme.sys.color.secondary.light }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const secondaryLight = theme && theme.sys.color.secondary.light; const style = `color: ${secondaryLight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const secondaryDark = theme.sys.color.secondary.dark; const style = `color: ${secondaryDark};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const errorLight = theme.sys.color && theme.sys.color.error.light; return <div style={{ color: errorLight }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const primaryLight = theme.sys.color && theme.sys.color.primary.light; const style = `color: ${primaryLight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const primaryLight = theme.sys.color && theme.sys.color.primary.light; return <div style={{ color: primaryLight }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const info = theme.sys.color.info.main; const style = `color: ${info};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const success = theme.sys.color.success.main; return <div style={{ color: success }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <WarningOutlined color=\'var(--sys-color-secondary-light)\' /> };',
    errors: [{ messageId: 'message', type: 'Literal' }]
  },
  {
    code: 'const component = () => { return <WarningOutlined color=\'var(--sys-color-primary-light)\' /> };',
    errors: [{ messageId: 'message', type: 'Literal' }]
  },

  {
    code: 'const component = () => { return <WarningOutlined color={\'var(--sys-color-secondary-light)\'} /> };',
    errors: [{ messageId: 'message', type: 'Literal' }]
  },
  {
    code: 'const component = () => { return <WarningOutlined color=\'var(--sys-color-error-light)\' /> };',
    errors: [{ messageId: 'message', type: 'Literal' }]
  },
  {
    code: 'const component = () => { return <WarningOutlined color=\'var(--sys-color-success-light)\' /> };',
    errors: [{ messageId: 'message', type: 'Literal' }]
  },

  {
    code: 'const component = () => { return <Tooltip arrowStyle={{ background: \'var(--sys-color-secondary-light)\', border: { color: \'var(--sys-color-primary-light)\', width: \'1px\' } }} /> };',
    errors: [{ messageId: 'message', type: 'Literal' }, { messageId: 'message', type: 'Literal' }]
  },
  {
    code: 'const component = () => { return <Tooltip arrowStyle={{ background: theme.sys.color.primary.light, border: { color: \'var(--sys-color-secondary-light)\', width: \'1px\' } }} /> };',
    errors: [{ messageId: 'message', type: 'MemberExpression' }, { messageId: 'message', type: 'Literal' }]
  },

  {
    code: 'const color = \'var(--sys-color-warning-light)\';',
    errors: [{ messageId: 'message', type: 'Literal' }]
  },

  {
    code: 'const style = `border-color: ${myTheme.sys.color.primary.light};`',
    options: [{ themeAliases: ['myTheme'] }],
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: myTheme.sys.color.secondary.light }} /> }',
    options: [{ themeAliases: ['myTheme'] }],
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border-color: var(--sys-color-secondary-light);`',
    errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
  },
  {
    code: 'const style = `border-color: var(--sys-color-secondary-main);`',
    errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
  },
  {
    code: 'const style = `border-color: var(--sys-color-secondary-dark);`',
    errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
  },
  {
    code: 'const style = `border-color: var(--sys-color-error-dark);`',
    errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
  },

  {
    code: 'const component = () => { return <div style={{ border: \'1px solid var(--sys-color-primary-dark)\' }} /> }',
    errors: [{ messageId: 'message', type: 'Literal' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: \'1px solid var(--sys-color-secondary-light)\' }} /> }',
    errors: [{ messageId: 'message', type: 'Literal' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: \'var(--sys-color-secondary-light)\' }} /> }',
    errors: [{ messageId: 'message', type: 'Literal' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: \'1px solid var(--sys-color-error-dark)\' }} /> }',
    errors: [{ messageId: 'message', type: 'Literal' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: \'var(--sys-color-secondary-dark)\' }} /> }',
    errors: [{ messageId: 'message', type: 'Literal' }]
  },
]

ruleTester.run('no-improperly-color', rule, {
  valid: validTests,
  invalid: invalidTests
})

