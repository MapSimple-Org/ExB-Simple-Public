import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The CardBody component props.
 */
export interface CardBodyProps extends StandardComponentProps {
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
 * The `CardBody` component used to display the body of a card.
 *
 * ```ts
 * import { CardBody } from 'jimu-ui'
 * ```
 */
export declare const CardBody: React.ForwardRefExoticComponent<CardBodyProps & React.RefAttributes<HTMLDivElement>>;
