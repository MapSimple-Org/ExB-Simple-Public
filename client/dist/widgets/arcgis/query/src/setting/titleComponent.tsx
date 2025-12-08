/** @jsx jsx */
import { React, jsx, css, hooks } from 'jimu-core'
import { Label, Switch } from 'jimu-ui'
import defaultMessages from './translations/default'

interface Props {
  enabled: boolean
  label: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
}

export function TitleComponent (props: Props) {
  const { enabled, label, onChange } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)

  return (
    <Label className='d-flex align-items-center'>
      <div className='text-break text-wrap d-inline' css={css`width: 184px; padding-right: 16px`}>{getI18nMessage(label)}</div>
      <div className='ml-auto'>
        <Switch checked={enabled} onChange={onChange} />
      </div>
    </Label>
  )
}
