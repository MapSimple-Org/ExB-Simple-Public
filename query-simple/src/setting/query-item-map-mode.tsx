/** @jsx jsx */
import { React, jsx, css, type ImmutableObject, ReactRedux, type IMState, classNames, hooks, focusElementInKeyboardMode } from 'jimu-core'
import { Switch, Button, Checkbox, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { PolylineOutlined } from 'jimu-icons/outlined/gis/polyline'
import { PolygonOutlined } from 'jimu-icons/outlined/gis/polygon'
import { RectangleOutlined } from 'jimu-icons/outlined/gis/rectangle'
import { CircleOutlined } from 'jimu-icons/outlined/gis/circle'
import { SettingRow, SettingSection, MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import defaultMessages from './translations/default'
import { type QueryItemType, CreateToolType, SpatialFilterType } from '../config'
import { toggleItemInArray } from 'widgets/shared-code/mapsimple-common'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { BufferSetting } from './buffer'
import { PinEsriOutlined } from 'jimu-icons/outlined/gis/pin-esri'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'

export const sketchToolInfos = [
  { type: CreateToolType.Point, drawToolName: 'point', icon: <PinEsriOutlined /> },
  { type: CreateToolType.Polyline, drawToolName: 'polyline', icon: <PolylineOutlined /> },
  { type: CreateToolType.Polygon, drawToolName: 'polygon', icon: <PolygonOutlined /> },
  { type: CreateToolType.Rectangle, drawToolName: 'rectangle', icon: <RectangleOutlined /> },
  { type: CreateToolType.Circle, drawToolName: 'circle', icon: <CircleOutlined /> }
]

interface Props {
  index: number
  visible: boolean
  queryItem?: ImmutableObject<QueryItemType>
  onQueryItemChanged: (index: number, item: ImmutableObject<QueryItemType>, dsUpdateRequired?: boolean) => void
  handleStageChange: (id: number) => void
}

const headerStyle = css`
  border-top: 1px solid var(--ref-palette-neutral-700);
  .title {
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--ref-palette-neutral-1000);
  }
`

export function QueryItemSettingMapMode (props: Props) {
  const { index, handleStageChange, queryItem, onQueryItemChanged, visible } = props
  const allDefaultMessages = Object.assign({}, defaultMessages, jimuUIMessages)
  const getI18nMessage = hooks.useTranslation(allDefaultMessages)
  const backBtnRef = React.useRef<HTMLButtonElement>(undefined)
  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)

  const mapExists = ReactRedux.useSelector((state: IMState) => {
    if (queryItem.spatialMapWidgetIds?.length > 0) {
      const mapWidgetId = queryItem.spatialMapWidgetIds[0]
      return state.appStateInBuilder.appConfig.widgets[mapWidgetId] != null
    }
    return false
  })
  const updateProperty = React.useCallback((prop: string, value: any, dsUpdateRequired = false) => {
    const newItem = queryItem.set(prop, value)
    onQueryItemChanged(index, newItem, dsUpdateRequired)
  }, [onQueryItemChanged, queryItem, index])

  React.useEffect(() => {
    if (visible) {
      focusElementInKeyboardMode(backBtnRef.current)
    }
  }, [visible])

  const toggleSpatialFilterType = React.useCallback((type: SpatialFilterType) => {
    const types = toggleItemInArray(type, queryItem.spatialFilterTypes ? [...queryItem.spatialFilterTypes] : [])
    updateProperty('spatialFilterTypes', types)
  }, [updateProperty, queryItem])

  const handleUseMapWidgetChange = React.useCallback((useMapWidgetIds) => {
    let newItem = queryItem.set('spatialMapWidgetIds', useMapWidgetIds)
    if (!useMapWidgetIds || useMapWidgetIds.length === 0) {
      newItem = newItem.set('spatialFilterTypes', [])
    }
    onQueryItemChanged(index, newItem, false)
  }, [onQueryItemChanged, index, queryItem])

  if (!queryItem) {
    return null
  }

  return (
    <div className={ classNames({ 'd-none': !visible })}>
      <div className='d-flex align-items-center px-4 pt-4' css={headerStyle}>
        <Button
          ref={backBtnRef}
          aria-label={getI18nMessage('back')}
          type='tertiary'
          size='sm'
          icon
          className='p-0 action-btn'
          onClick={() => { handleStageChange(0) }}
        >
          <ArrowLeftOutlined autoFlip/>
        </Button>
        <div className='title flex-grow-1 text-truncate ml-2' title={getI18nMessage('featureFromMap')}>{getI18nMessage('featureFromMap')}</div>
      </div>

      <SettingSection role='group' title={getI18nMessage('selectMapWidget')} className='text-truncate'>
        <SettingRow>
          <MapWidgetSelector
            onSelect={handleUseMapWidgetChange}
            useMapWidgetIds={currentItem.spatialMapWidgetIds}
          />
        </SettingRow>
      </SettingSection>
      {mapExists && (
        <SettingSection role='group' aria-label={getI18nMessage('geometryTypes')} title={getI18nMessage('geometryTypes')}>
          <SettingRow>
            <label>
              <Checkbox
                className='mr-2'
                checked={currentItem.spatialFilterTypes.includes(SpatialFilterType.CurrentMapExtent)}
                onChange={() => { toggleSpatialFilterType(SpatialFilterType.CurrentMapExtent) }}
              />
              <span>{getI18nMessage('spatialFilterType_CurrentMapExtent')}</span>
            </label>
          </SettingRow>
          <SettingRow>
            <label>
              <Checkbox
                className='mr-2'
                checked={currentItem.spatialFilterTypes.includes(SpatialFilterType.InteractiveDrawMode)}
                onChange={() => { toggleSpatialFilterType(SpatialFilterType.InteractiveDrawMode) }}
              />
              <span>{getI18nMessage('spatialFilterType_InteractiveDrawMode')}</span>
            </label>
          </SettingRow>
          {currentItem.spatialFilterTypes.includes(SpatialFilterType.InteractiveDrawMode) && (
            <React.Fragment>
              <SettingRow role='group' aria-label={getI18nMessage('chooseSelectionTools')} flow='wrap' className='d-block' label={getI18nMessage('chooseSelectionTools')}>
                {sketchToolInfos.map((value) => {
                  const { type, icon, drawToolName } = value
                  const currentSpatialInteractiveCreateToolTypes = currentItem.spatialInteractiveCreateToolTypes
                  const selected = currentSpatialInteractiveCreateToolTypes.includes(type)
                  return (
                    <div key={type} className='d-flex mt-2'>
                      {icon}
                      <label className='ml-2'>
                        {getI18nMessage(`sketchTool_${drawToolName}`)}
                      </label>
                      <Switch
                        aria-label={getI18nMessage(`sketchTool_${drawToolName}`)}
                        className='ml-auto'
                        checked={selected}
                        onChange={() => {
                          const types = toggleItemInArray(type, [...currentSpatialInteractiveCreateToolTypes])
                          updateProperty('spatialInteractiveCreateToolTypes', types)
                        }}
                      />
                    </div>
                  )
                })}
              </SettingRow>
              <BufferSetting
                enabled={currentItem.spatialInteractiveEnableBuffer}
                distance={currentItem.spatialInteractiveBufferDistance}
                unit={currentItem.spatialInteractiveBufferUnit}
                onEnableChanged={(enabled) => { updateProperty('spatialInteractiveEnableBuffer', enabled) }}
                onDistanceChanged={(distance) => { updateProperty('spatialInteractiveBufferDistance', distance) }}
                onUnitChanged={(unit) => { updateProperty('spatialInteractiveBufferUnit', unit) }}
              />
            </React.Fragment>
          )}
        </SettingSection>
      )}
    </div>
  )
}
