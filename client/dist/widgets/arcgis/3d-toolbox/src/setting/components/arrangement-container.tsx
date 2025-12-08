/** @jsx jsx */
import { React, jsx, classNames, hooks } from 'jimu-core'
import { Label, Button, Icon, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow, SettingSection, DirectionSelector } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { type Arrangement, ArrangementStyle, ArrangementDirection } from '../../constraints'

export interface Props {
  widgetId: string
  arrangement?: Arrangement
  onChange: (arrangement: Arrangement) => void
}

export const ArrangementContainer = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const _onChange = props.onChange
  const handleArrangementStyleChange = React.useCallback((arrangementStyle: ArrangementStyle) => {
    _onChange({
      ...props.arrangement,
      style: arrangementStyle
    })
  }, [_onChange, props.arrangement])
  const handleArrangementDirectionChange = React.useCallback((vertical: boolean) => {
    _onChange({
      ...props.arrangement,
      direction: vertical ? ArrangementDirection.Vertical : ArrangementDirection.Horizontal
    })
  }, [_onChange, props.arrangement])

  const arrangementTips = translate('arrangementStyle')

  const a11yDescriptionId = props.widgetId + '-uimode-description'
  const a11yUIMode0Id = props.widgetId + '-uimode-0'
  const a11yUIMode1Id = props.widgetId + '-uimode-1'

  const listModeTips = translate('listMode')
  const iconModeTips = translate('iconMode')
  return (
    <React.Fragment>
      <SettingSection title={arrangementTips} role='group' aria-label={arrangementTips}>
        { /* Arrangement */}
        <SettingRow>
          <div className='ui-mode-card-chooser d-flex align-items-center justify-content-between w-100'>
            { /* List */}
            <Label className='d-flex flex-column ui-mode-card-wapper'>
              <Button icon type='tertiary'
                className={classNames('ui-mode-card', { active: (props.arrangement.style === ArrangementStyle.List) })}
                disableHoverEffect disableRipple
                onClick={() => { handleArrangementStyleChange(ArrangementStyle.List) }}
                title={listModeTips} aria-label={listModeTips}
                aria-labelledby={a11yUIMode0Id} aria-describedby={a11yDescriptionId}>
                <Icon width={92} height={56} icon={require('../assets/arrangements/style0.svg')} autoFlip />
              </Button>
              <div id={a11yUIMode0Id} className='mx-1 text-break ui-mode-label'>{listModeTips}</div>
            </Label>

            <div className='ui-mode-card-separator' />

            { /* Icon */}
            <Label className='d-flex flex-column ui-mode-card-wapper'>
              <Button icon type='tertiary'
                className={classNames('ui-mode-card', { active: (props.arrangement.style === ArrangementStyle.Icon) })}
                disableHoverEffect disableRipple
                onClick={() => { handleArrangementStyleChange(ArrangementStyle.Icon) }}
                title={iconModeTips} aria-label={iconModeTips}
                aria-labelledby={a11yUIMode1Id} aria-describedby={a11yDescriptionId}>
                <Icon width={92} height={56} icon={require('../assets/arrangements/style1.svg')} autoFlip />
              </Button>
              <div id={a11yUIMode1Id} className='mx-1 text-break ui-mode-label'>{iconModeTips}</div>
            </Label>
          </div>
        </SettingRow>

        { /* Direction */}
        {(props.arrangement.style === ArrangementStyle.Icon) &&
          <SettingRow label={translate('direction')}>
            <DirectionSelector
              aria-label={translate('direction')}
              vertical={props.arrangement.direction === ArrangementDirection.Vertical}
              onChange={handleArrangementDirectionChange}
            />
          </SettingRow>
        }
      </SettingSection>
    </React.Fragment>
  )
})
