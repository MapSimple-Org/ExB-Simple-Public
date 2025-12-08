import {
  React, css, ErrorBoundary, WidgetState, classNames, getAppStore,
  appActions, hooks, type WidgetProps, ReactRedux, type IMState, AppMode,
  WidgetType, type IMThemeVariables
} from 'jimu-core'
import { Loading } from 'jimu-ui'
import { loadWidgetClass } from '../common'
import { PageContext } from 'jimu-layouts/layout-runtime'
import { useSelectedWidgetId } from '../common/layout-utils'

export interface WidgetRendererProps extends WidgetProps {
  canCrossLayoutBoundary?: boolean
  offPanel?: boolean
}

const useStyle = (canCrossLayoutBoundary: boolean, builderTheme: IMThemeVariables, offPanel: boolean) => {
  return React.useMemo(() => {
    const widgetTipStyle = builderTheme ? `
    .widget-tip {
      display: block;
      padding: inherit;
      position: absolute;
      left: 0;
      bottom: 0;
      top: 0;
      right: 0;
      pointer-events: none;
    }
    .widget-tip.selected {
      border: 1px solid ${builderTheme.sys.color.primary.main};
    }
    &:hover > .widget-tip.highlight {
      border: 2px solid ${builderTheme.sys.color.primary.main};
    }
    ` : ''
    const overflowStyle = canCrossLayoutBoundary ? 'visible' : 'hidden'
    return css`
      overflow: ${overflowStyle};
      position: relative;
      .widget-content {
        position: relative;
        height: 100%;
        width: 100%;
        z-index: 0;
        ${offPanel ? `border-radius: var(--sys-shape-2); overflow: ${overflowStyle};` : ''}
      }
      .widget-mask {
        position: absolute;
        background: transparent;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 1;
      }
      ${widgetTipStyle}
    `
  }, [builderTheme, canCrossLayoutBoundary, offPanel])
}

export function WidgetRenderer (props: WidgetRendererProps) {
  const { widgetId, canCrossLayoutBoundary, className, layoutId, layoutItemId, offPanel, ...others } = props
  const cancelable = hooks.useCancelablePromiseMaker()

  const [WidgetClass, setWidgetClass] = React.useState(null)
  const [syncWidgetId, setSyncWidgetId] = React.useState('')
  const [widgetError, setWidgetError] = React.useState('')

  React.useEffect(() => {
    setWidgetClass(null)
    setSyncWidgetId('')
    const promise = cancelable(loadWidgetClass(widgetId))
    promise.then((widgetClass) => {
      // Synchronously update WidgetClass and widgetId, in case of mismatch
      setWidgetClass(widgetClass)
      setSyncWidgetId(widgetId)
    }, (error) => {
      setWidgetError(error?.message ?? error)
    })
  }, [cancelable, widgetId])

  const handleMouseDown = React.useCallback(() => {
    if (widgetError) return
    if (window.jimuConfig.isBuilder) {
      return
    }
    const isActive = getAppStore().getState().widgetsRuntimeInfo?.[widgetId]?.state === WidgetState.Active

    if (isActive) {
      return
    }
    getAppStore().dispatch(appActions.activateWidget(widgetId))
  }, [widgetError, widgetId])

  const isDesignMode = ReactRedux.useSelector((state: IMState) => {
    return state.appRuntimeInfo.appMode === AppMode.Design
  })
  const supportInlineEditing = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson?.manifest?.properties?.supportInlineEditing ?? false
  })
  const isInlineEditing = ReactRedux.useSelector((state: IMState) => {
    const widgetRuntimeInfo = state.widgetsRuntimeInfo[widgetId]
    return supportInlineEditing && widgetRuntimeInfo?.isInlineEditing
  })
  const isFunctionalWidget = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson?.manifest?.widgetType !== WidgetType.Layout
  })
  const hasEmbeddedLayout = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson?.manifest?.properties?.hasEmbeddedLayout && Object.keys(widgetJson.layouts ?? {}).length > 0
  })

  const showMask = isDesignMode && !isInlineEditing && isFunctionalWidget && !hasEmbeddedLayout

  const { viewOnly, builderTheme } = React.useContext(PageContext)
  const selectedWidgetId = useSelectedWidgetId()
  const appMode = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.appMode)
  const showSelectedTip = selectedWidgetId === widgetId && !viewOnly && appMode !== AppMode.Run
  const showHightlightTip = selectedWidgetId !== widgetId && !viewOnly && appMode === AppMode.Design
  const handleDoubleClick = React.useCallback((e) => {
    const { browserSizeMode, appConfig: { mainSizeMode } } = getAppStore().getState()
    if (supportInlineEditing && !viewOnly && !(window.parent.isExpressBuilder && browserSizeMode !== mainSizeMode)) {
      e.stopPropagation()
      getAppStore().dispatch(appActions.setWidgetIsInlineEditingState(widgetId, true))
    }
  }, [supportInlineEditing, viewOnly, widgetId])

  const classes = classNames('widget-renderer w-100 h-100', className)
  const style = useStyle(canCrossLayoutBoundary, builderTheme, offPanel)

  return (
    <div
      css={style}
      className={classes}
      onMouseDownCapture={handleMouseDown}
      onDoubleClickCapture={handleDoubleClick}
      data-widgetid={syncWidgetId}
      {...others}
    >
      <div className='widget-content p-1'>
        {
          widgetError
        }
        {
          !widgetError && WidgetClass && <ErrorBoundary>
            <WidgetClass widgetId={syncWidgetId} layoutId={layoutId} layoutItemId={layoutItemId} />
          </ErrorBoundary>
        }
        {
          !widgetError && !WidgetClass && <Loading />
        }
      </div>
      {showMask && <div className='widget-mask' />}
      {(showSelectedTip || showHightlightTip) &&
        <div className={classNames('widget-tip', {
          selected: showSelectedTip,
          highlight: showHightlightTip
        })} />
      }
    </div>
  )
}
