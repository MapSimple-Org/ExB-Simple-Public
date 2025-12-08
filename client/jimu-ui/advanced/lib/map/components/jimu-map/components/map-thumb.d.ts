import { React, type IntlShape, type IMThemeVariables } from 'jimu-core';
interface Props {
    mapItemId: string;
    portUrl: string;
    usedInSetting: boolean;
    /**
    * @ignore
    */
    theme: IMThemeVariables;
    /**
     * @ignore
     */
    intl: IntlShape;
}
declare const MapThumb: React.ForwardRefExoticComponent<Pick<Omit<Props, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | "mapItemId" | "portUrl" | "usedInSetting"> & {
    theme?: IMThemeVariables;
}>;
export default MapThumb;
