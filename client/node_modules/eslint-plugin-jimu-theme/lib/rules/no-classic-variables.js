'use strict'
const {
  DocURL,
  getMatchNodeIdentifiers,
  DefaultThemeAliases,
  ThemeAllColors,
  ThemeLightDarkColors,
  ThemePaletteShades,
  TypographyVariantsMap,
  TypographyColorsMap,
  TypographyStylesMap,
  TypographyWeightsMap,
  TypographyLineHeightsMap,
  FontStyles,
  getVariableMappingInNewTheme,
  reportMessages,
  getSurfaceVariableStyleMappingInNewTheme
} = require('../utils')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'This rule updates variables from old classic theme to new theme.',
      recommended: false,
      url: `${DocURL}no-classic-variables.md`,
    },
    fixable: 'code',
    messages: {
      message: 'Theme variable upgraded from \'{{oldVar}}\' to \'{{newVar}}\' to align with the new theme.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          themeAliases: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: DefaultThemeAliases,
            description: 'The plug-in determines whether a variable is a theme variable based on the "theme" keyword. If you use another name, define it through this property.'
          },
          
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const option = context.options[0] || {}
    const themeAliases = option.themeAliases || DefaultThemeAliases
    return {
      MemberExpression(node) {
        const variables = context.sourceCode.getScope(node).variables
        let props = null
        if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'colors', [...ThemeAllColors, 'transparent']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'colors', 'palette', ThemeLightDarkColors, ThemePaletteShades], stop: themeAliases }, { value: variables, level: 2 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'colors', 'orgSharedColors', ['header', 'body', 'button'], ['color', 'bg', 'link']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'border', ['type', 'color', 'width']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'borderRadiuses', ['none', 'sm', 'default', 'lg']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'boxShadows', ['none', 'sm', 'default', 'lg']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'sizes', ['0', '1', '2', '3', '4', '5', '6']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'surfaces', ['1', '2'], ['bg', 'shadow']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'surfaces', ['1', '2'], 'border', ['color', 'width', 'type']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'surfaces', ['1', '2'],], stop: themeAliases }, { value: variables, level: 1 }))) {
          const level = props[2].identifier
          const isSpreadElementArgument = node.parent && node.parent.type === 'SpreadElement'
          const fixedText = getSurfaceVariableStyleMappingInNewTheme(level, isSpreadElementArgument)
          reportMessages(node, context, fixedText)
        } if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'variants', Object.keys(TypographyVariantsMap), Object.keys(TypographyStylesMap)], stop: themeAliases }, { value: variables, level: 2 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'variants', Object.keys(TypographyVariantsMap)], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'sizes', Object.keys(TypographyVariantsMap)], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'colors', Object.keys(TypographyColorsMap)], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'weights', Object.keys(TypographyWeightsMap)], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', 'lineHeights', Object.keys(TypographyLineHeightsMap)], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'typography', ['fontFamilyBase', 'fontSizeRoot', 'fontSizeBase']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'focusedStyles', ['offset', 'color', 'width']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'header', ['color', 'bg']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'footer', ['color', 'bg']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'body', ['color', 'bg', ...FontStyles]], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'link', ['color', 'decoration']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'link', 'hover', ['color', 'decoration']], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        } else if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'darkTheme'], stop: themeAliases }, { value: variables, level: 1 }))) {
          const fixedText = getVariableMappingInNewTheme(props, themeAliases)
          reportMessages(node, context, fixedText)
        }
      }
    }
  }
}
