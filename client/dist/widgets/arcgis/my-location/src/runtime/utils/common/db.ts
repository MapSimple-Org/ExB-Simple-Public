import { getAppStore, indexedDBUtils, utils } from 'jimu-core'
import { STORES } from '../../../constants'
export interface storeScheme {
  storeName: string
  indexName: string
  indexKey: string
  keyPath: string
}

// delete db
export function deleteDB (name: string) {
  utils.removeFromLocalStorage(STORES[0].storeName)
  utils.removeFromLocalStorage(STORES[1].storeName)
  utils.removeFromLocalStorage(STORES[2].storeName)
  const request = indexedDB.deleteDatabase(name)
  return indexedDBUtils.whenRequest(request)
}

/**
 * create indexded db name
 * @param widgetId widget id
 * @param widgetName widget name
 * @returns indexded db name
 */
export function getDBName (widgetId: string, widgetName: string): string {
  const appId = window.jimuConfig?.isBuilder ? getAppStore().getState().appStateInBuilder?.appId : getAppStore().getState().appId
  return `exb-${appId}-${widgetName}-${widgetId}-cache`
}

/**
 * delete useless dbs
 * @param {string} widgetName
 */
export async function clearUselessDB (widgetName: string) {
  const dbNames = await listIndexedDBDatabases()
  const appWidgets = getAppStore().getState()?.appConfig?.widgets
  if (appWidgets !== undefined) {
    const trackWidgetsIds = Object.keys(appWidgets).filter(widgitId => appWidgets[widgitId].manifest.name === widgetName)
    const appDBNames = trackWidgetsIds.map(widgetId => getDBName(widgetId, widgetName))
    dbNames.forEach(name => {
      if (!appDBNames.includes(name)) {
        deleteDB(name)
      }
    })
  }
}
/**
 * get all indexed db names in the browser
 * @returns {Array<string>} indexed db names
 */
async function listIndexedDBDatabases (): Promise<string[]> {
  if (typeof indexedDB.databases === 'function') {
    const databases = await indexedDB.databases()
    return databases.map(db => db.name || '')
  } else {
    return []
  }
}
