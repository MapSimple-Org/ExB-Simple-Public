import { type _TreeItem, type TreeActionDataType, type TreeItemsType, type TreeItemType } from 'jimu-ui/basic/list-tree';
import type { MultipleJimuMapValidateResult } from '..';
export interface MapItemProps {
    mapWidgetId: string;
    itemJson: TreeItemType;
    isDataSourceValid?: (dsid: string) => MultipleJimuMapValidateResult;
    showSelectedLayers?: boolean;
    onMapItemClick?: (itemJson: TreeItemType, itemNode: any) => void;
    onLayerItemClick?: (actionData: TreeActionDataType, refComponent: _TreeItem, itemNode: any) => void;
    dndEnabled?: boolean;
    onLayerReorder?: (jmvId: string, itemsJson: TreeItemsType) => void;
}
export default function MapItem(props: MapItemProps): import("@emotion/react/jsx-runtime").JSX.Element;
