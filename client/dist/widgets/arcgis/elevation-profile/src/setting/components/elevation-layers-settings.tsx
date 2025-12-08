/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IMThemeVariables, type IntlShape, getAppStore, urlUtils } from 'jimu-core'
import { Label, Select, Option, Tooltip, Icon, defaultMessages as jimuUIDefaultMessages, Button, Checkbox, Alert } from 'jimu-ui'
import { SettingRow, SidePopper } from 'jimu-ui/advanced/setting-components'
import { getElevationLayersSettingsStyle, getSidePanelStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import type { ElevationLayersInfo, ElevationLayers, Statistics, VolumetricObjOptions } from '../../config'
import { unitOptions, getConfigIcon, defaultElevationLayerSettings, defaultElevationLayersStyle } from '../constants'
import { getPortalSelfElevationUnits, getPortalSelfLinearUnits, getRandomHexColor, getUniqueElevationLayersId } from '../../common/utils'
import { List, TreeItemActionType, type TreeItemsType, type TreeItemType } from 'jimu-ui/basic/list-tree'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { SettingOutlined } from 'jimu-icons/outlined/application/setting'
import classNames from 'classnames'
import SidepopperBackArrow from './sidepopper-back-arrow'
import ElevationLayerPopper from './elevation-layer-popper'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import { type JimuMapView, MapViewManager } from 'jimu-arcgis'

const { epConfigIcon } = getConfigIcon()

const portalSelf = getAppStore().getState().portalSelf

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  widgetId: string
  currentDs: string
  mapWidgetId: string
  config: ElevationLayers
  isRTL: boolean
  availableStats: Statistics[]
  onElevationLayersSettingsUpdated: (prop: string, value: string | boolean | Statistics[] | ElevationLayersInfo[] | VolumetricObjOptions) => void
}

interface IState {
  addedElevationLayers: ElevationLayersInfo[]
  newLayerAdded: boolean
  updatedAddedLayersInfo: ElevationLayersInfo[]
  elevationLayerPopperTitle: string
  popperFocusNode: HTMLElement
  showElevationLayerDataItemPanel: boolean
  layerIndex: number
  editCurrentLayer: string
  disableSidePopperOkButton: boolean
  elevationUnit: string
  linearUnit: string
  volumetricObjSettings: boolean
  volumetricObjSettingsOptions: VolumetricObjOptions
  updatedVolumetricObjSettingsOptions: VolumetricObjOptions
}

