import { getAppStore, appActions, MessageType, Immutable } from 'jimu-core'
import OpenWidgetsAction from '../src/message-actions/open-widgets-action'

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

describe('OpenWidgetsAction onExecute', () => {
  let action: OpenWidgetsAction
  let dispatch: jest.Mock
  let state: any

  beforeEach(() => {
    dispatch = jest.fn()
    state = {
      appRuntimeInfo: { appMode: 0 },
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
    action = new OpenWidgetsAction({
      id: 'action1',
      label: 'Open Widgets',
      widgetId: 'controller1',
      intl: null
    })
    jest.clearAllMocks()
  })

  it('should not call openWidgets or closeWidgets if widgetIds is undefined', async () => {
    await action.onExecute({ type: MessageType.ButtonClick }, undefined)
    expect(dispatch).not.toHaveBeenCalled()
    expect(appActions.openWidgets).not.toHaveBeenCalled()
    expect(appActions.closeWidgets).not.toHaveBeenCalled()
  })

  it('should not call openWidgets or closeWidgets if widgetIds is empty', async () => {
    await action.onExecute({ type: MessageType.ButtonClick }, Immutable({ widgetIds: [], useDataSources: [] }))
    expect(dispatch).not.toHaveBeenCalled()
    expect(appActions.openWidgets).not.toHaveBeenCalled()
    expect(appActions.closeWidgets).not.toHaveBeenCalled()
  })

  it('should not call openWidgets or closeWidgets if DataRecordsSelectionChange and records is empty', async () => {
    const message = {
      type: MessageType.DataRecordsSelectionChange,
      records: []
    }
    await action.onExecute(message, Immutable({ widgetIds: ['w1'], useDataSources: [] }))
    expect(dispatch).not.toHaveBeenCalled()
    expect(appActions.openWidgets).not.toHaveBeenCalled()
    expect(appActions.closeWidgets).not.toHaveBeenCalled()
  })

  it('should not call openWidgets or closeWidgets if notTriggerData is true', async () => {
    const ds = {
      id: 'ds1',
      getMainDataSource: () => ({ id: 'main1' }),
      getRootDataSource: () => ({ id: 'root1' }),
      getAssociatedDataSource: () => ({ id: 'assoc1' })
    }
    const message = {
      type: MessageType.DataRecordsSelectionChange,
      records: [{ dataSource: ds }]
    }
    const actionConfig = Immutable({
      widgetIds: ['w1'],
      useDataSources: [{ dataSourceId: 'notmatch', mainDataSourceId: 'notmatch' }]
    })
    await action.onExecute(message, actionConfig)
    expect(dispatch).not.toHaveBeenCalled()
    expect(appActions.openWidgets).not.toHaveBeenCalled()
    expect(appActions.closeWidgets).not.toHaveBeenCalled()
  })

  it('should call openWidgets with all widgetIds if onlyOpenOne is false', async () => {
    state.appConfig.widgets.controller1.config.behavior.onlyOpenOne = false
    const actionConfig = Immutable({ widgetIds: ['w1', 'w2'], useDataSources: [] })
    await action.onExecute({ type: MessageType.ButtonClick }, actionConfig)
    expect(dispatch).toHaveBeenCalledWith(appActions.openWidgets(['w1', 'w2']))
    expect(appActions.openWidgets).toHaveBeenCalledWith(['w1', 'w2'])
    expect(appActions.closeWidgets).not.toHaveBeenCalled()
  })

  it('should call closeWidgets and openWidgets with only one widget if onlyOpenOne is true and multiple widgets are selected', async () => {
    state.appConfig.widgets.controller1.config.behavior.onlyOpenOne = true
    state.widgetsRuntimeInfo = {
      w1: { controllerWidgetId: 'controller1' },
      w2: { controllerWidgetId: 'controller1', state: 'OPENED' },
      w3: { controllerWidgetId: 'other' }
    }

    const actionConfig = Immutable({ widgetIds: ['w1', 'w2'], useDataSources: [] })
    await action.onExecute({ type: MessageType.ButtonClick }, actionConfig)
    expect(dispatch).toHaveBeenCalledWith(appActions.closeWidgets(['w2']))
    expect(dispatch).toHaveBeenCalledWith(appActions.openWidgets(['w1']))
    expect(appActions.closeWidgets).toHaveBeenCalledWith(['w2'])
    expect(appActions.openWidgets).toHaveBeenCalledWith(['w1'])
  })

  it('should call openWidgets if DataRecordsSelectionChange and trigger data matches', async () => {
    const ds = {
      id: 'ds1',
      getMainDataSource: () => ({ id: 'main1' }),
      getRootDataSource: () => ({ id: 'root1' }),
      getAssociatedDataSource: () => ({ id: 'assoc1' })
    }
    const message = {
      type: MessageType.DataRecordsSelectionChange,
      records: [{ dataSource: ds }]
    }
    const actionConfig = Immutable({
      widgetIds: ['w1'],
      useDataSources: [{ dataSourceId: 'ds1', mainDataSourceId: 'main1' }]
    })
    await action.onExecute(message, actionConfig)
    expect(dispatch).toHaveBeenCalledWith(appActions.openWidgets(['w1']))
    expect(appActions.openWidgets).toHaveBeenCalledWith(['w1'])
    expect(appActions.closeWidgets).not.toHaveBeenCalled()
  })
})