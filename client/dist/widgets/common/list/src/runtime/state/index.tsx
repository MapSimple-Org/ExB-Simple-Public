import { React, type IMSqlExpression, type IMDataSourceInfo, type DataSourceStatus, type DataSource, type DataRecord } from 'jimu-core'
import type { ElementSize } from '../../config'
import { LIST_CARD_MIN_SIZE } from '../../config'
export type RenderStatus = 'none' | 'error' | 'success'

export interface ListRuntimeState {
  page: number
  pageSize: number
  widgetRect: {
    width: number
    height: number
  }
  currentCardSize: ElementSize
  scrollStatus: 'start' | 'end' | 'mid'
  dataSource: DataSource
  isResizingCard: boolean
  records: DataRecord[]
  isShowEditingMask: boolean
  queryStatus: DataSourceStatus
  dsInfo: IMDataSourceInfo
  showWidgetLoading: boolean
  showLoading: boolean
  hasDsLoadedRecord: boolean
  needScrollToSelectedItems: boolean
  selectedRecordsId: string[]

  searchText: string
  showSelectionOnly: boolean
  filterApplied: boolean
  currentFilter: IMSqlExpression
  sortOptionName: string
  showSortString: boolean

  lastRefreshTime: number

  firstItemIndexInViewport: number
}

const initialState: ListRuntimeState = {
  page: 1,
  pageSize: 1,
  dataSource: null as DataSource,
  widgetRect: {
    width: LIST_CARD_MIN_SIZE,
    height: LIST_CARD_MIN_SIZE
  },
  currentCardSize: {
    width: LIST_CARD_MIN_SIZE,
    height: LIST_CARD_MIN_SIZE
  },
  scrollStatus: 'start',
  isResizingCard: false,
  records: [],
  selectedRecordsId: [],
  isShowEditingMask: false,
  queryStatus: null,
  dsInfo: null,
  showWidgetLoading: true,
  showLoading: false,
  hasDsLoadedRecord: false,
  needScrollToSelectedItems: false,
  lastRefreshTime: null,

  searchText: null,
  showSelectionOnly: false,
  filterApplied: false,
  currentFilter: null,
  sortOptionName: null,
  showSortString: false,
  firstItemIndexInViewport: 0
}

const reducer = (state: ListRuntimeState, action) => {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.value }
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.value }
    case 'SET_DATA_SOURCE':
      return { ...state, dataSource: action.value }
    case 'SET_WIDGET_RECT':
      return { ...state, widgetRect: action.value }
    case 'SET_CURRENT_CARD_SIZE':
      return { ...state, currentCardSize: action.value }
    case 'SET_SCROLL_STATUS':
      return { ...state, scrollStatus: action.value }
    case 'SET_IS_RESIZING_CARD':
      return { ...state, isResizingCard: action.value }
    case 'SET_FIRST_ITEM_INDEX_IN_VIEWPORT':
      return { ...state, firstItemIndexInViewport: action.value }
    case 'SET_RECORDS':
      return { ...state, records: action.value }
    case 'SET_IS_SHOW_EDITING_MASK':
      return { ...state, isShowEditingMask: action.value }
    case 'SET_SEARCH_TEXT':
      return { ...state, searchText: action.value }
    case 'SET_SHOW_SELECTION_ONLY':
      return { ...state, showSelectionOnly: action.value }
    case 'SET_QUERY_STATUS':
      return { ...state, queryStatus: action.value }
    case 'SET_DS_INFO':
      return { ...state, dsInfo: action.value }
    case 'SET_FILTER_APPLIED':
      return { ...state, filterApplied: action.value }
    case 'SET_CURRENT_FILTRE':
      return { ...state, currentFilter: action.value }
    case 'SET_SORT_OPTION_NAME':
      return { ...state, sortOptionName: action.value }
    case 'SET_SHOW_SORT_STRING':
      return { ...state, showSortString: action.value }
    case 'SET_SHOW_WIDGET_LOADING':
      return { ...state, showWidgetLoading: action.value }
    case 'SET_HAS_DS_LOADED_RECORD':
      return { ...state, hasDsLoadedRecord: action.value }
    case 'SET_SHOW_LOADING':
      return { ...state, showLoading: action.value }
    case 'LAST_REFRESH_TIME':
      return { ...state, lastRefreshTime: action.value }
    case 'SET_NEED_SCROLL_TO_SELECTED_ITEM':
      return { ...state, needScrollToSelectedItems: action.value }
    case 'SET_SELECTED_RECORDS_ID':
      return { ...state, selectedRecordsId: action.value }
    case 'SET_LIST_RUNTIME_STATE':
      return { ...state, ...action.value}
    default:
      return state
  }
}

export interface ListContainerState {
  state: ListRuntimeState
  dispatch: React.Dispatch<any>
}
const ListRuntimeStateContext = React.createContext<ListRuntimeState>(undefined)
const ListRuntimeDispatchContext = React.createContext<React.Dispatch<any>>(undefined)
export const ListContainerContext = React.createContext<ListContainerState>(undefined)


interface ListRuntimeStateProviderProps {
  defaultState?: ListRuntimeState
  children: React.ReactNode
}

export const ListRuntimeStateProvider = (props: ListRuntimeStateProviderProps) => {
  const { defaultState, children } = props
  const [state, dispatch] = React.useReducer<ListRuntimeState, any>(reducer, defaultState || initialState)
  return <ListRuntimeStateContext.Provider value={state}>
    <ListRuntimeDispatchContext.Provider value={dispatch}>
      <ListContainerContext.Provider value={{ state, dispatch}}>
        {children}
      </ListContainerContext.Provider>
    </ListRuntimeDispatchContext.Provider>
  </ListRuntimeStateContext.Provider>
}

export const useListRuntimeState = () => {
  return React.useContext(ListRuntimeStateContext)
}

export const useListRuntimeDispatch = () => {
  return React.useContext(ListRuntimeDispatchContext)
}
