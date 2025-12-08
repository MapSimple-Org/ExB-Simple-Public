import { React } from 'jimu-core';
import type { StandardComponentProps } from '../../types';
export interface CollapsableBaseHeaderProps extends StandardComponentProps {
    /**
     * The type of this component.
     * @default default
     */
    type?: 'default' | 'primary';
    /**
     * The tag of the component.
     * If the tag is 'label', clicking on the label will trigger the form child element.
     * @default div
     */
    tag?: 'div' | 'label';
    /**
     * Defines the label size of the component.
     * @default 0
     * @ignore
     */
    level?: 0 | 1 | 2 | 3;
    /**
     * Whether the collapse panel is open.
     */
    isOpen?: boolean;
    /**
     * Invoked when opening the component.
     */
    onRequestOpen?: () => void;
    /**
     * Invoked when closing the component.
     */
    onRequestClose?: () => void;
    /**
     * The children of this component.
     */
    children?: React.ReactNode;
}
declare const CollapsableBaseHeader: (props: CollapsableBaseHeaderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default CollapsableBaseHeader;
