/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, type IMThemeVariables, lodash, Immutable, type UseDataSource, DataSourceManager, type ElevationLayerDataSource, classNames, DataSourceTypes } from 'jimu-core'
import { Icon, defaultMessages as jimuUIDefaultMessages, Label, Switch, TextArea, TextInput, Tooltip, type ValidityResult } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { getConfigIcon } from '../constants'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { getElevationLayersSettingsStyle } from '../lib/style'
import type { ProfileStyle, ElevationLayersInfo, Statistics, VolumetricObjOptions } from '../../config'
import StatisticsList from './common-statistics-list'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import LineStylePicker from './line-style-picker'

const { epConfigIcon } = getConfigIcon()

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  widgetId: string
  layerIndex: number
  editCurrentLayer: string
  isNewLayerAdded: boolean
  elevationLayersList: ElevationLayersInfo[]
  availableStats: Statistics[]
  isVolumetricObjSettings: boolean
  volumetricObjOptionsConfig: VolumetricObjOptions
  onLayersUpdate: (prop: ElevationLayersInfo[], index: number) => void
  onVolumetricSettingsUpdated: (volumetricSettings: VolumetricObjOptions) => void
  disableOkButton: (value: boolean) => void
}

interface IState {
  elevationLayersSettingsList: ElevationLayersInfo[]
  volumetricObjOptionsSettings: VolumetricObjOptions
  useDataSource: UseDataSource
  updatedElevationUrl: string
  elevationLayerLabel: string
  style: ProfileStyle
  showProfileStats: boolean
  statisticsList: Statistics[]
}

