
const URL =
  'https://servicesdev.arcgis.com/f126c8da131543019b05e4bfab6fc6ac/arcgis/rest/services/ChicagoCr/FeatureServer/0'

export const SimpleFeatureService = {
  url: URL,
  serverInfo: {
    currentVersion: 10.81,
    fullVersion: '10.8.1',
    soapUrl:
      'https://servicesdev.arcgis.com/f126c8da131543019b05e4bfab6fc6ac/arcgis/rest/services',
    secureSoapUrl:
      'https://servicesdev.arcgis.com/f126c8da131543019b05e4bfab6fc6ac/arcgis/rest/services',
    authInfo: {
      isTokenBasedSecurity: true,
      tokenServicesUrl:
        'https://servicesdev.arcgis.com/f126c8da131543019b05e4bfab6fc6ac/arcgis/tokens/',
      shortLivedTokenValidity: 60
    }
  },
  layerDefinition: {
    currentVersion: 10.81,
    id: 0,
    name: 'ChicagoCr',
    type: 'Feature Layer',
    serviceItemId: '137b61bec53f465784e5853976256eea',
    displayField: '',
    description: '',
    copyrightText: '',
    defaultVisibility: true,
    editingInfo: {
      lastEditDate: 1551741856640
    },
    relationships: [],
    isDataVersioned: false,
    supportsAppend: true,
    supportsCalculate: true,
    supportsASyncCalculate: true,
    supportsTruncate: true,
    supportsAttachmentsByUploadId: true,
    supportsAttachmentsResizing: true,
    supportsRollbackOnFailureParameter: true,
    supportsStatistics: true,
    supportsExceedsLimitStatistics: true,
    supportsAdvancedQueries: true,
    supportsValidateSql: true,
    supportsCoordinatesQuantization: true,
    'supportsLayerOverrides ': true,
    'supportsTilesAndBasicQueriesMode ': true,
    supportsFieldDescriptionProperty: true,
    supportsQuantizationEditMode: true,
    supportsApplyEditsWithGlobalIds: false,
    supportsReturningQueryGeometry: true,
    advancedQueryCapabilities: {
      supportsPagination: true,
      supportsPaginationOnAggregatedQueries: true,
      supportsQueryRelatedPagination: true,
      supportsQueryWithDistance: true,
      supportsReturningQueryExtent: true,
      supportsStatistics: true,
      supportsOrderBy: true,
      supportsDistinct: true,
      supportsQueryWithResultType: true,
      supportsSqlExpression: true,
      supportsAdvancedQueryRelated: true,
      supportsCountDistinct: true,
      supportsPercentileStatistics: true,
      supportsLod: true,
      supportsQueryWithLodSR: false,
      supportedLodTypes: ['geohash'],
      supportsReturningGeometryCentroid: false,
      supportsQueryWithDatumTransformation: true,
      supportsHavingClause: true,
      supportsOutFieldSQLExpression: true,
      supportsMaxRecordCountFactor: true,
      supportsTopFeaturesQuery: true,
      supportsDisjointSpatialRel: true,
      supportsQueryWithCacheHint: true,
      supportsQueryAnalytic: true
    },
    useStandardizedQueries: true,
    geometryType: 'esriGeometryPoint',
    minScale: 1155582,
    maxScale: 0,
    extent: {
      xmin: -9774926.259280406,
      ymin: 5109671.1379929595,
      xmax: -9746980.351008188,
      ymax: 5163471.188346348,
      spatialReference: {
        wkid: 102100,
        latestWkid: 3857
      }
    },
    drawingInfo: {
      renderer: {
        type: 'simple',
        symbol: {
          type: 'esriPMS',
          url: 'RedSphere.png',
          imageData:
            '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',
          contentType: 'image/png',
          width: 15,
          height: 15
        }
      }
    },
    allowGeometryUpdates: true,
    hasAttachments: false,
    htmlPopupType: 'esriServerHTMLPopupTypeNone',
    hasMetadata: true,
    hasM: false,
    hasZ: false,
    objectIdField: 'FID',
    uniqueIdField: {
      name: 'FID',
      isSystemMaintained: true
    },
    globalIdField: '',
    typeIdField: '',
    fields: [
      {
        name: 'FID',
        type: 'esriFieldTypeOID',
        actualType: 'int',
        alias: 'FID',
        sqlType: 'sqlTypeInteger',
        nullabel: false,
        editable: false,
        domain: null,
        defaultValue: null
      },
      {
        name: 'ID',
        type: 'esriFieldTypeInteger',
        actualType: 'int',
        alias: 'ID',
        sqlType: 'sqlTypeInteger',
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Case_Numbe',
        type: 'esriFieldTypeString',
        actualType: 'nvarchar',
        alias: 'Case_Numbe',
        sqlType: 'sqlTypeNVarchar',
        length: 254,
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Date',
        type: 'esriFieldTypeDate',
        actualType: 'datetime2',
        alias: 'Date',
        sqlType: 'sqlTypeTimestamp2',
        length: 8,
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'IUCR',
        type: 'esriFieldTypeString',
        actualType: 'nvarchar',
        alias: 'IUCR',
        sqlType: 'sqlTypeNVarchar',
        length: 254,
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Primary_Ty',
        type: 'esriFieldTypeString',
        actualType: 'nvarchar',
        alias: 'Primary_Ty',
        sqlType: 'sqlTypeNVarchar',
        length: 254,
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Descriptio',
        type: 'esriFieldTypeString',
        actualType: 'nvarchar',
        alias: 'Descriptio',
        sqlType: 'sqlTypeNVarchar',
        length: 254,
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Location_D',
        type: 'esriFieldTypeString',
        actualType: 'nvarchar',
        alias: 'Location_D',
        sqlType: 'sqlTypeNVarchar',
        length: 254,
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Arrest',
        type: 'esriFieldTypeString',
        actualType: 'nvarchar',
        alias: 'Arrest',
        sqlType: 'sqlTypeNVarchar',
        length: 254,
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Beat',
        type: 'esriFieldTypeInteger',
        actualType: 'int',
        alias: 'Beat',
        sqlType: 'sqlTypeInteger',
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'District',
        type: 'esriFieldTypeInteger',
        actualType: 'int',
        alias: 'District',
        sqlType: 'sqlTypeInteger',
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Ward',
        type: 'esriFieldTypeInteger',
        actualType: 'int',
        alias: 'Ward',
        sqlType: 'sqlTypeInteger',
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Community',
        type: 'esriFieldTypeInteger',
        actualType: 'int',
        alias: 'Community',
        sqlType: 'sqlTypeInteger',
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'FBI_Code',
        type: 'esriFieldTypeString',
        actualType: 'nvarchar',
        alias: 'FBI_Code',
        sqlType: 'sqlTypeNVarchar',
        length: 254,
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'X_Coordina',
        type: 'esriFieldTypeInteger',
        actualType: 'int',
        alias: 'X_Coordina',
        sqlType: 'sqlTypeInteger',
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Y_Coordina',
        type: 'esriFieldTypeInteger',
        actualType: 'int',
        alias: 'Y_Coordina',
        sqlType: 'sqlTypeInteger',
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Year',
        type: 'esriFieldTypeInteger',
        actualType: 'int',
        alias: 'Year',
        sqlType: 'sqlTypeInteger',
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Updated_On',
        type: 'esriFieldTypeString',
        actualType: 'nvarchar',
        alias: 'Updated_On',
        sqlType: 'sqlTypeNVarchar',
        length: 254,
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Latitude',
        type: 'esriFieldTypeDouble',
        actualType: 'float',
        alias: 'Latitude',
        sqlType: 'sqlTypeFloat',
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'Longitude',
        type: 'esriFieldTypeDouble',
        actualType: 'float',
        alias: 'Longitude',
        sqlType: 'sqlTypeFloat',
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      },
      {
        name: 'WeekDay',
        type: 'esriFieldTypeString',
        actualType: 'nvarchar',
        alias: 'WeekDay',
        sqlType: 'sqlTypeNVarchar',
        length: 254,
        nullabel: true,
        editable: true,
        domain: null,
        defaultValue: null
      }
    ],
    indexes: [
      {
        name: 'PK__CHICAGOC__C1BEA5A22F8AAA4E',
        fields: 'FID',
        isAscending: true,
        isUnique: true,
        description: 'clustered, unique, primary key'
      },
      {
        name: 'user_8.CHICAGOCR_CHICAGOCR_Shape_sidx',
        fields: 'Shape',
        isAscending: false,
        isUnique: false,
        description: 'Shape Index'
      }
    ],
    dateFieldsTimeReference: {
      timeZone: 'UTC',
      respectsDaylightSaving: false
    },
    preferredTimeReference: null,
    types: [],
    templates: [
      {
        name: 'New Feature',
        description: '',
        drawingTool: 'esriFeatureEditToolPoint',
        prototype: {
          attributes: {
            ID: null,
            Case_Numbe: null,
            Date: null,
            IUCR: null,
            Primary_Ty: null,
            Descriptio: null,
            Location_D: null,
            Arrest: null,
            Beat: null,
            District: null,
            Ward: null,
            Community: null,
            FBI_Code: null,
            X_Coordina: null,
            Y_Coordina: null,
            Year: null,
            Updated_On: null,
            Latitude: null,
            Longitude: null,
            WeekDay: null
          }
        }
      }
    ],
    supportedQueryFormats: 'JSON, geoJSON, PBF',
    hasStaticData: true,
    maxRecordCount: 2000,
    standardMaxRecordCount: 32000,
    standardMaxRecordCountNoGeometry: 32000,
    tileMaxRecordCount: 8000,
    maxRecordCountFactor: 1,
    capabilities: 'Query'
  },
  queries: [
    {
      url: `${URL}/query?f=json&where=1=1&outFields=*&resultRecordCount=100`,
      result: {
        fields: [],
        features: [{ attributes: {} }]
      }
    },
    {
      url: `${URL}/query?f=json&where=2=2&outFields=*&resultRecordCount=100`,
      result: {
        fields: [],
        features: [{ attributes: {} }, { attributes: {} }]
      },
      delay: 200
    },
    {
      url: `${URL}/query?f=json&where=1=1&outFields=*&returnCountOnly=true`,
      result: {
        count: 10
      }
    },
    {
      url: `${URL}/query?f=json&where=2=2&outFields=*&returnCountOnly=true`,
      result: {
        count: 20
      },
      delay: 200
    },
    {
      url: `${URL}/query?f=json&where=a=1&outFields=*`,
      result: {
        fields: [],
        features: []
      }
    },
    {
      url: `${URL}/query?f=json&where=a=1 and b=1&outFields=*`,
      result: {
        fields: [],
        features: []
      }
    },
    {
      url: `${URL}/query?f=json&where=a=1 and b=1&outFields=*&returnCountOnly=true`,
      result: {
        count: 5
      }
    },
    {
      url: `${URL}/query?f=json&where=1=1&outFields=Primary_Ty&returnGeometry=false&returnDistinctValues=true&orderByFields=Primary_Ty ASC&resultRecordCount=20`,
      result: {
        features: [
          {
            attributes: {
              Primary_Ty: 'ASSAULT'
            }
          },
          {
            attributes: {
              Primary_Ty: 'BATTERY'
            }
          },
          {
            attributes: {
              Primary_Ty: 'ROBBERY'
            }
          }
        ]
      }
    },
    {
      url: `${URL}/query?f=json&where=1=1&outFields=*&groupByFieldsForStatistics=Year&outStatistics=[{"onStatisticField":"District","outStatisticFieldName":"District_0","statisticType":"sum"},{"onStatisticField":"Ward","outStatisticFieldName":"Ward_0","statisticType":"sum"}]`,
      result: {
        features: [
          {
            attributes: {
              District_0: 284,
              Ward_1: 512,
              Year: 2010
            }
          },
          {
            attributes: {
              District_0: 314,
              Ward_1: 659,
              Year: 2011
            }
          },
          {
            attributes: {
              District_0: 298,
              Ward_1: 632,
              Year: 2012
            }
          }
        ]
      }
    },
    {
      url: `${URL}/query?f=json&where=1=1&outFields=*&groupByFieldsForStatistics=Year&outStatistics=[{"onStatisticField":"Beat","outStatisticFieldName":"Beat_0","statisticType":"sum"}]`,
      result: {
        features: [
          {
            attributes: {
              Beat_0: 512,
              Year: 2010
            }
          },
          {
            attributes: {
              Beat_0: 659,
              Year: 2011
            }
          },
          {
            attributes: {
              Beat_0: 632,
              Year: 2012
            }
          }
        ]
      }
    }
  ]
}
