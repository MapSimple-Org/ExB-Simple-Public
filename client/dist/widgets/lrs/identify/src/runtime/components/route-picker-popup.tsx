/** @jsx jsx */
import {
  React,
  ReactRedux,
  type IMState,
  type DataRecord,
  hooks,
  jsx,
  type DataRecordSet,
  DataSourceStatus,
  DataRecordSetChangeMessage,
  MessageManager,
  RecordSetChangeType,
  type IntlShape,
  type DataSource,
  type FeatureLayerDataSource,
  type ImmutableArray
} from 'jimu-core'
import {
  type ControlPosition, FloatingPanel, type Size, Select, Label, Pagination, CollapsablePanel,
  DataActionList, DataActionListStyle
} from 'jimu-ui'
import { CalciteTable, CalciteTableRow, CalciteTableHeader, CalciteTableCell } from 'calcite-components'
import type { TimeInfo, LocationInfo } from '../../config'
import type { JimuMapView } from 'jimu-arcgis'
import defaultMessage from '../translations/default'
import { type RouteInfo, getDateWithTZOffset, isDefined, formatMessage, getCalciteBasicTheme, type NetworkInfo, measureFields, type LrsLayer } from 'widgets/shared-code/lrs'
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import type { IFieldInfo } from '@esri/arcgis-rest-feature-service'
import Graphic from 'esri/Graphic'

export interface RoutePickerPopupProps {
  intl: IntlShape
  lrsLayers: ImmutableArray<LrsLayer>
  networkLayers
  isNetworkChange: boolean
  widgetId: string
  outputDS: FeatureLayerDataSource
  selectedLocationInfo: any
  eventDetails: any
  jimuMapView: JimuMapView
  allDataSources: DataSource[]
  dataRecords: DataRecord[]
  measuresOids: any
  selectedPoint: __esri.Point
  lineEventToggle,
  pointEventToggle,
  clearPickedGraphic: () => void
  onRouteInfoUpdated: (updatedRouteInfo: RouteInfo, flash?: boolean) => void
  handleSelectedNetworkChange: (network, isNetworkChange: boolean) => void
}

