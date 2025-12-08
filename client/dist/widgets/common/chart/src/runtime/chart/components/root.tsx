import { React, classNames } from 'jimu-core'
import { styled } from 'jimu-theme'
import { Loading, LoadingType } from 'jimu-ui'
import type { TemplateType } from '../../../config'
import { Placeholder } from './placeholder'

interface ChartRootProps {
  className?: string
  showLoading: boolean
  background: string
  tools: React.ReactNode
  children: React.ReactElement
  render?: boolean
  showPlaceholder?: boolean
  templateType: TemplateType
  messageType: 'basic' | 'tooltip'
  message?: string
}

const Root = styled('div')((props: { showTools: boolean, background: string }) => {
  return `
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background-color: ${props.background} !important;
      .chart-toolbar {
        width: 100%;
        height: ${props.showTools ? '38px' : '0px'};
      }
      .chart-container {
        z-index: 0;
        position: relative;
        width: 100%;
        height: ${props.showTools ? 'calc(100% - 38px)' : '100%'} !important;
        > .web-chart {
          height: 100%;
          width: 100%;
        }
      }
      .loader-container {
        position: absolute;
        width: 100%;
        top: ${props.showTools ? '38px' : '0px'};
        height: ${props.showTools ? 'calc(100% - 38px)' : '100%'} !important;
      }
    `
})

export const ChartRoot = (props: ChartRootProps) => {
  const {
    className,
    render,
    showPlaceholder,
    showLoading,
    background,
    tools,
    templateType,
    messageType,
    message,
    children
  } = props

  return (
    <Root showTools={!!tools} background={background} className={classNames('chart-root', className)}>
      {render && <>
        <div className='chart-toolbar'>{tools}</div>
        <div className='chart-container'>
          {children}
        </div>
      </>}
      {showPlaceholder && (
        <Placeholder
          templateType={templateType}
          message={message}
          messageType={messageType}
          showMessage={!!message}
        />
      )}
      {showLoading && <div className='loader-container'>
        <Loading type={LoadingType.Secondary} />
      </div>}
    </Root>
  )
}
