import { depthTraversalProcessingValue, filterHistoryItemMessages, resultValueIsFeatureSet, setValueToResultById } from '../src/utils/util'
import { MessageLevel, ToolType } from '../src/config'

jest.mock('@arcgis/core/core/promiseUtils', () => {
  return {
    debounce: jest.fn()
  }
})

jest.mock('@arcgis/analysis-shared-utils', () => {
  return {
    convertEsriMessageType: (messageType: string | nullish): string | nullish => {
      let type: string | nullish = ""
      switch (messageType) {
        case "esriJobMessageTypeInformative":
          type = "informative"
          break
        case "esriJobMessageTypeError":
          type = "error"
          break
        case "esriJobMessageTypeWarning":
          type = "warning"
          break
        case "error":
        case "informative":
        case "warning":
        default:
          type = messageType
          break
      }
      return type
    }
  }
})
describe('filterHistoryItemMessages', () => {
  it('should return empty array if message is undefined or null or empty array', () => {
    expect(filterHistoryItemMessages(undefined, ToolType.Standard)).toHaveLength(0)
    expect(filterHistoryItemMessages(null, ToolType.Custom)).toHaveLength(0)
    expect(filterHistoryItemMessages([], ToolType.Standard)).toHaveLength(0)
  })
  it('if standard tool, should only return credit cost messages and translatable messages whose type is warning or error', () => {
    expect(filterHistoryItemMessages([
      {
        type: 'esriJobMessageTypeInformative',
        description: 'informative'
      }, {
        type: 'esriJobMessageTypeWarning',
        description: '{\"cost\": 3.139}'
      }, {
        type: 'esriJobMessageTypeError',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }, {
        type: 'esriJobMessageTypeError',
        description: '1111'
      }, {
        type: 'error',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }
    ] as any, ToolType.Standard)).toEqual([
      {
        type: 'warning',
        description: '{\"cost\": 3.139}'
      }, {
        type: 'error',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }, {
        type: 'error',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }
    ])
  })
  const customToolMessages = [
    {
      type: 'esriJobMessageTypeInformative',
      description: 'informative'
    }, {
      type: 'esriJobMessageTypeWarning',
      description: '111'
    }, {
      type: 'esriJobMessageTypeError',
      description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
    }, {
      type: 'esriJobMessageTypeError',
      description: '1111'
    }, {
      type: 'error',
      description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
    }
  ] as any[]
  it('if custom tool and message level is not set, should return all warning and error messages', () => {
    expect(filterHistoryItemMessages(customToolMessages, ToolType.Custom)).toEqual([
      {
        type: 'warning',
        description: '111'
      }, {
        type: 'error',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }, {
        type: 'error',
        description: '1111'
      }, {
        type: 'error',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }
    ])
  })
  it('should not throw error if message description is boolean, number, string or null', () => {
    expect(filterHistoryItemMessages([
      {
        type: 'esriJobMessageTypeInformative',
        description: 'true'
      }, {
        type: 'esriJobMessageTypeWarning',
        description: '111'
      }, {
        type: 'esriJobMessageTypeError',
        description: 'abc'
      }, {
        type: 'error',
        description: 'null'
      }
    ] as any, ToolType.Custom)).toEqual([
      {
        type: 'warning',
        description: '111'
      }, {
        type: 'error',
        description: 'abc'
      }, {
        type: 'error',
        description: 'null'
      }
    ])
  })
  it('if set message level to "None" in custom tool, should return empty array', () => {
    expect(filterHistoryItemMessages(customToolMessages, ToolType.Custom, MessageLevel.None)).toEqual([])
  })
  it('if set message level to "Error" in custom tool, should return error messages only', () => {
    expect(filterHistoryItemMessages(customToolMessages as any, ToolType.Custom, MessageLevel.Error)).toEqual([
      {
        type: 'error',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }, {
        type: 'error',
        description: '1111'
      }, {
        type: 'error',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }
    ])
  })
  it('if set message level to "Warning" in custom tool, should return all warning and error messages', () => {
    expect(filterHistoryItemMessages(customToolMessages, ToolType.Custom, MessageLevel.Warning)).toEqual([
      {
        type: 'warning',
        description: '111'
      },
      {
        type: 'error',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }, {
        type: 'error',
        description: '1111'
      }, {
        type: 'error',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }
    ])
  })
  it('if set message level to "Info" in custom tool, should return all messages', () => {
    expect(filterHistoryItemMessages(customToolMessages, ToolType.Custom, MessageLevel.Info)).toEqual([
      {
        type: 'informative',
        description: 'informative'
      }, {
        type: 'warning',
        description: '111'
      }, {
        type: 'error',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }, {
        type: 'error',
        description: '1111'
      }, {
        type: 'error',
        description: '{"messageCode": "AO_1571", "message": "The analysis options you selected require a minimum of 30 features with valid data in the analysis field in order to compute hot and cold spots.", "params": {"minNumFeatures": "30"}}'
      }
    ])
  })
})

