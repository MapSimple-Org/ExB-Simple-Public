import { acquireLock, type AcquireLockResponse, type DetailedLockInfo, formatMessage, getGDBVersion, isDefined, LockAcquireStatus, LockAction, type LrsLayer, type LrsLocksInfo, type NetworkInfo, QueryLock, type RouteInfo, shouldTryAcquireLock, tryAutoReconcile } from 'widgets/shared-code/lrs'
import type { TableEdits, DynSegFieldInfo, RouteInfoFromDataAction } from '../../config'
import { getAttributesByTable, getPendingEditsKey } from './table-utils'
import type { FeatureLayerQueryParams, FeatureLayerDataSource, DataSource, ImmutableArray, ImmutableObject } from 'jimu-core'
import { DynSegFields } from '../../constants'

export function handleCellEdit (fieldInfo: DynSegFieldInfo, incomingRecord: __esri.Graphic, fieldInfos, pendingEdits): Map<string, TableEdits> {
  const key = getPendingEditsKey(incomingRecord, fieldInfo.eventName)
  const existingEdits = pendingEdits.get(key)
  const attributes = getAttributesByTable(fieldInfos, incomingRecord, fieldInfo.eventName, false)

  const updatedPendingEdits = new Map<string, TableEdits>(pendingEdits)
  if (isDefined(existingEdits)) {
    existingEdits.attributes = attributes
    updatedPendingEdits.set(key, existingEdits)
  } else {
    const DynSegEdits = {
      layerId: fieldInfo.eventLayerId,
      attributes: attributes
    }
    updatedPendingEdits.set(key, DynSegEdits)
  }
  return updatedPendingEdits
}

export async function preventConflict (lockInfo, featureDS, intl) {
  const queryLockResults = await QueryLock(featureDS, lockInfo, false)
  let acquireLockResults
  if (shouldTryAcquireLock(featureDS, queryLockResults)) {
    acquireLockResults = await acquireLock(featureDS, queryLockResults)
    if (acquireLockResults.acquireStatus === LockAcquireStatus.EsriReconcileRequired) {
      const success = await tryAutoReconcile(featureDS)
      if (success) {
        acquireLockResults = await acquireLock(featureDS, queryLockResults)
      } else {
        return getErrorMessage(acquireLockResults, lockInfo, featureDS, intl)
      }
    }
    // return error or lock acquired message
    return getErrorMessage(acquireLockResults, lockInfo, featureDS, intl)
  } else if (queryLockResults.status !== LockAcquireStatus.EsriSuccess) {
    return getErrorMessage(acquireLockResults, lockInfo, featureDS, intl)
  }
}

function getNameOrId (routeInfo: RouteInfo): string {
  if (routeInfo.lineId !== '' && routeInfo.lineName === '') { return routeInfo.lineId }
  if (routeInfo.lineId !== '' && routeInfo.lineName !== '') { return routeInfo.lineName }
  if (routeInfo.routeName !== '') { return routeInfo.routeName }
  return routeInfo.routeId
}

function getNameOrIdFromUnavailableLock (lock: DetailedLockInfo): string {
  if (isDefined(lock.routeName) && lock.routeName !== '') { return lock.routeName }
  if (isDefined(lock.lineName) && lock.lineName !== '') { return lock.lineName }
  if (isDefined(lock.routeId) && lock.routeId !== '') { return lock.routeId }
  if (isDefined(lock.lineId) && lock.lineId !== '') { return lock.lineId }
}

function getErrorMessage (response: AcquireLockResponse, lockInfo: LrsLocksInfo, featureDS, intl) {
  let message = ''
  let msgType = 'info'
  let nameOrId = ''
  const networkName = lockInfo?.details[0]?.lrsNetworkName
  const version = getGDBVersion(featureDS)
  switch (response.acquireStatus) {
    case LockAcquireStatus.EsriSuccess:
      nameOrId = getNameOrId(lockInfo.routeInfo)
      if (lockInfo.routeInfo.lineId !== '') {
        message = formatMessage(intl, 'YouAcquiredLockOnLine', { nameOrId: nameOrId, networkName: networkName, version: version })
      } else {
        message = formatMessage(intl, 'YouAcquiredLockOnRoute', { nameOrId: nameOrId, networkName: networkName, version: version })
      }
      msgType = 'info'
      break
    case LockAcquireStatus.EsriReconcileRequired:
      message = formatMessage(intl, 'ReconcileRequired')
      msgType = 'danger'
      break
    case LockAcquireStatus.EsriCouldNotAcquireAllLocks:
      const lockVersion = response.unavailableLocks[0].versionName
      const lockUser = response.unavailableLocks[0].user
      nameOrId = getNameOrIdFromUnavailableLock(response.unavailableLocks[0])
      if (lockVersion === '') {
        if (lockInfo.routeInfo.lineId !== '') {
          message = formatMessage(intl, 'UnavailableLockOnLineWithoutVersion', { nameOrId: nameOrId, networkName: networkName, lockUser: lockUser })
        } else {
          message = formatMessage(intl, 'UnavailableLockOnRouteWithoutVersion', { nameOrId: nameOrId, networkName: networkName, lockUser: lockUser })
        }
      } else {
        if (lockInfo.routeInfo.lineId !== '') {
          message = formatMessage(intl, 'UnavailableLockOnLine', { nameOrId: nameOrId, networkName: networkName, lockUser: lockUser, version: lockVersion })
        } else {
          message = formatMessage(intl, 'UnavailableLockOnRoute', { nameOrId: nameOrId, networkName: networkName, lockUser: lockUser, version: lockVersion })
        }
      }
      msgType = 'danger'
      break
    default:
      message = ''
      msgType = 'info'
      break
  }
  return ({ toastMsg: message, toastMsgType: msgType, toastOpen: open })
}

