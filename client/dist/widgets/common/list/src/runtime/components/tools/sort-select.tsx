/** @jsx jsx */
import { React, jsx, css, polished, getAppStore, type ImmutableArray, defaultMessages as jimuCoreDefaultMessage, Immutable, appActions, type DataSource, hooks, ReactRedux, type IMState } from 'jimu-core'
import { defaultMessages as jimUiDefaultMessage } from 'jimu-ui'
import { SortOutlined } from 'jimu-icons/outlined/directional/sort'
import type { SortSettingOption } from '../../../config'
import defaultMessage from '../../translations/default'
import MyDropDown, { type MyDropDownItem } from './my-dropdown'
import { useTheme } from 'jimu-theme'
const { useEffect, useState, useRef } = React
const { useSelector } = ReactRedux
interface Props {
  handleSortOptionChange: (label: string) => void
  sorts: ImmutableArray<SortSettingOption>
  sortOptionName: string
  dataSource: DataSource
  id: string
  showSortString: boolean
}

const STYLE = css`
  & {
    max-width: 150px;
  }
  .list-toggle-button:hover, .list-toggle-button {
    background: none !important;
  }
  .list-toggle-button {
    color: inherit !important;
  }
  .jimu-dropdown-button-content {
    color: inherit !important;
  }
  .dropdown-btn-con {
    color: inherit !important;
    padding-left: ${polished.rem(7)};
    padding-right: ${polished.rem(7)};
    svg {
      margin-right: ${polished.rem(4)} !important;
    }
  }
  .dropdown-btn-con:hover {
    color: var(--sys-color-primary);
  }
`

const SortSelect = (props: Props) => {
  const theme = useTheme()
  const appMode = useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)
  const widgetsState = useSelector((state: IMState) => state?.widgetsState)
  const sortItemsRef = useRef<ImmutableArray<MyDropDownItem>>(null)
  const sortStringRef = useRef<string>(null)

  const nls = hooks.useTranslation(defaultMessage, jimUiDefaultMessage, jimuCoreDefaultMessage)
  const { handleSortOptionChange, sorts, dataSource, sortOptionName, id, showSortString } = props

  const [sortItems, setSortItems] = useState(null as ImmutableArray<MyDropDownItem>)

  useEffect(() => {
    getSortItems()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorts])

  useEffect(() => {
    updateWidgetStateOfList()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSortChange = (evt, item: MyDropDownItem) => {
    handleSortOptionChange(item?.label)
    updateWidgetStateOfList()
  }

  const updateWidgetStateOfList = () => {
    for (const widgetId in widgetsState) {
      if (widgetsState[widgetId]?.listWidget && widgetsState[widgetId]?.dsId === dataSource?.id) {
        const activeSort = (id === widgetId)
        getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'activeSort', activeSort))
      }
    }
  }

  const getSortItems = () => {
    const options = [] as any
    if (sorts) {
      sorts.forEach(sort => {
        sort.rule &&
          sort.rule.forEach(sortData => {
            if (sortData && !!sortData.jimuFieldName) {
              options.push({
                label: sort.ruleOptionName,
                event: handleSortChange
              })
            }
          })
      })
    }
    sortItemsRef.current = Immutable(options)
    setSortItems(Immutable(options))
  }

  const getSortContent = hooks.useEventCallback((sortOptionName: string) => {
    let sortString
    if (showSortString) {
      sortString = nls('listSort')
    } else if (!sortOptionName) {
      sortString = sortItemsRef.current?.[0]?.label
    } else {
      sortString = sortOptionName
    }
    sortStringRef.current = sortString
    return (<div className='d-flex align-items-center dropdown-btn-con' title={sortString} aria-label={sortString}>
      <SortOutlined/>
      <span className='flex-grow-1 w-100 text-truncate'>{sortString}</span>
    </div>)
  })

  return (
    <div className='list-sort-con d-flex align-items-center flex-grow-1 w-100' css={STYLE}>
      <MyDropDown
        theme={theme}
        items={sortItems}
        appMode={appMode}
        toggleType='tertiary'
        toggleArrow={false}
        toggleContent={(theme) => getSortContent(sortOptionName)}
        size='sm'
        showActive
        activeIcon
        activeLabel={sortStringRef.current}
        className='w-100'
      />
    </div>
  )
}

export default SortSelect
