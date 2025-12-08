import { React, type IMState, injectIntl, ReactRedux } from 'jimu-core'
import type { RawWidgetSettingType, WidgetSettingInjectedProps, AllWidgetSettingProps, WidgetSettingProps } from 'jimu-for-builder'
import { withTheme } from 'jimu-theme'
import { isClassComponent } from './test-utils'

export type WrappedWidgetSettingTypePartialProps = (React.ComponentClass<Partial<AllWidgetSettingProps<unknown>>> | React.FunctionComponent<Partial<AllWidgetSettingProps<unknown>>>)
export type WrappedWidgetSettingProps = Partial<Omit<WidgetSettingInjectedProps<unknown>, 'theme' | 'intl'>> // theme and intl will be provided by provider

/**
 * Wrap a widget setting for unit testing.
 * The recommended way is to wrap the widget setting one time, then change props in test cases
 * @param WidgetSettingClass
 * @param props The props here can be considered as default props for a bunch of test cases.
 * @returns
 */
export function wrapWidgetSetting (WidgetSettingClass: RawWidgetSettingType, props?: WrappedWidgetSettingProps): WrappedWidgetSettingTypePartialProps {
  class _WidgetSettingWrapper extends React.PureComponent<AllWidgetSettingProps<unknown> & { widgetRef: any }, any> {
    static displayName = 'WidgetSettingWrapper()'

    render () {
      if (isClassComponent(WidgetSettingClass)) {
        const ClassComponent = WidgetSettingClass as React.ComponentClass<AllWidgetSettingProps<any>>
        return <ClassComponent ref={this.props.widgetRef} {...props} {...this.props}/>
      } else {
        return <WidgetSettingClass {...props} {...this.props}/>
      }
    }
  }

  const WidgetSettingWrapper = React.forwardRef((props: AllWidgetSettingProps<unknown>, ref) => <_WidgetSettingWrapper widgetRef={ref} {...props}/>)

  const mapStateToProps = (state: IMState, ownProps: WidgetSettingProps): WidgetSettingInjectedProps<unknown> => {
    const widgetId = ownProps.widgetId
    const widgetJson = state.appStateInBuilder?.appConfig?.widgets?.[widgetId]
    if (!widgetJson) {
      return Object.assign({}, WidgetSettingClass.mapExtraStateProps ? WidgetSettingClass.mapExtraStateProps(state, ownProps) : {}, ownProps)
    }

    const props: Partial<WidgetSettingInjectedProps<any>> = Object.assign({
      portalUrl: state.portalUrl,
      portalSelf: state.portalSelf,
      user: state.user,
      locale: state.appContext.locale,
      appI18nMessages: state.appI18nMessages
    }, ownProps)

    const allOwnProps = Object.assign({}, widgetJson, props)
    return Object.assign({}, WidgetSettingClass.mapExtraStateProps ? WidgetSettingClass.mapExtraStateProps(state, allOwnProps) : {}, allOwnProps)
  }

  const ConnecteWidgetSettingComponent = ReactRedux.connect<WidgetSettingInjectedProps<unknown>, unknown, unknown>(mapStateToProps)(WidgetSettingWrapper)

  const IntlInjectedComponent = injectIntl<'intl', AllWidgetSettingProps<unknown>>(ConnecteWidgetSettingComponent as any)
  const ThemedWidgetSettingWrapper = withTheme(IntlInjectedComponent, true) as WrappedWidgetSettingTypePartialProps
  return ThemedWidgetSettingWrapper
}
