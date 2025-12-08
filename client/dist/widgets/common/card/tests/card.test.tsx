import { React, Immutable, getAppStore, appActions } from 'jimu-core'
import Card from '../src/runtime/widget'
import { wrapWidget, widgetRender, getInitState, getDefaultAppConfig } from 'jimu-for-test'

getAppStore().dispatch(appActions.updateStoreState(getInitState().merge({ appConfig: getDefaultAppConfig() })))
const render = widgetRender(false)
const Widget = wrapWidget(Card)
window.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))
describe('card widget test', function () {
  describe('default config', function () {
    let config
    beforeAll(function () {
      config = Immutable({
        DEFAULT: {
          enable: true,
          backgroundStyle: {
            border: {
              type: 'solid',
              color: 'var(--ref-palette-neutral-1200)',
              width: '0px'
            }
          }
        },
        HOVER: {
          enable: false,
          backgroundStyle: {
            border: {
              type: 'solid',
              color: 'var(--ref-palette-neutral-1200)',
              width: '0px'
            }
          }
        },
        itemStyle: 'STYLE1',
        isItemStyleConfirm: false,
        isOpenAdvabceSetting: false,
        direction: 'Horizontal',
        transitionInfo: {
          transition: {
            type: 'None',
            direction: 'H'
          },
          oneByOneEffect: null
        },
        linkParam: {
          expression: null,
          linkType: 'WEB_ADDRESS',
          openType: '_blank',
          value: 'test'
        }
      })
    })

    it('card content widget should be render', () => {
      const { queryBySelector } = render(<Widget config={config} layouts={{} as any}/>)
      expect(queryBySelector('.widget-card')).not.toBeNull()
    })
  })
})
