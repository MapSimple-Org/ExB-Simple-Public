/** @jsx jsx */
import {
  React, jsx, type SerializedStyles,
  type IMThemeVariables, css, type IntlShape,
  focusElementInKeyboardMode
} from 'jimu-core'
import { Button, TextInput, NumericInput, Slider, Radio, Label, defaultMessages } from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'

import { RotateDirection } from '../../../../config'
import type { RecordConfig, RotateRecordConfig, PathRecordConfig, PathType } from '../../../../common/fly-facade/plan-routes/record/record'
import type Record from '../../../../common/fly-facade/plan-routes/record/record'
import { ControllerMode } from '../../../../common/fly-facade/controllers/base-fly-controller'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import nls from '../../../translations/default'
import type { LiveViewSettingOptions } from '../../../../common/fly-facade/controllers/common/liveview-setting'
import type { FlyIds } from '../../../../common/fly-facade/fly-manager'
import { isDefined, angleNumFix, altNumFix, timeNumFix } from '../../../../common/utils/utils'
import { Constraints } from '../../../../common/constraints'
// resources
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'

interface Props {
  record: Record
  mapPopperJimuMapView: JimuMapView

  theme: IMThemeVariables
  intl: IntlShape

  onRecordEdit: (ids: FlyIds) => void
  onRecordChange: (recordConfig: RecordConfig) => void

  getCurrentLiveViewSetting: () => LiveViewSettingOptions
  getDefaultDuration: () => number
  onLiveViewSettingChange: (settingParamObj: LiveViewSettingOptions) => void
}
interface States {
  // point
  rotateDirection: RotateDirection
  tilt: number
  angle: number
  // path
  pathStyle: ControllerMode
  altitude: number
  // AdvancedSettings
  duration: number // path fly need calculate flyTime in controller base on line-feature, when init
  endDelay: number
}

export class RecordDetail extends React.PureComponent<Props, States> {
  tmpRecordConfig: RecordConfig
  backBtnRefFor508: HTMLButtonElement = null //508

  constructor (props) {
    super(props)

    const { type } = this.props.record.getConfig()

    let rotateDirection, tilt,
      pathStyle, altitude
    if (type === ControllerMode.Rotate) {
      rotateDirection = this.props.record.getConfig().direction
      tilt = this.props.getCurrentLiveViewSetting().tilt
    } else if (type === ControllerMode.RealPath || type === ControllerMode.Smoothed) {
      pathStyle = this.props.record.getConfig().type
      altitude = this.props.getCurrentLiveViewSetting().altitude
    }

    const initDuration = this.props.getDefaultDuration() / 1000
    const duration = isDefined(this.props.record.getConfig().duration) ? this.props.record.getConfig().duration : initDuration
    const initAngle = (this.props.record.getConfig() as RotateRecordConfig).angle
    const initEndDelay = this.props.record.getConfig().endDelay

    this.state = {
      // point
      rotateDirection: rotateDirection,
      tilt: angleNumFix(tilt),
      angle: angleNumFix(initAngle),
      // path
      pathStyle: pathStyle,
      altitude: altNumFix(altitude),
      // AdvancedSettings
      duration: timeNumFix(duration),
      endDelay: timeNumFix(initEndDelay)
    }

    this.tmpRecordConfig = this.props.record.getConfig()// for cache change
  }

  componentDidMount (): void {
    focusElementInKeyboardMode(this.backBtnRefFor508) //508
  }

  handleKeydown = (e: any, ref): void => {
    if (e.key === 'Enter') {
      ref.current.blur()
    }
  }

  getStyle = (): SerializedStyles => {
    return css`
      .tilt-setting{
        .tilt-slider{
          width:80px
        }

        .tilt-number{
          .jimu-numeric-input {
            width: 64px;
          }
        }
      }

      .altitude-setting{
        margin-top: 1rem;
        margin-bottom: 1rem;

        .altitude-number{
          width: 90px;

          .jimu-numeric-input-input{
            width: 90px;
          }
        }
        .altitude-tips{
          text-align:right;
        }
        .small-tips{
          font-size: 12px;
          color: #A8A8A8;
        }
      }
      `
  }

  handleBackBtnClick = (): void => {
    this.props.onRecordChange(this.tmpRecordConfig)// save
    this.props.onRecordEdit({ routeUuid: null, recordUuid: null })// exit to 3rd level menu
  }

