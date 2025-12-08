import type { IItem } from '@esri/arcgis-rest-portal';
/**
 * Mocked portal item, including item data, item info.
 */
export interface MockItemData {
    portalUrl: string;
    itemId: string;
    itemData: any;
    itemInfo: IItem;
}
/**
 * Mock an item, return item data or item info.
 */
export declare function mockItem(mockData: MockItemData): void;
export declare const MOCK_PORTAL_URL = "https://mock-portal-url.arcgis.com";
