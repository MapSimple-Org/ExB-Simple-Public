/* eslint-disable no-prototype-builtins */
/** @jsx jsx */
import { React, type IntlShape, jsx, getAppStore, type IMThemeVariables, lodash, DataSourceManager, type FeatureLayerDataSource } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { convertElevationsInfoArray, convertDistancesArray, convertSingle, niceScale } from '../../common/unit-conversion'
import * as intl from 'esri/intl'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import * as lang from 'esri/core/lang'
import * as proximityOperator from 'esri/geometry/operators/proximityOperator'
import * as intersectsOperator from 'esri/geometry/operators/intersectsOperator'
import * as geodeticLengthOperator from 'esri/geometry/operators/geodeticLengthOperator'
import * as lengthOperator from 'esri/geometry/operators/lengthOperator'
import Polyline from 'esri/geometry/Polyline'
import Point from 'esri/geometry/Point'
import SpatialReference from 'esri/geometry/SpatialReference'
import unitUtils from 'esri/core/unitUtils'
import type Graphic from 'esri/Graphic'
import type { ProfileLayersSettings, LayerIntersectionInfo, GeneralSetting, ElevationLayersInfo, ProfileStyle } from '../../config'
import { getHighLightGraphic } from '../../common/highlight-symbol-utils'
import { THEME_LIGHT, THEME_DARK } from './chart-utils'
import {
  createRoot,
  XYCursorAm5, XYChartAm5, ValueAxisAm5, AxisRendererXAm5, AxisRendererYAm5, LineSeriesAm5,
  colorAm5, ResponsiveThemeAm5, DarkThemeAm5, TooltipAm5, NumberFormatterAm5, LabelAm5, LegendAm5, BulletAm5,
  p0, p50, p100, RectangleAm5, CircleAm5, TriangleAm5, ContainerAm5, AnimatedThemeAm5,
  Exporting,
  ColumnSeries
} from 'jimu-ui/advanced/chart-engine'
import { colorUtils } from 'jimu-theme'

interface ChartParams {
  showGrid: boolean
  showTitleAxis: boolean
  container: HTMLElement
  isDarkTheme: boolean
  onCursorPositionChange?: (x: number, y: number) => void
  definition: any
  showLegend: boolean
  exbTheme?: any
  zoomOutText?: string
}

interface UpdateMinMaxParams {
  pointIndex: number
  layerId: string
  seriesID: string
  newValue: number
  newValue2?: number
  displayField?: string
  assetShapeStyle?: string
  featureIndex?: number
}

interface NewSeriesTooltipInfo {
  seriesId: string
  value: number
  y2?: number
  displayField?: string
  assetStyle: string
  featureIndex?: number
  layerId: string
}

interface MinMaxOfEachProfile {
  [layerId: string]: MinMax
}

interface MinMax {
  min: number
  max: number
}

interface Props {
  intl: IntlShape
  isExportEnable: boolean
  parentWidgetId: string
  isSelectModeActive: boolean
  commonGeneralSettings: GeneralSetting
  activeDs: string
  currentConfig: any
  theme: IMThemeVariables
  selectedLinearUnit: string
  selectedElevationUnit: string
  profileResult: any
  unitOptions: any
  isFlip: boolean
  isUniformChartScalingEnable: boolean
  drawingLayer: GraphicsLayer
  intersectionHighlightLayer: GraphicsLayer
  mapView: JimuMapView
  showVolumetricObj: boolean
  volumetricObjLineStyle: ProfileStyle
  volumetricObjLabel: string
  highlightChartPositionOnMap: (props: any) => void
  hideChartPosition: () => void
  chartInfo: (chart: any) => void
  toggleLegendSeriesState: (hideSeries: boolean, seriesName: string) => void
  assetIntersectionResult: LayerIntersectionInfo[]
  setExportButton: (isExport: boolean) => void
  isCustomIntervalEnabled: boolean
  customDistanceInterval: number
  chartDataUpdateTime: number
  addedElelvationProfileLayers: ElevationLayersInfo[]
  profileSettingsForNewAddedLayer: ProfileLayersSettings[]
}

interface IState {
  chartDefinition: any
  showLegend: boolean
}

const unitForZ = 'meters' // since we are taking value meters per SR
const defaultIntersectingAssetSize: number = 6

export default class Chart extends React.PureComponent<Props, IState> {
  private readonly _chartContainer = React.createRef<HTMLDivElement>()
  private _allDistances: number[]
  private readonly _isRTL: boolean
  private _chart
  private _xAxis: any
  private _xAxisLabel: any
  private _yAxis: any
  private _yAxisLabel: any
  private _chartSeries: any
  private _chartLegend: any
  private _viewOutput: any
  private _volumetricObjLineSeries: any
  private _accessChartParams: any
  private _updatedProfileLayers: ProfileLayersSettings[]
  private _minMaxOfEachProfile: MinMaxOfEachProfile
  private _seriesKey: string[]
  private _seriesValue: number[]
  private _intersectionSeriesKey
  private _intersectionSeriesKeyIndex
  private _groundExportingInfo
  private _intersectingLayersExportingInfo
  private _seriesToBeHiddenInLegend: any[]
  private _elevationLayersOutput: any[]

