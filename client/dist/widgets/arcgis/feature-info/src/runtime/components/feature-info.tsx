import { React, type DataSource, type Timezone, dataSourceUtils } from 'jimu-core'
import { loadArcGISJSAPIModules, MapViewManager } from 'jimu-arcgis'

export enum LoadStatus {
  Pending = 'Pending',
  Fulfilled = 'Fulfilled',
  Rejected = 'Rejected'
}

interface VisibleElements {
  title: boolean
  content: {
    fields: boolean
    text: boolean
    media: boolean
    attachments: boolean
  }
  lastEditedInfo: boolean
}

interface Props {
  dataSource: DataSource
  graphic: __esri.Graphic
  visibleElements: VisibleElements
  timezone: Timezone
}

interface State {
  loadStatus: LoadStatus
}

export default class FeatureInfo extends React.PureComponent<Props, State> {
  private Feature: typeof __esri.Feature
  private feature: __esri.Feature

  private readonly featureContainerRef = React.createRef<HTMLInputElement>()

  constructor (props) {
    super(props)
    this.state = {
      loadStatus: LoadStatus.Pending
    }
  }

  componentDidMount () {
    this.createFeature()
  }

  componentDidUpdate () {
    if (this.feature) {
      const graphic = { popupTemplate: { content: '' } }
      // @ts-expect-error
      let popupTemplate = this.props.graphic?.popupTemplate || this.props.graphic?.layer?.popupTemplate
      if (!popupTemplate) {
        // @ts-expect-error
        popupTemplate = this.props.graphic?.layer?.defaultPopupTemplate?.clone() || { content: '' }
        // @ts-expect-error
        this.props.graphic?.layer?.popupTemplate = popupTemplate
      }

      const isOutputDSFromChart = this.isOutputDSFromChart()
      popupTemplate?.fieldInfos?.forEach(fieldInfo => {
        // temporarily hide three data/time fields
        // @ts-expect-error
        const fieldType = this.props.graphic?.layer?.fields?.find(field => field.name === fieldInfo.fieldName)?.toJSON()?.type
        if (fieldType && fieldType === 'esriFieldTypeTimestampOffset') {
          fieldInfo.visible = false
        } else if (isOutputDSFromChart) {
          // display all fields by default if the data source is output from chart widget.
          fieldInfo.visible = true
        }
      })
      this.feature.graphic = this.props.graphic || graphic
      this.feature.visibleElements = this.props.visibleElements
      this.feature.timeZone = this.getTimezone()
    }
  }

  getTimezone () {
    // @ts-expect-error
    return dataSourceUtils.getTimezoneAPIFromRuntime(this.props.dataSource?.getTimezone())
  }

  isOutputDSFromChart () {
    const dataSourceJson = this.props.dataSource?.getDataSourceJson()
    return dataSourceJson.isOutputFromWidget && dataSourceJson.schema
  }

  destroyFeature () {
    this.feature && !this.feature.destroyed && this.feature.destroy()
  }

  getViewByDataSourceId (dataSourceId: string) {
    const mapViewManger = MapViewManager.getInstance()
    const jimuMapView = mapViewManger.getAllJimuMapViews().find(jimuMapView => jimuMapView.dataSourceId === dataSourceId)
    return jimuMapView?.view || null
  }

  createFeature () {
    let featureModulePromise
    if (this.Feature) {
      featureModulePromise = Promise.resolve()
    } else {
      featureModulePromise = loadArcGISJSAPIModules([
        'esri/widgets/Feature'
      ]).then(modules => {
        [
          this.Feature
        ] = modules
      })
    }
    return featureModulePromise.then(() => {
      const container = document && document.createElement('div')
      container.className = 'jimu-widget'
      this.featureContainerRef.current.appendChild(container)

      const rootDataSource = this.props.dataSource.getRootDataSource()
      const view = this.getViewByDataSourceId(rootDataSource?.id)
      this.destroyFeature()
      this.feature = new this.Feature({
        container: container,
        defaultPopupTemplateEnabled: true,
        // @ts-expect-error
        spatialReference: view?.spatialReference || this.props.graphic?.layer?.spatialReference || null,
        // @ts-expect-error
        map: rootDataSource?.map || null,
        // @ts-expect-error
        timeZone: this.props.timeZone,
        view
      })
    }).then(() => {
      this.setState({ loadStatus: LoadStatus.Fulfilled })
    })
  }

  render () {
    return (
      <div className='feature-info-component'>
        <div ref={this.featureContainerRef} />
      </div>
    )
  }
}