export default class ElevationLayersSettings extends React.PureComponent<Props, IState> {
  elevationLayerSidePopperTrigger = React.createRef<HTMLDivElement>()
  readonly mvManager: MapViewManager = MapViewManager.getInstance()
  mapView: JimuMapView
  isLayerInfoEdited: boolean
  isVolumetricInfoEdited: boolean
  constructor (props) {
    super(props)
    const mapViewGroup = (this.mvManager as any).jimuMapViewGroups[this.props.mapWidgetId]
    for (const id in mapViewGroup?.jimuMapViews) {
      if (mapViewGroup.jimuMapViews[id].dataSourceId === this.props.currentDs) {
        this.mapView = mapViewGroup.jimuMapViews[id]
      }
    }
    //get the configured units
    let configuredElevationUnit = this.props.config.elevationUnit
    let configuredLinearUnit = this.props.config.linearUnit
    //if configured units are empty set the units based on portal units
    if (this.props.config.elevationUnit === '') {
      configuredElevationUnit = getPortalSelfElevationUnits(portalSelf)
    }

    if (this.props.config.linearUnit === '') {
      configuredLinearUnit = getPortalSelfLinearUnits(portalSelf)
    }

    this.state = {
      addedElevationLayers: this.props.config.addedElevationLayers,
      newLayerAdded: false,
      updatedAddedLayersInfo: this.props.config.addedElevationLayers,
      elevationLayerPopperTitle: null,
      popperFocusNode: null,
      showElevationLayerDataItemPanel: false,
      layerIndex: null,
      editCurrentLayer: '',
      disableSidePopperOkButton: false,
      elevationUnit: configuredElevationUnit,
      linearUnit: configuredLinearUnit,
      volumetricObjSettings: false,
      volumetricObjSettingsOptions: this.props.config.volumetricObjSettingsOptions,
      updatedVolumetricObjSettingsOptions: this.props.config.volumetricObjSettingsOptions
    }
    this.isLayerInfoEdited = false
    this.isVolumetricInfoEdited = false
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

  componentDidUpdate = (prevProps) => {
    // Set the mapview when the map widget or data source changes
    if (this.props.currentDs !== prevProps.currentDs || this.props.mapWidgetId !== prevProps.mapWidgetId) {
      const mapViewGroup = (this.mvManager as any).jimuMapViewGroups[this.props.mapWidgetId]
      for (const id in mapViewGroup?.jimuMapViews) {
        if (mapViewGroup.jimuMapViews[id].dataSourceId === this.props.currentDs) {
          this.mapView = mapViewGroup.jimuMapViews[id]
        }
      }
    }

    if (prevProps.config.elevationUnit !== this.props.config.elevationUnit) {
      this.setElevationUnit(this.props.config.elevationUnit)
    }
    if (prevProps.config.linearUnit !== this.props.config.linearUnit) {
      this.setLinearUnit(this.props.config.linearUnit)
    }
    if (prevProps.config.addedElevationLayers !== this.props.config.addedElevationLayers) {
      this.setState({
        addedElevationLayers: this.props.config.addedElevationLayers
      })
    }
  }

  setLinearUnit = (configuredLinearUnit: string) => {
    if (configuredLinearUnit === '') {
      if (portalSelf?.units === 'english') {
        configuredLinearUnit = 'miles'
      } else {
        configuredLinearUnit = 'kilometers'
      }
    }
    this.setState({
      linearUnit: configuredLinearUnit
    })
  }

  setElevationUnit = (configuredElevationUnit: string) => {
    if (configuredElevationUnit === '') {
      if (portalSelf?.units === 'english') {
        configuredElevationUnit = 'feet'
      } else {
        configuredElevationUnit = 'meters'
      }
    }
    this.setState({
      elevationUnit: configuredElevationUnit
    })
  }

  //Update the config values when the values are modified

  onNewLayerButtonClick = () => {
    this.setSidePopperAnchor(null, true, false)
    const newCustomElevationLayer = { ...defaultElevationLayerSettings }
    newCustomElevationLayer.selectedStatistics = this.props.availableStats
    newCustomElevationLayer.id = getUniqueElevationLayersId()
    newCustomElevationLayer.style = { ...defaultElevationLayersStyle }
    newCustomElevationLayer.style.lineColor = getRandomHexColor()
    this.setState({
      newLayerAdded: true,
      volumetricObjSettings: false,
      addedElevationLayers: [...this.state.addedElevationLayers, newCustomElevationLayer],
      layerIndex: this.state.addedElevationLayers.length,
      showElevationLayerDataItemPanel: true,
      elevationLayerPopperTitle: this.nls('addElevationLayer'),
      editCurrentLayer: ''
    }, () => {
      if (this.state.addedElevationLayers.length === 1) {
        this.props.onElevationLayersSettingsUpdated('groundLayerId', this.state.addedElevationLayers[0].id)
      }
    })
  }

  onDeleteLayer = (e: any, elevationUrl: string, index: number) => {
    e.stopPropagation()
    const addedLayers = Object.assign([], this.state.addedElevationLayers) as ElevationLayersInfo[]
    addedLayers.splice(index, 1)
    this.setState({
      layerIndex: index,
      addedElevationLayers: addedLayers
    }, () => {
      this.props.onElevationLayersSettingsUpdated('addedElevationLayers', this.state.addedElevationLayers)
      if (this.state.layerIndex === -1 && this.state.editCurrentLayer === elevationUrl) {
        this.setSidePopperAnchor(this.state.layerIndex, false, false)
        this.setState({
          showElevationLayerDataItemPanel: false,
          layerIndex: null,
          editCurrentLayer: elevationUrl
        }, () => {
          this.props.onElevationLayersSettingsUpdated('addedElevationLayers', this.state.addedElevationLayers)
        })
      }
    })
  }

  onSettingsClick = (e: any, item, index: number) => {
    e.stopPropagation()
    this.setSidePopperAnchor(index, false, false)
    this.setState({
      showElevationLayerDataItemPanel: true,
      volumetricObjSettings: false,
      newLayerAdded: false,
      elevationLayerPopperTitle: item.label || this.nls('groundElevation'),
      layerIndex: index,
      editCurrentLayer: item.elevationLayerUrl
    })
  }

  setSidePopperAnchor = (index: number, isNewAdded: boolean, isVolumetric: boolean) => {
    let node: any
    if (isVolumetric) {
      node = this.elevationLayerSidePopperTrigger.current.getElementsByClassName('volumetric-obj-btn')[0]
    }
    if (isNewAdded) {
      node = this.elevationLayerSidePopperTrigger.current.getElementsByClassName('new-layer-btn')[0]
    }
    if (index !== null) {
      node = this.elevationLayerSidePopperTrigger.current.getElementsByClassName('jimu-tree-item__body')[index]
    }
    this.setState({ popperFocusNode: node })
  }

  closePanel = () => {
    if (!this.state.volumetricObjSettings) {
      if (this.state.newLayerAdded) {
        this.setSidePopperAnchor(null, true, false)
      } else {
        this.setSidePopperAnchor(this.state.layerIndex, false, false)
      }
      const configuredLayersInfo = this.props.config.addedElevationLayers as any
      this.setState({
        addedElevationLayers: this.props.config.addedElevationLayers?.length > 0 ? configuredLayersInfo.asMutable() : [],
        showElevationLayerDataItemPanel: false,
        layerIndex: null,
        editCurrentLayer: ''
      }, () => {
        this.props.onElevationLayersSettingsUpdated('addedElevationLayers', this.state.addedElevationLayers)
      })
    } else {
      this.setSidePopperAnchor(null, false, true)
      this.setState({
        volumetricObjSettingsOptions: this.props.config.volumetricObjSettingsOptions,
        showElevationLayerDataItemPanel: false
      }, () => {
        this.props.onElevationLayersSettingsUpdated('volumetricObjSettingsOptions', this.state.volumetricObjSettingsOptions)
      })
    }
  }

  settingsOkButtonClick = () => {
    if (!this.state.volumetricObjSettings) {
      this.setState({
        showElevationLayerDataItemPanel: false,
        addedElevationLayers: this.isLayerInfoEdited ? this.state.updatedAddedLayersInfo : this.state.addedElevationLayers
      }, () => {
        this.props.onElevationLayersSettingsUpdated('addedElevationLayers', this.state.addedElevationLayers)
      })
      this.isLayerInfoEdited = false
    } else {
      this.setState({
        showElevationLayerDataItemPanel: false,
        volumetricObjSettingsOptions: this.isVolumetricInfoEdited ? this.state.updatedVolumetricObjSettingsOptions : this.state.volumetricObjSettingsOptions
      }, () => {
        this.props.onElevationLayersSettingsUpdated('volumetricObjSettingsOptions', this.state.volumetricObjSettingsOptions)
      })
    }
    this.isVolumetricInfoEdited = false
  }

  onLayersInfoUpdate = (elevationLayersSettings: ElevationLayersInfo[], idx: number) => {
    this.isLayerInfoEdited = true
    this.setState({
      updatedAddedLayersInfo: elevationLayersSettings,
      layerIndex: idx,
      editCurrentLayer: elevationLayersSettings[idx].elevationLayerUrl
    })
  }

  onVolumetricSettingsUpdated = (volumetricSettings: VolumetricObjOptions) => {
    this.isVolumetricInfoEdited = true
    this.setState({
      updatedVolumetricObjSettingsOptions: volumetricSettings
    })
  }

  onDisableOkButton = (disable: boolean) => {
    this.setState({
      disableSidePopperOkButton: disable
    })
  }

  createElevationLayerItem = (item, index: number) => {
    const layerItem = (
      <div className={classNames('flex-grow-1 layer-data-item cursor-pointer')} key={index}>
        <div className='d-flex w-100 justify-content-between align-items-center'>
          {<div className='layer-data-item-name text-truncate' title={item.label || this.nls('groundElevation')}>
            {item.label || this.nls('groundElevation')}
          </div>}
          <Button role={'button'} aria-label={this.nls('settings')} title={this.nls('settings')} type='tertiary' size='sm' icon
            onClick={(e) => { this.onSettingsClick(e, item, index) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                this.onSettingsClick(e, item, index)
              }
            }}>
            <SettingOutlined size='m' className='p-0' />
          </Button>

          {item.id === this.props.config.groundLayerId &&
            <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('groundLayerInfoTooltip')}
              title={this.nls('groundLayerInfoTooltip')} showArrow placement='top' data-testid={'groundLayerInfoIcon'}>
              <div className='d-inline' style={{ padding: 6 }}>
                <Icon size={14} icon={epConfigIcon.infoIcon} />
              </div>
            </Tooltip>}

          {!(item.id === this.props.config.groundLayerId) &&
            <Button role={'button'} aria-label={this.nls('deleteOption')} title={this.nls('deleteOption')} type='tertiary' size='sm' icon
              onClick={(e) => { this.onDeleteLayer(e, item.elevationLayerUrl, index) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  this.onDeleteLayer(e, item.elevationLayerUrl, index)
                }
              }}>
              <CloseOutlined size='s' className='p-0' />
            </Button>}
        </div>

