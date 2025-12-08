/** @jsx jsx */
import { React, jsx, classNames, hooks } from 'jimu-core'
import { Label, Button, Icon, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { PanelLayout } from '../../config'

export interface Props {
  widgetId: string
  layout?: PanelLayout
  onChange: (layout: PanelLayout) => void
}

export const LayoutsContainer = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const barModeTips = translate('bar')
  const paletteModeTips = translate('palette')

  const a11yDescriptionId = props.widgetId + '-ui-mode-description'
  const a11yUIMode0Id = props.widgetId + '-ui-mode-0'
  const a11yUIMode1Id = props.widgetId + '-ui-mode-1'
  return (
    <React.Fragment>
      { /* Arrangement */ }
      <SettingSection title={translate('controllerStyle')}>
        <SettingRow>
          <div className='ui-mode-card-chooser w-100' aria-label={translate('controllerStyle')} role="radiogroup">
            { /* Bar */ }
            <Label className='d-flex flex-column ui-mode-card-wrapper'>
              <Button icon className={classNames('ui-mode-card', { active: (props.layout === PanelLayout.Horizontal) })}
                disableHoverEffect={true} disableRipple={true}
                onClick={() => { props.onChange(PanelLayout.Horizontal) }}
                title={barModeTips}
                role="radio" aria-checked={(props.layout === PanelLayout.Horizontal)}
                aria-label={barModeTips} aria-labelledby={a11yUIMode0Id}
                aria-describedby={a11yDescriptionId}>
                <Icon width={92} height={56} icon={require('../assets/style0.svg')} autoFlip />
              </Button>
              <div id={a11yUIMode0Id} className='mx-1 text-break ui-mode-label'>{barModeTips}</div>
            </Label>

            <div className='ui-mode-card-separator' />

            { /* Palette */ }
            <Label className='d-flex flex-column ui-mode-card-wrapper ml-3'>
              <Button icon className={classNames('ui-mode-card', { active: (props.layout === PanelLayout.Palette) })}
                disableHoverEffect={true} disableRipple={true}
                onClick={() => { props.onChange(PanelLayout.Palette) }}
                title={paletteModeTips}
                role="radio" aria-checked={(props.layout === PanelLayout.Palette)}
                aria-label={paletteModeTips} aria-labelledby={a11yUIMode1Id}
                aria-describedby={a11yDescriptionId}>
                <Icon width={92} height={56} icon={require('../assets/style1.svg')} autoFlip />
              </Button>
              <div id={a11yUIMode1Id} className='mx-1 text-break ui-mode-label'>{paletteModeTips}</div>
            </Label>
          </div>
        </SettingRow>
      </SettingSection>
    </React.Fragment>
  )
})
