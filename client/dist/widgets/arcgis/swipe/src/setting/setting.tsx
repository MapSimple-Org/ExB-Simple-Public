/** @jsx jsx */
import {
  jsx,
  React,
  css,
  polished,
  type IMState,
  ReactRedux,
  classNames,
  hooks,
  Immutable,
  type ImmutableArray,
  LayoutItemType
} from 'jimu-core'
import { getTheme2 } from 'jimu-theme'
import {
  defaultMessages as jimuUIMessages,
  Button,
  Radio,
  type LinearUnit,
  Switch,
  Label,
  Icon
} from 'jimu-ui'
import { getAppConfigAction, type AllWidgetSettingProps } from 'jimu-for-builder'
import {
  MapWidgetSelector,
  SettingRow,
  SettingSection
} from 'jimu-ui/advanced/setting-components'
import { ClickOutlined } from 'jimu-icons/outlined/application/click'
import defaultMessages from './translations/default'
import {
  type IMConfig,
  type Config,
  SwipeMode,
  SwipeStyle
} from '../config'
import SwipeTemplates from './components/swipe-templates'
import CustomizeSwipeLayers from './components/customize-swipe-layers'
import CustomizeSwipeMaps from './components/customize-swipe-maps'
import CustomizeScrollLayers from './components/customize-scroll-layers'
import { DEFAULT_SLIDER_POSITION, DEFAULT_SWIPE_STYLE } from '../constants'
import { InputUnit } from 'jimu-ui/advanced/style-setting-components'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { arraysEqual, getJimuMapViewId } from '../utils/utils'
import { LayoutItemSizeModes, searchUtils } from 'jimu-layouts/layout-runtime'

const prefix = 'jimu-widget-'
const { useMemo, useState, useEffect } = React