describe('setValueToResultById', () => {
  it('should update value directly if the id only have one index key', () => {
    const result = {
      dataType: 'boolean',
      paramName: 'testParamName',
      value: false
    } as __esri.ParameterValue
    setValueToResultById('1', result, true)
    expect(result.value).toEqual(true)
  })
  it('should update the correct item in array value', () => {
    const result = {
      dataType: 'multi-value',
      paramName: 'testParamName',
      value: [1, 2, 3, 4, 5]
    } as unknown as __esri.ParameterValue
    setValueToResultById('0-2', result, 9)
    expect(result.value).toEqual([1, 2, 9, 4, 5])
  })
  it('should update the correct item in two-dimensional array', () => {
    const result = {
      dataType: 'multi-value',
      paramName: 'testParamName',
      value: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ] as unknown
    } as unknown as __esri.ParameterValue
    setValueToResultById('0-1-2', result, 33)
    expect(result.value).toEqual([
      [1, 2, 3],
      [4, 5, 33],
      [7, 8, 9]
    ])
  })
})

describe('resultValueIsFeatureSet', () => {
  it('resultValueIsFeatureSet should return true only if the value has a features property in array format', () => {
    expect(resultValueIsFeatureSet(null)).toEqual(false)
    expect(resultValueIsFeatureSet({ a: 1 } as any)).toEqual(false)
    expect(resultValueIsFeatureSet({ features: 'features' } as any)).toEqual(false)
    expect(resultValueIsFeatureSet({ features: [] } as any)).toEqual(true)
  })
})

describe('depthTraversalProcessingValue', () => {
  it('value is non-array', () => {
    const valueById = {}
    const callback = (id: string, value: __esri.ParameterValue['value']) => {
      valueById[id] = value
    }
    depthTraversalProcessingValue(3, '1', callback)
    expect(valueById).toEqual({ 1: 3 })
  })
  it('value is one-dimensional array', () => {
    const valueById = {}
    const callback = (id: string, value: __esri.ParameterValue['value']) => {
      valueById[id] = value
    }
    depthTraversalProcessingValue([4, 5, 6], '0', callback)
    expect(valueById).toEqual({
      '0-0': 4,
      '0-1': 5,
      '0-2': 6
    })
  })
  it('value is two-dimensional array', () => {
    const valueById = {}
    const callback = (id: string, value: __esri.ParameterValue['value']) => {
      valueById[id] = value
    }
    depthTraversalProcessingValue([[{ a: 1 }, { b: 2 }], [{ c: 3 }, { d: 4 }]] as any, '2', callback)
    expect(valueById).toEqual({
      '2-0-0': { a: 1 },
      '2-0-1': { b: 2 },
      '2-1-0': { c: 3 },
      '2-1-1': { d: 4 }
    })
  })
})
