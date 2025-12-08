/** @jsx jsx */
import { React, css, jsx, polished, defaultMessages as jimuCoreDefaultMessage, hooks, classNames, type IMState, ReactRedux } from 'jimu-core'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { type IMConfig, ArrangementStyle } from '../../config'
import { Icon, Button, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import defaultMessage from '../translations/default'

interface ArrangementStyleProps {
  id: string
  onSettingChange: SettingChangeFunction
  config: IMConfig
}

const ArrangementStyleSetting = (props: ArrangementStyleProps) => {
  const STYLE = css`
    .active {
      .style-img {
        border: 2px solid var(--sys-color-primary-light);
      }
    }
    .style-img {
      border: 2px solid transparent;
      height: ${polished.rem(36)} !important;
      margin: 0;
    }
    .arrangement1 .style-img {
      height: ${polished.rem(40)} !important;
    }
    .arrangement {
      margin: 0;
      height: auto;
      background: var(--ref-palette-neutral-200);
    }
    .arrangement-mt {
      margin-top: ${polished.rem(12)};
    }
    & button {
      width: ${polished.rem(108)};
      height: ${polished.rem(80)};
      padding: 0;
    }
  `

  const nls = hooks.useTranslation(defaultMessage, jimuiDefaultMessage, jimuCoreDefaultMessage)
  const { config, id, onSettingChange } = props

  const isRTL = ReactRedux.useSelector((state: IMState) => {
    return state.appContext.isRTL
  })

  const onArrangementStyleChange = (style: ArrangementStyle) => {
    onSettingChange({
      id: id,
      config: config.set('arrangementStyle', style)
    })
  }

  return (
    <SettingSection title={nls('arrangementStyle')} css={STYLE}>
      <SettingRow>
        <div aria-label={nls('arrangementStyle')} role='radiogroup'>
          <Button
            type='tertiary'
            role='radio'
            className={classNames('w-100 arrangement arrangement1', { active: config.arrangementStyle === ArrangementStyle.Style1 })}
            onClick={() => { onArrangementStyleChange(ArrangementStyle.Style1) }}
            title={nls('styleSquare')}
          >
            <Icon className='style-img w-100 h-100' icon={require(isRTL ? '../assets/arrangement4.png' : '../assets/arrangement1.png')}/>
          </Button>
          <Button
            type='tertiary'
            role='radio'
            className={classNames('w-100 arrangement arrangement-mt', { active: config.arrangementStyle === ArrangementStyle.Style2 })}
            onClick={() => { onArrangementStyleChange(ArrangementStyle.Style2) }}
            title={nls('styleCurve')}
          >
            <Icon className='style-img w-100 h-100' icon={require(isRTL ? '../assets/arrangement5.png' : '../assets/arrangement2.png')}/>
          </Button>
          <Button
            type='tertiary'
            role='radio'
            className={classNames('w-100 arrangement arrangement-mt', { active: config.arrangementStyle === ArrangementStyle.Style3 })}
            onClick={() => { onArrangementStyleChange(ArrangementStyle.Style3) }}
            title={nls('styleLinear')}
          >
            <Icon className='style-img w-100 h-100' icon={require(isRTL ? '../assets/arrangement6.png' : '../assets/arrangement3.png')}/>
          </Button>
        </div>
      </SettingRow>
    </SettingSection>
  )
}

export default ArrangementStyleSetting
