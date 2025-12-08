import { type DataRecordSet, type DataAction, DataLevel, i18n, DataRecordsSelectionChangeMessage, MessageManager, type QueriableDataSource } from 'jimu-core'
import { defaultMessages as jimuUiMessages } from 'jimu-ui'
import selectIcon from '../runtime/assets/icons/select-all.svg'
import clearIcon from '../runtime/assets/icons/unselect-all.svg'
import defaultMessages from '../runtime/translations/default'

export function getExtraActions (widgetId: string): DataAction[] {
  return [
    {
      id: 'query-select-loaded',
      label: i18n.getIntl(widgetId).formatMessage({ id: 'selectLoaded', defaultMessage: defaultMessages.selectLoaded }),
      intl: i18n.getIntl(widgetId),
      icon: selectIcon,

      destroy: () => {
        //empty
      },

      isSupported: (_: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> => {
        return Promise.resolve(dataLevel === DataLevel.Records)
      },

      onExecute: (dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean> => {
        const dataSet = dataSets[0]
        const { dataSource } = dataSet
        ;(dataSource as QueriableDataSource).selectAllLoadedRecords()

        MessageManager.getInstance().publishMessage(new DataRecordsSelectionChangeMessage(widgetId, (dataSource as QueriableDataSource).getAllLoadedRecords(), [dataSource.id]))
        return Promise.resolve(true)
      }
    },
    {
      id: 'query-clear-selection',
      label: i18n.getIntl(widgetId).formatMessage({ id: 'clearSelection', defaultMessage: jimuUiMessages.clearSelection }),
      intl: i18n.getIntl(widgetId),
      icon: clearIcon,

      destroy: () => {
        //empty
      },

      isSupported: (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> => {
        if (dataLevel !== DataLevel.Records) {
          return Promise.resolve(false)
        }
        const dataSet = dataSets[0]
        const { dataSource } = dataSet
        if (dataSource.getSelectedRecordIds().length === 0) {
          return Promise.resolve(false)
        }
        return Promise.resolve(true)
      },

      onExecute: (dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean> => {
        const dataSet = dataSets[0]
        const { dataSource } = dataSet
        dataSource.clearSelection()

        MessageManager.getInstance().publishMessage(new DataRecordsSelectionChangeMessage(widgetId, [], [dataSource.id]))
        return Promise.resolve(true)
      }
    }
  ]
}

