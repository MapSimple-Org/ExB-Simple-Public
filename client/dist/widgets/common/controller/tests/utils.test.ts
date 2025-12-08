import { Immutable } from 'jimu-core'
import { getGroupLabels, getNextGroupLabel } from '../src/runtime/builder/utils'

describe('Test utils', () => {
  it('get group labels should work', () => {
    const appConfig: any = Immutable({
      widgets: {
        w1: {
          id: 'w1',
          label: 'W1',
          manifest: { name: 'controller', properties: { hasEmbeddedLayout: true } },
          layouts: {
            controller: {
              LARGE: 'l1'
            }
          },
          config: {}
        },
        w2: {
          id: 'w2',
          label: 'Group 1',
          uri: 'widgets/layout/accordion/',
          manifest: { properties: {} }
        },
        w3: {
          id: 'w3',
          label: 'Group 2',
          uri: 'widgets/layout/accordion/',
          manifest: { properties: {} }
        }
      },
      layouts: {
        l1: {
          id: 'l1',
          order: ['0', '1'],
          content: {
            0: {
              type: 'WIDGET',
              widgetId: 'w2'
            },
            1: {
              type: 'WIDGET',
              widgetId: 'w3'
            }
          }
        }
      }
    })
    const controllerLayout = appConfig.layouts.l1
    const groupLabels = getGroupLabels(appConfig, controllerLayout)
    expect(groupLabels).toEqual(['Group 1', 'Group 2'])
  })
  it('get next group label should work', () => {
    const groupLabels = [null, undefined, 'abc', '123', 'abc 123', '123 abc', 'Group 1', 'Group x', '3 Group', 'Group 999']
    const nextGroupLabel = getNextGroupLabel(groupLabels, 'Group')
    expect(nextGroupLabel).toEqual('Group 1000')
  })
})
