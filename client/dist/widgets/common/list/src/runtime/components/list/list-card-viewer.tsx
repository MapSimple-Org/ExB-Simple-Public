/** @jsx jsx */
import { jsx, AppMode, React, type DataRecord, utils, classNames, type LayoutItemConstructorProps } from 'jimu-core'
import { ListGroupItem, styleUtils } from 'jimu-ui'
import { LayoutEntry as LayoutRuntimeEntry } from 'jimu-layouts/layout-runtime'
import { Status, ListLayout, SelectionModeType } from '../../../config'
import ListCard from './list-card-base'
import { initBackgroundStyle, isItemAccept } from '../../utils/utils'

export default class ListCardViewer extends ListCard {
  layoutRef: any
  clickCaptureTimeoutRef: any
  linkRef: React.RefObject<HTMLButtonElement>
  expressionRecords: { [key: string]: DataRecord }
  constructor (props) {
    super(props)

    this.layoutRef = React.createRef()
    this.linkRef = React.createRef<HTMLButtonElement>()
  }

  shouldComponentUpdate (nextProps, nextStats) {
    let shouldUpdate = this.shouldComponentUpdateExcept(nextProps, nextStats, [
      'listStyle'
    ])
    shouldUpdate =
      shouldUpdate ||
      !utils.isDeepEqual(this.props.listStyle, nextProps.listStyle)
    return shouldUpdate
  }

  handleItemChange = evt => {
    const { onChange, active, record } = this.props
    // if click sub widget event, don't un select
    if (active) {
      const isClickItemButtonOrA = this.checkIsClickItemButtonOrA(evt)
      if (!(isClickItemButtonOrA || evt.exbEventType === 'linkClick')) {
        onChange(record)
      }
    } else {
      onChange(record)
    }

    if (evt.exbEventType === 'linkClick') {
      delete evt.exbEventType
    }
  }

  //Currently, the triggering order of clicking an item is to trigger link.click first, and then trigger onClickCapture.
  //This results in link.click not being able to get the latest canClickLink, resulting in an error in the function of determining whether it can be clicked.
  //So we need to make sure canClickLink is updated before link.click fires
  //https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/23983
  handleContentClick = evt => {
    const { updateCanClickLinkWhenClickItem, active, record } = this.props
    // if click sub widget event, don't un select
    if (active) {
      const isClickItemButtonOrA = this.checkIsClickItemButtonOrA(evt)
      if (!(isClickItemButtonOrA || evt.exbEventType === 'linkClick')) {
        updateCanClickLinkWhenClickItem(record)
      }
    } else {
      updateCanClickLinkWhenClickItem(record)
    }
  }

  checkIsClickItemButtonOrA = evt => {
    const target = evt.target
    if (!target) return false
    const tagName = (evt.target && evt.target.tagName) || ''
    const isClickItemInButtonOrA = target.closest('button') || target.closest('a')
    return tagName.toLowerCase() === 'a' || tagName.toLowerCase() === 'button' || isClickItemInButtonOrA
  }

