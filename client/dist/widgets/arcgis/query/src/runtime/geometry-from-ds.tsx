/** @jsx jsx */
import {
  React,
  ReactRedux,
  jsx,
  css,
  Immutable,
  type ImmutableArray,
  type UseDataSource,
  type FeatureDataRecord,
  DataSourceManager,
  DataSourceComponent,
  hooks,
  type DataSource,
  type IMState,
  DataSourceStatus
} from 'jimu-core'
import { Select, Option, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SpatialRelation, type UnitType } from '../config'
import { BufferInput } from './buffer-input'
import defaultMessage from './translations/default'
import { QueryTaskContext } from './query-task-context'

const marginStyle = css`margin-top: 0.75rem;`
export interface Props {
  spatialRelations: ImmutableArray<SpatialRelation>
  useDataSources: ImmutableArray<UseDataSource>
  useRuntimeData: boolean
  enableBuffer: boolean
  bufferDistance: number
  bufferUnit: UnitType
  onSelectionChange: (geoms: __esri.Geometry[]) => void
  onRelationChange: (rel: SpatialRelation) => void
  onBufferChange: (distance: number, unit: UnitType) => void
}

function getRuntimeDataSource (): { [dsId: string]: DataSource } {
  const result = {}
  let notEmpty = false
  const dsMap = DataSourceManager.getInstance().getDataSources()
  Object.keys(dsMap).forEach(dsId => {
    const ds = dsMap[dsId]
    // only include the ds that has geometry
    if (ds.getGeometryType() != null && !ds.isInAppConfig() && ds.getMainDataSource().id === dsId && !ds.getDataSourceJson().isOutputFromWidget) {
      result[dsId] = ds
      notEmpty = true
    }
  })

  return notEmpty ? result : null
}

