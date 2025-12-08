import {
  React,
  jsx,
  type DataRecordSet,
  AbstractDataAction,
  DataLevel
} from 'jimu-core'
import { featureUtils } from 'jimu-arcgis'
import { SelectParameterPopper, isAnalysisSupportedImagery, isFeatureLayer } from './select-parameter-popper'

export default class SetAsInputOfAnalysis extends AbstractDataAction {
  supportProviderWidget = true
  _version: number
  _versionPrefix: number
  /**
   *
   */
  async isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    if (dataSets.length > 1) {
      return false
    }
    const dataSet = dataSets[0]
    if (isAnalysisSupportedImagery(dataSet.dataSource)) {
      return true
    }
    const isDsLevel = dataLevel === DataLevel.DataSource

    if (isDsLevel) {
      return isFeatureLayer(dataSet.dataSource)
    }

    const { dataSource, records, fields, name } = dataSet
    try {
      const featureSet: __esri.FeatureSet = await featureUtils.convertDataRecordSetToFeatureSet({ dataSource, records, fields, name })

      if (featureSet.features.length) {
        return true
      }
    } catch (error) {
      return false
    }
  }

  onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean | React.ReactElement> {
    const dataSet = dataSets[0]

    if (!this._version) {
      this._version = 0
      this._versionPrefix = Date.now()
    }

    return Promise.resolve(<SelectParameterPopper
      activeRef={document.querySelector('.active-data-action-item')}
      widgetId={this.widgetId}
      dataSet={dataSet}
      dataLevel={dataLevel}
      version={`${this._versionPrefix}_${this._version++}`}
      intl={this.intl}
    />)
  }
}
