import { React, hooks } from 'jimu-core'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

import defaultMessages from '../translations/default'

interface TipsProps {
  show?: boolean
}

const Tips = (props: TipsProps) => {
  const { show = false } = props

  if (!show) {
    return null
  }

  const isInBuilder = window.jimuConfig?.isInBuilder

  const translate = hooks.useTranslation(defaultMessages)

  return (
    <div className='w-100 h-100 d-flex flex-column align-items-center justify-content-center p-1'>
        <div><InfoOutlined width={24} height={24} /></div>
        <div className='mt-2 text-center'>{translate('noLayersTip')}</div>
        {
            isInBuilder && <div className='mt-2 text-center'>{translate('openSettingPanelTip')}</div>
        }
    </div>
  )
}

export default Tips
