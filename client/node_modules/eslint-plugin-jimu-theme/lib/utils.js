const DocURL = 'https://github.com/ming8525/eslint-plugin-jimu-theme/blob/develop/docs/rules/'
const CommonColors = ['white', 'black']
const ThemeColors = ['primary', 'secondary', 'danger', 'warning', 'info', 'success']
const NewThemeColors = ['primary', 'secondary', 'neutral', 'error', 'warning', 'info', 'success']
const LightDarkColors = ['light', 'dark']
const ThemeCommonColors = ThemeColors.concat(CommonColors)
const ThemeAllColors = ThemeCommonColors.concat(LightDarkColors)
const ThemeLightDarkColors = ThemeColors.concat(LightDarkColors)
const ThemePaletteShades = ['100', '200', '300', '400', '500', '600', '700', '800', '900']
const ThemeNeutralPaletteShades = ThemePaletteShades.concat(['1000', '1100', '1200', '1300'])
const NewThemeColorShade = ['light', 'main', 'dark']
const DefaultThemeAliases = ['theme', 'theme2', 'builderTheme', 'appTheme']
const FontStyles = ['fontFamily', 'fontWeight', 'fontSize', 'fontStyle', 'lineHeight']

function isStringNumber(str) {
  return /^[-+]?[0-9]*\.?[0-9]+$/.test(str)
}

function isEqualOrContains(var1, var2) {
  return var1 === var2 || (Array.isArray(var1) && var1.includes(var2))
}

function hasCommonItem(arr1, arr2) {
  return arr1.some(item => arr2.includes(item))
}

function isEqualOrCrossContains(var1, var2) {
  if (var1 === var2) return true
  if (Array.isArray(var1) && !Array.isArray(var2)) {
    return var1.includes(var2)
  } else if (Array.isArray(var2) && !Array.isArray(var1)) {
    return var2.includes(var1)
  } else if (Array.isArray(var1) && Array.isArray(var2)) {
    if (var1.length === 1) {
      return var2.includes(var1[0])
    } else if (var2.length === 1) {
      return var1.includes(var2[0])
    } else {
      return hasCommonItem(var1, var2)
    }
  }
}

const TypographyVariantsMap = {
  display1: 'h1',
  display2: 'h2',
  display3: 'h3',
  display4: 'h4',
  display5: 'h5',
  display6: 'h6',
  body1: 'inputField',
  body2: 'body',
  caption1: 'label2',
  caption2: 'label3'
}

const TypographyStylesMap = {
  fontFamily: 'fontFamily',
  fontWeight: 'fontWeight',
  lineHeight: 'lineHeight',
  color: 'paperText',
  fontSize: 'fontSize',
}

const TypographyColorsMap = {
  title: 'backgroundText',
  normal: 'paperText',
  caption: 'paperHint',
  disabled: 'disabled.text'
}

const TypographyWeightsMap = {
  extraLight: 'fontWeightLight',
  light: 'fontWeightLight',
  medium: 'fontWeightRegular',
  bold: 'fontWeightMedium',
  extraBold: 'fontWeightBold',
}

const TypographyLineHeightsMap = {
  medium: 1.5,
  sm: 1.3,
  lg: 1.7
}

function getColorNameAndScopeInNewTheme(inputColorName) {
  let scope = 'sys.color'
  let colorName = inputColorName
  if (colorName === 'danger') {
    colorName = 'error'
  } else if (colorName === 'light' || colorName === 'dark') {
    scope = 'ref.palette'
    colorName = 'neutral'
  } else if (colorName === 'white' || colorName === 'black') {
    scope = 'ref.palette'
  }
  return { scope, colorName }
}

