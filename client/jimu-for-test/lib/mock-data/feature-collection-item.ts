import { type MockItemData, MOCK_PORTAL_URL } from '../mock-item'
export const MOCK_FEATURE_COLLECTION_ITEM_TWO_LAYERS_ID = 'mock_feature_collection_two_layers_item'
export const MOCK_FEATURE_COLLECTION_ITEM_ONE_LAYER_ID = 'mock_feature_collection_one_layer_item'

/**
 * Mocked feature collection item. The feature collection item contains two feature layers.
 * The two feature layers are both point layer.
 */
export const featureCollectionItemWithTwoLayers: MockItemData = {
  portalUrl: MOCK_PORTAL_URL,
  itemId: MOCK_FEATURE_COLLECTION_ITEM_TWO_LAYERS_ID,
  itemInfo: {
    id: MOCK_FEATURE_COLLECTION_ITEM_TWO_LAYERS_ID,
    owner: 'yuey9507',
    orgId: 'oC086ufSSQ6Avnw2',
    title: 'new ds types - feature collection - two feature layers *',
    name: 'mock_name',
    type: 'Feature Collection',
    tags: ['Data', 'Feature Collection', 'Multilayer'],
    created: 159732516200,
    modified: 1597372539000,
    numViews: 60,
    size: 100
  },
  itemData: {
    showLegend: true,
    opacity: 1,
    visibility: true,
    layers: [
      {
        layerDefinition: {
          currentVersion: 10.81,
          id: 0,
          name: 'Federal Emergency Management Agency FEMA Recovery Offices',
          type: 'Feature Layer',
          geometryType: 'esriGeometryPoint',
          objectIdField: 'FID',
          fields: [
            {
              name: 'FID',
              type: 'esriFieldTypeOID',
              alias: 'FID',
              sqlType: 'sqlTypeOther',
              nullable: false,
              editable: false,
              domain: null,
              defaultValue: null
            },
            {
              name: 'OBJECTID',
              type: 'esriFieldTypeInteger',
              alias: 'OBJECTID',
              sqlType: 'sqlTypeOther',
              nullable: true,
              editable: true,
              domain: null,
              defaultValue: null
            },
            {
              name: 'DISASTER',
              type: 'esriFieldTypeString',
              alias: 'DISASTER',
              sqlType: 'sqlTypeOther',
              length: 66,
              nullable: true,
              editable: true,
              domain: null,
              defaultValue: null
            }
          ]
        },
        featureSet: {
          features: [
            {
              geometry: {
                x: -10874114,
                y: 3551874,
                spatialReference: {
                  wkid: 102100,
                  latestWkid: 3857
                }
              },
              attributes: {
                FID: 0,
                OBJECTID: 705285,
                DISASTER: 'TRO (Texas Recovery Office)'
              }
            }
          ],
          geometryType: 'esriGeometryPoint'
        },
        advancedQueryCapabilities: {
          useStandardizedQueries: true,
          supportsStatistics: true,
          supportsHavingClause: true,
          supportsOrderBy: true,
          supportsDistinct: true,
          supportsCountDistinct: true,
          supportsPagination: true,
          supportsTrueCurve: true,
          supportsReturningQueryExtent: true,
          supportsQueryWithDistance: true,
          supportsSqlExpression: true,
          supportsPaginationOnAggregatedQueries: true
        }
      },
      {
        layerDefinition: {
          currentVersion: 10.81,
          id: 1,
          name: 'State_Emergency_Operations_Centers_EOC',
          type: 'Feature Layer',
          geometryType: 'esriGeometryPoint',
          objectIdField: 'FID',
          fields: [
            {
              name: 'FID',
              type: 'esriFieldTypeOID',
              alias: 'FID',
              sqlType: 'sqlTypeOther',
              nullable: false,
              editable: false,
              domain: null,
              defaultValue: null
            },
            {
              name: 'OBJECTID',
              type: 'esriFieldTypeSmallInteger',
              alias: 'OBJECTID',
              sqlType: 'sqlTypeOther',
              nullable: true,
              editable: true,
              domain: null,
              defaultValue: null
            },
            {
              name: 'EOC_ID',
              type: 'esriFieldTypeSmallInteger',
              alias: 'EOC_ID',
              sqlType: 'sqlTypeOther',
              nullable: true,
              editable: true,
              domain: null,
              defaultValue: null
            },
            {
              name: 'NAME',
              type: 'esriFieldTypeString',
              alias: 'NAME',
              sqlType: 'sqlTypeOther',
              length: 91,
              nullable: true,
              editable: true,
              domain: null,
              defaultValue: null
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
            supportsTrueCurve: true,
            supportsReturningQueryExtent: true,
            supportsQueryWithDistance: true,
            supportsSqlExpression: true,
            supportsPaginationOnAggregatedQueries: true
          }
        },
        featureSet: {
          features: [{
            attributes: {
              FID: 0,
              OBJECTID: 1,
              EOC_ID: 1,
              NAME: 'Alabama Emergency Management Agency'
            }
          }],
          geometryType: 'esriGeometryPoint'
        }
      }
    ]
  }
}

/**
 * Mocked feature collection item. The feature collection item contains one point feature layer.
 */
export const featureCollectionItemWithOneLayer: MockItemData = {
  portalUrl: MOCK_PORTAL_URL,
  itemId: MOCK_FEATURE_COLLECTION_ITEM_ONE_LAYER_ID,
  itemInfo: {
    id: MOCK_FEATURE_COLLECTION_ITEM_ONE_LAYER_ID,
    owner: 'yuey9507',
    orgId: 'oC086ufSSQ6Avnw2',
    title: 'new ds types - feature collection - one feature layer *',
    name: 'mock_name',
    type: 'Feature Collection',
    tags: ['Data', 'Feature Collection', 'Singlelayer'],
    created: 159732516200,
    modified: 1597372539000,
    numViews: 60,
    size: 100
  },
  itemData: {
    showLegend: true,
    opacity: 1,
    visibility: true,
    layers: [
      {
        id: 0,
        layerDefinition: {
          currentVersion: 10.81,
          id: 0,
          name: 'State_Emergency_Operations_Centers_EOC',
          type: 'Feature Layer',
          geometryType: 'esriGeometryPoint',
          objectIdField: 'FID',
          fields: [
            {
              name: 'FID',
              type: 'esriFieldTypeOID',
              alias: 'FID',
              sqlType: 'sqlTypeOther',
              nullable: false,
              editable: false,
              domain: null,
              defaultValue: null
            },
            {
              name: 'OBJECTID',
              type: 'esriFieldTypeSmallInteger',
              alias: 'OBJECTID',
              sqlType: 'sqlTypeOther',
              nullable: true,
              editable: true,
              domain: null,
              defaultValue: null
            },
            {
              name: 'EOC_ID',
              type: 'esriFieldTypeSmallInteger',
              alias: 'EOC_ID',
              sqlType: 'sqlTypeOther',
              nullable: true,
              editable: true,
              domain: null,
              defaultValue: null
            },
            {
              name: 'NAME',
              type: 'esriFieldTypeString',
              alias: 'NAME',
              sqlType: 'sqlTypeOther',
              length: 91,
              nullable: true,
              editable: true,
              domain: null,
              defaultValue: null
            }
          ],
          definitionExpression: 'EOC_ID=1',
          advancedQueryCapabilities: {
            useStandardizedQueries: true,
            supportsStatistics: true,
            supportsHavingClause: true,
            supportsOrderBy: true,
            supportsDistinct: true,
            supportsCountDistinct: true,
            supportsPagination: true,
            supportsTrueCurve: true,
            supportsReturningQueryExtent: true,
            supportsQueryWithDistance: true,
            supportsSqlExpression: true,
            supportsPaginationOnAggregatedQueries: true
          }
        },
        featureSet: {
          features: [{
            attributes: {
              FID: 0,
              OBJECTID: 1,
              EOC_ID: 1,
              NAME: 'Alabama Emergency Management Agency'
            }
          }],
          geometryType: 'esriGeometryPoint'
        },
        popupInfo: {
          title: 'Mock popup:{NAME}',
          fieldInfos: [
            {
              fieldName: 'objectid',
              label: 'objectid',
              isEditable: false,
              visible: false
            }
          ]
        }
      }
    ]
  }
}
