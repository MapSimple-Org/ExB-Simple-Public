import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The CardHeader component props.
 */
export interface CardHeaderProps extends StandardComponentProps {
    /**
     * The element tag used of the component.
     * @default div
     */
    tag?: React.ElementType;
    /**
     * Fire callback when the component is clicked.
     */
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
}
/**
 * The `CardHeader` component used to display the header of a card.
 *
 * ```ts
 * import { CardHeader } from 'jimu-ui'
 * ```
 */
export declare const CardHeader: React.ForwardRefExoticComponent<CardHeaderProps & React.RefAttributes<HTMLDivElement>>;