function getColorShadeInNewTheme(inputColorName, inputShade, invertShadeLightDark) {
  if (ThemeColors.includes(inputColorName)) {
    if (['100', '200', '300'].includes(inputShade)) {
      return invertShadeLightDark ? 'dark' : 'light'
    } else if (!inputShade || ['400', '500', '600'].includes(inputShade)) {
      return 'main'
    } else if (['700', '800', '900'].includes(inputShade)) {
      return invertShadeLightDark ? 'light' : 'dark'
    }
  } else if (inputColorName === 'light') {
    if (inputShade === '100' || !inputShade) {
      return '200'
    } else if (inputShade === '200') {
      return '300'
    } else if (inputShade === '300') {
      return '400'
    } else if (inputShade === '400' || inputShade === '500') {
      return '500'
    } else if (inputShade === '600' || inputShade === '700') {
      return '600'
    } else if (inputShade === '800' || inputShade === '900') {
      return '700'
    }
  } else if (inputColorName === 'dark') {
    if (inputShade === '100' || inputShade === '200') {
      return '800'
    } else if (inputShade === '300' || inputShade === '400') {
      return '900'
    } else if (inputShade === '500' || inputShade === '600') {
      return '1000'
    } else if (inputShade === '700' || inputShade === '800') {
      return '1100'
    } else if (inputShade === '900' || !inputShade) {
      return '1200'
    }
  } else if (['header', 'body', 'button'].includes(inputColorName)) {
    return inputShade
  }
}

function getColorCSSVariableMappingInNewTheme(inputColorName, inputShape, invertShadeLightDark = false) {
  let mapping = ''
  const { scope, colorName } = getColorNameAndScopeInNewTheme(inputColorName)
  const p1 = 'var(--'
  const p2 = scope.replace('.', '-')
  const p5 = ')'
  if (inputShape) {
    const colorShade = getColorShadeInNewTheme(inputColorName, inputShape, invertShadeLightDark)
    if (ThemeColors.includes(inputColorName)) {
      const p3 = `-${colorName}`
      const p4 = `-${colorShade}`
      mapping = `${p1}${p2}${p3}${p4}${p5}`
    } else if (LightDarkColors.includes(inputColorName)) {
      const p3 = `-${colorName}`
      const p4 = `-${colorShade}`
      mapping = `${p1}${p2}${p3}${p4}${p5}`
    }
  } else {
    if (ThemeColors.includes(inputColorName)) {
      const p3 = `-${colorName}`
      const p4 = '-main'
      mapping = `${p1}${p2}${p3}${p4}${p5}`
    } else if (CommonColors.includes(inputColorName)) {
      const p3 = `-${colorName}`
      const p4 = ''
      mapping = `${p1}${p2}${p3}${p4}${p5}`
    } else if (LightDarkColors.includes(inputColorName)) {
      const colorShade = inputColorName === 'light' ? '200' : '1200'
      const p3 = `-${colorName}`
      const p4 = `-${colorShade}`
      mapping = `${p1}${p2}${p3}${p4}${p5}`
    } else if (inputColorName === 'transparent') {
      mapping = 'transparent'
    }
  }
  return mapping
}

function getSharedColorCSSVariableMappingInNewTheme(colorName, colorShade) {
  let mapping = ''
  const p1 = 'var(--'
  const p2 = 'mixin-shared-theme'
  const p5 = ')'
  const p3 = `-${colorName}`
  const p4 = `-${colorShade}`
  mapping = `${p1}${p2}${p3}${p4}${p5}`
  return mapping
}

const UtilitiesMap = {
  'text-dark': 'text-default',
  'text-dark-400': 'hint-default',
  'text-dark-600': 'hint-paper',
  'text-black': 'text-overlay',
  'bg-light': 'bg-paper',
  'bg-light-300': 'bg-default',
  'bg-white': 'bg-overlay',
  'border-light': 'border-color-tertiary',
  'border-light-500': 'border-color-secondary',
  'border-light-800': 'border-color-primary',
  'rounded-none': 'rounded-0',
  'rounded': 'rounded-1',
  'rounded-sm': 'rounded-0',
  'rounded-lg': 'rounded-2',
  'shadow-none': 'shadow-0',
  'shadow': 'shadow',
  'shadow-sm': 'shadow-1',
  'shadow-lg': 'shadow-3',
  'setting-text-level-0': 'title2 text-paper',
  'setting-text-level-1': 'title2 hint-paper',
  'setting-text-level-2': 'title3 text-default',
  'setting-text-level-3': 'title3 hint-default',
  'text-title': 'text-default',
  'text-normal': 'text-paper',
  'text-caption': 'hint-paper',
  'text-disabled': 'text-disabled',
  'text-muted': 'text-disabled',
  'font-h1': 'h1 text-default',
  'font-h2': 'h2 text-default',
  'font-h3': 'h3 text-default',
  'font-h4': 'h4 text-default',
  'font-h5': 'h5 text-default',
  'font-h6': 'h6 text-default',
  'font-body1': 'input-field text-paper',
  'font-body2': 'body text-paper',
  'font-caption1': 'caption1 hint-paper',
  'font-caption2': 'caption2 hint-paper',
}

