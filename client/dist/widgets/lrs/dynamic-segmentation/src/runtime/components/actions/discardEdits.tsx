/** @jsx jsx */
import {
  jsx,
  hooks
} from 'jimu-core'
import { CalciteAction } from 'calcite-components'
import { Tooltip } from 'jimu-ui'
import defaultMessages from '../../translations/default'
import { useDynSegRuntimeDispatch, useDynSegRuntimeState } from '../../state'
import type { TableEdits } from '../../../config'

export interface DiscardEditsProps {
  dynSegFeatureLayer: __esri.FeatureLayer
}

export function DiscardEdits (props: DiscardEditsProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { dynSegFeatureLayer } = props
  const { pendingEdits, originalRecords } = useDynSegRuntimeState()
  const dispatch = useDynSegRuntimeDispatch()

  const onUndoClicked = () => {
    if (pendingEdits) {
      dispatch({ type: 'SET_RECORDS', value: originalRecords })
      dispatch({ type: 'SET_EDITS', value: new Map<string, TableEdits>() })
      dispatch({ type: 'SET_ERROR_COUNT', value: 0 })
      const edits = {
        updateFeatures: originalRecords
      }
      dynSegFeatureLayer.applyEdits(edits)
    }
  }

  return (
    <Tooltip
      placement='auto'
      title={getI18nMessage('discardEdits')}
      showArrow
      enterDelay={300}
      enterNextDelay={1000}>
      <CalciteAction
        text={getI18nMessage('discardEdits')}
        icon='read-only-non-editable'
        scale='m'
        onClick={onUndoClicked}
        disabled={pendingEdits.size > 0 ? undefined : true }
      />
    </Tooltip>
  )
}
