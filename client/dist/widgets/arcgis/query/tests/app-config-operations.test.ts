import { Immutable } from 'jimu-core'
import AppConfigOperations from '../src/tools/app-config-operations'

const ext = new AppConfigOperations()

describe('app config operations test', () => {
  it('query widget with map in config', () => {
    let appConfig: any = Immutable({
      widgets: {
        w1: {
          id: 'w1',
          label: 'W1',
          config: {
            queryItems: [
              { name: 'q1', spatialMapWidgetIds: ['map1', 'map2'] },
              { name: 'q2' }
            ]
          }
        },
        w2: { manifest: { properties: {} } },
        w3: { manifest: { properties: {} } }
      }
    })

    const copiedWidget: any = Immutable({
      id: 'w4',
      label: 'W4',
      config: {
        queryItems: [
          { name: 'q1', spatialMapWidgetIds: ['map1', 'map2'] },
          { name: 'q2' }
        ]
      }
    })

    appConfig = appConfig
      .setIn(['widgets', 'w4'], copiedWidget)

    appConfig = ext.afterWidgetCopied('w1', appConfig, 'w4', copiedWidget, { map1: 'map3', map2: 'map4' })
    const w4 = appConfig.widgets.w4
    expect(w4.config.queryItems[0].spatialMapWidgetIds).toEqual(['map3', 'map4'])
  })
})
