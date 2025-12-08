import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The `WidgetPlaceholder` component props.
 */
export interface WidgetPlaceholderProps extends StandardComponentProps {
    /**
     * Defines the title added to the element.
     */
    title?: string;
    /**
     * To provide a label for interactive components for accessibility purposes.
     */
    'aria-label'?: string;
    /**
     * The size of the icon displayed in the component
     * Default: `small`
     */
    iconSize?: 'small' | 'large';
    /**
     * The id of the widget that this placeholder is filling.
     * @deprecated
     * @ignore
     */
    widgetId?: string;
    /**
     * The svg icon object. For example: `require('path.to.icon.svg')`.
     */
    icon: string;
    /**
     * The text message shown in the placeholder. Only shown in builder mode when the `iconSize` is `small`.
     */
    message?: string;
    /**
     * Flip the icon automatically if the locale is following right-to-left (RTL).
     * @default false
     */
    autoFlip?: boolean;
    /**
     * The name of the widget. Only shown in builder mode when the `iconSize` is `small`.
     */
    name?: string;
    /**
     * The display direction of the widget name
     */
    direction?: 'vertical' | 'horizontal';
    /**
     * The rounded corners of components
     * @default none
     */
    shape?: 'none' | 'shape1' | 'shape2';
}
/**
 * The `WidgetPlaceholder` component is applied in widgets prior to all settings have been chosen by the experience author.
 *
 * ```ts
 * import { WidgetPlaceholder } from 'jimu-ui'
 * ```
 */
export declare const WidgetPlaceholder: React.ForwardRefExoticComponent<WidgetPlaceholderProps & React.RefAttributes<HTMLDivElement>>;
