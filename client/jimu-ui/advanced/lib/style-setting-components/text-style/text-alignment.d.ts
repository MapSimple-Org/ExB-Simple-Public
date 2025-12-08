import { type ButtonGroupProps, TextAlignValue } from 'jimu-ui';
import type { ButtonType } from 'jimu-ui/lib/components/button';
/**
 * The TextAlignment component props.
 */
export type TextAlignmentProps = Omit<ButtonGroupProps, 'onChange'> & {
    /**
     * Type for the the button components of this component.
     * @ignore
     * @default default
     */
    buttonType?: ButtonType;
    /**
     * The value of this component.
     */
    textAlign?: TextAlignValue;
    /**
     * Invoked when the text alignment changes.
     * @event
     */
    onChange?: (value: TextAlignValue) => void;
    /**
     * Whether to display the justify alignment.
     * @default false
     */
    showJustify?: boolean;
    /**
     * Flip the icon automatically if the locale is following right-to-left (RTL).
     * @default false
     */
    autoFlip?: boolean;
};
/**
 * The `TextAlignment` component allows users to set the alignment of text.
 *
 * ```ts
 * import { TextAlignment } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const TextAlignment: (props: TextAlignmentProps) => import("@emotion/react/jsx-runtime").JSX.Element;
