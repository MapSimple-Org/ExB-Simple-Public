/** @jsx jsx */
import { React, jsx, css, useIntl, type IntlShape } from 'jimu-core'
import { type UiMode, type ItemsName, BackableList } from '../../config'
import { Button, FOCUSABLE_CONTAINER_CLASS, defaultMessages } from 'jimu-ui'
import { BackBtn } from './back-btn'

import { CloseOutlined } from 'jimu-icons/outlined/editor/close'

const { useCallback } = React

interface Props {
  intl: IntlShape

  uiMode: UiMode
  shownItem: ItemsName
  isPopupInController: boolean

  isShow: boolean
  popupTitle: string
  onBackBtnClick: () => void
  onPopupBtnClick: () => void
}

export const ContentHeader = React.memo((props: Props) => {
  const intl = useIntl()

  const headerStyle = css`
    &.content-header{
      margin-bottom: 1rem;

      .title{
        font-weight: bolder;
        font-size: 1rem;

        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }

      .jimu-icon{
        margin: 0;
      }
    }
  `

  const renderBackBtn = useCallback(() => {
    let content = null
    if (BackableList.includes(props.shownItem)) {
      content = <BackBtn uiMode={props.uiMode} onBackBtnClick={props.onBackBtnClick}></BackBtn>
    }
    return content
  }, [props.shownItem, props.uiMode, props.onBackBtnClick])

  // Renderer
  const backBtn = renderBackBtn()
  const closeTips = intl.formatMessage({ id: 'closeTour', defaultMessage: defaultMessages.closeTour })
  return (
    <React.Fragment>
      {(props.isShow) &&
        <div className={'d-flex content-header justify-content-between align-items-center w-100 ' + FOCUSABLE_CONTAINER_CLASS} css={headerStyle}>
          <div className='d-flex w-100'>
            { /* 1. backBtn */}
            {backBtn}
            { /* 2. title */}
            <div className='title d-flex' title={props.popupTitle} >{props.popupTitle}</div>
          </div>

          { /* 3. closeBtn */}
          {!props.isPopupInController &&
            <Button icon variant='text' color='inherit' className='close d-flex'
              title={closeTips}
              aria-label={closeTips}
              onClick={props.onPopupBtnClick}>
              <CloseOutlined size='m' />
            </Button>
          }
        </div>
      }
    </React.Fragment >
  )
})
