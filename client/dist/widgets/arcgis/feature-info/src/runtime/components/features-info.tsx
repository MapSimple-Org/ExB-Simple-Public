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
  defaultPopupTemplate: any
  visibleElements: VisibleElements
  timezone: Timezone
  useMapWidget: boolean
}

interface State {
  loadStatus: LoadStatus
}

export default class FeatureInfos extends React.PureComponent<Props, State> {
  private Features: typeof __esri.Features
  private features: __esri.Features
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

  componentDidUpdate (prevProps: Props) {
    if (this.features) {
      this.updateDataSource(prevProps)

      const graphic = { popupTemplate: { content: '' } }
      const graphics = this.props.graphic ? [this.props.graphic] : [graphic]
      this.updateGraphic(prevProps, graphics)

      this.features.timeZone = this.getTimezone()

      this.updateVisibleElementsContent(graphics)
    }
  }

  updateGraphic (prevProps: Props, graphics) {
    // @ts-expect-error
    let popupTemplate = this.props.graphic?.popupTemplate || this.props.graphic?.layer?.popupTemplate
    if (!popupTemplate) {
      popupTemplate = this.props.defaultPopupTemplate
      this.props.graphic && (this.props.graphic.popupTemplate = popupTemplate)
      //this.props.graphic?.layer?.popupTemplate = this.props.defaultPopupTemplate
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

    // @ts-expect-error
    if (this.props.graphic?.uid === undefined || this.props.graphic?.uid !== prevProps.graphic?.uid) {
      // there is a timing problem between sets 'map/view' and 'graphics', setting 'graphics' immediately after setting 'map/view' sometimes causes a blank
      // use 'set timeout' to make sure setting 'graphics' to wait setting map/view
      setTimeout(() => { this.features.features = graphics }, 1)
    }
  }

  updateDataSource (prevProps: Props) {
    const rootDataSource = this.props.dataSource.getRootDataSource()
    const view = this.getViewByDataSourceId(rootDataSource?.id)
    // @ts-expect-error
    this.features.spatialReference = view?.spatialReference || this.props.graphic?.layer?.spatialReference || null
    // @ts-expect-error
    this.features.map = rootDataSource?.map || null
    if (this.props.useMapWidget) {
      // for Arcade expressions, view can be alternatively set the 'map' property.
      this.features.view = view || null
    }
  }

  updateVisibleElementsContent (graphics) {
    const visibleElements: any = {
      actionBar: false,
      closeButton: false,
      heading: this.props.visibleElements.title
    }
    this.features.visibleElements = visibleElements

    const prevContent = this.features.viewModel.featureViewModelAbilities
    const visibleElementsContent = this.props.visibleElements.content
    const needToUpdate = prevContent?.attachmentsContent !== visibleElementsContent.attachments ||
                         prevContent?.customContent !== visibleElementsContent.text ||
                         prevContent?.fieldsContent !== visibleElementsContent.fields ||
                         prevContent?.mediaContent !== visibleElementsContent.media ||
                         prevContent?.textContent !== visibleElementsContent.text
    if (needToUpdate) {
      const featureViewModelAbilities = {
        attachmentsContent: visibleElementsContent.attachments,
        customContent: visibleElementsContent.text,
        fieldsContent: visibleElementsContent.fields,
        mediaContent: visibleElementsContent.media,
        textContent: visibleElementsContent.text
      }
      this.features.viewModel.featureViewModelAbilities = featureViewModelAbilities
      // assigning 'features' again just for triggering re-render
      this.features.features = graphics
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
    this.features && !this.features.destroyed && this.features.destroy()
  }

  getViewByDataSourceId (dataSourceId: string) {
    const mapViewManger = MapViewManager.getInstance()
    const jimuMapView = mapViewManger.getAllJimuMapViews().find(jimuMapView => jimuMapView.dataSourceId === dataSourceId)
    return jimuMapView?.view || null
  }

  createFeature () {
    let featureModulePromise
    if (this.Features) {
      featureModulePromise = Promise.resolve()
    } else {
      featureModulePromise = loadArcGISJSAPIModules([
        'esri/widgets/Features'
      ]).then(modules => {
        [
          this.Features
        ] = modules
      })
    }
    return featureModulePromise.then(() => {
      this.destroyFeature()
      this.features = new this.Features({
        container: this.featureContainerRef.current,
        visible: true,
        features: [this.props.graphic],
        // @ts-expect-error
        defaultPopupTemplateEnabled: true,
        // @ts-expect-error
        timeZone: this.props.timeZone,
        visibleElements: {
          actionBar: false,
          closeButton: false
        }
      })
    }).then(() => {
      this.setState({ loadStatus: LoadStatus.Fulfilled })
    })
  }

  render () {
    return (
      <div className='feature-info-component'>
        <div id='features-container' role='document' tabIndex={0} ref={this.featureContainerRef} />
      </div>
    )
  }
}
