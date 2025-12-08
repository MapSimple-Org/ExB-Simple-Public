import { React, hooks, lodash } from 'jimu-core'

const useObserveDebouncedLength = (
  rootRef: React.RefObject<HTMLElement>,
  vertical: boolean = false,
  offset: number = 0,
  itemLength: number = offset,
  autoSize: boolean
) => {
  const clientSize = vertical ? 'clientHeight' : 'clientWidth'
  const [length, setLength] = React.useState(rootRef.current?.[clientSize] ?? 0)
  const noobserve = autoSize

  const fn = () => {
    const node = rootRef.current
    const length = node[clientSize] || 0
    setLength(length)
  }

  const fnRef = hooks.useLatest(fn)
  const debounced = React.useMemo(() => lodash.debounce(() => {
    fnRef.current()
  }, 500, { leading: true }), [fnRef])

  //Use ResizeObserver to monitor the size change of root dom
  React.useEffect(() => {
    if (noobserve) return
    const node = rootRef.current
    if (node) {
      debounced()
    }
    const resizeObserver = new ResizeObserver(debounced)
    resizeObserver.observe(node)
    return () => {
      resizeObserver.disconnect()
      debounced.cancel()
    }
  }, [rootRef, debounced, noobserve])

  return Math.max(length + offset, itemLength)
}

const getStartEnd = (previousStart: number, previousEnd: number, number: number): [number, number] => {
  let start = previousStart
  let end = previousEnd

  if (end - start > number) {
    end = previousStart + number
  } else if (end - start < number) {
    start = 0
    end = start + number
  }
  return [start, end]
}

interface ResponsiveViewportProps {
  rootRef: React.RefObject<HTMLElement>
  lists: string[]
  itemLength: number
  autoSize: boolean
  vertical?: boolean
  space?: number
  autoScrollEnd?: boolean
}

export interface ResponsiveViewportResult {
  start: number
  end: number
  disablePrevious: boolean
  disableNext: boolean
  hideArrow: boolean
  scroll: (previous: boolean, moveOne?: boolean) => void
  remainLength: number
}

export const useResponsiveViewport = (props: ResponsiveViewportProps): ResponsiveViewportResult => {
  const { rootRef, lists, itemLength, autoSize, vertical, space, autoScrollEnd } = props
  const counts = lists?.length ?? 0
  //The length of the viewport that can be used to display items
  let length = useObserveDebouncedLength(rootRef, vertical, space, itemLength, autoSize)
  //Number of items that can be displayed in the viewport.
  //When length or itemLength changed, recalculate the number that can be displayed in the viewport
  let number: number
  if (autoSize) {
    number = counts
    length = itemLength * number
  } else {
    number = Math.floor(length / itemLength) > counts ? counts : Math.floor(length / itemLength)
  }
  const remainLength = length - itemLength * number

  const [start, setStart] = React.useState(getStartEnd(0, 0, number)[0])
  const [end, setEnd] = React.useState(getStartEnd(0, 0, number)[1])
  const previousStartRef = hooks.useLatest(start)
  const previousEndRef = hooks.useLatest(end)
  const [hideArrow, setHideArrow] = React.useState((end - start) >= counts)
  const disablePrevious = start === 0
  const disableNext = end === counts

  //When the number that can be displayed in the viewport changed, automatically update end
  React.useEffect(() => {
    if (length === 0) return
    const [start, end] = getStartEnd(previousEndRef.current, previousStartRef.current, number)
    setStart(start)
    setEnd(end)
    setHideArrow((end - start) >= counts)
  }, [number, length, previousEndRef, previousStartRef, counts])

  //Fire scroll function to change start and end
  const scroll = hooks.useEventCallback((previous: boolean, moveOne = true) => {
    const moveNumber = moveOne ? 1 : number
    let s = 0; let e = 0
    if (previous) {
      s = start - moveNumber
      if (s < 0) {
        s = 0
        e = s + number
      } else {
        e = end - moveNumber
      }
    } else {
      e = end + moveNumber
      if (e > counts) {
        e = counts
        s = e - number
      } else {
        s = start + moveNumber
      }
    }
    setStart(s)
    setEnd(e)
  })

  //When the counts of lists changed, automatically scroll to end
  const prevCounts = hooks.usePrevious(counts)
  React.useEffect(() => {
    const validList = counts > 0 && prevCounts > 0
    const scrollEnd = autoScrollEnd && validList && prevCounts < counts
    if (scrollEnd) {
      let start = 0
      let end = 0
      end = counts
      start = end - number
      start = Math.max(0, start)
      setStart(start)
      setEnd(end)
    }
  }, [autoScrollEnd, counts, number, prevCounts])

  return {
    start,
    end,
    disablePrevious,
    disableNext,
    hideArrow,
    scroll,
    remainLength
  }
}

export const useDisplayButtonAmount = (props: ResponsiveViewportProps): number => {
  const { rootRef, lists, itemLength, autoSize, vertical, space } = props
  const counts = lists?.length ?? 0
  const length = useObserveDebouncedLength(rootRef, vertical, space, itemLength, autoSize)
  let amount: number
  if (autoSize) {
    amount = counts
  } else {
    amount = Math.floor(length / itemLength) > counts ? counts : Math.floor(length / itemLength)
  }
  return amount
}
