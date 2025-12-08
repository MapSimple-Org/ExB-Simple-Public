import { hooks } from 'jimu-core'
import { WidgetPlaceholder } from 'jimu-ui'

import ImageCollectionExplorerIcon from '../../../icon.svg'

import defaultMessages from '../translations/default'

export const Placeholder = (): React.ReactElement => {

  const translate = hooks.useTranslation(defaultMessages)

  return (
    <div className='w-100 h-100'>
      <WidgetPlaceholder
        icon={ImageCollectionExplorerIcon} name={translate('_widgetLabel')}
      />
    </div>
  )
}