import type { IPopupInfo } from '@esri/arcgis-rest-feature-service'
import type { IntlShape, DataSource } from 'jimu-core'

/**
 * Toggle items in an array
 */
export const toggleItemInArray = (item, items = []) => items.includes(item) ? items.filter(i => i !== item) : [...items, item]

export interface DataSourceMap {
  [dataSourceId: string]: DataSource
}

export type GetI18nMessageType = (id: string, options?: { messages?: any, values?: any }) => string
/**
 * A factory to create a function of getting i18n message
 */
export function createGetI18nMessage (options: { intl: IntlShape, defaultMessages?: any }) {
  const { intl, defaultMessages = {} } = options || {}
  const getI18nMessage: GetI18nMessageType = (id, options) => {
    const { messages, values } = options || {}
    return intl.formatMessage({ id, defaultMessage: (messages || defaultMessages)[id] }, values)
  }
  return getI18nMessage
}

export function getFieldInfosInPopupContent (popupInfo: IPopupInfo) {
  const result = []
  if (popupInfo?.popupElements?.length > 0) {
    popupInfo.popupElements.forEach(element => {
      if (element.type === 'fields' && element.fieldInfos?.length > 0) {
        result.push(...element.fieldInfos)
      }
    })
  }
  return result
}