const UtilitiesStylesMap = {
  'bg-success': { backgroundColor: 'var(--sys-color-success)' },
  'text-danger': { color: 'var(--sys-color-error)' },
  'bg-primary': { backgroundColor: 'var(--sys-color-primary)' },
  'bg-secondary': { backgroundColor: 'var(--sys-color-secondary)' },
  'bg-transparent': { backgroundColor: 'transparent' },
}

function getCSSUtilitiesMappingInNewTheme(input) {
  if (!input) return
  let utilityMap = UtilitiesMap[input]
  if (!utilityMap) {
    utilityMap = UtilitiesStylesMap[input]
  }
  return utilityMap
}

function isSpecifiedMemberExpressionNode(node, identifiers, longest = true) {
  if (!node || node.type !== 'MemberExpression' || !Array.isArray(identifiers) || identifiers.length === 0) {
    return false
  }
  if (longest && node.parent && node.parent.type === 'MemberExpression') {
    return false
  }

  let currentNode = node

  for (let i = identifiers.length - 1; i >= 0; i--) {
    const identifier = identifiers[i]

    if (!currentNode) return false

    if (i === 0 && currentNode.type === 'Identifier' && isEqualOrContains(identifier, currentNode.name)) {
      return true
    }
    if (i === 0 && currentNode.type === 'ThisExpression' && isEqualOrContains(identifier, 'this')) {
      return true
    }
    if (currentNode.type !== 'MemberExpression') {
      return false
    }

    if (!isEqualOrContains(identifier, currentNode.computed ? currentNode.property.raw : currentNode.property.name)) {
      return false
    }

    currentNode = currentNode.object
  }

  return false
}

function getNodeProperty(node) {
  let optional = false
  let property = ''
  if (node) {
    if (node.type === 'ThisExpression') {
      property = 'this'
    } if (node.type === 'Identifier') {
      optional = !!node.optional
      property = node.name
    } else if (node.type === 'MemberExpression') {
      optional = !!node.optional
      property = node.computed ? node.property.raw : node.property.name
    }
  }
  return { property, optional }
}

function getVariableDefinitionProperty(definition) {
  let node = null
  let properties = []
  let isPlainVariable = true
  const defNode = definition && definition.defs[0].node
  if (defNode) {
    if (defNode.type === 'VariableDeclarator') {
      const id = defNode.id
      if (id.type === 'ObjectPattern') {
        isPlainVariable = false
        properties = id.properties.map((property) => property.value.name)
        node = defNode.init
      } else {
        const initNode = defNode.init
        node = getValidMemberExpression(initNode)
        const res = getNodeProperty(node)
        properties = [res.property]
      }
    }

  }
  return [node, properties, isPlainVariable]
}