        {item.id === this.props.config.groundLayerId &&
          <div className='hint-paper d-flex align-items-center layer-type-name'>
            <div className='w-100 text-truncate' title={this.nls('groundLayer')}>{this.nls('groundLayer')}</div>
          </div>
        }
      </div>
    )
    return layerItem
  }

  onElevationLayerOrderChanged = (newSortedLayersList) => {
    this.setState({
      addedElevationLayers: newSortedLayersList
    }, () => {
      this.props.onElevationLayersSettingsUpdated('addedElevationLayers', newSortedLayersList)
    })
  }

  onGroundLayerChange = (evt: any) => {
    this.props.onElevationLayersSettingsUpdated('groundLayerId', evt.target.value)
  }

  onLinearUnitChange = (evt: any) => {
    this.setState({
      linearUnit: evt.target.value
    }, () => {
      this.props.onElevationLayersSettingsUpdated('linearUnit', this.state.linearUnit)
    })
  }

  onElevationUnitChange = (evt: any) => {
    this.setState({
      elevationUnit: evt.target.value
    }, () => {
      this.props.onElevationLayersSettingsUpdated('elevationUnit', this.state.elevationUnit)
    })
  }

  onShowVolumetricObjLineInGraphChange = (evt: React.FormEvent<HTMLInputElement>) => {
    this.props.onElevationLayersSettingsUpdated('showVolumetricObjLineInGraph', evt.currentTarget.checked)
  }

  onVolumtericObjSettingsClick = (e: any) => {
    e.stopPropagation()
    this.setSidePopperAnchor(null, false, true)
    this.setState({
      showElevationLayerDataItemPanel: true,
      volumetricObjSettings: true,
      elevationLayerPopperTitle: this.nls('volumetricObjectsLabel')
    })
  }

  render () {
    let config = this.state.addedElevationLayers
    if (this.props.config.addedElevationLayers[this.state.layerIndex]) {
      config = this.props.config.addedElevationLayers
    }
    return <div style={{ height: '100%', width: '100%', marginTop: 5 }} css={getElevationLayersSettingsStyle(this.props.theme)}>
      {/* Set elevation layers settings */}
      <div ref={this.elevationLayerSidePopperTrigger} className='mb-4'>
        <SettingRow>
          <Button role={'button'} className={'w-100 text-dark new-layer-btn'} type={'primary'} onClick={this.onNewLayerButtonClick.bind(this)} >
            <div className='w-100 px-2 text-truncate'>
              <PlusOutlined className='mr-1 mb-1' />
              {this.nls('newLayerLabel')}
            </div>
          </Button>
        </SettingRow>

        {this.props.config.addedElevationLayers.length > 0 &&
          <div tabIndex={-1} className={'w-100 mb-4 mt-4'}>
            <div className={'ep-layers-list'}>
              <List
                itemsJson={Array.from(this.props.config.addedElevationLayers).map((options: any, index) => ({
                  itemStateDetailContent: options,
                  itemKey: `${index}`
                }))}
                dndEnabled
                onUpdateItem={(actionData, refComponent) => {
                  const { itemJsons } = refComponent.props
                  const [, parentItemJson] = itemJsons as [TreeItemType, TreeItemsType]
                  const newSortedAnalysis = parentItemJson.map(item => {
                    return item.itemStateDetailContent
                  })
                  this.onElevationLayerOrderChanged(newSortedAnalysis)
                }}
                overrideItemBlockInfo={() => {
                  return {
                    name: TreeItemActionType.RenderOverrideItem,
                    children: [{
                      name: TreeItemActionType.RenderOverrideItemDroppableContainer,
                      children: [{
                        name: TreeItemActionType.RenderOverrideItemDraggableContainer,
                        children: [{
                          name: TreeItemActionType.RenderOverrideItemBody,
                          children: [{
                            name: TreeItemActionType.RenderOverrideItemDragHandle
                          }, {
                            name: TreeItemActionType.RenderOverrideItemMainLine
                          }]
                        }]
                      }]
                    }]
                  }
                }}
                renderOverrideItemMainLine={(actionData, refComponent) => {
                  const { itemJsons } = refComponent.props
                  const currentItemJson = itemJsons[0]
                  const listItemJsons = itemJsons[1] as any
                  return this.createElevationLayerItem(currentItemJson.itemStateDetailContent, listItemJsons.indexOf(currentItemJson))
                }}
              />
            </div>
          </div>
        }

        {this.state.addedElevationLayers.length === 0 &&
          <SettingRow>
            <Alert tabIndex={0}
              style={{ minWidth: 'auto' }}
              open={true}
              text={this.nls('noGroundLayerInfoMessage')}
              type={'info'}
            />
          </SettingRow>
        }

        {this.state.addedElevationLayers.length > 0 &&
          <React.Fragment>
            <SettingRow label={this.nls('setGroundLayer')}>
              <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('setGroundLayerTooltip')}
                title={this.nls('setGroundLayerTooltip')} showArrow placement='top'>
                <div className='ml-2 d-inline'>
                  <Icon size={14} icon={epConfigIcon.infoIcon} />
                </div>
              </Tooltip>
            </SettingRow>
            <SettingRow>
              <Select aria-label={this.props.config.groundLayerId} size={'sm'}
                name={'groundLayer'} className='select-class' value={this.props.config.groundLayerId} onChange={this.onGroundLayerChange} data-testid="refLayer">
                {this.state.addedElevationLayers.map((option, index) => {
                  return <Option role={'option'} aria-label={option.id} key={index} value={option.id}>{option.label}</Option>
                })}
              </Select>
            </SettingRow>
          </React.Fragment>
        }

        {/* Volumetric objects settings */}
        {this.mapView?.view?.type === '3d' &&
          <SettingRow>
            <div className='d-flex w-100'>
              <Checkbox
                data-testid='volumetricObject'
                checked={this.props.config.showVolumetricObjLineInGraph}
                onChange={this.onShowVolumetricObjLineInGraphChange} role={'checkbox'}
                aria-label={this.nls('volumetricObjectsLabel')}
              />
              <div className='flex-grow-1 text-break ml-2' title={this.nls('volumetricObjectsLabel')}>{this.nls('volumetricObjectsLabel')}</div>
            </div>
            <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('volumetricObjectsTooltip')}
              title={this.nls('volumetricObjectsTooltip')} showArrow placement='top'>
              <div className='d-inline'>
                <Icon size={14} icon={epConfigIcon.infoIcon} />
              </div>
            </Tooltip>
            <Button className='ml-3 volumetric-obj-btn' role={'button'} aria-label={this.nls('settings')} title={this.nls('settings')} type='tertiary' size='sm' icon
              onClick={(e) => { this.onVolumtericObjSettingsClick(e) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  this.onVolumtericObjSettingsClick(e)
                }
              }}>
              <SettingOutlined size='m' className='p-0' />
            </Button>
          </SettingRow>
        }
      </div>

      <SidePopper title={this.state.elevationLayerPopperTitle} isOpen={this.state.showElevationLayerDataItemPanel &&
        !urlUtils.getAppIdPageIdFromUrl().pageId} position='right' toggle={this.closePanel} trigger={this.elevationLayerSidePopperTrigger?.current}
        backToFocusNode={this.state.popperFocusNode}>
        <div className='bg-default border-color-gray-400' css={getSidePanelStyle(this.props.theme)}>
          <SidepopperBackArrow
            theme={this.props.theme}
            intl={this.props.intl}
            title={this.state.elevationLayerPopperTitle}
            onBack={this.closePanel}
            hideBackArrow
            showCloseIcon
            showOkButton
            disableOkButton={this.state.disableSidePopperOkButton}
            onOkButtonClicked={this.settingsOkButtonClick}>
            <ElevationLayerPopper
              intl={this.props.intl}
              theme={this.props.theme}
              widgetId={this.props.widgetId}
              layerIndex={this.state.layerIndex}
              editCurrentLayer={this.state.editCurrentLayer}
              isNewLayerAdded={this.state.newLayerAdded}
              elevationLayersList={config}
              availableStats={this.props.availableStats}
              isVolumetricObjSettings={this.state.volumetricObjSettings}
              volumetricObjOptionsConfig={this.props.config.volumetricObjSettingsOptions}
              onLayersUpdate={this.onLayersInfoUpdate}
              onVolumetricSettingsUpdated={this.onVolumetricSettingsUpdated}
              disableOkButton={this.onDisableOkButton}
            />
          </SidepopperBackArrow>
        </div>
      </SidePopper>

      {/* Display units settings */}
      <SettingRow className={'pt-4 ep-divider-top'}>
        <Label tabIndex={0} aria-label={this.nls('measurementUnitsHeadingLabel')} className='w-100 d-flex'>
          <div className='flex-grow-1 text-break color-label title2 hint-paper'>
            {this.nls('measurementUnitsHeadingLabel')}
          </div>
        </Label>
        <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('measurementUnitsHeadingTooltip')}
          title={this.nls('measurementUnitsHeadingTooltip')} showArrow placement='top'>
          <div className='ml-2 d-inline'>
            <Icon size={14} icon={epConfigIcon.infoIcon} />
          </div>
        </Tooltip>
      </SettingRow>

      <SettingRow>
        <Label tabIndex={0} aria-label={this.nls('elevationUnitLabel')} style={{ width: 108 }} className='d-flex'>
          <div className='flex-grow-1 text-break title3 hint-default'>
            {this.nls('elevationUnitLabel')}
          </div>
        </Label>
        <Select aria-label={this.state.elevationUnit} className={'selectOption'} size={'sm'}
          name={'elevationUnit'} value={this.state.elevationUnit} onChange={this.onElevationUnitChange}>
          {unitOptions.map((option, index) => {
            return <Option role={'option'} aria-label={option.value} key={index} value={option.value}>{this.nls(option.value)}</Option>
          })}
        </Select>
      </SettingRow>

      <SettingRow>
        <Label tabIndex={0} aria-label={this.nls('distanceUnitLabel')} style={{ width: 108 }} className='d-flex'>
          <div className='flex-grow-1 text-break title3 hint-default'>
            {this.nls('distanceUnitLabel')}
          </div>
        </Label>
        <Select aria-label={this.state.linearUnit} className={'selectOption'} size={'sm'}
          name={'linearUnit'} value={this.state.linearUnit} onChange={this.onLinearUnitChange}>
          {unitOptions.map((option, index) => {
            return <Option role={'option'} aria-label={option.value} key={index} value={option.value}>{this.nls(option.value)}</Option>
          })}
        </Select>
      </SettingRow>
    </div>
  }
}
