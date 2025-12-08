import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The CardFooter component props.
 */
export interface CardFooterProps extends StandardComponentProps {
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
 * The `CardFooter` component used to display the footer of a card.
 *
 * ```ts
 * import { CardFooter } from 'jimu-ui'
 * ```
 */
export declare const CardFooter: React.ForwardRefExoticComponent<CardFooterProps & React.RefAttributes<HTMLDivElement>>;