  handleItemKeyDown = evt => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      this.handleItemChange(evt)
    }
  }

  handleLinkClick = evt => {
    evt.stopPropagation()
  }

  isItemAccept = (item: LayoutItemConstructorProps, isPlaceholder: boolean): boolean => {
    const { isEditing, builderSupportModules, widgetId, appMode } = this.props
    const editing = appMode === AppMode.Express ? window.jimuConfig.isInBuilder : isEditing
    return isItemAccept(item, isPlaceholder, editing, widgetId, builderSupportModules)
  }

  onClickCapture = (evt) => {
    clearTimeout(this.clickCaptureTimeoutRef)
    //When clicking on a modal(such as Image viewer), the record should not be selected because the modal is not in the list item.
    //https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/8504#issuecomment-5400367
    if (evt.target && this.layoutRef.current.contains(evt.target)) {
      //https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/23186
      //The event capture is triggered before the link.onClick event, so the page refresh occurs when clicking the button link in the list item
      this.clickCaptureTimeoutRef = setTimeout(() => {
        this.handleItemChange(evt)
      })
    }
  }

  getLayoutAndCurrentStatus = () => {
    const { active, layouts, appMode, isHover, config } = this.props
    const { cardConfigs } = config
    const selectable = cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None
    const hoverLayoutOpen = cardConfigs[Status.Hover].enable
    let currentStatus: Status = Status.Default
    const isInBuilder = window.jimuConfig.isInBuilder
    let layout
    if (isInBuilder && appMode === AppMode.Design) {
      layout = layouts[Status.Default]
    } else {
      layout = layouts[Status.Default]
      if (hoverLayoutOpen && isHover) {
        currentStatus = Status.Hover
        layout = layouts?.[Status.Hover]
      }
      if (selectable && active) {
        currentStatus = Status.Selected
        layout = layouts?.[Status.Selected]
      }
    }
    return {
      currentStatus,
      layout
    }
  }

  getBackgroundStyle = () => {
    const { active, appMode, isHover, config, dynamicStyleOfCard, previewDynamicStyle, builderStatus, theme } = this.props
    const { cardConfigs } = config
    const selectable = cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None
    const hoverLayoutOpen = cardConfigs[Status.Hover].enable
    const isInBuilder = window.jimuConfig.isInBuilder
    let bgStyle
    if (previewDynamicStyle && builderStatus) {
      //Preview dynamic style
      bgStyle = initBackgroundStyle(cardConfigs[builderStatus].backgroundStyle, dynamicStyleOfCard?.[builderStatus], theme)
      return bgStyle
    }
    if (isInBuilder && appMode === AppMode.Design) {
      bgStyle = initBackgroundStyle(cardConfigs[Status.Default].backgroundStyle, dynamicStyleOfCard?.[Status.Default], theme)
    } else {
      bgStyle = initBackgroundStyle(cardConfigs[Status.Default].backgroundStyle, dynamicStyleOfCard?.[Status.Default], theme)

      if (hoverLayoutOpen && isHover) {
        bgStyle = initBackgroundStyle(cardConfigs[Status.Hover].backgroundStyle, dynamicStyleOfCard?.[Status.Hover], theme)
      }
      if (selectable && active) {
        bgStyle = initBackgroundStyle(cardConfigs[Status.Selected].backgroundStyle, dynamicStyleOfCard?.[Status.Selected], theme)
      }
    }
    return bgStyle
  }

  render () {
    const {
      active,
      widgetId,
      listStyle,
      layouts,
      appMode,
      itemIdex,
      LayoutEntry,
      config,
      className,
      handleListMouseLeave,
      handleListMouseMove
    } = this.props
    const { cardConfigs } = config
    const selectable = cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None
    const isInBuilder = window.jimuConfig.isInBuilder
    const useBuilderEntry = isInBuilder && appMode === AppMode.Express

    const { layout, currentStatus } = this.getLayoutAndCurrentStatus()
    const bgStyle = this.getBackgroundStyle()

    const currentLayoutType = cardConfigs[currentStatus]?.listLayout || ListLayout.CUSTOM
    const regularLayout = layouts[Status.Default]
    const showLayout = currentLayoutType === ListLayout.AUTO ? regularLayout : layout

    const mergedStyle: any = {
      ...styleUtils.toCSSStyle(bgStyle || ({} as any))
    }

    const cardContentStyle: any = {
      ...styleUtils.toCSSStyle({ borderRadius: bgStyle?.borderRadius })
    }

    return (<ListGroupItem
      active={selectable && active}
      css={this.getStyle(currentStatus)}
      style={{ ...listStyle, ...cardContentStyle }}
      tabIndex={0}
      onClickCapture={this.onClickCapture}
      onClick={this.handleContentClick}
      className={classNames('jimu-outline-inside', `list-card-${widgetId}`, className)}
      role='option'
      tag={'div'}
      onKeyDown={this.handleItemKeyDown}
      aria-describedby='describeByMessage'
      aria-selected={selectable && active}
    >
      <div
        className='list-card-content d-flex'
        onMouseLeave={handleListMouseLeave}
        onMouseMove={() => { handleListMouseMove(itemIdex) }}
        style={mergedStyle}>
        <div className='position-relative h-100 w-100'>
          <div className='d-flex w-100 h-100 list-item-con' ref={this.layoutRef}>
            {useBuilderEntry && <LayoutEntry
              isItemAccepted={this.isItemAccept}
              isRepeat
              layouts={showLayout}
              isInWidget
            />}
            {!useBuilderEntry && <LayoutRuntimeEntry layouts={showLayout} />}
          </div>
        </div>
      </div>
    </ListGroupItem>)
  }
}
