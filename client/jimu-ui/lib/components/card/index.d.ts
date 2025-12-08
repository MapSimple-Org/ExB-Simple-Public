import { React } from 'jimu-core';
import { type PaperProps } from '../surface';
/**
 * The `Card` component props.
 */
export interface CardProps extends Omit<PaperProps, 'variant' | 'component' | 'elevation'> {
    /**
     * To provide a role for card. [More info about roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles)
     */
    role?: React.AriaRole;
    /**
     * If true, the card will be shown as selected
     */
    active?: boolean;
    /**
     * Whether the card is clickable or not
     * @default false
     */
    clickable?: boolean;
}
/**
 * The `Card` component provide a flexible and extensible content container with multiple variants and options.
 *
 * ```ts
 * import { Card } from 'jimu-ui'
 * ```
 */
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export * from './card-header';
export * from './card-body';
export * from './card-footer';
