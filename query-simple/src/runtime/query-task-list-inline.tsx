/** @jsx jsx */
import { jsx, css, React, type ImmutableArray, classNames, lodash, hooks } from 'jimu-core'
import type { Size } from 'jimu-ui'
import type { QueryItemType } from '../config'
import { QueryTask } from './query-task'
import { QueryTaskList } from './query-task-list'
import { TaskListPopperWrapper } from './query-task-list-popper-wrapper'
import { getWidgetRuntimeDataMap } from './widget-config'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'

const { iconMap } = getWidgetRuntimeDataMap()

export interface QueryTaskListProps {
  widgetId: string
  widgetLabel: string
  wrap: boolean
  minSize: Size
  defaultSize: Size
  queryItems: ImmutableArray<QueryItemType>
  defaultPageSize?: number
  initialQueryValue?: { shortId: string, value: string }
  onHashParameterUsed?: (shortId: string) => void
}

const SPACE = 8

const style = css`
  > div {
    margin-right: 8px;
  }
`

// show task label and an arrow to the task content
export function TaskListInline (props: QueryTaskListProps) {
  const { queryItems, widgetId, minSize, defaultSize, defaultPageSize, widgetLabel, wrap = false } = props
  const containerRef = React.useRef<HTMLDivElement>(undefined)
  const containerWidthRef = React.useRef<number>(0)
  const contentWidthRef = React.useRef<{ [key: string]: number }>({})
  const [numOfExpanded, setNumOfExpanded] = React.useState(queryItems.length)
  const [openedPopper, setOpenedPopper] = React.useState(-1)
  const resizeObserverRef = React.useRef<ResizeObserver>(null)

  const adjustContent = React.useCallback(() => {
    let total = 0
    for (let i = 0; i < numOfExpanded; i++) {
      const item = queryItems[i]
      const itemWidth = contentWidthRef.current[item.configId]
      if (itemWidth > 0) {
        total += itemWidth + SPACE
        if (total >= containerWidthRef.current && numOfExpanded !== i) {
          setNumOfExpanded(i)
          return
        }
      } else {
        return // content width not ready
      }
    }
    setNumOfExpanded(queryItems.length)
  }, [numOfExpanded, queryItems])

  React.useEffect(() => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect()
    }
    // bind with the new event handler
    resizeObserverRef.current = new ResizeObserver(lodash.throttle((entries) => {
      const width = Math.round(entries[0].contentRect.width)
      if (containerWidthRef.current !== width) {
        containerWidthRef.current = width
        adjustContent()
      }
    }, 200))
    resizeObserverRef.current.observe(containerRef.current)

    return () => {
      resizeObserverRef.current.disconnect()
    }
  }, [adjustContent])

  hooks.useEffectOnce(() => {
    containerWidthRef.current = containerRef.current?.clientWidth
    adjustContent()
  })

  const handleItemWidthChange = React.useCallback((index: number, width: number) => {
    const queryItem = queryItems[index]
    if (contentWidthRef.current[queryItem.configId] !== width) {
      contentWidthRef.current[queryItem.configId] = width
      adjustContent()
    }
  }, [queryItems, adjustContent])

  const handlePopperOpenedChange = React.useCallback((index: number, isOpen: boolean) => {
    if (isOpen) {
      setOpenedPopper(index)
    } else if (index === openedPopper) {
      // current popper is closed
      setOpenedPopper(-1)
    }
  }, [openedPopper])

  const [expandedArray, nonExpandedArray] = React.useMemo(() => {
    const expandedArray = []
    const nonExpandedArray = []
    for (let i = 0; i < queryItems.length; i++) {
      if (i < numOfExpanded) {
        expandedArray.push(queryItems[i])
      } else {
        nonExpandedArray.push(queryItems[i])
      }
    }
    return [expandedArray, nonExpandedArray]
  }, [queryItems, numOfExpanded])

  return (
    <div ref={containerRef} css={style} className={classNames('runtime-query__query-list h-100 d-flex', { 'flex-wrap': wrap, 'align-content-start': wrap })}>
      {expandedArray.map((queryItem, index) => {
        const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
        return <TaskListPopperWrapper
          id={index}
          key={currentItem.configId}
          icon={currentItem.icon}
          buttonType='default'
          label={currentItem.displayLabel ? currentItem.name : undefined}
          popperTitle={currentItem.name}
          onWidthChange={handleItemWidthChange}
          minSize={minSize}
          defaultSize={defaultSize}
          onOpenedChange={handlePopperOpenedChange}
          forceClose={openedPopper >= 0 && openedPopper !== index}
        >
          <QueryTask
            widgetId={widgetId}
            index={index}
            total={1}
            isInPopper
            queryItem={currentItem}
            wrappedInPopper={true}
            className='pb-4'
            defaultPageSize={defaultPageSize}
            initialInputValue={currentItem.shortId === props.initialQueryValue?.shortId ? props.initialQueryValue.value : undefined}
            onHashParameterUsed={props.onHashParameterUsed}
            queryItemShortId={currentItem.shortId}
          />
        </TaskListPopperWrapper>
      })}

      {nonExpandedArray.length > 0 && (
        <TaskListPopperWrapper
          id={expandedArray.length + 1}
          icon={iconMap.iconMore}
          minSize={minSize}
          buttonType='default'
          popperTitle={widgetLabel}
          defaultSize={defaultSize}
          onOpenedChange={handlePopperOpenedChange}
          forceClose={openedPopper >= 0 && openedPopper !== expandedArray.length + 1}
        >
          <QueryTaskList widgetId={widgetId} isInPopper defaultPageSize={defaultPageSize} queryItems={nonExpandedArray as any} className='pb-4' initialQueryValue={props.initialQueryValue} onHashParameterUsed={props.onHashParameterUsed} />
        </TaskListPopperWrapper>
      )}
    </div>
  )
}
