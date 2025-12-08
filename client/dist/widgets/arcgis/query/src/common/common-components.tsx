/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import { Button, Modal, ModalBody, ModalFooter, PanelHeader, type ThemeProps } from 'jimu-ui'
import { withTheme } from 'jimu-theme'
const { useState } = React

/**
 * A simple Functional Component storing some States that are commonly used
 */
export const StateHolder = (props) => {
  const { initState = {}, children } = props
  const defaultStateMap = {
    visible: true,
    refContainer: null
  }
  const useStateMap = {
    visible: useState('visible' in initState ? initState.visible : defaultStateMap.visible),
    refContainer: useState('refContainer' in initState ? initState.refContainer : defaultStateMap.refContainer),
    customData: useState({ ...initState.customData })
  }
  return <React.Fragment>{children(useStateMap)}</React.Fragment>
}

export interface DialogPanelProps {
  panelVisible: boolean
  setPanelVisible: (visible: boolean) => void
  getI18nMessage: (id: string) => any
  isModal?: boolean
  title?: any
  bodyContent?: any
  hasHeader?: boolean
  hasFooter?: boolean
}

/**
 * A dialog popup
 */
export const DialogPanel = withTheme((props: DialogPanelProps & ThemeProps) => {
  const { theme, panelVisible, setPanelVisible, getI18nMessage, isModal = true, title = getI18nMessage('queryMessage'), bodyContent = '', hasHeader = true, hasFooter = true } = props
  const toggle = () => { setPanelVisible(false) }
  const getContent = () => <React.Fragment>
    {
      hasHeader &&
        <PanelHeader className='py-2' title={title} onClose={toggle} />
    }
    <ModalBody>{bodyContent}</ModalBody>
    {
      hasFooter &&
        <ModalFooter>
          <Button onClick={toggle}>{getI18nMessage('ok')}</Button>
        </ModalFooter>
    }
  </React.Fragment>
  const generalClassName = 'ui-unit-dialog-panel'
  const renderModalContent = () => {
    return (
      <Modal className={generalClassName} isOpen={panelVisible} toggle={toggle} backdrop='static'>
        {getContent()}
      </Modal>
    )
  }
  const renderNonModalContent = () => {
    const getStyle = () => css`
      &.ui-unit-dialog-panel.modal-dialog {
        margin: 0;
        width: 100%;
        .modal-content {
          background-color: ${theme.ref.palette.neutral[600]};
          color: ${theme.ref.palette.black};
          font-size: .75rem;
          font-weight: 400;
          border: none;
          .panel-header {
            font-size: .8125rem;
            padding: .625rem;
          }
          .modal-body {
            padding: 0 .625rem .75rem;
            white-space: normal;
          }
        }
      }
    `
    return (
      <div className={`${generalClassName} modal-dialog ${panelVisible ? '' : 'collapse'}`} css={getStyle()}>
        <div className='modal-content'>
          {getContent()}
        </div>
      </div>
    )
  }
  return isModal ? renderModalContent() : renderNonModalContent()
})

export enum EntityStatusType {
  None = '',
  Init = 'init',
  Loading = 'loading',
  Loaded = 'loaded',
  Warning = 'warning',
  Error = 'error',
}

export interface StatusIndicatorProps {
  className?: string
  statusType?: EntityStatusType
  title?: string
}

/**
 * An animatable icon representing status
 */
export const StatusIndicator = withTheme((props: StatusIndicatorProps & ThemeProps) => {
  const { theme, className, title, statusType } = props
  const getStyle = () => css`
    &.ui-unit-status-indicator {
      display: flex;
      &.ui-unit-status-indicator_status-type-loading {
        &:before {
          @keyframes loading {
            0% {transform: rotate(0deg); };
            100% {transform: rotate(360deg)};
          }
          content: '';
          width: 1rem;
          height: 1rem;
          display: block;
          border: 1px solid ${theme?.ref.palette?.neutral?.[500]};
          border-radius: 50%;
          border-top: 1px solid ${theme?.sys.color?.primary?.main};
          box-sizing: border-box;
          animation: loading 2s infinite linear;
          margin-right: .25rem;
        }
      }
    }
  `
  return (
    statusType &&
      <div className={`${className ?? ''} ui-unit-status-indicator ui-unit-status-indicator_status-type-${statusType}`} title={title} css={getStyle()} />
  )
})
