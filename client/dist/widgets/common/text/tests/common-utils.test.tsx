import { Delta } from 'jimu-ui/advanced/rich-text-editor'
import { hasSameDataSourceFields, normalizeLineSpace, replacePlaceholderTextContent } from '../src/utils'
import { ZeroWidthSpace } from '../src/consts'
import { Immutable, type ImmutableArray, type UseDataSource } from 'jimu-core'

describe('common utils test', function () {
  it('replacePlaceholderTextContent', () => {
    expect(replacePlaceholderTextContent('<strong>foo</strong>', ZeroWidthSpace)).toBe('<strong>\uFEFF</strong>')
    expect(replacePlaceholderTextContent('foo', ZeroWidthSpace)).toBe('\uFEFF')
  })

  it('normalizeLineSpace', () => {
    let delta = new Delta({
      ops: [{
        insert: 'text',
        attributes: {
          linespace: 'normal'
        }
      }]
    })
    expect(normalizeLineSpace(null, delta).ops).toEqual([{
      insert: 'text',
      attributes: {
        linespace: 1.5
      }
    }]
    )
    delta = new Delta({
      ops: [{
        insert: 'text',
        attributes: {
          linespace: '1.2'
        }
      }]
    })
    expect(normalizeLineSpace(null, delta).ops).toEqual([{
      insert: 'text',
      attributes: {
        linespace: '1.2'
      }
    }]
    )
    delta = new Delta({
      ops: [{
        insert: 'text',
        attributes: {
          linespace: 1
        }
      }]
    })
    expect(normalizeLineSpace(null, delta).ops).toEqual([{
      insert: 'text',
      attributes: {
        linespace: 1
      }
    }]
    )
  })

  it('hasSameDataSourceFields', () => {
    let uds1: ImmutableArray<UseDataSource> = Immutable([
      {
        dataSourceId: 'dataSource_1-Census_9259',
        mainDataSourceId: 'dataSource_1-Census_9259',
        rootDataSourceId: 'dataSource_1'
      },
      {
        dataSourceId: 'dataSource_1-USA_4067',
        mainDataSourceId: 'dataSource_1-USA_4067',
        rootDataSourceId: 'dataSource_1'
      }
    ])
    let uds2: ImmutableArray<UseDataSource> = Immutable([
      {
        dataSourceId: "dataSource_1-Census_9259",
        mainDataSourceId: "dataSource_1-Census_9259",
        rootDataSourceId: "dataSource_1",
        fields: [
          "STATE_NAME"
        ]
      },
      {
        dataSourceId: "dataSource_1-USA_4067",
        mainDataSourceId: "dataSource_1-USA_4067",
        rootDataSourceId: "dataSource_1",
        fields: [
          "pop2000"
        ]
      }
    ])
    expect(hasSameDataSourceFields(uds1, uds2)).toBe(false)
    uds1 = Immutable([
      {
        dataSourceId: 'dataSource_1-Census_9259',
        mainDataSourceId: 'dataSource_1-Census_9259',
        rootDataSourceId: 'dataSource_1'
      },
      {
        dataSourceId: 'dataSource_1-USA_4067',
        mainDataSourceId: 'dataSource_1-USA_4067',
        rootDataSourceId: 'dataSource_1'
      }
    ])
    uds2 = Immutable([
      {
        dataSourceId: "dataSource_1-Census_9259",
        mainDataSourceId: "dataSource_1-Census_9259",
        rootDataSourceId: "dataSource_1",
      },
      {
        dataSourceId: "dataSource_1-USA_4067",
        mainDataSourceId: "dataSource_1-USA_4067",
        rootDataSourceId: "dataSource_1",
      }
    ])
    expect(hasSameDataSourceFields(uds1, uds2)).toBe(true)
    uds1 = Immutable([
      {
        dataSourceId: 'dataSource_1-Census_9259',
        mainDataSourceId: 'dataSource_1-Census_9259',
        rootDataSourceId: 'dataSource_1',
        fields: []
      },
      {
        dataSourceId: 'dataSource_1-USA_4067',
        mainDataSourceId: 'dataSource_1-USA_4067',
        rootDataSourceId: 'dataSource_1',
        fields: []
      }
    ])
    uds2 = Immutable([
      {
        dataSourceId: "dataSource_1-Census_9259",
        mainDataSourceId: "dataSource_1-Census_9259",
        rootDataSourceId: "dataSource_1",
      },
      {
        dataSourceId: "dataSource_1-USA_4067",
        mainDataSourceId: "dataSource_1-USA_4067",
        rootDataSourceId: "dataSource_1",
      }
    ])
    expect(hasSameDataSourceFields(uds1, uds2)).toBe(true)
    uds1 = Immutable([
      {
        dataSourceId: 'dataSource_1-Census_9259',
        mainDataSourceId: 'dataSource_1-Census_9259',
        rootDataSourceId: 'dataSource_1',
        fields: []
      },
      {
        dataSourceId: 'dataSource_1-USA_4067',
        mainDataSourceId: 'dataSource_1-USA_4067',
        rootDataSourceId: 'dataSource_1',
        fields: []
      }
    ])
    uds2 = Immutable([
      {
        dataSourceId: "dataSource_1-Census_9259",
        mainDataSourceId: "dataSource_1-Census_9259",
        rootDataSourceId: "dataSource_1",
        fields: []
      },
      {
        dataSourceId: "dataSource_1-USA_4067",
        mainDataSourceId: "dataSource_1-USA_4067",
        rootDataSourceId: "dataSource_1",
        fields: []
      }
    ])
    expect(hasSameDataSourceFields(uds1, uds2)).toBe(true)
  })
})
