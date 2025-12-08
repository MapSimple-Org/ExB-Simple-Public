import { React, Immutable, getAppStore, appActions } from 'jimu-core'
import ButtonWidget from '../src/runtime/widget'
import { wrapWidget, widgetRender, getInitState, getDefaultAppConfig } from 'jimu-for-test'
import '@testing-library/jest-dom'
getAppStore().dispatch(appActions.updateStoreState(getInitState().merge({ appConfig: getDefaultAppConfig() })))

const render = widgetRender(false)
const Widget = wrapWidget(ButtonWidget)
describe('button widget test', function () {
  describe('default config', function () {
    const config = Immutable({
      functionConfig: {
        text: 'Please configure link',
        toolTip: '',
        linkParam: {
        }
      },
      styleConfig: {
        themeStyle: {
          quickStyleType: 'default'
        }
      }
    })

    it('button widget should be render', () => {
      const { queryBySelector } = render(<Widget config={config}/>)
      expect(queryBySelector('.widget-button-link')).not.toBeNull()
    })
  })

  describe('test value config', function () {
    const config = Immutable({
      functionConfig: {
        text: 'textTest',
        toolTip: 'testToolTip',
        linkParam: {
          value: 'detail-page',
          linkType: 'PAGE'
        }
      },
      styleConfig: {
        themeStyle: {
          quickStyleType: 'default'
        }
      }
    })

    it('button widget should be render', () => {
      const renderResult = render(<Widget config={config}/>)

      expect(renderResult.queryBySelector('.widget-button-link')).toBeInTheDocument()
      expect(renderResult.queryByText('textTest')).toBeInTheDocument() //text ok
      expect(renderResult.queryByTitle('testToolTip')).toBeInTheDocument() // toolTip ok
      // renderResult.queryBySelector('.widget-button-link').getAttribute('href'); // link ok
    })
  })
})