  render (): React.ReactElement {
    const recordConfig = this.props.record.getConfig()

    const titleTextInput = React.createRef<HTMLInputElement>()
    // const durationInput = React.createRef<HTMLInputElement>();
    // const degreeInput = React.createRef<HTMLInputElement>();
    // const waitingInput = React.createRef<HTMLInputElement>();
    // const second = this.props.intl.formatMessage({ id: 'second', defaultMessage: defaultMessages.second });
    const nameLabel = this.props.intl.formatMessage({ id: 'label', defaultMessage: defaultMessages.label })
    const backLabel = this.props.intl.formatMessage({ id: 'back', defaultMessage: defaultMessages.back })

    const recordType: ControllerMode = recordConfig?.type

    return (isDefined(recordConfig) &&
      <div className='w-100' css={this.getStyle()}>
        {/* level-3 */}
        <SettingSection>
          <Button className='page-back-btn p-0 mt-1 mb-2' type='tertiary'
            title={backLabel} aria-label={backLabel}
            onClick={this.handleBackBtnClick} ref={(ref) => { this.backBtnRefFor508 = ref }}>
            <ArrowLeftOutlined size={'m'} autoFlip />
            <Label className='m-0'>{backLabel}</Label>
          </Button>
          {/* <Button className="mr-1" onClick={e => this.onDeleteClick(routeInfo.idx)}>
          <Icon icon={require('jimu-ui/lib/icons/tool-delete')} size={12} />
        </Button> */}

          <SettingRow label={nameLabel} />
          <SettingRow>
            <TextInput
              className='w-100' ref={titleTextInput} size='sm' required
              title={recordConfig.displayName} defaultValue={recordConfig.displayName ?? ''}
              onAcceptValue={this.handleDisplayNameChange}
              onKeyDown={(e) => { this.handleKeydown(e, titleTextInput) }}
            />
          </SettingRow>

          {/* point */
            (recordType === ControllerMode.Rotate) &&
              <React.Fragment>
                {this.renderPointDirection()}
                {this.renderTilt()}
                {this.renderPointsAdvancedSettings()}
              </React.Fragment>
          }
          {/* path */
            (recordType === ControllerMode.RealPath || recordType === ControllerMode.Smoothed) &&
              <React.Fragment>
                {this.renderPathStyle()}
                {this.renderAltitude()}
                {this.renderPathAdvancedSettings()}
              </React.Fragment>
          }
        </SettingSection>
      </div>)
  }

  // change
  handleRecordChange = (recordConfig: RecordConfig): void => {
    this.props.onRecordChange(recordConfig)
  }

  // common
  handleDisplayNameChange = (name: string): void => {
    this.tmpRecordConfig.displayName = name
  }

  handleDurationChange = (duration: number): void => {
    this.tmpRecordConfig.duration = timeNumFix(duration)
    this.setState({ duration: this.tmpRecordConfig.duration })
  }

  handleDelayChange = (endDelay: number): void => {
    this.tmpRecordConfig.endDelay = timeNumFix(endDelay)
    this.setState({ endDelay: this.tmpRecordConfig.endDelay })
  }

  // 1 point
  handlePointDirectionChange = (dir: RotateDirection): void => {
    (this.tmpRecordConfig as RotateRecordConfig).direction = dir
    this.setState({ rotateDirection: dir })
  }

  handlePointTiltChange = (tilt: number): void => {
    let _tilt = (this.tmpRecordConfig as PathRecordConfig).controllerConfig.liveviewSettingState.fixTilt
    _tilt = angleNumFix(tilt)

    this.props.onLiveViewSettingChange({ tilt: _tilt })

    this.setState({ tilt: _tilt })
  }

  handlePointAngleChange = (angle: number): void => {
    (this.tmpRecordConfig as RotateRecordConfig).angle = angleNumFix(angle)
    this.setState({ angle: (this.tmpRecordConfig as RotateRecordConfig).angle })
  }

