import { type ButtonGroupProps } from './button-group';
/**
 * The `AdvancedButtonGroup` component props.
 */
export interface AdvancedButtonGroupProps extends Omit<ButtonGroupProps, 'color'> {
}
/**
 * The `AdvancedButtonGroup` component groups a series of buttons together on a single line with the button group.
 * You can only embed `Button` directly in this component since it will override some properties of the button.
 *
 * ```ts
 * import { AdvancedButtonGroup } from 'jimu-ui'
 * ```
 */
export declare const AdvancedButtonGroup: (props: AdvancedButtonGroupProps) => import("@emotion/react/jsx-runtime").JSX.Element;
