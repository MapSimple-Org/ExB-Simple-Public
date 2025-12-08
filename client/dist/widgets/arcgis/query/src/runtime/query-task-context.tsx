import { React } from 'jimu-core'

export const QueryTaskContext = React.createContext<QueryTaskContextProps>({
  resetSymbol: null
})

export interface QueryTaskContextProps {
  resetSymbol?: symbol // used to trigger reset operation
}
