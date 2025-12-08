/** @jsx jsx */
import {
  React, jsx, css, hooks, DataSourceComponent, classNames, DataSourceSelectionMode, type ArcGISQueriableDataSource,
  type DataSource, type ImmutableArray, DataSourceManager, dataSourceUtils, CONSTANTS, type ArcGISQueryParams, geometryUtils
} from 'jimu-core'
import { defaultMessages as jimuUIMessages, Button, NumericInput, Select, Alert } from 'jimu-ui'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import defaultMessages from '../translations/default'
import DataSourceExtension from '../data-source-extension'
import { type DataSourceItem, type IMSpatialSelection, UnitType, mapConfigUnitTypeToJSAPIUnit, mapConfigSpatialRelToJSAPISpatialRel, mapConfigSpatialRelToStringKey } from '../../config'
import {
  getCheckedReadyToDisplayRuntimeInfos, getCheckedReadyToDisplayNotSelectingRuntimeInfos, type GeometryInfo, type DataSourceItemRuntimeInfoMap,
  type DataSourceItemRuntimeInfo, type UpdateDataSourceItemRuntimeInfoForUid
} from '../utils'

export interface SelectByLocationProps {
  widgetId: string
  visible: boolean
  // notConfigDataSourceItems + configDataSourceItems
  allImDataSourceItems: ImmutableArray<DataSourceItem>
  dataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap
  imSpatialSelection: IMSpatialSelection
  updateDataSourceItemRuntimeInfoForUid: UpdateDataSourceItemRuntimeInfoForUid
}

interface DataSourceCache {
  [dsId: string]: DataSource
}

