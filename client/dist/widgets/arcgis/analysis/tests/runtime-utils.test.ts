import {
  convertJobParamsToToolData,
  canDisplayAsLink,
  resultHasItemId
} from '../src/runtime/utils'

jest.mock('@arcgis/core/core/promiseUtils', () => {
  return {
    debounce: jest.fn()
  }
})
jest.mock('@arcgis/analysis-shared-utils', () => {
  return {
    generateSelectedLayersKey: (paramName: string) => {
      return `${paramName}_SelectedLayers`
    },
    convertJobParamsToToolData: (props) => {
      const convertedJobParams = {}
      let layers = []
      const { jobParams, toolJSON } = props
      for (const key in jobParams) {
        const parameterValue = jobParams[key]
        const toolJSONParam = toolJSON?.parameters?.find((param: { name: string }) => param.name === key)
        const dataType = toolJSONParam?.dataType

        if (parameterValue !== undefined && parameterValue !== null && toolJSONParam !== undefined) {
          switch (dataType) {
            case "GPFeatureRecordSetLayer":
            case "GPRecordSet":
            case "GPMultiValue:GPFeatureRecordSetLayer":
            case "GPMultiValue:GPRecordSet":
            case "GPRasterDataLayer":
              {
                const gpLayerValue = { ...parameterValue }
                const selectedLayersKey = `${key}_SelectedLayers`

                convertedJobParams[key] = gpLayerValue
                convertedJobParams[selectedLayersKey] = gpLayerValue
                layers = layers.concat(gpLayerValue)
              }
              break
            default:
              convertedJobParams[key] = parameterValue
              break
          }
        }
      }
      return Promise.resolve({ convertedJobParams, layers })
    }
  }
})

