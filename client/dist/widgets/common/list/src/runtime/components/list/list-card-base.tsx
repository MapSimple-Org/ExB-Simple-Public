/** @jsx jsx */
import { React, css, AppMode } from 'jimu-core'
import { Status, SelectionModeType } from '../../../config'
import type { ListItemData } from '../../../config'

export interface ListCardProps extends ListItemData {
  listStyle: any
  itemIdex: number
  isScrolling: boolean
  className?: string
  toggleCardTool?: (hide?: boolean) => void
}

export interface ListCardStates {
  [key: string]: any
}

export default class ListCard<
  P extends ListCardProps = ListCardProps,
  S extends ListCardStates = ListCardStates
> extends React.Component<P, S> {
  shouldComponentUpdateExcept = (
    nextProps,
    nextStats,
    exceptPropKeys: string[],
    exceptStatKeys: string[] = []
  ) => {
    let shouldUpdate = false
    this.props &&
      Object.keys(this.props).some(key => {
        if (exceptPropKeys.includes(key)) return false
        if (this.props[key] !== nextProps[key]) {
          // console.log(`props has changed: ${key}`)
          shouldUpdate = true
          return true
        } else {
          return false
        }
      })
    this.state &&
      Object.keys(this.state).some(key => {
        if (exceptStatKeys.includes(key)) return false
        if (this.state[key] !== nextStats[key]) {
          // console.log(`states has changed: ${key}`)
          shouldUpdate = true
          return true
        } else {
          return false
        }
      })

    return shouldUpdate
  }

  formatMessage = (id: string, values?: { [key: string]: any }) => {
    return this.props.formatMessage(id, values)
  }

  checkIsBackgroundTransparent (status: Status): boolean {
    const { config } = this.props
    return config?.cardConfigs?.[status]?.backgroundStyle?.background?.color === 'rgba(0,0,0,0)'
  }

  getStyle = (status: Status) => {
    const { widgetId, config, appMode } = this.props
    const selectable = config.cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None
    const isBackgroundTransparent = this.checkIsBackgroundTransparent(status)
    return css`
      ${'&.list-card-' + widgetId} {
        padding: 0;
        border: 0;
        background-color: transparent;
        .list-card-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      }
      .list-card-content {
        background-color: var(--sys-color-surface-paper);
      }
      .flex-row-layout {
        width: 100%;
      }
      &.surface-1 {
        border: none !important;
        background: ${isBackgroundTransparent && 'none !important'};
      }
      .list-item-con {
        overflow: hidden;
      }
      ${'&.list-card-' + widgetId}:hover {
        ${(!window.jimuConfig.isInBuilder || appMode !== AppMode.Design) &&
        selectable
          ? 'cursor: pointer;'
          : ''}
      }
      .card-editor-mask {
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
      }
      .jimu-link {
        text-align: left;
      }
    `
  }
}