function getMatchNodeIdentifiers(node, identifier = { value: [], stop: [] }, variable = { value: [], level: 1 }, longest = true) {
  if (!node || node.type !== 'MemberExpression') {
    return
  }
  if (longest && node.parent && node.parent.type === 'MemberExpression') {
    return false
  }
  const { value: identifiers, stop: stopIdentifiers } = identifier

  const identifiersLength = identifiers.length

  if (!identifiersLength || !stopIdentifiers.length) {
    return
  }

  const variables = variable.value
  let validVariableCheckLevel = variable.level

  let res = []
  let afterStopStage = false
  let times = 0
  const traverseNode = (type, node, identifiers, variables, prevIdentifier) => {
    if (node) {
      times++
      const { property, optional } = getNodeProperty(node)
      if (afterStopStage) {
        res.unshift({ type, identifier: property, optional })
        return traverseNode(type, node.object, identifiers, variables, property)
      } else {
        const isStop = times > identifiersLength - 1 && stopIdentifiers.includes(property)
        if (isStop) {
          afterStopStage = true
          res.unshift({ type, identifier: property, optional })
          return traverseNode(type, node.object, identifiers, variables, property)
        } else {
          const identifier = identifiers.pop()
          if (!identifier) return true
          const equal = isEqualOrContains(identifier, property)
          if (equal) {
            res.unshift({ type, identifier: property, optional })
            return traverseNode(type, node.object, identifiers, variables, property)
          }
        }
      }
    } else {
      if (afterStopStage) return true
      if (stopIdentifiers.includes(prevIdentifier)) {
        return true
      } else {
        if (validVariableCheckLevel && variables.length) {
          validVariableCheckLevel--
          const definition = variables.find(variable => variable.name === prevIdentifier)
          const [variableNode, variableProperties, isPlainVariable] = getVariableDefinitionProperty(definition)
          const equal = isEqualOrCrossContains(prevIdentifier, variableProperties)
          // if variable property is match with previous identifier
          if (equal) {
            return traverseNode('variable', isPlainVariable ? variableNode.object : variableNode, identifiers, variables, prevIdentifier)
          } else {
            return false
          }
        } else {
          return false
        }
      }
    }
  }


  const valid = traverseNode('identifier', node, identifiers, variables)
  return valid ? res : false
}

function getColorMappingScope(part) {
  let scope = 'sys.color'
  let property = part.identifier
  if (part.identifier === 'danger') {
    property = 'error'
  } else if (part.identifier === 'light' || part.identifier === 'dark') {
    scope = 'ref.palette'
    property = 'neutral'
  } else if (part.identifier === 'white' || part.identifier === 'black') {
    scope = 'ref.palette'
    property = part.identifier
  } else if (part.identifier === 'transparent') {
    scope = ''
    property = '\'transparent\''
  } else if (ThemeColors.includes(part.identifier)) {
    scope = 'sys.color'
    property = part.identifier
  } else if (['header', 'body', 'button'].includes(part.identifier)) {
    scope = 'mixin.sharedTheme'
    property = part.identifier
  }
  return { scope, property }
}

function createIdentifierProp(identifier, optional = false, called = false) {
  return { type: 'identifier', identifier, optional, called }
}

function getColorsPropsMapping(props, invertShadeLightDark) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let part2 = props[1]
  let part3 = props[2]
  let part4 = props[3]
  if (part1.identifier === 'colors' && part2.identifier !== 'palette' && part2.identifier !== 'orgSharedColors') {
    const { scope, property } = getColorMappingScope(part2)
    if (!scope) {
      type = 'string'
      mappings = [createIdentifierProp(property, false)]
    } else {
      mappings.push(createIdentifierProp(scope, part1.optional))
      mappings.push(createIdentifierProp(property, part2.optional))
      const shade = getColorShadeInNewTheme(part2.identifier)
      if (shade) {
        mappings.push(createIdentifierProp(shade, false))
      }
    }
  } else if (part2.identifier === 'palette' || part2.identifier === 'orgSharedColors') {
    const { scope, property } = getColorMappingScope(part3)
    const shade = getColorShadeInNewTheme(part3.identifier, part4.identifier, invertShadeLightDark)
    mappings.push(createIdentifierProp(scope, part1.optional || part2.optional))
    mappings.push(createIdentifierProp(property, part3.optional))
    mappings.push(createIdentifierProp(shade, part4.optional))
  }
  return { type, mappings }
}

function getBorderPropsMapping(props) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let part2 = props[1]
  if (part2.identifier === 'color') {
    mappings.push(createIdentifierProp('sys.color.divider', part1.optional))
    mappings.push(createIdentifierProp('primary', part2.optional))
  } else {
    type = 'string'
    const property = part2.identifier === 'type' ? '\'solid\'' : '\'1px\''
    mappings.push(createIdentifierProp(property, part2.optional))
  }

  return { type, mappings }
}

function getBorderRadiusPropsMapping(props) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let part2 = props[1]
  if (part2.identifier === 'default' || part2.identifier === 'lg') {
    const property = part2.identifier === 'default' ? 'shape1' : 'shape2'
    mappings.push(createIdentifierProp('sys.shape', part1.optional))
    mappings.push(createIdentifierProp(property, part2.optional))
  } else {
    type = 'string'
    const property = part2.identifier === 'none' ? '\'none\'' : '\'0px\''
    mappings.push(createIdentifierProp(property, part2.optional))
  }

  return { type, mappings }
}

