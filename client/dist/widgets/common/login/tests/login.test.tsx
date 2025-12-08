import { React, Immutable, getAppStore, appActions } from 'jimu-core'
import LoginWidget from '../src/runtime/widget'
import { wrapWidget, widgetRender, getInitState, getDefaultAppConfig } from 'jimu-for-test'
import '@testing-library/jest-dom'
getAppStore().dispatch(appActions.updateStoreState(getInitState().merge({ appConfig: getDefaultAppConfig() })))

const render = widgetRender(false)
const Widget = wrapWidget(LoginWidget)
describe('login widget test', function () {
  describe('default config', function () {
    const config = Immutable({
    })

    it('login widget should be render', () => {
      const { queryBySelector } = render(<Widget config={config}/>)
      expect(queryBySelector('.login-button')).not.toBeNull()
    })
  })
})
