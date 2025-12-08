import type { ImmutableObject } from 'seamless-immutable';
import type { IItem } from '@esri/arcgis-rest-portal';
export interface AppInfo extends Partial<IItem> {
    name?: string;
    text?: any;
    username?: string;
    thumbnail?: string;
    classification?: __esri.PortalItem['classification'];
}
export type IMAppInfo = ImmutableObject<AppInfo>;
export interface AppCreationInfo {
    template: string;
    name: string;
    description: string;
    tags?: string[];
    folder?: string;
    shareWithWebmap?: boolean;
    shareWithWebscene?: boolean;
    webmap?: string;
    webscene?: string;
    type?: string;
    snippet?: string;
    typeKeywords?: string[];
}
