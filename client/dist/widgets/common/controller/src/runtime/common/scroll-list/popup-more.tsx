import { React, css, classNames, hooks, type SerializedStyles } from 'jimu-core'
import { Button, Modal, ModalBody, Pagination, Popper } from 'jimu-ui'
import { FlipVariationsOptions, OffsetYOptions, ShiftBodyOptions } from '../../../common/consts'

export interface PopupMoreProps {
  lists: string[]
  createItem: (item: string, className: string, onClick?: () => void) => React.ReactElement
  itemLength: number
  isOpen: boolean
  reference: HTMLDivElement
  advancedStyle: SerializedStyles
  onClose: () => void
  onMouseDown?: (evt: React.MouseEvent<HTMLElement>) => void
}

const MOBILE_COLS = 4
const DESKTOP_COLS = 5
const ROWS = 3

const getStyle = (itemLength: number, pageCount: number, mobile: boolean) => {
  const cols = mobile ? MOBILE_COLS : DESKTOP_COLS
  const rows = ROWS
  const mobileCenter = mobile
    ? css`top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important;`
    : ''
  return css`
    ${mobileCenter}
    &.modal-dialog {
      width: fit-content;
      margin: 0;
      .modal-content {
        .modal-body {
          padding: 0;
        }
      }
    }
    .popup-more {
      padding: var(--sys-spacing-3);
      display: flex;
      position: relative;
      overflow: hidden;
      .popup-page {
        display: grid;
        max-width: ${itemLength * cols}px;
        grid-template-columns: repeat(${pageCount > 1 || mobile ? cols : 'auto-fit'}, ${itemLength}px);
        grid-template-rows: repeat(${pageCount > 1 || mobile ? rows : 'auto-fit'}, 1fr);
        gap: var(--sys-spacing-2) 0;
        justify-content: center;
      }
    }
    .popup-pagination {
      padding: 0 var(--sys-spacing-3) var(--sys-spacing-2) var(--sys-spacing-3);
      text-align: center;
      .jimu-pagination {
        justify-content: center;
        .jimu-page-number {
          display: none;
        }
      }
      .page-indicator {
        width: 6px;
        height: 6px;
        padding: 0;
        border-radius: 3px;
        border: none;
        background-color: var(--sys-color-action-disabled);
        transition: width ease 0.3s;
        &+.page-indicator {
          margin-left: 8px;
        }
        &.page-current {
          background-color: var(--sys-color-action-selected);
        }
      }
    }
  `
}

const getPageStyle = (page: number, curPage: number, itemLength: number) => {
  return css`
    position: ${page === curPage ? 'relative' : 'absolute'};
    left: ${(page - curPage) * (itemLength * 6 + 40)}px;
    transition: all ease 0.3s;
  `
}

export const PopupMore = (props: PopupMoreProps) => {
  const { lists = [], createItem, itemLength, isOpen, reference, advancedStyle, onClose, onMouseDown } = props

  const mobile = hooks.useCheckSmallBrowserSizeMode()

  const cols = mobile ? MOBILE_COLS : DESKTOP_COLS
  const rows = ROWS
  const pageSize = cols * rows

  const [curPage, setCurPage] = React.useState(1)
  const totalPage = Math.ceil(lists.length / pageSize)
  const pages = new Array(totalPage).fill(1).map((v, i) => i + 1)
  const handleClickPage = (page: number) => {
    setCurPage(page)
  }
  const curPageRef = hooks.useLatest(curPage)
  React.useEffect(() => {
    if (curPageRef.current > totalPage && totalPage !== 0) {
      setCurPage(totalPage)
    }
  }, [curPageRef, totalPage])

  const style = getStyle(itemLength, pages.length, mobile)

  const touchStartXRef = React.useRef(0)
  const touchMoveXRef = React.useRef(0)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return
    touchStartXRef.current = e.touches[0].clientX
  }
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return
    touchMoveXRef.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const moveX = touchMoveXRef.current - touchStartXRef.current
    if (moveX < -100) {
      setCurPage(old => old < totalPage ? old + 1 : old)
    }
    if (moveX > 100) {
      setCurPage(old => old > 1 ? old - 1 : old)
    }
    touchStartXRef.current = 0
    touchMoveXRef.current = 0
  }

  const content = <React.Fragment>
    <div
      className='popup-more'
      css={advancedStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={onMouseDown}
    >
      {pages.map((page) => {
        const pageList = lists.slice(pageSize * (page - 1), pageSize * page)
        return <div key={page} className='popup-page' css={getPageStyle(page, curPage, itemLength)} onFocus={() => { setCurPage(page) }}>
          {pageList.map((item) => {
            return createItem(item, 'popup-list-item', onClose)
          })}
        </div>
      })}
    </div>
    {pages.length > 1 && <div className='popup-pagination'>
      {mobile && pages.map((page) =>
        <Button
          key={page}
          tabIndex={-1}
          aria-hidden
          className={classNames('page-indicator', { 'page-current': curPage === page })}
          onClick={() => { handleClickPage(page) }}
        />
      )}
      {!mobile && <Pagination
        variant='text'
        current={curPage}
        simple
        size='sm'
        totalPage={pages.length}
        onChangePage={handleClickPage}
      />}
    </div>}
  </React.Fragment>

  if (mobile) {
    return <Modal className='popup-more-modal' css={style} isOpen={isOpen} toggle={onClose}>
      <ModalBody>
        {content}
      </ModalBody>
    </Modal>
  } else {
    return <Popper
      className='popup-more-popper'
      overflowHidden
      css={style}
      open={isOpen}
      reference={reference}
      autoFocus
      trapFocus
      flipOptions={FlipVariationsOptions}
      shiftOptions={ShiftBodyOptions}
      offsetOptions={OffsetYOptions}
      toggle={onClose}
    >
      {content}
    </Popper>
  }
}
