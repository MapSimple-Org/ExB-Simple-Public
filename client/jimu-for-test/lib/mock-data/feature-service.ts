import type { MockFeatureLayerData, MockServiceData } from '../mock-service'

const FEATURE_LAYER_URL = 'https://demographics.arcgis.com/arcgis/rest/services/SF311/FeatureServer/0'
const FEATURE_SERVICE_URL = 'https://demographics.arcgis.com/arcgis/rest/services/SF311/FeatureServer'

const SERVER_INFO = {
  currentVersion: 10.71,
  fullVersion: '10.7.1',
  soapUrl: 'https://demographics.arcgis.com/arcgis/services',
  secureSoapUrl: 'https://demographics.arcgis.com/arcgis/services',
  authInfo: {
    isTokenBasedSecurity: true,
    tokenServicesUrl: 'https://demographics.arcgis.com/arcgis/tokens/',
    shortLivedTokenValidity: 60
  }
}

/**
 * Mocked point feature layer.
 */
export const featureLayer: MockFeatureLayerData = {
  url: FEATURE_LAYER_URL,
  serverInfo: SERVER_INFO,
  layerDefinition: {
    currentVersion: 10.71,
    id: 0,
    name: 'Incidents',
    type: 'Feature Layer',
    geometryType: 'esriGeometryPoint',
    objectIdField: 'objectid',
    globalIdField: '',
    displayField: 'req_type',
    typeIdField: 'req_type',
    subtypeField: '',
    fields: [
      {
        name: 'objectid',
        type: 'esriFieldTypeOID',
        alias: 'Object ID',
        domain: null,
        editable: false,
        nullable: false,
        defaultValue: null,
        modelName: 'OBJECTID'
      },
      {
        name: 'req_id',
        type: 'esriFieldTypeString',
        alias: 'Request ID',
        domain: null,
        editable: true,
        nullable: true,
        length: 20,
        defaultValue: null,
        modelName: 'REQ_ID'
      },
      {
        name: 'req_type',
        type: 'esriFieldTypeString',
        alias: 'Request Type',
        domain: null,
        editable: true,
        nullable: true,
        length: 40,
        defaultValue: null,
        modelName: 'REQ_TYPE'
      },
      {
        name: 'req_date',
        type: 'esriFieldTypeString',
        alias: 'Request Date',
        domain: null,
        editable: true,
        nullable: true,
        length: 30,
        defaultValue: null,
        modelName: 'REQ_DATE'
      },
      {
        name: 'req_time',
        type: 'esriFieldTypeString',
        alias: 'Request Time',
        domain: null,
        editable: true,
        nullable: true,
        length: 20,
        defaultValue: null,
        modelName: 'REQ_TIME'
      },
      {
        name: 'address',
        type: 'esriFieldTypeString',
        alias: 'Address',
        domain: null,
        editable: true,
        nullable: true,
        length: 60,
        defaultValue: null,
        modelName: 'ADDRESS'
      },
      {
        name: 'district',
        type: 'esriFieldTypeString',
        alias: 'District',
        domain: null,
        editable: true,
        nullable: true,
        length: 20,
        defaultValue: null,
        modelName: 'DISTRICT'
      },
      {
        name: 'status',
        type: 'esriFieldTypeSmallInteger',
        alias: 'Status',
        domain: {
          type: 'codedValue',
          name: 'StatusCodes',
          codedValues: [
            {
              name: 'New',
              code: 1
            },
            {
              name: 'Open',
              code: 2
            },
            {
              name: 'Closed',
              code: 3
            }
          ],
          mergePolicy: 'esriMPTDefaultValue',
          splitPolicy: 'esriSPTDefaultValue'
        },
        editable: true,
        nullable: true,
        defaultValue: 1
      },
      {
        name: 'geometryField',
        type: 'esriFieldTypeGeometry'
      },
      {
        name: 'rasterField',
        type: 'esriFieldTypeRaster'
      },
      {
        name: 'xmlField',
        type: 'esriFieldTypeXML'
      },
      {
        name: 'blobField',
        type: 'esriFieldTypeBlob'
      }
    ],
    advancedQueryCapabilities: {
      useStandardizedQueries: true,
      supportsStatistics: true,
      supportsHavingClause: true,
      supportsOrderBy: true,
      supportsDistinct: true,
      supportsCountDistinct: true,
      supportsPagination: true,
      supportsPaginationOnAggregatedQueries: true,
      supportsTrueCurve: true,
      supportsReturningQueryExtent: true,
      supportsQueryWithDistance: true,
      supportsSqlExpression: true
    }
  },
  queries: [{
    url: `${FEATURE_LAYER_URL}/query?f=json&where=1=1&outFields=*&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: {} }]
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=1=1&outFields=*&returnGeometry=true&returnZ=true&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: {} }]
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=1=1&outFields=objectid&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: {} }]
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=1=1&outFields=objectid,req_type&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: {} }]
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=2=2&outFields=*&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: {} }, { attributes: {} }]
    },
    delay: 200
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=1=1&outFields=objectid&returnCountOnly=true`,
    result: {
      count: 10
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=2=2&outFields=objectid&returnCountOnly=true`,
    result: {
      count: 20
    },
    delay: 200
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=a=1&outFields=*`,
    result: {
      fields: [],
      features: []
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=a=1 and b=1&outFields=*`,
    result: {
      fields: [],
      features: []
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=a=1 and b=1&outFields=*&returnCountOnly=true`,
    result: {
      count: 5
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=objectid>1&outFields=*&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: { objectid: 2 } }, { attributes: { objectid: 3 } }]
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=objectid>1&outFields=*&objectIds=1&returnCountOnly=true`,
    result: {
      count: 0
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=objectid>1&outFields=*&returnGeometry=true&returnZ=true&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: { objectid: 2 } }, { attributes: { objectid: 3 } }]
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=objectid>1&outFields=*&returnCountOnly=true`,
    result: {
      count: 2
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=(objectid>1) and (objectid>2)&outFields=*&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: { objectid: 3 } }]
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&objectid>1&outFields=*&objectIds=1`,
    result: {
      fields: [],
      features: []
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=(objectid>1) and (objectid>2)&outFields=*&objectIds=1,2`,
    result: {
      fields: [],
      features: []
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=1=1&outFields=*&objectIds=1&returnGeometry=true&returnZ=true`,
    result: {
      fields: [],
      features: [{ attributes: { objectid: 1 } }]
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=1=1&outFields=*&objectIds=1&returnGeometry=true&returnCountOnly=true&returnZ=true`,
    result: {
      count: 1
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=1=1&outFields=*&objectIds=1&returnGeometry=true&returnZ=true&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: { objectid: 1 } }]
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=1%3D1&outFields=objectid,req_type&returnGeometry=true&returnZ=true&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: { objectid: 1 } }]
    }
  }, {
    url: `${FEATURE_SERVICE_URL}/1/queryRelatedRecords?f=json&definitionExpression=1=1&resultOffset=0&objectIds=1&relationshipId=0`,
    result: {
      fields: [{
        name: 'objectid',
        type: 'esriFieldTypeOID',
        alias: 'OBJECTID',
        domain: null,
        defaultValue: null
      }],
      relatedRecordGroups: [
        { objectid: 1, relatedRecords: [{ attributes: { objectid: 1 } }] }
      ]
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=objectid=1&outFields=req_id,req_type,req_date,req_time,address,district,status,objectid&objectIds=1&returnCountOnly=true`,
    result: {
      count: 1
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=1=1&outFields=*&objectIds=2&returnGeometry=true&returnCountOnly=true&returnZ=true`,
    result: {
      count: 1
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=1=1&outFields=*&objectIds=2&returnGeometry=true&returnZ=true&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: { objectid: 2 } }]
    }
  }, {
    url: `${FEATURE_LAYER_URL}/query?f=json&where=objectid=1&outFields=req_id,req_type,req_date,req_time,address,district,status,objectid&objectIds=1&resultOffset=0&resultRecordCount=100`,
    result: {
      fields: [],
      features: [{ attributes: { objectid: 1 } }]
    }
  }]
} as MockFeatureLayerData

