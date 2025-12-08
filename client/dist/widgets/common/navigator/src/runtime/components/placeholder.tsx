import { React, hooks } from 'jimu-core'
import { WidgetPlaceholder, type WidgetPlaceholderProps } from 'jimu-ui'
import defaultMessages from '../translations/default'
const navigatorIcon = require('jimu-ui/lib/icons/navigator.svg')

interface PlaceholderProps extends Omit<WidgetPlaceholderProps, 'icon'> {
  show?: boolean
  message: string
}

export const Placeholder = (props: PlaceholderProps) => {
  const { show, message, ...others } = props

  const translate = hooks.useTranslation(defaultMessages)

  return show
    ? <WidgetPlaceholder
      {...others}
      className='px-4'
      icon={navigatorIcon}
      name={translate('_widgetLabel')}
      message={translate(message)} />
    : null
}
