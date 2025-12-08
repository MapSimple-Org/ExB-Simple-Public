import { React, Immutable, appActions, getAppStore } from 'jimu-core'
import { MarkPopper } from '../src/setting/components/mark-popper'
import { mockTheme, wrapWidget, widgetRender, getInitState } from 'jimu-for-test'
import { fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
jest.mock('jimu-arcgis', () => {
  return {
    loadArcGISJSAPIModules: async () => {
      return await Promise.resolve([
        { fromJSON: () => null },
        function () {
          return { fromJSON: () => null, removeAll: () => null, destroy: () => null }
        },
        { fromJSON: () => null },
        { fromJSON: () => null },
        { whenOnce: () => Promise.resolve() }
      ])
    }
  }
})

jest.mock('jimu-ui/advanced/map', () => ({
  ...jest.requireActual('jimu-ui/advanced/map'),
  JimuMap: ({ useDataSources }) => <div data-testid='popperJimuMapTest'>{useDataSources[0].dataSourceId}</div>,
  JimuDraw: () => <div>Draw</div>
}))

const initState = getInitState().merge({
  appStateInBuilder: {
    appConfig: {
      widgets: {
        widget12: {
          uri: 'widgets/arcgis/arcgis-map/',
          config: {
            toolConfig: {
              canZoom: true,
              canHome: true,
              canSearch: true,
              canNavigation: true
            },
            isUseCustomMapState: false,
            initialMapDataSourceID: 'dataSource_2'
          },
          useDataSources: [
            {
              dataSourceId: 'dataSource_1',
              mainDataSourceId: 'dataSource_1'
            },
            {
              dataSourceId: 'dataSource_2',
              mainDataSourceId: 'dataSource_2'
            }
          ]
        }
      }
    },
    appContext: { isRTL: false }
  } as any
})

getAppStore().dispatch(appActions.updateStoreState(initState))

describe('mark-popper test', function () {
  let render = null
  beforeAll(() => {
    render = widgetRender(false, mockTheme as any)
  })

  afterAll(() => {
    render = null
  })

  const props = {
    useMapWidgetIds: Immutable(['widget12']),
    buttonLabel: 'Add bookmark',
    title: 'Set bookmark view: Bookmark-2',
    id: 'widget13',
    isUseWidgetSize: true,
    maxBookmarkId: 2,
    activeBookmarkId: 1,
    tempLayoutType: 'FIXED',
    onConfigChanged: jest.fn(),
    onBookmarkUpdated: jest.fn(),
    onShowBookmarkConfig: jest.fn(),
    onAddNewBookmark: jest.fn(),
    formatMessage: jest.fn()
  }

  it.only('use current map view to add new bookmark', () => {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(MarkPopper as any, { theme: mockTheme, ref } as any)
    const { getByText, getByTestId } = render(<Widget widgetId='markPopperTest1' {...props} />)
    fireEvent.click(getByText('Add bookmark'))
    expect(getByTestId('popperJimuMapTest').innerHTML).toBe('dataSource_2')
    expect(getByTestId('popperSaveBtn')).toBeDisabled()
  })

  it.only('uploadSnapFile should call with right id', async () => {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(MarkPopper as any, { theme: mockTheme, ref } as any)
    const { getByText } = render(<Widget widgetId='markPopperTest2' {...props} />);
    (ref.current as any).state.isShowDialog = true;
    (ref.current as any).state.currentJimuMapView = {
      dataSourceId: 'dataSource_1',
      mapWidgetId: 'widget_2',
      maxLayerIndex: 2,
      view: {
        takeScreenshot: async () => { return await Promise.resolve({ dataUrl: 'fakeUrl' }) },
        extent: { toJSON: () => null },
        viewpoint: { toJSON: () => null },
        map: {
          add: jest.fn(),
          layers: { toArray: () => { return [] } },
          findLayerById: jest.fn()
        }
      }
    };
    (ref.current as any).uploadSnapFile = jest.fn()
    await waitFor(() => ((ref.current as any).state.apiLoaded))
    fireEvent.click(getByText('Add bookmark'))
    await waitFor(() => {
      expect((ref.current as any).uploadSnapFile).toHaveBeenCalledWith('fakeUrl', 3, expect.any(Function))
    }, { timeout: 1100 })
  })
})
