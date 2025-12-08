const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-colors')

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
    output: 'const style = `border-color: ${theme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors.white};`',
    output: 'const style = `border-color: ${theme.ref.palette.white};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors.light};`',
    output: 'const style = `border-color: ${theme.ref.palette.neutral[200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors.dark};`',
    output: 'const style = `border-color: ${theme.ref.palette.neutral[1200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme?.colors.primary};`',
    output: 'const style = `border-color: ${theme?.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors?.white};`',
    output: 'const style = `border-color: ${theme.ref.palette?.white};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme?.colors?.light};`',
    output: 'const style = `border-color: ${theme?.ref.palette?.neutral[200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme?.colors.dark};`',
    output: 'const style = `border-color: ${theme?.ref.palette.neutral[1200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme?.colors.transparent};`',
    output: 'const style = `border-color: ${\'transparent\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors.palette.primary[100]};`',
    output: 'const style = `border-color: ${theme.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors.palette.primary[500]};`',
    output: 'const style = `border-color: ${theme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors.palette.light[500]};`',
    output: 'const style = `border-color: ${theme.ref.palette.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors.palette.dark[500]};`',
    output: 'const style = `border-color: ${theme.ref.palette.neutral[1000]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme?.colors.palette.primary[100]};`',
    output: 'const style = `border-color: ${theme?.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors?.palette.primary[500]};`',
    output: 'const style = `border-color: ${theme?.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors.palette?.light[500]};`',
    output: 'const style = `border-color: ${theme.ref.palette?.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors?.palette.dark[500]};`',
    output: 'const style = `border-color: ${theme?.ref.palette.neutral[1000]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors?.orgSharedColors.button.bg};`',
    output: 'const style = `border-color: ${theme?.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme?.colors.orgSharedColors.body.color};`',
    output: 'const style = `border-color: ${theme?.mixin.sharedTheme.body.color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme.colors?.orgSharedColors.header.bg};`',
    output: 'const style = `border-color: ${theme?.mixin.sharedTheme.header.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme?.colors.orgSharedColors.body.link};`',
    output: 'const style = `border-color: ${theme?.mixin.sharedTheme.body.link};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${theme.colors.primary}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${theme.sys.color.primary.main}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme.colors.white }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: theme.ref.palette.white }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme.colors.light }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: theme.ref.palette.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme.colors.dark }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: theme.ref.palette.neutral[1200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme.colors.transparent }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: \'transparent\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${theme.colors.transparent}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${\'transparent\'}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme?.colors.primary }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: theme?.sys.color.primary.main }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${theme.colors?.white}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${theme.ref.palette?.white}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme?.colors?.light }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: theme?.ref.palette?.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${theme?.colors.dark}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${theme?.ref.palette.neutral[1200]}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme.colors.palette.primary[100] }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: theme.sys.color.primary.light }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${theme.colors.palette.primary[500]}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${theme.sys.color.primary.main}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme.colors.palette.light[500] }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: theme.ref.palette.neutral[500] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${theme.colors.palette.dark[500]}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${theme.ref.palette.neutral[1000]}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme?.colors.palette.primary[100] }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: theme?.sys.color.primary.light }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${theme.colors?.orgSharedColors.button.bg}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${theme?.mixin.sharedTheme.button.bg}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme?.colors.orgSharedColors.body.link }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: theme?.mixin.sharedTheme.body.link }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border-color: ${props.theme.colors.primary};`',
    output: 'const style = `border-color: ${props.theme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors.white};`',
    output: 'const style = `border-color: ${props.theme.ref.palette.white};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors.light};`',
    output: 'const style = `border-color: ${props.theme.ref.palette.neutral[200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors.dark};`',
    output: 'const style = `border-color: ${props.theme.ref.palette.neutral[1200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme?.colors.primary};`',
    output: 'const style = `border-color: ${props.theme?.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors?.white};`',
    output: 'const style = `border-color: ${props.theme.ref.palette?.white};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme?.colors?.light};`',
    output: 'const style = `border-color: ${props.theme?.ref.palette?.neutral[200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme?.colors.dark};`',
    output: 'const style = `border-color: ${props.theme?.ref.palette.neutral[1200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme?.colors.transparent};`',
    output: 'const style = `border-color: ${\'transparent\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors.palette.primary[100]};`',
    output: 'const style = `border-color: ${props.theme.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors.palette.primary[500]};`',
    output: 'const style = `border-color: ${props.theme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors.palette.light[500]};`',
    output: 'const style = `border-color: ${props.theme.ref.palette.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors.palette.dark[500]};`',
    output: 'const style = `border-color: ${props.theme.ref.palette.neutral[1000]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme?.colors.palette.primary[100]};`',
    output: 'const style = `border-color: ${props.theme?.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors?.palette.primary[500]};`',
    output: 'const style = `border-color: ${props.theme?.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors.palette?.light[500]};`',
    output: 'const style = `border-color: ${props.theme.ref.palette?.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors?.palette.dark[500]};`',
    output: 'const style = `border-color: ${props.theme?.ref.palette.neutral[1000]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors?.orgSharedColors.button.bg};`',
    output: 'const style = `border-color: ${props.theme?.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme?.colors.orgSharedColors.body.color};`',
    output: 'const style = `border-color: ${props.theme?.mixin.sharedTheme.body.color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme.colors?.orgSharedColors.header.bg};`',
    output: 'const style = `border-color: ${props.theme?.mixin.sharedTheme.header.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme?.colors.orgSharedColors.body.link};`',
    output: 'const style = `border-color: ${props.theme?.mixin.sharedTheme.body.link};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${props.theme.colors.primary}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${props.theme.sys.color.primary.main}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.colors.white }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: props.theme.ref.palette.white }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.colors.light }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: props.theme.ref.palette.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.colors.dark }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: props.theme.ref.palette.neutral[1200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.colors.transparent }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: \'transparent\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${props.theme.colors.transparent}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${\'transparent\'}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme?.colors.primary }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: props.theme?.sys.color.primary.main }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${props.theme.colors?.white}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${props.theme.ref.palette?.white}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme?.colors?.light }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: props.theme?.ref.palette?.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${props.theme?.colors.dark}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${props.theme?.ref.palette.neutral[1200]}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.colors.palette.primary[100] }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: props.theme.sys.color.primary.light }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${props.theme.colors.palette.primary[500]}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${props.theme.sys.color.primary.main}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme.colors.palette.light[500] }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: props.theme.ref.palette.neutral[500] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${props.theme.colors.palette.dark[500]}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${props.theme.ref.palette.neutral[1000]}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme?.colors.palette.primary[100] }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: props.theme?.sys.color.primary.light }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${props.theme.colors?.orgSharedColors.button.bg}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${props.theme?.mixin.sharedTheme.button.bg}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme?.colors.orgSharedColors.body.link }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: props.theme?.mixin.sharedTheme.body.link }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.primary};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.white};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.ref.palette.white};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.light};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.ref.palette.neutral[200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.dark};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.ref.palette.neutral[1200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors?.white};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.ref.palette?.white};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors?.light};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.ref.palette?.neutral[200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.transparent};`',
    output: 'const colors = theme.colors; const style = `border-color: ${\'transparent\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.palette.primary[500]};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.palette.light[500]};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.ref.palette.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.palette.dark[500]};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.ref.palette.neutral[1000]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.palette.primary[100]};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors?.palette.primary[500]};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme?.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.palette?.light[500]};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.ref.palette?.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors?.palette.dark[500]};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme?.ref.palette.neutral[1000]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors?.orgSharedColors.button.bg};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme?.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.orgSharedColors.body.color};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.mixin.sharedTheme.body.color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors?.orgSharedColors.header.bg};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme?.mixin.sharedTheme.header.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.colors; const style = `border-color: ${colors.orgSharedColors.body.link};`',
    output: 'const colors = theme.colors; const style = `border-color: ${theme.mixin.sharedTheme.body.link};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${colors.primary}` }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${theme.sys.color.primary.main}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: colors.white }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: theme.ref.palette.white }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: colors.light }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: theme.ref.palette.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: colors.dark }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: theme.ref.palette.neutral[1200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: colors.transparent }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: \'transparent\' }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${colors.transparent}` }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${\'transparent\'}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: colors.primary }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: theme.sys.color.primary.main }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${colors?.white}` }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${theme.ref.palette?.white}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: colors?.light }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: theme.ref.palette?.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${colors.dark}` }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${theme.ref.palette.neutral[1200]}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: colors.palette.primary[100] }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: theme.sys.color.primary.light }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${colors.palette.primary[500]}` }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${theme.sys.color.primary.main}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: colors.palette.light[500] }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: theme.ref.palette.neutral[500] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${colors.palette.dark[500]}` }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${theme.ref.palette.neutral[1000]}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${colors?.orgSharedColors.button.bg}` }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ border: `1px solid ${theme?.mixin.sharedTheme.button.bg}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: colors.orgSharedColors.body.link }} /> }',
    output: 'const component = () => { const colors = theme.colors; return <div style={{ borderColor: theme.mixin.sharedTheme.body.link }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const palette = theme.colors.palette; const style = `border-color: ${palette.primary[100]};`',
    output: 'const palette = theme.colors.palette; const style = `border-color: ${theme.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const palette = theme.colors.palette; const style = `border-color: ${palette.primary[500]};`',
    output: 'const palette = theme.colors.palette; const style = `border-color: ${theme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const palette = theme.colors.palette; const style = `border-color: ${palette.light[500]};`',
    output: 'const palette = theme.colors.palette; const style = `border-color: ${theme.ref.palette.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const palette = theme.colors.palette; const style = `border-color: ${palette.dark[500]};`',
    output: 'const palette = theme.colors.palette; const style = `border-color: ${theme.ref.palette.neutral[1000]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const palette = theme.colors.palette; const style = `border-color: ${palette?.light[500]};`',
    output: 'const palette = theme.colors.palette; const style = `border-color: ${theme.ref.palette?.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const orgSharedColors = theme.colors.orgSharedColors; const style = `border-color: ${orgSharedColors.button.bg};`',
    output: 'const orgSharedColors = theme.colors.orgSharedColors; const style = `border-color: ${theme.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const orgSharedColors = theme.colors.orgSharedColors; const style = `border-color: ${orgSharedColors.body.color};`',
    output: 'const orgSharedColors = theme.colors.orgSharedColors; const style = `border-color: ${theme.mixin.sharedTheme.body.color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const orgSharedColors = theme.colors.orgSharedColors; const style = `border-color: ${orgSharedColors.header.bg};`',
    output: 'const orgSharedColors = theme.colors.orgSharedColors; const style = `border-color: ${theme.mixin.sharedTheme.header.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const orgSharedColors = theme.colors.orgSharedColors; const style = `border-color: ${orgSharedColors.body.link};`',
    output: 'const orgSharedColors = theme.colors.orgSharedColors; const style = `border-color: ${theme.mixin.sharedTheme.body.link};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const palette = theme.colors.palette; return <div style={{ borderColor: palette.primary[100] }} /> }',
    output: 'const component = () => { const palette = theme.colors.palette; return <div style={{ borderColor: theme.sys.color.primary.light }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const palette = theme.colors.palette; return <div style={{ border: `1px solid ${palette.primary[500]}` }} /> }',
    output: 'const component = () => { const palette = theme.colors.palette; return <div style={{ border: `1px solid ${theme.sys.color.primary.main}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const palette = theme.colors.palette; return <div style={{ borderColor: palette.light[500] }} /> }',
    output: 'const component = () => { const palette = theme.colors.palette; return <div style={{ borderColor: theme.ref.palette.neutral[500] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const palette = theme.colors.palette; return <div style={{ border: `1px solid ${palette.dark[500]}` }} /> }',
    output: 'const component = () => { const palette = theme.colors.palette; return <div style={{ border: `1px solid ${theme.ref.palette.neutral[1000]}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const orgSharedColors = theme.colors.orgSharedColors; return <div style={{ border: `1px solid ${orgSharedColors.button.bg}` }} /> }',
    output: 'const component = () => { const orgSharedColors = theme.colors.orgSharedColors; return <div style={{ border: `1px solid ${theme.mixin.sharedTheme.button.bg}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const orgSharedColors = theme.colors.orgSharedColors; return <div style={{ borderColor: orgSharedColors.body.link }} /> }',
    output: 'const component = () => { const orgSharedColors = theme.colors.orgSharedColors; return <div style={{ borderColor: theme.mixin.sharedTheme.body.link }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border-color: ${theme2.colors.primary};`',
    output: 'const style = `border-color: ${theme2.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors.white};`',
    output: 'const style = `border-color: ${theme2.ref.palette.white};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors.light};`',
    output: 'const style = `border-color: ${theme2.ref.palette.neutral[200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors.dark};`',
    output: 'const style = `border-color: ${theme2.ref.palette.neutral[1200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2?.colors.primary};`',
    output: 'const style = `border-color: ${theme2?.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors?.white};`',
    output: 'const style = `border-color: ${theme2.ref.palette?.white};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2?.colors?.light};`',
    output: 'const style = `border-color: ${theme2?.ref.palette?.neutral[200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2?.colors.dark};`',
    output: 'const style = `border-color: ${theme2?.ref.palette.neutral[1200]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2?.colors.transparent};`',
    output: 'const style = `border-color: ${\'transparent\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors.palette.primary[100]};`',
    output: 'const style = `border-color: ${theme2.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors.palette.primary[500]};`',
    output: 'const style = `border-color: ${theme2.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors.palette.light[500]};`',
    output: 'const style = `border-color: ${theme2.ref.palette.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors.palette.dark[500]};`',
    output: 'const style = `border-color: ${theme2.ref.palette.neutral[1000]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2?.colors.palette.primary[100]};`',
    output: 'const style = `border-color: ${theme2?.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors?.palette.primary[500]};`',
    output: 'const style = `border-color: ${theme2?.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors.palette?.light[500]};`',
    output: 'const style = `border-color: ${theme2.ref.palette?.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors?.palette.dark[500]};`',
    output: 'const style = `border-color: ${theme2?.ref.palette.neutral[1000]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors?.orgSharedColors.button.bg};`',
    output: 'const style = `border-color: ${theme2?.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2?.colors.orgSharedColors.body.color};`',
    output: 'const style = `border-color: ${theme2?.mixin.sharedTheme.body.color};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2.colors?.orgSharedColors.header.bg};`',
    output: 'const style = `border-color: ${theme2?.mixin.sharedTheme.header.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${theme2?.colors.orgSharedColors.body.link};`',
    output: 'const style = `border-color: ${theme2?.mixin.sharedTheme.body.link};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${theme2.colors.primary}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${theme2.sys.color.primary.main}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme2?.colors?.light }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: theme2?.ref.palette?.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: theme2?.colors.orgSharedColors.body.link }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: theme2?.mixin.sharedTheme.body.link }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border-color: ${props.theme2.colors.white};`',
    output: 'const style = `border-color: ${props.theme2.ref.palette.white};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme2.colors.palette.dark[500]};`',
    output: 'const style = `border-color: ${props.theme2.ref.palette.neutral[1000]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme2?.colors.orgSharedColors.body.link};`',
    output: 'const style = `border-color: ${props.theme2?.mixin.sharedTheme.body.link};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme2?.colors?.light }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: props.theme2?.ref.palette?.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ border: `1px solid ${props.theme2.colors.palette.dark[500]}` }} /> }',
    output: 'const component = () => { return <div style={{ border: `1px solid ${props.theme2.ref.palette.neutral[1000]}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: props.theme2?.colors.orgSharedColors.body.link }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: props.theme2?.mixin.sharedTheme.body.link }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const colors = theme2.colors; const style = `border-color: ${colors.primary};`',
    output: 'const colors = theme2.colors; const style = `border-color: ${theme2.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme2.colors; const style = `border-color: ${colors.palette?.light[500]};`',
    output: 'const colors = theme2.colors; const style = `border-color: ${theme2.ref.palette?.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme2.colors; return <div style={{ borderColor: colors.orgSharedColors.body.link }} /> }',
    output: 'const component = () => { const colors = theme2.colors; return <div style={{ borderColor: theme2.mixin.sharedTheme.body.link }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const palette = theme2.colors.palette; const style = `border-color: ${palette?.light[500]};`',
    output: 'const palette = theme2.colors.palette; const style = `border-color: ${theme2.ref.palette?.neutral[500]};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const orgSharedColors = theme2.colors.orgSharedColors; const style = `border-color: ${orgSharedColors.button.bg};`',
    output: 'const orgSharedColors = theme2.colors.orgSharedColors; const style = `border-color: ${theme2.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const palette = theme2.colors.palette; return <div style={{ borderColor: palette.primary[100] }} /> }',
    output: 'const component = () => { const palette = theme2.colors.palette; return <div style={{ borderColor: theme2.sys.color.primary.light }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const orgSharedColors = theme2.colors.orgSharedColors; return <div style={{ borderColor: orgSharedColors.body.link }} /> }',
    output: 'const component = () => { const orgSharedColors = theme2.colors.orgSharedColors; return <div style={{ borderColor: theme2.mixin.sharedTheme.body.link }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border-color: ${props.theme2.colors.primary};`',
    output: 'const style = `border-color: ${props.theme2.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme2?.colors.transparent};`',
    output: 'const style = `border-color: ${\'transparent\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme2.colors.palette.primary[100]};`',
    output: 'const style = `border-color: ${props.theme2.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${props.theme2.colors?.orgSharedColors.button.bg};`',
    output: 'const style = `border-color: ${props.theme2?.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border-color: ${prevProps.theme2.colors.primary};`',
    output: 'const style = `border-color: ${prevProps.theme2.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${prevProps.theme2?.colors.transparent};`',
    output: 'const style = `border-color: ${\'transparent\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${prevProps.theme2.colors.palette.primary[100]};`',
    output: 'const style = `border-color: ${prevProps.theme2.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${prevProps.theme2.colors?.orgSharedColors.button.bg};`',
    output: 'const style = `border-color: ${prevProps.theme2?.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: prevProps.theme2?.colors?.light }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: prevProps.theme2?.ref.palette?.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },


  {
    code: 'const style = `border-color: ${this.theme.colors.primary};`',
    output: 'const style = `border-color: ${this.theme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${this.theme?.colors.transparent};`',
    output: 'const style = `border-color: ${\'transparent\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${this.theme.colors.palette.primary[100]};`',
    output: 'const style = `border-color: ${this.theme.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${this.theme.colors?.orgSharedColors.button.bg};`',
    output: 'const style = `border-color: ${this.theme?.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: this.theme?.colors?.light }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: this.theme?.ref.palette?.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },


  {
    code: 'const style = `border-color: ${builderTheme.colors.primary};`',
    output: 'const style = `border-color: ${builderTheme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${builderTheme?.colors.transparent};`',
    output: 'const style = `border-color: ${\'transparent\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${builderTheme.colors.palette.primary[100]};`',
    output: 'const style = `border-color: ${builderTheme.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${builderTheme.colors?.orgSharedColors.button.bg};`',
    output: 'const style = `border-color: ${builderTheme?.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: builderTheme?.colors?.light }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: builderTheme?.ref.palette?.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `border-color: ${appTheme.colors.primary};`',
    output: 'const style = `border-color: ${appTheme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${appTheme?.colors.transparent};`',
    output: 'const style = `border-color: ${\'transparent\'};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${appTheme.colors.palette.primary[100]};`',
    output: 'const style = `border-color: ${appTheme.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `border-color: ${appTheme.colors?.orgSharedColors.button.bg};`',
    output: 'const style = `border-color: ${appTheme?.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ borderColor: appTheme?.colors?.light }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: appTheme?.ref.palette?.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const { colors } = theme; const style = `border-color: ${colors.primary};`',
    output: 'const { colors } = theme; const style = `border-color: ${theme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const { colors } = theme; return <div style={{ border: `1px solid ${colors.primary}` }} /> }',
    output: 'const component = () => { const { colors } = theme; return <div style={{ border: `1px solid ${theme.sys.color.primary.main}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const { palette } = theme.colors; const style = `border-color: ${palette.primary[100]};`',
    output: 'const { palette } = theme.colors; const style = `border-color: ${theme.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const { palette } = theme.colors; return <div style={{ borderColor: palette.primary[100] }} /> }',
    output: 'const component = () => { const { palette } = theme.colors; return <div style={{ borderColor: theme.sys.color.primary.light }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const { orgSharedColors } = theme.colors; const style = `border-color: ${orgSharedColors.button.bg};`',
    output: 'const { orgSharedColors } = theme.colors; const style = `border-color: ${theme.mixin.sharedTheme.button.bg};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const { orgSharedColors } = theme.colors; return <div style={{ border: `1px solid ${orgSharedColors.button.bg}` }} /> }',
    output: 'const component = () => { const { orgSharedColors } = theme.colors; return <div style={{ border: `1px solid ${theme.mixin.sharedTheme.button.bg}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const { theme } = this.context; const style = `border-color: ${theme.colors.primary};`',
    output: 'const { theme } = this.context; const style = `border-color: ${theme.sys.color.primary.main};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const { exbTheme } = params; return <div style={{ border: `1px solid ${exbTheme.colors.primary}` }} /> }',
    output: 'const component = () => { const { exbTheme } = params; return <div style={{ border: `1px solid ${exbTheme.sys.color.primary.main}` }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }],
    options: [{ themeAliases: ['exbTheme'] }]
  },

  {
    code: 'const component = () => { return <div style={{ borderColor: this.params.context.theme2?.colors?.light }} /> }',
    output: 'const component = () => { return <div style={{ borderColor: this.params.context.theme2?.ref.palette?.neutral[200] }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const palette = colors.palette; const colors = theme.colors; const style = `border-color: ${palette.primary[100]};`',
    output: 'const palette = colors.palette; const colors = theme.colors; const style = `border-color: ${theme.sys.color.primary.light};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  }
]

ruleTester.run('no-classic-colors', rule, {
  valid: validTests,
  invalid: invalidTests
})

module.exports = { validTests, invalidTests }