export async function getLineId (networkInfo, routeId, networkDS) {
  const routeIdFieldName = networkInfo.routeIdFieldSchema.name
  const lineIdFieldName = networkInfo.lineIdFieldSchema.name
  let whereClause = ''
  const routeIds = [routeId]
  if (routeIds.length > 0) {
    whereClause = routeIdFieldName + ' IN (\'' + routeIds.join('\',\'') + '\')'
  }
  const featureQuery: FeatureLayerQueryParams = ({
    where: whereClause,
    outFields: ['*']
  })
  const results = await networkDS.query(featureQuery)
  if (results?.records?.length === 0) return null
  const lineId = results?.records[0].feature.attributes[lineIdFieldName]
  return lineId
}

export async function getRouteIdsOnLine (networkInfo: ImmutableObject<NetworkInfo>, routeId: string, networkDS: FeatureLayerDataSource): Promise<string[]> {
  // Get the lineId from the routeId
  const routeIdFieldName = networkInfo.routeIdFieldSchema.name
  const lineIdFieldName = networkInfo.lineIdFieldSchema.name
  let whereClause = routeIdFieldName + ' = \'' + routeId + '\''

  const featureQuery: FeatureLayerQueryParams = ({
    where: whereClause,
    outFields: [lineIdFieldName]
  })

  const results = await networkDS.query(featureQuery)
  if (results?.records?.length === 0) {
    return null
  }

  // Get the routeIds from the lineId
  whereClause = lineIdFieldName + ' IN (\'' + results?.records[0].getFieldValue(lineIdFieldName) + '\')'
  const featureQuery2: FeatureLayerQueryParams = ({
    where: whereClause,
    outFields: [routeIdFieldName]
  })

  const results2 = await networkDS.query(featureQuery2)
  if (results2?.records?.length === 0) {
    return null
  }

  const routeIds = results2?.records.map((record) => record.getFieldValue(routeIdFieldName))
  return routeIds
}

export function getWhereClause (networkDS: DataSource, activeDate: Date): string {
  const date = getOperationDate(networkDS, activeDate)
  const isoDate = date.toISOString().slice(0, 10)
  const dateUTC = `TIMESTAMP '${isoDate}'`

  const where = `(((${DynSegFields.fromDateName.toUpperCase()} <= ${dateUTC}) AND (${DynSegFields.toDateName.toUpperCase()} IS NULL)) OR ` +
    `((${DynSegFields.fromDateName.toUpperCase()} IS NULL) AND (${DynSegFields.toDateName.toUpperCase()} >= ${dateUTC})) OR ` +
    `((${DynSegFields.fromDateName.toUpperCase()} < ${dateUTC}) AND (${DynSegFields.toDateName.toUpperCase()} > ${dateUTC})))`

  return where
}

export function getOperationDate (networkDS: DataSource, activeDate: Date): Date {
  if (isDefined(activeDate)) {
    return activeDate
  }

  if (isDefined(networkDS)) {
    const featureDS = networkDS as FeatureLayerDataSource
    const queryParams = featureDS.getCurrentQueryParams()
    const extent = queryParams.time

    let date = new Date(Date.now())
    if (extent) {
      date = new Date(extent[0])
    }
    return date
  }
  return null
}

export async function createLockInfoFromParams (
  routeInfoFromDataAction: RouteInfoFromDataAction,
  lrsLayers: ImmutableArray<LrsLayer>,
  routeId: string,
  networkDS: DataSource,
  eventServiceLayerId: string
) : Promise<LrsLocksInfo> {
    const routeOrLineId = []
    const isLine = []
    const eventServiceLayerIds = []
    const eventInfo = lrsLayers.find(lyr => String(lyr.serviceId) === String(eventServiceLayerId))
    if (!eventInfo) return

    let lineOrRouteId: string
    let isLineValue: boolean

    if (routeInfoFromDataAction.networkInfo.supportsLines) {
      lineOrRouteId = await getLineId(routeInfoFromDataAction.networkInfo, routeId, networkDS)
      isLineValue = true
    } else {
      lineOrRouteId = routeId
      isLineValue = false
    }

    if (!routeOrLineId.includes(lineOrRouteId)) {
      routeOrLineId.push(lineOrRouteId)
      isLine.push(isLineValue)
      eventServiceLayerIds.push(eventServiceLayerId)
    }

    const routeInfo: RouteInfo = {
      routeId: routeInfoFromDataAction.routeId,
      routeName: routeInfoFromDataAction.routeName,
      fromMeasure: routeInfoFromDataAction.fromMeasure,
      toMeasure: routeInfoFromDataAction.toMeasure,
      fromDate: null,
      toDate: null,
      selectedMeasure: NaN,
      selectedFromDate: null,
      selectedToDate: null
    }

    const info: LrsLocksInfo = {
      networkId: [routeInfoFromDataAction.networkInfo.lrsNetworkId],
      routeOrLineId: routeOrLineId,
      eventServiceLayerIds: eventServiceLayerIds,
      isLine: isLine,
      status: LockAcquireStatus.EsriSuccess,
      details: [],
      routeInfo: routeInfo,
      lockAction: LockAction.Query
    }
    return info
  }

