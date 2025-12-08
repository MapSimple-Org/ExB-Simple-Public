import { React, type DataSource, type DataRecord } from 'jimu-core'
import type { HTMLArcgisChartElement } from 'jimu-ui/advanced/chart'

export type RenderStatus = 'none' | 'error' | 'warning' | 'success'

export interface ChartRuntimeState {
  //The element of the chart web component, which is used in `range-cursor-mode` tool.
  chart?: HTMLArcgisChartElement
  //The data source instance of the `useDataSource`.
  dataSource?: DataSource
  //The data source instance of `outputDataSource`.
  outputDataSource?: DataSource
  //The fetched records.
  records?: DataRecord[]
  //The version of the data source query
  queryVersion?: number
  //The render status of chart component
  renderStatus?: RenderStatus
}

const initialState: ChartRuntimeState = {
  chart: null,
  dataSource: null,
  outputDataSource: null,
  queryVersion: 0,
  renderStatus: 'none'
}

const reducer = (state: ChartRuntimeState, action) => {
  switch (action.type) {
    case 'SET_CHART':
      return { ...state, chart: action.value }
    case 'SET_DATA_SOURCE':
      return { ...state, dataSource: action.value }
    case 'SET_OUTPUT_DATA_SOURCE':
      return { ...state, outputDataSource: action.value }
    case 'SET_RECORDS':
      return { ...state, records: action.value }
    case 'SET_QUERY_VERSION':
      return { ...state, queryVersion: action.value }
    case 'SET_RENDER_STATE':
      return { ...state, renderStatus: action.value }
    default:
      return state
  }
}

const ChartRuntimeStateContext = React.createContext<ChartRuntimeState>(undefined)
const ChartRuntimeDispatchContext = React.createContext<React.Dispatch<any>>(undefined)

interface ChartRuntimeStateProviderProps {
  defaultState?: ChartRuntimeState
  children: React.ReactNode
}

export const ChartRuntimeStateProvider = (props: ChartRuntimeStateProviderProps) => {
  const { defaultState, children } = props

  const [state, dispatch] = React.useReducer(reducer, defaultState || initialState)

  return <ChartRuntimeStateContext.Provider value={state}>
    <ChartRuntimeDispatchContext.Provider value={dispatch}>
      {children}
    </ChartRuntimeDispatchContext.Provider>
  </ChartRuntimeStateContext.Provider>
}

export const useChartRuntimeState = () => {
  return React.useContext(ChartRuntimeStateContext)
}

export const useChartRuntimeDispatch = () => {
  return React.useContext(ChartRuntimeDispatchContext)
}
