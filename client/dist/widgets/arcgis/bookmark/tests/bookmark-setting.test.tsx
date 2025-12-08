import { React, Immutable, appActions, getAppStore } from 'jimu-core'
import BookmarkSetting from '../src/setting/setting'
import { TemplateType, PageStyle } from '../src/config'
import { mockTheme, wrapWidget, widgetRender, getInitState, initGlobal } from 'jimu-for-test'
import '@testing-library/jest-dom'
import { fireEvent } from '@testing-library/react'
import { FontFamilyValue } from 'jimu-ui'

jest.mock('jimu-for-builder', () => ({
  ...jest.requireActual('jimu-for-builder'),
  templateUtils: {
    processForTemplate: jest.fn()
  }
}))

jest.mock('jimu-ui', () => {
  return {
    ...jest.requireActual('jimu-ui'),
    NumericInput: (props) => <input className='jimu-input jimu-input-sm jimu-numeric-input jimu-numeric-input-input' {...props} />
  }
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
    }
  }
})

initGlobal()
window.jimuConfig.isBuilder = true
const initState = getInitState().merge({
  appStateInBuilder: {
    appConfig: { widgets: {}, pages: { p1: { id: 'p1' } } },
    appRuntimeInfo: { currentPageId: 'p1' },
    widgetsState: {},
    appContext: { isRTL: false }
  }
})

getAppStore().dispatch(appActions.updateStoreState(initState))

describe('bookmark setting test', function () {
  let render = null
  beforeAll(() => {
    render = widgetRender(false, mockTheme as any)
  })

  afterAll(() => {
    render = null
  })

  const config = Immutable({
    templateType: TemplateType.Slide1,
    isTemplateConfirm: true,
    isInitialed: true,
    bookmarks: [{
      id: 1,
      name: 'SettingTest-1',
      title: 'SettingTest-1',
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
      mapDataSourceId: 'dataSource_1',
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
    },
    {
      id: 2,
      name: 'SettingTest-2',
      title: 'SettingTest-2',
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
    }],
    autoPlayAllow: true,
    autoInterval: 3,
    autoLoopAllow: true,
    pageStyle: PageStyle.Paging,
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

  const props = {
    config,
    dispatch: jest.fn()
  }

  it.only('double click bookmark item title should trigger the edit mode', () => {
    const ref: { current: HTMLElement } = { current: null }
    const Setting = wrapWidget(BookmarkSetting as any, { theme: mockTheme, ref } as any)
    const { getByTitle, getByRole } = render(<Setting widgetId='bookmarkSettingTest1' useMapWidgetIds={Immutable(['widget_1'])} {...props} />)
    fireEvent.doubleClick(getByTitle('SettingTest-2'))
    const input = getByRole('textbox', { name: 'SettingTest-2' })
    expect(input).toBeInTheDocument()
  })
})
