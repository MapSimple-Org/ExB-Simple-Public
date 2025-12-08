import { React, css, classNames, hooks, focusElementInKeyboardMode } from 'jimu-core'
import { useDisplayButtonAmount } from './utils'
import { type IMAvatarCardConfig, ControllerAlignment } from '../../../config'
import { PopupMore } from './popup-more'
import { AvatarCard } from '../avatar-card'
import defaultMessages from '../../translations/default'
import MoreHorizontalOutlined from 'jimu-icons/svg/outlined/application/more-horizontal.svg'
import { useAdvancedStyle } from '../../widget'
import type { ListProps } from './index'

export interface PopupListProps extends ListProps {
  itemStyle: IMAvatarCardConfig
  advanced: boolean
  className?: string
}
const useStyle = (vertical: boolean, space: number, itemLength: number, alignment = ControllerAlignment.Center) => {
  return css`
    &.root {
      flex-direction: ${vertical ? 'column' : 'row'};
      width: 100%;
      height: 100%;
      ${vertical
        ? `min-height: ${itemLength}px;`
        : `min-width: ${itemLength}px;`
      }
      max-height: 100%;
      max-width: 100%;
      display: flex;
      justify-content: ${alignment === 'center' ? 'center' : 'flex-' + alignment};
      flex-wrap: nowrap;
      align-items: center;
      .popup-list-item {
        &:not(:first-of-type) {
          margin-top: ${vertical ? space + 'px' : 'unset'};
          margin-left: ${!vertical ? space + 'px' : 'unset'};
        }
      }
    }
  `
}

export const PopupList = React.forwardRef((props: PopupListProps, ref: React.Ref<HTMLDivElement>) => {
  const { vertical, alignment, space, itemStyle, lists = [], createItem, itemLength, autoSize, advanced, className, onMouseDown } = props

  const style = useStyle(vertical, space, itemLength, alignment)

  const [rootRef, handleRef] = hooks.useForwardRef(ref)

  const displayButtonAmount = useDisplayButtonAmount({ rootRef, lists, itemLength, autoSize, vertical, space })

  let visibleList = lists
  let moreList = []
  let hasMore = false
  if (displayButtonAmount < lists.length) {
    visibleList = lists.slice(0, displayButtonAmount - 1)
    moreList = lists.slice(displayButtonAmount - 1)
    hasMore = true
  }

  const [showMore, setShowMore] = React.useState(false)
  const moreButtonRef = React.useRef<HTMLDivElement>(null)

  const handleMoreToggle = React.useCallback((more?: boolean) => {
    setShowMore((showMore) => {
      const newShowMore = typeof more === 'boolean' ? more : !showMore
      if (!newShowMore) {
        focusElementInKeyboardMode(moreButtonRef.current)
      }
      return newShowMore
    })
  }, [])

  React.useEffect(() => {
    if (moreList.length === 0) {
      setShowMore(false)
    }
  }, [moreList.length])

  const translate = hooks.useTranslation(defaultMessages)

  const advancedStyle = useAdvancedStyle(itemStyle.variant, advanced)

  return <div className={classNames('root popup-list-root', className)} css={style} ref={handleRef} onMouseDown={onMouseDown}>
    {
      visibleList.map((item) => {
        return createItem(item, classNames('popup-list-item'))
      })
    }
    {hasMore &&
      <AvatarCard
        ref={moreButtonRef}
        className='popup-more-card popup-list-item'
        label={translate('moreWidgets')}
        icon={MoreHorizontalOutlined}
        showLabel={itemStyle.showLabel}
        showIndicator={itemStyle.showIndicator}
        showTooltip={itemStyle.showTooltip}
        labelGrowth={itemStyle.labelGrowth}
        avatar={itemStyle.avatar}
        active={showMore}
        onClick={() => { handleMoreToggle() }}
      />
    }
    <PopupMore
      lists={moreList}
      createItem={createItem}
      isOpen={showMore}
      itemLength={itemLength}
      reference={moreButtonRef.current}
      advancedStyle={advancedStyle}
      onClose={() => { handleMoreToggle(false) }}
      onMouseDown={onMouseDown}
    />
  </div>
})
