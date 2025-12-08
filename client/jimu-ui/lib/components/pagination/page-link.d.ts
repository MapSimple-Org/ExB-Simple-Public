import { React } from 'jimu-core';
import { type LinkProps } from '../link/link';
import type { PaginationVariant, PaginationShape } from './type';
/**
 * The `PageLink` component props.
 */
export interface PageLinkProps extends Omit<LinkProps, 'icon' | 'type' | 'innerRef' | 'vertical' | 'unstyled' | 'customStyle' | 'themeStyle' | 'htmlType' | 'disableHoverEffect'> {
    /**
     * The size of the component.
     * @default default
     */
    size?: 'default' | 'sm' | 'lg';
    /**
     * Display components vertically or not.
     * @default false
     */
    vertical?: boolean;
    /**
     * Whether the component is active.
     * @default false
     */
    active?: boolean;
    /**
     * If `true`, the component will be disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * The variant to use.
     * @default outlined
     */
    variant?: PaginationVariant;
    /**
     * The shape of the pagination items.
     * @default rounded
     */
    shape?: PaginationShape;
    /**
     * The icon of this component.
     */
    icon?: React.ComponentClass<React.SVGProps<SVGElement>> | string;
    /**
     * Defines the font-size of the icon element.
     * @default 12
     */
    iconSize?: number;
    /**
     * Whether to display the icon only.
     * Note: This is valid when the component's children has only one icon.
     * @default false
     */
    iconOnly?: boolean;
    /**
     * Defines the position of the icon element.
     * @default start
     */
    iconPosition?: 'start' | 'end';
    /**
     * The title of this component.
     */
    title?: string;
    /**
     * The aria-label of this component.
     * To provide a label for interactive components for accessibility purposes.
     */
    'aria-label'?: string;
    /**
     * Custom html element to use as the link element.
     * Will use `button` tag when no `href` property exists.
     * @default a
     */
    tag?: React.ElementType;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
}
/**
 * The `PageLink` component is usually used to provide navigation capability, when combining with `PageItem` component.
 *
 * Please use this component together with `Pagination` and `PageItem`.
 *
 * ```ts
 * import { PageLink } from 'jimu-ui'
 * ```
 */
export declare const PageLink: React.ForwardRefExoticComponent<PageLinkProps & React.RefAttributes<HTMLButtonElement>>;
