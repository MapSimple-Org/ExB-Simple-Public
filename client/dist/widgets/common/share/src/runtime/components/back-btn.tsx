/** @jsx jsx */
import { React, jsx, css, useIntl } from 'jimu-core'
import { Button, defaultMessages } from 'jimu-ui'
import { UiMode } from '../../config'
import { stopPropagation } from './items/utils'

import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'

const { useCallback } = React
interface Props {
  uiMode: UiMode
  onBackBtnClick: () => void
}

export const BackBtn = React.memo((props: Props) => {
  const intl = useIntl()

  const onBackBtnClick = useCallback((evt: React.MouseEvent<HTMLElement>) => {
    props.onBackBtnClick()

    stopPropagation(evt as React.MouseEvent<HTMLDivElement>)
  }, [props])

  const style = css`
      .separator {
        width: 0.5rem;
      }
    `

  let content = null
  const backTips = intl.formatMessage({ id: 'back', defaultMessage: defaultMessages.back })
  if (props.uiMode === UiMode.Inline) {
    content = null
  } else {
    content = <div className='d-flex align-items-center' css={style}>
      <Button className='back-btn' color='inherit' size='sm' icon
        title={backTips}
        variant='text'
        aria-label={backTips}
        onClick={evt => { onBackBtnClick(evt) }} >
        <ArrowLeftOutlined size={'m'} autoFlip />
      </Button>
      <div className='separator'></div>
    </div>
  }

  return content
})
