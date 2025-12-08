/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { hooks, Radio, Label, NumericInput, defaultMessages } from 'jimu-ui'
import { type ItemsType, type RotateItemConfig, RotateTargetMode, type AroundMapCenterItemConfig } from '../../config'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import nls from '../translations/default'

interface Props {
  styleConfig: ItemsType
  idx: number
  onEnableAroundMapCenter: (evt, idx: number) => void
  onPauseTimeChange: (val: number, idx: number) => void
}

export const RotateModeSetting = React.memo((props: Props) => {
  const translate = hooks.useTranslate(nls, defaultMessages)

  const DEFAULT_PARAMS = React.useMemo(() => {
    return {
      pauseTimeDefault: 2.0,
      pauseTimeMax: 30,
      pauseTimeMin: 0
    }
  }, [])

  const isAroundMapCenter = ((props.styleConfig as RotateItemConfig).targetMode === RotateTargetMode.MapCenter)
  const pauseTime = (props.styleConfig as AroundMapCenterItemConfig).rotationPauseTime

  const rotateModeTips = translate('rotateMode')
  const aroundAPointTips = translate('aroundAPoint')
  const aroundMapCenterTips = translate('aroundMapCenter')
  const pauseTimeTips = 'pause time'//translate('pauseTime')
  return (
    <React.Fragment>
      <SettingRow>
        <Label className='fly-style-label'>{rotateModeTips}</Label>
      </SettingRow>
      <SettingRow className='mt-2 radio-wrapper'>
        <Radio checked={!isAroundMapCenter} id='aroundAPoint' style={{ cursor: 'pointer' }} onChange={e => { props.onEnableAroundMapCenter(RotateTargetMode.Point, props.idx) }} />
        <Label style={{ cursor: 'pointer' }} for='aroundAPoint' className='ml-1 text-break'>{aroundAPointTips}</Label>
      </SettingRow>
      <SettingRow className='mt-2 radio-wrapper'>
        <Radio checked={isAroundMapCenter} id='aroundMapCenter' style={{ cursor: 'pointer' }} onChange={e => { props.onEnableAroundMapCenter(RotateTargetMode.MapCenter, props.idx) }} />
        <Label style={{ cursor: 'pointer' }} for='aroundMapCenter' className='ml-1 text-break'>{aroundMapCenterTips}</Label>
      </SettingRow>

      {isAroundMapCenter && <React.Fragment>
        {/* pauseTime */}
        <SettingRow className='d-none justify-content-between mt-2'>
          <Label className='ml-1 text-break'>{pauseTimeTips}</Label>

          <NumericInput
            className='ml-2 numeric-input' size='sm'
            value={pauseTime} defaultValue={DEFAULT_PARAMS.pauseTimeDefault}
            min={DEFAULT_PARAMS.pauseTimeMin} max={DEFAULT_PARAMS.pauseTimeMax} step={0.1} precision={1}
            onChange={(val) => { props.onPauseTimeChange(val, props.idx) }}
            required={true}
          />
        </SettingRow>
      </React.Fragment>
      }
    </React.Fragment>
  )
})
