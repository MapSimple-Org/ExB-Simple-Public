/** @jsx jsx */
import { type UseDataSource, type ImmutableArray, type DataSourceTypes, type IMDataSourceJson } from 'jimu-core';
import { type SearchDataConfig, type DSInWidgetJson, type PropsForDataSourceSelector } from '../type/type';
interface LayerSourceSidePopperProps {
    id: string;
    viewId?: string;
    trigger: HTMLElement;
    isOpen: boolean;
    datasourceConfig: ImmutableArray<SearchDataConfig>;
    dsConfigItemIndex: number;
    toggle: () => void;
    updateConfigForLayerOptions: (datasourceConfig: ImmutableArray<SearchDataConfig>, closeSidePopper?: boolean) => void;
    onSettingChange: (datasourceConfig: ImmutableArray<SearchDataConfig>, dsInWidgetJson?: DSInWidgetJson, viewId?: string) => void;
    useDataSources: ImmutableArray<UseDataSource>;
    popperFocusNode: HTMLElement;
    hideIconSetting: boolean;
    hideDisplayFieldSetting: boolean;
    propsForDataSourceSelector: PropsForDataSourceSelector;
    showSearchInCurrentMapExtentSetting?: boolean;
    dsStatusChange: (dsId: string, isDsCreateSuccess?: boolean) => void;
    supportedDsTypes?: DataSourceTypes[];
    hideDs?: (dsJson: IMDataSourceJson) => boolean;
}
declare const LayerSourceSidePopper: (props: LayerSourceSidePopperProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default LayerSourceSidePopper;
