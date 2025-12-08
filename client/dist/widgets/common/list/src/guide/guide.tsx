import { React, utils, getAppStore, appActions, ReactRedux, type WidgetJson, type IMState, LayoutItemType, useIntl } from 'jimu-core'
import { GuideComponent, type Steps, EVENTS, type GuideProps } from 'jimu-ui/basic/guide'
import defaultMessages from '../runtime/translations/default'
const { useState, useEffect, useMemo } = React

const WidgetGuideComponent = (props: GuideProps & StateToProps) => {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(props.stepIndex ?? 0)
  const originSteps = require('./steps.json')
  const intl = useIntl()
  const steps = useMemo(() => {
    const currentStep = originSteps.steps
    if (props.widgetJson?.id && props.widgetJson.manifest.name === 'list' && props.stepIndex === 1) {
      const selector = `[data-widgetid="${props.widgetJson?.id}"]`
      if (!currentStep[7].target.includes(selector)) {
        if (currentStep[7].target.includes('data-widgetid')) {
          const target = currentStep[7].target
          const widgetId = target.match(/data-widgetid="([^"]+)"/)[1]
          currentStep[7].target = target.replace(widgetId, props.widgetJson?.id)
        } else {
          currentStep[7].target = `${selector} ${currentStep[7].target}`
        }
      }
      if (!currentStep[9].target.includes(selector)) {
        if (currentStep[9].target.includes('data-widgetid')) {
          const target = currentStep[9].target
          const widgetId = target.match(/data-widgetid="([^"]+)"/)[1]
          currentStep[9].target = target.replace(widgetId, props.widgetJson?.id)
        } else {
          currentStep[9].target = `${selector} ${currentStep[9].target}`
        }
      }
    }
    return utils.replaceI18nPlaceholdersInObject(currentStep, intl, Object.assign(
      {},
      defaultMessages,
      intl.messages
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.widgetJson])

  const onStepClick = (e, step, index) => {
    if (index === 1) { // template step
      if (e?.target.classList.contains('btn-primary')) {
        setStepIndex(index + 1)
      }
    } else { // other steps
      setStepIndex(index + 1)
    }
  }

  const onStepChange = (data) => {
    const { nextIndex, step, event } = data
    if (nextIndex === 1) {
      getAppStore().dispatch(
        appActions.widgetStatePropChange('right-sidebar', 'collapse', true)
      )
    } else if ([5, 6, 7].includes(nextIndex) && event === EVENTS.STEP_BEFORE) {
      const settingContainerElm = document.querySelector('.jimu-widget-list-setting')
      const targetElm = document.querySelector(step?.target)
      if (settingContainerElm && targetElm) {
        const scrollTop = targetElm.getBoundingClientRect().top - settingContainerElm.getBoundingClientRect().top
        settingContainerElm?.scrollTo({ top: scrollTop > 0 ? scrollTop : 0 })
      }
    }
    props?.onStepChange(data)
  }

  useEffect(() => {
    setRun(props.run)
  }, [props.run])

  useEffect(() => {
    setStepIndex(props.stepIndex)
  }, [props.stepIndex])
  return (
    run && steps && steps.length &&
    (<GuideComponent
      {...props}
      run={run}
      stepIndex={stepIndex}
      steps={steps as Steps}
      onStepChange={onStepChange}
      onActionTriggered={onStepClick}
    />)
  )
}
interface StateToProps {
  widgetJson: WidgetJson
}
const mapStateToProps = (appState: IMState): StateToProps => {
  const appConfig = appState.appStateInBuilder?.appConfig
  const layoutSelection = appState.appStateInBuilder?.appRuntimeInfo.selection
  let widget
  if (layoutSelection) {
    const { layoutId, layoutItemId } = layoutSelection
    const layoutItem = appConfig.layouts?.[layoutId]?.content?.[layoutItemId]

    if (layoutItem) {
      if (layoutItem.type === LayoutItemType.Widget) {
        if (layoutItem.widgetId) {
          widget = appConfig.widgets[layoutItem.widgetId]
        }
      }
    }
  }
  return {
    widgetJson: widget
  }
}
export default ReactRedux.connect<StateToProps, unknown, GuideProps>(mapStateToProps)(WidgetGuideComponent)
