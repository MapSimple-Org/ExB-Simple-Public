import { BaseVersionManager, type Expression as ExpressionValue, utils, ExpressionPartType, getAppStore } from 'jimu-core'
import { EmbedType } from './config'

const getExpressionString = (expression: ExpressionValue): string => {
  try {
    let string = JSON.stringify(expression)
    string = encodeURIComponent(string)
    return string
  } catch (error) {
    console.error(error)
  }
}

const renderExpressionToHtml = (expression: ExpressionValue) => {
  let multiExpDom = ''
  const { parts } = expression
  if (parts.length > 0) {
    let functionFlag = false
    const functionExp = { name: '', parts: [] }
    // Ensure that Function nesting is closed
    let leftBracketsCount = 0
    let rightBracketsCount = 0
    let functionDsId = ''
    parts.forEach(part => {
      const { type, dataSourceId: dsId, exp: name } = part
      if (functionFlag) {
        functionExp.name += name
        functionExp.parts.push(part)
        if (dsId) functionDsId = dsId
        if (type === ExpressionPartType.Operator && name === '(') {
          leftBracketsCount++
        } else if (type === ExpressionPartType.Operator && name === ')') {
          rightBracketsCount++
          if (rightBracketsCount === leftBracketsCount) {
            // reset all
            leftBracketsCount = 0
            rightBracketsCount = 0
            functionFlag = false
            // encode function
            const uniqueId = utils.getUUID()
            const expDom = document && document.createElement('exp')
            expDom.setAttribute('data-uniqueid', uniqueId)
            expDom.setAttribute('data-dsid', functionDsId)
            expDom.setAttribute('data-expression', getExpressionString(functionExp))
            expDom.innerHTML = functionExp.name
            multiExpDom += expDom.outerHTML
          }
        }
        return false
      }
      if (type === ExpressionPartType.Field) {
        const uniqueId = utils.getUUID()
        const expDom = document && document.createElement('exp')
        expDom.setAttribute('data-uniqueid', uniqueId)
        expDom.setAttribute('data-dsid', dsId)
        expDom.setAttribute('data-expression', getExpressionString({ name, parts: [part] }))
        expDom.innerHTML = name
        multiExpDom += expDom.outerHTML
      } else if (type === ExpressionPartType.String) {
        multiExpDom += name.replace(/(^['|"]*|['|"]*$)/g, '')
      } else if (type === ExpressionPartType.Number) {
        multiExpDom += name
      } else if (type === ExpressionPartType.Function) {
        functionFlag = true
        functionExp.name = name
        functionExp.parts.push(part)
      }
    })
  }
  return `<p>${multiExpDom}</p>`
}

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.0.0',
    description: 'The first release.',
    upgrader: (oldConfig) => {
      const embedType = oldConfig?.functionConfig?.embedType
      const content = oldConfig?.functionConfig?.content
      if (embedType) {
        oldConfig = oldConfig.set('embedType', embedType)
        if (embedType === EmbedType.Url) {
          oldConfig = oldConfig.set('staticUrl', content)
        } else {
          oldConfig = oldConfig.set('embedCode', content)
        }
      } else {
        oldConfig = oldConfig.set('embedType', EmbedType.Url)
      }
      oldConfig = oldConfig.without('functionConfig')
      return oldConfig
    }
  }, {
    version: '1.4.0',
    description: 'Enhance the URL editor.',
    upgrader: (oldConfig, id) => {
      const embedType = oldConfig?.embedType
      const expression = oldConfig?.expression
      const staticUrl = oldConfig?.staticUrl
      const widgetProps = getAppStore().getState()?.appConfig?.widgets[id]
      const useDataSourcesEnabled = widgetProps?.useDataSourcesEnabled
      if (expression?.name) {
        oldConfig = oldConfig.set('enableLabel', true).set('label', expression.name)
      }
      if (embedType === EmbedType.Url && staticUrl) {
        const expression = `<p>${staticUrl}</p>`
        oldConfig = oldConfig.set('expression', expression)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
      } else if (embedType === EmbedType.Url && expression && (useDataSourcesEnabled !== false)) {
        const htmlValue = renderExpressionToHtml(expression)
        oldConfig = oldConfig.set('expression', htmlValue)
      }
      return oldConfig
    }
  }, {
    version: '1.7.0',
    description: 'Update some wrong config',
    upgrader: (oldConfig, id) => {
      const expression = oldConfig?.expression
      const clearEmptyTag = (expression) => {
        const EXP_TAG_REGEXP = /\<exp((?!\<exp).)+\<\/exp\>/gmi
        const hasExpressionTag = expression?.match(EXP_TAG_REGEXP)
        let filterExp = expression
        if (hasExpressionTag) {
          hasExpressionTag.forEach(expTag => {
            const tagContent = expTag.match(/<exp[^>]*>([\s\S]*?)<\/exp>/)?.[1]
            const matchSpan = tagContent.match(/<span[^>]*>([\s\S]*?)<\/span>/)
            const spanContent = matchSpan && tagContent.match(/<span[^>]*>([\s\S]*?)<\/span>/)?.[1]
            if (!tagContent.trim() || (matchSpan && !spanContent.trim())) {
              filterExp = filterExp.replace(expTag, '')
            }
          })
        }
        return filterExp
      }
      oldConfig = oldConfig.set('expression', clearEmptyTag(expression))
      return oldConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
