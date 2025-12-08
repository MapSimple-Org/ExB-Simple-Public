/** @jsx jsx */
import { Immutable, LayoutItemType, React, classNames, css, jsx, polished, type IMFieldSchema, type UseDataSource } from 'jimu-core'
import { getAppConfigAction, type AllWidgetSettingProps } from 'jimu-for-builder'
import { Button, Icon, Label, NumericInput, Switch, defaultMessages } from 'jimu-ui'
import { MapWidgetSelector, SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { Arrangement, type HighlightInfo, type IMConfig, type WatchLocationSettings } from '../config'
import { DEFAULT_ACTIVATION, DEFAULT_ARRANGEMENT, HIGHLIGHT_LOCATION, MANUAL_PATHTRACING, SELECTED_FIELDS, SELECTED_LINEPOINT_FIELDS, SHOW_COMPASS_ORIENTATION, SHOW_LOCATION_ACCURACY, STREAMING, SYMBOL_COLOR, TIME_OUT, WATCH_LOCATION, ZOOM_SCALE, ZOOM_TO_LOCATION } from '../constants'
import { createInitOutputDataSource, getInitSchema, getHiddenFields } from '../runtime/data-source/utils'
import { HighlightInfoSettings } from './components/highlight-info'
import { TrackLocation } from './components/track-location'
import { getStyle } from './style'
// nls
import nls from './translations/default'

import { ClickOutlined } from 'jimu-icons/outlined/application/click'
import { LayoutItemSizeModes, searchUtils } from 'jimu-layouts/layout-runtime'
import { FieldSelector, dataComponentsUtils } from 'jimu-ui/advanced/data-source-selector'
import { List, TreeItemActionType } from 'jimu-ui/basic/list-tree'
import { DataSourceManager } from 'jimu-core'
interface States {
  isSelectedMap: boolean
  isShowAdvancedSetting: boolean
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, States> {
  constructor(props) {
    super(props)

    this.state = {
      isSelectedMap: !!(this.props.useMapWidgetIds?.[0]),
      isShowAdvancedSetting: false,
    }
  }

  trackPointOutId = this.props.id + '_output_track'
  trackLinePointOutId = this.props.id + '_output_trackline_point'
  trackLinePointLabel = this.props.intl.formatMessage({ id: 'trackDsLabel', defaultMessage: nls.trackDsLabel })
  trackPointOutLabel = this.props.intl.formatMessage({ id: 'trackDsLabel', defaultMessage: nls.trackDsLabel })

  componentDidMount() {
    if (this.props.useMapWidgetIds?.[0]) {
      this.setState({ isSelectedMap: true })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.useMapWidgetIds?.[0] !== this.props.useMapWidgetIds?.[0]) {
      this.setState({ isSelectedMap: !!(this.props.useMapWidgetIds?.[0]) })
    }
  }

  crateDataSources = (isTrack: boolean) => {
    if (isTrack) {
      const trackLineOutId = this.props.id + '_output_trackline'
      const trackLineOutLabel = this.props.intl.formatMessage({ id: 'trackLineDsLabel', defaultMessage: nls.trackLineDsLabel })

      const trackLinePointOutputDataSource = createInitOutputDataSource(this.props.intl, this.trackLinePointOutId, this.trackLinePointLabel, 'trackline_point', 'esriGeometryPoint')
      const trackLineOutputDataSource = createInitOutputDataSource(this.props.intl, trackLineOutId, trackLineOutLabel, 'trackline', 'esriGeometryPolyline')
      this.props.onSettingChange({
        id: this.props.id,
        useDataSources: []
      }, [trackLinePointOutputDataSource, trackLineOutputDataSource])
    } else {
      const trackPointOutputDataSource = createInitOutputDataSource(this.props.intl, this.trackPointOutId, this.trackPointOutLabel, 'track', 'esriGeometryPoint')
      this.props.onSettingChange({
        id: this.props.id,
        useDataSources: []
      }, [trackPointOutputDataSource])
    }
  }

  //Maps
  handleMapWidgetChange = (useMapWidgetIds: string[]): void => {
    const _isSelectMap = !!(useMapWidgetIds?.[0])
    this.setState({ isSelectedMap: _isSelectMap })

    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    })
    if (_isSelectMap) {
      this.crateDataSources(this.props.config.watchLocation ?? WATCH_LOCATION)
    }
  }

  updateLayoutItemHeight = (auto: boolean) => {
    const appConfigAction = getAppConfigAction()
    const layoutInfos = searchUtils.getLayoutInfosHoldContent(appConfigAction.appConfig, LayoutItemType.Widget, this.props.id)
    layoutInfos.forEach(layoutInfo => {
      if (auto) {
        appConfigAction
          .editLayoutItemProperty(layoutInfo, 'setting.autoProps.height', LayoutItemSizeModes.Auto)
          .exec()
      } else {
        appConfigAction
          .editLayoutItemProperty(layoutInfo, 'setting.autoProps.height', LayoutItemSizeModes.Custom)
          .editLayoutItemProperty(layoutInfo, 'bbox.height', '430px')
          .exec()
      }
    })
  }

  // Arrangement
  handleArrangementChange = (arrangement: Arrangement): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('arrangement', arrangement)
    })
    this.updateLayoutItemHeight(arrangement === Arrangement.Toolbar)
    getAppConfigAction().editWidgetProperty(this.props.id, 'offPanel', arrangement === Arrangement.Toolbar).exec()
  }

  handleShowAdvancedSettingClick = () => {
    this.setState({
      isShowAdvancedSetting: !this.state.isShowAdvancedSetting
    })
  }

  // highlightLocation
  handleHighlightLocationChange = (value: boolean): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('highlightLocation', value)
    })
  }

  // highlightInfo
  handleHighlightInfoChange = (HighlightInfo): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('highlightInfo', HighlightInfo)
    })
  }

  // Zoom Scale
  handleZoomScale = (zoomScale: number): void => {
    if (zoomScale < 35.2655368 || zoomScale > 591657527) {
      zoomScale = 50000
    }
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('zoomScale', zoomScale)
    })
  }

  // TimeOut
  handleTimeOut = (timeOut: number): void => {
    if (timeOut < 1 || timeOut > 60) {
      timeOut = 15
    }
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('timeOut', timeOut)
    })
  }

  // Fields
  handleFieldsChange = (allSelectedFields: IMFieldSchema[], ...params): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('selectedFields', allSelectedFields.map(field => field.jimuName))
    })
  }

  onItemUpdated = (parentItemJson, currentIndex: number) => {
    const newSelectedFields = parentItemJson.map(item => {
      return item.itemStateDetailContent.jimuName
    })
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('selectedFields', newSelectedFields)
    })
  }

  handleDefaultActivationTipsChange = (value: boolean): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('defaultActivation', value)
    })
  }

  // Track location
  handleTrackLocationChange = (value: boolean): void => {
    this.crateDataSources(value)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('watchLocation', value).set('selectedFields', value ? SELECTED_LINEPOINT_FIELDS : SELECTED_FIELDS)
    })
  }

  handleTrackLocationSettingsChange = (watchLocationSettings: WatchLocationSettings): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('watchLocationSettings', watchLocationSettings)
    })
  }

  onShowRuntimeLayersChange = (value: boolean): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('showRuntimeLayers', value)
    })
  }

  getSelectorFields = (showFields) => {
    const selectorFields: string[] = []
    if (showFields && showFields.length > 0) {
      showFields.forEach(item => {
        selectorFields.push(item.jimuName)
      })
    }
    return selectorFields
  }

  render() {
    const advancedActionMap = {
      overrideItemBlockInfo: ({ itemBlockInfo }, refComponent) => {
        return {
          name: TreeItemActionType.RenderOverrideItem,
          children: [{
            name: TreeItemActionType.RenderOverrideItemDroppableContainer,
            children: [{
              name: TreeItemActionType.RenderOverrideItemContent,
              children: [{
                name: TreeItemActionType.RenderOverrideItemBody,
                children: [{
                  name: TreeItemActionType.RenderOverrideItemMainLine,
                  children: [{
                    name: TreeItemActionType.RenderOverrideItemDraggableContainer,
                    children: [{
                      name: TreeItemActionType.RenderOverrideItemDragHandle
                    }, {
                      name: TreeItemActionType.RenderOverrideItemChildrenToggle
                    }, {
                      name: TreeItemActionType.RenderOverrideItemIcon
                    }, {
                      name: TreeItemActionType.RenderOverrideItemTitle
                    }, {
                      name: TreeItemActionType.RenderOverrideItemCommands
                    }]
                  }]
                }, {
                  name: TreeItemActionType.RenderOverrideItemDetailLine
                }]
              }]
            }]
          }]
        }
      }
    }
    const useDataSource: UseDataSource = this.props.outputDataSources?.length > 0
      ? {
        dataSourceId: this.props.outputDataSources?.[0],
        mainDataSourceId: this.props.outputDataSources?.[0]
      }
      : null
    const selectedFields = this.props.config.selectedFields ?? (WATCH_LOCATION ? SELECTED_LINEPOINT_FIELDS : SELECTED_FIELDS)
    const hiddenFields = getHiddenFields(this.props.config.watchLocation ?? WATCH_LOCATION ? 'trackline_point' : 'track')
    const enableEdit = false
    // read all fields from the output data source
    let allSchemaFields = DataSourceManager.getInstance().getDataSource(this.props.outputDataSources?.[0])?.getSchema()?.fields
    if (!allSchemaFields) {
      // read origin scheme fields
      const originFieldsSchema = this.props.config.watchLocation ?? WATCH_LOCATION ? getInitSchema(this.props.intl, '', 'trackline_point')?.fields : getInitSchema(this.props.intl, '', 'track')?.fields
      allSchemaFields = Immutable(originFieldsSchema)
    }
    const dsTableFields = selectedFields?.map(item => {
      const newItem = allSchemaFields?.[item]
      return newItem || null
    }).filter(item => item !== null)

    const a11yUIMode0Id = this.props.id + '-uimode-0'
    const a11yUIMode1Id = this.props.id + '-uimode-1'
    //Maps
    const selectMapWidgetTips = this.props.intl.formatMessage({ id: 'selectMapWidget', defaultMessage: defaultMessages.selectMapWidget })
    const selectMapHint = this.props.intl.formatMessage({ id: 'selectMapHint', defaultMessage: defaultMessages.selectMapHint })
    //Arrangement
    const arrangementTips = this.props.intl.formatMessage({ id: 'arrangementTips', defaultMessage: nls.arrangementTips })
    const panelTips = this.props.intl.formatMessage({ id: 'panelTips', defaultMessage: nls.panelTips })
    const toolbarTips = this.props.intl.formatMessage({ id: 'toolbarTips', defaultMessage: nls.toolbarTips })
    // Zoom scale
    const zoomScaleTips = this.props.intl.formatMessage({ id: 'zoomScale', defaultMessage: defaultMessages.zoomScale })
    const zoomToLocationTips = this.props.intl.formatMessage({ id: 'zoomToLocation', defaultMessage: nls.zoomToLocation })
    //General settings
    const generalSettingsTips = this.props.intl.formatMessage({ id: 'generalSettingsTips', defaultMessage: nls.generalSettingsTips })
    //HIGHLIGHT_LOCATION
    const highlightLocationTips = this.props.intl.formatMessage({ id: 'highlightLocationTips', defaultMessage: nls.highlightLocationTips })

    // Timeout
    const timeoutTips = this.props.intl.formatMessage({ id: 'timeoutTips', defaultMessage: nls.timeoutTips })
    // Fields
    const selectFieldsTips = this.props.intl.formatMessage({ id: 'selectFieldsTips', defaultMessage: nls.selectFieldsTips })
    // Default activation
    const defaultActivationTips = this.props.intl.formatMessage({ id: 'defaultActivationTips', defaultMessage: nls.defaultActivationTips })
    // Track location
    const trackLocationTips = this.props.intl.formatMessage({ id: 'trackLocationTips', defaultMessage: nls.trackLocationTips })
    // ShowRuntimeLayers
    const showRuntimeLayersTips = this.props.intl.formatMessage({ id: 'showRuntimeLayers', defaultMessage: defaultMessages.showRuntimeLayers })

    return (

      <div css={getStyle(this.props.theme, polished)} className='widget-setting-menu jimu-widget-setting'>
        <SettingSection title={selectMapWidgetTips} className={classNames('map-selector-section', { 'border-0': !this.state.isSelectedMap })} role='group' aria-label={selectMapWidgetTips} >
          <SettingRow >
            <MapWidgetSelector onSelect={this.handleMapWidgetChange} useMapWidgetIds={this.props.useMapWidgetIds} />
          </SettingRow>
        </SettingSection>

        {/* no map tips */}
        {!this.state.isSelectedMap && <div className='d-flex placeholder-container justify-content-center align-items-center'>
          <div className='d-flex text-center placeholder justify-content-center align-items-center '>
            <ClickOutlined size={48} className='d-flex icon mb-2' />
            <p className='hint'>{selectMapHint}</p>
          </div>
        </div>}

        {/* Settings related to map after map loaded */}
        {this.state.isSelectedMap && <React.Fragment>
          {/* 2. Arrangement */}
          <SettingSection title={arrangementTips} role='group' aria-label={arrangementTips} >
            <SettingRow aria-label={arrangementTips}>
              <div className='ui-mode-card-chooser'>
                { /* Panel */}
                <Label className='d-flex flex-column ui-mode-card-wapper'>
                  <Button variant='text' disableHoverEffect={true} disableRipple={true} icon className={classNames('ui-mode-card', { active: ((this.props.config.arrangement ?? DEFAULT_ARRANGEMENT) === Arrangement.Panel) })}
                    onClick={() => { this.handleArrangementChange(Arrangement.Panel) }}
                    aria-label={panelTips}
                    title={panelTips}
                  >
                    <Icon width={100} height={72} icon={require('./assets/arrangements/style0.svg')} autoFlip />
                  </Button>
                  <div id={a11yUIMode0Id} className='mx-1 text-break ui-mode-label'>{panelTips}</div>
                </Label>

                <div className='ui-mode-card-separator' />

                { /* Toolbar */}
                <Label className='d-flex flex-column ui-mode-card-wapper'>
                  <Button variant='text' disableHoverEffect={true} disableRipple={true} icon className={classNames('ui-mode-card', { active: ((this.props.config.arrangement ?? DEFAULT_ARRANGEMENT) === Arrangement.Toolbar) })}
                    onClick={() => { this.handleArrangementChange(Arrangement.Toolbar) }}
                    aria-label={toolbarTips}
                    title={toolbarTips}>
                    <Icon width={100} height={72} icon={require('./assets/arrangements/style1.svg')} autoFlip />
                  </Button>
                  <div id={a11yUIMode1Id} className='mx-1 text-break ui-mode-label'>{toolbarTips}</div>
                </Label>
              </div>
            </SettingRow>
          </SettingSection>

          {/* General settings */}
          <SettingSection title={generalSettingsTips} role='group' >
            {/* highlightLocation */}
            <SettingRow tag='label' label={highlightLocationTips} className='bold-font-label' >
              <Switch checked={this.props.config.highlightLocation ?? HIGHLIGHT_LOCATION} onChange={(evt) => { this.handleHighlightLocationChange(evt.target.checked) }} />
            </SettingRow>
            {(this.props.config.highlightLocation ?? HIGHLIGHT_LOCATION) &&
              <HighlightInfoSettings
                theme={this.props.theme} intl={this.props.intl}
                highlightInfo={this.props.config.highlightInfo?.asMutable() ?? { symbolColor: SYMBOL_COLOR, showCompassOrientation: SHOW_COMPASS_ORIENTATION, showLocationAccuracy: SHOW_LOCATION_ACCURACY } as HighlightInfo}
                onHighlightInfoChange={this.handleHighlightInfoChange}
              />
            }
            <SettingRow label={zoomToLocationTips} className='bold-font-label' >
              <Switch checked={this.props.config.zoomToLocation ?? ZOOM_TO_LOCATION} onChange={(evt) => { this.props.onSettingChange({ id: this.props.id, config: this.props.config.set('zoomToLocation', evt.target.checked) }) }} />
            </SettingRow>
            {(this.props.config.zoomToLocation ?? ZOOM_TO_LOCATION) && <SettingRow label={zoomScaleTips} className='bold-font-label' >
              <Label className='setting-label'>1:</Label> <NumericInput className={'zoom-scale-input'} showHandlers={false} defaultValue={ZOOM_SCALE} value={this.props.config.zoomScale ?? ZOOM_SCALE} onAcceptValue={this.handleZoomScale} aria-label={zoomScaleTips} />
            </SettingRow>}
            <SettingRow label={timeoutTips} className='bold-font-label' >
              <NumericInput className={'zoom-scale-input'} showHandlers={true} defaultValue={TIME_OUT} value={this.props.config.timeOut ?? TIME_OUT} onAcceptValue={this.handleTimeOut} aria-label={timeoutTips} />
            </SettingRow>

            <SettingRow flow='wrap' label={selectFieldsTips} className='bold-font-label' >
              <FieldSelector
                useDataSources={
                  useDataSource ? Immutable([useDataSource]) : Immutable([])
                }
                css={css`width: 120px; .jimu-dropdown { width: 100%; }`}
                aria-label={selectFieldsTips}
                onChange={this.handleFieldsChange}
                selectedFields={Immutable(selectedFields)}
                hiddenFields={Immutable(hiddenFields)}
                isMultiple
                isDataSourceDropDownHidden
                useDropdown
                useMultiDropdownBottomTools
              />
            </SettingRow>
            <SettingRow className='selected-fields-con mt-2'>
              <List
                className='selected-fields-list'
                itemsJson={Array.from(dsTableFields).map((item, index) => ({
                  itemStateDetailContent: item,
                  itemExpandIconShown: false,
                  itemStateExpanded: false,
                  itemKey: `${index}`,
                  itemStateIcon: dataComponentsUtils.getIconFromFieldType(item.type, this.props.theme),
                  itemStateTitle: item.alias || item.jimuName || item.name,
                  isCheckboxDisabled: true,
                  itemStateCommands: []
                }))}
                onUpdateItem={(actionData, refComponent) => {
                  if (actionData.updateType === TreeItemActionType.HandleDidDrop) {
                    const { itemJsons } = refComponent.props
                    const [currentItemJson, parentItemJson] = itemJsons
                    this.onItemUpdated(parentItemJson, +currentItemJson.itemKey)
                  }
                }}
                dndEnabled
                isMultiSelection={enableEdit}
                {...advancedActionMap}
              />
            </SettingRow>
            {/* Track location */}
            <SettingRow tag='label' label={trackLocationTips} className='bold-font-label' >
              <Switch checked={this.props.config.watchLocation ?? WATCH_LOCATION} onChange={evt => { this.handleTrackLocationChange(evt.target.checked) }} />
            </SettingRow>
            {(this.props.config.watchLocation ?? WATCH_LOCATION) &&
              <TrackLocation
                theme={this.props.theme} intl={this.props.intl}
                timeOut={this.props.config.timeOut ?? TIME_OUT}

                watchLocationSettings={this.props.config.watchLocationSettings?.asMutable() ?? { manualPathTracing: MANUAL_PATHTRACING, streaming: { type: STREAMING.TYPE, unit: STREAMING.UNIT, interval: STREAMING.INTERVAL } }}
                onTrackLocationSettingsChange={this.handleTrackLocationSettingsChange}
              />
            }
            <SettingRow tag='label' label={showRuntimeLayersTips} >
              <Switch
                checked={this.props.config?.showRuntimeLayers ?? true}
                onChange={evt => { this.onShowRuntimeLayersChange(evt.target.checked) }}
              />
            </SettingRow>
            <SettingRow tag='label' label={defaultActivationTips} className='bold-font-label' >
              <Switch checked={this.props.config.defaultActivation ?? DEFAULT_ACTIVATION} onChange={evt => { this.handleDefaultActivationTipsChange(evt.target.checked) }} />
            </SettingRow>
          </SettingSection>
        </React.Fragment>}
      </div>
    )
  }
}
