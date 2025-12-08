/** @jsx jsx */
import {
  React, css, hooks, jsx
} from 'jimu-core'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import { Button, defaultMessages as jimuiDefaultMessages } from 'jimu-ui'
import defaultMessages from '../translations/default'

interface Props {
  disableBack: boolean
  onBack: () => void
}

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  p {
    margin: 0.5rem 0;
  }
`

const ToolError = (props: Props) => {
  const { onBack, disableBack } = props
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessages)

  return <div css={style}>
    <WarningOutlined />
    <p>{translate('toolInaccessible')}</p>
    {!disableBack && <Button onClick={onBack}>{translate('back')}</Button>}
  </div>
}

export default ToolError
