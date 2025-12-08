/** @jsx jsx */
import {
  jsx,
  hooks,
  css
} from 'jimu-core'
import { CalciteAction, CalciteActionGroup } from 'calcite-components'
import { useDynSegRuntimeDispatch, useDynSegRuntimeState } from '../../state'

import defaultMessages from '../../translations/default'
import { DisplayType } from '../../../config'
import { getTheme } from 'jimu-theme'
import { Tooltip } from 'jimu-ui'
import { isDefined } from 'widgets/shared-code/lrs'

export function Display() {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const theme = getTheme()
  const { display, records, pendingEdits } = useDynSegRuntimeState()
  const dispatch = useDynSegRuntimeDispatch()

  const onTableClicked = () => {
    if (display === DisplayType.Table) {
      return
    }

    dispatch({ type: 'SET_DISPLAY', value: DisplayType.Table })
    if (records.length > 0) {
      dispatch({ type: 'SET_IS_LOADING', value: true })
    }
  }

  const onDiagramClicked = () => {
    if (display === DisplayType.Diagram) {
      return
    }

    dispatch({ type: 'SET_DISPLAY', value: DisplayType.Diagram })
    if (records.length > 0) {
      dispatch({ type: 'SET_IS_LOADING', value: true })
    }
  }

  const isDisabled = (displayType: DisplayType): boolean => {
    if (isDefined(pendingEdits) && pendingEdits.size > 0) {
      if (display === DisplayType.Diagram && displayType === DisplayType.Table) {
        return true
      }
      if (display === DisplayType.Table && displayType === DisplayType.Diagram) {
        return true
      }
    }
    return false
  }

  return (
    <CalciteActionGroup scale="m">
      <Tooltip placement="auto" title={isDisabled(DisplayType.Table) ? getI18nMessage('tableLabelDisabled') : getI18nMessage('tableLabel')} showArrow enterDelay={300} enterNextDelay={1000}>
        <CalciteAction
          text={getI18nMessage('tableLabel')}
          icon="table"
          scale="m"
          indicator={display === DisplayType.Table ? true : undefined}
          disabled={isDisabled(DisplayType.Table) ? true : undefined}
          css={css`
            --calcite-action-indicator-color: ${theme.sys.color.primary.main};
          `}
          onClick={onTableClicked}
        />
      </Tooltip>
      <Tooltip placement="auto" title={isDisabled(DisplayType.Diagram) ? getI18nMessage('diagramLabelDisabled') : getI18nMessage('diagramLabel')} showArrow enterDelay={300} enterNextDelay={1000}>
        <CalciteAction
          text={getI18nMessage('diagramLabel')}
          icon="graph-bar"
          scale="m"
          indicator={display === DisplayType.Diagram ? true : undefined}
          disabled={isDisabled(DisplayType.Diagram) ? true : undefined}
          css={css`
            --calcite-action-indicator-color: ${theme.sys.color.primary.main};
          `}
          onClick={onDiagramClicked}
        />
      </Tooltip>
    </CalciteActionGroup>
  )
}
