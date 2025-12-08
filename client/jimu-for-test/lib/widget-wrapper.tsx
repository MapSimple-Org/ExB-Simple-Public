import { type AllWidgetProps, React, type WidgetInjectedProps, type RawWidgetType, type IMState, type WidgetProps, MutableStoreManager, injectIntl, ReactRedux } from 'jimu-core'
import { withTheme } from 'jimu-theme'
import { isClassComponent } from './test-utils'

export type WrappedWidgetTypePartialProps = (React.ComponentClass<Partial<AllWidgetProps<unknown>>> | React.FunctionComponent<Partial<AllWidgetProps<unknown>>>)
export type WrappedWidgetProps = Partial<Omit<WidgetInjectedProps<unknown>, 'theme' | 'intl'>> // theme and intl will be provided by provider

/**
 * Wrap a widget for unit testing.
 * The recommended way is to wrap the widget one time, then change props in test cases
 * @param WidgetClass
 * @param props The props here can be considered as default props for a bunch of test cases.
 * @returns
 */
export function wrapWidget (WidgetClass: RawWidgetType, props?: WrappedWidgetProps): WrappedWidgetTypePartialProps {
  class _WidgetWrapper extends React.PureComponent<AllWidgetProps<unknown> & { widgetRef: any }, any> {
    static displayName = 'WidgetWrapper()'

    render () {
      if (isClassComponent(WidgetClass)) {
        const ClassComponent = WidgetClass as React.ComponentClass<AllWidgetProps<any>>
        return <ClassComponent ref={this.props.widgetRef} {...props} {...this.props}/>
      } else {
        return <WidgetClass {...props} {...this.props}/>
      }
    }
  }

  const WidgetWrapper = React.forwardRef((props: AllWidgetProps<unknown>, ref) => <_WidgetWrapper widgetRef={ref} {...props}/>)

  const mapStateToProps = (state: IMState, ownProps: WidgetProps): WidgetInjectedProps<unknown> => {
    const widgetId = ownProps.widgetId
    const widgetJson = state.appConfig?.widgets?.[widgetId]
    if (!widgetJson) {
      return Object.assign({}, WidgetClass.mapExtraStateProps ? WidgetClass.mapExtraStateProps(state, ownProps) : {}, ownProps)
    }

    const runtimeInfo = state.widgetsRuntimeInfo[widgetId]

    const props: Partial<WidgetInjectedProps<any>> = Object.assign({
      portalUrl: state.portalUrl,
      portalSelf: state.portalSelf,
      user: state.user,
      locale: state.appContext.locale,
      appI18nMessages: state.appI18nMessages
    }, ownProps)

    if (state.widgetsState[widgetId]) {
      props.stateProps = state.widgetsState[widgetId]
    }

    if (state.widgetsMutableStateVersion[widgetId]) {
      props.mutableStatePropsVersion = state.widgetsMutableStateVersion[widgetId]
      props.mutableStateProps = MutableStoreManager.getInstance().getStateValue([widgetId])
    }

    if (state.widgetsPreloadProps && state.widgetsPreloadProps[widgetId]) {
      Object.assign(props, state.widgetsPreloadProps[widgetId])
    }

    const allOwnProps = Object.assign({}, widgetJson, runtimeInfo, props)
    return Object.assign({}, WidgetClass.mapExtraStateProps ? WidgetClass.mapExtraStateProps(state, allOwnProps) : {}, allOwnProps)
  }

  const ConnecteWidgetComponent = ReactRedux.connect<WidgetInjectedProps<unknown>, unknown, unknown>(mapStateToProps)(WidgetWrapper)

  const IntlInjectedComponent = injectIntl<'intl', AllWidgetProps<unknown>>(ConnecteWidgetComponent as any)
  const multiTheme = window.jimuConfig.isBuilder || window.jimuConfig.isBuilder
  const ThemedWidgetWrapper = withTheme(IntlInjectedComponent, multiTheme) as WrappedWidgetTypePartialProps
  return ThemedWidgetWrapper
}
