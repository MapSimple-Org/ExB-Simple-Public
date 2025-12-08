import { type MockItemData, MOCK_PORTAL_URL } from '../mock-item'
import { FEATURE_LAYER_URL, MAP_SERVICE_URL, featureLayer } from './map-service'
import { featureCollectionItemWithOneLayer, featureCollectionItemWithTwoLayers } from './feature-collection-item'

/**
 * Mocked map item. The map item contains one feature layer, the feature layer is added by url.
 */
export const mapItemWithOneFeatureLayer: MockItemData = {
  portalUrl: MOCK_PORTAL_URL,
  itemId: 'mock_map_item_with_one_feature_layer',
  itemInfo: {
    id: 'mock_map_item_with_one_feature_layer',
    owner: 'yuey9507',
    orgId: 'oC086ufSSQ6Avnw2',
    title: 'Two same map services in one web map',
    name: 'mock_name',
    type: 'Web Map',
    tags: ['mock_tag'],
    created: 159732516200,
    modified: 1597372539000,
    numViews: 60,
    size: 100
  },
  itemData: {
    operationalLayers: [
      {
        id: 'mock_feature_layer',
        layerType: 'ArcGISFeatureLayer',
        url: FEATURE_LAYER_URL,
        title: featureLayer.layerDefinition.name,
        name: 'mock_name'
      }
    ]
  }
}

/**
 * Mocked map item. The map item contains one map service layer, the map service layer is added by url.
 */
export const mapItemWithOneMapServiceLayer: MockItemData = {
  portalUrl: MOCK_PORTAL_URL,
  itemId: 'mock_map_item_with_one_map_service',
  itemInfo: {
    id: 'mock_map_item_with_one_map_service',
    owner: 'yuey9507',
    orgId: 'oC086ufSSQ6Avnw2',
    title: 'Two same map services in one web map',
    name: 'mock_name',
    type: 'Web Map',
    tags: ['mock_tag'],
    created: 159732516200,
    modified: 1597372539000,
    numViews: 60,
    size: 100
  },
  itemData: {
    operationalLayers: [
      {
        id: 'mock_map_service_layer',
        layerType: 'ArcGISMapServiceLayer',
        url: MAP_SERVICE_URL,
        title: '911CallsHotspot',
        name: 'mock_name'
      }
    ]
  }
}

/**
 * Mocked map item. The map item contains one feature collection, the feature collection contains two feature layers and is saved in map item directly.
 */
