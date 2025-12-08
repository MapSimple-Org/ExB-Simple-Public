import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
export interface TabProps extends StandardComponentProps {
    /**
     * If true, the tab will be disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * If `true`, the tab is active.
     * Note: `active` is an internal prop, should not be used in widget.
     * @ignore
     */
    active?: boolean;
    /**
     * If `true`, a close icon will be shown on the tab.
     * @default false
     */
    closeable?: boolean;
    /**
     * Callback fired when the close icon be clicked.
     * Valid only closeable is true.
     * Note: `onClose` is an internal prop, should not be used in widget.
     * @ignore
     */
    onClose?: (id: string) => void;
    /**
     * The callback will fire when the tab is clicked.
     */
    onClick?: (evt: React.MouseEvent<HTMLElement>) => void;
    /**
     * Fired at an Element when a key is pressed down and that key normally produces a character value.
     */
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
    /**
     * The title of the tab.
     */
    title: string | React.JSX.Element;
    /**
     * Serves as the identifier of the tab.
     */
    id: string;
    /**
     * The content of the tab, which will be displayed in the tab panel when opened.
     */
    children: React.JSX.Element | React.JSX.Element[];
    /**
     * Defines the class names added to the element
     */
    className?: string;
    /**
     * Defines the class names added to `NavLink` element.
     * @ignore
     */
    innerClassName?: string;
    /**
     * The ref to access the DOM node.
     * @ignore
     */
    innerRef?: React.Ref<HTMLButtonElement>;
}
/**
 * The `Tab` component is a single item within the parent, `Tabs` component.
 *
 * ```ts
 * import { Tab } from 'jimu-ui'
 * ```
 */
export declare const Tab: (props: TabProps) => import("@emotion/react/jsx-runtime").JSX.Element;
