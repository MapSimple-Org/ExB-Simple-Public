/** @jsx jsx */
import {
  React,
  jsx,
  type ImmutableArray,
  type DataSource,
  type IntlShape,
} from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { DataSourceManager } from '../data-source/data-source-manager'
import { RoutePicker } from './route-picker'
import { colorGreen } from '../constants'
import { isDefined, type RouteInfo, getGeometryGraphic, getSimpleLineGraphic, getSimplePointGraphic, type LrsLayer, type NetworkInfo, type AttributeSets, type DefaultInfo } from 'widgets/shared-code/lrs'
import { RoutePickerPopup } from './route-picker-popup'
import { getDataRecord } from '../utils/service-utils'
import type { HighlightStyle } from '../../config'

export interface IdentifyRouteProps {
  intl: IntlShape
  widgetId: string
  lrsLayers: ImmutableArray<LrsLayer>
  JimuMapView: JimuMapView
  defaultShowPp: boolean
  hoverGraphic: GraphicsLayer
  highlightStyle: HighlightStyle
  defaultPointAttributeSet: string
  defaultLineAttributeSet: string
  attributeSets: AttributeSets
  lineEventToggle: boolean
  pointEventToggle: boolean
  defaultNetwork: DefaultInfo
  lrsControllerToggled: string
  onClearFlashGraphics: () => void
  onClearPickedGraphics: () => void
  onUpdateGraphics: (graphic: __esri.Graphic) => void
  flashSelectedGeometry: (graphic: __esri.Graphic) => void
}

