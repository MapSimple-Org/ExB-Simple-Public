import type { IItem } from '@esri/arcgis-rest-portal';
import type { GPTaskInfo } from './app-config';
export interface Utility {
    utilityId: string;
    url: string;
    itemInfo?: IItem;
    tasks?: GPTaskInfo[];
}
