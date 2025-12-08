/** @jsx jsx */
import { React, jsx, classNames, hooks } from 'jimu-core'
import { useTheme } from 'jimu-theme'
import { WidgetPlaceholder, Tooltip, defaultMessages as jimuUIMessages, type ShiftOptions } from 'jimu-ui'
import defaultMessages from '../../translations/default'
import { getStyle } from './style'

import WidgetIcon from '../../../../icon.svg'

export interface Props {
  widgetId: string
}

const shiftOptions: ShiftOptions = {
  crossAxis: true
}

export const PlaceHolder = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const theme = useTheme()
  const hint = translate('select3DMapHint')

  const isShowHintFlag = true
  return (
    <React.Fragment>
      <Tooltip
        disableHoverListener={isShowHintFlag}
        disableTouchListener={isShowHintFlag}
        disableFocusListener={isShowHintFlag}
        //placement={direction}
        shiftOptions={shiftOptions}
        showArrow
        title={<div className="p-2" style={{ background: 'var(--ref-palette-neutral-300)', border: '1px solid var(--ref-palette-neutral-700)' }}>{hint}</div>}
        arrowStyle={{
          background: 'var(--ref-palette-neutral-300)',
          border: {
            color: 'var(--ref-palette-neutral-700)',
            width: '1px'
          }
        }}
      >
        <div className={classNames('h-100', { 'hide-msg': !isShowHintFlag })} css={getStyle(theme)}>
          <WidgetPlaceholder
            widgetId={props.widgetId}
            icon={WidgetIcon}
            title={hint}
            name={translate('_widgetLabel')}
            direction='vertical'
            message={isShowHintFlag ? hint : null}
          />
        </div>
      </Tooltip>
    </React.Fragment>
  )
})