function getShadowPropsMapping(props) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let part2 = props[1]
  if (part2.identifier === 'none') {
    type = 'string'
    const property = '\'none\''
    mappings.push(createIdentifierProp(property, part2.optional))
  } else {
    let property = part2.identifier === 'default' ? 'shape1' : 'shape2'
    if (part2.identifier === 'default') {
      property = 'shadow2'
    } else if (part2.identifier === 'sm') {
      property = 'shadow1'
    } else if (part2.identifier === 'lg') {
      property = 'shadow3'
    }
    mappings.push(createIdentifierProp('sys.shadow', part1.optional))
    mappings.push(createIdentifierProp(property, part2.optional))
  }

  return { type, mappings }
}

function getSizesPropsMapping(props) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let part2 = props[1]
  const property = part2.identifier
  mappings.push(createIdentifierProp('sys.spacing', part1.optional))
  mappings.push(createIdentifierProp(property, part2.optional, true))
  return { type, mappings }
}

const GuttersMap = {
  0: '0px',
  1: '1px',
  2: '2px',
  3: '4px',
  4: '8px',
  5: '10px'
}

function getGuttersPropsMapping(props) {
  let type = 'string'
  let mappings = []
  let part2 = props[1]
  const property = `'${GuttersMap[part2.identifier]}'`
  mappings.push(createIdentifierProp(property, part2.optional, true))
  return { type, mappings }
}


function getSurfacePropsMapping(props) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let part2 = props[1]
  let part3 = props[2]
  let part4 = props[3]

  let scope = ''
  let property = ''
  if (part3.identifier === 'border') {
    if (part4.identifier === 'color') {
      scope = 'sys.color.divider'
      property = 'secondary'
    } else {
      type = 'string'
      scope = ''
      property = part4.identifier === 'type' ? '\'solid\'' : '\'1px\''
    }
  } else {
    if (part3.identifier === 'bg') {
      scope = 'sys.color.surface'
      property = part2.identifier === '1' ? 'paper' : 'overlay'
    } else if (part3.identifier === 'shadow') {
      if (part2.identifier === '1') {
        type = 'string'
        scope = ''
        property = '\'none\''
      } else {
        scope = 'sys.shadow'
        property = 'shadow2'
      }
    }
  }
  if (scope) {
    mappings.push(createIdentifierProp(scope, part1.optional))
  }
  mappings.push(createIdentifierProp(property, part2.optional || part3.optional))
  return { type, mappings }
}

const TypographyColorMap = {
  display: 'backgroundText',
  body: 'paperText',
  caption: 'paperHint',
}

function getTypographyMapping(props) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let part2 = props[1]
  let part3 = props[2]
  let part4 = props[3]

  let scope = ''
  let property = ''
  let shade = ''
  if (part2.identifier === 'variants') {
    scope = 'sys.typography'
    property = TypographyVariantsMap[part3.identifier]
    if (part4) {
      if (part4.identifier === 'color') {
        scope = 'sys.color.surface'
        property = TypographyColorMap[part3.identifier.slice(0, -1)]
        mappings.push(createIdentifierProp(scope, part1.optional || part2.optional))
        mappings.push(createIdentifierProp(property, part3.optional || part4.optional))
      } else {
        shade = part4.identifier
        mappings.push(createIdentifierProp(scope, part1.optional || part2.optional))
        mappings.push(createIdentifierProp(property, part3.optional))
        mappings.push(createIdentifierProp(shade, part4.optional))
      }
    } else {
      mappings.push(createIdentifierProp(scope, part1.optional || part2.optional))
      mappings.push(createIdentifierProp(property, part3.optional))
    }
  } else if (['fontFamilyBase', 'fontSizeRoot', 'fontSizeBase'].includes(part2.identifier)) {
    scope = 'ref.typeface'
    if (part2.identifier === 'fontFamilyBase') {
      property = 'fontFamily'
    } else if (part2.identifier === 'fontSizeRoot') {
      property = 'htmlFontSize'
    } else if (part2.identifier === 'fontSizeBase') {
      property = 'fontSize'
    }
    mappings.push(createIdentifierProp(scope, part1.optional))
    mappings.push(createIdentifierProp(property, part2.optional))
  } else {
    if (part2.identifier === 'sizes') {
      scope = 'sys.typography'
      property = TypographyVariantsMap[part3.identifier]
      shade = 'fontSize'
    } else if (part2.identifier === 'colors') {
      scope = part3.identifier === 'disabled' ? 'sys.color.action' : 'sys.color.surface'
      property = TypographyColorsMap[part3.identifier]
    } else if (part2.identifier === 'weights') {
      scope = 'ref.typeface'
      property = TypographyWeightsMap[part3.identifier]
    } else if (part2.identifier === 'lineHeights') {
      scope = ''
      type = 'string'
      property = TypographyLineHeightsMap[part3.identifier]
    }
    if (scope) {
      mappings.push(createIdentifierProp(scope, part1.optional || part2.optional))
    }
    mappings.push(createIdentifierProp(property, part3.optional))
    if (shade) {
      mappings.push(createIdentifierProp(shade, false))
    }
  }

  return { type, mappings }
}

