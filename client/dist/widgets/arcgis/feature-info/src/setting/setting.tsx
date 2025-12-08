/** @jsx jsx */
import {
  React, Immutable, type ImmutableObject, type DataSourceJson, type IMState, FormattedMessage, jsx, getAppStore, DataSourceManager,
  type UseDataSource, type DataSource
} from 'jimu-core'
import { Button, ButtonGroup, Dropdown, DropdownButton, DropdownMenu, DropdownItem, TextArea, DistanceUnits, type LinearUnit, defaultMessages as jimuDefaultMessages, Alert, Select, Switch, Radio, Label, Checkbox } from 'jimu-ui'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { SettingSection, SettingRow, SidePopper, MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import { type AllWidgetSettingProps, builderAppSync } from 'jimu-for-builder'
import { type IMConfig, StyleType, FontSizeType, type DSConfig } from '../config'
import defaultMessages from './translations/default'
import { getStyle } from './lib/style'
import DSSetting from './ds-setting'
import { InputUnit } from 'jimu-ui/advanced/style-setting-components'
import { List, TreeItemActionType } from 'jimu-ui/basic/list-tree'
import CloseOutlined from 'jimu-icons/svg/outlined/editor/close.svg'
import { getDefaultConfig, createDefaultDSConfig } from '../utils'

interface ExtraProps {
  dsJsons: ImmutableObject<{ [dsId: string]: DataSourceJson }>
}

export interface WidgetSettingState {
  useMapWidget: boolean

  showSidePanel: boolean
  showSidePanelForNew: boolean
  currentDSConfigId: string
  focusDSConfigId: string
}

const MESSAGES = Object.assign({}, defaultMessages, jimuDefaultMessages)

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig> & ExtraProps, WidgetSettingState> {
  addDataBtnRef = React.createRef<HTMLButtonElement>()
  dsListContentRef = React.createRef<HTMLDivElement>()

  static mapExtraStateProps = (state: IMState): ExtraProps => {
    return {
      dsJsons: state.appStateInBuilder.appConfig.dataSources
    }
  }

  static getFullConfig (config) {
    return getDefaultConfig().merge(config, { deep: true })
  }

  constructor (props) {
    super(props)
    this.state = {
      useMapWidget: this.props.config.useMapWidget || false,
      showSidePanel: false,
      showSidePanelForNew: false,
      currentDSConfigId: '',
      focusDSConfigId: ''
    }
  }

  getPortUrl = (): string => {
    const portUrl = getAppStore().getState().portalUrl
    return portUrl
  }

  getStyleConfig () {
    if (this.props.config.style) {
      return this.props.config.style
    } else {
      return {
        textColor: '',
        fontSize: {
          distance: 0,
          unit: DistanceUnits.PIXEL
        },
        backgroundColor: ''
      }
    }
  }

  onRadioChange = (useMapWidget) => {
    this.setState({
      useMapWidget: useMapWidget
    })

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.set('useMapWidget', useMapWidget),
      useDataSources: useMapWidget ? null : this.getUseDataSourcesByDSConfig()
    })
  }

  onPropertyChange = (name, value) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.set(name, value)
    })
  }

  onContentOptionsChanged = (dsConfigId: string, checked: boolean, name: string): void => {
    if (!dsConfigId) {
      return
    }
    let newDSConfigs = this.getDSConfigs().asMutable({ deep: true })
    newDSConfigs = newDSConfigs.map(dsConfig => {
      if (dsConfig.id === dsConfigId) {
        dsConfig.contentConfig[name] = checked
      }
      return dsConfig
    })
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.set('dsConfigs', newDSConfigs)
    })
  }

  onLabelChange = (dsConfigId: string, label: string): void => {
    if (!dsConfigId) {
      return
    }
    let newDSConfigs = this.getDSConfigs().asMutable({ deep: true })
    newDSConfigs = newDSConfigs.map(dsConfig => {
      if (dsConfig.id === dsConfigId) {
        dsConfig.label = label
      }
      return dsConfig
    })
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.set('dsConfigs', newDSConfigs)
    })
  }

  onStyleTypeChanged = (event) => {
    const styleType = event.target.value
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.set('styleType', styleType)
    })
  }

  onStyleChanged = (key, value) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.setIn(['style', key], value)
    })
  }

  onSelectAutoFontSizeType = () => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.setIn(['style', 'fontSizeType'], FontSizeType.auto)
    })
  }

  onSelectCustomFontSizeType = () => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.setIn(['style', 'fontSizeType'], FontSizeType.custom)
    })
  }

  onFontSizeChanged = (value) => {
    // let fontSize = this.getStyleConfig().fontSize || {};
    // fontSize = {...fontSize, ...value};
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.setIn(['style', 'fontSize'], value)
    })
  }

  onRemoveDSConfig = (dsConfigId) => {
    if (!dsConfigId) {
      return
    }

    // update data source config
    const newDSConfigs = []
    this.getDSConfigs().forEach(dsConfig => {
      if (dsConfig.id !== dsConfigId) {
        newDSConfigs.push(dsConfig)
      }
    })

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.set('dsConfigs', newDSConfigs),
      useDataSources: this.getUseDataSourcesByDSConfig(newDSConfigs)
    })
  }

  onDataSourceOrderChange = (dsConfigs: DSConfig[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.set('dsConfigs', dsConfigs)
    })
  }

  onDataSourceChange = (useDataSources: UseDataSource[]) => {
    if (!useDataSources || useDataSources.length === 0 || useDataSources[0].dataSourceId === this.state.currentDSConfigId) {
      return
    }

    let newDSConfigs = this.getDSConfigs().asMutable({ deep: true })
    if (this.state.currentDSConfigId) {
      // update data source
      let dsConfig = this.getDSConfigById(this.state.currentDSConfigId)
      dsConfig = dsConfig.asMutable({ deep: true })
      dsConfig.useDataSourceId = useDataSources[0].dataSourceId
      dsConfig.label = this.getDSLabel(useDataSources[0].dataSourceId) || dsConfig.id
      newDSConfigs = newDSConfigs.map(dsConfigParam => {
        return dsConfigParam.id === dsConfig.id ? dsConfig : dsConfigParam
      })
    } else {
      // add data source config
      const selectedDs: DataSource[] = useDataSources.map(useDataSource => DataSourceManager.getInstance().getDataSource(useDataSource.dataSourceId))
      let firstNewDSConfig
      selectedDs.forEach((dataSource, index) => {
        if (!dataSource?.getDataSourceJson()?.isHidden) {
          const newDSConfig = createDefaultDSConfig(dataSource.id)
          if (index === 0) {
            firstNewDSConfig = newDSConfig
          }
          newDSConfigs.push(newDSConfig)
        }
      })
      if (firstNewDSConfig) {
        this.setState({
          currentDSConfigId: firstNewDSConfig.id,
          showSidePanelForNew: false
        })
        builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'currentDSConfigId', value: firstNewDSConfig.id })
      }
    }

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.savedConfig.set('dsConfigs', newDSConfigs),
      useDataSources: this.getUseDataSourcesByDSConfig(newDSConfigs)
    })
  }

  getUseDataSourcesByDSConfig = (dsConfigsParam?) => {
    const newUseDataSources = []
    const dSConfigs = dsConfigsParam || this.getDSConfigs()
    dSConfigs.forEach(dsConfig => {
      if (!newUseDataSources.find(newUseDataSource => newUseDataSource.dataSourceId === dsConfig.useDataSourceId)) {
        const dataSource = DataSourceManager.getInstance().getDataSource(dsConfig.useDataSourceId)
        newUseDataSources.push({
          dataSourceId: dataSource.id,
          mainDataSourceId: dataSource.getMainDataSource()?.id,
          dataViewId: dataSource.dataViewId,
          rootDataSourceId: dataSource.getRootDataSource()?.id,
          useFieldsInPopupInfo: true
        } as UseDataSource)
      }
    })
    return newUseDataSources
  }

  i18nMessage = (id: string, defaultMessage?: string) => {
    const { intl } = this.props
    return intl ? intl.formatMessage({ id: id, defaultMessage: defaultMessage || MESSAGES[id] }) : ''
  }

  getAdvancedActionMap = () => {
    const advancedActionMap = {
      overrideItemBlockInfo: ({ itemBlockInfo }, refComponent) => {
        return {
          name: TreeItemActionType.RenderOverrideItem,
          children: [{
            name: TreeItemActionType.RenderOverrideItemDroppableContainer,
            children: [{
              name: TreeItemActionType.RenderOverrideItemDraggableContainer,
              children: [{
                name: TreeItemActionType.RenderOverrideItemBody,
                children: [{
                  name: TreeItemActionType.RenderOverrideItemMainLine,
                  children: [{
                    name: TreeItemActionType.RenderOverrideItemDragHandle
                  }, {
                    name: TreeItemActionType.RenderOverrideItemIcon,
                    autoCollapsed: true
                  }, {
                    name: TreeItemActionType.RenderOverrideItemTitle
                  }, {
                    name: TreeItemActionType.RenderOverrideItemDetailToggle
                  }, {
                    name: TreeItemActionType.RenderOverrideItemCommands
                  }]
                }]
              }]
            }]
          }]
        }
      }
    }
    return advancedActionMap
  }

  onShowSidePanel = (newAdded: boolean = false, currentDSConfigId?: string) => {
    this.setState({
      currentDSConfigId: currentDSConfigId,
      focusDSConfigId: newAdded ? '' : currentDSConfigId,
      showSidePanel: true,
      showSidePanelForNew: newAdded
    })
  }

  onCloseSidePanel = () => {
    this.setState({
      currentDSConfigId: '',
      showSidePanel: false,
      showSidePanelForNew: false
    })
  }

  //onToolsChanged = (checked, name): void => {
  //  this.props.onSettingChange({
  //    id: this.props.id,
  //    config: this.props.config.set(name, checked)
  //  })
  //}

  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  getDSLabel = (dataSourceId) => {
    const dataSource = DataSourceManager.getInstance().getDataSource(dataSourceId)
    return dataSource?.getLabel() || ''
  }

  getDSConfigs = () => {
    const dsConfigs = this.props.config.dsConfigs || Immutable([])
    return dsConfigs.map(dsConfig => {
      if (dsConfig.label === null || dsConfig.label === undefined) {
        // label is null or undefined means the config was upgraded from a previous version
        // cannot get data source label in version manager because the data sources haven't been loaded
        const dataSource = DataSourceManager.getInstance().getDataSource(dsConfig.useDataSourceId)
        return dsConfig.set('label', dataSource?.getLabel() || '')
      } else {
        return dsConfig
      }
    })
  }

  getDSConfigById = (id) => {
    return this.getDSConfigs().find(dsConfig => dsConfig.id === id)
  }

  getUseDataSourceById = (dataSourceId: string): UseDataSource => {
    const useDataSources = this.props.useDataSources || Immutable([])
    return useDataSources.find(useDataSource => useDataSource.dataSourceId === dataSourceId)
  }

  isDataSourceAccessible = (dataSourceId: string) => {
    return !!this.props.useDataSources?.find(useDs => dataSourceId === useDs.dataSourceId)
  }

  getDSListContent = () => {
    const dsConfigs = this.getDSConfigs()
    const itemsLength = dsConfigs.length
    const advancedActionMap = this.getAdvancedActionMap()
    return (<SettingSection className={`pt-0 ${itemsLength > 0 ? '' : 'pb-0'} border-0`}>
      <div className='setting-ui-unit-list' ref={this.dsListContentRef}>
        {!!itemsLength &&
          <List
            className='data-source-list'
            itemsJson={Array.from(dsConfigs).map((item: DSConfig, index) => ({
              itemStateDetailContent: item,
              itemKey: `${index}`,
              itemStateChecked: this.state.showSidePanel && this.state.currentDSConfigId === item.id,
              itemStateTitle: item.label,
              itemStateCommands: [
                {
                  label: this.i18nMessage('remove'),
                  iconProps: () => ({ icon: CloseOutlined, size: 12 }),
                  action: () => {
                    this.onRemoveDSConfig(item.id)
                  }
                }
              ]
            }))}
            dndEnabled={true}
            renderOverrideItemDetailToggle={(actionData, refComponent) => {
              //const { itemJsons } = refComponent.props
              //const [currentItemJson] = itemJsons
              //const dsId = currentItemJson?.itemStateDetailContent?.useDataSource?.dataSourceId
              const { itemJsons: [currentItemJson] } = refComponent.props
              const dsId = currentItemJson.itemStateDetailContent.useDataSourceId
              const accessible = this.isDataSourceAccessible(dsId)
              return !accessible
                ? <Alert
                  buttonType='tertiary'
                  form='tooltip'
                  size='small'
                  type='error'
                  text={this.i18nMessage('dataSourceCreateError')}
                >
                </Alert>
                : ''
            }}
            onUpdateItem={(actionData, refComponent) => {
              const { itemJsons, updateType } = actionData
              if (updateType === TreeItemActionType.HandleDidDrop) {
                const dsConfigs = itemJsons[1]?.map(item => item.itemStateDetailContent)
                this.onDataSourceOrderChange(dsConfigs)
              }
            }}
            onClickItemBody={(actionData, refComponent) => {
              const { itemJsons: [currentItemJson] } = refComponent.props
              const currentDSConfigId = currentItemJson.itemStateDetailContent.id
              const dsId = currentItemJson.itemStateDetailContent.useDataSourceId
              const accessible = this.isDataSourceAccessible(dsId)
              if (accessible) {
                this.onShowSidePanel(false, currentDSConfigId)
                builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'currentDSConfigId', value: currentDSConfigId })
              }
            }}
            {...advancedActionMap}
          />
        }
        { this.state.showSidePanel && this.state.showSidePanelForNew &&
          <List
            className='setting-ui-unit-list-new'
            itemsJson={[{
              name: '......'
            }].map((item, x) => ({
              itemStateDetailContent: item,
              itemKey: `${x}`,
              itemStateChecked: true,
              itemStateTitle: item.name,
              itemStateCommands: []
            }))}
            dndEnabled={false}
            renderOverrideItemDetailToggle={() => '' }
            {...advancedActionMap}
          />
        }
      </div>
    </SettingSection>)
  }

  getStyleContent = () => {
    let unitContent
    let styleDetailContent
    const styleTypeContent = (
      <Select size='sm' value={this.props.config?.styleType} onChange={this.onStyleTypeChanged} className=''>
        {/*<option key={1} value={StyleType.syncWithTheme}><FormattedMessage id="syncWithTheme" defaultMessage={defaultMessages.syncWithTheme}/></option>*/}
        <option key={2} value={StyleType.usePopupDefined}><FormattedMessage id='respectTheSource' defaultMessage={defaultMessages.respectTheSource} /></option>
        <option key={3} value={StyleType.custom}><FormattedMessage id='custom' defaultMessage='abc' /></option>
      </Select>
    )

    if (this.props.config.styleType === 'custom') {
      if (this.props.config.style.fontSizeType === FontSizeType.custom) {
        unitContent = (
          <InputUnit
            style={{ width: '6.5rem' }} units={[DistanceUnits.PIXEL, DistanceUnits.PERCENTAGE]} className='item' min={1} value={this.getStyleConfig().fontSize as LinearUnit}
            onChange={this.onFontSizeChanged}
          />
        )
      } else {
        unitContent = (
          <Button style={{ width: '6.5rem' }} disabled size='sm'>
            <FormattedMessage id='auto' defaultMessage='Auto' />
          </Button>
        )
      }

      styleDetailContent = (
        <div>
          <SettingRow
            className='mt-4'
            label={<FormattedMessage id='textSize' defaultMessage={defaultMessages.textSize} />}
            aria-label={this.i18nMessage('textSize')}
            role="group"
          >
            <ButtonGroup>
              <Dropdown activeIcon className='dropdown'>
                <DropdownButton size='sm' style={{ width: 'auto', right: '1px' }} icon aria-haspopup="menu" />
                <DropdownMenu className='dropdown-menu' zIndex={55} alignment='start'>
                  <DropdownItem
                    key={1} active={this.props.config.style.fontSizeType === FontSizeType.auto}
                    onClick={this.onSelectAutoFontSizeType}
                  >
                    <FormattedMessage id='auto' defaultMessage='Auto' />
                  </DropdownItem>
                  <DropdownItem
                    key={2} active={this.props.config.style.fontSizeType === FontSizeType.custom}
                    onClick={this.onSelectCustomFontSizeType}
                  >
                    <FormattedMessage id='custom' defaultMessage='Custom' />
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              {unitContent}
            </ButtonGroup>

          </SettingRow>
          <SettingRow label={<FormattedMessage id='textColor' defaultMessage='Text color' />}>
            <ThemeColorPicker specificTheme={this.props.theme2} value={this.getStyleConfig().textColor} onChange={value => { this.onStyleChanged('textColor', value) }} aria-label={this.i18nMessage('textColor')}/>
          </SettingRow>
        </div>
      )
    }

    return (<SettingSection title={this.i18nMessage('style')} aria-label={this.i18nMessage('style')} role="group">
      {styleTypeContent}
      {styleDetailContent}
      {/* <SettingRow label={<FormattedMessage id="background" defaultMessage={'Background'}/>}>
        <ThemeColorPicker specificTheme={this.props.theme2} value={this.getStyleConfig().backgroundColor} onChange={value => this.onStyleChanged('backgroundColor', value)} ></ThemeColorPicker>
      </SettingRow> */}
    </SettingSection>)
  }

  getDSSelectionContent = () => {
    return (
      <div className={'mb-4'}>
        <SettingRow>
          <Radio
            id="map-view"
            style={{ cursor: 'pointer' }}
            name="source-option"
            onChange={(e) => { this.onRadioChange(false) }}
            checked={!this.state.useMapWidget}
          />
          <Label
            style={{ cursor: 'pointer' }}
            for="map-view"
            className="ml-1"
          >
            {this.i18nMessage('addStandAlongDataStr')}
          </Label>
        </SettingRow>
        <SettingRow>
          <Radio
            id="map-data"
            style={{ cursor: 'pointer' }}
            name="source-option"
            onChange={(e) => { this.onRadioChange(true) }}
            checked={this.state.useMapWidget}
          />
          <Label
            style={{ cursor: 'pointer' }}
            for="map-data"
            className="ml-1"
          >
            {this.i18nMessage('interactWithMap')}
          </Label>
        </SettingRow>
      </div>
    )
  }

  getMapSelectorContent = () => {
    return (
      <div className="map-selector-section">
        <SettingRow>
          <MapWidgetSelector
            onSelect={this.onMapWidgetSelected}
            useMapWidgetIds={this.props.useMapWidgetIds}
          />
        </SettingRow>
        {/*<JimuMapViewComponent
          useMapWidgetId={this.props.useMapWidgetIds?.[0]}
          onViewsCreate={this.onViewsCreate}
        />*/}
      </div>
    )
  }

  getAddDataContent = () => {
    return (
      <SettingRow>
        <Button
          className='w-100 text-default add-table-btn'
          type='primary'
          onClick={() => {
            this.onShowSidePanel(true)
          }}
          aria-label={this.i18nMessage('addData')}
          aria-describedby={'table-blank-msg'}
          ref={this.addDataBtnRef}
        >
          <div className='w-100 px-2 text-truncate'>
            {this.i18nMessage('addData')}
          </div>
        </Button>
      </SettingRow>
    )
  }

  getDSContent = () => {
    return (<SettingSection className={'p-0 m-0'}>
      <div>
        <SettingSection className='border-0'
              title={this.i18nMessage('sourceLabel')}
              role="group"
              aria-label={this.i18nMessage('sourceLabel')}
        >
          {this.getDSSelectionContent()}
          {this.state.useMapWidget ? this.getMapSelectorContent() : this.getAddDataContent()}
        </SettingSection>
      </div>
      {!this.state.useMapWidget && this.getDSListContent()}
    </SettingSection>)
  }

  getGeneralContent = () => {
    const label = `${this.i18nMessage('general')} ${this.i18nMessage('tools')}`
    return (
      <SettingSection title={this.i18nMessage('general')} aria-label={label} role="group">
        <SettingRow tag='label' label={this.i18nMessage('tools')} />
        <SettingRow tag='label' label={this.i18nMessage('dsNavigator')} >
          <Switch
          className='can-x-switch'
          disabled={this.state.useMapWidget ? false : this.getDSConfigs()?.length <= 1}
          checked={(this.props.config?.dsNavigator)}
          data-key='dsNavigator'
          onChange={(evt) => {
            this.onPropertyChange('dsNavigator', evt.target.checked)
          }}
          />
        </SettingRow>
        <SettingRow tag='label' label={this.i18nMessage('featureNavigator')} >
          <Switch
          className='can-x-switch'
          checked={(this.props.config?.featureNavigator)}
          data-key='featureNavigator'
          onChange={(evt) => {
            this.onPropertyChange('featureNavigator', evt.target.checked)
          }}
          />
        </SettingRow>
        {this.props.config?.featureNavigator && <SettingRow>
          <Label className={'ml-4'}>
            <Checkbox
              checked={this.props.config?.showCount}
              className='mr-1'
              onChange={(evt) => {
                this.onPropertyChange('showCount', evt.target.checked)
              }}
            />
            <FormattedMessage id='showIndexInHeader' defaultMessage={defaultMessages.showIndexInHeader} />
          </Label>
        </SettingRow>}
        <SettingRow tag='label' label={this.i18nMessage('clearSelection')} >
          <Switch
          className='can-x-switch'
          checked={(this.props.config?.clearSelection)}
          data-key='clearSelection'
          onChange={(evt) => {
            this.onPropertyChange('clearSelection', evt.target.checked)
          }}
          />
        </SettingRow>


        <label className='second-header no-data-message'><FormattedMessage id='noDataMessage' defaultMessage={jimuDefaultMessages.noDataMessage} /></label>
        <TextArea
          aria-label={this.i18nMessage('noDataMessage')}
          className='w-100' name='text' id='noDataMessageDefaultText'
          defaultValue={this.props.config.noDataMessage || this.i18nMessage('noDataMessageDefaultText')}
          onBlur={evt => { this.onPropertyChange('noDataMessage', evt.target.value) }}
        />
      </SettingSection>
    )
  }

  getFocusNodeForBackSidePopper = () => {
    let focusNode = null
    const index = this.getDSConfigs().findIndex(dsConfig => dsConfig.id === this.state.focusDSConfigId)
    if (index >= 0 && this.dsListContentRef.current) {
      focusNode = this.dsListContentRef.current.getElementsByClassName('jimu-tree-item__body')[index] as HTMLElement
    } else {
      focusNode = this.addDataBtnRef.current
    }
    return focusNode
  }

  getDSConfigContent = () => {
    return (
      <SidePopper
        position='right'
        title={this.i18nMessage('contentConfiguration')}
        isOpen={this.state.showSidePanel}
        toggle={this.onCloseSidePanel}
        trigger={null}
        backToFocusNode={this.getFocusNodeForBackSidePopper()}
      >
        <DSSetting
          dsConfig={this.getDSConfigById(this.state.currentDSConfigId)}
          i18nMessage={this.i18nMessage}
          widgetId={this.props.id}
          onDataSourceChange={this.onDataSourceChange}
          onContentOptionsChanged={this.onContentOptionsChanged}
          onLabelChange={this.onLabelChange}
          getUseDataSourceById={this.getUseDataSourceById}
          newAddFlag={this.state.showSidePanelForNew}
        />
      </SidePopper>
    )
  }

  render () {
    return (
      <div css={getStyle(this.props.theme)}>
        <div className='widget-setting-featureInfo'>
          {this.getDSContent()}
          {this.getStyleContent()}
          {this.getGeneralContent()}
          {this.getDSConfigContent()}
        </div>
      </div>
    )
  }
}
