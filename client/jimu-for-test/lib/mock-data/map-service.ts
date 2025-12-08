// The data is copied from sampleserver6.arcgisonline.com, change the domain to demographics.arcgis.com to test proxy setting.

import type { MockServiceData, MockFeatureLayerData } from '../mock-service'

export const MAP_SERVICE_URL = 'https://demographics.arcgis.com/arcgis/rest/services/911CallsHotspot/MapServer'
export const FEATURE_LAYER_URL = `${MAP_SERVICE_URL}/3`
export const SERVER_INFO = {
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
    name: 'Incidents_in_map_service',
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
        name: 'mock_a_field',
        type: 'esriFieldTypeSmallInteger',
        alias: 'Mock a field',
        editable: true,
        nullable: true,
        defaultValue: 1
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
  queries: []
} as MockFeatureLayerData

/**
 * Mocked map service. The service contains three layers, one group layer and the group layer contains two point feature layer.
 */
export const mapService: MockServiceData = {
  url: MAP_SERVICE_URL,
  serverInfo: SERVER_INFO,
  serviceDefinition: {
    currentVersion: 10.71,
    mapName: '911CallsHotspot',
    layers: [
      {
        id: 0,
        name: '911 Calls Hotspot',
        parentLayerId: -1,
        defaultVisibility: true,
        subLayerIds: [
          1,
          2
        ],
        minScale: 0,
        maxScale: 0,
        type: 'Group Layer'
      },
      {
        id: 1,
        name: 'Output_Features',
        parentLayerId: 0,
        defaultVisibility: true,
        subLayerIds: null,
        minScale: 0,
        maxScale: 0,
        type: 'Feature Layer',
        geometryType: 'esriGeometryPoint'
      },
      {
        id: 2,
        name: 'Hotspot Raster',
        parentLayerId: 0,
        defaultVisibility: true,
        subLayerIds: null,
        minScale: 0,
        maxScale: 0,
        type: 'Feature Layer',
        geometryType: 'esriGeometryPoint'
      }
    ],
    tables: []
  },
  layers: [
    {
      url: `${MAP_SERVICE_URL}/0`,
      layerDefinition: {
        id: 0,
        name: '911 Calls Hotspot',
        type: 'Group Layer',
        subLayers: [
          {
            id: 1,
            name: 'Output Features'
          },
          {
            id: 2,
            name: 'Hotspot Raster'
          }
        ]
      }
    },
    {
      url: `${MAP_SERVICE_URL}/1`,
      layerDefinition: { ...featureLayer.layerDefinition, id: 1, name: 'Output Features' }
    },
    {
      url: `${MAP_SERVICE_URL}/2`,
      layerDefinition: { ...featureLayer.layerDefinition, id: 2, name: 'Hotspot Raster' }
    }
  ]
} as MockServiceData