export function IdentifyRoute (props: IdentifyRouteProps) {
  const {
    widgetId,
    intl,
    lrsLayers,
    JimuMapView,
    defaultShowPp,
    hoverGraphic,
    highlightStyle,
    defaultPointAttributeSet,
    defaultLineAttributeSet,
    attributeSets,
    lineEventToggle,
    pointEventToggle,
    defaultNetwork,
    lrsControllerToggled,
    onClearFlashGraphics,
    onClearPickedGraphics,
    onUpdateGraphics,
    flashSelectedGeometry
  } = props

  const [isDSReady, setIsDSReady] = React.useState<boolean>(false)
  const [isNetworkChange, setIsNetworkChange] = React.useState<boolean>(false)
  const [outputPointDS, setPointOutputDS] = React.useState(null)
  const [selectedNetwork, setSelectedNetwork] = React.useState<NetworkInfo>(null)
  const [defaultRouteDetails, setDefaultRouteDetails] = React.useState(null)
  const [allDataSources, setDataSources] = React.useState<DataSource[]>(null)
  const [selectedPoint, setSelectedPoint] = React.useState<__esri.Point>(null)
  const [routeDetails, setRouteDetals] = React.useState<any[]>(null)
  const [eventDetails, setEventDetails] = React.useState<any[]>(null)
  const [isRoutePickerActive, setIsRoutePickerActive] = React.useState<boolean>(false)
  const [controllerToggle, setControllerToggle] = React.useState<string>(lrsControllerToggled)
  const [results, setAllDataRecords] = React.useState<any[]>(null)
  const [showPp, setShowPp] = React.useState<boolean>(true)
  const [measuresOids, setMeasuresOids] = React.useState(null)
  const eventDataRecords = []

  React.useEffect(() => {
    if (lrsLayers && lrsLayers.length > 0) {
      const selectedNetwork = lrsLayers?.find(layer => layer?.name === defaultNetwork?.name)
      if (selectedNetwork && selectedNetwork?.networkInfo) {
        setSelectedNetwork(selectedNetwork?.networkInfo)
      }
    }
  }, [defaultNetwork, lrsLayers])

  React.useEffect(() => {
    if (controllerToggle !== lrsControllerToggled) {
      handleRoutePickerChange()
      setControllerToggle(lrsControllerToggled)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lrsControllerToggled])

  React.useEffect(() => {
    setShowPp(false)
    onClearPickedGraphics()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lrsLayers])

  React.useEffect(() => {
    if (!JimuMapView?.view || !isRoutePickerActive) return

    // Prevent default map click behavior when route picker is active.
    const handler = (event) => {
      event.stopPropagation?.()
      event.preventDefault?.()
    }
    const clickHandle = JimuMapView.view.on('click', handler)
    return () => {
      clickHandle?.remove()
    }
  }, [JimuMapView, isRoutePickerActive])

  const handleDataSourcesReady = React.useCallback((value: boolean) => {
    setIsDSReady(value)
  }, [setIsDSReady])

  const handleSetDataSources = React.useCallback((ds: DataSource[]) => {
    setDataSources(ds)
  }, [setDataSources])

  const handlePointDsCreated = (ds: DataSource) => {
    setPointOutputDS(ds)
  }

  const handleSelectedNetworkChange = (network: LrsLayer, isNetworkChange?: boolean) => {
    const networkItem = lrsLayers.find(layer => layer?.layerInfo?.serviceId === network?.id)
    const match = routeDetails.find(info => info.id === network?.id)

    setDefaultRouteDetails(match)
    setSelectedNetwork(networkItem?.networkInfo)
    setIsNetworkChange(isNetworkChange)
  }

  // Update routeInfo state changes.
  const handleRouteInfoUpdate = async (newRouteInfo: RouteInfo, flash: boolean = false) => {
    const routeColor = highlightStyle.routeColor
    const routeWidth = highlightStyle.width
    if (isDefined(newRouteInfo.selectedPolyline) && flash) {
      flashSelectedGeometry(await getGeometryGraphic(await getSimpleLineGraphic(newRouteInfo.selectedPolyline), routeColor, routeWidth))
    }
    if (isDefined(newRouteInfo.selectedPoint)) {
      onUpdateGraphics(await getGeometryGraphic(await getSimplePointGraphic(newRouteInfo.selectedPoint), colorGreen))
    } else {
      onClearPickedGraphics()
    }
    JimuMapView.clearSelectedFeatures()
  }

  const handleRoutePickerChange = () => {
    const isPickerActive = !isRoutePickerActive
    setIsRoutePickerActive(isPickerActive)
    if (isPickerActive) {
      if (JimuMapView?.view?.popupEnabled) JimuMapView.view.popupEnabled = false
      onClearFlashGraphics()
      onClearPickedGraphics()
    } else {
      JimuMapView.view.popupEnabled = defaultShowPp
    }
  }

  const getDefaultNetwork = (routeDetails) => {
    let defaultNet = routeDetails.find((route) => defaultNetwork.name === route?.layerName)
    if (!defaultNet) defaultNet = routeDetails[0]
    const networkItem = lrsLayers.find(layer => layer?.layerInfo?.serviceId === defaultNet?.id)
    setDefaultRouteDetails(defaultNet)
    setSelectedNetwork(networkItem?.networkInfo)
    setIsNetworkChange(false)
  }

  const updateSelectedPoint = (selectedPoint: __esri.Point) => {
    setSelectedPoint(selectedPoint)
  }

  const updateRouteDetails = async (routeDetails) => {
    const promises = []
    const measureOids = {}


    routeDetails.forEach((routeDetail) => {
      const objectIds = []
      routeDetail?.routes?.forEach((route) => {
        route?.timeDependedInfo?.forEach((info) => {
          const id = info?.objectId
          objectIds.push(id)
          measureOids[id] = info?.selectedMeasures?.[0]
        })
      })
      promises.push(getDataRecord(objectIds, routeDetail?.routes?.[0]?.objectIdFieldName,
        routeDetail?.routes?.[0]?.featureDS))
    })
    const results = await Promise.all(promises)
    setMeasuresOids(measureOids)
    setAllDataRecords(results)
    // set the default network when clicked on new location in the map
    getDefaultNetwork(routeDetails)
    setRouteDetals(routeDetails)
  }

  const updateEventDetails = (eventDetails) => {
    setEventDetails(eventDetails)
  }

  const handleShowPp = (val) => {
    setShowPp(val)
  }

  return (
    <div>
      <DataSourceManager
        widgetId={widgetId}
        selectedNetwork={selectedNetwork}
        onCreatePointDs={handlePointDsCreated}
        lrsLayers={lrsLayers}
        dataSourcesReady={handleDataSourcesReady}
        handleSetDataSources={handleSetDataSources}
      />
      <RoutePicker
        intl={intl}
        isReady={isDSReady}
        active={isRoutePickerActive}
        allDataSources={allDataSources}
        lrsLayers={lrsLayers}
        jimuMapView={JimuMapView}
        symbolColor={null}
        hoverGraphic={hoverGraphic}
        onActiveChange={handleRoutePickerChange}
        onRouteInfoUpdated={handleRouteInfoUpdate}
        clearPickedGraphic={onClearPickedGraphics}
        clearFlashGraphic={onClearFlashGraphics}
        setSelectedPoint={updateSelectedPoint}
        setRouteDetails={updateRouteDetails}
        setEventDetails={updateEventDetails}
        eventDataRecords={eventDataRecords}
        defaultLineAttributeSet={defaultLineAttributeSet}
        defaultPointAttributeSet={defaultPointAttributeSet}
        attributeSets={attributeSets}
        handleShowPp={handleShowPp}
        />
      { routeDetails && (routeDetails.length > 0) && (results.length > 0) && showPp && (<RoutePickerPopup
        intl={intl}
        lrsLayers={lrsLayers}
        allDataSources={allDataSources}
        selectedPoint={selectedPoint}
        eventDetails={eventDetails}
        jimuMapView={JimuMapView}
        onRouteInfoUpdated={handleRouteInfoUpdate}
        clearPickedGraphic={onClearPickedGraphics}
        pointEventToggle={pointEventToggle}
        lineEventToggle={lineEventToggle}
        isNetworkChange={isNetworkChange}
        widgetId={widgetId}
        outputDS={outputPointDS}
        dataRecords={results}
        measuresOids={measuresOids}
        selectedLocationInfo={defaultRouteDetails || routeDetails[0]}
        networkLayers={routeDetails}
        handleSelectedNetworkChange={handleSelectedNetworkChange}
      />)}
  </div>
  )
}