export default function SelectByLocation (props: SelectByLocationProps): React.ReactElement {
  const {
    widgetId,
    visible,
    // notConfigDataSourceItems + configDataSourceItems
    allImDataSourceItems,
    dataSourceItemRuntimeInfoMap,
    imSpatialSelection,
    updateDataSourceItemRuntimeInfoForUid
  } = props

  const buffer = imSpatialSelection.buffer
  let enableBuffer = false
  let configBufferDistance = 0
  let configBufferUnit: UnitType = null

  if (buffer) {
    enableBuffer = buffer.enable
    configBufferDistance = buffer.distance
    configBufferUnit = buffer.unit
  }

  // make sure configBufferDistance is a valid number
  if (typeof configBufferDistance !== 'number') {
    configBufferDistance = 0
  }

  // make sure configBufferUnit is not null
  if (!configBufferUnit) {
    configBufferUnit = UnitType.Meters
  }

  const [dataSourceCache, setDataSourceCache] = React.useState<DataSourceCache>({})
  const [relationshipSelectValue, setRelationshipSelectValue] = React.useState<string>(imSpatialSelection.relationships && imSpatialSelection.relationships[0])
  const [selectedDataSourceId, setSelectedDataSourceId] = React.useState<string>('')
  const [bufferDistanceInputValue, setBufferDistanceInputValue] = React.useState<number>(configBufferDistance)
  const [bufferUnitSelectValue, setBufferUnitSelectValue] = React.useState<UnitType>(configBufferUnit)
  const [featureCount, setFeatureCount] = React.useState<number>(-1) // -1 means hide the count label
  const [isQueryingLocationGeometry, setIsQueryingLocationGeometry] = React.useState<boolean>(false)
  const appliedBatchRuntimeInfosRef = React.useRef<DataSourceItemRuntimeInfo[]>([]) // runtimeInfo array for applying the new geometry

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  // update bufferDistanceInputValue if configBufferDistance changed
  React.useEffect(() => {
    if (typeof configBufferDistance === 'number') {
      setBufferDistanceInputValue(configBufferDistance)
    }
  }, [configBufferDistance])

  // update bufferUnitSelectValue if configBufferUnit changed
  React.useEffect(() => {
    if (configBufferUnit) {
      setBufferUnitSelectValue(configBufferUnit)
    }
  }, [configBufferUnit])

  const style = React.useMemo(() => {
    return css`
      border-bottom: 1px solid var(--sys-color-divider-secondary);

      .select-by-location-title {
        font-size: 0.875rem;
        font-weight: 600;
      }

      .select-by-location-param-title {
        font-weight: 500;
      }

      .feature-count-info {
        background: var(--primary-100, #E6F2FF);
        border-color: var(--info-300, #60CEFF);
        border-width: 1px;
        border-style: solid;
        min-height: 32px;
      }
    `
  }, [])

  const selectedDataSource = React.useMemo(() => {
    if (!selectedDataSourceId) {
      return null
    }

    const dataSource = dataSourceCache[selectedDataSourceId] || DataSourceManager.getInstance().getDataSource(selectedDataSourceId)

    return dataSource as ArcGISQueriableDataSource
  }, [dataSourceCache, selectedDataSourceId])

  const mainDsOfSelectedDs = React.useMemo(() => {
    let mainDs: DataSource = null

    if (selectedDataSource) {
      mainDs = selectedDataSource.getMainDataSource()
    }

    return mainDs
  }, [selectedDataSource])

  // DataSourceItemRuntimeInfo count that items are checked and ready to display on the UI.
  const lengthOfCheckedReadyRuntimeInfos = React.useMemo((): number => {
    const checkedReadyRuntimeInfos = getCheckedReadyToDisplayRuntimeInfos(allImDataSourceItems, dataSourceItemRuntimeInfoMap)
    return checkedReadyRuntimeInfos.length
  }, [allImDataSourceItems, dataSourceItemRuntimeInfoMap])

  // DataSourceItemRuntimeInfo array that items are checked, ready to display on the UI and not in selecting status.
  const availableRuntimeInfosForBatch = React.useMemo(() => {
    return getCheckedReadyToDisplayNotSelectingRuntimeInfos(allImDataSourceItems, dataSourceItemRuntimeInfoMap)
  }, [allImDataSourceItems, dataSourceItemRuntimeInfoMap])
  const lengthOfRuntimeInfosForBatch = availableRuntimeInfosForBatch.length

  // calculate isApplyBtnEnabled
  const isApplyBtnEnabled = React.useMemo(() => {
    let result = relationshipSelectValue &&
                 selectedDataSource &&
                 !isQueryingLocationGeometry &&
                 lengthOfCheckedReadyRuntimeInfos > 0 &&
                 lengthOfCheckedReadyRuntimeInfos === lengthOfRuntimeInfosForBatch // make sure all checked items are not in selecting status
    result = !!(result)

    return result
  }, [isQueryingLocationGeometry, lengthOfCheckedReadyRuntimeInfos, lengthOfRuntimeInfosForBatch, relationshipSelectValue, selectedDataSource])

  const onStartApply = React.useCallback(() => {
    appliedBatchRuntimeInfosRef.current = availableRuntimeInfosForBatch
    const appliedBatchRuntimeInfos = appliedBatchRuntimeInfosRef.current || []
    setIsQueryingLocationGeometry(true)

    appliedBatchRuntimeInfos.forEach(runtimeInfo => {
      const uid = runtimeInfo.uid
      updateDataSourceItemRuntimeInfoForUid(uid, {
        isSelecting: true
      })
    })
  }, [appliedBatchRuntimeInfosRef, availableRuntimeInfosForBatch, updateDataSourceItemRuntimeInfoForUid])

  const onGetGeometrySuccessfully = React.useCallback((geometryInfo: GeometryInfo) => {
    const appliedBatchRuntimeInfos = appliedBatchRuntimeInfosRef.current || []
    appliedBatchRuntimeInfosRef.current = []
    setIsQueryingLocationGeometry(false)


    appliedBatchRuntimeInfos.forEach(runtimeInfo => {
      // SelectByLocation only works with DataSourceSelectionMode.New
      runtimeInfo.tryExecuteSelectingByGeometryInfoAndSqlUI(DataSourceSelectionMode.New, geometryInfo)
    })
  }, [appliedBatchRuntimeInfosRef, setIsQueryingLocationGeometry])

  const onFailGetGeometry = React.useCallback(() => {
    const appliedBatchRuntimeInfos = appliedBatchRuntimeInfosRef.current || []
    appliedBatchRuntimeInfosRef.current = []
    setIsQueryingLocationGeometry(false)

    appliedBatchRuntimeInfos.forEach(runtimeInfo => {
      const uid = runtimeInfo.uid
      updateDataSourceItemRuntimeInfoForUid(uid, {
        isSelecting: false
      })
    })
  }, [appliedBatchRuntimeInfosRef, setIsQueryingLocationGeometry, updateDataSourceItemRuntimeInfoForUid])

  const onApplyBtnClicked = React.useCallback(() => {
    if (!relationshipSelectValue) {
      return
    }

    if (!selectedDataSource) {
      return
    }

    onStartApply()

    const dsExt = new DataSourceExtension(selectedDataSource, widgetId)

    const p = getBufferedUnionGeometry(dsExt, enableBuffer, bufferDistanceInputValue, bufferUnitSelectValue)
    p.then((geometry) => {
      if (!geometry) {
        onFailGetGeometry()
        return
      }

      const geometryType = dataSourceUtils.changeJSAPIGeometryTypeToRestAPIGeometryType(geometry.type as any)
      const apiSpatialRel = mapConfigSpatialRelToJSAPISpatialRel[relationshipSelectValue]
      const geometryInfo: GeometryInfo = {
        geometry: geometry.toJSON(),
        geometryType,
        spatialRel: apiSpatialRel
      }
      onGetGeometrySuccessfully(geometryInfo)
    }).catch(e => {
      console.error('can not get buffered union geometry', e)
      onFailGetGeometry()
    })
  }, [bufferDistanceInputValue, bufferUnitSelectValue, enableBuffer, onFailGetGeometry, onGetGeometrySuccessfully, onStartApply, relationshipSelectValue, selectedDataSource, widgetId])

  // update selected feature count label when selectedDataSourceId changes
  React.useEffect(() => {
    setFeatureCount(-1)

    if (selectedDataSource) {
      selectedDataSource.queryCount({}).then((queryResult) => {
        // ds.queryCount is an async operation, selectedDataSourceId maybe changed during the async operation,
        // so need to check selectedDataSourceId changed or not
        if (selectedDataSource.id === selectedDataSourceId) {
          const count = queryResult?.count || 0
          setFeatureCount(count)
        }
      }).catch(e => {
        console.error('query count error for location data source', e)
      })
    }
  }, [selectedDataSource, selectedDataSourceId])

  // #17441
  const onSelectionChange = React.useCallback((selection: ImmutableArray<string>) => {
    if (selectedDataSource && selectedDataSource.id === selectedDataSourceId && isSelectionView(selectedDataSource)) {
      const selectedFeatureCount = selection?.length || 0
      setFeatureCount(selectedFeatureCount)
    }
  }, [selectedDataSource, selectedDataSourceId])

  const onRelationshipChange = React.useCallback((evt) => {
    const newRelationship = evt.target.value
    setRelationshipSelectValue(newRelationship)
  }, [setRelationshipSelectValue])

  const onLocationDataSourceSelectChange = React.useCallback((evt) => {
    const newDataSourceSelectValue = evt.target.value
    setSelectedDataSourceId(newDataSourceSelectValue)
  }, [setSelectedDataSourceId])

  const onDataSourceCreated = React.useCallback((ds: DataSource) => {
    if (ds) {
      setDataSourceCache((currDataSourceCache) => {
        const dsId = ds.id
        const newDataSourceCache = Object.assign({}, currDataSourceCache, {
          [dsId]: ds
        })
        return newDataSourceCache
      })
    }
  }, [setDataSourceCache])

  const onBufferDistanceChange = React.useCallback((value: number) => {
    setBufferDistanceInputValue(value)
  }, [setBufferDistanceInputValue])

  const onBufferUnitChange = React.useCallback((evt) => {
    const newBufferUnit = evt.target.value
    setBufferUnitSelectValue(newBufferUnit)
  }, [setBufferUnitSelectValue])

  const imUseDataSourcesOfSpatialSelection = imSpatialSelection.useDataSources

  const loadedLocationDataSources = React.useMemo(() => {
    const tempLoadedDataSources: DataSource[] = []

    imUseDataSourcesOfSpatialSelection.forEach(imDataSource => {
      const dsId = imDataSource.dataSourceId
      const ds = dataSourceCache[dsId]

      if (ds) {
        tempLoadedDataSources.push(ds)
      }
    })

    return tempLoadedDataSources
  }, [dataSourceCache, imUseDataSourcesOfSpatialSelection])

  // auto select the first ds (imSpatialSelection.useDataSources[0]) if it is loaded
  React.useEffect(() => {
    if (!selectedDataSourceId && imUseDataSourcesOfSpatialSelection.length > 0 && loadedLocationDataSources.length > 0) {
      const firstDataSourceId = imUseDataSourcesOfSpatialSelection[0] && imUseDataSourcesOfSpatialSelection[0].dataSourceId

      if (firstDataSourceId) {
        const ds = loadedLocationDataSources.find(loadedDs => loadedDs.id === firstDataSourceId)

        if (ds) {
          setSelectedDataSourceId(firstDataSourceId)
        }
      }
    }
  }, [imUseDataSourcesOfSpatialSelection, loadedLocationDataSources, selectedDataSourceId])

  const selectByDataLabel = translate('selectByData')
  const applyLabel = translate('apply')
  const relationshipLabel = translate('relationship')
  const selectingFeaturesLabel = translate('selectingFeatures')
  const bufferDistanceLabel = translate('theBufferDistance')
  const bufferUnitLabel = translate('bufferUnit')

  const [selectByLocationFeatureCountTip, setSelectByLocationFeatureCountTip] = React.useState<string>('')

  // With NVDA on, after select another item of `Selecting features`, NVDA will start reading `There are .. features inside this data`,
  // but it was interrupted before it was finished. This seems to be caused by the delayed focus of select component.
  // To fix this issue, we need to update selectByLocationFeatureCountTip in a timer.
  React.useEffect(() => {
    setTimeout(() => {
      const newSelectByLocationFeatureCountTip = translate('selectByLocationFeatureCountTip', {
        count: featureCount
      })

      setSelectByLocationFeatureCountTip(newSelectByLocationFeatureCountTip)
    }, 500)
  }, [featureCount, translate])

  return (
    <div className={classNames(['select-by-location p-4', { 'd-none': !visible }])} css={style}>
      <div className='d-flex w-100 align-items-center mb-2' aria-label={selectByDataLabel} role='group'>
        <label
          className='select-by-location-title w-100 mb-0'
          title={selectByDataLabel}
        >
          {selectByDataLabel}
        </label>

        <Button
          className='nowrap'
          type='primary'
          disabled={!isApplyBtnEnabled}
          size="sm"
          onClick={onApplyBtnClicked}
        >
          {applyLabel}
        </Button>
      </div>

      <div className='relationship-param w-100 d-flex flex-column align-items-center mb-2'>
        <label
          className='select-by-location-param-title w-100 mb-2'
          title={relationshipLabel}
        >
          {relationshipLabel}
        </label>

        <Select
          className='relationship-select w-100'
          size='sm'
          value={relationshipSelectValue}
          aria-label={relationshipLabel}
          onChange={onRelationshipChange}
          >
          {imSpatialSelection.relationships.map((value) => (
            <option key={value} value={value}>
              {translate(mapConfigSpatialRelToStringKey[value])}
            </option>
          ))}
        </Select>
      </div>

      <div className='data-view-param w-100 d-flex flex-column align-items-center mb-2'>
        <label
          className='select-by-location-param-title w-100 mb-2'
          title={selectingFeaturesLabel}
        >
          {selectingFeaturesLabel}
        </label>

        <Select
          className='selecting-features-select w-100'
          size='sm'
          value={selectedDataSourceId}
          aria-label={selectingFeaturesLabel}
          onChange={onLocationDataSourceSelectChange}
          >
          {loadedLocationDataSources.map((ds) => (
            <option key={ds.id} value={ds.id}>
              { ds.getLabel() || '' }
            </option>
          ))}
        </Select>

        {
          imUseDataSourcesOfSpatialSelection.map(imUseDataSource => {
            return (<DataSourceComponent
              key={imUseDataSource.dataSourceId}
              useDataSource={imUseDataSource}
              onDataSourceCreated={onDataSourceCreated}
            />)
          })
        }
      </div>

      {/* if the props.dataSource is a selection view, it doesn't trigger onSelectionChange callback, so need to set the value of props.dataSource to main data source  */}
      {
        (selectedDataSource && mainDsOfSelectedDs && isSelectionView(selectedDataSource)) &&
        <DataSourceComponent
          dataSource={mainDsOfSelectedDs}
          onSelectionChange={onSelectionChange}
        />
      }

      {enableBuffer && (
        <div className='distance-unit-param w-100 d-flex flex-column align-items-center'>
          <label
            className='select-by-location-param-title w-100 mb-2'
            title={bufferDistanceLabel}
          >
            {bufferDistanceLabel}
          </label>

          <div className='d-flex w-100 justify-content-between'>
            <NumericInput
              className='distance-input w-45 mr-1'
              aria-label={bufferDistanceLabel}
              size='sm'
              value={bufferDistanceInputValue}
              min={0}
              onChange={onBufferDistanceChange}
            />

            <Select
              className='unit-select w-55'
              size='sm'
              value={bufferUnitSelectValue}
              aria-label={bufferUnitLabel}
              onChange={onBufferUnitChange}
              >
              {Object.values(UnitType).map((value) => (
                <option key={value} value={value}>
                  {translate(`unit_${value}`)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {
        (featureCount >= 0) &&
        <Alert
          type="info"
          withIcon
          text={selectByLocationFeatureCountTip}
          className='w-100 mt-3'
          aria-live="polite"
          buttonType="default"
          closable={false}
          form="basic"
          open
          size="medium"
        />
      }
    </div>
  )
}

/**
 * Calculate the final geometry by UI, the geometry is buffered and unioned.
 * @param dsExt
 * @param enableBuffer
 * @param bufferDistanceInputValue
 * @param bufferUnitSelectValue
 * @returns
 */
async function getBufferedUnionGeometry (
  dsExt: DataSourceExtension,
  enableBuffer: boolean,
  bufferDistanceInputValue: number,
  bufferUnitSelectValue: UnitType
): Promise<__esri.Geometry> {
  const queryParams: ArcGISQueryParams = {
    outFields: [],
    returnGeometry: true,
    // If the returned geometry spatialReference is 4326, then geometryEngineAsync.buffer() will get the following error:
    // The input unit and the spatial reference unit are not of the same unit type.ie Linear vs.Angular.
    // But it is ok to use 4326 as spatialReference for geodesicBufferOperator.
    outSR: 4326
  }
  const queryResult = await dsExt.ds.queryAll(queryParams)

  const modules = await loadArcGISJSAPIModules([
    'esri/geometry/support/jsonUtils',
    'esri/geometry/operators/unionOperator'
  ])

  const [geometryJsonUtils, unionOperator] = modules as [__esri.jsonUtils, __esri.unionOperator]

  // get raw geometries
  const rawGeometries: __esri.GeometryUnion[] = []

  if (queryResult && queryResult.records.length > 0) {
    queryResult.records.forEach(record => {
      const geometry = record.getGeometry()

      if (geometry) {
        if ((geometry as __esri.GeometryUnion).declaredClass) {
          // geometry is Geometry instance
          rawGeometries.push(geometry as __esri.GeometryUnion)
        } else {
          const geometryInstance = geometryJsonUtils.fromJSON(geometry)
          rawGeometries.push(geometryInstance)
        }
      }
    })
  }

  // get buffered union geometry
  let bufferedUnionGeometry: __esri.Geometry = null

  if (rawGeometries.length > 0) {
    if (enableBuffer && bufferDistanceInputValue > 0 && bufferUnitSelectValue) {
      // use buffer
      const apiBufferUnit = mapConfigUnitTypeToJSAPIUnit[bufferUnitSelectValue]

      // bufferedUnionGeometry is a polygon
      const bufferResult = await geometryUtils.createBuffer(rawGeometries, [bufferDistanceInputValue], apiBufferUnit as any) as __esri.GeometryUnion[]

      if (Array.isArray(bufferResult)) {
        if (bufferResult.length === 1) {
          bufferedUnionGeometry = bufferResult[0]
        } else if (bufferResult.length >= 2) {
          // union bufferResult
          bufferedUnionGeometry = unionOperator.executeMany(bufferResult)
        } else {
          // exception
          bufferedUnionGeometry = null
        }
      } else {
        bufferedUnionGeometry = bufferResult
      }
    } else {
      // don't use buffer

      if (rawGeometries.length === 1) {
        bufferedUnionGeometry = rawGeometries[0]
      } else {
        // union rawGeometries
        bufferedUnionGeometry = unionOperator.executeMany(rawGeometries)
      }
    }
  }

  return bufferedUnionGeometry
}

function isSelectionView (dataSource: DataSource): boolean {
  if (dataSource) {
    return dataSource.isDataView && dataSource.dataViewId === CONSTANTS.SELECTION_DATA_VIEW_ID
  }

  return false
}
