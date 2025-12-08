import type { IField } from '@esri/arcgis-rest-feature-service'
import { dataSourceUtils, getAppStore, type FieldSchema, DataSourceManager, type UseUtility, UtilityManager, loadArcGISJSAPIModule } from 'jimu-core'
import { type IMSearchConfig, UnitOption } from './config'
import { DefaultJSAPISearchProperties } from './constants'

export function getStopOutputDsId (widgetId: string): string {
  return `${widgetId}_output_stop`
}

export function getDirectionPointOutputDsId (widgetId: string): string {
  return `${widgetId}_output_direction_point`
}

export function getDirectionLineOutputDsId (widgetId: string): string {
  return `${widgetId}_output_direction_line`
}

export function getRouteOutputDsId (widgetId: string): string {
  return `${widgetId}_output_route`
}

export function convertJSAPIFieldsToJimuFields (fields: IField[]): { [jimuName: string]: FieldSchema } {
  if (!fields) {
    return null
  }
  const jimuFields: { [jimuName: string]: FieldSchema } = {}
  fields.forEach(r => {
    jimuFields[r.name] = dataSourceUtils.convertFieldToJimuField(r, null)
  })
  return jimuFields
}

export function getDefaultOrgUnit() {
  const userUnit = getAppStore().getState().user?.units as 'english' | 'metric'
  return userUnit === 'english' ? UnitOption.Imperial : UnitOption.Metric
}

export async function convertSearchConfigToJSAPISearchProperties(searchConfig: IMSearchConfig, defaultHint: string): Promise<__esri.DirectionsSearchProperties & { locationEnabled?: boolean }> {
  const properties: __esri.DirectionsSearchProperties & { locationEnabled?: boolean } = { ...DefaultJSAPISearchProperties }

  const hint = searchConfig?.generalConfig?.hint || defaultHint
  if (hint) {
    properties.allPlaceholder = hint
  }
  if (typeof searchConfig?.suggestionConfig?.maxSuggestions === 'number') {
    properties.maxSuggestions = searchConfig.suggestionConfig.maxSuggestions
  }
  if (typeof searchConfig?.suggestionConfig?.isUseCurrentLoation === 'boolean') {
    properties.locationEnabled = searchConfig.suggestionConfig.isUseCurrentLoation
  }
  if (Array.isArray(searchConfig?.dataConfig)) {
    const sourcesPromise = searchConfig?.dataConfig.asMutable({ deep: true }).map(async c => {
      if (c.useUtility) {
        const rawGeocodeURL = getUrlOfUseUtility(c.useUtility)
        // const geocodeURL = proxyUtils.getWhetherUseProxy() ? proxyUtils.getProxyUrl(rawGeocodeURL) || rawGeocodeURL : rawGeocodeURL
        const geocodeURL = rawGeocodeURL
        const sources = {
          url: geocodeURL,
          name: c.label,
          placeholder: c.hint || defaultHint,
          withinViewEnabled: c.searchInCurrentMapExtent ?? false
        } as __esri.LocatorSearchSource
        if (c.enableCountryCode) {
          sources.countryCode = c.countryCode
        }
        return Promise.resolve(sources)
      } else if (c.useDataSource) {
        const ds = await DataSourceManager.getInstance().createDataSourceByUseDataSource(c.useDataSource)
        const layer = dataSourceUtils.getJSAPILayer(ds as any)
        if (!layer) {
          return null
        }
        const sources = {
          layer: layer,
          searchFields: c.searchFields.map(field => field.name),
          outFields: c.displayFields.map(field => field.name),
          suggestionTemplate: c.displayFields.map(field => `{${field.name}}`).join(', '),
          searchTemplate: c.displayFields.map(field => `{${field.name}}`).join(', '),
          name: c.label,
          placeholder: c.hint || defaultHint,
          withinViewEnabled: c.searchInCurrentMapExtent ?? false
        }
        return Promise.resolve(sources)
      }
    })
    await Promise.all(sourcesPromise).then(sources => {
      // Handle null layer case
      properties.sources = sources.filter(source => !!source) as any
    })
  }

  return Promise.resolve(properties)
}


export function getUrlOfUseUtility(useUtility: UseUtility): string {
  if (!useUtility) {
    return null
  }
  return UtilityManager.getInstance().getUtilityJson(useUtility.utilityId)?.url
}

export async function getAddressFromSources(point: __esri.Point, searchConfig: IMSearchConfig) {
  const locator = await loadArcGISJSAPIModule(
    'esri/rest/locator'
  )
  const sources = searchConfig.dataConfig.map(c => {
    return getUrlOfUseUtility(c.useUtility)
  }).asMutable()
  const DEFAULT_GEOCODING_URL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'

  const convertPromises = sources.map((source) => {
    return locator.locationToAddress(source, { location: point })
  })

  let res = null
  for (const promise of convertPromises) {
    try {
      const { address } = await promise
      if (address) {
        res = address
        break
      }
    } catch (err) {
      console.error(err)
    }
  }
  // No reverse result by custom locator, try the default one
  if (!res) {
    const { address } = await locator.locationToAddress(DEFAULT_GEOCODING_URL, { location: point })
    res = address
  }
  return res
}