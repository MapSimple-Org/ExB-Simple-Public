/** @jsx jsx */
import {
  React,
  jsx,
  hooks,
  css
} from 'jimu-core'
import defaultMessages from '../translations/default'

export function AddPointEventFormHeader () {
  const getI18nMessage = hooks.useTranslation(defaultMessages)

  return (
    <div className='add-point-event-form-header'>
        <div className='add-single-point-event-form-header__header pt-3 px-3 align-items-center'>
            <div className='add-single-point-event_title d-flex align-items-center text-truncate' css={css`font-weight: 500; font-size: 14px;`}>
                <div className='text-truncate'>
                  {getI18nMessage('_widgetLabel')}
                </div>
            </div>
        </div>
    </div>
  )
}
