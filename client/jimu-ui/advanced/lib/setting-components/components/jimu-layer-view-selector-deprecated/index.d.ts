/** @jsx jsx */
import { React, type IntlShape, type ImmutableArray } from 'jimu-core';
/**
 * The JimuLayerViewSelector component props
 */
export interface JimuLayerViewSelectorDeprecatedProps {
    /**
     * The array of Map widget IDs. It is returned by selecting from the MapWidgetSelector component.
     */
    useMapWidgetIds: ImmutableArray<string>;
    /**
     * The jimuLayerViewInfo of the layer selected by the onSelect function.
     */
    jimuLayerViewInfo?: any;
    /** @ignore */
    className?: string;
    /**
     * The function will be called when a layer is selected.
     */
    onSelect?: (jimuLayerViewInfo: any) => void;
    /**
     * @ignore
     */
    intl: IntlShape;
}
/**
 * @deprecated
 * A react component for selecting layers in a map. It is usually used on the settings page of a widget,
 * and works with JimuLayerViewComponent to get the jimulayerview instance.
 */
export declare const JimuLayerViewSelectorDeprecated: React.FC<import("react-intl").WithIntlProps<any>> & {
    WrappedComponent: React.ComponentType<any>;
};
