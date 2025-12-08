import { getAppStore, appActions, MessageType, Immutable } from 'jimu-core'
import ToggleWidgetsAction from '../src/message-actions/toggle-widgets-action'


jest.mock('jimu-core', () => {
  const actual = jest.requireActual('jimu-core')
  return {
    ...actual,
    getAppStore: jest.fn(),
    appActions: {
      openWidgets: jest.fn(),
      closeWidgets: jest.fn()
    }
  }
})

describe('ToggleWidgetsAction onExecute', () => {
  let action: ToggleWidgetsAction
  let dispatch: jest.Mock
  let state: any

  beforeEach(() => {
    dispatch = jest.fn()
    state = {
      appConfig: {
        widgets: {
          controller1: {
            config: {
              behavior: {}
            }
          }
        }
      },
      widgetsRuntimeInfo: {}
    };
    (getAppStore as jest.Mock).mockReturnValue({
      getState: () => state,
      dispatch
    })
    action = new ToggleWidgetsAction({
      id: 'action1',
      label: 'Open Widgets',
      widgetId: 'controller1',
      intl: null
    })
    jest.clearAllMocks()
  })

  it('should not call appActions.openWidgets or appActions.closeWidgets if actionConfig is undefined', async () => {
    await action.onExecute({ type: MessageType.ButtonClick }, undefined)
    expect(dispatch).not.toHaveBeenCalled()
    expect(appActions.openWidgets).not.toHaveBeenCalled()
    expect(appActions.closeWidgets).not.toHaveBeenCalled()
  })

  it('should not call appActions.openWidgets or appActions.closeWidgets if widgetIds is empty', async () => {
    await action.onExecute(
      { type: MessageType.ButtonClick },
      Immutable({ widgetIds: [], asMutable: () => [], useDataSources: [] })
    )
    expect(dispatch).not.toHaveBeenCalled()
    expect(appActions.openWidgets).not.toHaveBeenCalled()
    expect(appActions.closeWidgets).not.toHaveBeenCalled()
  })

  it('should close all opening widgets and open the new one if onlyOpenOne is true and widget not open', async () => {
    state.appConfig.widgets.controller1.config.behavior.onlyOpenOne = true
    state.widgetsRuntimeInfo = {
      w1: { controllerWidgetId: 'controller1' },
      w2: { controllerWidgetId: 'controller1', state: 'OPENED' }
    }
    const actionConfig = { widgetIds: ['w3'], asMutable: function() { return this.widgetIds } }
    await action.onExecute({ type: MessageType.ButtonClick }, Immutable(actionConfig))
    expect(dispatch).toHaveBeenCalledWith(appActions.closeWidgets(['w2']))
    expect(dispatch).toHaveBeenCalledWith(appActions.openWidgets(['w3']))
  })

  it('should only close all opening widgets if onlyOpenOne is true and widget already open', async () => {
    state.appConfig.widgets.controller1.config.behavior.onlyOpenOne = true
    state.widgetsRuntimeInfo = {
      w1: { controllerWidgetId: 'controller1', state: 'OPENED' },
      w2: { controllerWidgetId: 'controller1', state: 'OPENED' }
    }
    const actionConfig = { widgetIds: ['w1'], asMutable: function() { return this.widgetIds } }
    await action.onExecute({ type: MessageType.ButtonClick }, Immutable(actionConfig))
    expect(dispatch).toHaveBeenCalledWith(appActions.closeWidgets(['w1', 'w2']))
    expect(appActions.openWidgets).not.toHaveBeenCalled()
  })

  it('should close widgets if all are open and onlyOpenOne is false', async () => {
    state.appConfig.widgets.controller1.config.behavior.onlyOpenOne = false
    state.widgetsRuntimeInfo = {
      w1: { controllerWidgetId: 'controller1', state: 'OPENED' },
      w2: { controllerWidgetId: 'controller1', state: 'OPENED' }
    }
    const actionConfig = { widgetIds: ['w1', 'w2'], asMutable: function() { return this.widgetIds } }
    await action.onExecute({ type: MessageType.ButtonClick }, Immutable(actionConfig))
    expect(dispatch).toHaveBeenCalledWith(appActions.closeWidgets(['w1', 'w2']))
    expect(appActions.openWidgets).not.toHaveBeenCalled()
  })

  it('should open widgets if not all are open and onlyOpenOne is false', async () => {
    state.appConfig.widgets.controller1.config.behavior.onlyOpenOne = false
    state.widgetsRuntimeInfo = {
      w1: { controllerWidgetId: 'controller1' }
    }
    const actionConfig = { widgetIds: ['w1', 'w2'], asMutable: function() { return this.widgetIds } }
    await action.onExecute({ type: MessageType.ButtonClick }, Immutable(actionConfig))
    expect(dispatch).toHaveBeenCalledWith(appActions.openWidgets(['w1', 'w2']))
    expect(appActions.closeWidgets).not.toHaveBeenCalled()
  })
})