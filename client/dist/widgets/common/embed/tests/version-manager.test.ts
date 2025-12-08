import { Immutable } from 'jimu-core'
import { versionManager } from '../src/version-manager'
import { EmbedType } from '../src/config'
import { withEmptyExp, withoutEmptyExp } from './expression-const'

let upgrader = null

jest.mock('jimu-core', () => {
  return {
    ...jest.requireActual('jimu-core'),
    utils: {
      getUUID: jest.fn(() => 'e2f5')
    }
  }
})

describe('Test embed version-manager for version 1.4.0', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-find
    upgrader = versionManager.versions?.filter(function (version) {
      return version.version === '1.4.0'
    })[0]?.upgrader
  })

  it('should return new config', () => {
    const oldConfig = Immutable({
      embedType: EmbedType.Url,
      embedCode: '',
      staticUrl: '',
      expression: {
        name: 'Expression 1',
        parts: [{
          dataSourceId: 'ds_9212',
          exp: '{OBJECTID}',
          isFromRepeatedDataSourceContext: false,
          jimuFieldName: 'OBJECTID',
          type: 'FIELD'
        }, {
          exp: '+',
          type: 'OPERATOR'
        }, {
          exp: '666',
          type: 'NUMBER'
        }, {
          exp: '+',
          type: 'OPERATOR'
        }, {
          exp: '"search"',
          type: 'STRING'
        }]
      },
      autoRefresh: false,
      autoInterval: 10
    })
    const newConfig = upgrader(oldConfig)
    expect(newConfig).toMatchSnapshot()
  })
})

describe('Test embed version-manager for version 1.7.0', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-find
    upgrader = versionManager.versions?.filter(function (version) {
      return version.version === '1.7.0'
    })[0]?.upgrader
  })

  it('remove empty tag of expression', () => {
    const oldConfig = Immutable({
      embedType: EmbedType.Url,
      expression: withEmptyExp,
      autoRefresh: false,
      autoInterval: 10
    })
    const newConfig = upgrader(oldConfig)
    expect(newConfig.expression).toBe(withoutEmptyExp)
  })
})
