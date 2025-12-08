/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, type IMThemeVariables } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { getSearchSettingStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import { Select, Option, Label, NumericInput, Radio, Switch, CollapsablePanel, defaultMessages as jimuUIDefaultMessages, Checkbox, Tooltip } from 'jimu-ui'
import type { SearchSettings, FontStyleSettings, SketchTools } from '../../config'
import { defaultBufferDistance, unitOptions } from '../constants'
import { validateMaxBufferDistance, getMaxBufferLimit, getPortalUnit } from '../../common/utils'
import { PinEsriOutlined } from 'jimu-icons/outlined/gis/pin-esri'
import { PolylineOutlined } from 'jimu-icons/outlined/gis/polyline'
import { PolygonOutlined } from 'jimu-icons/outlined/gis/polygon'
import TextFormatSetting from './text-formatter'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  config: SearchSettings
  onWidgetLoadOptions: any
  onSearchSettingsUpdated: (prop: string, value: string | boolean | number | FontStyleSettings | SketchTools | SearchSettings, isAllSearchSettingsUpdated?: boolean) => void
}

interface State {
  showPoint: boolean
  showPolyline: boolean
  showPolygon: boolean
  activeTool: string
  onWidgetLoadOptions: any
  isInputSettingOpen: boolean
}