export function RoutePickerPopup (props: RoutePickerPopupProps) {
  const {
    intl, lrsLayers, widgetId, outputDS, networkLayers, selectedLocationInfo, eventDetails, jimuMapView, allDataSources, measuresOids,
    isNetworkChange, selectedPoint, lineEventToggle, pointEventToggle, onRouteInfoUpdated, clearPickedGraphic, handleSelectedNetworkChange
  } = props
  const routePickerSelection = React.useRef<LocationInfo>(null)
  const [showPp, setShowPopup] = React.useState(true)
  const [windowLocation, setWindowLocation] = React.useState<ControlPosition>({ x: 0, y: 0 })
  const [size, setSize] = React.useState<Size>({ width: 400, height: 500 })
  const [selectedNetwork, setSelectedNetwork] = React.useState<NetworkInfo>(null)
  const [selectedRoutes, setSelectedRoutes] = React.useState<LocationInfo[]>()
  const [selectedTimeInfo, setSelectedTimeInfo] = React.useState<TimeInfo>()
  const [routeCount, setSelectedRouteCount] = React.useState<number>(0)
  const [allDataRecords, setDataRecords] = React.useState<DataRecord[]>(null)
  const [selectedDataRecord, setSelectedDataRecord] = React.useState<DataRecord>(null)
  const [networkIdResult, setNetworkEventObjectIds] = React.useState(null)
  const route = selectedRoutes && selectedRoutes?.[routeCount]
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const offsetPx = 16

  React.useEffect(() => {
    const defaultNetwork = selectedLocationInfo
    const mapPoint = jimuMapView?.view.toScreen(defaultNetwork.routes[0].selectedPoint)

    if (selectedLocationInfo) {
      setShowPopup(true)
      routePickerSelection.current = defaultNetwork
      if (mapPoint && !isNetworkChange) {
        const newLocation = windowLocation
        newLocation.x = mapPoint.x + offsetPx
        newLocation.y = mapPoint.y + offsetPx
        const info = _calculateAlignmentPosition(mapPoint.x, mapPoint.y, jimuMapView?.view)
        if (info) {
          newLocation.x = info.x + offsetPx
          newLocation.y = info.y + offsetPx
        }
        setWindowLocation(newLocation)
      }
    }


    const fetchDataRecord = () => {
      const objectIdFieldName = selectedLocationInfo?.routes?.[0]?.objectIdFieldName
      try {
        const results = props.dataRecords
        const networkIdResults = []
        results.forEach((result, i) => {
          const networkId = networkLayers[i]?.id
          networkIdResults[networkId] = result
        })
        setNetworkEventObjectIds(networkIdResults)

        const defaultRoutes = [].concat.apply([], networkIdResults[selectedLocationInfo?.id])
        const newDataRecords = []
        outputDS && defaultRoutes?.forEach((ele) => {
          const measure = measuresOids[ele?.feature?.attributes[objectIdFieldName]]
          const ft = getPointFromPolyline(mapPoint, ele?.feature?.attributes, measure)
          const rec = outputDS?.buildRecord(ft)
          newDataRecords.push(rec)
        })

        const id = selectedLocationInfo?.routes?.[0]?.timeDependedInfo?.[0].objectId
        const measure = selectedLocationInfo?.routes?.[0]?.timeDependedInfo?.[0]?.selectedMeasures[0]
        setDataRecords([].concat.apply([], results))

        const selectedRecord = getDataRecordFromObjId(defaultRoutes, id, objectIdFieldName)
        const ft = getPointFromPolyline(mapPoint, selectedRecord?.feature?.attributes, measure)
        const record = outputDS?.buildRecord(ft)
        setSelectedDataRecord(record)
        setRecordsToDs(newDataRecords, record, id)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchDataRecord()
    setSelectedRouteCount(0)
    setSelectedNetwork(defaultNetwork)
    handleSelectedNetworkChange(defaultNetwork, false)
    setSelectedRoutes(defaultNetwork?.routes)
    setSelectedTimeInfo(defaultNetwork?.routes?.[0]?.timeDependedInfo?.[0])
    onRouteInfoUpdated(defaultNetwork?.routes?.[0], true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jimuMapView?.view, selectedLocationInfo, networkLayers, outputDS])

  const getPointFromPolyline = (mapPoint, attributes, measure?) => {
    if (measure) attributes[measureFields.at(0).value] = measure
    const feature = new Graphic({
      geometry: selectedPoint,
      attributes: attributes
    })
    return feature
  }

  const clearDs = () => {
    outputDS?.clearRecords()
    outputDS?.clearSelection()
    outputDS?.setCountStatus(DataSourceStatus.NotReady)
    outputDS?.setStatus(DataSourceStatus.NotReady)
  }

  const setRecordsToDs = (newDataRecords, selectedRecord, id) => {
    clearDs()
    outputDS?.setStatus(DataSourceStatus.Unloaded)
    outputDS?.setCountStatus(DataSourceStatus.Unloaded)
    outputDS?.setSourceRecords(newDataRecords)
    outputDS?.setRecords(newDataRecords)
    outputDS?.selectRecordById(id)
    publishMessage(outputDS, widgetId)
  }

  const getDataRecordFromObjId = (records, objectId, objectIdFieldName) => {
    for (let i = 0; i < records?.length; i++) {
      const id = records[i].getData()[objectIdFieldName]
      if (id === objectId) {
        return records[i]
      }
    }
  }

  // Checks if data action is enabled.
  const enableDataAction = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.enableDataAction ?? true
  })

  // Sets the data action record set for the current page or selection.
  const actionDataSet: DataRecordSet = React.useMemo(() => {
    return {
      dataSource: outputDS,
      type: 'selected',
      records: [selectedDataRecord],
      name: selectedNetwork?.layerName
    }
  }, [outputDS, selectedDataRecord, selectedNetwork])

  const publishMessage = (outputDS: FeatureLayerDataSource, widgetId: string) => {
    if (!outputDS) { return }
    const originDs: FeatureLayerDataSource = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
    const popupInfo = originDs.getPopupInfo()
    const layerDefinition = originDs.getLayerDefinition()
    const getDefaultFieldInfos = () =>
      [
        { fieldName: layerDefinition?.objectIdField ?? 'objectid', label: 'OBJECTID', tooltip: '', visible: true }
      ] as IFieldInfo[]
    const fieldInfos = ((fieldInfos) => (fieldInfos.length ? fieldInfos : getDefaultFieldInfos()))(
      (popupInfo?.fieldInfos || []).filter((i) => i.visible)
    )

    const dataRecordSetChangeMessage = new DataRecordSetChangeMessage(widgetId, RecordSetChangeType.CreateUpdate, [{
      records: outputDS.getRecords(),
      fields: fieldInfos.map((fieldInfo) => fieldInfo.fieldName),
      dataSource: outputDS,
      name: outputDS.id
    }])

    MessageManager.getInstance().publishMessage(dataRecordSetChangeMessage)
  }

  const _calculateAlignmentPosition = (
    x: number,
    y: number,
    view: any
  ): any => {
    if (!view) {
      return undefined
    }

    const popupWidth = size.width
    const popupHeight = size.height
    const isFullyVisible = x >= 0 && y >= 0 &&
        (x + popupWidth) <= window.innerWidth &&
        (y + popupHeight) <= window.innerHeight

    if (!isFullyVisible) {
      // Adjust x-coordinate if the popup is going beyond the right edge of the viewport
      if (x + popupWidth > window.innerWidth) {
        x = window.innerWidth - popupWidth
      }

      // Adjust y-coordinate if the popup is going beyond the bottom edge of the viewport
      if (y + popupHeight > window.innerHeight) {
        y = window.innerHeight - popupHeight
      }

      // Adjust x-coordinate if the popup is going beyond the left edge of the viewport
      if (x < 0) {
        x = 0
      }

      // Adjust y-coordinate if the popup is going beyond the top edge of the viewport
      if (y < 0) {
        y = 0
      }
      return { x: x, y: y }
    }
    return null
  }

  const handleNetworkChange = React.useCallback((event) => {
    const id = event?.target?.value
    const info = networkLayers?.find((layer) => layer.id === id)
    const match = networkIdResult[id]

    networkLayers?.forEach((routeInfo, index) => {
      if (routeInfo?.id === id) {
        const objectId = routeInfo?.routes?.[0]?.timeDependedInfo?.[0]?.objectId
        const measure = routeInfo?.routes?.[0]?.timeDependedInfo?.[0]?.selectedMeasure?.[0]
        const objectIdFieldName = routeInfo?.routes?.[0]?.objectIdFieldName
        const data = getDataRecordFromObjId(allDataRecords, objectId, objectIdFieldName)
        const ft = getPointFromPolyline(jimuMapView?.view.toScreen(routeInfo?.routes[0].selectedPoint), data?.feature?.attributes, measure)
        const record = outputDS?.buildRecord(ft)

        setSelectedNetwork(info)
        handleSelectedNetworkChange(info, true)
        setSelectedRoutes(routeInfo?.routes)
        setSelectedTimeInfo(routeInfo?.routes?.[0]?.timeDependedInfo?.[0])
        setSelectedRouteCount(0)
        onRouteInfoUpdated(routeInfo?.routes?.[0], true)
        setSelectedDataRecord(record)

        const matchResults = [].concat.apply([], match)
        const newDataRecords = []
        const mapPoint = jimuMapView?.view.toScreen(selectedLocationInfo.routes[0].selectedPoint)

        outputDS && matchResults?.forEach((ele) => {
          const measure = measuresOids[ele?.feature?.attributes[objectIdFieldName]]
          const ft = getPointFromPolyline(mapPoint, ele?.feature?.attributes, measure)
          const rec = outputDS?.buildRecord(ft)
          newDataRecords.push(rec)
        })
        setRecordsToDs(newDataRecords, record, id)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDataRecords, handleSelectedNetworkChange, networkIdResult, onRouteInfoUpdated, outputDS, selectedLocationInfo, widgetId])

  const handleTimeChange = (event) => {
    const timeDependedInfo = event?.target?.value
    setSelectedTimeInfo(timeDependedInfo)

    // support for data actions on time slice change
    const objectId = timeDependedInfo?.objectId
    const objectIdFieldName = selectedLocationInfo?.routes?.[routeCount]?.objectIdFieldName

    const data = getDataRecordFromObjId(allDataRecords, objectId, objectIdFieldName)
    const measure = timeDependedInfo?.selectedMeasures?.[0]
    const ft = getPointFromPolyline(jimuMapView?.view.toScreen(selectedLocationInfo?.routes[routeCount].selectedPoint),
      data?.feature?.attributes, measure)
    const record = outputDS?.buildRecord(ft)
    setSelectedDataRecord(record)
  }

  const handleSelectionCancel = () => {
    clearPickedGraphic()
    setShowPopup(false)
  }

  const handleDrag = React.useCallback((position: ControlPosition) => {
    setWindowLocation(position)
  }, [])

  const handleResize = React.useCallback((size: Size, position: ControlPosition) => {
    setSize(size)
    setWindowLocation(position)
  }, [])

  const getCodedValueLabel = (fieldName, value, fieldInfos) => {
    const fieldMatch = fieldInfos?.find(info => info.name === fieldName)
    if (isDefined(fieldMatch) && isDefined(fieldMatch.domain) && fieldMatch.domain.type === 'coded-value') {
      const codedVals = fieldMatch.domain.codedValues
      const match = codedVals.find(c => {
        if (typeof c.code === 'string' && typeof value === 'string') {
          return c.code.toLowerCase() === value.toLowerCase()
        } else {
          return c.code === value
        }
      })

      if (match) {
        return `${match.code} - ${match.name}`
      }
    }
  }

  const getAttributeValueTable = (attributes, fieldInfos, route) => {
    if (!selectedNetwork) return
    const routeIdFieldName = route?.routeIdFieldName
    const routeNameFieldName = route?.routeNameFieldName
    const excludeFields = [routeIdFieldName, routeNameFieldName]
    const configFields = selectedNetwork ? selectedNetwork.configFields : null
    const useFieldAlias = selectedNetwork ? selectedNetwork.useFieldAlias : null
    const tableRows = []
    if ((configFields?.length > 0) && attributes) {
      configFields.forEach((field) => {
        const enabled = field?.enabled
        let fieldName = field?.field?.name
        if (enabled && (!excludeFields.includes(fieldName))) {
          const codeValueLabel = getCodedValueLabel(fieldName, attributes[field?.field?.name], fieldInfos)
          if (useFieldAlias) fieldName = field?.field?.alias
          const fieldType = field?.field?.type
          let val
          if (!codeValueLabel) {
            val = attributes[field?.field?.name]
            if (fieldType?.toLowerCase() === 'date') {
              val = isDefined(val) ? getDateWithTZOffset(val, selectedNetwork.routes[routeCount].ds).toLocaleDateString() : null
            }
          } else val = codeValueLabel
          if (fieldName) tableRows.push({ name: fieldName, val: val })
        }
      })
    }
    return tableRows
  }

  const getDataSource = (layer: FeatureLayer) => {
    const match = allDataSources.find(ds => (ds as FeatureLayerDataSource)?.getLayerDefinition?.()?.id === layer?.layerId)
    return match
  }

  const sort = () => {
    eventDetails.sort((a, b) => {
      const attrA = a?.attributes
      const attrB = b?.attributes
      const dateA = attrA[a.fromDate]
      const dateB = attrB[b.fromDate]
      return dateA - dateB
    })
  }

  const getAttributeValueTableEvents = (type: string) => {
    if (!selectedNetwork) return
    const maxDate = 8640000000000000
    const minDate = -8640000000000000

    const tablesDiv = []
    const networkId = selectedNetwork?.networkId
    const networkFromDt = selectedTimeInfo?.fromDate !== null ? selectedTimeInfo?.fromDate : minDate
    const networkToDt = selectedTimeInfo?.toDate !== null ? selectedTimeInfo?.toDate : maxDate
    // sort the events on fromDate
    sort()
    eventDetails?.forEach((event) => {
      const fieldInfos = event?.fieldInfos
      const attributes = event?.attributes
      const fromDt = event?.fromDate
      const toDt = event?.toDate
      const eventRouteId = attributes[event?.routeIdFieldName]
      const fromDtEpoch = attributes[fromDt]
      const fromDate = isDefined(fromDtEpoch) ? getDateWithTZOffset(fromDtEpoch, selectedNetwork.routes[routeCount].ds).toLocaleDateString() : getI18nMessage('nullStr')
      const toDateEpoch = attributes[toDt]
      const toDate = isDefined(toDateEpoch) ? getDateWithTZOffset(toDateEpoch, selectedNetwork.routes[routeCount].ds).toLocaleDateString() : getI18nMessage('nullStr')
      let defaultAttributeSet = event?.defaultLineAttributeSet
      if (type === 'point') defaultAttributeSet = event?.defaultPointAttributeSet
      let isPassCheck = false

      if (event?.parentNetworkId === networkId) {
        // check if it is a spanning line event
        if (type === 'line' && selectedNetwork && selectedRoutes[routeCount]?.supportsLines && event?.canSpanRoutes) {
          const recordRouteIdName = selectedNetwork?.routes?.[routeCount]?.routeIdFieldName
          const eventRouteIdName = event.routeIdFieldName
          const eventToRouteIdName = event.toRouteIdFieldName
          const orderIdName = selectedNetwork?.routes?.[routeCount]?.lineOrderFieldName
          const records = selectedNetwork?.routes?.[routeCount]?.records?.records
          if (records) {
            const networkOrderId = selectedTimeInfo?.attributes[orderIdName]
            const fromRoute = records.find(item => item.feature.attributes[recordRouteIdName] === event.attributes[eventRouteIdName])
            const toRoute = records.find(item => item.feature.attributes[recordRouteIdName] === event.attributes[eventToRouteIdName])
            if (toRoute && (toRoute.feature.attributes[orderIdName] >= networkOrderId) && (networkOrderId >= (fromRoute.feature.attributes[orderIdName]))) {
              isPassCheck = true
            }
          }
        } else {
          if ((event?.parentNetworkId === networkId) && (selectedRoutes[routeCount]?.routeId === eventRouteId)) {
            isPassCheck = true
          }
        }
      }

      // display event details for events on the selected route
      if (isPassCheck) {
        const validAttributeSet = event.attributeSets?.attributeSet.find(obj => obj.title === defaultAttributeSet)
        const layers = validAttributeSet?.layers

        layers?.forEach((layer) => {
          const tableRows = []
          const lrsLayerInfo = lrsLayers.find(l => l.serviceId === layer.layerId)
          const layerName = isDefined(lrsLayerInfo) ? lrsLayerInfo.name : layer?.layerName
          const featureLayerDS = getDataSource(layer) as FeatureLayerDataSource
          if (!featureLayerDS) { /* if layer is removed don't use it */ } else {
            const featureLayer = featureLayerDS?.layer
            const featureLayerFields = featureLayer.fields
            const eventFromDt = attributes[fromDt] !== null ? attributes[fromDt] : minDate
            const eventToDt = attributes[toDt] !== null ? attributes[toDt] : maxDate
            if ((layer?.layerId === event.eventLayerId) && (
              // @ts-expect-error
              ((networkFromDt <= eventFromDt <= networkToDt) || (networkFromDt <= eventToDt <= networkToDt))
            )) {
              const fields = layer?.fields
              fields.forEach((field) => {
                const match = featureLayerFields.find(l => l.name === field.name)
                const fieldName = field?.name
                const fieldType = match?.type
                const codeValueLabel = getCodedValueLabel(fieldName, attributes[fieldName], fieldInfos)
                let val
                if (!codeValueLabel) {
                  val = attributes[fieldName]
                } else val = codeValueLabel
                if (fieldType?.toLowerCase() === 'date') {
                  val = isDefined(val) ? getDateWithTZOffset(val, selectedNetwork.routes[routeCount].ds).toLocaleDateString() : null
                }
                tableRows.push({ name: fieldName, val: val, layerName: layerName, fromDate: fromDate, toDate: toDate })
              })
              tablesDiv.push(createEventsTable(tableRows))
              tablesDiv.push(addPadding())
            }
          }
        })
      }
    })
    return tablesDiv
  }

  const addPadding = () => {
    return (
      <div style={{ paddingTop: '0.5rem' }}></div>
    )
  }

  const createEventsTable = (attributeVals) => {
    const fromDate = attributeVals?.[0]?.fromDate
    const toDate = attributeVals?.[0]?.toDate
    // to-do add string to translations
    const label = attributeVals?.[0]?.layerName + ' (' + fromDate + ' - ' + toDate + ')'
    const eventDetailsDiv = (
      <CollapsablePanel
        label={label}
        level={0}
        type="default"
    >
      <CalciteTable
        className='w-100 h-100'
        caption={getI18nMessage('routePicker')}
        bordered
        scale='s'
        layout='fixed'
      >
        <CalciteTableRow>
          <CalciteTableHeader heading={formatMessage(intl, 'attribute')}></CalciteTableHeader>
          <CalciteTableHeader heading={formatMessage(intl, 'value')}></CalciteTableHeader>
        </CalciteTableRow>
        {attributeVals?.map((val, index) => {
          return (<CalciteTableRow key={index}>
            <CalciteTableCell>
            {val.name}
            </CalciteTableCell>
            <CalciteTableCell>
            {val.val}
            </CalciteTableCell>
          </CalciteTableRow>)
        })}
      </CalciteTable>
    </CollapsablePanel>
    )
    return eventDetailsDiv
  }

  const getNextRouteDetails = (val) => {
    clearPickedGraphic()
    const count = val - 1
    const objectId = selectedLocationInfo?.routes?.[count]?.timeDependedInfo?.[0]?.objectId
    const objectIdFieldName = selectedLocationInfo?.routes?.[0]?.objectIdFieldName

    const data = getDataRecordFromObjId(allDataRecords, objectId, objectIdFieldName)
    const measure = selectedLocationInfo?.routes?.[count]?.timeDependedInfo?.[0]?.selectedMeasures?.[0]
    const ft = getPointFromPolyline(jimuMapView?.view.toScreen(selectedLocationInfo?.routes[count].selectedPoint),
      data?.feature?.attributes, measure)
    const record = outputDS?.buildRecord(ft)

    setSelectedRouteCount(count)
    setSelectedTimeInfo(selectedLocationInfo?.routes?.[count]?.timeDependedInfo?.[0])
    setSelectedDataRecord(record)
    onRouteInfoUpdated(selectedLocationInfo?.routes?.[count], true)
  }

  const renderTimeDropdown = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: '30%' }}>
          <Label className='label2'>
            {getI18nMessage('dateStr')}
          </Label>
        </div>
        <div>
          {/*// @ts-expect-error */}
          <Select size='sm' value={selectedTimeInfo} onChange={(event) => { handleTimeChange(event) }}>
            {route?.timeDependedInfo?.map((info: any, i) =>
            //@ts-expect-error
              <Option key={i} title={info.fromDate}
                value={info} label={info.fromDate}>
                  <span>{isDefined(info.fromDate) ? getDateWithTZOffset(info.fromDate, selectedNetwork.routes[routeCount].ds).toLocaleDateString() : getI18nMessage('nullStr')}</span>
                  <span style={{ paddingLeft: '0.3rem', paddingRight: '0.3rem' }}>{getI18nMessage('toStr')}</span>
                  <span>{isDefined(info.toDate) ? getDateWithTZOffset(info.toDate, selectedNetwork.routes[routeCount].ds).toLocaleDateString() : getI18nMessage('nullStr')}</span>
              </Option>
            )}
          </Select>
        </div>
    </div>
    )
  }

  const renderAttrValTable = (attributeVals) => {
    return (
      <CalciteTable
        className='w-100 h-100'
        caption={getI18nMessage('routePicker')}
        bordered
        scale='s'
        layout='fixed'
      >
        <CalciteTableRow slot='table-header'>
          <CalciteTableHeader heading={formatMessage(intl, 'attribute')}></CalciteTableHeader>
          <CalciteTableHeader heading={formatMessage(intl, 'value')}></CalciteTableHeader>
        </CalciteTableRow>
        {attributeVals?.map((val, index) => {
          return (
            <CalciteTableRow key={index}>
              <CalciteTableCell>
              {val.name}
              </CalciteTableCell>
              <CalciteTableCell>
              {val.val}
              </CalciteTableCell>
            </CalciteTableRow>
          )
        })}
      </CalciteTable>
    )
  }

  const renderAttrValTableEvents = (type: string) => {
    return getAttributeValueTableEvents(type)
  }

  const renderSelectedMeasure = () => {
    const measures = selectedTimeInfo?.selectedMeasures
    const measureDiv = []
    for (let i = 1; i < measures.length; i++) {
      measureDiv.push(
        <div style={{ display: 'flex', flexDirection: 'row', paddingBottom: '0.5rem' }}>
          <div style={{ width: '30%' }}></div>
            <span>{measures[i]}</span>
            <span style={{ paddingLeft: '0.2rem' }}>{selectedRoutes[routeCount].measureUnit}</span>
          </div>
      )
    }
    return measureDiv
  }

  const renderRouteDetails = (route) => {
    const attributeVals = getAttributeValueTable(selectedTimeInfo?.attributes, route?.fieldInfos, route)
    const lineEvents = renderAttrValTableEvents('line')
    const pointEvents = renderAttrValTableEvents('point')

    const routeDetailsDiv = (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {route.routeId && (
            <div style={{ display: 'flex', flexDirection: 'row', paddingTop: '0.5rem' }}>
              <div style={{ width: '30%', flex: 'none' }}>
                <Label className='label2'>
                {getI18nMessage('routeId')}
                </Label>
              </div>
              <div title={route.routeId} style = {{ width: 'fitContent', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {route.routeId}
              </div>
          </div>
          )}
          {route.routeName && (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '30%' }}>
              <Label className='label2'>
              {getI18nMessage('routeName')}
              </Label>
            </div>
            <div>
              {route.routeName}
            </div>
          </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '30%' }}>
              <Label className='label2'>
              {getI18nMessage('measureLabel')}
              </Label>
            </div>
            <div>
              <span>{selectedTimeInfo.selectedMeasures?.[0]}</span>
              <span style={{ paddingLeft: '0.2rem' }}>{selectedRoutes[routeCount].measureUnit}</span>
            </div>
          </div>
          {selectedTimeInfo.selectedMeasures?.length > 1 && (
            renderSelectedMeasure()
          )}
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '30%' }}>
              <Label className='label2'>
                {getI18nMessage('startMeasure')}
              </Label>
            </div>
            <div>
              <span>{selectedTimeInfo.fromMeasure}</span>
              <span style={{ paddingLeft: '0.2rem' }}>{selectedRoutes[routeCount].measureUnit}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '30%' }}>
              <Label className='label2'>
              {getI18nMessage('endMeasure')}
              </Label>
            </div>
            <div>
              <span> {selectedTimeInfo.toMeasure}</span>
              <span style={{ paddingLeft: '0.2rem' }}>{selectedRoutes[routeCount].measureUnit}</span>
            </div>
          </div>
          {renderTimeDropdown()}
          {attributeVals && (attributeVals?.length > 0) && (
            <div style={{ paddingTop: '0.5rem' }}>
              {renderAttrValTable(attributeVals)}
            </div>
          )}
          {lineEventToggle && (lineEvents?.length > 0) && (
            <div style={{ paddingTop: '1.5rem' }}>
              {getI18nMessage('lineEvent')}
              {lineEvents}
            </div>
          )}
          {pointEventToggle && (pointEvents?.length > 0) && (
            <div style={{ paddingTop: '0.5rem' }}>
              {getI18nMessage('pointEvent')}
              {pointEvents}
            </div>
          )}
        </div>
    )
    return routeDetailsDiv
  }

  return (
    <div style={{ position: 'relative' }}>
    {showPp && selectedLocationInfo && <FloatingPanel
      headerTitle={getI18nMessage('identifyResults')}
      size={size}
      defaultPosition={windowLocation}
      position={windowLocation}
      disableActivateOverlay={false}
      dragBounds='body'
      onDrag={handleDrag}
      onResize={handleResize}
      onHeaderClose={handleSelectionCancel}
    >
      <div css={getCalciteBasicTheme()}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        overflowY: 'scroll',
        height: 'inherit'
      }}>
        {enableDataAction && (
          <React.Fragment>
            <div className='ml-auto'>
            <DataActionList
              widgetId={widgetId}
              dataSets={[actionDataSet]}
              listStyle={DataActionListStyle.Dropdown}
              buttonSize='sm'
              buttonType='tertiary'
            />
            </div>
          </React.Fragment>
        )}
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '30%' }}>
              <Label className='label2'>
              {getI18nMessage('networkLabel')}
              </Label>
            </div>
            <div style={{ width: '50%' }}>
              {selectedNetwork && <Select size='sm' value={selectedNetwork.id} onChange={handleNetworkChange}>
                {networkLayers.map((info: any, i) =>
                //@ts-expect-error
                  <Option key={i} title={info.layerName} value={info.id} label={info.layerName}>
                    {info.layerName}
                  </Option>
                )}
              </Select>}
            </div>
          </div>
          {route && renderRouteDetails(route)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            current={routeCount + 1}
            onChangePage={(val) => { getNextRouteDetails(val) }}
            simple
            size="sm"
            totalPage={selectedNetwork?.routes?.length}
          />
        </div>
      </div>
    </FloatingPanel>}
    </div>
  )
}
