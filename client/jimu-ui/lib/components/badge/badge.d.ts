import { React } from 'jimu-core';
import { type BrandFunctionColors } from 'jimu-theme';
import type { StandardComponentProps } from '../types';
/**
/**
 * The Badge component props
 */
export interface BadgeProps extends StandardComponentProps {
    /**
     * To provide a label for the badge for accessibility purposes.
     */
    'aria-label'?: string;
    /**
     * The color of the component. It supports those theme colors that make sense for this component.
     * @default error
     */
    color?: BrandFunctionColors | (string & {});
    /**
     * Whether to display a dot instead of `badgeContent`.
     * @default false
     */
    dot?: boolean;
    /**
     * The badge will be added relative to this node.
     */
    children?: React.ReactElement | React.ReactNode;
    /**
     * Defines the class names added to the badge element.
     */
    badgeClassName?: string;
    /**
     * Defines the style added to the badge element.
     */
    badgeStyle?: React.CSSProperties;
    /**
     * The content rendered within the badge.
     */
    badgeContent?: React.ReactElement | React.ReactNode;
    /**
     * Max count to show.
     * @default 99
     */
    max?: number;
    /**
     * If true, the badge will be invisible.
     * @default false
     */
    hideBadge?: boolean;
    /**
     * Controls whether the badge is hidden when `badgeContent` is zero.
     * @default true
     */
    showZero?: boolean;
    /**
     * Set offset of the badge dot
     */
    offset?: [number, number];
}
/**
 * The `Badge` component generates a small badge to the top-right of its child(ren).
 *
 * ```ts
 * import { Badge } from 'jimu-ui'
 * ```
 */
export declare const Badge: (props: BadgeProps) => import("@emotion/react/jsx-runtime").JSX.Element;