export const mapItemWithOneFeatureCollectionHasTwoLayersDirectlySavedInMap: MockItemData = {
  portalUrl: MOCK_PORTAL_URL,
  itemId: 'mock_map_item_with_feature_collection_directly_saved_in_map',
  itemInfo: {
    id: 'mock_map_item_with_feature_collection_directly_saved_in_map',
    owner: 'yuey9507',
    orgId: 'oC086ufSSQ6Avnw2',
    title: 'Map with uploaded data *',
    name: 'mock_name',
    type: 'Web Map',
    tags: ['mock_tag'],
    created: 159732516200,
    modified: 1597372539000,
    numViews: 60,
    size: 100
  },
  itemData: {
    operationalLayers: [
      {
        layerType: 'ArcGISFeatureLayer',
        id: 'related_data_shapefile_8626',
        title: 'related_data',
        name: 'mock_name',
        featureCollection: {
          layers: [
            {
              layerDefinition: {
                currentVersion: 10.81,
                id: 0,
                name: 'Federal Emergency Management Agency FEMA Recovery Offices',
                type: 'Feature Layer',
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
                  supportsPaginationOnAggregatedQueries: true,
                  supportsTrueCurve: true,
                  supportsReturningQueryExtent: true,
                  supportsQueryWithDistance: true,
                  supportsSqlExpression: true
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
    ]
  }
}

/**
 * Mocked map item. The map item contains one feature collection, the feature collection contains one feature layer and is saved in map item directly.
 */
export const mapItemWithOneFeatureCollectionHasOneLayerDirectlySavedInMap: MockItemData = {
  portalUrl: MOCK_PORTAL_URL,
  itemId: 'mock_map_item_with_feature_collection_directly_saved_in_map',
  itemInfo: {
    id: 'mock_map_item_with_feature_collection_directly_saved_in_map',
    owner: 'yuey9507',
    orgId: 'oC086ufSSQ6Avnw2',
    title: 'Map with uploaded data *',
    name: 'mock_name',
    type: 'Web Map',
    tags: ['mock_tag'],
    created: 159732516200,
    modified: 1597372539000,
    numViews: 60,
    size: 100
  },
  itemData: {
    operationalLayers: [
      {
        layerType: 'ArcGISFeatureLayer',
        id: 'related_data_shapefile_8626',
        title: 'related_data',
        name: 'mock_name',
        featureCollection: {
          layers: [
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
                  supportsPaginationOnAggregatedQueries: true,
                  supportsTrueCurve: true,
                  supportsReturningQueryExtent: true,
                  supportsQueryWithDistance: true,
                  supportsSqlExpression: true
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
    ]
  }
}

/**
 * Mocked map item. The map item contains one feature collection item and the item contains two feature layers.
 */
export const mapItemWithOneFeaureCollectionItemHasTwoLayers: MockItemData = {
  portalUrl: MOCK_PORTAL_URL,
  itemId: 'mock_map_item_with_feature_collection_item',
  itemInfo: {
    id: 'mock_map_item_with_feature_collection_item',
    owner: 'yuey9507',
    orgId: 'oC086ufSSQ6Avnw2',
    title: 'Map with uploaded data *',
    name: 'mock_name',
    type: 'Web Map',
    tags: ['mock_tag'],
    created: 159732516200,
    modified: 1597372539000,
    numViews: 60,
    size: 100
  },
  itemData: {
    operationalLayers: [
      {
        layerType: 'ArcGISFeatureLayer',
        id: 'Deep_Ocean Assessment and Reporting of Tsunamis _DART_ Stations_shapefile_640',
        title: 'Deep Ocean Assessment and Reporting of Tsunamis (DART) Stations',
        name: 'mock_name',
        visibility: true,
        type: 'Feature Collection',
        itemId: featureCollectionItemWithTwoLayers.itemId
      }
    ]
  }
}

/**
 * Mocked map item. The map item contains one feature collection item and the item contains one feature layer.
 */
export const mapItemWithOneFeaureCollectionItemHasOneLayer: MockItemData = {
  portalUrl: MOCK_PORTAL_URL,
  itemId: 'mock_map_item_with_feature_collection_item',
  itemInfo: {
    id: 'mock_map_item_with_feature_collection_item',
    owner: 'yuey9507',
    orgId: 'oC086ufSSQ6Avnw2',
    title: 'Map with uploaded data *',
    name: 'mock_name',
    type: 'Web Map',
    tags: ['mock_tag'],
    created: 159732516200,
    modified: 1597372539000,
    numViews: 60,
    size: 100
  },
  itemData: {
    operationalLayers: [
      {
        layerType: 'ArcGISFeatureLayer',
        id: 'Deep_Ocean Assessment and Reporting of Tsunamis _DART_ Stations_shapefile_640',
        title: 'Deep Ocean Assessment and Reporting of Tsunamis (DART) Stations',
        name: 'mock_name',
        visibility: true,
        type: 'Feature Collection',
        itemId: featureCollectionItemWithOneLayer.itemId
      }
    ]
  }
}

/**
 * Mocked map item. The map item contains one group and the group contains one feature layer.
 */
export const mapItemWithOneGroupHasOneLayer: MockItemData = {
  portalUrl: MOCK_PORTAL_URL,
  itemId: 'mock_map_item_with_one_group',
  itemInfo: {
    id: 'mock_map_item_with_one_group',
    owner: 'yuey9507',
    orgId: 'oC086ufSSQ6Avnw2',
    title: 'Test layer id map',
    name: 'mock_name',
    type: 'Web Map',
    tags: ['mock_tag'],
    created: 159732516200,
    modified: 1597372539000,
    numViews: 60,
    size: 7517
  },
  itemData: {
    operationalLayers: [
      {
        layerType: 'GroupLayer',
        id: '17bde5ab3a7-layer-8',
        title: 'Group layer',
        visibility: true,
        type: 'GroupLayer',
        layers: [
          {
            id: '17b530aef83-layer-5',
            title: 'mock title',
            layerType: 'ArcGISFeatureLayer',
            itemId: featureCollectionItemWithOneLayer.itemId,
            layerDefinition: featureCollectionItemWithOneLayer.itemData.layers[0].layerDefinition
          }
        ]
      }
    ]
  }
}

/**
 * Mocked map item. The map item contains two nested groups and the sub group contains one feature layer.
 */
export const mapItemWithTwoNestedGroupsHasOneLayer: MockItemData = {
  portalUrl: MOCK_PORTAL_URL,
  itemId: 'mock_map_item_with_nested_groups',
  itemInfo: {
    id: 'mock_map_item_with_nested_groups',
    owner: 'yuey9507',
    orgId: 'oC086ufSSQ6Avnw2',
    title: 'Test layer id map',
    name: 'mock_name',
    type: 'Web Map',
    tags: ['mock_tag'],
    created: 159732516200,
    modified: 1597372539000,
    numViews: 60,
    size: 7517
  },
  itemData: {
    operationalLayers: [
      {
        layerType: 'GroupLayer',
        id: '17bde5ab3a7-layer-8',
        title: 'Group layer 1',
        visibility: true,
        type: 'GroupLayer',
        layers: [
          {
            layerType: 'GroupLayer',
            id: '17bde5ab3a7-layer-9',
            title: 'Group layer 1-1',
            visibility: true,
            type: 'GroupLayer',
            layers: [
              {
                id: '17b530aef83-layer-5',
                title: 'mock title',
                layerType: 'ArcGISFeatureLayer',
                itemId: featureCollectionItemWithOneLayer.itemId,
                layerDefinition: featureCollectionItemWithOneLayer.itemData.layers[0].layerDefinition
              }
            ]
          }
        ]
      }
    ]
  }
}
