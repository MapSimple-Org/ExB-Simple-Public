/** @jsx jsx */
import {
  React,
  jsx,
  hooks
} from 'jimu-core'
import { Select, NumericInput, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { UnitType } from '../config'
import defaultMessage from './translations/default'
import { QueryTaskContext } from './query-task-context'

export interface Props {
  distance: number
  unit: UnitType
  onBufferChange: (distance: number, unit: UnitType) => void
}

export function BufferInput (props: Props) {
  const { distance = 0, unit = UnitType.Meters, onBufferChange } = props
  const getI18nMessage = hooks.useTranslation(jimuUIMessages, defaultMessage)
  const [d, setD] = React.useState(distance)
  const [u, setU] = React.useState(unit)
  const queryTaskContext = React.useContext(QueryTaskContext)
  const resetSymbolRef = React.useRef(queryTaskContext.resetSymbol)

  React.useEffect(() => {
    let changed = false
    if (distance !== d) {
      setD(distance)
      changed = true
    }
    if (unit !== u) {
      setU(unit)
      changed = true
    }
    if (changed) {
      onBufferChange(distance, unit)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distance, unit])

  React.useEffect(() => {
    if (queryTaskContext.resetSymbol && queryTaskContext.resetSymbol !== resetSymbolRef.current) {
      resetSymbolRef.current = queryTaskContext.resetSymbol
      setD(distance)
      setU(unit)
      onBufferChange(distance, unit)
    }
  }, [queryTaskContext.resetSymbol, distance, unit, onBufferChange])

  const handleDistanceChange = React.useCallback((value) => {
    setD(value)
  }, [])

  const handleDistanceAccepted = React.useCallback((value) => {
    setD(value)
    onBufferChange(value, u)
  }, [onBufferChange, u])

  const handleBufferUnitChange = React.useCallback((e) => {
    setU(e.target.value)
    onBufferChange(d, e.target.value)
  }, [onBufferChange, d])

  return (
    <React.Fragment>
      <NumericInput
        aria-label={getI18nMessage('theBufferDistance')}
        className='mr-1'
        value={d}
        onChange={handleDistanceChange}
        onAcceptValue={handleDistanceAccepted}
      />
      <Select
        aria-label={getI18nMessage('unit')}
        value={u}
        onChange={handleBufferUnitChange}
      >
        {Object.values(UnitType).map((value) => (
          <option key={value} value={value}>
            {getI18nMessage(`unit_${value}`)}
          </option>
        ))}
      </Select>
    </React.Fragment>
  )
}
