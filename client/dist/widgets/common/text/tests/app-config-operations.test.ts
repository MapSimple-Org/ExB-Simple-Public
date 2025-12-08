import { getReplacedDataSource, mapExpressionForText, mapHtmlDataDsId, mapLinks, replaceExpressionDataSources, replaceLinkExpressionDataSources, replaceArcadeContentConfigDataSources } from '../src/tools/app-config-operations'

jest.mock('jimu-core', () => {
  const origin = jest.requireActual('jimu-core')
  return {
    ...origin,
    dataSourceUtils: {
      ...origin.dataSourceUtils,
      getSortedDataViewIds: (dsid: string) => {
        if (dsid.startsWith('dataSource_1-ChicagoCr_2518')) {
          return ['dataSource_1-ChicagoCr_2518', 'dataSource_1-ChicagoCr_2518-dataView_1', 'dataSource_1-ChicagoCr_2518-selection']
        } else if (dsid === 'widget_2_output_2') {
          return origin.dataSourceUtils.getSortedDataViewIds(dsid)
        }
      }
    }
  }
})

describe('app-config-operations utils', function () {
  it('mapHtmlDataDsId', () => {
    const dsIdMap = {
      widget_1_output: 'widget_2_output',
      widget_3_output: 'widget_4_output'
    }
    let html = '<exp data-uniqueid="foo" data-dsid="widget_1_output-output"></exp>'
    expect(mapHtmlDataDsId(html, dsIdMap)).toBe('<exp data-uniqueid="foo" data-dsid="widget_2_output-output"></exp>')
    html = '<exp data-uniqueid="foo" data-dsid="widget_1_output-output,widget_3_output-output"></exp>'
    expect(mapHtmlDataDsId(html, dsIdMap)).toBe('<exp data-uniqueid="foo" data-dsid="widget_2_output-output,widget_4_output-output"></exp>')

    html = '<a data-uniqueid="foo" data-dsid="widget_1_output-output"></a>'
    expect(mapHtmlDataDsId(html, dsIdMap)).toBe('<a data-uniqueid="foo" data-dsid="widget_2_output-output"></a>')
    html = '<a data-uniqueid="foo" data-dsid="widget_1_output-output,widget_3_output-output"></a>'
    expect(mapHtmlDataDsId(html, dsIdMap)).toBe('<a data-uniqueid="foo" data-dsid="widget_2_output-output,widget_4_output-output"></a>')

    html = '<exp data-uniqueid="foo">11</exp>'
    expect(mapHtmlDataDsId(html, dsIdMap)).toBe('<exp data-uniqueid="foo">11</exp>')
    html = '<a data-uniqueid="foo">11</a>'
    expect(mapHtmlDataDsId(html, dsIdMap)).toBe('<a data-uniqueid="foo">11</a>')
  })
  it('mapExpression', () => {
    const contentMap = {
      widget_27_output_2589222947362071: 'widget_42_output_1234567890',
      widget_1_output_1: 'widget_2_output_2'
    }
    let html = '<exp data-uniqueid="11" data-dsid="widget_27_output_2589222947362071-selection" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22widget_27_output_2589222947362071-selection%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp>'
    let output = mapExpressionForText(html, contentMap, null)
    expect(output).toBe('<exp data-uniqueid="11" data-dsid="widget_42_output_1234567890-selection" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22widget_42_output_1234567890-selection%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp>')

    html = '<p>hello<exp data-uniqueid="11" data-dsid="widget_27_output_2589222947362071-selection" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22widget_27_output_2589222947362071-selection%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp><exp data-uniqueid="22" data-dsid="widget_1_output_1-selection" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22widget_1_output_1-selection%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp>world</p>'
    output = mapExpressionForText(html, contentMap, null)
    expect(output).toBe('<p>hello<exp data-uniqueid="11" data-dsid="widget_42_output_1234567890-selection" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22widget_42_output_1234567890-selection%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp><exp data-uniqueid="22" data-dsid="widget_2_output_2-selection" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22widget_2_output_2-selection%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp>world</p>')
  })
  describe('mapLinks', () => {
    it('page and view', () => {
      let contentMap: { [x: string]: any } = {
        page_0: 'page_1',
        view_2: 'view_4'
      }

      const html = '<p>hello <a href="page_0,view_2" target="_self" data-uniqueid="foo" data-dsid="" data-link="%7B%22linkType%22%3A%22VIEW%22%2C%22value%22%3A%22page_0%2Cview_2%22%2C%22openType%22%3A%22_self%22%7D">test</a> world</p>'
      let output = mapLinks(html, contentMap, false, null)
      expect(output).toBe('<p>hello <a href="page_0,view_2" target="_self" data-uniqueid="foo" data-dsid="" data-link="%7B%22linkType%22%3A%22VIEW%22%2C%22value%22%3A%22page_1%2Cview_4%22%2C%22openType%22%3A%22_self%22%7D">test</a> world</p>')
      contentMap = {
        page_1: 'page_2',
        view_4: 'view_7'
      }
      output = mapLinks(output, contentMap, false, null)
      expect(output).toBe('<p>hello <a href="page_0,view_2" target="_self" data-uniqueid="foo" data-dsid="" data-link="%7B%22linkType%22%3A%22VIEW%22%2C%22value%22%3A%22page_2%2Cview_7%22%2C%22openType%22%3A%22_self%22%7D">test</a> world</p>')
    })
    it('with expression', () => {
      const contentMap: { [x: string]: any } = {
        page_0: 'page_1',
        view_2: 'view_4',
        'widget_4_output': 'widget_6_output'
      }
      const html = '<p>hello <a href="page_0,view_2" target="_self" data-uniqueid="foo" data-dsid="" data-link="%7B%22linkType%22%3A%22VIEW%22%2C%22value%22%3A%22page_0%2Cview_2%22%2C%22openType%22%3A%22_self%22%7D">test</a> world <a href="" target="_blank" data-uniqueid="bar" data-dsid="widget_4_output-output,dataSource_1-ChicagoCr_2518" data-link="%7B%22linkType%22%3A%22WEB_ADDRESS%22%2C%22openType%22%3A%22_blank%22%2C%22value%22%3A%22%22%2C%22expression%22%3A%7B%22name%22%3A%22Expression%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22STRING%22%2C%22exp%22%3A%22%5C%22https%3A%2F%2F%5C%22%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22%2B%22%7D%2C%7B%22type%22%3A%22FUNCTION%22%2C%22exp%22%3A%22COUNT%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22(%22%7D%2C%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BOBJECTID%7D%22%2C%22dataSourceId%22%3A%22widget_4_output-selection%22%2C%22jimuFieldName%22%3A%22__outputid__%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22)%22%7D%5D%7D%7D">link</a></p>'
      const output = mapLinks(html, contentMap, true, null)
      expect(output).toBe('<p>hello <a href="page_0,view_2" target="_self" data-uniqueid="foo" data-dsid="" data-link="%7B%22linkType%22%3A%22VIEW%22%2C%22value%22%3A%22page_1%2Cview_4%22%2C%22openType%22%3A%22_self%22%7D">test</a> world <a href="" target="_blank" data-uniqueid="bar" data-dsid="widget_6_output-output,dataSource_1-ChicagoCr_2518" data-link="%7B%22linkType%22%3A%22WEB_ADDRESS%22%2C%22openType%22%3A%22_blank%22%2C%22value%22%3A%22%22%2C%22expression%22%3A%7B%22name%22%3A%22Expression%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22STRING%22%2C%22exp%22%3A%22%5C%22https%3A%2F%2F%5C%22%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22%2B%22%7D%2C%7B%22type%22%3A%22FUNCTION%22%2C%22exp%22%3A%22COUNT%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22(%22%7D%2C%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BOBJECTID%7D%22%2C%22dataSourceId%22%3A%22widget_6_output-selection%22%2C%22jimuFieldName%22%3A%22__outputid__%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22)%22%7D%5D%7D%7D">link</a></p>')
    })
  })

  it('getReplacedDataSource', () => {
    let expressionUseDataSources = ['dataSource_1-ChicagoCr_2518']
    let prevDataSources = ['dataSource_1-ChicagoCr_2518']
    let useDataSources = ['dataSource_1-ChicagoCr_2518', 'dataSource_1-ChicagoCr_2518-dataView_1']
    let ret = getReplacedDataSource(expressionUseDataSources, useDataSources, prevDataSources)
    expect(ret).toBe(null)
    expressionUseDataSources = useDataSources
    prevDataSources = ['dataSource_1-ChicagoCr_2518', 'dataSource_1-ChicagoCr_2518-dataView_1']
    useDataSources = ['dataSource_1-ChicagoCr_2518-dataView_1']
    ret = getReplacedDataSource(expressionUseDataSources, useDataSources, prevDataSources)
    expect(ret).toEqual(["dataSource_1-ChicagoCr_2518", "dataSource_1-ChicagoCr_2518-dataView_1"])
    expressionUseDataSources = useDataSources
    prevDataSources = ['dataSource_1-ChicagoCr_2518-dataView_1']
    useDataSources = ['dataSource_1-ChicagoCr_2518-dataView_1', 'dataSource_1-ChicagoCr_2518-selection']
    ret = getReplacedDataSource(expressionUseDataSources, useDataSources, prevDataSources)
    expect(ret).toBe(null)
    expressionUseDataSources = useDataSources
    prevDataSources = ['dataSource_1-ChicagoCr_2518-dataView_1', 'dataSource_1-ChicagoCr_2518-selection']
    useDataSources = ['dataSource_1-ChicagoCr_2518-selection']
    ret = getReplacedDataSource(expressionUseDataSources, useDataSources, prevDataSources)
    expect(ret).toEqual(["dataSource_1-ChicagoCr_2518-dataView_1", "dataSource_1-ChicagoCr_2518-selection"])
    //for selection view
    expressionUseDataSources = ['dataSource_1-ChicagoCr_2518-selection']
    prevDataSources = ['dataSource_1-ChicagoCr_2518']
    useDataSources = ['dataSource_1-ChicagoCr_2518', 'dataSource_1-ChicagoCr_2518-dataView_1']
    ret = getReplacedDataSource(expressionUseDataSources, useDataSources, prevDataSources)
    expect(ret).toBe(null)

    expressionUseDataSources = ['dataSource_1-ChicagoCr_2518-selection']
    prevDataSources = ['dataSource_1-ChicagoCr_2518-selection', 'dataSource_1-ChicagoCr_2518-dataView_1']
    useDataSources = ['dataSource_1-ChicagoCr_2518-dataView_1']
    ret = getReplacedDataSource(expressionUseDataSources, useDataSources, prevDataSources)
    expect(ret).toEqual(["dataSource_1-ChicagoCr_2518-selection", "dataSource_1-ChicagoCr_2518-dataView_1"])
  })

  it('replaceExpressionDataSources', () => {
    const replacedDataSources: { [uniqueid: string]: [string, string] } = {
      foo: ['dataSource_1-ChicagoCr_2518', 'dataSource_1-ChicagoCr_2518-dataView_1'],
      bar: ['dataSource_1-ChicagoCr_2518', 'dataSource_1-ChicagoCr_2518-dataView_1'],
      baz: ['dataSource_1-ChicagoCr_2518-dataView_1', 'dataSource_1-ChicagoCr_2518-selection']
    }
    let html = '<exp data-uniqueid="foo" data-dsid="dataSource_1-ChicagoCr_2518" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22dataSource_1-ChicagoCr_2518%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp>'
    let output = replaceExpressionDataSources(html, replacedDataSources, 'test', null)
    expect(output).toBe('<exp data-uniqueid="foo" data-dsid="dataSource_1-ChicagoCr_2518-dataView_1" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22dataSource_1-ChicagoCr_2518-dataView_1%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp>')

    html = '<p>hello<exp data-uniqueid="bar" data-dsid="dataSource_1-ChicagoCr_2518" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22dataSource_1-ChicagoCr_2518%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp><exp data-uniqueid="baz" data-dsid="dataSource_1-ChicagoCr_2518-dataView_1" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22dataSource_1-ChicagoCr_2518-dataView_1%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp>world</p>'
    output = replaceExpressionDataSources(html, replacedDataSources, 'test', null)
    expect(output).toBe('<p>hello<exp data-uniqueid="bar" data-dsid="dataSource_1-ChicagoCr_2518-dataView_1" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22dataSource_1-ChicagoCr_2518-dataView_1%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp><exp data-uniqueid="baz" data-dsid="dataSource_1-ChicagoCr_2518-selection" data-expression="%7B%22name%22%3A%22%7BFID%7D%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BFID%7D%22%2C%22dataSourceId%22%3A%22dataSource_1-ChicagoCr_2518-selection%22%2C%22jimuFieldName%22%3A%22FID%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%5D%7D"></exp>world</p>')
  })

  it('replaceLinkExpressionDataSources', () => {
    const replacedDataSources: { [uniqueid: string]: [string, string] } = {
      foo: ['dataSource_1-ChicagoCr_2518', 'dataSource_1-ChicagoCr_2518-dataView_1'],
      bar: ['dataSource_1-ChicagoCr_2518', 'dataSource_1-ChicagoCr_2518-dataView_1'],
    }
    const html = '<p>hello <a href="" target="_blank" data-uniqueid="foo" data-dsid="widget_4_output-output,dataSource_1-ChicagoCr_2518" data-link="%7B%22linkType%22%3A%22WEB_ADDRESS%22%2C%22openType%22%3A%22_blank%22%2C%22value%22%3A%22%22%2C%22expression%22%3A%7B%22name%22%3A%22Expression%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22STRING%22%2C%22exp%22%3A%22%5C%22https%3A%2F%2F%5C%22%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22%2B%22%7D%2C%7B%22type%22%3A%22FUNCTION%22%2C%22exp%22%3A%22COUNT%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22(%22%7D%2C%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BOBJECTID%7D%22%2C%22dataSourceId%22%3A%22dataSource_1-ChicagoCr_2518%22%2C%22jimuFieldName%22%3A%22__outputid__%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22)%22%7D%5D%7D%7D">link</a> world <a href="" target="_blank" data-uniqueid="bar" data-dsid="widget_4_output-output,dataSource_1-ChicagoCr_2518" data-link="%7B%22linkType%22%3A%22WEB_ADDRESS%22%2C%22openType%22%3A%22_blank%22%2C%22value%22%3A%22%22%2C%22expression%22%3A%7B%22name%22%3A%22Expression%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22STRING%22%2C%22exp%22%3A%22%5C%22https%3A%2F%2F%5C%22%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22%2B%22%7D%2C%7B%22type%22%3A%22FUNCTION%22%2C%22exp%22%3A%22COUNT%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22(%22%7D%2C%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BOBJECTID%7D%22%2C%22dataSourceId%22%3A%22dataSource_1-ChicagoCr_2518%22%2C%22jimuFieldName%22%3A%22__outputid__%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22)%22%7D%5D%7D%7D">link</a></p>'
    const output = replaceLinkExpressionDataSources(html, replacedDataSources, 'test', null)
    expect(output).toBe('<p>hello <a href="" target="_blank" data-uniqueid="foo" data-dsid="widget_4_output-output,dataSource_1-ChicagoCr_2518-dataView_1" data-link="%7B%22linkType%22%3A%22WEB_ADDRESS%22%2C%22openType%22%3A%22_blank%22%2C%22value%22%3A%22%22%2C%22expression%22%3A%7B%22name%22%3A%22Expression%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22STRING%22%2C%22exp%22%3A%22%5C%22https%3A%2F%2F%5C%22%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22%2B%22%7D%2C%7B%22type%22%3A%22FUNCTION%22%2C%22exp%22%3A%22COUNT%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22(%22%7D%2C%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BOBJECTID%7D%22%2C%22dataSourceId%22%3A%22dataSource_1-ChicagoCr_2518-dataView_1%22%2C%22jimuFieldName%22%3A%22__outputid__%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22)%22%7D%5D%7D%7D">link</a> world <a href="" target="_blank" data-uniqueid="bar" data-dsid="widget_4_output-output,dataSource_1-ChicagoCr_2518-dataView_1" data-link="%7B%22linkType%22%3A%22WEB_ADDRESS%22%2C%22openType%22%3A%22_blank%22%2C%22value%22%3A%22%22%2C%22expression%22%3A%7B%22name%22%3A%22Expression%22%2C%22parts%22%3A%5B%7B%22type%22%3A%22STRING%22%2C%22exp%22%3A%22%5C%22https%3A%2F%2F%5C%22%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22%2B%22%7D%2C%7B%22type%22%3A%22FUNCTION%22%2C%22exp%22%3A%22COUNT%22%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22(%22%7D%2C%7B%22type%22%3A%22FIELD%22%2C%22exp%22%3A%22%7BOBJECTID%7D%22%2C%22dataSourceId%22%3A%22dataSource_1-ChicagoCr_2518-dataView_1%22%2C%22jimuFieldName%22%3A%22__outputid__%22%2C%22isFromRepeatedDataSourceContext%22%3Afalse%7D%2C%7B%22type%22%3A%22OPERATOR%22%2C%22exp%22%3A%22)%22%7D%5D%7D%7D">link</a></p>')
  })

  it('replaceArcadeContentConfigDataSources only updates useDataSources when script references changed ds ids', () => {
    const encode = (cfg) => encodeURIComponent(JSON.stringify(cfg))

    let baseArcadeConfig = {
      id: 'arc1',
      scriptContent: 'return FeatureSetById("dataSource_1-ChicagoCr_2518", "layer")',
      useDataSources: [{ dataSourceId: 'dataSource_1-ChicagoCr_2518', mainDataSourceId: 'dataSource_1-ChicagoCr_2518' }]
    }
    let oldUseDataSources: any = [{ dataSourceId: 'dataSource_1-ChicagoCr_2518', mainDataSourceId: 'dataSource_1-ChicagoCr_2518' }]
    let newUseDataSources: any = [{ dataSourceId: 'dataSource_1-ChicagoCr_2518-dataView_1', mainDataSourceId: 'dataSource_1-ChicagoCr_2518' }]
    let html = `<p><arcade data-uniqueid="arc1" data-arcade="${encode(baseArcadeConfig)}"></arcade></p>`
    let output = replaceArcadeContentConfigDataSources(html, 'widgetX', oldUseDataSources, newUseDataSources)
    let expected = {
      ...baseArcadeConfig,
      useDataSources: []
      // script stays same, only useDataSources updated
    }
    expect(output).toBe(`<p><arcade data-uniqueid="arc1" data-arcade="${encode(expected)}"></arcade></p>`)

    baseArcadeConfig = {
      id: 'arc2',
      scriptContent: 'FeatureSetById("dataSource_2", "layer") + FeatureSetById("dataSource_2_view1", "layer")',
      useDataSources: [
        { dataSourceId: 'dataSource_2', mainDataSourceId: 'dataSource_2' },
        { dataSourceId: 'dataSource_2_view1', mainDataSourceId: 'dataSource_2' }
      ]
    }
    oldUseDataSources = [
      { dataSourceId: 'dataSource_2', mainDataSourceId: 'dataSource_2' },
      { dataSourceId: 'dataSource_2_view1', mainDataSourceId: 'dataSource_2' }
    ]
    newUseDataSources = [
      { dataSourceId: 'dataSource_2_view1', mainDataSourceId: 'dataSource_2' }
    ]
    html = `<p><arcade data-uniqueid="arc4" data-arcade="${encode(baseArcadeConfig)}"></arcade></p>`
    output = replaceArcadeContentConfigDataSources(html, 'widgetX', oldUseDataSources, newUseDataSources)
    expected = {
      ...baseArcadeConfig,
      useDataSources: newUseDataSources
    }
    expect(output).toBe(`<p><arcade data-uniqueid="arc4" data-arcade="${encode(expected)}"></arcade></p>`)
  })

})
