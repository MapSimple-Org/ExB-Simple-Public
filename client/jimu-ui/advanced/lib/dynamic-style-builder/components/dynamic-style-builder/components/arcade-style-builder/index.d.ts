/** @jsx jsx */
import { React, type ImmutableArray, type UseDataSource, type IMArcadeStyleConfig, type IMDynamicStyleTypes } from 'jimu-core';
import type { ComponentExtraProps } from '../../../../utils';
export interface ArcadeStyleBuilderProps {
    widgetId: string;
    useDataSources: ImmutableArray<UseDataSource>;
    /**
     * Used to set the style types to be built.
     */
    dynamicStyleTypes: IMDynamicStyleTypes;
    /**
     * Indicates whether to use icons if `capabilities` includes `ArcadeContentCapability.Style`.
     */
    useIcons: boolean;
    config: IMArcadeStyleConfig;
    onChange: (config: IMArcadeStyleConfig) => void;
}
type FinalArcadeStyleBuilderProps = ArcadeStyleBuilderProps & ComponentExtraProps;
export declare const ArcadeStyleBuilder: React.ForwardRefExoticComponent<Pick<Omit<FinalArcadeStyleBuilderProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof ArcadeStyleBuilderProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
