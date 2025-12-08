import { type CollapsableRadioHeaderProps } from './header';
import { type BaseCollapsablePanelProps } from './base';
export type CollapsableRadioParts = 'root' | 'header';
/**
 * The `CollapsableRadio` component props.
 */
export interface CollapsableRadioProps extends Omit<BaseCollapsablePanelProps, 'header' | 'tag'>, CollapsableRadioHeaderProps {
    /**
     * The default open state of the component.
     */
    defaultIsOpen?: boolean;
}
/**
 * The `CollapsableRadio` component allows users to show the collapsible panel.
 *
 * ```ts
 * import { CollapsableRadio } from 'jimu-ui'
 * ```
 */
export declare const CollapsableRadio: (props: CollapsableRadioProps) => import("@emotion/react/jsx-runtime").JSX.Element;
