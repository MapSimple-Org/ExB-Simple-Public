/** @jsx jsx */
import { React, jsx, hooks, css } from 'jimu-core'
import { Alert, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import type { OutputDataSourceWarningOption } from '../../config'
import SettingRow from './setting-row'

interface Props {
  supportReport: boolean
  supportCustomReport: boolean
  outputDataSourceWarning: OutputDataSourceWarningOption
}

const STYLE = css`
  & .alert-panel {
    background: none !important;
    border: none !important;
    padding: 0 !important;
  }
`

const DsRemind = (props: Props) => {
  const nls = hooks.useTranslation(jimuUiDefaultMessage)
  const { supportReport, supportCustomReport, outputDataSourceWarning } = props

  const checkIsShowDsRemind = (): boolean => {
    const isSupportReport = supportReport || supportCustomReport
    return isSupportReport && !!outputDataSourceWarning?.label
  }

  return (
    <div css={STYLE}>
      {checkIsShowDsRemind() && <SettingRow>
        <Alert
          buttonType='tertiary'
          className='w-100'
          type='warning'
          withIcon
          text={nls('outputDataIsNotGenerated', { outputDsLabel: outputDataSourceWarning?.label, sourceWidgetName: outputDataSourceWarning?.widgets })}
        />
      </SettingRow>}
    </div>
  )
}

export default DsRemind
