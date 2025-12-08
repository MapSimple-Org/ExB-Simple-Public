import { hooks } from 'jimu-core'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

import defaultMessages from '../translations/default'


export const LayerCoachMessage = (): React.ReactElement => {
  const isInBuilder = window.jimuConfig?.isInBuilder

  const translate = hooks.useTranslation(defaultMessages)

  return (
    <div className='w-100 h-100 d-flex flex-column align-items-center justify-content-center p-1'>
        <div><InfoOutlined width={24} height={24} /></div>
        <div className='mt-2 text-center'>{translate('noQualifiedLayerCoachMessage')}</div>
        {
            isInBuilder && <div className='mt-2 text-center'>{translate('openSettingPanelCoachMessage')}</div>
        }
    </div>
  )
}