export default class SearchSetting extends React.PureComponent<Props, State> {
  constructor (props) {
    super(props)
    if (this.props.config) {
      this.state = {
        showPoint: this.props.config.sketchTools?.showPoint,
        showPolyline: this.props.config.sketchTools?.showPolyline,
        showPolygon: this.props.config.sketchTools?.showPolygon,
        activeTool: this.props.config.activeToolWhenWidgetOpens ? this.props.config.activeToolWhenWidgetOpens : 'none',
        onWidgetLoadOptions: this.props.onWidgetLoadOptions,
        isInputSettingOpen: false
      }
    }
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl?.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.config.sketchTools?.showPoint !== this.props.config.sketchTools?.showPoint) {
      this.setState({
        showPoint: this.props.config.sketchTools?.showPoint
      })
    } else if (prevProps.config.sketchTools?.showPolyline !== this.props.config.sketchTools?.showPolyline) {
      this.setState({
        showPolyline: this.props.config.sketchTools?.showPolyline
      })
    } else if (prevProps.config.sketchTools?.showPolygon !== this.props.config.sketchTools?.showPolygon) {
      this.setState({
        showPolygon: this.props.config.sketchTools?.showPolygon
      })
    }
  }

  /**
   * update the heading label value
   * @param value value of the heading
   */
  onHeadingLabelChange = (value: string) => {
    this.props.onSearchSettingsUpdated('headingLabel', value)
  }

  /**
   * update the config of the heading style
   */
  updateOnHeadingStyleChange = (textStyle: string | FontStyleSettings) => {
    this.props.onSearchSettingsUpdated('headingLabelStyle', textStyle)
  }

  /**
 * Update the config include Features Outside MapArea parameter
 * @param evt get the event on toggle the include Features Outside MapArea parameter
 */
  onIncludeFeaturesMapAreaToggleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
      const searchSettings = {
      headingLabel: evt.target.checked ? this.nls('disabledDefineSearchAreaLabel') : this.nls('currentMapAreaLabel'),
      bufferDistance: this.props.config.bufferDistance,
      distanceUnits: this.props.config.distanceUnits,
      showDistanceSettings: this.props.config.showDistanceSettings,
      sketchTools: {
        showPoint: this.props.config.sketchTools.showPoint,
        showPolyline: this.props.config.sketchTools.showPolyline,
        showPolygon: this.props.config.sketchTools.showPolygon
      },
      activeToolWhenWidgetOpens: this.props.config.activeToolWhenWidgetOpens,
      searchByActiveMapArea: this.props.config.searchByActiveMapArea,
      includeFeaturesOutsideMapArea: evt.target.checked,
      headingLabelStyle: {
        fontFamily: this.props.config.headingLabelStyle.fontFamily,
        fontBold: this.props.config.headingLabelStyle.fontBold,
        fontItalic: this.props.config.headingLabelStyle.fontItalic,
        fontUnderline: this.props.config.headingLabelStyle.fontUnderline,
        fontStrike: this.props.config.headingLabelStyle.fontStrike,
        fontColor: this.props.config.headingLabelStyle.fontColor,
        fontSize: this.props.config.headingLabelStyle.fontSize
      },
      showInputAddress: this.props.config.showInputAddress
    }
    this.props.onSearchSettingsUpdated('searchSettings', searchSettings, true)
  }

  /**
   * Update the buffer unit and buffer distance parameter
   * @param evt get the event after distance unit change
   */
  onDistanceUnitChange = (evt: any) => {
    const bufferDistanceMaxLimit = validateMaxBufferDistance(this.props.config.bufferDistance, evt.target.value)
    const searchSettings = {
      headingLabel: this.props.config.headingLabel,
      bufferDistance: bufferDistanceMaxLimit,
      distanceUnits: evt.target.value,
      showDistanceSettings: this.props.config.showDistanceSettings,
      sketchTools: {
        showPoint: this.props.config.sketchTools.showPoint,
        showPolyline: this.props.config.sketchTools.showPolyline,
        showPolygon: this.props.config.sketchTools.showPolygon
      },
      activeToolWhenWidgetOpens: this.props.config.activeToolWhenWidgetOpens,
      searchByActiveMapArea: this.props.config.searchByActiveMapArea,
      includeFeaturesOutsideMapArea: this.props.config.includeFeaturesOutsideMapArea,
      headingLabelStyle: {
        fontFamily: this.props.config.headingLabelStyle.fontFamily,
        fontBold: this.props.config.headingLabelStyle.fontBold,
        fontItalic: this.props.config.headingLabelStyle.fontItalic,
        fontUnderline: this.props.config.headingLabelStyle.fontUnderline,
        fontStrike: this.props.config.headingLabelStyle.fontStrike,
        fontColor: this.props.config.headingLabelStyle.fontColor,
        fontSize: this.props.config.headingLabelStyle.fontSize
      },
      showInputAddress: this.props.config.showInputAddress
    }
    this.props.onSearchSettingsUpdated('searchSettings', searchSettings, true)
  }

  /**
   * Update buffer distance parameter
   * @param value get the value on buffer distance change
   */
  onBufferDistanceChange = (value: number | undefined) => {
    this.props.onSearchSettingsUpdated('bufferDistance', value ?? defaultBufferDistance)
  }

  /**
   * @param isSearchByActiveMapArea Check if the map current extent radio button is checked or not
   */
  handleSearchByChange = (isSearchByActiveMapArea: boolean) => {
    let headingLabelTextValue = ''
    //set the heading label according to the current map area and location enabled or disabled
    if (isSearchByActiveMapArea) {
      headingLabelTextValue = this.props.config.includeFeaturesOutsideMapArea ? this.nls('disabledDefineSearchAreaLabel') : this.nls('currentMapAreaLabel')
    } else {
      headingLabelTextValue = this.nls('locationLabel')
    }
    const searchSettings = {
      headingLabel: headingLabelTextValue,
      bufferDistance: this.props.config.bufferDistance,
      distanceUnits: this.props.config.distanceUnits,
      showDistanceSettings: this.props.config.showDistanceSettings,
      sketchTools: {
        showPoint: this.props.config.sketchTools.showPoint,
        showPolyline: this.props.config.sketchTools.showPolyline,
        showPolygon: this.props.config.sketchTools.showPolygon
      },
      activeToolWhenWidgetOpens: this.props.config.activeToolWhenWidgetOpens,
      searchByActiveMapArea: isSearchByActiveMapArea,
      includeFeaturesOutsideMapArea: this.props.config.includeFeaturesOutsideMapArea,
      headingLabelStyle: {
        fontFamily: this.props.config.headingLabelStyle.fontFamily,
        fontBold: this.props.config.headingLabelStyle.fontBold,
        fontItalic: this.props.config.headingLabelStyle.fontItalic,
        fontUnderline: this.props.config.headingLabelStyle.fontUnderline,
        fontStrike: this.props.config.headingLabelStyle.fontStrike,
        fontColor: this.props.config.headingLabelStyle.fontColor,
        fontSize: this.props.config.headingLabelStyle.fontSize
      },
      showInputAddress: this.props.config.showInputAddress
    }
    this.props.onSearchSettingsUpdated('searchSettings', searchSettings, true)
  }

  /**
   * Toggle inputs on click of collapsible to expand or collapse the panel
   */
  onToggleInputs = () => {
    this.setState({
      isInputSettingOpen: !this.state.isInputSettingOpen
    })
  }

  /**
   * Update show distance settings checkbox state
   * @param evt get the event after show distance settings checkbox state change
   */
  onShowDistanceSettingsChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSearchSettingsUpdated('showDistanceSettings', evt.target.checked)
  }

  /**
   * Updates the sketchTools config if any parameter is updated
   * @param showPoint show point option
   * @param showPolyline show polyline option
   * @param showPolygon show polygon option
   */
  sketchToolsObj = (showPoint: boolean, showPolyline: boolean, showPolygon: boolean) => {
    const sketchTools: SketchTools = {
      showPoint: showPoint,
      showPolyline: showPolyline,
      showPolygon: showPolygon
    }
    let updatedActiveTool = this.props.config.activeToolWhenWidgetOpens
    //if selected tool is deactivated then by default active tool will selected as None
    if ((!showPoint && this.state.activeTool === 'point') ||
      (!showPolyline && this.state.activeTool === 'polyline') ||
      (!showPolygon && this.state.activeTool === 'polygon')) {
      this.setState({ activeTool: 'none' })
      updatedActiveTool = 'none'
    }

    const searchSettings = {
      headingLabel: this.props.config.headingLabel,
      bufferDistance: this.props.config.bufferDistance,
      distanceUnits: this.props.config.distanceUnits,
      showDistanceSettings: this.props.config.showDistanceSettings,
      sketchTools: sketchTools,
      activeToolWhenWidgetOpens: updatedActiveTool,
      searchByActiveMapArea: this.props.config.searchByActiveMapArea,
      includeFeaturesOutsideMapArea: this.props.config.includeFeaturesOutsideMapArea,
      headingLabelStyle: {
        fontFamily: this.props.config.headingLabelStyle.fontFamily,
        fontBold: this.props.config.headingLabelStyle.fontBold,
        fontItalic: this.props.config.headingLabelStyle.fontItalic,
        fontUnderline: this.props.config.headingLabelStyle.fontUnderline,
        fontStrike: this.props.config.headingLabelStyle.fontStrike,
        fontColor: this.props.config.headingLabelStyle.fontColor,
        fontSize: this.props.config.headingLabelStyle.fontSize
      },
      showInputAddress: this.props.config.showInputAddress
    }
    this.props.onSearchSettingsUpdated('searchSettings', searchSettings, true)
  }

  /**
   * Update show sketch tool settings switch state
   * @param evt get the event after show sketch tool settings switch state change
   */
  showSketchTools = (evt: any) => {
    evt.target.title === this.nls('point') && this.setState({
      showPoint: evt.target.checked
    }, () => {
      const updatedWidgetLoadOptions = this.state.onWidgetLoadOptions
      let filteredOptions
      const toolArr = []
      this.state.onWidgetLoadOptions.forEach((option) => {
        toolArr.push(option.value)
      })
      this.state.showPoint && !toolArr.includes('point') && updatedWidgetLoadOptions.push({ value: 'point', name: this.nls('point') })
      if (!this.state.showPoint) {
        filteredOptions = updatedWidgetLoadOptions.filter((option) => option.value !== 'point')
      }
      this.setState({
        onWidgetLoadOptions: filteredOptions || updatedWidgetLoadOptions
      })
      this.sketchToolsObj(this.state.showPoint, this.state.showPolyline, this.state.showPolygon)
    })

    evt.target.title === this.nls('polyline') && this.setState({
      showPolyline: evt.target.checked
    }, () => {
      const updatedWidgetLoadOptions = this.state.onWidgetLoadOptions
      let filteredOptions
      const toolArr = []
      this.state.onWidgetLoadOptions.forEach((option) => {
        toolArr.push(option.value)
      })
      this.state.showPolyline && !toolArr.includes('polyline') && updatedWidgetLoadOptions.push({ value: 'polyline', name: this.nls('polyline') })
      if (!this.state.showPolyline) {
        filteredOptions = updatedWidgetLoadOptions.filter((option) => option.value !== 'polyline')
      }
      this.setState({
        onWidgetLoadOptions: filteredOptions || updatedWidgetLoadOptions
      })
      this.sketchToolsObj(this.state.showPoint, this.state.showPolyline, this.state.showPolygon)
    })

    evt.target.title === this.nls('polygon') && this.setState({
      showPolygon: evt.target.checked
    }, () => {
      const updatedWidgetLoadOptions = this.state.onWidgetLoadOptions
      let filteredOptions
      const toolArr = []
      this.state.onWidgetLoadOptions.forEach((option) => {
        toolArr.push(option.value)
      })
      this.state.showPolygon && !toolArr.includes('polygon') && updatedWidgetLoadOptions.push({ value: 'polygon', name: this.nls('polygon') })
      !this.state.showPolygon && this.state.activeTool === 'polygon' && this.setState({ activeTool: 'none' })
      if (!this.state.showPolygon) {
        filteredOptions = updatedWidgetLoadOptions.filter((option) => option.value !== 'polygon')
      }
      this.setState({
        onWidgetLoadOptions: filteredOptions || updatedWidgetLoadOptions
      })
      this.sketchToolsObj(this.state.showPoint, this.state.showPolyline, this.state.showPolygon)
    })
  }

  /**
   * Update the on widget load active tool settings
   * @param evt get the event to update the active tool
   */
  onActiveToolChange = (evt) => {
    this.setState({
      activeTool: evt.target.value
    })
    this.props.onSearchSettingsUpdated('activeToolWhenWidgetOpens', evt.target.value)
  }

  /**
 * Update show input / closest address from input address checkbox state
 * @param evt get the event after show input address settings checkbox state change
 */
  onShowInputAddressSettingsChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSearchSettingsUpdated('showInputAddress', evt.target.checked)
  }

  render () {
    return (
      <div css={getSearchSettingStyle(this.props.theme)} style={{ height: '100%', width: '100%' }}>
        <React.Fragment>
          <SettingRow flow='wrap'>
            <Label className='m-0' centric>
              <Radio role={'radio'} aria-label={this.nls('searchByActiveMapArea')}
                className={'cursor-pointer'}
                value={'searchByActiveMapArea'}
                onChange={() => { this.handleSearchByChange(true) }}
                checked={this.props.config.searchByActiveMapArea}
                data-testid={'searchByActiveMapArea'} />
              <div tabIndex={0} className='ml-1 text-break cursor-pointer' onClick={() => { !this.props.config.searchByActiveMapArea && this.handleSearchByChange(true) }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    this.handleSearchByChange(true)
                  }
                }}>
                {this.nls('searchByActiveMapArea')}
              </div>
            </Label>
          </SettingRow>

          <SettingRow className={'mt-2'} flow='wrap'>
            <Label className='m-0' centric>
              <Radio role={'radio'} aria-label={this.nls('searchByLocation')}
                className={'cursor-pointer'}
                value={'searchByLocation'}
                onChange={() => { this.handleSearchByChange(false) }}
                checked={!this.props.config.searchByActiveMapArea}
                data-testid={'searchByLocation'} />
              <div tabIndex={0} className='ml-1 text-break cursor-pointer' onClick={() => { this.props.config.searchByActiveMapArea && this.handleSearchByChange(false) }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    this.handleSearchByChange(false)
                  }
                }}>
                {this.nls('searchByLocation')}
              </div>
            </Label>
          </SettingRow>

          <SettingRow className='ml-2' flow={'wrap'}>
            <Label aria-label={this.nls('headingLabel')} title={this.nls('headingLabel')}
              className='w-100 d-flex'>
              <div className='text-truncate flex-grow-1 title3 hint-default'>
                {this.nls('headingLabel')}
              </div>
            </Label>
            <TextFormatSetting
              intl={this.props.intl}
              theme={this.props.theme}
              hintMessage={this.props.config.headingLabel}
              noResultFound={'noResultFound'}
              textStyle={this.props.config.headingLabelStyle}
              onTextMessageChange={this.onHeadingLabelChange}
              onTextFormatChange={this.updateOnHeadingStyleChange}
            />
          </SettingRow>

          {this.props.config.searchByActiveMapArea &&
            <SettingRow tag='label' className='ml-2' label={this.nls('featuresOutsideMapArea')}>
              <Switch role={'switch'} title={this.nls('featuresOutsideMapArea')}
                checked={this.props.config.includeFeaturesOutsideMapArea} onChange={this.onIncludeFeaturesMapAreaToggleChange} data-testid={'featuresOutsideMapArea'} />
            </SettingRow>
          }

          {this.props.config.includeFeaturesOutsideMapArea && this.props.config.searchByActiveMapArea &&
            <SettingRow className='ml-2'>
              <Label tabIndex={0} aria-label={this.nls('searchAreaHint')} className='font-italic w-100 d-flex'>
                <div className='flex-grow-1 text-break title3 hint-default' data-testid={'searchAreaHint'}>
                  {this.nls('searchAreaHint')}
                </div>
              </Label>
            </SettingRow>
          }

          {!this.props.config.searchByActiveMapArea &&
            <React.Fragment>
              <SettingRow className={'mt-4 ml-2'} flow={'wrap'}>
                <Label title={this.nls('bufferDistance')}
                  className='w-100 d-flex'>
                  <div className='text-truncate flex-grow-1 title3 hint-default'>
                    {this.nls('bufferDistance')}
                  </div>
                </Label>
                <NumericInput aria-label={this.nls('bufferDistance')} style={{ width: '240px' }}
                  size={'sm'} min={0} max={getMaxBufferLimit(this.props.config.distanceUnits !== '' ? this.props.config.distanceUnits : getPortalUnit())}
                  value={this.props.config.bufferDistance}
                  onChange={this.onBufferDistanceChange}
                  data-testid={'bufferDistance'} />
              </SettingRow>

              <SettingRow className={'ml-2'} flow={'wrap'}>
                <Label title={this.nls('distanceUnits')}
                  className='w-100 d-flex'>
                  <div className='text-truncate flex-grow-1 title3 hint-default'>
                    {this.nls('distanceUnits')}
                  </div>
                </Label>
                <Select style={{ marginBottom: '1px' }} aria-label={this.nls('distanceUnits') + ' ' + this.props.config.distanceUnits !== '' ? this.props.config.distanceUnits : getPortalUnit()}
                  size={'sm'} value={this.props.config.distanceUnits !== '' ? this.props.config.distanceUnits : getPortalUnit()}
                  onChange={(evt) => { this.onDistanceUnitChange(evt) }} data-testid={'distanceUnits'}>
                  {unitOptions.map((option, index) => {
                    return <Option role={'option'} tabIndex={0} aria-label={option.label} value={option.value} key={index}>{this.nls(option.value)}</Option>
                  })}
                </Select>
              </SettingRow>

              <SettingRow className='border-top pt-3'>
                <CollapsablePanel
                  label={this.nls('inputsCollapsible')}
                  isOpen={this.state.isInputSettingOpen}
                  onRequestOpen={() => { this.onToggleInputs() }}
                  onRequestClose={() => { this.onToggleInputs() }}>
                  <div style={{ height: '100%', marginTop: 10 }}>
                    <SettingRow>
                      <Label check centric style={{ cursor: 'pointer' }}>
                        <Checkbox role={'checkbox'} aria-label={this.nls('showDistanceSettings')}
                          style={{ cursor: 'pointer' }} className='mr-2' checked={this.props.config.showDistanceSettings}
                          onChange={this.onShowDistanceSettingsChange.bind(this)}
                        />
                        {this.nls('showDistanceSettings')}
                      </Label>
                    </SettingRow>

                    <SettingRow>
                      <Label check centric style={{ cursor: 'pointer' }}>
                        <Checkbox role={'checkbox'} aria-label={this.nls('inputAddress')}
                          style={{ cursor: 'pointer' }} className='mr-2' checked={this.props.config.showInputAddress}
                          onChange={this.onShowInputAddressSettingsChange.bind(this)}
                        />
                        {this.nls('inputAddress')}
                      </Label>
                    </SettingRow>

                    <SettingRow>
                      <Label title={this.nls('showSketchTools')}
                        className='w-100 d-flex'>
                        <div className='text-truncate flex-grow-1'>
                          {this.nls('showSketchTools')}
                        </div>
                      </Label>
                    </SettingRow>

                    <SettingRow className='mt-2 mx-2'>
                      <PinEsriOutlined size={'m'} />
                      <Label className='ml-2 w-100 justify-content-between' check centric style={{ cursor: 'pointer' }}>{this.nls('point')}
                        <Switch role={'switch'} aria-label={this.nls('point')} title={this.nls('point')}
                          checked={this.state.showPoint} onChange={this.showSketchTools} />
                      </Label>
                    </SettingRow>

                    <SettingRow className='mt-1 mx-2'>
                      <PolylineOutlined size={'m'} />
                      <Label className='ml-2 w-100 justify-content-between' check centric style={{ cursor: 'pointer' }}>{this.nls('polyline')}
                        <Switch role={'switch'} aria-label={this.nls('polyline')} title={this.nls('polyline')}
                          checked={this.state.showPolyline} onChange={this.showSketchTools} />
                      </Label>
                    </SettingRow>

                    <SettingRow className='mt-1 mx-2'>
                      <PolygonOutlined size={'m'} />
                      <Label className='ml-2 w-100 justify-content-between' check centric style={{ cursor: 'pointer' }}>{this.nls('polygon')}
                        <Switch role={'switch'} aria-label={this.nls('polygon')} title={this.nls('polygon')}
                          checked={this.state.showPolygon} onChange={this.showSketchTools} />
                      </Label>
                    </SettingRow>

                    <SettingRow>
                      <Label tabIndex={0} aria-label={this.nls('activateToolOnLoadLabel')} className='w-100 d-flex' >
                        <div className='flex-grow-1 text-break'>
                          {this.nls('activateToolOnLoadLabel')}
                        </div>
                      </Label>
                      <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('activateToolOnLoadTooltip')}
                        title={this.nls('activateToolOnLoadTooltip')} showArrow placement='top'>
                        <div className='title3 text-default mr-2 d-inline'>
                          <InfoOutlined />
                        </div>
                      </Tooltip>
                    </SettingRow>


                    <SettingRow>
                      <Select aria-label={this.nls('activateToolOnLoadLabel')} className={'selectOption'}
                        size={'sm'} name={'activateToolOnLoad'}
                        value={this.state.activeTool}
                        onChange={this.onActiveToolChange}>
                        {this.state.onWidgetLoadOptions.map((option, index) => {
                          return <Option role={'option'} aria-label={this.nls(option.value)} key={index} value={option.value}>
                            {this.nls(option.value)}</Option>
                        })}
                      </Select>
                    </SettingRow>
                  </div>
                </CollapsablePanel>
              </SettingRow>
            </React.Fragment>
          }
        </React.Fragment>
      </div>
    )
  }
}