  constructor (props) {
    super(props)
    this._minMaxOfEachProfile = {}
    this._allDistances = []
    this._seriesKey = []
    this._seriesValue = []
    this._intersectionSeriesKey = {}
    this._intersectionSeriesKeyIndex = []
    this._groundExportingInfo = {}
    this._intersectingLayersExportingInfo = {}
    this._seriesToBeHiddenInLegend = [] //TODO: need to think on different place to empty this
    this._elevationLayersOutput = []

    const appState = getAppStore().getState()
    this._isRTL = appState?.appContext?.isRTL
    this._chart = null
    this._xAxis = null
    this._xAxisLabel = null
    this._yAxisLabel = null
    this._yAxis = null
    this._chartSeries = null
    this._viewOutput = null
    this._volumetricObjLineSeries = null
    this._accessChartParams = null
    this._updatedProfileLayers = this.props.currentConfig?.profileSettings.layers.concat(this.props.profileSettingsForNewAddedLayer)
    this.state = {
      chartDefinition: null,
      showLegend: this.props.commonGeneralSettings?.showLegend
    }
    //if valid profileResult result then create the chart definition
    if (this.props.profileResult) {
      this.createOrUpdateChartDefinition()
    }
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl && this.props.intl.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentWillUnmount = () => {
    if (this._chart) {
      this._chart.root.dispose()
      this._chart = null
    }
  }

  //update chart once any of the properties such as
  //linear unit, elevation unit or profile result has been change
  //This indicates that component needs to updated with latest props values
  componentDidUpdate = (prevProps) => {
    if ((prevProps.commonGeneralSettings?.showGridAxis !== this.props.commonGeneralSettings?.showGridAxis &&
      this._chart?.xAxes.values.length > 0 && this._chart.yAxes.values.length > 0)
    ) {
      if (this._chart) {
        const xAxisRenderer = this._xAxis.get('renderer') as AxisRendererXAm5
        xAxisRenderer.grid.template.set('visible', this.props.commonGeneralSettings?.showGridAxis)

        const yAxisRenderer = this._yAxis.get('renderer') as AxisRendererXAm5
        yAxisRenderer.grid.template.set('visible', this.props.commonGeneralSettings?.showGridAxis)
      }
      return
    }

    if (prevProps.commonGeneralSettings?.showLegend !== this.props.commonGeneralSettings?.showLegend ||
      prevProps.commonGeneralSettings?.showAxisTitles !== this.props.commonGeneralSettings?.showAxisTitles) {
      this._xAxisLabel.set('visible', this.props.commonGeneralSettings?.showAxisTitles)
      this._yAxisLabel.set('visible', this.props.commonGeneralSettings?.showAxisTitles)

      if (this._isRTL) {
        this._chart.setAll({
          paddingTop: 0,
          paddingRight: 5,
          paddingBottom: (this.props.commonGeneralSettings?.showAxisTitles && this.props.commonGeneralSettings?.showLegend)
            ? 2
            : (this.props.commonGeneralSettings?.showAxisTitles && !this.props.commonGeneralSettings?.showLegend)
                ? 0
                : (!this.props.commonGeneralSettings?.showAxisTitles && this.props.commonGeneralSettings?.showLegend)
                    ? 2
                    : (!this.props.commonGeneralSettings?.showAxisTitles && !this.props.commonGeneralSettings?.showLegend)
                        ? 5
                        : 0,
          paddingLeft: 5
        })
      } else {
        this._chart.setAll({
          paddingTop: 0,
          paddingRight: 0,
          paddingBottom: (this.props.commonGeneralSettings?.showAxisTitles && this.props.commonGeneralSettings?.showLegend)
            ? 2
            : (this.props.commonGeneralSettings?.showAxisTitles && !this.props.commonGeneralSettings?.showLegend)
                ? 0
                : (!this.props.commonGeneralSettings?.showAxisTitles && this.props.commonGeneralSettings?.showLegend)
                    ? 2
                    : (!this.props.commonGeneralSettings?.showAxisTitles && !this.props.commonGeneralSettings?.showLegend)
                        ? 5
                        : 0,
          paddingLeft: 5
        })
      }
      this.setState({
        showLegend: this.props.commonGeneralSettings?.showLegend
      }, () => {
        if (this.state.showLegend) {
          if (this._chartLegend) {
            this._chartLegend.set('visible', this.state.showLegend)
          } else {
            this.displayChartLegend(this._accessChartParams)
          }
        } else {
          if (this._chartLegend) {
            this._chartLegend.set('visible', this.state.showLegend)
          }
        }
      })
      return
    }

    //on change of view line color update the graph color and rerender it
    if (prevProps.volumetricObjLineStyle.lineColor !== this.props.volumetricObjLineStyle.lineColor) {
      if (this._chart) {
        this._volumetricObjLineSeries.strokes.template.set('stroke', colorAm5(this.props.volumetricObjLineStyle.lineColor))
        this._volumetricObjLineSeries.fills.template.set('fill', colorAm5(this.props.volumetricObjLineStyle.lineColor))
      }
      return
    }

    //on change of view object label update the graph legend name
    if (prevProps.volumetricObjLabel !== this.props.volumetricObjLabel) {
      if (this._chart) {
        this._volumetricObjLineSeries.setAll({
          name: this.props.volumetricObjLabel ? this.props.volumetricObjLabel : this.nls('volumetricObj')
        })
      }
      return
    }

    //on change of elevation profile multiple surfaces color and label update the graph and rerender it
    if (this.didElevationLayersInfoChanged(prevProps?.addedElelvationProfileLayers, this.props?.addedElelvationProfileLayers)) {
      if (this._chart) {
        this._chart.root.dispose()
        this._chart = null
        this.createOrUpdateChartDefinition()
      }
      return
    }

    if (this._chart && prevProps?.profileSettingsForNewAddedLayer !== this.props?.profileSettingsForNewAddedLayer) {
      this._chart.root.dispose()
      this._chart = null
      this._updatedProfileLayers = this.props.currentConfig?.profileSettings.layers.concat(this.props.profileSettingsForNewAddedLayer)
      this.createOrUpdateChartDefinition()
      return
    }

    const profileSettingsChanged = this.didProfileLayersSettingsChanged(prevProps.currentConfig?.profileSettings.layers, this.props.currentConfig?.profileSettings.layers)
    const intersectingSettingsChanged = this.didIntersectingLayersSettingsChanged(prevProps.currentConfig?.assetSettings?.layers, this.props.currentConfig?.assetSettings?.layers)
    if (profileSettingsChanged || intersectingSettingsChanged || prevProps.assetIntersectionResult !== this.props.assetIntersectionResult ||
      prevProps.selectedLinearUnit !== this.props.selectedLinearUnit ||
      prevProps.selectedElevationUnit !== this.props.selectedElevationUnit ||
      prevProps.chartDataUpdateTime !== this.props.chartDataUpdateTime ||
      prevProps.theme !== this.props.theme ||
      prevProps.isFlip !== this.props.isFlip ||
      prevProps.isUniformChartScalingEnable !== this.props.isUniformChartScalingEnable ||
      prevProps.currentConfig?.advanceOptions !== this.props.currentConfig?.advanceOptions ||
      prevProps.currentConfig?.profileSettings?.isProfileSettingsEnabled !== this.props.currentConfig?.profileSettings?.isProfileSettingsEnabled ||
      prevProps.currentConfig?.profileSettings?.isCustomizeOptionEnabled !== this.props.currentConfig?.profileSettings?.isCustomizeOptionEnabled ||
      prevProps.currentConfig?.assetSettings?.isAssetSettingsEnabled !== this.props.currentConfig?.assetSettings?.isAssetSettingsEnabled ||
      ((prevProps.showVolumetricObj !== this.props.showVolumetricObj) && !this.props.showVolumetricObj)) {
      if ((((prevProps.showVolumetricObj !== this.props.showVolumetricObj) && !this.props.showVolumetricObj) ||
        prevProps.chartDataUpdateTime !== this.props.chartDataUpdateTime ||
        prevProps.selectedLinearUnit !== this.props.selectedLinearUnit ||
        prevProps.selectedElevationUnit !== this.props.selectedElevationUnit ||
        prevProps.isFlip !== this.props.isFlip) && this._chart) {
        this._chart.root.dispose()
        this._chart = null
      }
      //If theme is changed to/from dark theme,
      //we need to reCreate chart since when switching from dark to normal theme(or reverse) the already drawn chart is not removing dark theme labels
      if ((profileSettingsChanged || intersectingSettingsChanged || prevProps.assetIntersectionResult !== this.props.assetIntersectionResult ||
        prevProps.theme.sys.color.mode !== this.props.theme.sys.color.mode ||
        prevProps.theme.sys.color.primary.main !== this.props.theme.sys.color.primary.main ||
        prevProps.theme.ref.typeface.htmlFontSize !== this.props.theme.ref.typeface.htmlFontSize ||
        prevProps.currentConfig?.advanceOptions !== this.props.currentConfig?.advanceOptions ||
        prevProps.currentConfig?.profileSettings?.isProfileSettingsEnabled !== this.props.currentConfig?.profileSettings?.isProfileSettingsEnabled ||
        prevProps.currentConfig?.profileSettings?.isCustomizeOptionEnabled !== this.props.currentConfig?.profileSettings?.isCustomizeOptionEnabled ||
        prevProps.currentConfig?.assetSettings?.isAssetSettingsEnabled !== this.props.currentConfig?.assetSettings?.isAssetSettingsEnabled
      ) && this._chart) {
        this._chart.root.dispose()
        this._chart = null
      }
      //check in live view for intersecting layers
      if (intersectingSettingsChanged) {
        this.props.assetIntersectionResult.forEach((intersectionResult) => {
          this.props.currentConfig?.assetSettings?.layers.forEach((eachConfigLayer) => {
            if (eachConfigLayer.layerId === intersectionResult?.settings?.layerId) {
              intersectionResult.settings = eachConfigLayer
            }
          })
        })
        if (this._chart) {
          this._chart.root.dispose()
          this._chart = null
        }
      }

      this._updatedProfileLayers = this.props.currentConfig?.profileSettings.layers.concat(this.props.profileSettingsForNewAddedLayer)
      this.createOrUpdateChartDefinition()
    }

    if (prevProps.isExportEnable !== this.props.isExportEnable) {
      if (this.props.isExportEnable) {
        this.props.setExportButton(false)
        this.performExportOperation()
      }
    }
  }

  didElevationLayersInfoChanged = (prevSettings, newSettings) => {
    let elevationLayersList = false
    if (newSettings?.length !== prevSettings?.length) {
      return true
    }
    // eslint-disable-next-line array-callback-return
    newSettings?.some((newStatsSettings, index) => {
      if (newStatsSettings.label !== prevSettings[index]?.label ||
        !lodash.isDeepEqual(newStatsSettings.style, prevSettings[index]?.style)) {
        elevationLayersList = true
        return true
      }
    })
    return elevationLayersList
  }

  getGroundSeriesLabel = (label: string): string => {
    let referenceLayerLabel = label
    referenceLayerLabel = this.props.intl.formatMessage({
      id: 'referenceLayerLabel',
      defaultMessage: defaultMessages.referenceLayerLabel
    }, { elevationLayerLabel: label })
    return referenceLayerLabel
  }

  resetExportingInfo = () => {
    this._groundExportingInfo = {
      xCoordinate: 'X',
      yCoordinate: 'Y',
      x: this.nls('distanceLabel') + ' (' + this.props.selectedLinearUnit + ')'
    }
    this._intersectingLayersExportingInfo = {}
  }

  exportDataForIntersectingLayers = () => {
    const seriesData = {}
    const exportDataForIntersectingLayers = Exporting.new(this._accessChartParams.chart.root, {
      dataSource: this._accessChartParams.chartData
    })
    const d = new Date()
    //Export Ground Series and Selectable layers info
    exportDataForIntersectingLayers.setAll({
      filePrefix: this.nls('_widgetLabel') + '-' + d.toDateString() + ' ' + d.toLocaleTimeString(),
      dataFields: this._groundExportingInfo
    })

    //create data for each intersecting layers
    Object.entries(this._intersectionSeriesKey).forEach(([indexKey, seriesValues]) => {
      //get chart info to fetch x, y, distance at the intersection points
      const chartInfo = this._accessChartParams.chartData[indexKey]
      Object.entries(seriesValues).forEach(([layerId, seriesInfo]) => {
        if (this._intersectingLayersExportingInfo?.[layerId]) {
          seriesInfo.forEach((sInfo) => {
            //create data for each intersection
            const eachEntry = {
              xCoordinate: chartInfo.xCoordinate,
              yCoordinate: chartInfo.yCoordinate,
              x: chartInfo.x,
              intersectingLayerY: sInfo.value,
              intersectingLayerY2: undefined,
              intersectingLayerDisplayField: sInfo.displayField,
              layerName: this._intersectingLayersExportingInfo[layerId].layerName
            }
            //if two field point series then export both the elevation values in csv
            if (sInfo.hasOwnProperty('y2')) {
              eachEntry.intersectingLayerY2 = sInfo.y2
            }
            //create entry for the layer in series data
            if (!seriesData[layerId]) {
              seriesData[layerId] = []
            }
            //add data for each intersection
            seriesData[layerId].push(eachEntry)
          })
        }
      })
    })
    //loop through all the intersection layers data and generate csv for each individual series
    Object.keys(seriesData).forEach((layerId) => {
      const dataArray = seriesData[layerId]
      //Reverse the dataArray to show the csv data in ascending order of the distance
      if (this.props.isFlip) {
        dataArray.reverse()
      }
      exportDataForIntersectingLayers.events.on('dataprocessed', (evt) => {
        evt.data = dataArray
      })
      //get the exporting info for the intersection series
      const exportingInfo = lang.clone(this._intersectingLayersExportingInfo[layerId])
      //set the file name to be exported
      //this.chart.exporting.filePrefix = this.nls('_widgetLabel') + '-' + exportingInfo.layerName + '-' + Date().toLocaleString()
      //change the header name to ''Layer name' - we are storing actual series name to add in data
      //but in header we want 'layer name'
      exportingInfo.layerName = this.nls('layerName')
      //set the exporting info and export the csv
      exportDataForIntersectingLayers.set('dataFields', exportingInfo)
      exportDataForIntersectingLayers.download('csv')
      //remove the setting value of dataprocessed event
      exportDataForIntersectingLayers.events.removeType('dataprocessed')
    })
  }

  performExportOperation = () => {
    try {
      const exportDataForSelectedLayer = Exporting.new(this._accessChartParams.chart.root, {
        dataSource: this._accessChartParams.chartData
      })
      const d = new Date()
      //Export Ground Series and Selectable layers info
      exportDataForSelectedLayer.setAll({
        filePrefix: this.nls('_widgetLabel') + '-' + d.toDateString() + ' ' + d.toLocaleTimeString(),
        dataFields: this._groundExportingInfo
      })

      exportDataForSelectedLayer.events.on('dataprocessed', (evt) => {
        let dataArray = []
        const chartData = evt.data
        if (chartData) {
          //check for custom interval and filter data to be exported
          //else export all data
          if (this.props.isCustomIntervalEnabled && !isNaN(this.props.customDistanceInterval)) {
            let definedInterval = 0
            chartData.forEach((info) => {
              if (info.x >= definedInterval) {
                dataArray.push(info)
                definedInterval += this.props.customDistanceInterval
              }
            })
          } else {
            dataArray = [...chartData]
          }
          //remove duplicate entries for the same distance
          dataArray = dataArray.filter((dataElement, index) => {
            return index === 0 || dataElement.x !== dataArray[index - 1].x
          })
          //Reverse the dataArray to show the csv data in ascending order of the distance
          if (this.props.isFlip) {
            dataArray.reverse()
          }
          evt.data = dataArray
        }
        return dataArray
      })
      exportDataForSelectedLayer.download('csv')
      //remove the adaptor
      exportDataForSelectedLayer.events.removeType('dataprocessed')
      //Export data for intersecting layers
      this.exportDataForIntersectingLayers()
    } catch (e) {
      console.log(e)
    }
  }

  didProfileLayersSettingsChanged = (prevSettings, newSettings) => {
    let isLayersSettingsChanged = false
    if (newSettings?.length !== prevSettings?.length) {
      return true
    }
    // eslint-disable-next-line array-callback-return
    newSettings?.some((newLayersSettings, index) => {
      if (newLayersSettings.style.lineType !== prevSettings[index].style.lineType ||
        newLayersSettings.style.lineColor !== prevSettings[index].style.lineColor ||
        newLayersSettings.style.lineThickness !== prevSettings[index].style.lineThickness ||
        newLayersSettings.elevationSettings.type !== prevSettings[index].elevationSettings.type ||
        newLayersSettings.elevationSettings.unit !== prevSettings[index].elevationSettings.unit ||
        newLayersSettings.elevationSettings.field1 !== prevSettings[index].elevationSettings.field1 ||
        newLayersSettings.elevationSettings.field2 !== prevSettings[index].elevationSettings.field2 ||
        newLayersSettings.distanceSettings.type !== prevSettings[index].distanceSettings.type ||
        newLayersSettings.distanceSettings.field !== prevSettings[index].distanceSettings.field ||
        newLayersSettings.distanceSettings.unit !== prevSettings[index].distanceSettings.unit) {
        isLayersSettingsChanged = true
        return true
      }
    })
    return isLayersSettingsChanged
  }

  didIntersectingLayersSettingsChanged = (prevSettings, newSettings) => {
    let isLayersSettingsChanged = false
    if (newSettings?.length === prevSettings?.length) {
      newSettings?.some((newLayersSettings, index) => {
        if (newLayersSettings?.style?.type !== prevSettings[index]?.style?.type ||
          newLayersSettings?.displayField !== prevSettings[index]?.displayField ||
          newLayersSettings?.style?.intersectingAssetShape !== prevSettings[index]?.style?.intersectingAssetShape ||
          newLayersSettings?.style?.intersectingAssetSize !== prevSettings[index]?.style?.intersectingAssetSize ||
          newLayersSettings?.style?.intersectingAssetColor !== prevSettings[index]?.style?.intersectingAssetColor ||
          newLayersSettings?.elevationSettings?.type !== prevSettings[index]?.elevationSettings?.type ||
          newLayersSettings?.elevationSettings?.unit !== prevSettings[index]?.elevationSettings?.unit ||
          newLayersSettings?.elevationSettings?.field1 !== prevSettings[index]?.elevationSettings?.field1 ||
          newLayersSettings?.elevationSettings?.field2 !== prevSettings[index]?.elevationSettings?.field2) {
          isLayersSettingsChanged = true
          return true
        }
        return false
      })
    }
    return isLayersSettingsChanged
  }

  createOrUpdateChartDefinition = () => {
    const { profileResult, selectedElevationUnit } = this.props
    if (profileResult?.lines?.length > 0 &&
      this.props.selectedLinearUnit && selectedElevationUnit && this.props.theme) {
      const profileOutput = profileResult.lines[0].samples
      this._viewOutput = null
      this._elevationLayersOutput = []
      let profileResultLinesLength
      if (this.props.mapView.view.type === '3d') {
        //depending on the volumetric objects options and draw or select mode option, calculate the profile lines results length
        //get the volumetric objects result depending on the profile lines results length
        profileResultLinesLength = this.props.showVolumetricObj && this.props.isSelectModeActive
          ? profileResult.lines.length - 2 //if profile type input and view both are present
          : profileResult.lines.length - 1 //if input or view, one of these profile type is present
      }
      if (profileResult.lines.length > 0) {
        if (this.props.showVolumetricObj && this.props.mapView.view.type === '3d') {
          this._viewOutput = profileResult.lines[profileResultLinesLength].samples
        }
        //push added elevation layers info with its style and samples info
        this.props.addedElelvationProfileLayers?.forEach((layersInfo) => {
          profileResult.lines.forEach((linesInfo, index) => {
            if ((profileResultLinesLength === undefined || index <= profileResultLinesLength)) {
              if (linesInfo.id === layersInfo.id) {
                const style = {
                  style: layersInfo.style,
                  label: layersInfo.label
                }
                this._elevationLayersOutput.push({
                  id: linesInfo.id,
                  layerId: 'esriCTProfileLayer' + this._elevationLayersOutput.length,
                  samples: linesInfo.samples,
                  profileStyles: style
                })
              }
            }
          })
        })
      }
      if (profileOutput.length > 0) {
        const allElevations = []
        this._allDistances = []
        if (profileOutput.length > 0) {
          profileOutput.forEach((chartData, pointIndex) => {
            let referenceY = chartData.elevation
            if (referenceY !== null) {
              referenceY = convertSingle(chartData.elevation, profileResult.effectiveUnits.elevation, selectedElevationUnit)
            }
            const elevationInfo: any = {
              xCoordinate: chartData.x,
              yCoordinate: chartData.y,
              x: convertSingle(chartData.distance, profileResult.effectiveUnits.distance, this.props.selectedLinearUnit),
              y: referenceY,
              esriCTViewY: null,
              pathIdx: 0,
              pointIdx: pointIndex
            }
            this._elevationLayersOutput?.forEach((profileOutput) => {
              //as first elevation layer is always ground layer in profile lines result, check with the first profile line id
              if (profileOutput.id !== profileResult.lines[0].id) {
                if (profileOutput.samples[pointIndex].elevation === null) {
                  elevationInfo[profileOutput.layerId] = null
                } else {
                  elevationInfo[profileOutput.layerId] = convertSingle(profileOutput.samples[pointIndex].elevation, profileResult.effectiveUnits.elevation, selectedElevationUnit)
                }
              }
            })

            if (this._viewOutput) {
              elevationInfo.esriCTViewY = convertSingle(this._viewOutput[pointIndex].elevation, profileResult.effectiveUnits.elevation, selectedElevationUnit)
            }
            allElevations.push(elevationInfo)
            this._allDistances.push(chartData.distance)
          })

          //Reset the min,max for each profiles and series Key Value arrays, it will be again filled while creating data for profile lines
          this._minMaxOfEachProfile = {}
          this._seriesKey = []
          this._seriesValue = []
          //Creates data for each profile lines as the elevation and distance setting for each profile line
          this.createDataForProfileLines(allElevations).then(() => {
            this.createDataForIntersectingAssets(allElevations).then(() => {
              //Create data for flipped chart
              let flippedData = []
              if (this.props.isFlip) {
                const totalDistance = allElevations[allElevations.length - 1].x
                flippedData = [...allElevations]
                flippedData.forEach((chartData) => {
                  chartData.x = totalDistance - chartData.x
                })
              }
              //get labels according to selected units
              const selectedUnits = this.getSelectedUnits()

              //Create x & y axis label for ground series
              const xAxisLabel = this.props.intl.formatMessage({
                id: 'graphDistanceLabel',
                defaultMessage: defaultMessages.graphDistanceLabel
              }, { unit: selectedUnits[0] })
              const yAxisLabel = this.props.intl.formatMessage({
                id: 'graphElevationLabel',
                defaultMessage: defaultMessages.graphElevationLabel
              }, { unit: selectedUnits[1] })
              const newChartDefinition = {
                data: this.props.isFlip ? flippedData : allElevations,
                series: [{
                  x: {
                    field: 'x',
                    label: xAxisLabel
                  },
                  y: {
                    field: 'y',
                    label: yAxisLabel
                  },
                  // eslint-disable-next-line @typescript-eslint/prefer-find
                  color: this.props.addedElelvationProfileLayers.filter((layer) => layer.id === profileResult?.lines?.[0]?.id)[0]?.style?.lineColor
                }]
              }

              this.setState({
                chartDefinition: newChartDefinition
              }, () => {
                if (this._chart) {
                  this._xAxisLabel.set('text', xAxisLabel)
                  this._yAxisLabel.set('text', yAxisLabel)
                  this._accessChartParams.chart.zoomOutButton.get('background').set('fill', this.getColor(this.props.theme.sys.color.primary.main))
                  this._xAxis.set('numberFormatter', this.makeFormatter(this._accessChartParams, selectedUnits[2]))
                  this._yAxis.set('numberFormatter', this.makeFormatter(this._accessChartParams, selectedUnits[3]))
                  //adjust axis range on data change
                  this.adjustAxisRanges(this._accessChartParams)
                  return
                }
                this.createChart({
                  definition: newChartDefinition,
                  container: this._chartContainer.current,
                  isDarkTheme: this.props.theme.sys.color.mode === 'dark',
                  showGrid: this.props.commonGeneralSettings?.showGridAxis,
                  showTitleAxis: this.props.commonGeneralSettings?.showAxisTitles,
                  showLegend: this.state.showLegend,
                  exbTheme: this.props.theme,
                  zoomOutText: this.nls('zoomOut'),
                  unitsAbbreviations: this.getSelectedUnits()
                } as ChartParams)
              })
            })
          })
        } else {
          //clears the chartDefinition and show error
          this.setState({
            chartDefinition: null
          }, () => {
            if (this._chart) {
              this._chart.root.dispose()
              this._chart = null
            }
          })
        }
      }
    } else {
      //clears the chart
      this.setState({
        chartDefinition: null
      })
      if (this._chart) {
        this._chart.root.dispose()
        this._chart = null
      }
    }
  }

  checkForProfileSettings = () => {
    const uniqueSelectedProfileLines = []
    if (this.props.drawingLayer?.graphics?.length > 0 &&
      this.props.drawingLayer.graphics.getItemAt(0)?.attributes?.esriCTFeatureLayerId) {
      this.props.drawingLayer.graphics.forEach((a) => {
        const layerId = a.getAttribute('esriCTFeatureLayerId')
        if (!uniqueSelectedProfileLines.includes(layerId)) {
          uniqueSelectedProfileLines.push(layerId)
        }
      })
    }
    return uniqueSelectedProfileLines
  }

  getSelectedUnits = (): string[] => {
    const selectedLinearUnit = this.props.unitOptions.find(unit => unit.value === this.props.selectedLinearUnit)
    const selectedElevationUnit = this.props.unitOptions.find(unit => unit.value === this.props.selectedElevationUnit)
    const linearUnit = this.nls(selectedLinearUnit.value)
    const linearUnitAbbreviation = this.nls(selectedLinearUnit.abbreviation)
    const elevationUnit = this.nls(selectedElevationUnit.value)
    const elevationUnitAbbreviation = this.nls(selectedElevationUnit.abbreviation)
    return [linearUnit, elevationUnit, linearUnitAbbreviation, elevationUnitAbbreviation]
  }

  _updateProfileResults = (profileResults) => {
    const elevationProfileResults = {
      distances: {},
      elevations: {}
    }
    elevationProfileResults.distances = convertDistancesArray(profileResults.distances, profileResults.effectiveUnits.distance, this.props.selectedLinearUnit)
    elevationProfileResults.elevations = convertElevationsInfoArray(profileResults.elevations, profileResults.effectiveUnits.distance,
      profileResults.effectiveUnits.elevation, this.props.selectedLinearUnit, this.props.selectedElevationUnit)
    return elevationProfileResults
  }

  clearChart = () => {
    this.setState({
      chartDefinition: null
    })
  }

  getNearestElevationData = (chartObjectX: number) => {
    //added condition to avoid console errors, when chart hovered while it is updating
    if (!this.props.profileResult) {
      return null
    }
    const allDistances = this._allDistances
    let needle = convertSingle(chartObjectX, this.props.selectedLinearUnit, this.props.profileResult.effectiveUnits.distance)
    if (this.props.isFlip) {
      const totalDistance = allDistances[allDistances.length - 1]
      needle = totalDistance - needle
    }
    const closest = allDistances.reduce((a, b) => {
      return Math.abs(b - needle) < Math.abs(a - needle) ? b : a
    })
    if (closest >= 0) {
      const distanceIndex = (allDistances) ? allDistances.indexOf(closest) : -1
      if (distanceIndex >= 0) {
        const elevData = this.state.chartDefinition.data[distanceIndex]
        return elevData
      }
    }
    return null
  }

  hideChartPosition = () => {
    this.props.hideChartPosition()
  }

  getChartPadding = (params) => {
    let r = 0; let b = 0; let l = 0
    if (this._isRTL) {
      r = 5
      b = (params.showTitleAxis && params.showLegend)
        ? 2
        : (params.showTitleAxis && !params.showLegend)
            ? 0
            : (!params.showTitleAxis && params.showLegend)
                ? 2
                : (!params.showTitleAxis && !params.showLegend)
                    ? 5
                    : 0
      l = 5
    } else {
      r = 5
      b = (params.showTitleAxis && params.showLegend)
        ? 2
        : (params.showTitleAxis && !params.showLegend)
            ? 0
            : (!params.showTitleAxis && params.showLegend)
                ? 2
                : (!params.showTitleAxis && !params.showLegend)
                    ? 5
                    : 0
      l = 5
    }
    return { paddingTop: 0, paddingRight: r, paddingBottom: b, paddingLeft: l }
  }

  configureCursorAM5 = ({ chart, xAxis, yAxis, params }) => {
    const fontSize = this.getFontSize()
    //Style the chart tooltip
    const chartTooltip = TooltipAm5.new(chart.root, {
      pointerOrientation: 'horizontal'
    })
    chart.plotContainer.set('tooltip', chartTooltip)
    chartTooltip.get('background')?.setAll({
      fill: this.getColor(params.exbTheme.sys.color.surface.paper),
      strokeWidth: 0.5,
      stroke: this.getColor(params.exbTheme.sys.color.surface.paperText),
      fillOpacity: 1
    })
    chartTooltip.label.setAll({
      fontSize: fontSize + 3
    })

    //create the cursor
    const cursor = XYCursorAm5.new(chart.root, {
      behavior: 'zoomXY',
      xAxis,
      yAxis
    })
    chart.set('cursor', cursor)
    return cursor
  }

  /**
   * Set the zoomout button on the chart
   * @param chart - Instance of the XYChart to render the profiles
   * @param zoomOutTooltipText - Tooltip Text to be shown on zoom out button
   * @param theme - ExB Theme
   */
  setZoomButton = (chart, zoomOutTooltipText: string, theme) => {
    //Set the zoomOut Button title so that it is translated in all supported languages by EXB
    const zoomTooltip = TooltipAm5.new(chart.root, {
      // getFillFromSprite: false,
      labelText: zoomOutTooltipText
    })
    zoomTooltip.get('background')?.setAll({
      fill: this.getColor(theme.sys.color.primary.main),
      fillOpacity: 0.6
    })
    chart.zoomOutButton.setAll({
      cursorOverStyle: 'pointer',
      tooltipText: zoomOutTooltipText,
      tooltip: zoomTooltip
    })

    if (this._isRTL) {
      chart.plotContainer.onPrivate('width', (width) => {
        chart.zoomOutButton.set('dx', (-width + 50))
      })
    }

    //color for zoom out button in themes
    chart.zoomOutButton.get('background').setAll({
      fill: this.getColor(theme.sys.color.primary.main),
      stroke: this.getColor(theme.sys.color.primary.main)
    })
    chart.zoomOutButton.get('background').states.create('hover', {}).setAll({
      fill: this.getColor(theme.sys.color.primary.main),
      stroke: this.getColor(theme.sys.color.primary.main)
    })
    chart.zoomOutButton.get('background').states.create('down', {}).setAll({
      fill: this.getColor(theme.sys.color.primary.dark),
      stroke: this.getColor(theme.sys.color.primary.dark)
    })
  }

  initChart = async (params) => {
    const root = await createRoot(params.container, window.locale)
    const dark = params.isDarkTheme
    const theme = dark ? THEME_DARK : THEME_LIGHT
    root.setThemes(dark ? [ResponsiveThemeAm5.new(root), DarkThemeAm5.new(root), AnimatedThemeAm5.new(root)] : [ResponsiveThemeAm5.new(root), AnimatedThemeAm5.new(root)])
    const chart = root.container.children.push(
      XYChartAm5.new(root, {
        ...this.getChartPadding(params),
        maxTooltipDistance: 0, // Show only the closest tooltip
        pinchZoomX: true,
        pinchZoomY: true,
        wheelY: 'zoomXY',
        layout: root.verticalLayout
      })
    )

    //Set the Zoom Button text
    this.setZoomButton(chart, params.zoomOutText, params.exbTheme)

    const xAxis = chart.xAxes.push(ValueAxisAm5.new(root, { renderer: AxisRendererXAm5.new(root, {}) }))
    const yAxis = chart.yAxes.push(ValueAxisAm5.new(root, { renderer: AxisRendererYAm5.new(root, {}) }))

    yAxis.data.setAll(params.definition.data)
    xAxis.data.setAll(params.definition.data)

    const ctx = {
      params,
      chart,
      xAxis,
      yAxis,
      seriesInfos: new Map(),
      messages: null,
      theme,
      pointerIsOver: false,
      chartData: params.definition.data
    }
    this._accessChartParams = ctx

    this.configureXAxis(ctx)
    this.configureYAxis(ctx)
    const cursor = this.configureCursorAM5(ctx)

    this.resetExportingInfo()
    let groundSeries
    //Create and add all the elevation layers serieses
    this._elevationLayersOutput?.forEach((profileInfo) => {
      if (profileInfo.id === this.props.profileResult.lines[0].id) {
        //Create Ground Series
        groundSeries = this.addGroundSeries(ctx)
        groundSeries.data.setAll(params.definition.data)
        chart.series.push(groundSeries)
      } else {
        const elevationSurfaceLineSeries = this.addElevationSurfaceSeries(ctx, profileInfo.id, profileInfo.layerId, profileInfo.profileStyles)
        elevationSurfaceLineSeries.data.setAll(params.definition.data)
        profileInfo.series = elevationSurfaceLineSeries
        chart.series.push(elevationSurfaceLineSeries)
      }
    })

    //Create Volumetric objects series
    if (this._viewOutput && this.props.showVolumetricObj && this.props.mapView.view.type === '3d') {
      const volumetricObjSeries = this.addVolumetricObjLineSeries(ctx)
      volumetricObjSeries.data.setAll(params.definition.data)
      chart.series.push(volumetricObjSeries)
    }
    this.profilingWithCustomizeOptions(ctx)

    //Set legend
    this.displayChartLegend(ctx)
    setTimeout(() => {
      this.adjustAxisRanges(ctx)
    }, 500)
    return { chart, cursor, xAxis, yAxis, groundSeries }
  }

  showChartTooltip = (chartInfo) => {
    const { cursor, xAxis, yAxis, chart, groundSeries } = chartInfo
    //clear intersections from map
    this.props.intersectionHighlightLayer.removeAll()
    const cursorPositionX = cursor.getPrivate('positionX')
    const xAxisPosition = xAxis.toAxisPosition(cursorPositionX)
    const x = xAxis.positionToValue(xAxisPosition)
    //Get elevation data to current chart position
    const nearestElevationData = this.getNearestElevationData(x)
    const yAxisNumberFormatter = yAxis.get('numberFormatter')
    if (nearestElevationData) {
      // Adjust the position such that it is relative to the data, rather than relative to the axis.
      // Especially when using uniform scaling, it's very easy to have the data centered in the chart
      // and the start of an axis falling far away from the start of the data.
      let normalizedPosition = cursorPositionX
      if (this.props.profileResult.statistics != null) {
        const data = this.props.profileResult
        let { maxDistance } = data.statistics
        if (maxDistance != null) {
          // convert the max distance from effectiveUnits to current selected linear units
          maxDistance = convertSingle(maxDistance, data.effectiveUnits.distance, this.props.selectedLinearUnit)
          const pos = this._isRTL ? 1 - cursorPositionX : cursorPositionX
          const minZoom = xAxis.positionToValue(xAxis.get('start') ?? 0)
          const maxZoom = xAxis.positionToValue(xAxis.get('end') ?? 1)
          normalizedPosition = this.positionRelativeToData(pos, minZoom, maxZoom, 0, maxDistance)
        }
      }
      //Highlight the new position on map
      if (this.props.isFlip) {
        this.props.highlightChartPositionOnMap(1 - normalizedPosition)
      } else {
        this.props.highlightChartPositionOnMap(normalizedPosition)
      }
      let maxY = null
      const yAxisHeight = yAxis.height()
      const yAxisY = yAxisHeight + chart.get('paddingTop')

      //on cursor positioned get labels according to selected units
      const formattedY = yAxisNumberFormatter.format(nearestElevationData.y, 5)

      //Create tooltip html text
      let tooltipHTML = '<div style="overflow: hidden;">'
      let innerHtml = ''

      //create tooltip for each added elevation layers
      this._elevationLayersOutput?.forEach((profileInfo) => {
        if (profileInfo.id === this.props.profileResult.lines[0].id) {
          //Don't show chart tooltip if ground series is off
          if (groundSeries.isVisible() && nearestElevationData.y !== null) {
            maxY = nearestElevationData.y
            innerHtml += '<div style="display:inline-block; margin: 3px 0px 3px 0px; height: 2px; width:15px; background-color:' + this._chartSeries.get('stroke').toString() + ';"></div> ' + this._chartSeries.get('name') + ':  <b>' + formattedY + '</b> <br/>'
          }
        } else {
          if (profileInfo.series.isVisible() && nearestElevationData[profileInfo.layerId] !== null) {
            const formattedProfileLineY = yAxisNumberFormatter.format(nearestElevationData[profileInfo.layerId], 5)
            if (maxY === null || maxY < nearestElevationData[profileInfo.layerId]) {
              maxY = nearestElevationData[profileInfo.layerId]
            }
            innerHtml += '<div style="display:inline-block; margin: 3px 0px 3px 0px; height: 2px; width:15px; background-color:' + profileInfo.profileStyles.style.lineColor + ';"></div> ' + profileInfo.profileStyles.label + ':  <b>' + formattedProfileLineY + '</b> <br/>'
          }
        }
      })

      //create tooltip for volumetric objects
      const formattedLineViewY = yAxisNumberFormatter.format(nearestElevationData.esriCTViewY, 5)
      if (this.props.profileResult.lines.length > 0 && this.props.showVolumetricObj && this.props.mapView.view.type === '3d') {
        if (this._volumetricObjLineSeries.isVisible()) {
          maxY = nearestElevationData.esriCTViewY
          if (maxY === null || maxY < nearestElevationData.esriCTViewY) {
            maxY = nearestElevationData.esriCTViewY
          }
          innerHtml += '<div style="display:inline-block; margin: 3px 0px 3px 0px; height: 2px; width:15px; background-color:' + this._volumetricObjLineSeries.get('stroke').toString() + ';"></div> ' + this._volumetricObjLineSeries.get('name') + ':  <b>' + formattedLineViewY + '</b> <br/>'
        }
      }

      //get series info at the current point
      const seriesID = this._seriesKey && this._seriesKey[nearestElevationData.pointIdx] ? this._seriesKey[nearestElevationData.pointIdx] : null
      this._chart?.series?.values.forEach((series) => {
        //show series tooltip only if it is shown on chart
        if (series.get('valueYField') === seriesID && series.isVisible() && nearestElevationData[seriesID] !== null) {
          const formattedSeriesY = yAxisNumberFormatter.format(nearestElevationData[seriesID], 5)
          if (maxY === null || maxY < nearestElevationData[seriesID]) {
            maxY = nearestElevationData[seriesID]
          }
          innerHtml += '<div style="display:inline-block; margin: 3px 0px 3px 0px; height: 2px; width:15px; background-color:' + series.get('stroke').toString() + ';"></div> ' + series.get('name') + ':  <b>' + formattedSeriesY + '</b> <br/>'
          return true
        }
      })

      //show tooltip for the intersecting layers at the point
      if (this._intersectionSeriesKeyIndex[nearestElevationData.pointIdx] !== null) {
        const intersectionInfoAtPoint = this._intersectionSeriesKey?.[this._intersectionSeriesKeyIndex[nearestElevationData.pointIdx]]
        const highlightInfo = {}
        const uniqueTooltipForIntersection: string[] = []
        if (intersectionInfoAtPoint) {
          const keys = Object.keys(intersectionInfoAtPoint)
          keys.forEach((layerKey) => {
            const featuresAtPoint = intersectionInfoAtPoint[layerKey]
            featuresAtPoint.forEach(seriesInfo => {
              this._chart?.series?.values.some((series) => {
                //show series tooltip only if it is shown on chart
                if (series.get('valueYField') === seriesInfo.seriesId && series.isVisible() && nearestElevationData[seriesInfo.seriesId] !== undefined) {
                  let formattedSeriesY = yAxisNumberFormatter.format(nearestElevationData[seriesInfo.seriesId], 5)
                  //In some cases for line, our logic is adding line as well as point for same feature.
                  //As a result in tooltip we see same info multiple times
                  //create uniqueId for each series tooltip data, so that we don't show same data multiple times in tooltip
                  const uniqueValue = seriesInfo.layerId + seriesInfo.featureIndex + formattedSeriesY
                  if (!uniqueTooltipForIntersection.includes(uniqueValue)) {
                    uniqueTooltipForIntersection.push(uniqueValue)
                    //create data for highlighting all the intersecting features at a point of all the layers
                    if (!highlightInfo[seriesInfo.layerId]) {
                      highlightInfo[seriesInfo.layerId] = []
                    }
                    if (!highlightInfo[seriesInfo.layerId].includes(seriesInfo.featureIndex)) {
                      highlightInfo[seriesInfo.layerId].push(seriesInfo.featureIndex)
                    }
                    if (maxY === null || maxY < nearestElevationData[seriesInfo.seriesId]) {
                      maxY = nearestElevationData[seriesInfo.seriesId]
                    }
                    //for points with two fields show values of both the fields
                    if (seriesInfo.hasOwnProperty('y2')) {
                      formattedSeriesY = yAxisNumberFormatter.format(seriesInfo.value, 5)
                      formattedSeriesY = formattedSeriesY + ' | ' + yAxisNumberFormatter.format(seriesInfo.y2, 5)
                    }
                    //if display field is configured add its value in the tooltip
                    if (seriesInfo.displayField) {
                      innerHtml += '<div style="display:inline-block; ' + seriesInfo.assetStyle + '"></div> ' + series.get('name') + ' (' + seriesInfo.displayField + '):  <b>' + formattedSeriesY + '</b> <br/>'
                    } else {
                      innerHtml += '<div style="display:inline-block; ' + seriesInfo.assetStyle + '"></div> ' + series.get('name') + ':  <b>' + formattedSeriesY + '</b> <br/>'
                    }
                  }
                  return true
                }
                return false
              })
            })
          })
        }
        this.highlightIntersectionsOnMap(highlightInfo)
      }

      if (innerHtml !== '' && yAxis.get('min') <= maxY) {
        //close the extra div added to avoid scrollbar in tooltip
        tooltipHTML = tooltipHTML + innerHtml + '</div>'
        const chartTooltip = chart.plotContainer.get('tooltip')
        chartTooltip.set('html', tooltipHTML)
        // chart.set('tooltipHTML', tooltipHTML)
        //show the tooltip at the x and yMax (max elevation between ground and other line series)
        const chartPositionPoint = {
          x: cursor.getPrivate('point').x, //+ cursor.parent.pixelX + chart.pixelPaddingLeft
          y: yAxisY - yAxis.valueToPosition(maxY) * yAxisHeight - 1
        }
        chartTooltip.set('pointTo', chartPositionPoint)
        chartTooltip.show()
      }
    }
  }

  /**
  * Creates a new profile chart on the HTML element.
  */
  createChart = async (params: ChartParams) => {
    this._seriesToBeHiddenInLegend = []
    const chartInfo = await this.initChart(params)

    const { chart, cursor } = chartInfo
    this._chart = chart
    cursor.events.on('cursormoved', () => {
      this.showChartTooltip(chartInfo)
    })
    cursor.events.on('cursorhidden', () => {
      //clear intersections from map
      this.props.intersectionHighlightLayer.removeAll()
      chart.plotContainer.get('tooltip').hide()
      this.hideChartPosition()
    })
  }

  //check for the advanced option in backward compatibility
  canShowProfileSettingsForBackward = (activeDsConfigInfo) => {
    let showProfiling: boolean = false
    if (activeDsConfigInfo) {
      if ((activeDsConfigInfo.hasOwnProperty('advanceOptions') ||
        activeDsConfigInfo?.profileSettings.hasOwnProperty('isProfileSettingsEnabled') ||
        activeDsConfigInfo?.profileSettings.hasOwnProperty('isCustomizeOptionEnabled'))) {
        if (activeDsConfigInfo?.advanceOptions ||
          (activeDsConfigInfo?.profileSettings?.isProfileSettingsEnabled &&
            activeDsConfigInfo?.profileSettings?.isCustomizeOptionEnabled)) {
          showProfiling = true
        }
      }
    }
    return showProfiling
  }

  profilingWithCustomizeOptions = (ctx) => {
    //create series for selectable profile layers
    if (this.canShowProfileSettingsForBackward(this.props.currentConfig)) {
      const uniqueProfileLayers = this.checkForProfileSettings()
      if (uniqueProfileLayers.length > 0) {
        uniqueProfileLayers.forEach((layerId) => {
          this.addLineSeries(layerId, ctx)
        })
      }
    }
    // if we got the result for intersecting asset layers
    // create the series for intersecting asset layers
    if (this.props.currentConfig) {
      if (((this.props.currentConfig.hasOwnProperty('advanceOptions') && this.props.currentConfig?.advanceOptions) ||
        this.props.currentConfig?.assetSettings?.isAssetSettingsEnabled) &&
        this.props.assetIntersectionResult?.length > 0) {
        this.props.assetIntersectionResult?.forEach(eachAssetLayerResult => {
          if (eachAssetLayerResult?.intersectionResult?.length > 0) {
            const geometryType = eachAssetLayerResult.intersectionResult[0].intersectingFeature.geometry.type
            if (geometryType === 'polyline') {
              this.addIntersectingLineSeries(eachAssetLayerResult, ctx)
            } else {
              this.addPointSeries(eachAssetLayerResult, ctx)
            }
          }
        })
      }
    }
  }

  adjustAxisRanges = (ctx) => {
    const { xAxis, yAxis } = ctx
    if (this.props.profileResult?.statistics) {
      const { minX, maxX, minY, maxY } = this.getAdjustedBounds({
        data: this.props.profileResult,
        pixelWidth: xAxis.width(),
        pixelHeight: yAxis.height()
      })
      xAxis.set('min', minX)
      xAxis.set('max', maxX)
      yAxis.set('min', minY)
      yAxis.set('max', maxY)
    }
  }

  getAdjustedBounds = ({ data, pixelWidth, pixelHeight }) => {
    const statistics = data.statistics
    const minX = 0
    //get min max from ground statistics
    let maxX = statistics.maxDistance
    maxX = convertSingle(maxX, data.effectiveUnits.distance, this.props.selectedLinearUnit)
    let minY = statistics.minElevation
    minY = convertSingle(minY, data.effectiveUnits.elevation, this.props.selectedElevationUnit)
    let maxY = statistics.maxElevation
    maxY = convertSingle(maxY, data.effectiveUnits.elevation, this.props.selectedElevationUnit)
    //calculate min max based on all the profiles
    for (const layerId in this._minMaxOfEachProfile) {
      if (this._minMaxOfEachProfile[layerId].max > maxY) {
        maxY = this._minMaxOfEachProfile[layerId].max
      }
      if (this._minMaxOfEachProfile[layerId].min < minY) {
        minY = this._minMaxOfEachProfile[layerId].min
      }
    }
    // Make sure our ranges are not too small.
    const rangeX = Math.max(maxX - minX, 0.001)
    let rangeY = Math.max(maxY - minY, 0.001)

    if (data.dynamicElevationRange) {
      // Convert to elevation units so that all values are compatible.
      const rangeXInElevationUnits = convertSingle(rangeX, this.props.selectedLinearUnit, this.props.selectedElevationUnit)
      // Make sure the Y axis is not too small in relation to the X axis.
      rangeY = Math.max(rangeY, rangeXInElevationUnits / 300)
    }

    // Apply some padding at the top and bottom so the chart lines don't align
    // with the axes.
    minY = minY - 0.02 * rangeY
    maxY = minY + rangeY + 0.02 * rangeY

    // Adjust the Y axis such that we obtain guides and labels at 'nice' locations.
    const yMinMax = niceScale(minY, maxY, 10)
    rangeY = yMinMax[1] - yMinMax[0]

    if (this.props.isUniformChartScalingEnable) { //if uniform scaling is true
      return this.getUniformBounds({
        bounds: { minX, maxX, minY, maxY },
        pixelWidth,
        pixelHeight,
        centered: true
      })
    }

    return {
      minX,
      maxX: minX + rangeX,
      minY,
      maxY: minY + rangeY
    }
  }

  getUniformBounds = ({ bounds, pixelWidth, pixelHeight, centered }) => {
    let { minX, maxX, minY, maxY } = bounds
    const rangeX = maxX - minX
    const rangeY = maxY - minY

    // Convert to distance units so that all values are compatible.
    const rangeYInDistanceUnits = convertSingle(rangeY, this.props.selectedElevationUnit, this.props.selectedLinearUnit)
    const unitsPerPixelX = rangeX / pixelWidth
    const unitsPerPixelY = rangeYInDistanceUnits / pixelHeight
    const scale = unitsPerPixelY / unitsPerPixelX

    if (scale >= 1) {
      // If the data would be stretched along the X axis, we grow the axis so that
      // the data keeps the right shape.
      [minX, maxX] = this.scaleRange([minX, maxX], scale, centered)
    } else {
      // When things would stretch past the right edge, we need to shrink the
      // Y axis instead to make everything fit.
      [minY, maxY] = this.scaleRange([minY, maxY], 1 / scale, centered)
    }
    return { minX, maxX, minY, maxY }
  }

  scaleRange = ([min, max]: [number, number], scale: number, centered: boolean): [number, number] => {
    const newRange = (max - min) * scale

    if (centered) {
      const center = (min + max) / 2
      const newMin = center - newRange / 2
      return [newMin, newMin + newRange]
    }
    return [min, min + newRange]
  }

  getFontSize = () => {
    const theme = this.props.theme
    let labelHeight = 9
    if (theme.ref.typeface.htmlFontSize === '125%') {
      labelHeight = 11
    } else if (theme.ref.typeface.htmlFontSize === '87.5%') {
      labelHeight = 8
    } else if (theme.ref.typeface.htmlFontSize === '75%') {
      labelHeight = 7
    }
    return labelHeight
  }

  configureXAxis = (ctx) => {
    const { chart, xAxis, theme, params } = ctx
    this._xAxis = xAxis
    const fontSize = this.getFontSize()
    const unitsAbbreviations = params.unitsAbbreviations
    //X axis title
    this._xAxisLabel = LabelAm5.new(ctx.chart.root, {
      text: params.definition.series[0].x.label,
      textAlign: 'center',
      x: p50,
      fontWeight: theme.axisLabelsFontWeight,
      fontSize: fontSize + 3,
      visible: params.showTitleAxis,
      paddingBottom: 0
    })
    xAxis.children.push(this._xAxisLabel)
    xAxis.setAll({
      extraMax: 0.001,
      extraMin: 0.001,
      maxDeviation: 0,
      numberFormatter: this.makeFormatter(ctx, unitsAbbreviations[2]),
      strictMinMax: true,
      strictMinMaxSelection: true,
      extraTooltipPrecision: 2, //axis tooltip displays number upto 3 decimal places
      cursorTooltipEnabled: true
    })

    //Axis renderer
    const renderer = xAxis.get('renderer') as AxisRendererXAm5
    renderer.setAll({
      inside: false,
      minGridDistance: theme.xAxisMinGridDistance,
      inversed: this._isRTL //to make the x axis chart data reversed in rtl
    })
    renderer.labels.template.setAll({
      centerX: p0,
      centerY: p0,
      fontFamily: theme.fontFamily,
      fontSize: fontSize,
      fontWeight: theme.axisLabelsFontWeight,
      maxPosition: theme.xAxisMaxLabelPosition,
      minPosition: theme.xAxisMinLabelPosition,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: theme.xAxisLabelsSpacing
    })
    // set axis toolitp
    const tooltip = xAxis.set(
      'tooltip',
      TooltipAm5.new(chart.root, {
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0
      })
    )
    tooltip.get('background')?.setAll({
      fill: this.getColor(params.exbTheme.sys.color.surface.paperText),
      stroke: undefined
    })

    tooltip.label.setAll({
      fill: this.getColor(params.exbTheme.sys.color.surface.paper),
      fontFamily: theme.fontFamily,
      fontSize: theme.axisTooltipFontSize,
      paddingBottom: theme.axisTooltipPaddingBottom,
      paddingLeft: theme.axisTooltipPaddingHorizontal,
      paddingRight: theme.axisTooltipPaddingHorizontal,
      paddingTop: theme.axisTooltipPaddingTop
    })
    //Enable/Disable grid for X axis
    renderer.grid.template.setAll({
      visible: ctx.params.showGrid,
      strokeOpacity: 1,
      stroke: colorAm5(theme.axisGridStroke)
    })
  }

  configureYAxis = (ctx) => {
    const { yAxis, theme, chart, params } = ctx
    this._yAxis = yAxis
    const unitsAbbreviations = params.unitsAbbreviations
    const fontSize = this.getFontSize()
    //value axis title
    this._yAxisLabel = LabelAm5.new(ctx.chart.root, {
      text: params.definition.series[0].y.label,
      textAlign: 'center',
      y: p50,
      rotation: -90,
      fontWeight: '500',
      fontSize: fontSize + 3,
      visible: params.showTitleAxis
    })
    if (this._isRTL) {
      yAxis.children.push(this._yAxisLabel)
    } else {
      yAxis.children.unshift(this._yAxisLabel)
    }
    yAxis.setAll({
      baseValue: -500_000,
      extraMax: 0,
      extraMin: 0.01,
      maxDeviation: 0,
      numberFormatter: this.makeFormatter(ctx, unitsAbbreviations[3]),
      strictMinMax: true,
      strictMinMaxSelection: true,
      cursorTooltipEnabled: true,
      extraTooltipPrecision: 2 //axis tooltip displays number upto 3 decimal places
    })
    const renderer = yAxis.get('renderer') as AxisRendererYAm5
    renderer.setAll({
      minGridDistance: theme.yAxisMinGridDistance,
      opposite: this._isRTL,
      inside: true
    })
    renderer.labels.template.setAll({
      fontFamily: theme.fontFamily,
      fontSize: fontSize,
      fontWeight: theme.axisLabelsFontWeight,
      maxPosition: theme.yAxisMaxLabelPosition,
      minPosition: theme.yAxisMinLabelPosition,
      paddingTop: -8, //axis label to not get overlap with the grid
      direction: this._isRTL ? 'rtl' : 'ltr'
    })

    //Set axis toltip
    const tooltip = yAxis.set(
      'tooltip',
      TooltipAm5.new(chart.root, {
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0
      })
    )
    tooltip.get('background')?.setAll({
      fill: this.getColor(params.exbTheme.sys.color.surface.paperText),
      stroke: undefined
    })
    tooltip.label.setAll({
      fill: this.getColor(params.exbTheme.sys.color.surface.paper),
      fontFamily: theme.fontFamily,
      fontSize: theme.axisTooltipFontSize,
      paddingBottom: theme.axisTooltipPaddingBottom,
      paddingLeft: theme.axisTooltipPaddingHorizontal,
      paddingRight: theme.axisTooltipPaddingHorizontal,
      paddingTop: theme.axisTooltipPaddingTop
    })

    //Enable/Disable grid for Y axis
    renderer.grid.template.setAll({
      visible: ctx.params.showGrid,
      strokeOpacity: 1,
      stroke: colorAm5(theme.axisGridStroke)
    })
  }

  /**
   * Highlights the intersecting graphic on map
   * @param Object - Array of feature index for each layerId
   */
  highlightIntersectionsOnMap = (featuresByLayerId: any) => {
    const featureIndexByLayerId = Object.keys(featuresByLayerId)
    if (this.props.assetIntersectionResult?.length > 0 && featureIndexByLayerId.length > 0) {
      const graphicsToHighlight: __esri.Graphic[] = []
      featureIndexByLayerId.forEach((layerId) => {
        const featureIndex = featuresByLayerId[layerId]
        // eslint-disable-next-line array-callback-return
        this.props.assetIntersectionResult.some((eachAssetLayerResult) => {
          if (eachAssetLayerResult?.intersectionResult?.length > 0 && layerId === eachAssetLayerResult.settings.layerId) {
            featureIndex.forEach((fIndex) => {
              const eachLayerRecord: any = eachAssetLayerResult.intersectionResult[fIndex]?.record
              const featureGraphic = eachLayerRecord.getFeature()
              graphicsToHighlight.push(getHighLightGraphic(featureGraphic, '#FFFF00'))
            })
            return true
          }
        })
      })
      if (graphicsToHighlight.length > 0) {
        this.props.intersectionHighlightLayer.removeAll()
        this.props.intersectionHighlightLayer.addMany(graphicsToHighlight)
      }
    }
  }

  /**
   * Given an axis position (0-1), returns a position (also in 0-1) relative to the chart data on that axis
   * @param axisPosition
   *    Axis position in the range of 0-1, where 0 is the start of the axis and 1 is the end of the axis.
   * @param maxAxis
   *    Value at the end of the axis.
   * @param minData
   *    Minimum value of the chart data.
   * @param maxData
   *    Maximum value of the chart data.
   */
  positionRelativeToData = (
    axisPosition: number,
    minAxis: number,
    maxAxis: number,
    minData: number,
    maxData: number
  ): number => {
    // Get a position relative to the start of the data.
    const value = minAxis + axisPosition * (maxAxis - minAxis) - minData
    // Normalize the position to 0-1
    return value / (maxData - minData)
  }

  addGroundSeries = (ctx) => {
    // eslint-disable-next-line @typescript-eslint/prefer-find
    const groundLayer = this.props.addedElelvationProfileLayers.filter((layer) => layer.id === this.props.profileResult.lines[0].id)[0]
    const groundLineSeries = LineSeriesAm5.new(ctx.chart.root, {
      id: groundLayer.id,
      name: this.getGroundSeriesLabel(groundLayer.label),
      connect: false,
      excludeFromTotal: true,
      fill: colorAm5(ctx.params.definition.series[0].color),
      stroke: colorAm5(ctx.params.definition.series[0].color),
      valueXField: 'x',
      valueYField: 'y',
      xAxis: ctx.xAxis,
      yAxis: ctx.yAxis,
      legendLabelText: '{name}'
    })
    if (groundLayer.style.lineType === 'dotted-line') {
      groundLineSeries.strokes.template.setAll({
        strokeWidth: groundLayer.style.lineThickness,
        strokeDasharray: [2, 4]
      })
    } else if (groundLayer.style.lineType === 'dashed-line') {
      groundLineSeries.strokes.template.setAll({
        strokeWidth: groundLayer.style.lineThickness,
        strokeDasharray: [8, 4]
      })
    } else {
      groundLineSeries.strokes.template.set('strokeWidth', groundLayer.style.lineThickness)
    }
    groundLineSeries.fills.template.setAll({
      fillOpacity: 0.1,
      visible: true
    })
    this._chartSeries = groundLineSeries
    this.props.chartInfo(this._accessChartParams.chart)
    //add series info in the exporting info
    this._groundExportingInfo.y = this.getGroundSeriesLabel(groundLayer.label) + ' (' + this.props.selectedElevationUnit + ')'
    return groundLineSeries
  }

  addElevationSurfaceSeries = (ctx, id: string, esriCTProfileLayerId: string, profileLayersStyles) => {
    const elevationSurfaceLabel = profileLayersStyles.label
    const elevationSurfaceLineColor = profileLayersStyles.style.lineColor
    const elevationSurfaceLineSeries = LineSeriesAm5.new(ctx.chart.root, {
      id: id,
      name: elevationSurfaceLabel,
      connect: false,
      excludeFromTotal: true,
      stroke: colorAm5(elevationSurfaceLineColor),
      valueXField: 'x',
      valueYField: esriCTProfileLayerId,
      xAxis: ctx.xAxis,
      yAxis: ctx.yAxis,
      legendLabelText: '{name}'
    })
    if (profileLayersStyles.style.lineType === 'dotted-line') {
      elevationSurfaceLineSeries.strokes.template.setAll({
        strokeWidth: profileLayersStyles.style.lineThickness,
        strokeDasharray: [2, 4]
      })
    } else if (profileLayersStyles.style.lineType === 'dashed-line') {
      elevationSurfaceLineSeries.strokes.template.setAll({
        strokeWidth: profileLayersStyles.style.lineThickness,
        strokeDasharray: [8, 4]
      })
    } else {
      elevationSurfaceLineSeries.strokes.template.set('strokeWidth', profileLayersStyles.style.lineThickness)
    }
    elevationSurfaceLineSeries.fills.template.setAll({
      visible: true
    })
    this.props.chartInfo(this._accessChartParams.chart)
    //add series info in the exporting info
    this._groundExportingInfo[esriCTProfileLayerId] = elevationSurfaceLabel + ' ' + this.nls('elevationLabel') + ' (' + this.props.selectedElevationUnit + ')'
    return elevationSurfaceLineSeries
  }

  addVolumetricObjLineSeries = (ctx) => {
    const volumetricObjLabel = this.props.volumetricObjLabel ? this.props.volumetricObjLabel : this.nls('volumetricObj')
    const volumetricObjLineColor = this.props.volumetricObjLineStyle.lineColor
    const volumetricObjLineSeries = LineSeriesAm5.new(ctx.chart.root, {
      id: this.props.currentConfig.elevationLayersSettings.volumetricObjSettingsOptions.id,
      name: volumetricObjLabel,
      connect: false,
      excludeFromTotal: true,
      fill: colorAm5(volumetricObjLineColor),
      stroke: colorAm5(volumetricObjLineColor),
      valueXField: 'x',
      valueYField: 'esriCTViewY',
      xAxis: ctx.xAxis,
      yAxis: ctx.yAxis,
      legendLabelText: '{name}'
    })
    if (this.props.volumetricObjLineStyle.lineType === 'dotted-line') {
      volumetricObjLineSeries.strokes.template.setAll({
        strokeWidth: this.props.volumetricObjLineStyle.lineThickness,
        strokeDasharray: [2, 4]
      })
    } else if (this.props.volumetricObjLineStyle.lineType === 'dashed-line') {
      volumetricObjLineSeries.strokes.template.setAll({
        strokeWidth: this.props.volumetricObjLineStyle.lineThickness,
        strokeDasharray: [8, 4]
      })
    } else {
      volumetricObjLineSeries.strokes.template.set('strokeWidth', this.props.volumetricObjLineStyle.lineThickness)
    }
    volumetricObjLineSeries.fills.template.setAll({
      fillOpacity: 0.1,
      visible: true
    })
    this._volumetricObjLineSeries = volumetricObjLineSeries
    this.props.chartInfo(this._accessChartParams.chart)
    //add series info in the exporting info
    this._groundExportingInfo.esriCTViewY = volumetricObjLabel + ' ' + this.nls('elevationLabel') + ' (' + this.props.selectedElevationUnit + ')'
    return volumetricObjLineSeries
  }

  getDistanceOfIntersectingPointOnLine = (intersectingPointGeometry: __esri.Point, lineGeometry: Polyline): number => {
    //As per ticket 252 - we will now only support distance as per map projection
    //so get the distance of each feature according to mapProjection
    if (intersectingPointGeometry && lineGeometry?.paths?.length > 0) {
      const nearestCoordinate = proximityOperator.getNearestCoordinate(lineGeometry, intersectingPointGeometry).coordinate
      const segmentPolyline: Polyline[] = []
      let segmentIndex = 0
      lineGeometry.paths.forEach((linePathVertex) => {
        linePathVertex.forEach((point, index) => {
          if (index !== 0) {
            const paths = [
              [
                lang.clone(linePathVertex[index - 1]),
                lang.clone(point)
              ]
            ]
            segmentPolyline[segmentIndex++] = new Polyline({
              hasZ: lineGeometry.hasZ,
              hasM: lineGeometry.hasM,
              paths: paths,
              spatialReference: lineGeometry.spatialReference.toJSON()
            })
          }
        })
      })
      const allSegmentLengths: number[] = []
      segmentPolyline.forEach((eachSegment) => {
        allSegmentLengths.push(this.getLengthAsPerMapProjection(eachSegment, this.props.selectedLinearUnit))
      })
      let totalLength = 0
      let result = -1
      // eslint-disable-next-line array-callback-return
      segmentPolyline.some((eachSegmentLine, segmentIndex) => {
        if (intersectsOperator.execute(eachSegmentLine, nearestCoordinate)) {
          const segmentsFirstPoint = eachSegmentLine.getPoint(0, 0)
          //when the nearest coordinate is the first point of segment then no need to create the line and get distance,
          //as it is intersecting to the first point we just need to add 0 to totallength
          if (intersectsOperator.execute(segmentsFirstPoint, nearestCoordinate)) {
            result = totalLength + 0
          } else {
            const pt1Cor = [segmentsFirstPoint.x, segmentsFirstPoint.y]
            const pt2Cor = [nearestCoordinate.x, nearestCoordinate.y]
            const lineJSON = {
              paths: [[pt1Cor, pt2Cor]],
              spatialReference: lineGeometry.spatialReference
            }
            const polyLine1 = new Polyline(lineJSON)
            result = totalLength + this.getLengthAsPerMapProjection(polyLine1, this.props.selectedLinearUnit)
          }
          return true
        } else {
          totalLength += allSegmentLengths[segmentIndex]
        }
      })
      return result
    }
    return -1
  }

  createDataForIntersectingAssets = async (chartData): Promise<any> => {
    if (this.props.currentConfig) {
      if (((this.props.currentConfig?.hasOwnProperty('advanceOptions') && this.props.currentConfig?.advanceOptions) ||
        (this.props.currentConfig?.assetSettings?.hasOwnProperty('isAssetSettingsEnabled') && this.props.currentConfig.assetSettings?.isAssetSettingsEnabled)) &&
        this.props.assetIntersectionResult?.length > 0) {
        const promise = new Promise<any>((resolve) => {
          this._intersectionSeriesKey = {}
          this.props.assetIntersectionResult.forEach((eachAssetLayerResult) => {
            const elevationSettings = eachAssetLayerResult?.settings?.elevationSettings
            if (elevationSettings && eachAssetLayerResult.intersectionResult?.length > 0) {
              const layerGeometryType = eachAssetLayerResult?.intersectionResult[0].intersectingFeature?.geometry?.type
              if (layerGeometryType === 'point') {
                this.createElevationDataForIntersectingPointLayer(eachAssetLayerResult, chartData)
              } else if (layerGeometryType === 'polyline') {
                this.createElevationDataForIntersectingLineLayer(eachAssetLayerResult, chartData)
              }
            }
          })
          resolve(chartData)
        })
        return promise
      } else {
        await Promise.resolve()
      }
    }
  }

  createElevationDataForIntersectingPointLayer = (eachAssetLayerResult, chartData) => {
    const layerId = eachAssetLayerResult.settings.layerId
    const elevationSettings = eachAssetLayerResult?.settings?.elevationSettings
    //since all the features now have z value in map SR, get metersPerSR for mapSR and multiple the z value with it to get the z in meters
    const metersPerSRForMap = unitUtils.getMetersPerUnitForSR(new SpatialReference(this.props.mapView.view.spatialReference.toJSON()))
    eachAssetLayerResult?.intersectionResult.forEach((eachIntersectingFeatureResult, featureIndex) => {
      const distanceFromStart = this.getDistanceOfIntersectingPointOnLine(eachIntersectingFeatureResult.intersectingFeature.geometry, eachAssetLayerResult.inputGeometry)
      let elevationValue
      const intersectingFeature = eachIntersectingFeatureResult.intersectingFeature

      //get the displayField value for the feature if displayField is configured
      const displayFieldValue = eachAssetLayerResult?.settings?.displayField ? eachIntersectingFeatureResult.record.getFormattedFieldValue(eachAssetLayerResult?.settings?.displayField, this.props.intl) : undefined

      const configuredAssetShape = eachAssetLayerResult?.settings?.style?.intersectingAssetShape
      const configuredAssetColor = eachAssetLayerResult?.settings?.style?.intersectingAssetColor
      let assetShape = configuredAssetShape
      if (!assetShape) {
        assetShape = 'circle'
      }
      let assetShapeStyle = ''
      switch (assetShape) {
        case 'rectangle':
          assetShapeStyle += 'margin: 0px 3px 0px 3px; height: 7px; width: 15px; background-color: ' + configuredAssetColor + ';'
          break
        case 'circle':
          assetShapeStyle += 'margin: 0px 3px 0px 3px; height: 10px; width: 10px; background-color: ' + configuredAssetColor + '; border-radius: 50%;'
          break
        case 'square':
          assetShapeStyle += 'margin: 0px 3px 0px 3px; height: 10px; width: 10px; background-color: ' + configuredAssetColor + ';'
          break
        case 'triangle':
          assetShapeStyle += 'margin: 0px 3px 0px 3px; width: 0; height: 0; border:5px solid transparent; border-bottom: 10px solid ' + configuredAssetColor + ';'
          break
      }
      let elevationValue2
      if (elevationSettings.type === 'z') {
        elevationValue = eachIntersectingFeatureResult.intersectingFeature.geometry.z * metersPerSRForMap
        elevationValue = convertSingle(elevationValue, unitForZ, this.props.selectedElevationUnit)
      } else if (elevationSettings.type === 'one' && elevationSettings.field1 && intersectingFeature.attributes[elevationSettings.field1] !== null) {
        elevationValue = intersectingFeature.attributes[elevationSettings.field1]
        if (elevationSettings.unit && elevationSettings.unit !== this.props.selectedElevationUnit) {
          elevationValue = convertSingle(elevationValue, elevationSettings.unit, this.props.selectedElevationUnit)
        }
      } else if (elevationSettings.type === 'two' && elevationSettings.field1 && elevationSettings.field2 &&
        intersectingFeature.attributes[elevationSettings.field1] !== null && intersectingFeature.attributes[elevationSettings.field2] !== null) {
        elevationValue = intersectingFeature.attributes[elevationSettings.field1]
        if (elevationSettings.unit && elevationSettings.unit !== this.props.selectedElevationUnit) {
          elevationValue = convertSingle(elevationValue, elevationSettings.unit, this.props.selectedElevationUnit)
        }
        elevationValue2 = intersectingFeature.attributes[elevationSettings.field2]
        if (elevationSettings.unit && elevationSettings.unit !== this.props.selectedElevationUnit) {
          elevationValue2 = convertSingle(elevationValue2, elevationSettings.unit, this.props.selectedElevationUnit)
        }
      }

      const nextDataToBeUpdated = chartData.filter((eachDataValue) => {
        return eachDataValue.x >= distanceFromStart
      })
      let elementToBeUpdated
      //when point is in buffer which may intersect the last point of the line
      if (nextDataToBeUpdated.length < 1) {
        const chartDataLength = chartData.length
        //if the distance of the point is greater than the distance of the last point on the line
        if (chartData[chartDataLength - 1].x < distanceFromStart) {
          elementToBeUpdated = chartData[chartDataLength - 1]
        }
      } else {
        //update only one point as we are plotting points
        nextDataToBeUpdated?.some(element => {
          elementToBeUpdated = element
          return true
        })
      }
      const seriesIdForY = layerId + featureIndex + 'y'
      const seriesIdForY2 = layerId + featureIndex + 'y2'
      //update the elevation data in the element
      if (elementToBeUpdated) {
        if (elevationValue === undefined) {
          //when elevation value is undefiend use selected profiles elevation if elevation setting is 'Match Profile'
          //else use the elevation value of ground profile
          if (elevationSettings.type === 'match profile' && elementToBeUpdated.layerName) {
            elementToBeUpdated[seriesIdForY] = elementToBeUpdated[elementToBeUpdated.layerName + 'y']
          } else {
            elementToBeUpdated[seriesIdForY] = elementToBeUpdated.y
          }
        } else {
          elementToBeUpdated[seriesIdForY] = elevationValue
        }
        //if the elevation is using 2 field then add the key to show two point elevation using dumbbell plot
        if (elevationSettings.type === 'two') {
          elementToBeUpdated[seriesIdForY2] = elevationValue2 === undefined ? elementToBeUpdated.y : elevationValue2
          this.updateMinMaxForIntersectionProfile({
            pointIndex: elementToBeUpdated.pointIdx,
            layerId: layerId,
            seriesID: seriesIdForY2,
            newValue: elementToBeUpdated[seriesIdForY],
            newValue2: elementToBeUpdated[seriesIdForY2],
            displayField: displayFieldValue,
            assetShapeStyle: assetShapeStyle,
            featureIndex: featureIndex
          } as UpdateMinMaxParams)
        } else {
          this.updateMinMaxForIntersectionProfile({
            pointIndex: elementToBeUpdated.pointIdx,
            layerId: layerId,
            seriesID: seriesIdForY,
            newValue: elementToBeUpdated[seriesIdForY],
            newValue2: undefined,
            displayField: displayFieldValue,
            assetShapeStyle: assetShapeStyle,
            featureIndex: featureIndex
          } as UpdateMinMaxParams)
        }
      }
    })
  }

  _getElevationValueForPointOnLineGeometry = (elevationSettings, pointGeometry, intersectingFeature) => {
    let elevationValue
    const pointDistanceFromStart = this.getDistanceOfIntersectingPointOnLine(pointGeometry, intersectingFeature.geometry)
    const currentFeatureLength = this.getLengthAsPerMapProjection(intersectingFeature.geometry, this.props.selectedLinearUnit)
    //since all the features now have z value in map SR, get metersPerSR for mapSR and multiple the z value with it to get the z in meters
    const metersPerSRForMap = unitUtils.getMetersPerUnitForSR(new SpatialReference(this.props.mapView.view.spatialReference.toJSON()))
    if (elevationSettings.type === 'z') {
      elevationValue = pointGeometry.z * metersPerSRForMap
      elevationValue = convertSingle(elevationValue, unitForZ, this.props.selectedElevationUnit)
    } else if (elevationSettings.type === 'one' && elevationSettings.field1 && intersectingFeature.attributes[elevationSettings.field1] !== null) {
      elevationValue = intersectingFeature.attributes[elevationSettings.field1]
      if (elevationSettings.unit && elevationSettings.unit !== this.props.selectedElevationUnit) {
        elevationValue = convertSingle(elevationValue, elevationSettings.unit, this.props.selectedElevationUnit)
      }
    } else if (elevationSettings.type === 'two' && elevationSettings.field1 && elevationSettings.field2 &&
      intersectingFeature.attributes[elevationSettings.field1] !== null && intersectingFeature.attributes[elevationSettings.field2] !== null) {
      let field1Value = intersectingFeature.attributes[elevationSettings.field1]
      if (elevationSettings.unit && elevationSettings.unit !== this.props.selectedElevationUnit) {
        field1Value = convertSingle(field1Value, elevationSettings.unit, this.props.selectedElevationUnit)
      }
      let field2Value = intersectingFeature.attributes[elevationSettings.field2]
      if (elevationSettings.unit && elevationSettings.unit !== this.props.selectedElevationUnit) {
        field2Value = convertSingle(field2Value, elevationSettings.unit, this.props.selectedElevationUnit)
      }
      const slope = (field2Value - field1Value) / currentFeatureLength
      elevationValue = field1Value + (slope * pointDistanceFromStart)
    }
    return elevationValue
  }

  createElevationDataForIntersectingLineLayer = (eachAssetLayerResult, chartData) => {
    const elevationSettings = eachAssetLayerResult.settings.elevationSettings
    const layerId = eachAssetLayerResult.settings.layerId
    const chartDataLength = chartData.length
    eachAssetLayerResult?.intersectionResult.forEach((eachIntersectingFeatureResult, featureIndex) => {
      const intersectingFeature = eachIntersectingFeatureResult.intersectingFeature
      //get the displayField value for the feature if displayField is configured
      const displayFieldValue = eachAssetLayerResult?.settings?.displayField ? eachIntersectingFeatureResult.record.getFormattedFieldValue(eachAssetLayerResult?.settings?.displayField, this.props.intl) : undefined
      const configuredAssetColor = eachAssetLayerResult?.settings?.style?.intersectingAssetColor
      const assetShapeStyle = 'margin: 3px 0px 3px 0px; height: 2px; width:15px; background-color:' + configuredAssetColor + ';'
      eachIntersectingFeatureResult.connectedFeatureForProfiling.forEach((connectedFeature) => {
        let elevationValueForEachPoint = []
        let nearestCoordinateDistanceArray = []
        const dataToBeUpdatedForEachSegment = []
        const elvToBeUpdatedForEachSegment = []
        connectedFeature.paths.forEach((eachPath, pathIndex) => {
          nearestCoordinateDistanceArray = []
          elevationValueForEachPoint = []
          dataToBeUpdatedForEachSegment[pathIndex] = []
          elvToBeUpdatedForEachSegment[pathIndex] = []
          const seriesID = layerId + 'y_I' + '_' + featureIndex + '_' + pathIndex
          const seriesIDPoint = layerId + 'y-point' + '_' + featureIndex + '_' + pathIndex
          eachPath.forEach((point, pointIndexOnPath) => {
            const pointGeom = new Point(point)
            const nearestCoordinate = proximityOperator.getNearestCoordinate(eachAssetLayerResult.inputGeometry, pointGeom).coordinate
            let currentNearestPointDistance = this.getDistanceOfIntersectingPointOnLine(nearestCoordinate, eachAssetLayerResult.inputGeometry)
            const elevationValue = this._getElevationValueForPointOnLineGeometry(elevationSettings, pointGeom, intersectingFeature)
            elevationValueForEachPoint.push(elevationValue)
            nearestCoordinateDistanceArray.push(currentNearestPointDistance)
            if (pointIndexOnPath !== 0) {
              const oldNearestPointIndex = pointIndexOnPath - 1
              let currentTotalDistance = nearestCoordinateDistanceArray[oldNearestPointIndex]
              //to solve the case 10 - where one segment is returned in the reverse order
              let ev1 = elevationValue
              let ev2 = elevationValueForEachPoint[pointIndexOnPath - 1]
              if (currentNearestPointDistance < currentTotalDistance) {
                //swap the values currentTotalDistance & currentNearestPointDistance
                currentTotalDistance = currentTotalDistance + currentNearestPointDistance
                currentNearestPointDistance = currentTotalDistance - currentNearestPointDistance
                currentTotalDistance = currentTotalDistance - currentNearestPointDistance
                ev1 = elevationValueForEachPoint[pointIndexOnPath - 1]
                ev2 = elevationValue
              }
              const currentSegmentLength = currentNearestPointDistance - currentTotalDistance
              const oldDistance = lang.clone(currentTotalDistance)
              currentTotalDistance += currentSegmentLength

              let nextDataToBeUpdated = chartData.filter((eachDataValue) => {
                return eachDataValue.x >= oldDistance && eachDataValue.x < currentTotalDistance
              })
              //in some cases we don't get data for as x don't fall between oldDistance and currentTotalDistance
              //in this case try to find one point which is last
              if (nextDataToBeUpdated.length === 0) {
                //when line is intersecting at the first point
                if (currentTotalDistance === 0 && chartDataLength > 0) {
                  nextDataToBeUpdated = [chartData[0]]
                } else {
                  nextDataToBeUpdated = chartData.filter((eachDataValue) => {
                    return eachDataValue.x < currentTotalDistance
                  })
                  if (nextDataToBeUpdated.length > 0) {
                    nextDataToBeUpdated = [nextDataToBeUpdated[nextDataToBeUpdated.length - 1]]
                  }
                }
              }
              //if we get more than one in nextDataToBeUpdated means we will represent a line on chart
              if (nextDataToBeUpdated.length > 1) {
                //if elevation value is not defined use the ground elevation
                if (ev1 === undefined || ev2 === undefined) {
                  nextDataToBeUpdated.forEach((element) => {
                    //when elevation value is undefined use selected profiles elevation if elevation setting is 'Match Profile'
                    //else use the elevation value of ground profile
                    let newElevationValue = element.y
                    if (elevationSettings.type === 'match profile' && element.layerName) {
                      newElevationValue = element[element.layerName + 'y']
                    }
                    element[seriesID] = newElevationValue
                    this.updateMinMaxForIntersectionProfile({
                      pointIndex: element.pointIdx,
                      layerId: layerId,
                      seriesID: seriesID,
                      newValue: newElevationValue,
                      newValue2: undefined,
                      displayField: displayFieldValue,
                      assetShapeStyle: assetShapeStyle,
                      featureIndex: featureIndex
                    } as UpdateMinMaxParams)
                  })
                } else {
                  //we are always creating two elevation values for lines
                  //once we get the 2 elevation values interpolate the elevation values for in between points
                  const slope = (ev1 - ev2) / currentSegmentLength
                  nextDataToBeUpdated.forEach((element) => {
                    let pointLengthFromStart = 0
                    pointLengthFromStart = element.x - oldDistance
                    const updatedElevationValue = ev2 + (slope * pointLengthFromStart)
                    element[seriesID] = updatedElevationValue
                    this.updateMinMaxForIntersectionProfile({
                      pointIndex: element.pointIdx,
                      layerId: layerId,
                      seriesID: seriesID,
                      newValue: updatedElevationValue,
                      newValue2: undefined,
                      displayField: displayFieldValue,
                      assetShapeStyle: assetShapeStyle,
                      featureIndex: featureIndex
                    } as UpdateMinMaxParams)
                  })
                }
                const fPoint = nextDataToBeUpdated[0]
                const lPoint = nextDataToBeUpdated[nextDataToBeUpdated.length - 1]
                if (fPoint.x === lPoint.x) {
                  dataToBeUpdatedForEachSegment[pathIndex].push([fPoint])
                  elvToBeUpdatedForEachSegment[pathIndex].push([ev1])
                } else {
                  dataToBeUpdatedForEachSegment[pathIndex].push([fPoint, lPoint])
                  elvToBeUpdatedForEachSegment[pathIndex].push([ev2, ev1])
                }
              } else if (nextDataToBeUpdated.length === 1) {
                //when data to be updated length is one we will decide in the end of the segment if we should plot this as a line or point
                let dataAlreadyAdded = false
                //sometimes we get same data for multiple segments of the line, we will add it only once
                if (dataToBeUpdatedForEachSegment[pathIndex].length > 0) {
                  // eslint-disable-next-line array-callback-return
                  dataToBeUpdatedForEachSegment[pathIndex].some((data) => {
                    if (lodash.isDeepEqual(nextDataToBeUpdated, data)) {
                      dataAlreadyAdded = true
                      return true
                    }
                  })
                }
                if (!dataAlreadyAdded) {
                  dataToBeUpdatedForEachSegment[pathIndex].push([nextDataToBeUpdated[0]])
                  elvToBeUpdatedForEachSegment[pathIndex].push([ev2])
                }
              } else if (nextDataToBeUpdated.length === 0) {
                let elementToBeUpdated
                //if the distance of the point is greater than the distance of the last point on the line
                if (chartData[chartDataLength - 1].x < currentTotalDistance) {
                  elementToBeUpdated = chartData[chartDataLength - 1]
                  if (ev1 === undefined) {
                    //when elevation value is undefined use selected profiles elevation if elevation setting is 'Match Profile'
                    //else use the elevation value of ground profile
                    if (elevationSettings.type === 'match profile' && elementToBeUpdated.layerName) {
                      ev1 = elementToBeUpdated[elementToBeUpdated.layerName + 'y']
                    } else {
                      ev1 = elementToBeUpdated.y
                    }
                  }
                  elementToBeUpdated[seriesIDPoint] = ev1
                  this.updateMinMaxForIntersectionProfile({
                    pointIndex: elementToBeUpdated.pointIdx,
                    layerId: layerId,
                    seriesID: seriesIDPoint,
                    newValue: ev1,
                    newValue2: undefined,
                    displayField: displayFieldValue,
                    assetShapeStyle: assetShapeStyle,
                    featureIndex: featureIndex
                  } as UpdateMinMaxParams)
                }
                dataToBeUpdatedForEachSegment[pathIndex].push([])
                elvToBeUpdatedForEachSegment[pathIndex].push([])
              }
            }
          })
        })

        //based on the sum of points decide if we should add those points as line or a point
        dataToBeUpdatedForEachSegment.forEach((eachSegmentsData, pi) => {
          const seriesID = layerId + 'y_I' + '_' + featureIndex + '_' + pi
          const seriesIDPoint = layerId + 'y-point' + '_' + featureIndex + '_' + pi
          let sum = 0
          eachSegmentsData.forEach((segmentsData) => {
            sum += segmentsData.length
          })
          //if sum is greater than one represent it as a part of line (use seriesID)
          //else if sum is one represent it as individual point of a line (use seriesIDPoint)
          if (sum > 1) {
            eachSegmentsData.forEach((segment, si) => {
              if (segment.length > 0) {
                let elementToBeUpdated, ev1
                if (segment.length === 1) {
                  ev1 = elvToBeUpdatedForEachSegment[pi][si][0]
                  elementToBeUpdated = segment[0]
                  if (ev1 === undefined) {
                    //when elevation value is undefined use selected profiles elevation if elevation setting is 'Match Profile'
                    //else use the elevation value of ground profile
                    if (elevationSettings.type === 'match profile' && elementToBeUpdated.layerName) {
                      ev1 = elementToBeUpdated[elementToBeUpdated.layerName + 'y']
                    } else {
                      ev1 = elementToBeUpdated.y
                    }
                  }
                  elementToBeUpdated[seriesID] = ev1
                  this.updateMinMaxForIntersectionProfile({
                    pointIndex: elementToBeUpdated.pointIdx,
                    layerId: layerId,
                    seriesID: seriesID,
                    newValue: ev1,
                    newValue2: undefined,
                    displayField: displayFieldValue,
                    assetShapeStyle: assetShapeStyle,
                    featureIndex: featureIndex
                  } as UpdateMinMaxParams)
                }
              }
            })
          } else if (sum === 1) {
            let elementToBeUpdated, ev1
            // eslint-disable-next-line array-callback-return
            eachSegmentsData.some((v, si) => {
              if (v.length > 0 && v[0]) {
                elementToBeUpdated = v[0]
                ev1 = elvToBeUpdatedForEachSegment[pi][si][0]
                if (ev1 === undefined) {
                  //when elevation value is undefined use selected profiles elevation if elevation setting is 'Match Profile'
                  //else use the elevation value of ground profile
                  if (elevationSettings.type === 'match profile' && elementToBeUpdated.layerName) {
                    ev1 = elementToBeUpdated[elementToBeUpdated.layerName + 'y']
                  } else {
                    ev1 = elementToBeUpdated.y
                  }
                }
                elementToBeUpdated[seriesIDPoint] = ev1
                this.updateMinMaxForIntersectionProfile({
                  pointIndex: elementToBeUpdated.pointIdx,
                  layerId: layerId,
                  seriesID: seriesIDPoint,
                  newValue: ev1,
                  newValue2: undefined,
                  displayField: displayFieldValue,
                  assetShapeStyle: assetShapeStyle,
                  featureIndex: featureIndex
                } as UpdateMinMaxParams)
                return true
              }
            })
          }
        })
      })
      //add elevation info for all the disconnected points of the intersecting line geometry
      eachIntersectingFeatureResult.disconnectedFeatureForProfiling.forEach((disconnectedFeatureGeometry, pointIndex) => {
        const elevationValue = this._getElevationValueForPointOnLineGeometry(elevationSettings, disconnectedFeatureGeometry, intersectingFeature)
        const currentTotalDistance = this.getDistanceOfIntersectingPointOnLine(disconnectedFeatureGeometry, eachAssetLayerResult.inputGeometry)
        const nextDataToBeUpdated = chartData.filter((eachDataValue) => {
          return eachDataValue.x >= currentTotalDistance
        })
        let elementToBeUpdated
        const seriesId = layerId + 'y-point' + '_' + featureIndex + '_' + pointIndex + '_d'
        //when point is in buffer which may intersect the last point of the line
        if (nextDataToBeUpdated.length < 1) {
          const chartDataLength = chartData.length
          //if the distance of the point is greater than the distance of the last point on the line
          if (chartData[chartDataLength - 1].x < currentTotalDistance) {
            elementToBeUpdated = chartData[chartDataLength - 1]
          }
        } else { //update only one point as we are plotting points
          nextDataToBeUpdated?.some(element => {
            if (!element.hasOwnProperty(seriesId)) {
              elementToBeUpdated = element
              return true
            }
            return false
          })
        }
        //update the elevation data in the element
        if (elementToBeUpdated) {
          if (elevationValue === undefined) {
            //when elevation value is undefined use selected profiles elevation if elevation setting is 'Match Profile'
            //else use the elevation value of ground profile
            if (elevationSettings.type === 'match profile' && elementToBeUpdated.layerName) {
              elementToBeUpdated[seriesId] = elementToBeUpdated[elementToBeUpdated.layerName + 'y']
            } else {
              elementToBeUpdated[seriesId] = elementToBeUpdated.y
            }
          } else {
            elementToBeUpdated[seriesId] = elevationValue
          }
          this.updateMinMaxForIntersectionProfile({
            pointIndex: elementToBeUpdated.pointIdx,
            layerId: layerId,
            seriesID: seriesId,
            newValue: elementToBeUpdated[seriesId],
            newValue2: undefined,
            displayField: displayFieldValue,
            assetShapeStyle: assetShapeStyle,
            featureIndex: featureIndex
          } as UpdateMinMaxParams)
        }
      })
    })
  }

  createDataForProfileLines = async (chartData): Promise<any> => {
    if (this.canShowProfileSettingsForBackward(this.props.currentConfig)) {
      const uniqueProfileLayers = this.checkForProfileSettings()
      if (uniqueProfileLayers.length > 0) {
        const promise = new Promise<any>((resolve, reject) => {
          this.getDistanceOfAllSelectedFeatures().then((featuresDistances) => {
            uniqueProfileLayers.forEach((layerId) => {
              let currentTotalDistance = 0
              this.props.drawingLayer.graphics.forEach((selectedFeature, index) => {
                const selectedLayerId = selectedFeature.attributes.esriCTFeatureLayerId
                const config = this.getConfiguredSettingsForLine(selectedLayerId)
                if (config?.elevationSettings && selectedLayerId === layerId) {
                  const currentFeatureLength = featuresDistances[index]
                  const oldDistance = lang.clone(currentTotalDistance)
                  currentTotalDistance += currentFeatureLength
                  const nextDataToBeUpdated = chartData.filter((eachDataValue) => {
                    return eachDataValue.x >= oldDistance && eachDataValue.x <= currentTotalDistance
                  })
                  this.addElevationForSelectedFeature(config.elevationSettings, selectedFeature, currentFeatureLength, nextDataToBeUpdated, oldDistance)
                } else {
                  currentTotalDistance += featuresDistances[index]
                }
              })
            })
            resolve(chartData)
          })
        })
        return promise
      } else {
        await Promise.resolve()
      }
    } else {
      await Promise.resolve()
    }
  }

  removeNegativeExponents = (num: number): number => {
    let returnValue
    if (num.toString().toLowerCase().split('e-').length > 1) {
      returnValue = 0
    } else {
      returnValue = num
    }
    return returnValue
  }

  getLengthAsPerMapProjection = (geometry, unit): number => {
    const geodesicRequired = this.props.mapView.view.spatialReference.isWebMercator || this.props.mapView.view.spatialReference.isGeographic
    const length = geodesicRequired ? geodeticLengthOperator.execute(geometry, { unit: unit }) : lengthOperator.execute(geometry, { unit: unit })
    return this.removeNegativeExponents(length)
  }

  getDistanceAsPerMapProjection = (geometry, unit): number => {
    const geodesicRequired = this.props.mapView.view.spatialReference.isWebMercator || this.props.mapView.view.spatialReference.isGeographic
    if (geodesicRequired) {
      return geodeticLengthOperator.execute(geometry, { unit: unit })
    } else {
      return lengthOperator.execute(geometry, { unit: unit })
    }
  }

  getConfiguredSettingsForLine = (selectedLayerId: string) => {
    return this._updatedProfileLayers.find((layer) => {
      return layer.layerId === selectedLayerId
    })
  }

  getDistanceAsPerConfiguredFieldAndUnits = (configuredDistanceSettings, selectedFeature: Graphic) => {
    const fieldValue = selectedFeature.attributes[configuredDistanceSettings.field]
    if (!isNaN(Number(fieldValue))) {
      return convertSingle(fieldValue, configuredDistanceSettings.unit, this.props.selectedLinearUnit)
    }
    return 0
  }

  updateMinMaxForIntersectionProfile = (intersectionParams: UpdateMinMaxParams) => {
    let min = intersectionParams.newValue
    let max = intersectionParams.newValue
    //store each key value for each point on ground related to which series
    //this is useful to flip the profile series
    if (!this._intersectionSeriesKey[intersectionParams.pointIndex]) {
      this._intersectionSeriesKey[intersectionParams.pointIndex] = {}
    }
    //add the point index for which we have intersection data in the intersectionSeriesKeyIndex, which will be used for flip
    this._intersectionSeriesKeyIndex[intersectionParams.pointIndex] = intersectionParams.pointIndex
    const newInfo: NewSeriesTooltipInfo = {
      seriesId: intersectionParams.seriesID,
      value: intersectionParams.newValue,
      assetStyle: intersectionParams.assetShapeStyle,
      featureIndex: intersectionParams.featureIndex,
      layerId: intersectionParams.layerId
    }
    if (intersectionParams.newValue2 !== undefined) {
      newInfo.y2 = intersectionParams.newValue2
      if (max < intersectionParams.newValue2) {
        max = intersectionParams.newValue2
      }
      if (min > intersectionParams.newValue2) {
        min = intersectionParams.newValue2
      }
    }

    if (intersectionParams.displayField !== undefined && intersectionParams.displayField !== null) {
      newInfo.displayField = intersectionParams.displayField
    }
    if (!this._intersectionSeriesKey[intersectionParams.pointIndex][intersectionParams.layerId]) {
      this._intersectionSeriesKey[intersectionParams.pointIndex][intersectionParams.layerId] = []
    }
    this._intersectionSeriesKey[intersectionParams.pointIndex][intersectionParams.layerId].push(newInfo)
    if (!this._minMaxOfEachProfile[intersectionParams.layerId]) {
      this._minMaxOfEachProfile[intersectionParams.layerId] = {
        min: min,
        max: max
      }
    } else if (this._minMaxOfEachProfile[intersectionParams.layerId]) {
      if (this._minMaxOfEachProfile[intersectionParams.layerId].min > min) {
        this._minMaxOfEachProfile[intersectionParams.layerId].min = min
      }
      if (this._minMaxOfEachProfile[intersectionParams.layerId].max < max) {
        this._minMaxOfEachProfile[intersectionParams.layerId].max = max
      }
    }
  }

  updateMinMaxForProfile = (pointIndex: number, layerId: string, newValue: number) => {
    //store each key value for each point on ground related to which series
    //this is useful to flip the profile series
    this._seriesKey[pointIndex] = layerId + 'y'
    this._seriesValue[pointIndex] = newValue
    //add all the pointIndex for intersection, so that we can reverse it for flip
    this._intersectionSeriesKeyIndex[pointIndex] = null

    if (!this._minMaxOfEachProfile[layerId]) {
      this._minMaxOfEachProfile[layerId] = {
        min: newValue,
        max: newValue
      }
    } else if (this._minMaxOfEachProfile[layerId]) {
      if (this._minMaxOfEachProfile[layerId].min > newValue) {
        this._minMaxOfEachProfile[layerId].min = newValue
      }
      if (this._minMaxOfEachProfile[layerId].max < newValue) {
        this._minMaxOfEachProfile[layerId].max = newValue
      }
    }
  }

  addElevationForSelectedFeature = (config, selectedFeature, currentFeatureLength, nextDataToBeUpdated, currentTotalDistance): void => {
    let field1Value, field2Value
    const layerId = selectedFeature.attributes.esriCTFeatureLayerId
    if (config.type === 'one' && config.field1 && selectedFeature.attributes[config.field1] !== null) {
      field1Value = selectedFeature.attributes[config.field1]
      if (config.unit && config.unit !== this.props.selectedElevationUnit) {
        field1Value = convertSingle(field1Value, config.unit, this.props.selectedElevationUnit)
      }
      nextDataToBeUpdated.forEach(element => {
        element[layerId + 'y'] = field1Value
        element.layerName = layerId
        this.updateMinMaxForProfile(element.pointIdx, layerId, field1Value)
      })
    } else if (config.type === 'two' && config.field1 && config.field2 &&
      selectedFeature.attributes[config.field1] !== null && selectedFeature.attributes[config.field2] !== null) {
      field1Value = selectedFeature.attributes[config.field1]
      if (config.unit && config.unit !== this.props.selectedElevationUnit) {
        field1Value = convertSingle(field1Value, config.unit, this.props.selectedElevationUnit)
      }
      field2Value = selectedFeature.attributes[config.field2]
      if (config.unit && config.unit !== this.props.selectedElevationUnit) {
        field2Value = convertSingle(field2Value, config.unit, this.props.selectedElevationUnit)
      }
      const slope = (field2Value - field1Value) / currentFeatureLength
      nextDataToBeUpdated.forEach((element) => {
        let pointLengthFromStart = 0
        pointLengthFromStart = element.x - currentTotalDistance
        const elevationValue = field1Value + (slope * pointLengthFromStart)
        element[layerId + 'y'] = elevationValue
        element.layerName = layerId
        this.updateMinMaxForProfile(element.pointIdx, layerId, elevationValue)
      })
    } else if (config.type === 'z' && selectedFeature.geometry.hasZ) {
      const currentGeometry = selectedFeature.geometry
      if (currentGeometry.paths?.length > 0) {
        const segments: Polyline[] = []
        let segmentIndex = 0
        currentGeometry.paths.forEach((linePathVertex) => {
          linePathVertex.forEach((point, index) => {
            if (index !== 0) {
              const paths = [
                [
                  lang.clone(linePathVertex[index - 1]),
                  lang.clone(point)
                ]
              ]
              segments[segmentIndex++] = new Polyline({
                hasZ: currentGeometry.hasZ,
                hasM: currentGeometry.hasM,
                paths: paths,
                spatialReference: currentGeometry.spatialReference.toJSON()
              })
            }
          })
        })
        //since all the features now have z value in map SR, get metersPerSR for mapSR and multiple the z value with it to get the z in meters
        const metersPerSRForMap = unitUtils.getMetersPerUnitForSR(new SpatialReference(this.props.mapView.view.spatialReference.toJSON()))
        let totalSegLength = nextDataToBeUpdated[0]?.x
        const elevationInfo = this.props.drawingLayer.elevationInfo // get the elevation info applied to drawing layer to update the z-value
        segments.forEach((eachSegment, segmentIndex) => {
          const segmentLength = this.getLengthAsPerMapProjection(eachSegment, this.props.selectedLinearUnit)
          const segStartZInMeters = segments[segmentIndex].paths[0][0][2] * metersPerSRForMap
          const segEndZInMeters = segments[segmentIndex].paths[0][1][2] * metersPerSRForMap
          const nextDataToBeUpdatedForSeg = nextDataToBeUpdated.filter((eachDataValue) => {
            return eachDataValue.x >= totalSegLength && eachDataValue.x <= totalSegLength + segmentLength
          })

          let segStartZ = convertSingle(segStartZInMeters, unitForZ, this.props.selectedElevationUnit)
          let segEndZ = convertSingle(segEndZInMeters, unitForZ, this.props.selectedElevationUnit)
          //In case of webScene we need to update the z based on the elevation info applied
          if (this.props.mapView.view.type === '3d' && elevationInfo && nextDataToBeUpdatedForSeg?.length > 0) {
            //add the starting point z and ending point z in case of relative to scene/ground modes
            if (elevationInfo.mode === 'relative-to-ground' || elevationInfo.mode === 'relative-to-scene') {
              segStartZ += nextDataToBeUpdatedForSeg[0].y
              segEndZ += nextDataToBeUpdatedForSeg[nextDataToBeUpdatedForSeg.length - 1].y
            }
          }

          const slope = (segEndZ - segStartZ) / segmentLength
          nextDataToBeUpdatedForSeg.forEach((element) => {
            if (!element[layerId + 'y']) {
              let pointLengthFromStart = 0
              pointLengthFromStart = element.x - totalSegLength
              let elevationValue = segStartZ + (slope * pointLengthFromStart)
              //in case of on-the-ground mode the layers should be shown same as ground z and it should ignore the z layer in the features
              if (this.props.mapView.view.type === '3d' && elevationInfo?.mode === 'on-the-ground') {
                elevationValue = element.y
              }
              element[layerId + 'y'] = elevationValue
              element.layerName = layerId
              this.updateMinMaxForProfile(element.pointIdx, layerId, elevationValue)
            }
          })
          totalSegLength += segmentLength
        })
      }
    } else if (config.type) {
      nextDataToBeUpdated.forEach(element => {
        element[layerId + 'y'] = element.y
        element.layerName = layerId
        this.updateMinMaxForProfile(element.pointIdx, layerId, element.y)
      })
    }
  }

  getDistanceOfAllSelectedFeatures = (): Promise<any[]> => {
    const getDistancePromiseArray = []
    //As per ticket 252 - we will now only support distance as per map projection
    //so get the distance of each feature according to mapProjection
    this.props.drawingLayer.graphics.forEach((selectedFeature) => {
      getDistancePromiseArray.push(this.getDistanceAsPerMapProjection(selectedFeature.geometry, this.props.selectedLinearUnit))
    })
    return Promise.all(getDistancePromiseArray)
  }

  addLineSeries = (layerId: string, ctx) => {
    let configuredProfileSetting = null
    let lineSeriesName = ''
    const dsManager = DataSourceManager.getInstance()
    if (this._updatedProfileLayers.length > 0) {
      configuredProfileSetting = this._updatedProfileLayers.filter((layerSettings) => {
        return layerSettings.layerId === layerId
      })
    }

    if (configuredProfileSetting?.length === 1) {
      const ds = dsManager.getDataSource(layerId) as FeatureLayerDataSource
      if (ds) {
        //in case of newly added layer through other widgets we cannot get the layer in layer data source
        //so to get the layer title fetch it from the restLayer in layer data source
        const mapLayerDs = ds.layer ?? ds.restLayer
        lineSeriesName = mapLayerDs?.title
        const lineSeries = LineSeriesAm5.new(ctx.chart.root, {
          name: lineSeriesName,
          connect: false,
          excludeFromTotal: true,
          stroke: colorAm5(configuredProfileSetting[0].style.lineColor),
          valueXField: 'x',
          valueYField: layerId + 'y',
          xAxis: ctx.xAxis,
          yAxis: ctx.yAxis,
          legendLabelText: '{name}'
        })
        if (configuredProfileSetting[0].style.lineType === 'dotted-line') {
          lineSeries.strokes.template.setAll({
            strokeWidth: configuredProfileSetting[0].style.lineThickness,
            strokeDasharray: [2, 4]
          })
        } else if (configuredProfileSetting[0].style.lineType === 'dashed-line') {
          lineSeries.strokes.template.setAll({
            strokeWidth: configuredProfileSetting[0].style.lineThickness,
            strokeDasharray: [8, 4]
          })
        } else {
          lineSeries.strokes.template.set('strokeWidth', configuredProfileSetting[0].style.lineThickness)
        }
        lineSeries.fills.template.setAll({
          visible: true
        })
        lineSeries.data.setAll(ctx.params.definition.data)
        ctx.chart.series.push(lineSeries)
        this._groundExportingInfo[layerId + 'y'] = lineSeriesName + ' ' + this.nls('elevationLabel') + ' (' + this.props.selectedElevationUnit + ')'
      }
    }
  }

  /**
   * Get display field alias to display in the csv
   * @param ds current layer dataSource id
   * @returns display field alias if available or the fieldName
   */
  getDisplayFieldAlias = (layerDsId: string, configuredDisplayField: string): string => {
    const ds = DataSourceManager.getInstance().getDataSource(layerDsId)
    const fields = ds?.getSchema()?.fields
    const displayField = fields?.[configuredDisplayField]?.alias || configuredDisplayField
    return displayField
  }

  createPointSeriesForIntersectingLines = (ctx, configuredAssetSetting, seriesName, featureIndex, pathIndex) => {
    //create xy series to show disconnected points
    //we will add the disconnected point with the key <layerId>+'y-point'
    const pointSeries = LineSeriesAm5.new(ctx.chart.root, {
      calculateAggregates: false,
      name: seriesName,
      stroke: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
      valueXField: 'x',
      valueYField: configuredAssetSetting.layerId + 'y-point' + '_' + featureIndex + '_' + pathIndex,
      xAxis: ctx.xAxis,
      yAxis: ctx.yAxis
    })
    const container = ContainerAm5.new(ctx.chart.root, {
      centerX: p50,
      centerY: p50
    })
    container.children.push(RectangleAm5.new(ctx.chart.root, {
      x: p50,
      y: p50,
      width: configuredAssetSetting.style.intersectingAssetSize ? configuredAssetSetting.style.intersectingAssetSize : defaultIntersectingAssetSize,
      height: configuredAssetSetting.style.intersectingAssetSize ? configuredAssetSetting.style.intersectingAssetSize : defaultIntersectingAssetSize,
      fill: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
      stroke: colorAm5(configuredAssetSetting.style.intersectingAssetColor)
    }))
    //for line we will not be showing any bullets
    //for representing the disconnected points we will use the square bullet and it will be of same size of the line
    pointSeries.bullets.push(function (root) {
      return BulletAm5.new(ctx.chart.root, {
        sprite: container
      })
    })
    //hide point series from legend
    this._seriesToBeHiddenInLegend.push(pointSeries.uid)
    pointSeries.data.setAll(ctx.params.definition.data)
    ctx.chart.series.push(pointSeries)
    return pointSeries
  }

  createSeriesForIntersectingLines = (ctx, configuredAssetSetting, seriesName, featureIndex, pathIndex) => {
    const lineSeries = LineSeriesAm5.new(ctx.chart.root, {
      name: seriesName,
      connect: false,
      excludeFromTotal: true,
      stroke: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
      valueXField: 'x',
      valueYField: configuredAssetSetting.layerId + 'y_I' + '_' + featureIndex + '_' + pathIndex,
      xAxis: ctx.xAxis,
      yAxis: ctx.yAxis,
      legendLabelText: '{name}'
    })
    const strokeWidth = configuredAssetSetting.style.intersectingAssetSize ? configuredAssetSetting.style.intersectingAssetSize : 4
    if (configuredAssetSetting.style.intersectingAssetShape === 'dotted-line') {
      lineSeries.strokes.template.setAll({
        strokeWidth: strokeWidth,
        strokeDasharray: [2, 4]
      })
    } else if (configuredAssetSetting.style.intersectingAssetShape === 'dashed-line') {
      lineSeries.strokes.template.setAll({
        strokeWidth: strokeWidth,
        strokeDasharray: [8, 4]
      })
    } else {
      lineSeries.strokes.template.set('strokeWidth', strokeWidth)
    }

    lineSeries.fills.template.setAll({
      visible: true
    })
    lineSeries.data.setAll(ctx.params.definition.data)
    //create xy series to show disconnected points
    //we will add the disconnected point with the key <layerId>+'y-point'
    const pointSeries = this.createPointSeriesForIntersectingLines(ctx, configuredAssetSetting, seriesName, featureIndex, pathIndex)
    //control the visibility of pointSeries with the line series only
    lineSeries.on('visible', function (visible, target) {
      if (visible) {
        pointSeries.show(0)
        lineSeries.show(0)
      } else {
        pointSeries.hide(0)
        lineSeries.hide(0)
      }
    })
    ctx.chart.series.push(lineSeries)
    return lineSeries
  }

  addIntersectingLineSeries = (layerIntersectionInfo: LayerIntersectionInfo, ctx) => {
    //For Line we need create 2 series
    //1. LineSeries - to show the connected lines.
    //2. PointSeries - to show the disconnected points on using bullets
    //   if we use the line series to show disconnected points then we will see the line connected between two consecutive points
    //   to avoid this we will show points using xySeries
    //In legend we will only show line series as it show the configured bullets, and control the visibility of points with the line series
    const seriesName = layerIntersectionInfo?.title
    const configuredAssetSetting = layerIntersectionInfo?.settings
    const allSeriesPerLayer: any = []
    if (configuredAssetSetting && seriesName) {
      layerIntersectionInfo?.intersectionResult.forEach((eachIntersectingFeatureResult, featureIndex) => {
        eachIntersectingFeatureResult.connectedFeatureForProfiling.forEach((connectedFeature: any) => {
          connectedFeature.paths.forEach((eachPath, pathIndex) => {
            const lineSeries = this.createSeriesForIntersectingLines(ctx, configuredAssetSetting, seriesName, featureIndex, pathIndex)
            if (allSeriesPerLayer.length > 0) {
              this._seriesToBeHiddenInLegend.push(lineSeries.uid)
            }
            allSeriesPerLayer.push(lineSeries)
          })
        })
        eachIntersectingFeatureResult.disconnectedFeatureForProfiling.forEach((disconnectedFeatureGeometry, pointIndex) => {
          const pointSeries = this.createSeriesForIntersectingLines(ctx, configuredAssetSetting, seriesName, featureIndex, pointIndex + '_d')
          if (allSeriesPerLayer.length > 0) {
            this._seriesToBeHiddenInLegend.push(pointSeries.uid)
          }
          allSeriesPerLayer.push(pointSeries)
        })
      })
      this._intersectingLayersExportingInfo[configuredAssetSetting.layerId] = {
        xCoordinate: 'X',
        yCoordinate: 'Y',
        x: this.nls('distanceLabel') + ' (' + this.props.selectedLinearUnit + ')',
        intersectingLayerY: this.nls('elevationLabel') + ' (' + this.props.selectedElevationUnit + ')',
        layerName: seriesName,
        intersectingLayerDisplayField: this.getDisplayFieldAlias(configuredAssetSetting.layerId, configuredAssetSetting.displayField)
      }
      allSeriesPerLayer[0]?.on('visible', function (visible) {
        allSeriesPerLayer.forEach((eachFeatureSeries) => {
          visible ? eachFeatureSeries.show(0) : eachFeatureSeries.hide(0)
        })
      })
    }
  }

  addPointSeries = (layerIntersectionInfo: LayerIntersectionInfo, ctx) => {
    //For points we will create 2 series
    //1. PointSeries - to show the points.
    //   If elevation value is to be derived from two field create Column series to show DumbbellPlot
    //   else create xy series
    //2. LineSeries - showing bullets in legends
    //In legend we will only show line series as it show the configured bullets
    const pointSeriesName = layerIntersectionInfo?.title
    const configuredAssetSetting = layerIntersectionInfo?.settings
    const allPointSeriesPerFeature = []
    if (configuredAssetSetting && pointSeriesName) {
      //as we could have multiple features at same x, we need to create individual series for each intersecting feature
      for (let featureIndex = 0; featureIndex < layerIntersectionInfo.intersectionResult.length; featureIndex++) {
        let pointSeries
        //If elevation value is to be derived from two field create Column series to show DumbbellPlot
        if (configuredAssetSetting.elevationSettings.type === 'two') {
          pointSeries = ColumnSeries.new(ctx.chart.root, {
            sequencedInterpolation: false,
            name: pointSeriesName,
            stroke: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
            valueXField: 'x',
            openValueYField: configuredAssetSetting.layerId + featureIndex + 'y',
            valueYField: configuredAssetSetting.layerId + featureIndex + 'y2',
            xAxis: ctx.xAxis,
            yAxis: ctx.yAxis
          })
          //create bullets for dumbbell plot
          //create opening bullet
          const openBullet = this.createBulletsForDumbbellPlotSeries(ctx, pointSeries, configuredAssetSetting)
          openBullet.set('locationY', 1)
          //create the bullet in middle with the configured marker settings
          const middleBullet = this.createBulletsForPointSeries(ctx, pointSeries, configuredAssetSetting)
          middleBullet.set('locationY', 1 / 2)
          //create closing bullet
          const closingBullet = this.createBulletsForDumbbellPlotSeries(ctx, pointSeries, configuredAssetSetting)
          closingBullet.set('locationY', 0)
        } else {
          //Create new line series to show the points
          //in order to see the configured bullet style in legend we need to use Line series
          pointSeries = LineSeriesAm5.new(ctx.chart.root, {
            calculateAggregates: false,
            name: pointSeriesName,
            stroke: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
            valueXField: 'x',
            valueYField: configuredAssetSetting.layerId + featureIndex + 'y',
            xAxis: ctx.xAxis,
            yAxis: ctx.yAxis
          })
          //create bullets for points
          this.createBulletsForPointSeries(ctx, pointSeries, configuredAssetSetting)
        }
        //hide the point series from legend as we will be using line series in legend to show the configured marker and use that series to show/hide the point series
        this._seriesToBeHiddenInLegend.push(pointSeries.uid)
        pointSeries?.data.setAll(ctx.params.definition.data)
        ctx.chart.series.push(pointSeries)
        allPointSeriesPerFeature.push(pointSeries)
      }
      //Create new line series
      //add point in the y and we will not add any data in the key, this will be only for legend
      const lineSeries = LineSeriesAm5.new(ctx.chart.root, {
        name: pointSeriesName,
        connect: false, //as we are using lines set connect to false so that the points will not be shown as connected
        excludeFromTotal: true,
        stroke: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
        valueXField: 'x',
        valueYField: configuredAssetSetting.layerId + 'y-linePoint',
        xAxis: ctx.xAxis,
        yAxis: ctx.yAxis,
        legendLabelText: '{name}'
      })
      //set the stroke opacity so that the horizontal line is not shown in the legend on the bullet marker
      lineSeries.strokes.template.setAll({
        strokeWidth: 1,
        strokeOpacity: 0
      })
      lineSeries.fills.template.setAll({
        visible: true
      })
      lineSeries.data.setAll(ctx.params.definition.data)
      //create bullets for line so that it is shown in legends
      this.createBulletsForPointSeries(ctx, lineSeries, configuredAssetSetting, true)
      lineSeries?.on('visible', function (visible) {
        allPointSeriesPerFeature.forEach((eachFeaturesPointSeries) => {
          visible ? eachFeaturesPointSeries.show(0) : eachFeaturesPointSeries.hide(0)
        })
      })
      lineSeries.data.setAll(ctx.params.definition.data)
      ctx.chart.series.push(lineSeries)

      const configuredDisplayField = this.getDisplayFieldAlias(configuredAssetSetting.layerId, configuredAssetSetting.displayField)
      //create exporting info for the layer
      if (configuredAssetSetting.elevationSettings.type === 'two') {
        this._intersectingLayersExportingInfo[configuredAssetSetting.layerId] = {
          xCoordinate: 'X',
          yCoordinate: 'Y',
          x: this.nls('distanceLabel') + ' (' + this.props.selectedLinearUnit + ')',
          intersectingLayerY: this.nls('oneFieldLabelForExport') + ' ' + this.nls('elevationLabel') + ' (' + this.props.selectedElevationUnit + ')',
          intersectingLayerY2: this.nls('twoFieldLabelForExport') + ' ' + this.nls('elevationLabel') + ' (' + this.props.selectedElevationUnit + ')',
          layerName: pointSeriesName,
          intersectingLayerDisplayField: configuredDisplayField
        }
      } else {
        this._intersectingLayersExportingInfo[configuredAssetSetting.layerId] = {
          xCoordinate: 'X',
          yCoordinate: 'Y',
          x: this.nls('distanceLabel') + ' (' + this.props.selectedLinearUnit + ')',
          intersectingLayerY: this.nls('elevationLabel') + ' (' + this.props.selectedElevationUnit + ')',
          layerName: pointSeriesName,
          intersectingLayerDisplayField: configuredDisplayField
        }
      }
    }
  }

  createBulletsForPointSeries = (ctx, series, configuredAssetSetting, restrictLegendSize?) => {
    //Show the bullets as per configured styles
    let intersectAssetSize = configuredAssetSetting.style.intersectingAssetSize ? configuredAssetSetting.style.intersectingAssetSize : defaultIntersectingAssetSize
    if (restrictLegendSize && intersectAssetSize > 10) {
      intersectAssetSize = 10
    }
    const container = ContainerAm5.new(ctx.chart.root, {
      centerX: p50,
      centerY: p50
    })
    let shape
    switch (configuredAssetSetting.style.intersectingAssetShape) {
      case 'rectangle':
        shape = RectangleAm5.new(ctx.chart.root, {
          x: p50,
          y: p50,
          interactive: true, //required to trigger the state on hover
          width: intersectAssetSize,
          height: (intersectAssetSize) / 2,
          fill: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
          stroke: colorAm5(configuredAssetSetting.style.intersectingAssetColor)
        })
        break
      case 'square':
        shape = RectangleAm5.new(ctx.chart.root, {
          x: p50,
          y: p50,
          interactive: true, //required to trigger the state on hover
          width: intersectAssetSize,
          height: intersectAssetSize,
          fill: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
          stroke: colorAm5(configuredAssetSetting.style.intersectingAssetColor)
        })
        break
      case 'triangle':
        shape = TriangleAm5.new(ctx.chart.root, {
          x: p50,
          y: p50,
          interactive: true, //required to trigger the state on hover
          width: intersectAssetSize,
          height: intersectAssetSize,
          fill: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
          stroke: colorAm5(configuredAssetSetting.style.intersectingAssetColor)
        })
        break
      case 'circle':
      default:
        shape = CircleAm5.new(ctx.chart.root, {
          interactive: true, //required to trigger the state on hover
          radius: intersectAssetSize,
          fill: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
          stroke: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
          x: p50,
          y: p50
        })
    }
    container.children.push(shape)
    shape.states.create('hover', {
      scale: 1.3
    })
    const bullet = BulletAm5.new(ctx.chart.root, { sprite: container })
    series.bullets.push(function () {
      return bullet
    })
    return bullet
  }

  createBulletsForDumbbellPlotSeries = (ctx, series, configuredAssetSetting) => {
    const width = configuredAssetSetting.style.intersectingAssetSize ? configuredAssetSetting.style.intersectingAssetSize : defaultIntersectingAssetSize
    const container = ContainerAm5.new(ctx.chart.root, {
      centerX: p50,
      centerY: p50
    })
    container.children.push(
      RectangleAm5.new(ctx.chart.root, {
        width: configuredAssetSetting.style.intersectingAssetShape === 'circle' ? width * 2 : width + 2,
        height: 1,
        fill: colorAm5(configuredAssetSetting.style.intersectingAssetColor),
        stroke: colorAm5(configuredAssetSetting.style.intersectingAssetColor)
      })
    )
    const bullet = BulletAm5.new(ctx.chart.root, { sprite: container })
    series.bullets.push(function () {
      return bullet
    })
    return bullet
  }

  displayChartLegend = (ctx) => {
    const { chart } = ctx
    //Create legend at the end so that it will be the last element
    const legend = chart.children.push(LegendAm5.new(chart.root, {
      x: this._isRTL ? p100 : p0,
      centerX: this._isRTL ? p100 : p0,
      reverseChildren: this._isRTL,
      visible: this.state.showLegend
    }))

    legend.itemContainers.template.setAll({
      reverseChildren: this._isRTL,
      paddingTop: 5,
      marginBottom: 0,
      paddingBottom: 0
    })

    legend.labels.template.setAll({
      direction: this._isRTL ? 'rtl' : 'ltr',
      textAlign: this._isRTL ? 'end' : 'start',
      paddingRight: this._isRTL ? 5 : 0
    })
    legend.valueLabels.template.set('forceHidden', true)

    //skip the series which needs to be hidden from legend
    const seriesToBeDisplayedInLegend = chart.series.values.filter((eachSeries) => {
      return !this._seriesToBeHiddenInLegend.includes(eachSeries.uid)
    })
    legend.data.setAll(seriesToBeDisplayedInLegend)

    //Add custom funcitonality to legend
    legend.itemContainers.each((itemContainer) => {
      itemContainer.events.on('click', (event) => {
        this.props.toggleLegendSeriesState(event.target.dataItem.dataContext.isHidden(), event.target.dataItem.dataContext.get('id'))
      })
    })
    this._chartLegend = legend
  }

  makeFormatter = (ctx, abbreviation) => {
    const formatter = NumberFormatterAm5.new(ctx.chart.root, {})
    formatter.format = (value: number | string, _format: unknown, precision: number = 2): string => {
      if (typeof value === 'string') {
        return ''
      }
      // Set only a maximum fraction digits and not a minimum because we
      // don't need to display the full precision for the axis labels.
      const formatted = intl.formatNumber(value, { maximumFractionDigits: precision })
      return `${formatted} ${abbreviation}`
    }
    return formatter
  }

  /**
   * Returns a color value for the chart by parsing a theme variable and converting it to the appropriate color format for amCharts.
   * @param colorVar The theme color variable to parse (e.g., a CSS variable or color string).
   * @returns The color value in a format compatible with amCharts.
   */
  getColor = (colorVar) => {
    return colorAm5(colorUtils.parseThemeVariable(colorVar, this.props.theme))
  }

  render () {
    return (<React.Fragment>
      {this.state && this.state.chartDefinition &&
        <div tabIndex={-1} className={'w-100 h-100 p-2'}>
          <div tabIndex={0} aria-label={this.nls('chartRender')} className={'w-100 h-100'} ref={this._chartContainer}></div>
        </div>
      }
    </React.Fragment>
    )
  }
}
