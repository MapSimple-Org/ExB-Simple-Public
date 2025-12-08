import { React } from 'jimu-core';
import { type BrandFunctionColors } from 'jimu-theme';
import type { StandardComponentProps } from '../types';
export type ButtonGroupParts = 'root';
/**
 * The `ButtonGroup` component props.
 */
export interface ButtonGroupProps extends StandardComponentProps {
    /**
     * Defines the role added to the element.
     */
    role?: React.AriaRole;
    /**
     * To provide a label for the badge for accessibility purposes.
     */
    'aria-label'?: string;
    /**
     * Custom html element to be used as a button group.
     *
     * @default div
     */
    tag?: React.ElementType;
    /**
     * The variant to use.
     * @default contained
     */
    variant?: 'contained' | 'outlined' | 'text';
    /**
     * The color of the component. It supports both default(if not set) and theme colors.
     * @default primary
     */
    color?: BrandFunctionColors | 'default' | 'inherit';
    /**
     * Defines the size of the button group.
     * @default default
     */
    size?: 'default' | 'sm' | 'lg';
    /**
     * Display components vertically or not.
     */
    vertical?: boolean;
    /**
     * Whether to wrap.
     * Node: Only valid when `vertical` is `false`.
     * @default false
     */
    wrap?: boolean;
    /**
     * If `true`, the component is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * The content of the component.
     */
    children?: React.ReactNode;
    /**
     * If `true`, the buttons will take up the full width of its container.
     * Node: Only valid when `wrap` is `false`.
     * @default false
     */
    block?: boolean;
    /**
     * Defines the gap between buttons.
     */
    gap?: string;
}
/**
 * The `ButtonGroup` component groups a series of buttons together on a single line with the button group.
 *
 * ```ts
 * import { ButtonGroup } from 'jimu-ui'
 * ```
 */
export declare const ButtonGroup: React.ForwardRefExoticComponent<ButtonGroupProps & React.RefAttributes<HTMLDivElement>>;