export function GeometryFromDataSource (props: Props) {
  const { onSelectionChange, useDataSources = [], useRuntimeData, spatialRelations, enableBuffer, bufferDistance, bufferUnit, onBufferChange, onRelationChange } = props
  const getI18nMessage = hooks.useTranslation(jimuUIMessages, defaultMessage)
  const [currentDataSource, setCurrentDataSource] = React.useState(useDataSources[0])
  const [runtimeDataSource, setRuntimeDataSource] = React.useState<DataSource>()
  const [count, setCount] = React.useState(0)
  const [currentRelation, setCurrentRelation] = React.useState(spatialRelations?.[0])
  const queryTaskContext = React.useContext(QueryTaskContext)
  const resetSymbolRef = React.useRef(queryTaskContext.resetSymbol)
  const translate = hooks.useTranslation()

  const spatialRelationOptions: Array<{ value: string, label: string }> = React.useMemo(() => {
    return Object.entries(SpatialRelation).map(([key, value]) => ({
      value,
      label: getI18nMessage(`spatialRelation_${key}`)
    }))
  }, [getI18nMessage])

  const loadedUseDataSources = ReactRedux.useSelector((state: IMState) => {
    const loaded = []
    useDataSources.forEach((item) => {
      if (state.dataSourcesInfo?.[item.mainDataSourceId]?.instanceStatus === DataSourceStatus.Created) {
        loaded.push(item.dataSourceId)
      }
    })
    if (loaded.length > 0) {
      return loaded.join(',')
    }
    return ''
  })

  const numOfDs = ReactRedux.useSelector((state: IMState) => {
    if (!useRuntimeData) {
      return 0
    }
    return Object.keys(state.dataSourcesInfo ?? {}).filter(dsId => state.dataSourcesInfo[dsId].instanceStatus === DataSourceStatus.Created).length
  })

  const runtimeDataSources = React.useMemo(() => {
    if (numOfDs > 0) {
      return getRuntimeDataSource()
    }
  }, [numOfDs])

  const numOfRuntimeDs = Object.keys(runtimeDataSources ?? {}).length

  hooks.useEffectOnce(() => {
    if (spatialRelations?.length > 0) {
      onRelationChange(spatialRelations[0])
    }
    if (enableBuffer) {
      onBufferChange(bufferDistance, bufferUnit)
    }
  })

  React.useEffect(() => {
    if (queryTaskContext.resetSymbol && queryTaskContext.resetSymbol !== resetSymbolRef.current) {
      resetSymbolRef.current = queryTaskContext.resetSymbol
      setCurrentRelation(spatialRelations?.[0])
      onRelationChange(spatialRelations?.[0])
    }
  }, [queryTaskContext.resetSymbol, onRelationChange, spatialRelations])

  React.useEffect(() => {
    if (!spatialRelations) {
      setCurrentRelation(null)
    } else if (!spatialRelations.includes(currentRelation)) {
      setCurrentRelation(spatialRelations[0])
      onRelationChange(spatialRelations[0])
    }
  }, [spatialRelations, currentRelation, onRelationChange])

  const handleDataSourceChange = React.useCallback(
    (dsId: string) => {
      const ds = useDataSources.find((item) => item.dataSourceId === dsId)
      setCurrentDataSource(Immutable(ds))
      setRuntimeDataSource(null)
    },
    [useDataSources]
  )

  const handleRuntimeDataSourceChange = React.useCallback(
    (dsId: string) => {
      const ds = DataSourceManager.getInstance().getDataSource(dsId)
      setRuntimeDataSource(ds)
      setCurrentDataSource(null)
    },
    []
  )

  const handleDataSourceInfoChange = React.useCallback(() => {
    const ds = DataSourceManager.getInstance().getDataSource(currentDataSource?.dataSourceId ?? runtimeDataSource?.id)
    const records = ds?.getSelectedRecords() as FeatureDataRecord[]
    if (records?.length > 0) {
      const geometries = records.map((record) => record.getJSAPIGeometry())
      onSelectionChange(geometries)
      setCount(records.length)
    } else {
      onSelectionChange(null)
      setCount(0)
    }
  }, [currentDataSource?.dataSourceId, runtimeDataSource?.id, onSelectionChange])

  const getLabelOfSpatialRelation = (relation: string): string => {
    return spatialRelationOptions.find(item => item.value === relation).label
  }

  const handleSpatialRelationChange = React.useCallback(e => {
    setCurrentRelation(e.target.value)
    onRelationChange(e.target.value)
  }, [onRelationChange])

  return (
    <div>
      <div css={marginStyle} className='title3'>{getI18nMessage('chooseFilterLayer')}</div>
      <Select
        aria-label={getI18nMessage('chooseFilterLayer')}
        value={currentDataSource?.dataSourceId ?? runtimeDataSource?.id}
      >
        {numOfRuntimeDs > 0 && useDataSources.length > 0 && <Option header>{getI18nMessage('preconfigured')}</Option>}
        {useDataSources.map((item) => {
          const ds = DataSourceManager.getInstance().getDataSource(item.dataSourceId)
          if (loadedUseDataSources.includes(item.dataSourceId) || ds?.getLabel()) {
            return (
              <Option key={item.dataSourceId} value={item.dataSourceId} onClick={() => { handleDataSourceChange(item.dataSourceId) }}>
              {ds?.getLabel()}
              </Option>
            )
          }
          return (
            <Option key={item.dataSourceId}>
              {translate('loading')}
            </Option>
          )
        })}
        {numOfRuntimeDs > 0 && useDataSources.length > 0 && <Option divider/>}
        {numOfRuntimeDs > 0 && <Option header>{getI18nMessage('runtime')}</Option>}
        {Object.keys(runtimeDataSources ?? {}).map(dsId => {
          const ds = runtimeDataSources[dsId]
          return (
            <Option key={dsId} value={dsId} onClick={() => { handleRuntimeDataSourceChange(dsId) }}>
              {ds.getLabel()}
            </Option>
          )
        })}
      </Select>
      <div className='mt-1 font-italic' css={css`color: var(--sys-color-surface-paper-hint);`}>{getI18nMessage('selectedRecords', { num: count })}</div>
      {spatialRelations?.length > 0 && (
        <div css={marginStyle}>
          <div className='text-truncate title3 mb-0'>{getI18nMessage('relationship')}</div>
          <Select
            aria-label={getI18nMessage('relationship')}
            value={currentRelation}
            onChange={handleSpatialRelationChange}
          >
            {spatialRelations.map((item) => {
              return (
                <option key={item} value={item}>{getLabelOfSpatialRelation(item)}</option>
              )
            })}
          </Select>
        </div>
      )}
      {enableBuffer && (
        <div role='group' aria-label={getI18nMessage('theBufferDistance')} css={marginStyle}>
          <div className='title3 text-truncate'>{getI18nMessage('theBufferDistance')}</div>
          <div className='d-flex mt-1'>
            <BufferInput distance={bufferDistance} unit={bufferUnit} onBufferChange={onBufferChange}/>
          </div>
        </div>
      )}
      <DataSourceComponent useDataSource={currentDataSource} dataSource={runtimeDataSource} onDataSourceInfoChange={handleDataSourceInfoChange} />
      {useDataSources.map((item) => {
        // make sure the datasource is created
        return (
          <DataSourceComponent key={item.dataSourceId} useDataSource={item}/>
        )
      })}
    </div>
  )
}
