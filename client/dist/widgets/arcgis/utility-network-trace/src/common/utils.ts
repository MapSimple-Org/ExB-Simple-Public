import type { JimuMapView } from 'jimu-arcgis'
import { type DataSource, DataSourceManager, getAppStore } from 'jimu-core'

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

export const getMaxBufferLimit = (unit: string | number) => {
  switch (unit) {
    case 'feet':
      return UnitWiseMaxDistance.Feet
    case 'miles':
      return UnitWiseMaxDistance.Miles
    case 'kilometers':
      return UnitWiseMaxDistance.Kilometers
    case 'meters':
      return UnitWiseMaxDistance.Meters
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

export const validateMaxBufferDistance = (distance: number, unit: string) => {
  const maxDistanceForUnit = getMaxBufferLimit(unit)
  if (distance > maxDistanceForUnit) {
    return maxDistanceForUnit
  }
  return distance
}

/**
 * Get the portal default unit
 * @returns portal default unit
 */
export const getPortalUnit = (): string => {
  const portalSelf = getAppStore().getState().portalSelf
  return portalSelf?.units === 'english' ? 'feet' : 'meters'
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
 * Returns the output datasource id
 * @param widgetId Widget id
 * @returns string
 */
export const getOutputDataSourceId = (widgetId: string): string => {
  return `${widgetId}-output`
}
