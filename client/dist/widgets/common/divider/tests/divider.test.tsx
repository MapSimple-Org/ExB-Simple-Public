import { React, Immutable, getAppStore, appActions, BrowserSizeMode } from 'jimu-core'
import {
  wrapWidget,
  withStoreThemeIntlRender,
  mockTheme,
  getInitState,
  initGlobal
} from 'jimu-for-test'
import Divider from '../src/runtime/widget'
import '@testing-library/jest-dom'
initGlobal()

initStore()

describe('divider widget test', function () {
  describe('default config', function () {
    let config, Widget
    const manifest = { name: 'divider' } as any
    beforeAll(function () {
      config = Immutable({
        direction: 'Horizontal',
        strokeStyle: {
          type: 'Style0',
          color: '#000',
          size: '2px'
        },
        pointStart: {
          pointStyle: 'Style0',
          pointSize: 2
        },
        pointEnd: {
          pointStyle: 'Style0',
          pointSize: 2
        },
        themeStyle: {
          quickStyleType: 'Default'
        }
      })
      Widget = wrapWidget(Divider, {
        config: config,
        browserSizeMode: BrowserSizeMode.Large,
        manifest: manifest,
        id: 'widget1',
        dispatch: () => null
      } as any)
    })
    it('divider widget should be render', () => {
      const { getByTestId } = withStoreThemeIntlRender(
        false,
        mockTheme as any
      )(<Widget />)
      expect(getByTestId('divider-line')).toBeInTheDocument()
      expect(getByTestId('divider-point-start')).toBeInTheDocument()
      expect(getByTestId('divider-point-end')).toBeInTheDocument()
    })

    it('test divider color', () => {
      const { getByTestId } = withStoreThemeIntlRender(
        false,
        mockTheme as any
      )(<Widget />)
      const style = window.getComputedStyle(getByTestId('divider-line'))
      expect(style?.borderBottom).toBe('2px solid rgb(0, 0, 0)')
    })
  })
})

function initStore () {
  let appState = getInitState()
  appState = appState.merge(
    {
      appContext: { isRTL: false },
      appConfig: {
        widgets: {
          widget1: {
            uri: 'divider'
          }
        }
      }
    },
    { deep: true }
  )
  getAppStore().dispatch(appActions.updateStoreState(appState))
}
