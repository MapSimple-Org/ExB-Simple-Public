import { React, css, classNames, hooks, getAppStore, appActions, ExtensionManager } from 'jimu-core'
import { NavButtonGroup, defaultMessages } from 'jimu-ui'
import { useResponsiveViewport } from './utils'
import { ControllerAlignment } from '../../../config'
import { useIsSelected } from '../layout-utils'
import type Next from '../../../tools/next'
import type Previous from '../../../tools/previous'

export interface ListProps {
  vertical?: boolean
  space?: number
  alignment: ControllerAlignment
  lists: string[]
  itemLength: number
  autoSize?: boolean
  createItem: (item: string, className: string, onClick?: (e: React.MouseEvent<HTMLElement>) => void, disableDrag?: boolean) => React.ReactElement
  onMouseDown?: (evt: React.MouseEvent<HTMLElement>) => void
}

export interface ScrollListProps extends ListProps {
  controllerId: string
  autoScrollEnd?: boolean
  className?: string
}

interface styleOptions {
  vertical: boolean
  space: number
  itemLength: number
  autoSize: boolean
  hideArrow: boolean
  alignment: ControllerAlignment
  remainLength: number
}
const useStyle = ({ vertical, space, itemLength, autoSize, hideArrow, alignment, remainLength }: styleOptions) => {
  return css`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    button.previous, button.next {
      flex-shrink: 0;
      display: ${!hideArrow ? 'block' : 'none'};
      &:hover {
        color: var(--sys-color-primary-light);
      }
    }
    ${alignment === ControllerAlignment.Start && !autoSize && !vertical ? `button.next { transform: translateX(${-remainLength}px); }` : ''}
    ${alignment === ControllerAlignment.Start && !autoSize && vertical ? `button.next { transform: translateY(${-remainLength}px); }` : ''}
    ${alignment === ControllerAlignment.End && !autoSize && !vertical ? `button.previous { transform: translateX(${remainLength}px); }` : ''}
    ${alignment === ControllerAlignment.End && !autoSize && vertical ? `button.previous { transform: translateY(${remainLength}px); }` : ''}
    .root {
      flex-direction: ${vertical ? 'column' : 'row'};
      width: 100%;
      height: 100%;
      ${vertical
        ? `min-height: ${itemLength}px;`
        : `min-width: ${itemLength}px;`
      }
      max-height: ${!autoSize ? 'calc(100% - 20px)' : '100%'};
      max-width: ${!autoSize ? 'calc(100% - 20px)' : '100%'};
      display: flex;
      justify-content: ${
        alignment === ControllerAlignment.Start
        ? 'flex-start'
        : alignment === ControllerAlignment.End
        ? 'flex-end'
        : 'center'
      };
      flex-wrap: nowrap;
      align-items: center;
      .scroll-list-item {
        &:not(:first-of-type) {
          margin-top: ${vertical ? space + 'px' : 'unset'};
          margin-left: ${!vertical ? space + 'px' : 'unset'};
        }
      }
    }
`
}

const DefaultList = []
export const ScrollList = React.forwardRef((props: ScrollListProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    controllerId,
    className,
    lists = DefaultList,
    createItem,
    vertical,
    itemLength,
    space,
    alignment = ControllerAlignment.Center,
    autoScrollEnd,
    autoSize,
    onMouseDown
  } = props

  const translate = hooks.useTranslation(defaultMessages)

  const [rootRef, handleRef] = hooks.useForwardRef(ref)

  const {
    start,
    end,
    disablePrevious,
    disableNext,
    hideArrow,
    scroll,
    remainLength
  } = useResponsiveViewport({ rootRef, lists, itemLength, autoSize, vertical, space, autoScrollEnd })

  const visibleList = lists.slice(start, end)
  const style = useStyle({vertical, space, itemLength: itemLength, autoSize, hideArrow, alignment, remainLength})

  const isSelected = useIsSelected(controllerId)

  React.useEffect(() => {
    if (isSelected) {
      getAppStore().dispatch(appActions.widgetStatePropChange(controllerId, 'hideArrow', hideArrow))
      getAppStore().dispatch(appActions.widgetStatePropChange(controllerId, 'disablePrevious', disablePrevious))
      getAppStore().dispatch(appActions.widgetStatePropChange(controllerId, 'disableNext', disableNext))
      getAppStore().dispatch(appActions.widgetToolbarStateChange(controllerId, ['controller-previous', 'controller-next']))
    }
  }, [controllerId, disableNext, disablePrevious, hideArrow, isSelected])

  React.useEffect(() => {
    if (isSelected) {
      const extensionManager = ExtensionManager.getInstance()
      const previous = extensionManager.getExtensionById(`${controllerId}-previous`) as Previous
      const next = extensionManager.getExtensionById(`${controllerId}-next`) as Next
      previous && (previous.scroll = scroll)
      next && (next.scroll = scroll)
    }
  }, [controllerId, isSelected, scroll])

  const handleChange = (previous: boolean) => {
    scroll(previous, true)
  }

  return <NavButtonGroup
    css={style}
    variant='text'
    tag='div'
    vertical={vertical}
    onChange={handleChange}
    disablePrevious={disablePrevious}
    disableNext={disableNext}
    previousAriaLabel={translate('previous')}
    nextAriaLabel={translate('next')}
    className={classNames('scroll-list', className)}>
    <div className='root scroll-list-root' ref={handleRef} onMouseDown={onMouseDown}>
      {
        lists.map((item) => {
          const hidden = !visibleList.includes(item)
          return createItem(item, classNames('scroll-list-item', { 'd-none': hidden }))
        })
      }
    </div>
  </NavButtonGroup>
})
