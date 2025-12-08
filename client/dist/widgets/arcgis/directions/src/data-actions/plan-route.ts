import { AbstractDataAction, type DataLevel, type DataRecordSet, MutableStoreManager, dataSourceUtils } from 'jimu-core'
import type { ReactElement, JSXElementConstructor } from 'react'
import { isRecordValid } from './utils'

export default class PlanRoute extends AbstractDataAction {
  async isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    return (await isRecordValid.bind(this)(dataSets, dataLevel)) && dataSets[0].records.length > 1 && dataSets[0].type === 'selected'
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
  async onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean | ReactElement<any, string | JSXElementConstructor<any>>> {
    const features = await Promise.all(dataSets[0].records.map(record => {
      return dataSourceUtils.changeToJSAPIGraphic((record as any)?.feature)
    }))
    const routeStops = features.map(feature => feature.geometry)
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'routeStops', routeStops)
    return true
  }
}
