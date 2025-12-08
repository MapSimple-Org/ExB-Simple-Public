/** @jsx jsx */
import { React, ReactRedux, type AllWidgetProps, jsx, type IMState } from 'jimu-core'
import type { IMConfig } from '../config'
import type { ExtraProps } from '../utils'
import { getStyle } from './style'
import LoginButton from './component/login-button'
import { getDefaultConfig } from '../utils'

const { useSelector } = ReactRedux

const getExtraStateProps = (state: IMState, props: AllWidgetProps<IMConfig>): ExtraProps => {
  let selected = false
  const selection = state.appRuntimeInfo.selection
  if (selection && state.appConfig.layouts[selection.layoutId]) {
    const layoutItem = state.appConfig.layouts[selection.layoutId].content[selection.layoutItemId]
    selected = layoutItem && layoutItem.widgetId === props.id
  }
  const isInBuilder = state.appContext.isInBuilder
  const active = isInBuilder && selected
  return {
    active,
    appMode: state.appRuntimeInfo.appMode,
    noPermissionResourceChangedFlag: state.noPermissionResourceChangedFlag
  }
}

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const fullConfig = getDefaultConfig().merge(props.config, { deep: true })
  const extraStateProps = useSelector((state: IMState) => getExtraStateProps(state, props))
  const { id, intl, theme } = props
  return (
    <div className="jimu-widget" css={getStyle(props.theme)}>
      <LoginButton
        config={fullConfig}
        widgetId={id}
        intl={intl}
        theme={theme}
        {...extraStateProps}
      />
    </div>
  )
}

export default Widget

