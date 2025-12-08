/** @jsx jsx */
import {
  React,
  css,
  type IMThemeVariables,
  type AppMode,
  type BrowserSizeMode
} from 'jimu-core'
import { type IMConfig, Status, type CardLayout, type IMCardBackgroundStyle } from '../../config'
export interface CardProps {
  theme?: IMThemeVariables
  widgetId?: string
  cardStyle?: any
  layouts?: any
  browserSizeMode?: BrowserSizeMode
  formatMessage?: (id: string, values?: { [key: string]: any }) => string
  appMode?: AppMode
  cardConfigs?: IMConfig
  isHeightAuto: boolean
  isWidthAuto: boolean
  cardLayout?: CardLayout
}

export interface CardStates {
  [key: string]: any
}

export default class Card<
  P extends CardProps = CardProps,
  S extends CardStates = CardStates
> extends React.PureComponent<P, S> {
  formatMessage = (id: string, values?: { [key: string]: any }) => {
    return this.props.formatMessage(id, values)
  }

  checkIsBackgroundTransparent (status: Status): boolean {
    const { cardConfigs } = this.props
    const color = cardConfigs?.[status]?.backgroundStyle?.background?.color
    const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(\d*\.?\d+)\s*\)$/
    const match = color?.match(rgbaRegex)
    if (match) {
      const alpha = parseFloat(match[1])
      return alpha === 0
    } else {
      return color === 'rgba(0,0,0,0)'
    }
  }

  checkIsNotSetBackground (status: Status): boolean {
    const { cardConfigs } = this.props
    const cardBackgroundStyle = cardConfigs?.[status]?.backgroundStyle as IMCardBackgroundStyle
    const background = cardBackgroundStyle?.background
    return !background?.color && !background?.image?.url
  }

  getStyle = (status?: Status) => {
    const { widgetId } = this.props
    let isBackgroundTransparent: boolean
    if (status) {
      isBackgroundTransparent = this.checkIsBackgroundTransparent(status)
    }
    return css`
      & {
        overflow: hidden;
      }
      .card-link {
        cursor: pointer;
      }
      .card-content .animate-wrapper{
        height: 100%;
      }
      .hover-content {
        pointer-events: none;
      }
      &:hover {
        .hover-content {
          pointer-events: auto;
        }
        .card-surface {
          border: none !important;
          background-color: ${this.checkIsBackgroundTransparent(Status.Hover) && 'none !important'};
        }
      }
      .animation-list, .card-editor-con {
        overflow: hidden;
        background-color: ${isBackgroundTransparent && 'none !important'};
      }
      .card-editor-mask {
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
      }
      ${'&.card-' + widgetId} {
        padding: 0;
        border: 0;
        background-color: transparent;
        height: 100%;
        position: relative;
        .card-content {
          width: 100%;
          height: 100%;
          background-color: ${!isBackgroundTransparent && 'var(--sys-color-surface-paper)'};
          /* overflow: hidden; */
          & > div {
            width: 100%;
            height: 100%;
          }
        }
      }
      .edit-mask {
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 10;
      }
      .clear-background {
        background: transparent !important;
      }
      .card-link {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
      }
      .clear-background:focus {
        outline: none;
      }
      .card-viewer-con {
        border: none !important;
        background-color: ${isBackgroundTransparent && 'none !important'};
      }
      ${'&.card-' + widgetId}:hover {
      }
    `
  }
}
