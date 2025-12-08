/** @jsx jsx */
import { React, jsx, hooks, css } from 'jimu-core'
import defaultMessages from '../translations/default'

export function AddLineEventFormHeader () {
  const getI18nMessage = hooks.useTranslation(defaultMessages)

  return (
    <div className="add-line=event-form-header">
      <div className="add-single-line-event-form__header pt-3 px-3 align-items-center">
        <div
          className="add-single-line-event_title d-flex align-items-center text-truncate"
          css={css`
            font-weight: 500;
            font-size: 14px;
          `}
        >
          <div className="text-truncate">{getI18nMessage('_widgetLabel')}</div>
        </div>
      </div>
    </div>
  )
}
