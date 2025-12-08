/** @jsx jsx */
import { type IMThemeVariables } from 'jimu-core';
import { type Props } from '../common/screen-side-panel';
interface ExtraProps {
    builderTheme: IMThemeVariables;
    viewOnly: boolean;
    isDesignMode: boolean;
    useAnimation?: boolean;
    formatMessage: (id: string) => string;
}
export declare function ScreenSidePanel(props: Props & ExtraProps): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
