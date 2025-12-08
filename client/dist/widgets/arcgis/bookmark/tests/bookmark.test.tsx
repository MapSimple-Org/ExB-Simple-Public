import {
  React,
  Immutable,
  BrowserSizeMode,
  lodash,
  appActions,
  AppMode,
  ViewVisibilityContext,
  getAppStore
  // utils
} from 'jimu-core'
import BookmarkWidget from '../src/runtime/widget'
import { TemplateType, PageStyle, DirectionType } from '../src/config'
import { mockIntersectionObserver } from './mock-intersection-observer'
import {
  mockTheme,
  wrapWidget,
  widgetRender,
  getInitState
} from 'jimu-for-test'

import {
  ViewportVisibilityContext
} from 'jimu-layouts/layout-runtime'
import { fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { showLayersConfig } from '../src/utils'
import { FontFamilyValue } from 'jimu-ui'

let hasResizeCard = false
jest.mock('jimu-core', () => {
  const jimuCore = (jest as any).requireActual('jimu-core')
  jimuCore.ReactResizeDetector = jest.fn().mockImplementation((props: any) => {
    //Render calls onResize, and onResize will restart rendering, so need to prevent falling into an infinite loop.
    if (!hasResizeCard && props?.onResize) {
      props.onResize(50, 50)
      hasResizeCard = true
    }
    return null
  })
  jimuCore.lodash = {
    ...jimuCore.lodash,
    debounce: jest.fn().mockImplementation(fn => fn)
  }
  return jimuCore
})

jest.mock('jimu-arcgis', () => {
  return {
    loadArcGISJSAPIModules: async () => {
      return await Promise.resolve([
        { fromJSON: () => null },
        function () {
          return { fromJSON: () => null }
        },
        { fromJSON: () => null },
        { fromJSON: () => null },
        { fromJSON: () => null }
      ])
    },
    JimuMapViewComponent: jest.fn(() => <div data-testid='mapViewTest' />)
  }
})

jest.mock('../src/utils.ts', () => {
  return {
    showLayersConfig: jest.fn()
  }
})

const initState = getInitState().merge({
  appContext: { isRTL: false },
  appConfig: {
    widgets: [] as any,
    views: {}
  }
})

getAppStore().dispatch(appActions.updateStoreState(initState))

describe('bookmark test', function () {
  let render = null
  beforeAll(() => {
    hasResizeCard = false
    render = widgetRender(false, mockTheme as any)
    mockIntersectionObserver()
  })

  afterAll(() => {
    render = null
  })

  const config = Immutable({
    templateType: TemplateType.Slide1,
    isTemplateConfirm: true,
    isInitialed: true,
    bookmarks: [
      {
        id: 1,
        name: 'Test-1',
        title: 'Test-1',
        type: '2d',
        extent: {
          spatialReference: {
            latestWkid: 3857,
            wkid: 102100
          },
          xmin: 12753609.910596116,
          ymin: 4661461.4019647185,
          xmax: 13223239.012380214,
          ymax: 5095012.226398217
        },
        showFlag: true,
        mapDataSourceId: 'dataSource_1'
      },
      {
        id: 2,
        name: 'Test-2',
        title: 'Test-2',
        type: '2d',
        extent: {
          spatialReference: {
            latestWkid: 3857,
            wkid: 102100
          },
          xmin: 12753609.910596116,
          ymin: 4661461.4019647185,
          xmax: 13223239.012380214,
          ymax: 5095012.226398217
        },
        showFlag: true,
        mapDataSourceId: 'dataSource_1'
      }
    ],
    autoPlayAllow: true,
    autoInterval: 3,
    autoLoopAllow: true,
    pageStyle: PageStyle.Paging,
    direction: DirectionType.Horizon,
    initBookmark: true,
    runtimeAddAllow: true,
    cardNameStyle: {
      fontFamily: FontFamilyValue.AVENIRNEXT,
      fontStyles: {
        style: 'normal',
        weight: 'normal',
        decoration: 'none'
      },
      fontColor: 'var(--sys-color-surface-paper-text)',
      fontSize: '13'
    },
    slidesNameStyle: {
      fontFamily: FontFamilyValue.AVENIRNEXT,
      fontStyles: {
        style: 'normal',
        weight: 'bold',
        decoration: 'none'
      },
      fontColor: 'var(--sys-color-surface-paper-text)',
      fontSize: '16'
    },
    slidesDescriptionStyle: {
      fontFamily: FontFamilyValue.AVENIRNEXT,
      fontStyles: {
        style: 'normal',
        weight: 'normal',
        decoration: 'none'
      },
      fontColor: 'var(--sys-color-surface-paper-text)',
      fontSize: '13'
    }
  })

  let props = {
    id: 'testWidget1',
    config,
    browserSizeMode: BrowserSizeMode.Large,
    dispatch: jest.fn(),
    appMode: AppMode.Run
  }

  it('size mode change should turn off autoPlay', async () => {
    hasResizeCard = false
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(BookmarkWidget, { theme: mockTheme, ref } as any)
    const { getByTestId, rerender } = render(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <ViewportVisibilityContext.Provider value>
          <Widget widgetId='bookmarkTest1' {...props} />
        </ViewportVisibilityContext.Provider>
      </ViewVisibilityContext.Provider>
    )
    await waitFor(() => {
      fireEvent.click(getByTestId('triggerAuto'))
      props = lodash.assign({}, props, {
        browserSizeMode: BrowserSizeMode.Medium
      })
      rerender(
        <ViewVisibilityContext.Provider
          value={{ isInView: false, isInCurrentView: false }}
        >
          <ViewportVisibilityContext.Provider value>
            <Widget widgetId='bookmarkTest1' {...props} />
          </ViewportVisibilityContext.Provider>
        </ViewVisibilityContext.Provider>
      )
      expect((ref.current as any).state.autoPlayStart).toBe(false)
    }, { timeout: 10000 })
  })

  it('change map ds, showLayersConfig should called with special parameter', async () => {
    hasResizeCard = false
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(BookmarkWidget, { theme: mockTheme, ref } as any)
    const { getByTitle } = render(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <ViewportVisibilityContext.Provider value>
          <Widget widgetId='bookmarkTest2' {...props} />
        </ViewportVisibilityContext.Provider>
      </ViewVisibilityContext.Provider>
    )
    await waitFor(() => {
      ;(ref.current as any).state.jimuMapView = {
        dataSourceId: 'dataSource_1',
        mapWidgetId: 'widget_2',
        maxLayerIndex: 2,
        view: {
          goTo: jest.fn(),
          map: {
            add: jest.fn(),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            layers: { toArray: () => {} },
            findLayerById: jest.fn(),
            ground: { opacity: 1 }
          }
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      ;(ref.current as any).Viewpoint = { fromJSON: () => {} }
      ;(ref.current as any).GraphicsLayer = function () {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return { fromJSON: () => {} }
      }
      fireEvent.click(getByTitle('Click to view the next bookmark'))
      expect(showLayersConfig).toHaveBeenCalledWith(
        undefined,
        undefined,
        false
      )
    }, { timeout: 10000 })
  })

  it('active on loading in section view', async () => {
    hasResizeCard = false
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(BookmarkWidget, { theme: mockTheme, ref } as any)
    props = lodash.assign({}, props, { appMode: AppMode.Design })
    const { rerender } = render(
      <ViewVisibilityContext.Provider
        value={{ isInView: true, isInCurrentView: false }}
      >
        <ViewportVisibilityContext.Provider value>
          <Widget widgetId='bookmarkTest1' {...props} />
        </ViewportVisibilityContext.Provider>
      </ViewVisibilityContext.Provider>
    )
    await waitFor(() => null, { timeout: 0 })
    ;(ref.current as any).onViewBookmark = jest.fn()
    ;(ref.current as any).state.jimuMapView = {
      dataSourceId: 'dataSource_1',
      mapWidgetId: 'widget_2',
      view: {
        when: callback => {
          callback()
        },
        map: {
          add: jest.fn(),
          layers: { toArray: () => null },
          findLayerById: jest.fn()
        }
      }
    }
    expect((ref.current as any).onViewBookmark).not.toHaveBeenCalled()
    props = lodash.assign({}, props, { appMode: AppMode.Run })
    rerender(
      <ViewVisibilityContext.Provider
        value={{ isInView: true, isInCurrentView: true }}
      >
        <ViewportVisibilityContext.Provider value>
          <Widget widgetId='bookmarkTest1' {...props} />
        </ViewportVisibilityContext.Provider>
      </ViewVisibilityContext.Provider>
    )
    expect((ref.current as any).onViewBookmark).toHaveBeenCalled()
  })

  it('widget should render when apiLoaded is true', async () => {
    hasResizeCard = false
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(BookmarkWidget, { theme: mockTheme, ref } as any)
    const { getAllByText } = render(
      <ViewVisibilityContext.Provider
        value={{ isInView: false, isInCurrentView: false }}
      >
        <ViewportVisibilityContext.Provider value>
          <Widget widgetId='bookmarkTest1' useMapWidgetIds={Immutable(['widget 1'])} {...props} />
        </ViewportVisibilityContext.Provider>
      </ViewVisibilityContext.Provider>
    )
    await waitFor(() => {
      expect((ref.current as any).state.apiLoaded).toBe(true)
      expect(getAllByText('Test-1')[0]).toBeInTheDocument()
    }, { timeout: 1000 })
  })
})
