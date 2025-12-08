import { React, type IMThemeVariables, type IntlShape } from 'jimu-core';
interface ImageResizeProviderProps {
    intl: IntlShape;
    theme: IMThemeVariables;
    /**
     * If the component is placed inside a modal, its z-index is calculated based on the modalId obtained from the context.
     */
    modalId?: string;
    children: React.ReactNode;
}
export declare const ImageResizeProvider: (props: ImageResizeProviderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