  renderPointDirection = (): React.ReactElement => {
    const isCW = (this.state.rotateDirection === RotateDirection.CW)

    const label = this.props.intl.formatMessage({ id: 'styleLabelRotate', defaultMessage: nls.styleLabelRotate })
    const cw = this.props.intl.formatMessage({ id: 'CW', defaultMessage: nls.CW })
    const ccw = this.props.intl.formatMessage({ id: 'CCW', defaultMessage: nls.CCW })

    return (
      <React.Fragment>
        <SettingRow label={label} />
        <SettingRow className='mt-2 radio-wrapper'>
          <Radio checked={isCW} id='CW' style={{ cursor: 'pointer' }} onChange={e => { this.handlePointDirectionChange(RotateDirection.CW) }} />
          <Label style={{ cursor: 'pointer' }} for='CW' className='ml-1 text-break'>{cw}</Label>
        </SettingRow>
        <SettingRow className='mt-2 radio-wrapper'>
          <Radio checked={!isCW} id='CCW' style={{ cursor: 'pointer' }} onChange={e => { this.handlePointDirectionChange(RotateDirection.CCW) }} />
          <Label style={{ cursor: 'pointer' }} for='CCW' className='ml-1 text-break'>{ccw}</Label>
        </SettingRow>
      </React.Fragment>
    )
  }

  renderTilt = (): React.ReactElement => {
    const { tilt } = this.state

    const label = this.props.intl.formatMessage({ id: 'tilt', defaultMessage: defaultMessages.tilt })
    const degree = this.props.intl.formatMessage({ id: 'degree', defaultMessage: defaultMessages.degree })

    return (
      <React.Fragment>
        <SettingRow label={label} />
        <SettingRow className='tilt-setting mt-0'>
          <Slider
            className='d-flex dropdown-item tilt-slider' value={tilt}
            min={Constraints.TILT.MIN} max={Constraints.TILT.MAX} step={Constraints.TILT.STEP}
            onChange={(evt) => { this.handlePointTiltChange(parseFloat(evt.target.value)) }}
          />

          <div className='d-flex tilt-number'>
            <NumericInput
              className='m-2' defaultValue='0' size='sm' value={tilt}
              min={Constraints.TILT.MIN} max={Constraints.TILT.MAX}
              onChange={(val) => { this.handlePointTiltChange(val) }}
            />
            <Label className=''>{degree}</Label>
          </div>
        </SettingRow>
      </React.Fragment>
    )
  }

  renderPointsAdvancedSettings = (): React.ReactElement => {
    const { duration, angle, endDelay } = this.state

    const advancedSettingsLabel = this.props.intl.formatMessage({ id: 'advancedSettings', defaultMessage: nls.advancedSettings })
    const durationLabel = this.props.intl.formatMessage({ id: 'duration', defaultMessage: nls.duration })
    const rotationAngleLabel = this.props.intl.formatMessage({ id: 'rotationAngle', defaultMessage: nls.rotationAngle })
    const delayLabel = this.props.intl.formatMessage({ id: 'endDelay', defaultMessage: nls.endDelay })

    return (
      <React.Fragment>
        <SettingRow label={advancedSettingsLabel} />
        <SettingRow>
          <Label className=''>{durationLabel}</Label>
        </SettingRow>
        <SettingRow>
          <NumericInput
            className='w-100' size='sm' showHandlers={false}
            value={duration} min={Constraints.TIME.MIN}
            onChange={(value) => { this.handleDurationChange(value) }}
          />
        </SettingRow>

        <SettingRow>
          <Label className=''>{rotationAngleLabel}</Label>
        </SettingRow>
        <SettingRow>
          <NumericInput
            className='w-100' size='sm' showHandlers={false}
            value={angle} min={0}
            onChange={(value) => { this.handlePointAngleChange(value) }}
          />
        </SettingRow>

        <SettingRow>
          <Label className=''>{delayLabel}</Label>
        </SettingRow>
        <SettingRow>
          <NumericInput
            className='w-100' size='sm' showHandlers={false}
            value={endDelay} min={Constraints.TIME.MIN}
            onChange={(value) => { this.handleDelayChange(value) }}
          />
        </SettingRow>
      </React.Fragment>
    )
  }

  // 2 path
  handlePathStyleChange = (type: PathType): void => {
    (this.tmpRecordConfig as PathRecordConfig).type = type
    this.setState({ pathStyle: type })
  }

  handlePathAltitudeChange = (altitude: number): void => {
    let _altitude = (this.tmpRecordConfig as PathRecordConfig).controllerConfig.liveviewSettingState.fixAltitude
    _altitude = altNumFix(altitude)

    this.props.onLiveViewSettingChange({ altitude: _altitude })

    this.setState({ altitude: _altitude })
  }

