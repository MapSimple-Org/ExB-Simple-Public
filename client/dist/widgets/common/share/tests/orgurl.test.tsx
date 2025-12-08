import { React, Immutable, getAppStore, appActions } from 'jimu-core'
import ShareWidget from '../src/runtime/widget'
import { wrapWidget, widgetRender, getInitState } from 'jimu-for-test'

describe('share widget test', function () {
  let render

  describe('default config', function () {
    let config, Widget
    const manifest = { name: 'share' } as any
    const appConfig = { widgets: [] }// for searchUtils.getParentWidgetIdOfContent()

    beforeAll(function () {
      window.locale = 'en-us'

      config = Immutable({
        uiMode: 'POPUP',
        popup: {
          icon: '',
          items: ['embed', 'qrcode', 'email', 'facebook', 'twitter', 'pinterest', 'linkedin'],
          tooltip: ''
        },
        inline: {
          items: ['facebook', 'twitter', 'pinterest', 'linkedin', 'embed', 'qrcode', 'email', 'sharelink'],
          design: {
            direction: 'HORIZONTAL',
            hideLabel: false,
            btnRad: 0,
            btnColor: '',
            iconColor: '',
            size: 'default'
          }
        }
      })

      render = widgetRender(false)
    })
    afterAll(() => {
      render = null
    })

    it('1. share widget should be render', () => {
      const initState = getInitState().set('appConfig', appConfig)
      getAppStore().dispatch(appActions.updateStoreState(initState))

      Widget = wrapWidget(ShareWidget, {
        config: config,
        manifest: manifest,
        dispatch: () => null,
        appConfig: getAppStore().getState().appConfig
      } as any)
      const { queryByTestId } = render(<Widget widgetId='ut-test-share' />)

      expect(queryByTestId('share-widget')).not.toBe(null)
    })

    it('2. withOut ?org=<url-key>', () => {
      const initState = getInitState().set('appConfig', appConfig)
      getAppStore().dispatch(appActions.updateStoreState(initState))

      const widgetRef = { current: null }

      Widget = wrapWidget(ShareWidget, {
        config: config,
        manifest: manifest,
        dispatch: () => null,
        ref: widgetRef,
        appConfig: getAppStore().getState().appConfig
      } as any)

      render(<Widget widgetId='ut-test-share' />)

      expect('org=').toEqual(expect.not.stringContaining(widgetRef.current._cached.currentUrl))
    })

    it('3. with ?org=<url-key>', () => {
      const initState = getInitState().set('appConfig', appConfig).set('portalSelf', {
        urlKey: 'jest-test-urlKey'
      })
      getAppStore().dispatch(appActions.updateStoreState(initState))

      const widgetRef = { current: null }

      Widget = wrapWidget(ShareWidget, {
        config: config,
        manifest: manifest,
        dispatch: () => null,
        ref: widgetRef,
        appConfig: getAppStore().getState().appConfig
      } as any)
      render(<Widget widgetId='ut-test-share' />)

      expect(widgetRef.current._cached._urlAttachedOrg).toContain('org=')
    })
  })
})