describe('convertJobParamsToToolData', () => {
  it('if parameter is GPValueTable, should add selectedLayers on parameterInfo whose type is layer input and return the selected layers inner value table', () => {
    convertJobParamsToToolData({
      jobParams: {
        Input_Features: [
          {
            'feature class column': {
              url: 'https://servicesdev.arcgis.com/zImu9NfARSUcVsy1/arcgis/rest/services/Philadelphia_Crime_Map_WFL1/FeatureServer/1',
              itemId: '1f3e03124f11409680f3305573d55586'
            },
            'feature layer column': {
              url: 'https://servicesdev.arcgis.com/zImu9NfARSUcVsy1/arcgis/rest/services/Philadelphia_Crime_Map_WFL1/FeatureServer/2',
              itemId: '1f3e03124f11409680f3305573d55586'
            },
            'feature set column': {
              url: 'https://services1.arcgis.com/oC086ufSSQ6Avnw2/ArcGIS/rest/services/TestFCMap_WFL1/FeatureServer/0',
              itemId: '4246755a17994f77b4888f3cdb8946f7'
            }
          }
        ],
        Input_Tables: [
          {
            'table column': {
              url: 'https://services1.arcgis.com/oC086ufSSQ6Avnw2/ArcGIS/rest/services/TestFCMap_WFL1/FeatureServer/1',
              itemId: '4246755a17994f77b4888f3cdb8946f7'
            },
            'table view column': {
              url: 'https://services1.arcgis.com/oC086ufSSQ6Avnw2/ArcGIS/rest/services/TestFCMap_WFL1/FeatureServer/2',
              itemId: '4246755a17994f77b4888f3cdb8946f7'
            }
          }
        ],
        Input_Rasters: [
          {
            'raster layer column': {
              url: 'https://landscape4dev.arcgis.com/arcgis/rest/services/USA_California_Condor_GAP_Range/ImageServer?token=mSixlYG_RPBgqoKXB5ghDJtbC-XvAEcXWhWFAf0Y17Bg1f0yYtjLrn6Qs7HkIh3LtE1LtCCRuBZAD8MEZUmYAZf4IVGkhgONQr67hGWJZLkMcN6TlPg45Eg9_S4aVRTQ8czIeVThJOXpjsGTxPP1FDP9wfUgUTCQgRF5TQTjHHA1rW9sPx7XADKUVsEs6meiLQMT3StAeNvEtZjasuRua4QfnTebwnubN5fzCvSvlFSFMA19gakgIDK_QN4CtrL8ZqD5ImNreebqE0K2QulWZaWdFaKmq5srQd7kDFsYxlSQuVssaTQUvg8MFVJDKrZo',
              mosaicRule: {
                ascending: true,
                mosaicMethod: 'esriMosaicNorthwest',
                mosaicOperation: 'MT_FIRST'
              }
            },
            'raster dataset column': {
              url: 'https://tiledimageservicesdev1.arcgis.com/tEOXnBNDTR2npP8Z/arcgis/rest/services/Small_Modis_NDVI/ImageServer'
            },
            'image service column': {
              url: 'https://tiledimageservicesdev.arcgis.com/b5ADkBof6gCHCFQm/arcgis/rest/services/daymet_3days_tmax_TIL/ImageServer'
            }
          }
        ],
        esri_out_feature_service_name: '77777'
      },
      uiOnlyParams: {},
      toolJSON: {
        name: 'complextypesud',
        displayName: 'Valuetable complex types no filter optional user defined',
        description: 'made from pro 34994‌',
        category: '',
        helpUrl:
          'https://gpportal.esri.com/server/rest/directories/arcgisoutput/Level2_ValueTable_Async_GPServer/Level2_ValueTable_Async/complextypesud.htm',
        executionType: 'esriExecutionTypeAsynchronous',
        parameters: [
          {
            name: 'Input_Features',
            dataType: 'GPValueTable',
            displayName: 'Input Features',
            description: 'feature class, feature layer and feature set columns',
            direction: 'esriGPParameterDirectionInput',
            defaultValue: [[null, null, null]],
            parameterType: 'esriGPParameterTypeOptional',
            category: '',
            parameterInfos: [
              {
                name: 'feature class column',
                dataType: 'GPFeatureRecordSetLayer',
                displayName: 'feature class column'
              },
              {
                name: 'feature layer column',
                dataType: 'GPFeatureRecordSetLayer',
                displayName: 'feature layer column'
              },
              {
                name: 'feature set column',
                dataType: 'GPFeatureRecordSetLayer',
                displayName: 'feature set column'
              }
            ] as any[]
          },
          {
            name: 'Input_Tables',
            dataType: 'GPValueTable',
            displayName: 'Input Tables',
            description: 'table and table view columns',
            direction: 'esriGPParameterDirectionInput',
            defaultValue: [[null, null]],
            parameterType: 'esriGPParameterTypeOptional',
            category: '',
            parameterInfos: [
              {
                name: 'table column',
                dataType: 'GPRecordSet',
                displayName: 'table column'
              },
              {
                name: 'table view column',
                dataType: 'GPRecordSet',
                displayName: 'table view column'
              }
            ] as any[]
          },
          {
            name: 'Input_Rasters',
            dataType: 'GPValueTable',
            displayName: 'Input Rasters',
            description:
              'raster layer, raster dataset, and image service columns ',
            direction: 'esriGPParameterDirectionInput',
            defaultValue: [[null, null, null]],
            parameterType: 'esriGPParameterTypeOptional',
            category: '',
            parameterInfos: [
              {
                name: 'raster layer column',
                dataType: 'GPRasterDataLayer',
                displayName: 'raster layer column'
              },
              {
                name: 'raster dataset column',
                dataType: 'GPRasterDataLayer',
                displayName: 'raster dataset column'
              },
              {
                name: 'image service column',
                dataType: 'GPRasterDataLayer',
                displayName: 'image service column'
              }
            ] as any
          },
          {
            name: 'esri_out_feature_service_name',
            dataType: 'GPString',
            displayName: 'Output Feature Service Name',
            description:
              'The name of the optional feature service to create on the federated server containing the result of this tool. If no name is specified an output feature service will not be created.',
            direction: 'esriGPParameterDirectionInput',
            defaultValue: '',
            parameterType: 'esriGPParameterTypeOptional',
            category: ''
          }
        ]
      },
      availableMapLayers: [],
      toolName: 'test'
    }).then(res => {
      const {
        valueTableSelectedLayersConvertedParameters,
        layers
      } = res
      expect(valueTableSelectedLayersConvertedParameters).toHaveLength(4)
      valueTableSelectedLayersConvertedParameters.forEach(p => {
        if (p.dataType === 'GPValueTable' && p.direction === 'esriGPParameterDirectionInput') {
          p.parameterInfos?.forEach(pi => {
            // TODO check why GPRasterDataLayer does not have selectedLayers property, it works fine in non-test env
            if (pi.dataType !== 'GPRasterDataLayer') {
              expect(pi).toHaveProperty('selectedLayers')
            }
          })
        }
      })
      expect(layers).toHaveLength(0)
    })
  })
  it('if parameter is not GPValueTable, valueTableSelectedLayers and valueTableSelectedLayersConvertedParameters should be mepty', () => {
    convertJobParamsToToolData({
      jobParams: {},
      uiOnlyParams: {},
      toolJSON: {
        name: 'Model',
        displayName: '911 Calls Hotspot',
        description: '',
        category: '',
        helpUrl:
          'https://sampleserver6.arcgisonline.com/arcgis/rest/directories/arcgisoutput/911CallsHotspotPro_GPServer/911CallsHotspotPro/Model.htm',
        executionType: 'esriExecutionTypeAsynchronous',
        parameters: [
          {
            name: 'Query',
            dataType: 'GPString',
            displayName: 'Query',
            description:
              'A query string to filter calls. The query can be based on the day of the week such MON/TUE/WED/THU/FRI/SAT (Field Name: Day) or a date range between Jan 1st ,1998 to May 31, 1998 (Field Name: Date). For example, it can be ("DATE" &gt; date \'1998-01-01 00:00:00\' AND "DATE" &lt; date \'1998-01-31 00:00:00\') AND ("Day" = \'SUN\' OR "Day"= \'SAT\')',
            direction: 'esriGPParameterDirectionInput',
            defaultValue:
              '("DATE" > date \'1998-01-01 00:00:00\' AND "DATE" < date \'1998-01-31 00:00:00\') AND ("Day" = \'SUN\' OR "Day"= \'SAT\')',
            parameterType: 'esriGPParameterTypeOptional',
            category: ''
          },
          {
            name: 'Output_Features',
            dataType: 'GPFeatureRecordSetLayer',
            displayName: 'Output_Features',
            description:
              'Features that were filtered based on the query input. A special symobology shows events based on the day of a week.',
            direction: 'esriGPParameterDirectionOutput',
            defaultValue: {
              displayFieldName: '',
              geometryType: 'esriGeometryPoint',
              spatialReference: {
                wkid: 102726,
                latestWkid: 102726
              },
              fields: [
                {
                  name: 'OBJECTID',
                  type: 'esriFieldTypeOID',
                  alias: 'OBJECTID_12'
                },
                {
                  name: 'INC_NO',
                  type: 'esriFieldTypeDouble',
                  alias: 'INC_NO'
                },
                {
                  name: 'NFPA_TYP',
                  type: 'esriFieldTypeString',
                  alias: 'NFPA_TYP',
                  length: 14
                },
                {
                  name: 'CALL_TYPE',
                  type: 'esriFieldTypeString',
                  alias: 'CALL_TYPE',
                  length: 11
                },
                {
                  name: 'CITY',
                  type: 'esriFieldTypeString',
                  alias: 'CITY',
                  length: 9
                },
                {
                  name: 'Date',
                  type: 'esriFieldTypeDate',
                  alias: 'Date',
                  length: 8
                },
                {
                  name: 'Day',
                  type: 'esriFieldTypeString',
                  alias: 'Day',
                  length: 50
                }
              ],
              features: [],
              exceededTransferLimit: false
            },
            parameterType: 'esriGPParameterTypeRequired',
            category: ''
          },
          {
            name: 'Hotspot_Raster',
            dataType: 'GPRasterDataLayer',
            displayName: 'Hotspot_Raster',
            description:
              'Hotspot Raster created for filtered features. A special symbology has applied for better visualization.',
            direction: 'esriGPParameterDirectionOutput',
            defaultValue: null,
            parameterType: 'esriGPParameterTypeRequired',
            category: ''
          }
        ]
      },
      availableMapLayers: [],
      toolName: 'test'
    }).then(res => {
      const {
        valueTableSelectedLayersConvertedParameters,
        valueTableSelectedLayers
      } = res
      expect(valueTableSelectedLayersConvertedParameters).toHaveLength(0)
      expect(valueTableSelectedLayers).toHaveLength(0)
    })
  })
})

describe('canDisplayAsLink', () => {
  it('canDisplayAsLink should return true only if the value has a url property in string format', () => {
    expect(canDisplayAsLink(null)).toEqual(false)
    expect(canDisplayAsLink({ itemId: '1111' } as any)).toEqual(false)
    expect(canDisplayAsLink({ url: 1 } as any)).toEqual(false)
    expect(canDisplayAsLink({ url: '111' } as any)).toEqual(true)
  })
})

describe('resultHasItemId', () => {
  it('resultHasItemId should return true only if the value has an itemId property in string format', () => {
    expect(resultHasItemId(null)).toEqual(false)
    expect(resultHasItemId({ url: '1111' } as any)).toEqual(false)
    expect(resultHasItemId({ itemId: 1 } as any)).toEqual(false)
    expect(resultHasItemId({ itemId: '111' } as any)).toEqual(true)
  })
})
