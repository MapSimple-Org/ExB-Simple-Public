import { type IMThemeVariables, type IntlShape } from 'jimu-core';
import type { Editor } from '../../base';
interface ImageResizeProps {
    editor: Editor;
    img: HTMLImageElement;
    intl: IntlShape;
    theme: IMThemeVariables;
    /**
     * If the component is placed inside a modal, its z-index is calculated based on the modalId obtained from the context.
     * Since the component is created as a separate root via react-dom, it cannot access the external context.
     * To ensure the correct z-index for the internal popper, the modalId needs to be passed in.
     */
    modalId?: string;
    onDelete?: () => void;
}
export declare const ImageResizeComponent: (props: ImageResizeProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
