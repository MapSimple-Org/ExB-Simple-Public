import { React, hooks } from 'jimu-core'
import { WidgetPlaceholder } from 'jimu-ui'

import ImageryDisplayOrderIcon from '../../../icon.svg'

import defaultMessages from '../translations/default'

interface PlaceholderProps {
  widgetId: string
  show?: boolean
}

const Placeholder = (props: PlaceholderProps) => {
  const { widgetId, show = false } = props

  if (!show) {
    return null
  }

  const translate = hooks.useTranslation(defaultMessages)

  return (
    <div className='w-100 h-100'>
      <WidgetPlaceholder
        icon={ImageryDisplayOrderIcon} widgetId={widgetId} name={translate('_widgetLabel')}
      />
    </div>
  )
}

export default Placeholder
