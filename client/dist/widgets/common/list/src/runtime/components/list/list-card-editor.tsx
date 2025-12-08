/** @jsx jsx */
import {
  React,
  jsx,
  css,
  type IMThemeVariables,
  AppMode,
  type LayoutInfo,
  utils,
  type LayoutItemConstructorProps,
  ReactRedux,
  type IMState,
  classNames
} from 'jimu-core'
import { ListGroupItem, styleUtils } from 'jimu-ui'
import {
  Status,
  SelectionModeType,
  LIST_CARD_MIN_SIZE,
  ListLayout,
  ListLayoutType
} from '../../../config'
import ListCard, { type ListCardProps, type ListCardStates } from './list-card-base'
import { initBackgroundStyle, isItemAccept } from '../../utils/utils'
import CardEditorTools from './card-editor-tools'

const cornerSize = 12
const cornerPosition = -10
const sideSize = 16
const sidePosition = -10
const zIndexHandle = 20

export interface ExtraProps {
  selection: LayoutInfo
}

export interface ListCardEditorStates extends ListCardStates {
  didMount: boolean
  showLayoutEntry: boolean
}

class _ListCardEditor extends ListCard<
ListCardProps & ExtraProps,
ListCardEditorStates
> {
  interactable: Interact.Interactable
  resizeRef: React.RefObject<HTMLDivElement>
  lastResizeCall = null

  constructor (props) {
    super(props)

    this.state = {
      didMount: false,
      showLayoutEntry: true
    }
    this.resizeRef = React.createRef()
  }

  shouldComponentUpdate (nextProps, nextStats) {
    let shouldUpdate = this.shouldComponentUpdateExcept(nextProps, nextStats, [
      'listStyle',
      'selection'
    ])
    shouldUpdate =
      shouldUpdate ||
      !utils.isDeepEqual(this.props.listStyle, nextProps.listStyle)
    if (!shouldUpdate) {
      const { selectionIsInList, selectionIsList } = this.props
      if (selectionIsList || selectionIsInList) {
        shouldUpdate = !utils.isDeepEqual(
          this.props.selection,
          nextProps.selection
        )
      }
    }
    return shouldUpdate
  }

  componentDidUpdate (preProps) {
    const {
      selectionIsInList,
      isEditing,
      config,
      isRTL,
      itemIdex
    } = this.props
    const {layoutType, keepAspectRatio, lockItemRatio} = config
    if (window.jimuConfig.isInBuilder && itemIdex === 0) {
      if (this.interactable) {
        if (isEditing && !selectionIsInList) {
          if (layoutType === ListLayoutType.GRID) {
            this.interactable.resizable({
              edges: {
                top: false,
                left: isRTL,
                bottom: !keepAspectRatio,
                right: !isRTL
              }
            })
            this.interactable.resizable(true)
          } else {
            if (!lockItemRatio) {
              this.interactable.resizable({
                edges: {
                  top: false,
                  left: layoutType === ListLayoutType.Column && isRTL,
                  bottom: layoutType === ListLayoutType.Row,
                  right: layoutType === ListLayoutType.Column && !isRTL
                }
              })
              this.interactable.resizable(true)
            } else {
              this.interactable.resizable(false)
            }
          }
        } else {
          this.interactable.resizable(false)
        }
      }
    }
    this.updateLayoutEntryWhenLayoutIdChange(preProps)
  }

  componentDidMount () {
    const { itemIdex, toggleCardTool, config } = this.props
    const {layoutType, keepAspectRatio, lockItemRatio } = config
    if (
      itemIdex === 0 &&
      window.jimuConfig.isInBuilder &&
      this.resizeRef.current
    ) {
      const { interact, handleResizeCard, isRTL } = this.props
      this.interactable = interact(this.resizeRef.current).resizable({
        // resize from all edges and corners
        edges: {
          top: false,
          left: (layoutType === ListLayoutType.Column || layoutType === ListLayoutType.GRID) && isRTL,
          bottom: ((layoutType === ListLayoutType.Row && !lockItemRatio) || (layoutType === ListLayoutType.GRID && !keepAspectRatio)),
          right: ((layoutType === ListLayoutType.Column && !lockItemRatio) || layoutType === ListLayoutType.GRID) && !isRTL
        },
        modifiers: [
          // keep the edges inside the parent
          interact.modifiers.restrictEdges({
            endOnly: true
          }),

          // minimum size
          interact.modifiers.restrictSize({
            min: { width: LIST_CARD_MIN_SIZE, height: LIST_CARD_MIN_SIZE }
          })
        ],
        inertia: false,
        onstart: (event: Interact.InteractEvent) => {
          const { changeIsResizingCard } = this.props
          if (changeIsResizingCard) {
            changeIsResizingCard(true)
          }
          event.stopPropagation()
        },
        onmove: (event: Interact.ResizeEvent) => {
          event.stopPropagation()

          if (this.lastResizeCall) {
            cancelAnimationFrame(this.lastResizeCall)
          }
          const rect = event.rect
          const newCardSize = this.getNewCardSize(rect, true)
          toggleCardTool(true)
          this.lastResizeCall = requestAnimationFrame(() => {
            const edges = {} as any // event.interaction.edges;
            handleResizeCard(newCardSize, false, edges.top, edges.left)
          })
        },
        onend: (event: Interact.ResizeEvent) => {
          event.stopPropagation()
          if (this.lastResizeCall) {
            cancelAnimationFrame(this.lastResizeCall)
          }
          this.lastResizeCall = requestAnimationFrame(() => {
            const rect = event.rect
            const newCardSize = this.getNewCardSize(rect)
            handleResizeCard(newCardSize, true)
            const { changeIsResizingCard } = this.props
            toggleCardTool(false)
            if (changeIsResizingCard) {
              changeIsResizingCard(false)
            }
          })
        }
      })
    }
    this.setState({
      didMount: true
    })
  }
  /**
   * In the LayoutEntry component,
   * ‘this.layoutComponent = findLayoutBuilder(this.props.layout.type || LayoutType.FlowLayout)’ this assignment is performed in the constructor,
   * so when the layout type changes, the LayoutEntry needs to be reconstructed.
   * https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/28967
  */
  updateLayoutEntryWhenLayoutIdChange = (preProps) => {
    const layoutIdForListItem = this.getLayoutIdForListItem(this.props)
    const preLayoutIdForListItem = this.getLayoutIdForListItem(preProps)
    if (layoutIdForListItem !== preLayoutIdForListItem) {

      this.setState({showLayoutEntry: false}, () => {
        this.setState({showLayoutEntry: true})
      })
    }
  }

  getNewCardSize = (rect, isResizing: boolean = false) => {
    const { config, isWidthPercentage } = this.props
    const {layoutType, horizontalSpace, gridItemSizeRatio, keepAspectRatio} = config
    let newCardSize
    let width = rect.right - rect.left
    if (!isResizing && isWidthPercentage) {
      width = rect.right - rect.left + horizontalSpace
    }
    if (layoutType === ListLayoutType.GRID && keepAspectRatio) {
      newCardSize = {
        width: width,
        height: width * gridItemSizeRatio
      }
    } else {
      newCardSize = {
        width: width,
        height: rect.bottom - rect.top
      }
    }
    return newCardSize
  }

  componentWillUnMount () {
    if (this.lastResizeCall) {
      cancelAnimationFrame(this.lastResizeCall)
    }
    if (this.interactable) {
      this.interactable.unset()
      this.interactable = null
    }
  }

  handleItemClick = evt => {
    const { selectCard } = this.props
    if (evt) {
      evt.stopPropagation()
    }
    selectCard()
  }

  _renderAction = () => {
    const handlers = []
    const { theme, config } = this.props
    const { layoutType, keepAspectRatio } = config
    const sideHandle = css`
      box-shadow: none;

      &:after {
        position: absolute;
        content: '';
        width: ${cornerSize}px;
        height: ${cornerSize}px;
        background-color: ${theme.sys.color.primary.main};
        border: 2px solid ${theme.sys.color.surface.paper};
        border-radius: 50%;
        z-index: ${zIndexHandle};
      }
    `

    const bottomSideLine = css`
      box-shadow: none;
      height: ${sideSize}px;
      left: 0px;
      right: 0px;
      bottom: ${-1 * (sideSize / 2)}px;
      &:after {
        position: absolute;
        content: '';
        bottom: 50%;
        left: 0;
        right: 0;
        height: 2px;
        background-color: ${theme.sys.color.primary.light};
        z-index: ${zIndexHandle};
      }
    `

    const rightSideLine = css`
      box-shadow: none;
      width: ${sideSize}px;
      top: 0px;
      bottom: 0px;
      right: ${-1 * (sideSize / 2)}px;
      &:after {
        position: absolute;
        content: '';
        right: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: ${theme.sys.color.primary.light};
        z-index: ${zIndexHandle};
      }
    `

    const handle = css`
      position: absolute;
    `

    const rightSideCursor = css`
      width: ${sideSize}px;
      top: ${-1 * sidePosition}px;
      bottom: ${-1 * sidePosition}px;
      right: ${-1 * (sideSize / 2)}px;

      &:after {
        top: 50%;
        right: 50%;
        margin-top: ${cornerPosition / 2}px;
        margin-right: ${cornerPosition / 2}px;
      }
    `
    const bottomSideCursor = css`
      height: ${sideSize}px;
      left: ${-1 * sidePosition}px;
      right: ${-1 * sidePosition}px;
      bottom: ${-1 * (sideSize / 2)}px;

      &:after {
        left: 50%;
        bottom: 50%;
        margin-left: ${cornerPosition / 2}px;
        margin-bottom: ${cornerPosition / 2}px;
      }
    `
    switch (layoutType) {
      case ListLayoutType.Column:
        handlers.push(
          <span
            key='10'
            className='list-card-rnd-resize-left-line'
            css={[handle, rightSideLine]}
          />
        )
        handlers.push(
          <span
            key='4'
            className='list-card-rnd-resize-right'
            css={[handle, sideHandle, rightSideCursor]}
          />
        )
        break
      case ListLayoutType.Row:
        handlers.push(
          <span
            key='9'
            className='list-card-rnd-resize-bottom-line'
            css={[handle, bottomSideLine]}
          />
        )
        handlers.push(
          <span
            key='6'
            className='list-card-rnd-resize-bottom'
            css={[handle, sideHandle, bottomSideCursor]}
          />
        )
        break
      case ListLayoutType.GRID:
        handlers.push(
          <span
            key='10'
            className='list-card-rnd-resize-left-line'
            css={[handle, rightSideLine]}
          />
        )
        handlers.push(
          <span
            key='4'
            className='list-card-rnd-resize-right'
            css={[handle, sideHandle, rightSideCursor]}
          />
        )
        if (!keepAspectRatio) {
          handlers.push(
            <span
              key='9'
              className='list-card-rnd-resize-bottom-line'
              css={[handle, bottomSideLine]}
            />
          )
          handlers.push(
            <span
              key='6'
              className='list-card-rnd-resize-bottom'
              css={[handle, sideHandle, bottomSideCursor]}
            />
          )
        }
        break
    }
    return handlers
  }

  getCardToolsStyle = (theme: IMThemeVariables) => {
    return css`
      width: 100%;
      .btn {
        width: 100%;
      }
      .dropdown-toggle {
        justify-content: center;
      }
    `
  }

  renderCardTools = () => {
    const { itemIdex } = this.props
    const isInBuilder = window.jimuConfig.isInBuilder
    if (!isInBuilder || itemIdex > 0) return
    const {
      builderSupportModules,
      datasourceId,
      selectionIsInList,
      selectionIsList,
      hideCardTool,
      selection,
      widgetId,
      config,
      isEditing,
      builderStatus,
      layouts,
      selectCard
    } = this.props

    const cardConfigs = config?.cardConfigs
    return (isEditing && (cardConfigs[Status.Hover].enable || cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None) && (
      <CardEditorTools
        builderSupportModules={builderSupportModules}
        widgetId={widgetId}
        selection={selection}
        config={config}
        selectionIsInList={selectionIsInList}
        selectionIsList={selectionIsList}
        hideCardTool={hideCardTool}
        datasourceId={datasourceId}
        reference={this.resizeRef.current}
        itemIdex={itemIdex}
        builderStatus={builderStatus}
        layouts={layouts}
        selectCard={selectCard}
      />)
    )
  }

  isItemAccept = (item: LayoutItemConstructorProps, isPlaceholder: boolean): boolean => {
    const { isEditing, builderSupportModules, widgetId: id } = this.props
    return isItemAccept(item, isPlaceholder, isEditing, id, builderSupportModules)
  }

  getEditorStyle = () => {
    return css`
      &.list-card-content {
        .fixed-layout {
          border: 0 !important;
        }
      }
    `
  }

  getLayoutIdForListItem = (props: ListCardProps & ExtraProps) => {
    const { config, builderStatus, layouts } = props
    const { cardConfigs } = config
    const regularLayout = layouts[Status.Default]
    const layout = layouts[builderStatus]
    const listLayout = cardConfigs[builderStatus]?.listLayout || ListLayout.CUSTOM
    return listLayout === ListLayout.AUTO ? regularLayout : layout
  }

  render () {
    const {
      active,
      LayoutEntry,
      selectionIsInList,
      isEditing,
      widgetId: id,
      listStyle,
      builderStatus,
      config,
      dynamicStyleOfCard,
      theme,
      className
    } = this.props
    const {cardConfigs, layoutType, lockItemRatio} = config
    const selectable = config.cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None
    const { didMount, showLayoutEntry } = this.state
    const listLayout = cardConfigs[builderStatus]?.listLayout || ListLayout.CUSTOM
    const layoutIdForListItem = this.getLayoutIdForListItem(this.props)
    const bgStyle = initBackgroundStyle(cardConfigs[builderStatus].backgroundStyle, dynamicStyleOfCard?.[builderStatus], theme)
    const isShowMask = listLayout === ListLayout.AUTO && builderStatus !== Status.Default
    const mergedStyle: any = {
      ...styleUtils.toCSSStyle(bgStyle || ({} as any))
    }
    const cardContentStyle: any = {
      ...styleUtils.toCSSStyle({ borderRadius: bgStyle?.asMutable({ deep: true })?.borderRadius })
    }

    const isLockItemRatio = layoutType !== ListLayoutType.GRID && lockItemRatio
    return (
      <ListGroupItem
        active={selectable && active}
        css={this.getStyle(builderStatus)}
        style={{ ...cardContentStyle, ...listStyle }}
        className={classNames(`list-card-${id}`, className)}
        onClick={this.handleItemClick}
        role='listCardEditor'
      >
        {isShowMask && <div className='card-editor-mask position-absolute'></div>}
        {didMount && this.renderCardTools()}
        <div
          className='list-card-content d-flex'
          style={mergedStyle}
          css={this.getEditorStyle()}
          ref={this.resizeRef}
        >
          {showLayoutEntry && <LayoutEntry
            isItemAccepted={this.isItemAccept}
            isRepeat
            layouts={layoutIdForListItem}
            isInWidget
          />}
          {isEditing &&
            !selectionIsInList &&
            !isLockItemRatio &&
            this._renderAction()}
        </div>
      </ListGroupItem>
    )
  }
}

export default ReactRedux.connect<ExtraProps, unknown, ListCardProps>(
  (state: IMState, props: ListCardProps) => {
    const { appMode } = props
    if (!window.jimuConfig.isInBuilder || appMode === AppMode.Run) {
      return {
        selection: undefined
      }
    }
    const selection =
      props.itemIdex === 0 &&
      props.selectionIsInList &&
      state &&
      state.appRuntimeInfo &&
      state.appRuntimeInfo.selection
    return {
      selection
    }
  }
)(_ListCardEditor)