function getFocusedStylesPropsMapping(props) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let part2 = props[1]
  if (part2.identifier === 'color') {
    mappings.push(createIdentifierProp('sys.color.action', part1.optional))
    mappings.push(createIdentifierProp('focus', part2.optional))
  } else {
    type = 'string'
    const property = '\'2px\''
    mappings.push(createIdentifierProp(property, part2.optional))
  }
  return { type, mappings }
}

function getHeaderFooterPropsMapping(props) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let part2 = props[1]
  let scope = 'sys?.color.surface'
  const headerOrFooter = part1.identifier
  const property = part2.identifier === 'color' ? `${headerOrFooter}Text` : headerOrFooter
  mappings.push(createIdentifierProp(scope, part1.optional))
  mappings.push(createIdentifierProp(property, part2.optional))
  return { type, mappings }
}

function getBodyPropsMapping(props) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let part2 = props[1]
  let scope = ''
  let property = ''
  if (FontStyles.includes(part2.identifier)) {
    if (part2.identifier === 'fontStyle') {
      type = 'string'
      scope = ''
      property = '\'unset\''
    } else {
      scope = 'sys.typography.body2'
      property = part2.identifier
    }
  } else if (part2.identifier === 'color' || part2.identifier === 'bg') {
    scope = 'sys.color.surface'
    property = part2.identifier === 'color' ? 'backgroundText' : 'background'
  }
  if (scope) {
    mappings.push(createIdentifierProp(scope, part1.optional))
  }
  mappings.push(createIdentifierProp(property, part2.optional))
  return { type, mappings }
}

function getLinkPropsMapping(props) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let part2 = props[1]
  let part3 = props[2]
  let scope = ''
  let property = ''
  if (part2.identifier === 'hover' && part3) {
    if (part3.identifier === 'decoration') {
      type = 'string'
      scope = ''
      property = '\'underline\''
    } else {
      scope = 'sys.color.action.link'
      property = 'hover'
    }
  } else {
    if (part2.identifier === 'decoration') {
      type = 'string'
      scope = ''
      property = '\'none\''
    } else {
      scope = 'sys.color.action.link'
      property = 'default'
    }
  }
  if (scope) {
    mappings.push(createIdentifierProp(scope, part1.optional))
  }
  mappings.push(createIdentifierProp(property, part2.optional))
  return { type, mappings }
}

function getDarkThemePropsMapping(props) {
  let type = 'identifier'
  let mappings = []
  let part1 = props[0]
  let scope = 'sys.color.mode === \'dark\''
  mappings.push(createIdentifierProp(scope, part1.optional))
  return { type, mappings }
}

