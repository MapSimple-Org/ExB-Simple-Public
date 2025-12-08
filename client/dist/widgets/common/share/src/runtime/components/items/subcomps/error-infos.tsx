/** @jsx jsx */
import { React, jsx, useIntl } from 'jimu-core'
import { Tooltip } from 'jimu-ui'
import type { ErrorInfo } from '../../../../config'
import { getErrorInfoNls } from '../utils'

import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'

interface Props {
  errorInfo: ErrorInfo
  isShowTips: boolean
  size?: number
}

export const ErrorInfos = React.memo((props: Props) => {
  const intl = useIntl()

  const errorNls = getErrorInfoNls(props.errorInfo, intl)

  const content =
    <Tooltip title={errorNls} placement='auto-end'>
      <div className='d-flex align-items-center justify-content-center'>
        <WarningOutlined size={props.size ?? 16} color='var(--sys-color-warning-dark)' />
      </div>
    </Tooltip>

  return content
})
