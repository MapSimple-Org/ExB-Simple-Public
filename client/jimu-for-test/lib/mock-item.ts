import type { IItem } from '@esri/arcgis-rest-portal'

/**
 * Mocked portal item, including item data, item info.
 */
export interface MockItemData {
  /* The URL of the portal to use for the mocked data. */
  portalUrl: string
  /* The Item ID to use for the mocked data. */
  itemId: string
  /* The JSON data that will be returned for the [item data](https://developers.arcgis.com/rest/users-groups-and-items/item-data.htm) URL. */
  itemData: any
  /* The JSON data that will be returned for the [item info](https://developers.arcgis.com/rest/users-groups-and-items/item.htm) URL. */
  itemInfo: IItem
}

/**
 * Mock an item, return item data or item info.
 */
export function mockItem (mockData: MockItemData) {
  const itemDataUrl = `${mockData.portalUrl}/sharing/rest/content/items/${mockData.itemId}/data`
  const itemInfoUrl = `${mockData.portalUrl}/sharing/rest/content/items/${mockData.itemId}`

  fetchMock.mockResponse(req => {
    const reqUrl = decodeURIComponent(req.url).split('?')[0]
    if (reqUrl === itemDataUrl) {
      return Promise.resolve(JSON.stringify(mockData.itemData))
    } else if (reqUrl === itemInfoUrl) {
      return Promise.resolve(JSON.stringify(mockData.itemInfo))
    } else {
      console.log(`${reqUrl} is not mocked.`)
      return Promise.resolve({ status: 404 })
    }
  })
}

export const MOCK_PORTAL_URL = 'https://mock-portal-url.arcgis.com'
