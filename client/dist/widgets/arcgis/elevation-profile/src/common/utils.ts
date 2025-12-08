import type { JimuMapView } from 'jimu-arcgis'
import { type DataSource, DataSourceManager, DataSourceTypes } from 'jimu-core'

export function getAllLayersFromDataSource (dataSource: string): DataSource[] {
  const visitTree = (ds: DataSource, results: DataSource[]) => {
    const childDss = ds?.isDataSourceSet() && ds?.getChildDataSources()
    if (childDss) {
      childDss.forEach(childDs => {
        if (childDs?.isDataSourceSet()) {
          visitTree(childDs, results)
        } else if (childDs?.type === DataSourceTypes.FeatureLayer || childDs?.type === DataSourceTypes.SubtypeSublayer) {
          results.push(childDs)
        }
      })
    }
  }
  const allDss = []
  const dsManager = DataSourceManager.getInstance()
  const ds = dsManager?.getDataSource(dataSource)
  visitTree(ds, allDss)
  return allDss
}

export function defaultSelectedUnits (activeDsConfig, portalSelf): [string, string] {
  //get the configured units
  let configuredElevationUnit = activeDsConfig?.elevationLayersSettings?.elevationUnit
  let configuredLinearUnit = activeDsConfig?.elevationLayersSettings?.linearUnit
  //if configured units are empty set the units based on portal units
  if (!activeDsConfig?.elevationLayersSettings?.elevationUnit) {
    if (portalSelf?.units === 'english') {
      configuredElevationUnit = 'feet'
    } else {
      configuredElevationUnit = 'meters'
    }
  }

  if (!activeDsConfig?.elevationLayersSettings?.linearUnit) {
    if (portalSelf?.units === 'english') {
      configuredLinearUnit = 'miles'
    } else {
      configuredLinearUnit = 'kilometers'
    }
  }
  return [configuredElevationUnit, configuredLinearUnit]
}

export function getRandomHexColor (): string {
  const randomHexColor = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  return '#' + randomHexColor
}

//Specifies unit wise buffer limits
const enum UnitWiseMaxDistance {
  Feet = 5280000,
  Miles = 1000,
  Kilometers = 1609.344,
  Meters = 1609344,
  Yards = 1760000
}

/**
 * Limits a buffer distance.
 * @param unit Measurement units, e.g., feet, miles, meters
 * @returns The max value for the selected unit,
 */

export const getMaxBufferLimit = (unit: string): number => {
  switch (unit) {
    case 'feet':
      return UnitWiseMaxDistance.Feet
    case 'miles':
      return UnitWiseMaxDistance.Miles
    case 'kilometers':
      return UnitWiseMaxDistance.Kilometers
    case 'meters':
      return UnitWiseMaxDistance.Meters
    case 'yards':
      return UnitWiseMaxDistance.Yards
    default:
      return 1000
  }
}

/**
 * Limits the distance to max of the selected unit
 * @param distance Distance subject to limit
 * @param unit Measurement units, e.g., feet, miles, meters
 * @return `distance` capped at the maximum for the `unit` type
 */

export const validateMaxBufferDistance = (distance: number, unit: string): number => {
  const maxDistanceForUnit = getMaxBufferLimit(unit)
  if (distance > maxDistanceForUnit) {
    return maxDistanceForUnit
  }
  return distance
}

/**
 * wait for all the jimu layers and dataSource loaded
 * @param mapView selected map view
 * @returns child datasources
 */
export const waitForChildDataSourcesReady = async (mapView: JimuMapView): Promise<DataSource> => {
  await mapView?.whenAllJimuLayerViewLoaded()
  const ds = DataSourceManager.getInstance().getDataSource(mapView?.dataSourceId)
  if (ds?.isDataSourceSet() && !ds.areChildDataSourcesCreated()) {
    return ds.childDataSourcesReady().then(() => ds).catch(err => ds)
  }
  return Promise.resolve(ds)
}

/**
 * Get the portalSelf linear units
 * @param portalSelf The response of the portalself call
 * @returns portal self linearUnit
 */
export const getPortalSelfLinearUnits = (portalSelf): string => {
  return portalSelf?.units === 'english' ? 'miles' : 'kilometers'
}

/**
 * Get the portalSelf elevation units
 * @param portalSelf The response of the portalself call
 * @returns portal self elevationUnit
 */
export const getPortalSelfElevationUnits = (portalSelf): string => {
  return portalSelf?.units === 'english' ? 'feet' : 'meters'
}

/**
 * Get the data source infos for all the configured layers
 * @param rootDataSourceId root data source id
 * @param configuredLayers configured line and point layers
 * @param usedDataSources used data sources
 * @returns used data sources
 */
const getUseDataSourcesInfo = (rootDataSourceId, configuredLayers, usedDataSources) => {
  if (!usedDataSources) {
    usedDataSources = []
  }
  configuredLayers?.forEach((configLayer) => {
    const alreadyUsedDs = usedDataSources.filter((ds) => ds.dataSourceId === configLayer.layerId)
    const useDs = alreadyUsedDs?.length > 0
      ? alreadyUsedDs[0]
      : {
          dataSourceId: configLayer.layerId,
          mainDataSourceId: configLayer.layerId,
          rootDataSourceId: rootDataSourceId,
          fields: []
        };
    (configLayer.elevationSettings.type === 'one' || configLayer.elevationSettings.type === 'two') &&
      configLayer.elevationSettings.field1 &&
      !useDs.fields.includes(configLayer.elevationSettings.field1) &&
      useDs.fields.push(configLayer.elevationSettings.field1)

    configLayer.elevationSettings.type === 'two' && configLayer.elevationSettings.field2 &&
      !useDs.fields.includes(configLayer.elevationSettings.field2) &&
      useDs.fields.push(configLayer.elevationSettings.field2)

    configLayer.displayField &&
      !useDs.fields.includes(configLayer.displayField) &&
      useDs.fields.push(configLayer.displayField)

    alreadyUsedDs.length === 0 && usedDataSources.push(useDs)
  })
  return usedDataSources
}

/**
 * Get the used data sources for the all the configured data sources
 * @param configInfo config info
 * @returns use data source info
 */
export const getUseDataSourcesForAllDs = (configInfo) => {
  let useDataSourceInfo = []
  for (const mapDsId in configInfo) {
    if (configInfo[mapDsId].profileSettings.layers?.length > 0) {
      useDataSourceInfo = getUseDataSourcesInfo(mapDsId, configInfo[mapDsId].profileSettings.layers, useDataSourceInfo)
    }
    if (configInfo[mapDsId].assetSettings?.layers?.length > 0) {
      useDataSourceInfo = getUseDataSourcesInfo(mapDsId, configInfo[mapDsId].assetSettings.layers, useDataSourceInfo)
    }
  }
  return useDataSourceInfo
}

/**
 * Get random unique elevation layers id
 * @returns unique elevation layers id
 */
export const getUniqueElevationLayersId = (): string => {
  return `${Math.random()}`.slice(2).toString() + Date.now()
}
