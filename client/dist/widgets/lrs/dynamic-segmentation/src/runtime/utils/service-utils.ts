import { type DataSource, type FeatureLayerDataSource, SessionManager, type ImmutableArray, DataSourceManager } from 'jimu-core'
import { type AttributeSet, type LrsLayer, requestService, isDefined } from 'widgets/shared-code/lrs'
import type { RouteInfoFromDataAction, LocationParam, AttributeSetParam, QueryAttributeSetResults } from '../../config'

function getLocations (params: RouteInfoFromDataAction): LocationParam[] {
  const locations: LocationParam[] = []
  if (params.routeId) {
    const location: LocationParam = {
      routeId: params.routeId
    }
    if (isDefined(params.fromMeasure) && !isNaN(params.fromMeasure)) {
      location.fromMeasure = params.fromMeasure
    }
    if (isDefined(params.toMeasure) && !isNaN(params.toMeasure)) {
      location.toMeasure = params.toMeasure
    }
    locations.push(location)
  }
  return locations
}

export function getAttributeSetParam (routeInfo: RouteInfoFromDataAction, lrsLayers: ImmutableArray<LrsLayer>, attributeSet: AttributeSet): AttributeSetParam[] {
  const attributeSets: AttributeSetParam[] = []
  const dataSourceManager = DataSourceManager.getInstance()
  const lrsNetworkId = routeInfo.networkInfo.lrsNetworkId
  if (attributeSet) {
    attributeSet.layers.forEach((layer) => {
      const eventLayer = lrsLayers.find((lrsLayer) => lrsLayer.serviceId === layer.layerId)
      if (isDefined(eventLayer)) {
        const eventParentNetworkId = eventLayer?.eventInfo?.parentNetworkId
        if (lrsNetworkId === eventParentNetworkId) {
          const attributeSetParam: AttributeSetParam = {
            layerId: layer.layerId.toString(),
            fields: []
          }
          // Fields from attribute set
          layer.fields.forEach((field) => {
            attributeSetParam.fields.push(field.name)
          })
          // Fields from event layer
          attributeSetParam.fields.push(eventLayer.eventInfo.eventIdFieldName)
          const ds = dataSourceManager.getDataSource(eventLayer.useDataSource.dataSourceId)
          attributeSetParam.fields.push(ds.getIdField())
          attributeSets.push(attributeSetParam)
        }
      }
    })
  }

  return attributeSets
}

export async function queryAttributeSets (
  networkDS: DataSource,
  routeInfo: RouteInfoFromDataAction,
  date: Date,
  attributeSet: AttributeSetParam[],
  historicMoment: number
): Promise<QueryAttributeSetResults> {
  if (!routeInfo.routeId.length) {
    return null
  }

  const url = routeInfo.networkInfo.networkUrl
  const REST = `${url}/queryAttributeSet`
  const token = await SessionManager.getInstance().getSessionByUrl(url).getToken(url)

  const location = getLocations(routeInfo)

  const originDs: FeatureLayerDataSource = networkDS as FeatureLayerDataSource
  let gdbVersion = originDs.getGDBVersion()
  if (!gdbVersion) {
    gdbVersion = ''
  }

  const dateRange: number[] = [date.getTime(), date.getTime()]

  const params = {
    f: 'json',
    token: token,
    locations: location,
    attributeSet: attributeSet,
    temporalViewDate: JSON.stringify(dateRange),
    gdbVersion: gdbVersion,
    historicMoment: historicMoment !== -1 ? historicMoment : ''
  }

  return requestService({ method: 'POST', url: REST, params: params })

    .then((results: QueryAttributeSetResults) => {
      if (!results) {
        return null
      }
      return results
    })
}