export default class ElevationLayerPopper extends React.PureComponent<Props, IState> {
  public setEditIndex: number
  supportedDsTypes = Immutable([DataSourceTypes.ElevationLayer])
  constructor (props) {
    super(props)

    this.state = {
      elevationLayersSettingsList: this.props.elevationLayersList || [],
      volumetricObjOptionsSettings: this.props.volumetricObjOptionsConfig,
      useDataSource: null,
      updatedElevationUrl: '',
      elevationLayerLabel: this.props.isVolumetricObjSettings ? this.props.volumetricObjOptionsConfig.volumetricObjLabel : '',
      style: this.props.isVolumetricObjSettings ? this.props.volumetricObjOptionsConfig.style : this.props.elevationLayersList[this.props.layerIndex]?.style,
      showProfileStats: false,
      statisticsList: this.props.availableStats
    }
    this.setEditIndex = 0
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

  componentDidMount = () => {
    if (!this.props.isVolumetricObjSettings) {
      this.showElevationLayersInfo(false)
    } else {
      this.showVolumetricObjInfo(false)
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    //update values on change of config
    if (this.props.editCurrentLayer !== prevProps.editCurrentLayer ||
      this.props.layerIndex !== prevProps.layerIndex ||
      !(lodash.isDeepEqual(this.props.elevationLayersList, prevProps.elevationLayersList))) {
      this.showElevationLayersInfo(false)
    }

    if (!(lodash.isDeepEqual(this.state.elevationLayersSettingsList, prevState.elevationLayersSettingsList))) {
      this.showElevationLayersInfo(true)
    }

    if (!(lodash.isDeepEqual(this.props.volumetricObjOptionsConfig, prevProps.volumetricObjOptionsConfig))) {
      this.showVolumetricObjInfo(false)
    }

    if (!(lodash.isDeepEqual(this.state.volumetricObjOptionsSettings, prevState.volumetricObjOptionsSettings))) {
      this.showVolumetricObjInfo(true)
    }
  }

  showElevationLayersInfo = (isAnalysisEditedWithoutOkClick: boolean) => {
    const updatedElevationLayersList: ElevationLayersInfo[] = isAnalysisEditedWithoutOkClick ? this.state.elevationLayersSettingsList : this.props.elevationLayersList
    //set all the default values in the elevation layers sidepopper
    updatedElevationLayersList.forEach((layer, index) => {
      if (layer.elevationLayerUrl === this.props.editCurrentLayer && this.props.layerIndex === index) {
        this.props.editCurrentLayer ? this.props.disableOkButton(false) : this.props.disableOkButton(true)
        if (isAnalysisEditedWithoutOkClick && layer.label === '') {
          this.props.disableOkButton(true)
        }
        let layerLabel = layer.label
        if (!layer.useDataSource && !layer.elevationLayerUrl) {
          layerLabel = isAnalysisEditedWithoutOkClick && layer.label ? layer.label : ''
        }
        this.setState({
          useDataSource: layer.useDataSource,
          updatedElevationUrl: layer.elevationLayerUrl,
          elevationLayerLabel: layerLabel,
          style: layer.style,
          showProfileStats: layer.displayStatistics,
          statisticsList: layer.selectedStatistics
        })
      }
    })
  }

  updateLayersSettingsValue = (useDataSource: UseDataSource, elevationLayerUrl: string) => {
    const layersSettings = this.state.elevationLayersSettingsList
    let updatedSettings
    // eslint-disable-next-line array-callback-return
    layersSettings.some((layersInfo, index) => {
      if ((layersInfo?.elevationLayerUrl === elevationLayerUrl || elevationLayerUrl) && (this.props.layerIndex === index)) {
        this.setEditIndex = index
        updatedSettings = {
          id: layersInfo.id,
          useDataSource: useDataSource || this.state.useDataSource,
          label: this.state.elevationLayerLabel,
          elevationLayerUrl: this.state.updatedElevationUrl,
          style: this.state.style,
          displayStatistics: this.state.showProfileStats,
          selectedStatistics: this.state.statisticsList
        }
        return true
      }
    })
    this.updateItem(this.setEditIndex, updatedSettings)
  }

  updateItem = (formatIndex: number, itemAttributes) => {
    const index = formatIndex
    if (index > -1) {
      const updateSettings = [...this.props.elevationLayersList.slice(0, index),
        Object.assign({}, this.props.elevationLayersList[index], itemAttributes),
        ...this.props.elevationLayersList.slice(index + 1)]
      // update the whole elevation layers settings
      this.props.onLayersUpdate(updateSettings, index)
      this.setState({
        elevationLayersSettingsList: updateSettings
      })
    }
  }

  showVolumetricObjInfo = (isVolumetricEditedWithoutOkClick: boolean) => {
    const volumetrciObjSettings = isVolumetricEditedWithoutOkClick ? this.state.volumetricObjOptionsSettings : this.props.volumetricObjOptionsConfig
    this.setState({
      elevationLayerLabel: volumetrciObjSettings.volumetricObjLabel,
      style: volumetrciObjSettings.style,
      showProfileStats: volumetrciObjSettings.displayStatistics,
      statisticsList: volumetrciObjSettings.selectedStatistics
    })
  }

  updateVolumetricSettingsValue = () => {
    const updateVolumtericSettings = {
      id: this.props.volumetricObjOptionsConfig.id,
      style: this.state.style,
      volumetricObjLabel: this.state.elevationLayerLabel,
      displayStatistics: this.state.showProfileStats,
      selectedStatistics: this.state.statisticsList
    }
    this.setState({
      volumetricObjOptionsSettings: updateVolumtericSettings
    })
    this.props.onVolumetricSettingsUpdated(updateVolumtericSettings)
  }

  updateElevationLayerLineStyle = (object: string, property: string, value: any) => {
    if (!this.props.isVolumetricObjSettings) {
      const elevationStyle = {
        lineType: property === 'lineType' ? value : this.state.elevationLayersSettingsList[this.props.layerIndex].style.lineType,
        lineColor: property === 'lineColor' ? value : this.state.elevationLayersSettingsList[this.props.layerIndex].style.lineColor,
        lineThickness: property === 'lineThickness' ? value : this.state.elevationLayersSettingsList[this.props.layerIndex].style.lineThickness
      }
      this.setState({
        style: elevationStyle
      }, () => {
        this.updateLayersSettingsValue(this.state.useDataSource, this.state.updatedElevationUrl)
      })
    } else {
      const volumetricStyle = {
        lineType: property === 'lineType' ? value : this.props.volumetricObjOptionsConfig.style.lineType,
        lineColor: property === 'lineColor' ? value : this.props.volumetricObjOptionsConfig.style.lineColor,
        lineThickness: property === 'lineThickness' ? value : this.props.volumetricObjOptionsConfig.style.lineThickness
      }
      this.setState({
        style: volumetricStyle
      }, () => {
        this.updateVolumetricSettingsValue()
      })
    }
  }

  onElevationLayerSelect = (useDataSources: UseDataSource[]) => {
    if (!useDataSources) {
      return
    }
    const layerDataSource = DataSourceManager.getInstance().getDataSource(useDataSources[0].dataSourceId) as ElevationLayerDataSource
    if (layerDataSource.type === DataSourceTypes.ElevationLayer) {
      this.setState({
        useDataSource: useDataSources[0],
        updatedElevationUrl: layerDataSource.layer.url,
        elevationLayerLabel: this.state.elevationLayerLabel || layerDataSource.layer.title
      }, () => {
        !this.props.isVolumetricObjSettings && this.updateLayersSettingsValue(useDataSources[0], layerDataSource.layer.url)
      })
    }
  }

  onLayerLabelChange = (event) => {
    if (event?.target) {
      const value = event.target.value
      this.setState({
        elevationLayerLabel: value
      })
    }
  }

  onLayerLabelAcceptValue = (value: string) => {
    this.setState({
      elevationLayerLabel: value.trim()
    }, () => {
      !this.props.isVolumetricObjSettings
        ? this.updateLayersSettingsValue(this.state.useDataSource, this.state.updatedElevationUrl)
        : this.updateVolumetricSettingsValue()
    })
  }

  checkLayerLabel = (value: string): ValidityResult => {
    if (!this.props.isVolumetricObjSettings) {
      if (!this.state.useDataSource && !this.state.updatedElevationUrl) {
        this.props.disableOkButton(true)
        if (value.trim() === '') {
          return { valid: false, msg: this.nls('emptyLabelWarning') }
        } else {
          return { valid: true }
        }
      } else {
        if (value.trim() === '') {
          this.props.disableOkButton(true)
          return { valid: false, msg: this.nls('emptyLabelWarning') }
        } else {
          this.props.disableOkButton(false)
          return { valid: true }
        }
      }
    } else {
      if (value.trim() === '') {
        this.props.disableOkButton(true)
        return { valid: false, msg: this.nls('emptyLabelWarning') }
      } else {
        this.props.disableOkButton(false)
        return { valid: true }
      }
    }
  }

  onDisplayGroundProfileStatsChange = (evt: any) => {
    this.setState({
      showProfileStats: evt.target.checked
    }, () => {
      !this.props.isVolumetricObjSettings
        ? this.updateLayersSettingsValue(this.state.useDataSource, this.state.updatedElevationUrl)
        : this.updateVolumetricSettingsValue()
    })
  }

  updateStatistics = (newStatistics: Statistics[]) => {
    this.setState({
      statisticsList: newStatistics
    }, () => {
      !this.props.isVolumetricObjSettings
        ? this.updateLayersSettingsValue(this.state.useDataSource, this.state.updatedElevationUrl)
        : this.updateVolumetricSettingsValue()
    })
  }

  render () {
    return <div style={{ height: 'calc(100% - 92px)', width: '100%', overflow: 'auto' }} css={getElevationLayersSettingsStyle(this.props.theme)}>
      <SettingSection>
        {!this.props.isVolumetricObjSettings &&
          <React.Fragment>
            <SettingRow className={'pt-1'}>
              <Label tabIndex={0} aria-label={this.nls('selectLayer')} className='w-100 d-flex'>
                <div className='flex-grow-1 text-break title2 hint-paper'>
                  {this.nls('selectLayer')}
                </div>
              </Label>
              <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('selectLayerTooltip')}
                title={this.nls('selectLayerTooltip')} showArrow placement='top'>
                <div className='ml-2 d-inline'>
                  <Icon size={14} icon={epConfigIcon.infoIcon} />
                </div>
              </Tooltip>
            </SettingRow>
            {(!this.props.isNewLayerAdded && !this.state.useDataSource) &&
              <SettingRow>
                <TextArea role={'textarea'} aria-label={this.state.updatedElevationUrl}
                  height={76} className='w-100' spellCheck={false}
                  value={this.state.updatedElevationUrl}
                  onClick={e => { e.currentTarget.select() }} readOnly
                />
              </SettingRow>
            }

            {(this.props.isNewLayerAdded || (!this.props.isNewLayerAdded && this.state.useDataSource)) &&
              <SettingRow>
                <DataSourceSelector
                  data-testid='addLayer'
                  types={this.supportedDsTypes}
                  useDataSources={this.state.useDataSource ? Immutable([this.state.useDataSource]) : Immutable([])}
                  buttonLabel={this.nls('selectLayerLabel')}
                  onChange={this.onElevationLayerSelect}
                  mustUseDataSource={true}
                  enableToSelectOutputDsFromSelf={false}
                  closeDataSourceListOnChange
                  hideTypeDropdown={false}
                  hideAddDataButton={false}
                  disableRemove={() => true}
                  widgetId={this.props.widgetId}
                  hideDataView={true}
                  useDataSourcesEnabled
                />
              </SettingRow>
            }
          </React.Fragment>
        }

        <SettingRow className={classNames(!this.props.isVolumetricObjSettings ? 'ep-divider-top pt-4' : 'pt-1')} label={this.nls('label')} flow={'wrap'}>
          <TextInput data-testid='layerLabel' className='w-100' role={'textbox'} aria-label={this.nls('label') + this.state.elevationLayerLabel} title={this.state.elevationLayerLabel}
            size={'sm'} value={this.state.elevationLayerLabel} onAcceptValue={this.onLayerLabelAcceptValue} onChange={this.onLayerLabelChange}
            checkValidityOnChange={this.checkLayerLabel} checkValidityOnAccept={this.checkLayerLabel} />
        </SettingRow>

        <SettingRow className={'pt-4 ep-divider-top'}>
          <Label tabIndex={0} aria-label={this.nls('styleLabel')} className='w-100 d-flex'>
            <div className='flex-grow-1 text-break color-label title2 hint-paper'>
              {this.nls('styleLabel')}
            </div>
          </Label>
          <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('elevationLayerStyleTooltip')}
            title={this.nls('elevationLayerStyleTooltip')} showArrow placement='top'>
            <div className='ml-2 d-inline'>
              <Icon size={14} icon={epConfigIcon.infoIcon} />
            </div>
          </Tooltip>
        </SettingRow>

        <SettingRow>
          <LineStylePicker
            intl={this.props.intl}
            lineItem={'style'}
            onLineStyleChange={this.updateElevationLayerLineStyle}
            config={this.state.style}
          />
        </SettingRow>

        <SettingRow tag='label' label={this.nls('displayGroundProfileStatsLabel')}>
          <Switch role={'switch'}
            data-testid='profileStatsSwitch'
            title={this.nls('displayGroundProfileStatsLabel')}
            checked={this.state.showProfileStats}
            onChange={this.onDisplayGroundProfileStatsChange} />
        </SettingRow>

        {this.state.showProfileStats &&
          <div>
            <StatisticsList intl={this.props.intl} theme={this.props.theme}
              availableStatistics={this.state.statisticsList}
              onStatsListUpdated={this.updateStatistics} />
          </div>
        }
      </SettingSection>
    </div>
  }
}
