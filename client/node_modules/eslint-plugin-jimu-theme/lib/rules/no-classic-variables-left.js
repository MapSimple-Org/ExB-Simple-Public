'use strict'
const { DocURL, getMatchNodeIdentifiers, createIdentifierProp, getVariablesPath, DefaultThemeAliases, ThemeLightDarkColors, ThemePaletteShades } = require('../utils')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'This rule is to check whether there are any remaining classical variables.',
      recommended: false,
      url: `${DocURL}no-classic-variables-left.md`,
    },
    fixable: 'code',
    messages: {
      message: 'Classic theme variables should not exist.',
      invalid: 'Invalid color variable, please confirm if you need it, if so please replace it with `{{newVar}}`'
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
        if ((props = getMatchNodeIdentifiers(node, { value: [themeAliases, 'colors', ThemeLightDarkColors, ThemePaletteShades], stop: themeAliases }, { value: variables, level: 2 }, true))) {
          let mappings = []
          let prevIdentifier = ''
          props.forEach((prop) => {
            if (prop.type === 'identifier' || themeAliases.includes(prop.identifier)) {
              if (prop.identifier === 'colors' && themeAliases.includes(prevIdentifier)) {
                mappings.push(prop)
                mappings.push(createIdentifierProp('palette', prop.optional, false))
              } else {
                mappings.push(prop)
              }
            }
            prevIdentifier = prop.identifier
          })
          const newVar = getVariablesPath(mappings)
          context.report({
            node: node,
            data: {
              newVar
            },
            messageId: 'invalid',
          })
        } else if (getMatchNodeIdentifiers(node, { value: [themeAliases, ['colors', 'border', 'borderRadiuses', 'boxShadows', 'sizes', 'surfaces', 'typography', 'header', 'footer', 'body', 'link', 'darkTheme']], stop: themeAliases }, { value: variables, level: 1 }, false)) {
          context.report({
            node: node,
            messageId: 'message',
          })
        }
      }
    }
  }
}