/**
 * Mocked feature service. The service contains one point feature layer and one table.
 */
export const featureService: MockServiceData = {
  url: FEATURE_SERVICE_URL,
  serverInfo: SERVER_INFO,
  serviceDefinition: {
    currentVersion: 10.71,
    maxRecordCount: 1000,
    maxRecordCountFactor: 1,
    layers: [
      {
        id: 1,
        name: 'Incidents',
        parentLayerId: -1,
        defaultVisibility: true,
        subLayerIds: null,
        minScale: 0,
        maxScale: 0,
        type: 'Feature Layer',
        geometryType: 'esriGeometryPoint'
      }
    ],
    tables: [
      {
        id: 2,
        name: 'SF_Crime_Incidents'
      }
    ]
  },
  layers: [
    {
      url: `${FEATURE_SERVICE_URL}/1`,
      layerDefinition: {
        ...featureLayer.layerDefinition,
        id: 1,
        name: 'Incidents',
        relationships: [{
          id: 0,
          name: 'SF_Crime_Incidents',
          relatedTableId: 2,
          cardinality: 'esriRelCardinalityOneToOne',
          role: 'esriRelRoleOrigin',
          keyField: 'objectid',
          composite: false
        }]
      }
    },
    {
      url: `${FEATURE_SERVICE_URL}/2`,
      layerDefinition: {
        ...featureLayer.layerDefinition,
        id: 2,
        name: 'SF_Crime_Incidents',
        relationships: [{
          id: 0,
          name: 'Incidents',
          relatedTableId: 1,
          cardinality: 'esriRelCardinalityOneToOne',
          role: 'esriRelRoleDestination',
          keyField: 'objectid',
          composite: false
        }]
      }
    }
  ]
} as MockServiceData

