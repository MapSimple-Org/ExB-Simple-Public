import { type CollapsableHeaderProps } from './header';
import { type BaseCollapsablePanelProps } from './base';
/**
 * The `CollapsablePanel` component props.
 */
export interface CollapsablePanelProps extends Omit<BaseCollapsablePanelProps, 'header' | 'tag'>, CollapsableHeaderProps {
    /**
   * The tag of the panel header.
   * If the tag is 'label', clicking on the label will trigger the form child element.
   * @default label
   */
    headerTag?: 'div' | 'label';
    /**
     * The default open state of the component.
     */
    defaultIsOpen?: boolean;
}
/**
 * The `CollapsablePanel` component allows users to show the collapsible panel.
 *
 * ```ts
 * import { CollapsablePanel } from 'jimu-ui'
 * ```
 */
export declare const CollapsablePanel: (props: CollapsablePanelProps) => import("@emotion/react/jsx-runtime").JSX.Element;