function getMatchedPropsMapping(props, themeAliases, invertShadeLightDark = false) {
  const themeIndex = props.findIndex((prop) => themeAliases.includes(prop.identifier))
  let preThemeProps = props.slice(0, themeIndex).filter((prop) => prop.type === 'identifier')
  const themeProp = props[themeIndex]
  const variableProps = props.slice(themeIndex + 1)
  let type = 'identifier'
  let variablesMapping = []
  if (variableProps[0].identifier === 'colors') {
    const res = getColorsPropsMapping(variableProps, invertShadeLightDark)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'border') {
    const res = getBorderPropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'borderRadiuses') {
    const res = getBorderRadiusPropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'boxShadows') {
    const res = getShadowPropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'sizes') {
    const res = getSizesPropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'gutters') {
    const res = getGuttersPropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'surfaces') {
    const res = getSurfacePropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'typography') {
    const res = getTypographyMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'focusedStyles') {
    const res = getFocusedStylesPropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'header') {
    const res = getHeaderFooterPropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'footer') {
    const res = getHeaderFooterPropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'body') {
    const res = getBodyPropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'link') {
    const res = getLinkPropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  } else if (variableProps[0].identifier === 'darkTheme') {
    const res = getDarkThemePropsMapping(variableProps)
    type = res.type
    variablesMapping = res.mappings
  }
  const mapping = type === 'string' ? variablesMapping : preThemeProps.concat(themeProp).concat(variablesMapping)
  return mapping
}

function getVariablesPath(mappings) {
  let path = ''
  if (mappings.length === 1) {
    path = mappings[0].identifier
  } else if (mappings.length > 1) {
    mappings.forEach((mapping) => {
      const isNumberIdentifier = isStringNumber(mapping.identifier)
      let sp = isNumberIdentifier ? `${mapping.optional ? '?.' : ''}[${mapping.identifier}]` : `${mapping.optional ? '?' : ''}.${mapping.identifier}`
      if (mapping.called) {
        sp = `${mapping.optional ? '?.' : ''}(${mapping.identifier})`
      }
      path += sp
    })
    path = path.replace(/^\??\./g, '')
  }
  return path
}

function getVariableMappingInNewTheme(props, themeAliases) {
  let mapping = ''
  if (!props || !props.length) return mapping
  const mappings = getMatchedPropsMapping(props, themeAliases)
  const path = getVariablesPath(mappings)
  return path
}

function reportMessages(node, context, fixedText) {
  const rawCode = context.sourceCode.getText(node)
  context.report({
    node: node,
    messageId: 'message',
    data: {
      oldVar: rawCode,
      newVar: fixedText
    },
    fix: function (fixer) {
      return fixer.replaceText(node, fixedText)
    }
  })
}

function getSurfaceVariableStyleMappingInNewTheme(level, isSpreadElementArgument) {
  const newVar = `{
    bg: theme.sys.color.surface.${level === '1' ? 'paper' : 'overlay'},
    border: {
      color: theme.sys.color.divider.secondary,
      width: '1px'
    },
    shadow: ${level === '1' ? '\'none\'' : 'theme.sys.shadow.shadow2'}
  }`
  const fixedText = isSpreadElementArgument ? `(${newVar})` : newVar
  return fixedText
}

function getValidMemberExpression(node) {
  if (!node) return node
  if (node.type === 'ChainExpression') return node.expression
  else if (node.type === 'LogicalExpression') {
    if (node.left.type === 'Identifier' || node.left.type === 'MemberExpression') return node.left
    else if (node.right.type === 'Identifier' || node.right.type === 'MemberExpression') return node.right
  }
  return node
}

function uppercaseFirstLetter(string) {
  if (!string) return string
  return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = {
  DocURL,
  FontStyles,
  DefaultThemeAliases,
  ThemeCommonColors,
  NewThemeColors,
  NewThemeColorShade,
  ThemeAllColors,
  ThemeLightDarkColors,
  ThemePaletteShades,
  ThemeNeutralPaletteShades,
  TypographyVariantsMap,
  TypographyColorsMap,
  TypographyLineHeightsMap,
  TypographyStylesMap,
  TypographyWeightsMap,
  createIdentifierProp,
  uppercaseFirstLetter,
  getColorNameAndScopeInNewTheme,
  getColorShadeInNewTheme,
  isSpecifiedMemberExpressionNode,
  getValidMemberExpression,
  getColorCSSVariableMappingInNewTheme,
  getSharedColorCSSVariableMappingInNewTheme,
  getCSSUtilitiesMappingInNewTheme,
  getMatchNodeIdentifiers,
  getVariableMappingInNewTheme,
  getSurfaceVariableStyleMappingInNewTheme,
  reportMessages,
  getVariablesPath,
  getColorsPropsMapping
}
