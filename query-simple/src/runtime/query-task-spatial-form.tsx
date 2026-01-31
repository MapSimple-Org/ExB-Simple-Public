/** @jsx jsx */
import { React, ReactRedux, type IMState, jsx, css, classNames, type ImmutableArray, type UseDataSource, hooks } from 'jimu-core'
import { Select, Tooltip, Button } from 'jimu-ui'
import { type CreateToolType, SpatialFilterType, type SpatialFilterObj, type SpatialRelation, UnitType } from '../config'
import defaultMessage from './translations/default'
import { GeometryFromDataSource } from './geometry-from-ds'
import { GeometryFromMap } from './geometry-from-map'
import { GeometryFromDraw } from './geometry-from-draw'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

export interface QueryTaskItemProps {
  widgetId: string
  label: string
  desc: string
  dsEnableBuffer: boolean
  dsBufferDistance: number
  dsBufferUnit: UnitType
  drawEnableBuffer: boolean
  drawBufferDistance: number
  drawBufferUnit: UnitType
  spatialRelations: ImmutableArray<SpatialRelation>
  useDataSources: ImmutableArray<UseDataSource>
  useRuntimeData: boolean
  filterTypes: ImmutableArray<SpatialFilterType>
  mapWidgetIds: ImmutableArray<string>
  createToolTypes: ImmutableArray<CreateToolType>
  onFilterChange: (filter: SpatialFilterObj) => void
  onRelationChange: (rel: SpatialRelation) => void
  onBufferChange: (distance: number, unit: UnitType) => void
}

export function QueryTaskSpatialForm (props: QueryTaskItemProps) {
  const {
    label, desc, filterTypes, mapWidgetIds, onFilterChange, onRelationChange, onBufferChange, useDataSources, spatialRelations, useRuntimeData,
    dsEnableBuffer, dsBufferDistance, dsBufferUnit, drawEnableBuffer, drawBufferDistance, drawBufferUnit, createToolTypes, widgetId
  } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  // used to store the selection of the data source in order to update the filter when option changes
  const selectedGeometriesRef = React.useRef<any>(null)
  const mapExists = ReactRedux.useSelector((state: IMState) => {
    if (mapWidgetIds?.length > 0) {
      const mapWidgetId = mapWidgetIds[0]
      return state.appConfig.widgets[mapWidgetId] != null
    }
    return false
  })
  const canUseMapFilter = React.useMemo(() => {
    return mapExists && (filterTypes?.includes(SpatialFilterType.CurrentMapExtent) || filterTypes?.includes(SpatialFilterType.InteractiveDrawMode))
  }, [filterTypes, mapExists])
  const supportedFilterTypes = React.useMemo(() => {
    const result = []
    if (useDataSources?.length > 0 || useRuntimeData) {
      result.push({ value: 'data', label: getI18nMessage('featureFromDs') })
    }
    if (canUseMapFilter && filterTypes?.includes(SpatialFilterType.CurrentMapExtent)) {
      result.push({ value: 'map', label: getI18nMessage(`spatialFilterType_${SpatialFilterType.CurrentMapExtent}`) })
    }
    if (canUseMapFilter && filterTypes?.includes(SpatialFilterType.InteractiveDrawMode)) {
      result.push({ value: 'draw', label: getI18nMessage(`spatialFilterType_${SpatialFilterType.InteractiveDrawMode}`) })
    }
    return result
  }, [canUseMapFilter, useDataSources, useRuntimeData, getI18nMessage, filterTypes])

  const [currentFilterType, setCurrentFilterType] = React.useState(supportedFilterTypes?.[0]?.value)

  React.useEffect(() => {
    // in order to avoid invalid option being selected
    if (currentFilterType !== 'none' && !supportedFilterTypes.find((item) => item.value === currentFilterType)) {
      setCurrentFilterType(supportedFilterTypes?.[0]?.value)
    }
  }, [currentFilterType, supportedFilterTypes])

  React.useEffect(() => {
    // clear the relationship and buffer if filter type is not 'data'
    if (currentFilterType === 'map' || currentFilterType === 'draw' || currentFilterType === 'none') {
      onRelationChange(null)
      onBufferChange(0, UnitType.Meters)
      onFilterChange({ geometry: null })
    }
    // no need to update the filter if the data source has selection since it will be updated in the handleSelectionChange method
    if (currentFilterType === 'data' && selectedGeometriesRef.current == null) {
      onFilterChange({ geometry: null })
    }
  }, [currentFilterType, onRelationChange, onBufferChange, onFilterChange])

  const handleFilterTypeChanged = React.useCallback((evt) => { setCurrentFilterType(evt.target.value) }, [])

  const handleGeometryChange = React.useCallback((geometry: __esri.Geometry, layer?: __esri.GraphicsLayer, graphic?: __esri.Graphic, clearAfterApply?: boolean) => {
    onFilterChange({ geometry, graphic, layer, clearAfterApply })
  }, [onFilterChange])

  const handleSelectionChange = React.useCallback((geometries) => {
    selectedGeometriesRef.current = geometries
    onFilterChange({ geometry: geometries })
  }, [onFilterChange])

  if (!(useDataSources?.length > 0 || useRuntimeData || canUseMapFilter)) {
    return null
  }

  return (
    <div role='group' className='px-4 pb-4' aria-label={label}>
      <div className={classNames('form-title my-2 d-flex align-items-center', { 'd-none': !label && !desc })}>
        {label && <div className='mr-2 title2'>{label}</div>}
        {desc && (
          <Tooltip placement='bottom' css={css`white-space: pre-line;`} title={desc}>
            <Button size='sm' icon type='tertiary'>
              <InfoOutlined color='var(--sys-color-primary-main)' size='s'/>
            </Button>
          </Tooltip>
        )}
      </div>
      {supportedFilterTypes.length > 0 && (
        <div>
          <div className='title3'>{getI18nMessage('chooseFilterType')}</div>
          <Select
            aria-label={getI18nMessage('chooseFilterType')}
            css={css`height: 32px;`}
            value={currentFilterType}
            onChange={handleFilterTypeChanged}
          >
            <option key='-' value='none'>-</option>
            {supportedFilterTypes.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </Select>
        </div>
      )}
      {currentFilterType === 'data' && (
        <GeometryFromDataSource
          enableBuffer={dsEnableBuffer}
          bufferDistance={dsBufferDistance}
          bufferUnit={dsBufferUnit}
          spatialRelations={spatialRelations}
          useDataSources={useDataSources}
          useRuntimeData={useRuntimeData}
          onSelectionChange={handleSelectionChange}
          onRelationChange={onRelationChange}
          onBufferChange={onBufferChange}
        />
      )}
      {currentFilterType === 'map' && (
        <GeometryFromMap
          mapWidgetIds={mapWidgetIds}
          createToolTypes={createToolTypes}
          onGeometryChange={handleGeometryChange}
        />
      )}
      {currentFilterType === 'draw' && (
        <GeometryFromDraw
          enableBuffer={drawEnableBuffer}
          bufferDistance={drawBufferDistance}
          bufferUnit={drawBufferUnit}
          mapWidgetIds={mapWidgetIds}
          widgetId={widgetId}
          createToolTypes={createToolTypes}
          onGeometryChange={handleGeometryChange}
          onBufferChange={onBufferChange}
        />
      )}
    </div>
  )
}
