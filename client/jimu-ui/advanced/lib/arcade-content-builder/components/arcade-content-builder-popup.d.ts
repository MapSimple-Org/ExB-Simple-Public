/** @jsx jsx */
import { React, type IMThemeVariables, type IntlShape } from 'jimu-core';
import { type ArcadeContentBuilderProps } from './arcade-content-builder';
interface State {
    SidePopper: any;
}
export interface ArcadeContentBuilderPopupProps extends ArcadeContentBuilderProps {
    /**
     * Whether to show the popup.
     */
    isOpen: boolean;
    /**
     * Callback when the close icon in header of the popup is clicked.
     */
    onClose: () => void;
    /**
     * See `SidePopper` in jimu-ui/advanced/setting-components for more details.
     */
    trigger?: HTMLElement | HTMLElement[];
    /**
     * See `SidePopper` in jimu-ui/advanced/setting-components for more details.
     */
    backToFocusNode?: HTMLElement;
}
interface ExtraProps {
    /**
     * @ignore
     */
    theme: IMThemeVariables;
    /**
     * @ignore
     */
    intl: IntlShape;
}
export declare class _ArcadeContentBuilderPopup extends React.PureComponent<ArcadeContentBuilderPopupProps & ExtraProps, State> {
    overflowYStyle: React.CSSProperties;
    __unmount: boolean;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const ArcadeContentBuilderPopup: React.ForwardRefExoticComponent<Pick<Omit<ArcadeContentBuilderPopupProps & ExtraProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | keyof ArcadeContentBuilderPopupProps> & {
    theme?: IMThemeVariables;
}>;
export {};
