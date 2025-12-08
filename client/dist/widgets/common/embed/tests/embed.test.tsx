import {
  React,
  Immutable,
  getAppStore,
  appActions,
  lodash,
  AppMode,
  ViewVisibilityContext,
  esri
} from 'jimu-core'
import EmbedWidget from '../src/runtime/widget'
import {
  wrapWidget,
  mockTheme,
  widgetRender,
  getInitState
} from 'jimu-for-test'
import { EmbedType } from '../src/config'
import '@testing-library/jest-dom'
const sanitizer = new esri.Sanitizer({
  whiteList: {},
  stripIgnoreTag: true
})

jest.mock('jimu-ui', () => {
  return {
    ...jest.requireActual('jimu-ui'),
    DynamicUrlResolver: jest.fn().mockImplementation(props => {
      const { value, onHtmlResolved } = props
      React.useEffect(() => {
        const result = sanitizer.sanitize(value)
        const resolvedUrl = result.replace(/\s/g, '')
        onHtmlResolved(resolvedUrl, resolvedUrl?.includes('{'))
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [value])

      return null
    })
  }
})

const initState = getInitState().merge({
  appConfig: { widgets: [] as any }
})

getAppStore().dispatch(appActions.updateStoreState(initState))

describe('embed unit test', function () {
  let render = null
  beforeAll(() => {
    render = widgetRender(false, mockTheme as any)
  })

  afterAll(() => {
    render = null
  })

  const config = Immutable({
    embedType: EmbedType.Url,
    embedCode: '',
    expression: '<p>https://nodejs.org/en/</p>'
  })

  let props = {
    config,
    appMode: AppMode.Design
  }

  it.only('safe url should use iframe without sandbox', () => {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(EmbedWidget, { theme: mockTheme, ref } as any)
    const { rerender } = render(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest1' {...props} />
      </ViewVisibilityContext.Provider>
    )
    expect((ref.current as any).ifr.getAttribute('sandbox')).toBeDefined()
    const newConfig = lodash.assign({}, config, {
      expression:
        '<p>https://doc.arcgis.com/en/experience-builder/configure-widgets/image-widget.htm</p>'
    })
    const newProps = lodash.assign({}, props, { config: newConfig })
    rerender(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest1' {...newProps} />
      </ViewVisibilityContext.Provider>
    )
    expect((ref.current as any).ifr.getAttribute('sandbox')).toBeNull()
  })

  it.only('embed should not render when current view is not active', () => {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(EmbedWidget, { theme: mockTheme, ref } as any)
    const { queryByTestId, rerender } = render(
      <ViewVisibilityContext.Provider
        value={{ isInView: true, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest2' {...props} />
      </ViewVisibilityContext.Provider>
    )
    expect(queryByTestId('embedSandbox')).not.toBeInTheDocument()
    rerender(
      <ViewVisibilityContext.Provider
        value={{ isInView: true, isInCurrentView: true }}
      >
        <Widget widgetId='embedTest2' {...props} />
      </ViewVisibilityContext.Provider>
    )
    expect(queryByTestId('embedSandbox')).toBeInTheDocument()
  })

  it.only('switch useDs mode to code mode', () => {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(EmbedWidget, { theme: mockTheme, ref } as any)
    // url
    const newConfigDs = lodash.assign({}, config, {
      embedType: EmbedType.Url,
      expression: '<p>https://nodejs.org/en/</p>'
    })
    const newPropsDs = lodash.assign({}, props, {
      config: newConfigDs,
      useDataSourcesEnabled: true
    })
    const { getByTestId, queryByTestId, rerender } = render(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest3' {...newPropsDs} />
      </ViewVisibilityContext.Provider>
    )
    // code
    const newConfigCode = lodash.assign({}, config, {
      embedType: EmbedType.Code,
      embedCode: '<div>Test text</div>'
    })
    const newPropsCode = lodash.assign({}, props, { config: newConfigCode })
    rerender(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest3' {...newPropsCode} />
      </ViewVisibilityContext.Provider>
    )
    expect(getByTestId('embedSandbox').srcdoc).toContain('<div>Test text</div>')
    expect(queryByTestId('test-expressionMask')).not.toBeInTheDocument()
  })

  it.only('runtime mode, embed should load content', () => {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(EmbedWidget, { theme: mockTheme, ref } as any)
    const { queryByTestId, rerender } = render(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest4' {...props} />
      </ViewVisibilityContext.Provider>
    )
    props = lodash.assign({}, props, { appMode: AppMode.Run })
    rerender(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest4' {...props} />
      </ViewVisibilityContext.Provider>
    )
    expect(queryByTestId('embedSandbox')).toBeInTheDocument()
  })

  it.only('autoRefresh config change', () => {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(EmbedWidget, { theme: mockTheme, ref } as any)
    const initConfig = lodash.assign({}, config, {
      embedType: EmbedType.Code,
      embedCode: '<h1>111</h1>'
    })
    const initProps = lodash.assign({}, props, { config: initConfig })
    const { getByTestId, rerender } = render(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest5' {...initProps} />
      </ViewVisibilityContext.Provider>
    )
    const current = ref.current as any
    expect(getByTestId('embedSandbox').srcdoc).toContain('<h1>111</h1>')
    const newConfig = lodash.assign({}, config, {
      embedType: EmbedType.Code,
      embedCode: '<h1>222</h1>'
    })
    const newProps = lodash.assign({}, props, { config: newConfig })
    rerender(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest5' {...newProps} />
      </ViewVisibilityContext.Provider>
    )
    expect(getByTestId('embedSandbox').srcdoc).toContain('<h1>222</h1>')
    const newConfigSec = lodash.assign({}, config, {
      embedType: EmbedType.Code,
      embedCode: '<h1>222</h1>',
      autoRefresh: true,
      autoInterval: 0.5
    })
    const newPropsSec = lodash.assign({}, props, { config: newConfigSec })
    rerender(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest5' {...newPropsSec} />
      </ViewVisibilityContext.Provider>
    )
    expect(current.refreshTimer).toBeDefined()
    expect(current.state.content).toBe('<h1>222</h1>')
  })

  it.only('use label in content placeholder when enableLabel is true', () => {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(EmbedWidget, { theme: mockTheme, ref } as any)
    const newConfigDs = lodash.assign({}, config, {
      enableLabel: true,
      label: 'an exp label'
    })
    const newPropsDs = lodash.assign({}, props, {
      config: newConfigDs,
      useDataSourcesEnabled: true
    })
    const { getByText, rerender } = render(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest3' {...newPropsDs} />
      </ViewVisibilityContext.Provider>
    )
    const current = ref.current as any
    current.state.resolveErr = true
    rerender(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest5' {...newPropsDs} />
      </ViewVisibilityContext.Provider>
    )
    expect(getByText('an exp label')).toBeInTheDocument()
  })

  it.only('domains under *.arcgis.com or *.esri.com, should be considered as the same origin', () => {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(EmbedWidget, { theme: mockTheme, ref } as any)
    const newConfig = lodash.assign({}, config, {
      expression:
        'https://storymaps.arcgis.com/stories/11e15c74cd224fe88f7b7fc17b7deb7f'
    })
    const newProps = lodash.assign({}, props, { config: newConfig })
    render(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest6' {...newProps} />
      </ViewVisibilityContext.Provider>
    )
    const current = ref.current as any
    window.location.host = 'use.arcgis.com'
    expect(current.state.loadErr).toBe(false)
  })

  it.only('unresolved url should show content, when enableLabel is true should show use label', () => {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(EmbedWidget, { theme: mockTheme, ref } as any)
    const newConfigDs = lodash.assign({}, config, {
      embedType: EmbedType.Url,
      expression: '<p>https://www.baidu.com/?a={name_alias}</p>',
      enableLabel: false,
      label: ''
    })
    const newPropsDs = lodash.assign({}, props, {
      config: newConfigDs,
      useDataSourcesEnabled: true
    })
    const { getByText, rerender } = render(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest7' {...newPropsDs} />
      </ViewVisibilityContext.Provider>
    )
    const current = ref.current as any
    expect(current.state.loadErr).toBe(false)
    expect(current.state.resolveErr).toBe(true)
    expect(getByText('https://www.baidu.com/?a={name_alias}')).toBeInTheDocument()

    const newLabelConfigDs = lodash.assign({}, config, {
      embedType: EmbedType.Url,
      expression: '<p>https://www.baidu.com/?a={name_alias}</p>',
      enableLabel: true,
      label: 'embed-label'
    })
    const newLabelPropsDs = lodash.assign({}, props, {
      config: newLabelConfigDs,
      useDataSourcesEnabled: true
    })
    rerender(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <Widget widgetId='embedTest7' {...newLabelPropsDs} />
      </ViewVisibilityContext.Provider>
    )
    expect(getByText('embed-label')).toBeInTheDocument()
  })
})