const STYLE = css`
    &{
      .reset-template-and-select-map-section {
        border-bottom: none;
        padding-bottom: 0;
      }
      .placeholder-container {
        height: calc(100% - 115px);
        .placeholder-hint {
          font-size: ${polished.rem(14)};
          font-weight: 500;
          color: var(--ref-palette-neutral-1000);
          max-width: ${polished.rem(160)};
        }
        .placeholder-icon {
          color: var(--ref-palette-neutral-800);
        }
      }
      .template-group {
        &.advance-style-group {
          padding-bottom: ${polished.rem(4)};
        }
        button {
          flex: 1;
          flex-grow: 1;
          padding: 0;
        }
        .style-margin-r {
          margin-right: ${polished.rem(6)};
        }
        .style-img {
          cursor: pointer;
          width: 100%;
          height: 70px;
          margin: 0;
          border: 1px solid transparent;
          background-color: var(--ref-palette-white);
          &.active {
            border: 2px solid var(--sys-color-primary-main);
          }
          &.style-img-h {
            width: 100%;
            height: auto;
          }
        }
        .vertical-space {
          height: 10px;
        }
      }
      .resetting-template {
        cursor: pointer;
        color: var(--sys-color-primary-light);
        opacity: 1;
        vertical-align: middle;
        padding: 0;
      }
      .resetting-template:hover {
        cursor: pointer;
        opacity: 0.8;
        color: var(--sys-color-primary-light);
      }
      .arrangement-style {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${polished.rem(10)};
        .arrangement-btn {
          width: 100%;
          height: ${polished.rem(80)};
          padding: 0;
          background: var(--sys-color-action-pressed);
          margin-bottom: var(--sys-spacing-2);
          .arrangement-img {
            width: 100%;
            height: 100%;
            margin-right: 0;
          }
        }
        .arrangement-btn.active {
          border: 2px solid var(--sys-color-primary-main);
        }
        .arrangement-text {
          text-align: center;
        }
      }
    }
  `

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const { onSettingChange, id, useMapWidgetIds, config } = props
  const { styleConfig, swipeStyle, swipeMode } = config
  const { defaultActivation = false, detailsVisibility = true, isAllowDeactivateLayers = true, toggleLayerVisibility = false, sliderPosition = DEFAULT_SLIDER_POSITION, dividerColor = 'var(--sys-color-surface-footer)', handleColor = 'var(--sys-color-surface-footer)' } = styleConfig || {}
  const [previousSwipeStyle, setPreviousSwipeStyle] = useState(DEFAULT_SWIPE_STYLE)
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const appTheme = getTheme2()
  const isExpressMode = window.isExpressBuilder
  const resetButtonRef = React.useRef(null)

  const useDataSources = ReactRedux.useSelector((state: IMState) => {
    const s = state.appStateInBuilder ?? state
    return s.appConfig.widgets[useMapWidgetIds?.[0]]?.useDataSources
  })
  const initDsIds = useDataSources?.map(ds => ds.dataSourceId)
  const [mapUseDataSources, setMapUseDataSources] = useState<ImmutableArray<string>>(initDsIds || Immutable([]))

  const dsJsons = ReactRedux.useSelector((state: IMState) => {
    const s = state.appStateInBuilder ?? state
    return s.appConfig.dataSources
  })

  useEffect(() => {
    const newDsIds = useDataSources?.map(ds => ds.dataSourceId)
    setMapUseDataSources(newDsIds)
  }, [useDataSources])

  hooks.useUpdateEffect(() => {
    const appConfigAction = getAppConfigAction()
    const layoutInfos = searchUtils.getLayoutInfosHoldContent(appConfigAction.appConfig, LayoutItemType.Widget, id)
    layoutInfos.forEach(layoutInfo => {
      if (detailsVisibility) {
        appConfigAction
          .editLayoutItemProperty(layoutInfo, 'setting.autoProps.height', LayoutItemSizeModes.Custom)
          .editLayoutItemProperty(layoutInfo, 'bbox.height', '400px')
          .editWidgetProperty(id, 'offPanel', false)
          .exec()
      } else {
        appConfigAction
          .editLayoutItemProperty(layoutInfo, 'setting.autoProps.height', LayoutItemSizeModes.Auto)
          .editWidgetProperty(id, 'offPanel', true)
          .exec()
      }
    })
  }, [detailsVisibility])

  //When data sources in map widget is changed, change the config accordingly. Only do this change after the swipe setting page is mounted.
  React.useEffect(() => {
    let newConfig = config
    Object.keys(config.swipeMapViewList || {}).forEach(jimuMapViewId => {
      const mapUseJimuMapView = useDataSources?.map(ds => {
        return getJimuMapViewId(useMapWidgetIds[0], ds.dataSourceId)
      })
      if (!mapUseJimuMapView?.includes(jimuMapViewId)) {
        newConfig = config.set('swipeMapViewList', config.swipeMapViewList.without(jimuMapViewId))
      }
    })

    Object.keys(config.scrollMapViewList || {}).forEach(jimuMapViewId => {
      const mapUseJimuMapView = useDataSources?.map(ds => {
        return getJimuMapViewId(useMapWidgetIds[0], ds.dataSourceId)
      })
      if (!mapUseJimuMapView?.includes(jimuMapViewId)) {
        newConfig = config.set('scrollMapViewList', config.scrollMapViewList.without(jimuMapViewId))
      }
    })

    const useDsIds = useDataSources?.map(ds => ds.dataSourceId)
    if (useDsIds && config.mapUseDataSourcesOrderList && !arraysEqual(useDsIds, config.mapUseDataSourcesOrderList)) {
      newConfig = newConfig.set('mapUseDataSourcesOrderList', [])
    }

    if (newConfig !== config) {
      onSettingChange({
        id: id,
        config: newConfig
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onMapWidgetSelected = (ids: string[]) => {
    onSettingChange({
      id: id,
      config: {
        swipeStyle: swipeStyle,
        swipeMode: SwipeMode.SwipeBetweenLayers
      },
      useMapWidgetIds: ids
    })
  }

  const onPropertyChange = (name: string[], value: any) => {
    if (value === config.getIn(name)) {
      return
    }
    if (value === undefined) {
      config.without(name[0] as keyof Config)
    }
    onConfigChange(name, value)
  }

  const onConfigChange = (key: string[], value: any) => {
    const newConfig = config.setIn(key, value)
    const alterProps = {
      id: props.id,
      config: newConfig
    }
    props.onSettingChange(alterProps)
  }

  const handleResetSwipeStyleClick = evt => {
    setPreviousSwipeStyle(swipeStyle)

    onSettingChange({
      id: id,
      config: {
        swipeMode: SwipeMode.SwipeBetweenLayers
      }
    })
  }

  const hasMap = useMemo(() => useMapWidgetIds?.length > 0, [useMapWidgetIds])

  const handleSwipeMode = (swipeMode: SwipeMode) => {
    const newConfig = config.set('swipeMode', swipeMode)
    props.onSettingChange({
      id: id,
      config: newConfig
    })
  }

  const setSliderPosition = (value: LinearUnit) => {
    onSettingChange({
      id: id,
      config: config.setIn(['styleConfig', 'sliderPosition'], value)
    })
  }

  const onDividerColorChange = (color: string) => {
    onSettingChange({
      id: id,
      config: config.setIn(['styleConfig', 'dividerColor'], color)
    })
  }

  const onHandleColorChange = (color: string) => {
    props.onSettingChange({
      id: id,
      config: config.setIn(['styleConfig', 'handleColor'], color)
    })
  }

  const onAllowDeactivateLayers = () => {
    onSettingChange({
      id: id,
      config: config.setIn(['styleConfig', 'isAllowDeactivateLayers'], !isAllowDeactivateLayers)
    })
  }

  const isMapUnoccupied = (): boolean => {
    //Selecting None option in map widget selector
    if (useMapWidgetIds === undefined || useMapWidgetIds.length === 0) {
      return true
    }

    const usedMapWidgetId = useMapWidgetIds?.[0]
    const appConfig = getAppConfigAction().appConfig
    for (const widgetId of Object.keys(appConfig.widgets)) {
      const widget = appConfig.widgets[widgetId]
      if (
        widget.manifest.name === 'swipe' &&
        widget.id !== id &&
        widget.useMapWidgetIds?.[0] === usedMapWidgetId
      ) {
        return false
      }
    }
    return true
  }

  const showCustomizeSwipeLayersSetting = (swipeStyle === SwipeStyle.SimpleHorizontal || swipeStyle === SwipeStyle.SimpleVertical) && swipeMode === SwipeMode.SwipeBetweenLayers

  const showCustomizeSwipeMapsSetting = (swipeStyle === SwipeStyle.SimpleHorizontal || swipeStyle === SwipeStyle.SimpleVertical) && swipeMode === SwipeMode.SwipeBetweenMaps

  const showCustomizeScrollLayersSetting = swipeStyle === SwipeStyle.AdvancedHorizontal || swipeStyle === SwipeStyle.AdvancedVertical

  const showAllowDeactivateLayersSetting = ((swipeStyle === SwipeStyle.SimpleHorizontal || swipeStyle === SwipeStyle.SimpleVertical) && swipeMode === SwipeMode.SwipeBetweenLayers) || (swipeStyle === SwipeStyle.AdvancedHorizontal || swipeStyle === SwipeStyle.AdvancedVertical)

  const renderSwipeSetting = () => {
    return (
      <div className='h-100'>
        <SettingSection className='reset-template-and-select-map-section'>
          <SettingRow flow='wrap'>
            <div className='w-100'>
              <Button className='resetting-template' type='tertiary' disableHoverEffect={true} disableRipple={true} onClick={handleResetSwipeStyleClick} ref={resetButtonRef}>
                {translate('chooseOtherTemplateTip')}
              </Button>
            </div>
          </SettingRow>
          <SettingRow
            flow='wrap'
            label={translate('selectMapWidget')}
            aria-label={translate('selectMapWidget')}
            role='group'
          >
            <MapWidgetSelector onSelect={onMapWidgetSelected} useMapWidgetIds={useMapWidgetIds} warningMessage={!isMapUnoccupied() ? translate('mapOccupied') : ''} />
          </SettingRow>
        </SettingSection>
        {
          hasMap
            ? <div>
                {(swipeStyle === SwipeStyle.SimpleHorizontal || swipeStyle === SwipeStyle.SimpleVertical) &&
                  <SettingSection
                    title={translate('swipeMode')}
                    role='group'
                    aria-label={translate('swipeMode')}
                  >
                    <SettingRow>
                      <div className='d-flex justify-content-between w-100 align-items-center'>
                        <div className='align-items-center d-flex'>
                          <Label
                            className='d-flex align-items-center'
                          >
                            <Radio
                              className="mr-2"
                              style={{ cursor: 'pointer' }}
                              checked={swipeMode === SwipeMode.SwipeBetweenLayers}
                              onChange={() => { handleSwipeMode(SwipeMode.SwipeBetweenLayers) }}
                            />
                            {translate('swipeBetweenLayers')}
                          </Label>
                        </div>
                      </div>
                    </SettingRow>
                    <SettingRow>
                      <div className='d-flex justify-content-between w-100 align-items-center'>
                        <div className='align-items-center d-flex'>
                          <Label
                            className='d-flex align-items-center'
                          >
                            <Radio
                              className="mr-2"
                              style={{ cursor: 'pointer' }}
                              checked={swipeMode === SwipeMode.SwipeBetweenMaps}
                              disabled={mapUseDataSources?.length !== 2}
                              onChange={() => { handleSwipeMode(SwipeMode.SwipeBetweenMaps) }}
                            />
                            {translate('swipeBetweenMaps')}
                          </Label>
                        </div>
                      </div>
                    </SettingRow>
                  </SettingSection>
                }
                {showCustomizeSwipeLayersSetting &&
                    <CustomizeSwipeLayers
                      useMapWidgetId={useMapWidgetIds[0]}
                      onConfigChange={onConfigChange}
                      mapUseDataSources={mapUseDataSources}
                      swipeMapViewList={config.swipeMapViewList?.asMutable({ deep: true })}
                      swipeStyle={swipeStyle}
                      folderUrl={props.context.folderUrl}
                    />
                }
                {showCustomizeSwipeMapsSetting &&
                   <CustomizeSwipeMaps
                    onConfigChange={onConfigChange}
                    mapUseDataSourcesOrderList={config.mapUseDataSourcesOrderList}
                    mapUseDataSources={mapUseDataSources}
                    dsJsons={dsJsons}
                    swipeStyle={swipeStyle}
                    />
                }
                {showCustomizeScrollLayersSetting &&
                   <CustomizeScrollLayers
                      useMapWidgetId={useMapWidgetIds[0]}
                      onConfigChange={onConfigChange}
                      scrollMapViewList={config.scrollMapViewList?.asMutable({ deep: true })}
                      mapUseDataSources={mapUseDataSources}
                      swipeStyle={swipeStyle}
                      folderUrl={props.context.folderUrl}
                    />
                }
                <SettingSection
                  title={translate('arrangementStyle')}
                  role='group'
                  aria-label={translate('arrangementStyle')}
                >
                  <SettingRow className='arrangement-style'>
                    <div>
                      <Button
                        type='tertiary'
                        title={translate('panel')}
                        className={classNames('arrangement-btn', { active: detailsVisibility })}
                        onClick={() => { onPropertyChange(['styleConfig', 'detailsVisibility'], true) }}
                      >
                        <Icon
                          autoFlip
                          icon={require('./assets/swipe-panel.png')}
                          className='arrangement-img'
                        />
                      </Button>
                      <div className='title3 text-default text-center'>{translate('panel')}</div>
                    </div>
                    <div>
                      <Button
                        type='tertiary'
                        title={translate('bar')}
                        className={classNames('arrangement-btn', { active: !detailsVisibility })}
                        onClick={() => { onPropertyChange(['styleConfig', 'detailsVisibility'], false) }}
                      >
                        <Icon
                          autoFlip
                          icon={require('./assets/swipe-bar.png')}
                          className='arrangement-img'
                        />
                      </Button>
                      <div className='title3 text-default  text-center'>{translate('bar')}</div>
                    </div>
                  </SettingRow>
                </SettingSection>
                <SettingSection
                  title={translate('generalSettings')}
                  role='group'
                  aria-label={translate('generalSettings')}
                >
                {(swipeStyle === SwipeStyle.SimpleHorizontal || swipeStyle === SwipeStyle.SimpleVertical) &&
                  <SettingRow label={translate('sliderPosition')} >
                    <InputUnit
                      style={{ width: 70 }}
                      value={sliderPosition}
                      min={0}
                      max={100}
                      onChange={setSliderPosition}
                      aria-label={translate('sliderPosition')}
                    />
                  </SettingRow>}
                  <SettingRow label={translate('dividerColor')}>
                    <ThemeColorPicker
                      title={translate('dividerColor')}
                      aria-label={translate('dividerColor')}
                      value={dividerColor}
                      onChange={onDividerColorChange}
                      specificTheme={appTheme}
                    />
                  </SettingRow>
                  {(swipeStyle === SwipeStyle.SimpleHorizontal || swipeStyle === SwipeStyle.SimpleVertical) &&
                  <SettingRow label={translate('handleColor')}>
                    <ThemeColorPicker
                      title={translate('handleColor')}
                      aria-label={translate('handleColor')}
                      value={handleColor}
                      onChange={onHandleColorChange}
                      specificTheme={appTheme}
                    />
                  </SettingRow>}
                  <SettingRow tag='label' label={translate('defaultActivation')}>
                    <Switch
                      title={translate('defaultActivation')}
                      checked={defaultActivation}
                      onChange={(_, value: boolean) => { onPropertyChange(['styleConfig', 'defaultActivation'], value) }}
                    />
                  </SettingRow>
                  {showAllowDeactivateLayersSetting && detailsVisibility &&
                  <SettingRow tag='label' label={translate('allowDeactivateLayers')}>
                    <Switch
                      title={translate('allowDeactivateLayers')}
                      checked={isAllowDeactivateLayers}
                      onChange={onAllowDeactivateLayers}
                    />
                  </SettingRow>}
                  {showAllowDeactivateLayersSetting && detailsVisibility && !isExpressMode &&
                  <SettingRow tag='label' label={translate('toggleLayerVisibility')}>
                    <Switch
                      title={translate('toggleLayerVisibility')}
                      checked={toggleLayerVisibility}
                      onChange={(_, value: boolean) => { onPropertyChange(['styleConfig', 'toggleLayerVisibility'], value) }}
                    />
                  </SettingRow>}
                </SettingSection>
              </div>
            : <div className='d-flex justify-content-center align-items-center placeholder-container'>
                <div className='text-center'>
                  <ClickOutlined size={48} className='d-inline-block placeholder-icon mb-2' />
                  <p className='placeholder-hint'>{translate('selectMapHint')}</p>
                </div>
              </div>
        }

      </div>
    )
  }

  return (
    <div
      className={classNames(`${prefix}swipe-setting`, `${prefix}setting`)}
      css={STYLE}
    >
      { !swipeStyle
        ? <SwipeTemplates
            onPropertyChange={onPropertyChange}
            swipeStyle={previousSwipeStyle || DEFAULT_SWIPE_STYLE}
            folderUrl={props.context.folderUrl}
            resetButtonRef={resetButtonRef}
          />
        : renderSwipeSetting()
      }
    </div>
  )
}

export default Setting