/**
 * Mocked point subtype group layer.
 */
export const subtypeGroupLayer: MockFeatureLayerData = {
  url: FEATURE_LAYER_URL,
  serverInfo: SERVER_INFO,
  layerDefinition: {
    currentVersion: 11.2,
    id: 0,
    name: 'MarineLife',
    type: 'Feature Layer',
    geometryType: 'esriGeometryPoint',
    objectIdField: 'OBJECTID',
    globalIdField: '',
    displayField: 'REGION',
    typeIdField: '',
    subtypeField: 'TYPE',
    fields: [{
      name: 'OBJECTID',
      type: 'esriFieldTypeOID',
      alias: 'OBJECTID',
      nullable: false,
      editable: false,
      domain: null,
      defaultValue: null
    }, {
      name: 'TYPE',
      type: 'esriFieldTypeSmallInteger',
      alias: 'TYPE',
      nullable: false,
      editable: true,
      domain: null,
      defaultValue: 0
    }, {
      name: 'REGION',
      type: 'esriFieldTypeString',
      alias: 'REGION',
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    }, {
      name: 'SANCTUARY',
      type: 'esriFieldTypeString',
      alias: 'SANCTUARY',
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    }, {
      name: 'WHALE_HABITAT_LOC',
      type: 'esriFieldTypeString',
      alias: 'WHALE_HABITAT_LOC',
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    }, {
      name: 'CRAB_DISTRICT',
      type: 'esriFieldTypeString',
      alias: 'CRAB_DISTRICT',
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    }, {
      name: 'FISH_PROTECTED_HABITAT',
      type: 'esriFieldTypeString',
      alias: 'FISH_PROTECTED_HABITAT',
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    }, {
      name: 'COMMENT',
      type: 'esriFieldTypeString',
      alias: 'COMMENT',
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    }, {
      name: 'MANATEE_PROTECT_ZONE_COUNTY',
      type: 'esriFieldTypeString',
      alias: 'MANATEE_PROTECT_ZONE_COUNTY',
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    }, {
      name: 'TURTLE_SPECIES',
      type: 'esriFieldTypeString',
      alias: 'TURTLE_SPECIES',
      length: 255,
      nullable: true,
      editable: true,
      domain: null,
      defaultValue: null
    }
    ],
    subtypes: [{
      code: 2,
      name: 'Dolphin',
      defaultValues: {
        TYPE: 2,
        REGION: null,
        SANCTUARY: null,
        WHALE_HABITAT_LOC: null,
        CRAB_DISTRICT: null,
        FISH_PROTECTED_HABITAT: null,
        COMMENT: null,
        MANATEE_PROTECT_ZONE_COUNTY: null,
        TURTLE_SPECIES: null
      },
      domains: null
    }, {
      code: 6,
      name: 'Seal/Sea Lion',
      defaultValues: {
        TYPE: 6,
        REGION: null,
        SANCTUARY: null,
        WHALE_HABITAT_LOC: null,
        CRAB_DISTRICT: null,
        FISH_PROTECTED_HABITAT: null,
        COMMENT: null,
        MANATEE_PROTECT_ZONE_COUNTY: null,
        TURTLE_SPECIES: null
      },
      domains: null
    }, {
      code: 10,
      name: 'Echinoderm',
      defaultValues: {
        TYPE: 10,
        REGION: null,
        SANCTUARY: null,
        WHALE_HABITAT_LOC: null,
        CRAB_DISTRICT: null,
        FISH_PROTECTED_HABITAT: null,
        COMMENT: null,
        MANATEE_PROTECT_ZONE_COUNTY: null,
        TURTLE_SPECIES: null
      },
      domains: null
    }],
    advancedQueryCapabilities: {
      useStandardizedQueries: true,
      supportsStatistics: true,
      supportsHavingClause: true,
      supportsOrderBy: true,
      supportsDistinct: true,
      supportsCountDistinct: true,
      supportsPagination: true,
      supportsPaginationOnAggregatedQueries: true,
      supportsTrueCurve: true,
      supportsReturningQueryExtent: true,
      supportsQueryWithDistance: true,
      supportsSqlExpression: true
    }
  },
  queries: []
} as MockFeatureLayerData
