/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, type IMThemeVariables, defaultMessages as jimuCoreDefaultMessages, type ImmutableObject } from 'jimu-core'
import { Label, NumericInput, Radio, Select, Option, Switch, Tooltip, defaultMessages as jimuUIDefaultMessages, Checkbox } from 'jimu-ui'
import defaultMessages from '../translations/default'
import type { TraceResultAreaSettings } from '../../config'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { colorUtils, getAppThemeVariables, getTheme2 } from 'jimu-theme'
import { defaultConfiguration, defaultShapeDistance, unitOptions } from '../constants'
import { getMaxBufferLimit, getPortalUnit, validateMaxBufferDistance } from '../../common/utils'
import { traceResultAreaStyle } from '../lib/style'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  config: ImmutableObject<TraceResultAreaSettings>
  onResultAreaSettingsUpdated: (prop: string, value: boolean | __esri.ResultAreaPropertiesExtend) => void
}

interface State {
  apiLoaded: boolean
  enableResultArea: boolean
  resultAreaColor: string
  showWhenTraceComplete: boolean
  resultAreaShapeType: 'buffer' | 'convexhull'
  shapeUnit: string | number
  shapeDistanceInput: number
}

export default class TraceResultArea extends React.PureComponent<Props, State> {
  EsriColor: typeof __esri.Color
  constructor (props) {
    super(props)

    this.state = {
      apiLoaded: false,
      enableResultArea: this.props.config.enableResultArea,
      resultAreaColor: this.props.config.resultAreaProperties.color.hex ? this.props.config.resultAreaProperties.color.hex : '#ffa500',
      showWhenTraceComplete: this.props.config.resultAreaProperties.show,
      resultAreaShapeType: this.props.config.resultAreaProperties.type,
      shapeUnit: this.props.config.resultAreaProperties.unit ? this.props.config.resultAreaProperties.unit : getPortalUnit(),
      shapeDistanceInput: this.props.config.resultAreaProperties.distance
    }
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages, jimuCoreDefaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl && this.props.intl.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidMount = () => {
    if (!this.state.apiLoaded) {
      this.loadAPIModule()
    }
  }

  //Load the required api modules using loadArcGISJSAPIModules
  loadAPIModule = async () => {
    if (!this.state.apiLoaded) {
      await loadArcGISJSAPIModules([
        'esri/Color'
      ]).then(modules => {
        [this.EsriColor] = modules
        this.setState({
          apiLoaded: true
        })
      }); return
    }
    return Promise.resolve()
  }

  /**
   * Update the enebale result area in the config
   * @param evt get the event on toggle of enable result area
   */
  onEnableResultAreaChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      enableResultArea: evt.target.checked
    }, () => {
      this.props.onResultAreaSettingsUpdated('enableResultArea', this.state.enableResultArea)
    })
  }

  /**
 * Update the resultAreaProperties parameter in the config using the current state of each individual property
 */
  updateResultAreaProperty = () => {
    const updatedColor = new this.EsriColor(colorUtils.getThemeColorVariableValue(this.state.resultAreaColor, getAppThemeVariables()))
    updatedColor.a = 0.5
    const resultAreaProps: __esri.ResultAreaPropertiesExtend = {
      type: this.state.resultAreaShapeType,
      distance: this.state.shapeDistanceInput,
      unit: this.state.shapeUnit as __esri.LengthUnit,
      areaUnit: ('square-' + this.state.shapeUnit) as __esri.AreaUnit,
      color: {
        color: updatedColor.toRgba(),
        haloOpacity: defaultConfiguration.traceResultAreaSettings.resultAreaProperties.color.haloOpacity,
        hex: colorUtils.getThemeColorVariableValue(this.state.resultAreaColor, getAppThemeVariables())
      },
      show: this.state.showWhenTraceComplete
    }
    this.props.onResultAreaSettingsUpdated('resultAreaProperties', resultAreaProps)
  }

  /**
   * Update the result area color on change color
   * @param color get the changed color from colorpicker
   */
  onResultAreaColorChange = (color: string) => {
    this.setState({
      resultAreaColor: color
    }, () => {
      this.updateResultAreaProperty()
    })
  }

  /**
   * Update the ShowWhenTraceComplete parameter in the config
   * @param evt get the event on checked of ShowWhenTraceComplete
   */
  onShowWhenTraceCompleteSwitchChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      showWhenTraceComplete: evt.target.checked
    }, () => {
      this.updateResultAreaProperty()
    })
  }

  /**
   * Update the shape type on change of radio button
   * @param shapeType shape type convexhull | buffer
   */
  handleShapeChange = (shapeType: 'buffer' | 'convexhull') => {
    this.setState({
      resultAreaShapeType: shapeType
    }, () => {
      this.updateResultAreaProperty()
    })
  }

  /**
   * Update the shape distance input value
   * @param value distance
   */
  onShapeDistanceChange = (value: number | undefined) => {
    this.setState({
      shapeDistanceInput: value
    })
  }

  /**
* handle accept value event for distance box
* @param value updated distance value
*/
  onShapeDistanceAcceptValue = (value: number | undefined) => {
    this.setState({
      shapeDistanceInput: value ?? defaultShapeDistance
    }, () => {
      this.updateResultAreaProperty()
    })
  }

  /**
   * Update the shape area unit and distance depending on the valid buffer disatnce
   * @param evt get the event on shape unit changed
   */
  onShapeUnitsChange = (evt: any) => {
    const shapeDistanceMaxLimit = validateMaxBufferDistance(this.state.shapeDistanceInput, evt.target.value)
    this.setState({
      shapeUnit: evt.target.value,
      shapeDistanceInput: shapeDistanceMaxLimit
    }, () => {
      this.updateResultAreaProperty()
    })
  }

  render () {
    return (
      <div style={{ height: '100%', width: '100%', marginTop: '5px' }} css={traceResultAreaStyle(this.props.theme)}>
        <SettingSection>
          <SettingRow>
            <Label aria-label={this.nls('resultAreaLabel')} title={this.nls('resultAreaLabel')}
              className='w-100 d-flex'>
              <div className='w-100 text-truncate flex-grow-1 title2 hint-paper'>
                {this.nls('resultAreaLabel')}
              </div>
            </Label>
            <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('resultAreaTooltip')}
              title={this.nls('resultAreaTooltip')} showArrow placement='top'>
              <div className='title3 text-default d-inline'>
                <InfoOutlined />
              </div>
            </Tooltip>
          </SettingRow>

          <SettingRow tag='label' label={this.nls('createResultAreaLabel')}>
            <Switch role={'switch'} aria-label={this.nls('createResultAreaLabel')} title={this.nls('createResultAreaLabel')}
              checked={this.state.enableResultArea} onChange={this.onEnableResultAreaChange} />
          </SettingRow>

          {this.state.enableResultArea &&
            <React.Fragment>
              <SettingRow label={this.nls('colorLabel')}>
                <ThemeColorPicker aria-label={this.nls('colorLabel')} specificTheme={getTheme2()}
                  value={(this.state.resultAreaColor ? this.state.resultAreaColor : '#ffa500')}
                  onChange={(color) => { this.onResultAreaColorChange(color) }} />
              </SettingRow>

              <SettingRow>
                <Label check centric style={{ cursor: 'pointer' }}>
                  <Checkbox role={'checkbox'} aria-label={this.nls('showWhenTraceCompleteLabel')}
                    style={{ cursor: 'pointer' }} className='mr-2' checked={this.state.showWhenTraceComplete}
                    onChange={this.onShowWhenTraceCompleteSwitchChange.bind(this)}
                  />
                  {this.nls('showWhenTraceCompleteLabel')}
                </Label>
              </SettingRow>

              <SettingRow flow={'wrap'} >
                <Label tabIndex={0} aria-label={this.nls('shapeLabel')} title={this.nls('shapeLabel')}
                  className='w-100 d-flex'>
                  <div className='text-truncate flex-grow-1 title3 text-default'>
                    {this.nls('shapeLabel')}
                  </div>
                </Label>
              </SettingRow>

              <SettingRow className={'mt-2'} flow='wrap'>
                <Label className='m-0 shapeTypeWidth' centric>
                  <Radio role={'radio'} aria-label={this.nls('convexHullLabel')}
                    className={'cursor-pointer'}
                    value={this.nls('convexHullLabel')}
                    onChange={() => { this.handleShapeChange('convexhull') }}
                    checked={this.props.config.resultAreaProperties.type === 'convexhull'} />
                  <div tabIndex={0} className='ml-1 cursor-pointer text-break' onClick={() => { !(this.props.config.resultAreaProperties.type === 'convexhull') && this.handleShapeChange('convexhull') }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        !(this.props.config.resultAreaProperties.type === 'convexhull') && this.handleShapeChange('convexhull')
                      }
                    }}>
                    {this.nls('convexHullLabel')}
                  </div>
                </Label>
                <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('convexHullTooltip')}
                  title={this.nls('convexHullTooltip')} showArrow placement='top'>
                  <div className='title3 text-default d-inline'>
                    <InfoOutlined />
                  </div>
                </Tooltip>
              </SettingRow>

              <SettingRow className={'mt-2'} flow='wrap'>
                <Label className='m-0 shapeTypeWidth' centric>
                  <Radio role={'radio'} aria-label={this.nls('bufferLabel')}
                    className={'cursor-pointer'}
                    value={this.nls('bufferLabel')}
                    onChange={() => { this.handleShapeChange('buffer') }}
                    checked={this.props.config.resultAreaProperties.type === 'buffer'} />
                  <div tabIndex={0} className='ml-1 cursor-pointer text-break' onClick={() => { !(this.props.config.resultAreaProperties.type === 'buffer') && this.handleShapeChange('buffer') }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        !(this.props.config.resultAreaProperties.type === 'buffer') && this.handleShapeChange('buffer')
                      }
                    }}>
                    {this.nls('bufferLabel')}
                  </div>
                </Label>
                <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('bufferTooltip')}
                  title={this.nls('bufferTooltip')} showArrow placement='top'>
                  <div className='title3 text-default d-inline'>
                    <InfoOutlined />
                  </div>
                </Tooltip>
              </SettingRow>

              <SettingRow flow={'wrap'} >
                <Label tabIndex={0} aria-label={this.nls('distanceLabel')} title={this.nls('distanceLabel')}
                  className='w-100 d-flex'>
                  <div className='text-truncate flex-grow-1 title3 text-default'>
                    {this.nls('distanceLabel')}
                  </div>
                </Label>
              </SettingRow>

              <div className={'pt-1'}>
                <SettingRow>
                  <NumericInput style={{ width: 103 }} aria-label={this.state.shapeDistanceInput + ''} title={this.state.shapeDistanceInput + ''}
                    size={'sm'} defaultValue={this.state.shapeDistanceInput} min={0} max={getMaxBufferLimit(this.state.shapeUnit)}
                    value={this.state.shapeDistanceInput} showHandlers={false} onChange={this.onShapeDistanceChange}
                    onAcceptValue={this.onShapeDistanceAcceptValue} />

                  <Select aria-label={this.state.shapeUnit.toString()} style={{ width: 129 }} className={'pl-2'}
                    size={'sm'} name={'shapeUnits'}
                    value={this.state.shapeUnit.toString()}
                    onChange={this.onShapeUnitsChange}>
                    {unitOptions.map((option, index) => {
                      return <Option role={'option'} aria-label={option.value} key={index} value={option.value}>
                        {this.nls(option.value)}</Option>
                    })}
                  </Select>
                </SettingRow>
              </div>
            </React.Fragment>
          }
        </SettingSection>
      </div>
    )
  }
}
