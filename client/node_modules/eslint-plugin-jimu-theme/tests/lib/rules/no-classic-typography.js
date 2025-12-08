const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-typography')

const validTests = [
  {
    code: 'const style = `font-size: ${theme.sys.typography.h2.fontSize};`'
  },
]

const invalidTests = [
  {
    code: 'const style = `font-size: ${theme.typography.sizes.display2};`',
    output: 'const style = `font-size: ${theme.sys.typography.h2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ fontSize: theme?.typography.sizes.display2 }} /> }',
    output: 'const component = () => { return <div style={{ fontSize: theme?.sys.typography.h2.fontSize }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.typography.colors.title};`',
    output: 'const style = `color: ${theme.sys.color.surface.backgroundText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ color: theme?.typography.colors.disabled }} /> }',
    output: 'const component = () => { return <div style={{ color: theme?.sys.color.action.disabled.text }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-weight: ${theme.typography.weights.extraLight};`',
    output: 'const style = `font-weight: ${theme.ref.typeface.fontWeightLight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ fontWeight: theme?.typography.weights.bold }} /> }',
    output: 'const component = () => { return <div style={{ fontWeight: theme?.ref.typeface.fontWeightMedium }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `line-height: ${theme.typography.lineHeights.medium};`',
    output: 'const style = `line-height: ${1.5};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ lineHeight: theme?.typography.lineHeights.sm }} /> }',
    output: 'const component = () => { return <div style={{ lineHeight: 1.3 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={theme.typography.variants.display2} /> }',
    output: 'const component = () => { return <div style={theme.sys.typography.h2} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={theme.typography.variants.caption2} /> }',
    output: 'const component = () => { return <div style={theme.sys.typography.label3} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-family: ${theme.typography.variants.caption1.fontFamily};`',
    output: 'const style = `font-family: ${theme.sys.typography.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${theme.typography.variants.body2.color};`',
    output: 'const style = `color: ${theme.sys.color.surface.paperText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-size: ${theme?.typography.variants.display2};`',
    output: 'const style = `font-size: ${theme?.sys.typography.h2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-size: ${theme.typography.variants?.caption2};`',
    output: 'const style = `font-size: ${theme.sys.typography?.label3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-family: ${theme?.typography.variants?.caption1.fontFamily};`',
    output: 'const style = `font-family: ${theme?.sys.typography?.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={theme?.typography.variants.display2} /> }',
    output: 'const component = () => { return <div style={theme?.sys.typography.h2} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={theme.typography.variants?.caption2} /> }',
    output: 'const component = () => { return <div style={theme.sys.typography?.label3} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `font-size: ${props.theme.typography.sizes.display2};`',
    output: 'const style = `font-size: ${props.theme.sys.typography.h2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ fontSize: props.theme?.typography.sizes.display2 }} /> }',
    output: 'const component = () => { return <div style={{ fontSize: props.theme?.sys.typography.h2.fontSize }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${props.theme.typography.colors.title};`',
    output: 'const style = `color: ${props.theme.sys.color.surface.backgroundText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ color: props.theme?.typography.colors.disabled }} /> }',
    output: 'const component = () => { return <div style={{ color: props.theme?.sys.color.action.disabled.text }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-weight: ${props.theme.typography.weights.extraLight};`',
    output: 'const style = `font-weight: ${props.theme.ref.typeface.fontWeightLight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ fontWeight: props.theme?.typography.weights.bold }} /> }',
    output: 'const component = () => { return <div style={{ fontWeight: props.theme?.ref.typeface.fontWeightMedium }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `line-height: ${props.theme.typography.lineHeights.medium};`',
    output: 'const style = `line-height: ${1.5};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ lineHeight: props.theme?.typography.lineHeights.sm }} /> }',
    output: 'const component = () => { return <div style={{ lineHeight: 1.3 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={props.theme.typography.variants.display2} /> }',
    output: 'const component = () => { return <div style={props.theme.sys.typography.h2} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={props.theme.typography.variants.caption2} /> }',
    output: 'const component = () => { return <div style={props.theme.sys.typography.label3} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-family: ${props.theme.typography.variants.caption1.fontFamily};`',
    output: 'const style = `font-family: ${props.theme.sys.typography.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `color: ${props.theme.typography.variants.body2.color};`',
    output: 'const style = `color: ${props.theme.sys.color.surface.paperText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-size: ${props.theme?.typography.variants.display2};`',
    output: 'const style = `font-size: ${props.theme?.sys.typography.h2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-size: ${props.theme.typography.variants?.caption2};`',
    output: 'const style = `font-size: ${props.theme.sys.typography?.label3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-family: ${props.theme?.typography.variants?.caption1.fontFamily};`',
    output: 'const style = `font-family: ${props.theme?.sys.typography?.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={props.theme?.typography.variants.display2} /> }',
    output: 'const component = () => { return <div style={props.theme?.sys.typography.h2} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={props.theme.typography.variants?.caption2} /> }',
    output: 'const component = () => { return <div style={props.theme.sys.typography?.label3} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const typography = theme.typography; const style = `font-size: ${typography.sizes.display2};`',
    output: 'const typography = theme.typography; const style = `font-size: ${theme.sys.typography.h2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = theme.typography; return <div style={{ fontSize: typography.sizes.display2 }} /> }',
    output: 'const component = () => { const typography = theme.typography; return <div style={{ fontSize: theme.sys.typography.h2.fontSize }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const typography = theme.typography; const style = `color: ${typography.colors.title};`',
    output: 'const typography = theme.typography; const style = `color: ${theme.sys.color.surface.backgroundText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = theme.typography; return <div style={{ color: typography.colors.disabled }} /> }',
    output: 'const component = () => { const typography = theme.typography; return <div style={{ color: theme.sys.color.action.disabled.text }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const typography = theme.typography; const style = `font-weight: ${typography.weights.extraLight};`',
    output: 'const typography = theme.typography; const style = `font-weight: ${theme.ref.typeface.fontWeightLight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = theme.typography; return <div style={{ fontWeight: typography.weights.bold }} /> }',
    output: 'const component = () => { const typography = theme.typography; return <div style={{ fontWeight: theme.ref.typeface.fontWeightMedium }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const typography = theme.typography; const style = `line-height: ${typography.lineHeights.medium};`',
    output: 'const typography = theme.typography; const style = `line-height: ${1.5};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = theme.typography; return <div style={{ lineHeight: typography.lineHeights.sm }} /> }',
    output: 'const component = () => { const typography = theme.typography; return <div style={{ lineHeight: 1.3 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = theme.typography; return <div style={typography.variants.display2} /> }',
    output: 'const component = () => { const typography = theme.typography; return <div style={theme.sys.typography.h2} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = theme.typography; return <div style={typography.variants.caption2} /> }',
    output: 'const component = () => { const typography = theme.typography; return <div style={theme.sys.typography.label3} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const typography = theme.typography; const style = `font-family: ${typography.variants.caption1.fontFamily};`',
    output: 'const typography = theme.typography; const style = `font-family: ${theme.sys.typography.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const typography = theme.typography; const style = `color: ${typography.variants.body2.color};`',
    output: 'const typography = theme.typography; const style = `color: ${theme.sys.color.surface.paperText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const typography = theme.typography; const style = `font-size: ${typography.variants.display2};`',
    output: 'const typography = theme.typography; const style = `font-size: ${theme.sys.typography.h2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const typography = theme.typography; const style = `font-size: ${typography.variants?.caption2};`',
    output: 'const typography = theme.typography; const style = `font-size: ${theme.sys.typography?.label3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const typography = theme.typography; const style = `font-family: ${typography.variants?.caption1.fontFamily};`',
    output: 'const typography = theme.typography; const style = `font-family: ${theme.sys.typography?.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = theme.typography; return <div style={typography.variants?.caption2} /> }',
    output: 'const component = () => { const typography = theme.typography; return <div style={theme.sys.typography?.label3} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const sizes = theme.typography.sizes; const style = `font-size: ${sizes.display2};`',
    output: 'const sizes = theme.typography.sizes; const style = `font-size: ${theme.sys.typography.h2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const sizes = theme.typography.sizes; return <div style={{ fontSize: sizes.display2 }} /> }',
    output: 'const component = () => { const sizes = theme.typography.sizes; return <div style={{ fontSize: theme.sys.typography.h2.fontSize }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const colors = theme.typography.colors; const style = `color: ${colors.title};`',
    output: 'const colors = theme.typography.colors; const style = `color: ${theme.sys.color.surface.backgroundText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const colors = theme.typography.colors; return <div style={{ color: colors.disabled }} /> }',
    output: 'const component = () => { const colors = theme.typography.colors; return <div style={{ color: theme.sys.color.action.disabled.text }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const weights = theme.typography.weights; const style = `font-weight: ${weights.extraLight};`',
    output: 'const weights = theme.typography.weights; const style = `font-weight: ${theme.ref.typeface.fontWeightLight};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const weights = theme.typography.weights; return <div style={{ fontWeight: weights.bold }} /> }',
    output: 'const component = () => { const weights = theme.typography.weights; return <div style={{ fontWeight: theme.ref.typeface.fontWeightMedium }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const lineHeights = theme.typography.lineHeights; const style = `line-height: ${lineHeights.medium};`',
    output: 'const lineHeights = theme.typography.lineHeights; const style = `line-height: ${1.5};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const lineHeights = theme.typography.lineHeights; return <div style={{ lineHeight: lineHeights.sm }} /> }',
    output: 'const component = () => { const lineHeights = theme.typography.lineHeights; return <div style={{ lineHeight: 1.3 }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const variants = theme.typography.variants; return <div style={variants.display2} /> }',
    output: 'const component = () => { const variants = theme.typography.variants; return <div style={theme.sys.typography.h2} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const variants = theme.typography.variants; return <div style={variants.caption2} /> }',
    output: 'const component = () => { const variants = theme.typography.variants; return <div style={theme.sys.typography.label3} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const variants = theme.typography.variants; const style = `font-family: ${variants.caption1.fontFamily};`',
    output: 'const variants = theme.typography.variants; const style = `font-family: ${theme.sys.typography.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const variants = theme.typography.variants; const style = `color: ${variants.body2.color};`',
    output: 'const variants = theme.typography.variants; const style = `color: ${theme.sys.color.surface.paperText};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const variants = theme.typography.variants; const style = `font-size: ${variants.display2};`',
    output: 'const variants = theme.typography.variants; const style = `font-size: ${theme.sys.typography.h2};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const variants = theme.typography.variants; const style = `font-size: ${variants?.caption2};`',
    output: 'const variants = theme.typography.variants; const style = `font-size: ${theme.sys.typography?.label3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const variants = theme.typography.variants; const style = `font-family: ${variants?.caption1.fontFamily};`',
    output: 'const variants = theme.typography.variants; const style = `font-family: ${theme.sys.typography?.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const variants = theme.typography.variants; return <div style={variants?.caption2} /> }',
    output: 'const component = () => { const variants = theme.typography.variants; return <div style={theme.sys.typography?.label3} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `font-family: ${theme.typography?.fontFamilyBase};`',
    output: 'const style = `font-family: ${theme.ref.typeface?.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-size: ${theme.typography?.fontSizeRoot};`',
    output: 'const style = `font-size: ${theme.ref.typeface?.htmlFontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-size: ${theme.typography?.fontSizeBase};`',
    output: 'const style = `font-size: ${theme.ref.typeface?.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const typography = theme.typography; const style = `font-family: ${typography?.fontFamilyBase};`',
    output: 'const typography = theme.typography; const style = `font-family: ${theme.ref.typeface?.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = theme.typography; return <div style={{fontSize: typography.fontSizeRoot}} /> }',
    output: 'const component = () => { const typography = theme.typography; return <div style={{fontSize: theme.ref.typeface.htmlFontSize}} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = theme.typography; return <div style={{fontSize: typography?.fontSizeBase}} /> }',
    output: 'const component = () => { const typography = theme.typography; return <div style={{fontSize: theme.ref.typeface?.fontSize}} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `font-size: ${theme2.typography.sizes.display2};`',
    output: 'const style = `font-size: ${theme2.sys.typography.h2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ fontSize: theme2?.typography.sizes.display2 }} /> }',
    output: 'const component = () => { return <div style={{ fontSize: theme2?.sys.typography.h2.fontSize }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-family: ${theme2.typography.variants.caption1.fontFamily};`',
    output: 'const style = `font-family: ${theme2.sys.typography.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-size: ${theme2.typography.variants?.caption2};`',
    output: 'const style = `font-size: ${theme2.sys.typography?.label3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = theme2.typography; return <div style={{ fontWeight: typography.weights.bold }} /> }',
    output: 'const component = () => { const typography = theme2.typography; return <div style={{ fontWeight: theme2.ref.typeface.fontWeightMedium }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const typography = theme2.typography; const style = `font-family: ${typography.variants.caption1.fontFamily};`',
    output: 'const typography = theme2.typography; const style = `font-family: ${theme2.sys.typography.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const sizes = theme2.typography.sizes; const style = `font-size: ${sizes.display2};`',
    output: 'const sizes = theme2.typography.sizes; const style = `font-size: ${theme2.sys.typography.h2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `font-size: ${builderTheme.typography.sizes.display2};`',
    output: 'const style = `font-size: ${builderTheme.sys.typography.h2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ fontSize: builderTheme?.typography.sizes.display2 }} /> }',
    output: 'const component = () => { return <div style={{ fontSize: builderTheme?.sys.typography.h2.fontSize }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-family: ${builderTheme.typography.variants.caption1.fontFamily};`',
    output: 'const style = `font-family: ${builderTheme.sys.typography.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-size: ${builderTheme.typography.variants?.caption2};`',
    output: 'const style = `font-size: ${builderTheme.sys.typography?.label3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = builderTheme.typography; return <div style={{ fontWeight: typography.weights.bold }} /> }',
    output: 'const component = () => { const typography = builderTheme.typography; return <div style={{ fontWeight: builderTheme.ref.typeface.fontWeightMedium }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const typography = builderTheme.typography; const style = `font-family: ${typography.variants.caption1.fontFamily};`',
    output: 'const typography = builderTheme.typography; const style = `font-family: ${builderTheme.sys.typography.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const sizes = builderTheme.typography.sizes; const style = `font-size: ${sizes.display2};`',
    output: 'const sizes = builderTheme.typography.sizes; const style = `font-size: ${builderTheme.sys.typography.h2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

  {
    code: 'const style = `font-size: ${this.theme.typography.sizes.display2};`',
    output: 'const style = `font-size: ${this.theme.sys.typography.h2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { return <div style={{ fontSize: this.theme?.typography.sizes.display2 }} /> }',
    output: 'const component = () => { return <div style={{ fontSize: this.theme?.sys.typography.h2.fontSize }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-family: ${this.theme.typography.variants.caption1.fontFamily};`',
    output: 'const style = `font-family: ${this.theme.sys.typography.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const style = `font-size: ${this.theme.typography.variants?.caption2};`',
    output: 'const style = `font-size: ${this.theme.sys.typography?.label3};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const component = () => { const typography = this.theme.typography; return <div style={{ fontWeight: typography.weights.bold }} /> }',
    output: 'const component = () => { const typography = this.theme.typography; return <div style={{ fontWeight: theme.ref.typeface.fontWeightMedium }} /> }',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const typography = this.theme.typography; const style = `font-family: ${typography.variants.caption1.fontFamily};`',
    output: 'const typography = this.theme.typography; const style = `font-family: ${theme.sys.typography.label2.fontFamily};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },
  {
    code: 'const sizes = this.theme.typography.sizes; const style = `font-size: ${sizes.display2};`',
    output: 'const sizes = this.theme.typography.sizes; const style = `font-size: ${theme.sys.typography.h2.fontSize};`',
    errors: [{ messageId: 'message', type: 'MemberExpression' }]
  },

]


ruleTester.run('no-classic-typography', rule, {
  valid: validTests,
  invalid: invalidTests
})

module.exports = { validTests, invalidTests }
