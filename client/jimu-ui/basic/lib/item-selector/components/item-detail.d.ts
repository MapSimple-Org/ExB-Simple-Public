/** @jsx jsx */
import { React } from 'jimu-core';
import type { IItem } from '@esri/arcgis-rest-portal';
/**
 * The ItemDetail props
 */
export interface ItemDetailProps {
    /**
     * Portal [item](https://developers.arcgis.com/rest/users-groups-and-items/item.htm)
     */
    item: IItem;
    portalUrl: string;
    style?: React.CSSProperties;
    className?: string;
    hideHeader?: boolean;
    onClose?: () => void;
}
/**
 * A component to show the detail of a portal [item](https://developers.arcgis.com/rest/users-groups-and-items/item.htm)
 */
export declare const ItemDetail: React.FC<import("react-intl").WithIntlProps<ItemDetailProps>> & {
    WrappedComponent: React.ComponentType<ItemDetailProps>;
};
export default ItemDetail;