  renderPathStyle = (): React.ReactElement => {
    const isCurve = (this.state.pathStyle === ControllerMode.Smoothed)

    const label = this.props.intl.formatMessage({ id: 'styleLabelPath', defaultMessage: nls.styleLabelPath })
    const smoothedCurve = this.props.intl.formatMessage({ id: 'pathTypeSmoothedCurve', defaultMessage: nls.pathTypeSmoothedCurve })
    const realPath = this.props.intl.formatMessage({ id: 'pathTypeRealPath', defaultMessage: nls.pathTypeRealPath })

    return (
      <React.Fragment>
        <SettingRow>
          <Label className=' text-truncate'>{label}</Label>
        </SettingRow>
        <SettingRow className='mt-2 radio-wrapper'>
          <Radio checked={isCurve} id='CURVED' style={{ cursor: 'pointer' }} onChange={e => { this.handlePathStyleChange(ControllerMode.Smoothed) }} />
          <Label style={{ cursor: 'pointer' }} for='CURVED' className='ml-1 text-break'>{smoothedCurve}</Label>
        </SettingRow>
        <SettingRow className='mt-2 radio-wrapper'>
          <Radio checked={!isCurve} id='LINE' style={{ cursor: 'pointer' }} onChange={e => { this.handlePathStyleChange(ControllerMode.RealPath) }} />
          <Label style={{ cursor: 'pointer' }} for='LINE' className='ml-1 text-break'>{realPath}</Label>
        </SettingRow>
      </React.Fragment>
    )
  }

  renderAltitude = (): React.ReactElement => {
    const { altitude } = this.state

    const altitudeLabel = this.props.intl.formatMessage({ id: 'altitude', defaultMessage: defaultMessages.altitude })
    const meterAbbr = this.props.intl.formatMessage({ id: 'meterAbbr', defaultMessage: defaultMessages.meterAbbr })
    const ground = this.props.intl.formatMessage({ id: 'ground', defaultMessage: defaultMessages.ground })
    const space = this.props.intl.formatMessage({ id: 'outerSpace', defaultMessage: defaultMessages.outerSpace })
    const relative2Ground = this.props.intl.formatMessage({ id: 'relative2Ground', defaultMessage: defaultMessages.relative2Ground })

    return (
      <div className='altitude-setting'>
        <SettingRow>
          <Label className=''>{altitudeLabel}</Label>
        </SettingRow>

        <SettingRow className='d-flex justify-content-between'>
          <div className='d-flex altitude-number'>
            <NumericInput
              defaultValue='0' size='sm' value={altitude}
              min={Constraints.ALT.MIN} max={Constraints.ALT.MAX}
              onChange={(value) => { this.handlePathAltitudeChange(value) }}
            />
            <Label className='small-tips'>{meterAbbr}</Label>
          </div>

          <Label className='small-tips altitude-tips ml-5'>{relative2Ground}</Label>
        </SettingRow>

        <SettingRow>
          <Slider
            className='d-flex dropdown-item' value={altitude}
            min={Constraints.ALT.MIN} max={Constraints.ALT.MAX} step={Constraints.ALT.STEP}
            onChange={(evt) => { this.handlePathAltitudeChange(parseFloat(evt.target.value)) }}
            title=''
          />
        </SettingRow>

        <SettingRow className='d-flex mt-0 justify-content-between '>
          <Label className='small-tips'>{ground}</Label>
          <Label className='small-tips'>{space}</Label>
        </SettingRow>
      </div>
    )
  }

  renderPathAdvancedSettings = (): React.ReactElement => {
    const { duration, endDelay } = this.state

    const advancedSettingsLabel = this.props.intl.formatMessage({ id: 'advancedSettings', defaultMessage: nls.advancedSettings })
    const durationLabel = this.props.intl.formatMessage({ id: 'duration', defaultMessage: nls.duration })
    const delayLabel = this.props.intl.formatMessage({ id: 'endDelay', defaultMessage: nls.endDelay })

    return (
      <React.Fragment>
        <SettingRow label={advancedSettingsLabel} />
        <SettingRow>
          <Label className=''>{durationLabel}</Label>
        </SettingRow>
        <SettingRow>
          <NumericInput
            className='w-100' size='sm' showHandlers={false}
            value={duration} min={Constraints.TIME.MIN}
            onChange={(value) => { this.handleDurationChange(value) }}
          />
        </SettingRow>

        <SettingRow>
          <Label className=''>{delayLabel}</Label>
        </SettingRow>
        <SettingRow>
          <NumericInput
            className='w-100' size='sm' showHandlers={false}
            value={endDelay} min={Constraints.TIME.MIN}
            onChange={(value) => { this.handleDelayChange(value) }}
          />
        </SettingRow>
      </React.Fragment>
    )
  }
}
