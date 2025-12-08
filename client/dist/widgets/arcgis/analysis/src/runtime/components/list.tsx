/** @jsx jsx */
import { jsx, type ImmutableArray, React, classNames, css, isKeyboardMode } from 'jimu-core'
import { List, type ListProps } from 'jimu-ui/basic/list-tree'

interface Props extends ListProps {
  className?: string
  listData: ImmutableArray<{ id: string}> | Array<{ id: string}>
  autoFocusItemId?: string
}

const style = css`
  .jimu-tree-item__body {
    &:focus, &:focus-visible {
      outline-offset: -2px !important;
    }
  }
`

const AnalysisList = (props: Props) => {
  const { className, listData, autoFocusItemId, ...listProps } = props

  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (autoFocusItemId && containerRef.current && isKeyboardMode()) {
      const index = listData.findIndex(item => item.id === autoFocusItemId)
      if (index > -1) {
        const treeItem = containerRef.current.querySelectorAll('.jimu-tree-item__body')?.[index] as HTMLDivElement
        if (treeItem) {
          // when back from a detail page(tool detail or history detail), the focus should be on the corresponding item
          // but if focus on the item directly, the keyup event may be triggered after the tree item is focused,
          // the event target will change to the tree item and will cause itemBodyClick event be triggered and enter detail page again
          // so we need to stop the keyup event propagation at the first time
          treeItem.addEventListener('keyup', (e) => {
            e.stopImmediatePropagation()
          }, { once: true })
          treeItem.focus()
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return <div className={classNames('analysis-list', className)} css={style} ref={containerRef}>
    <List {...listProps} />
  </div>
}

export default AnalysisList
