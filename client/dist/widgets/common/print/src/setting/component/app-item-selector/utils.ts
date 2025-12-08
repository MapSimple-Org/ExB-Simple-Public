import { appServices } from 'jimu-for-builder/service'
import { getAppStore, esri } from 'jimu-core'
interface SearchOption {
  searchText: string
  portalUrl: string
  num?: number
  start?: number
  sortField?: string
  sortOrder?: string
  searchItemtype?: string
  excludeType?: string
  authentication?: any
}

export async function searchItemByPortalUrl (option: SearchOption) {
  const { searchText, portalUrl, num, start, sortField, sortOrder, searchItemtype, excludeType, authentication } = option
  if (!portalUrl) return Promise.reject(new Error('No portal url'))
  const requestOption = {
    start: start || 1,
    num: num || 30,
    q: getRequestOptionParamsQ(searchText, searchItemtype, portalUrl, excludeType),
    sortField: sortField || 'modified',
    sortOrder: sortOrder || 'desc'
  } as any

  authentication && (requestOption.authentication = authentication)
  return appServices.searchAppByPortalUrl(requestOption, portalUrl)
}

function getRequestOptionParamsQ (searchText: string, searchItemType: string, portalUrl: string, excludeType?: string): string {
  let query = new esri.restPortal.SearchQueryBuilder().match(searchItemType).in('type')
  if (excludeType) {
    query = query.and()
      .startGroup()
      .not()
      .match(excludeType)
      .in('type')
      .endGroup()
  }
  if (searchText) {
    query = query
      .and()
      .startGroup()
      .match(searchText)
      .endGroup()
  }

  const appState = getAppStore().getState()
  const orgId = appState?.portalSelf?.user?.orgId
  if (portalUrl === appState?.portalUrl && orgId) {
    query = query
      .and()
      .match(orgId).in('orgid')
  }
  return query.toParam()
}

export function intersectionObserver (
  ref: HTMLElement,
  rootElement: HTMLElement,
  onChange?: (isIn: boolean) => void,
  options?: IntersectionObserverInit
) {
  const option: any = options || { root: rootElement }
  const callback = function (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) {
    const isIn = entries[0].intersectionRatio > 0
    onChange && onChange(isIn)
  }
  const observer = new IntersectionObserver(callback, option)
  observer.observe(ref)
  return observer
}
