/** @jsx jsx */
import { React } from 'jimu-core';
import type { IItem } from '@esri/arcgis-rest-portal';
export interface DataBadgeProps {
    /**
     * Portal [item](https://developers.arcgis.com/rest/users-groups-and-items/item.htm).
     */
    item?: IItem;
    /**
     * If do not have item info, pass in item id and portal url, will fetch item info use them.
     */
    itemId?: string;
    portalUrl?: string;
    /**
     * If use a service, pass in service url instead of item.
     */
    url?: string;
    /**
     * @ignore only used by theme
     */
    className?: string;
    /**
     * @ignore
     */
    id?: string;
}
export declare const DataBadge: import("@emotion/styled").StyledComponent<Omit<any, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default DataBadge;
