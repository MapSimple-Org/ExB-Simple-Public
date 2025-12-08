import { type ButtonGroupProps } from 'jimu-ui';
import { type FontStyles } from './font-style-item';
/**
 * The `FontStyle` component props.
 */
export type FontStyleProps = Omit<ButtonGroupProps, 'onChange' | 'size' | 'color'> & {
    /**
     * A collection of font styles that can be set.
     * You can select any of the four styles 'bold', 'italic', 'underline', and 'strike'.
     * Includes all font styles by default.
     */
    types?: FontStyles[];
    /**
     * Defines the size of the button group.
     * @default sm
     */
    size?: 'default' | 'sm' | 'lg';
    /**
     * Whether to bold text.
     */
    bold?: boolean;
    /**
     * Whether to italicize text.
     */
    italic?: boolean;
    /**
     * Whether to underline text.
     */
    underline?: boolean;
    /**
     * Whether to strikethrough text.
     */
    strike?: boolean;
    /**
     * Whether to apply a default value when the input is empty.
     * @default true
     */
    applyDefaultValue?: boolean;
    /**
     * Invoked when the font style changes.
     * @event
     */
    onChange?: (key: string, value: boolean) => void;
};
/**
 * The `FontStyle` component allows users to set the font styles of text.
 *
 * ```ts
 * import { FontStyle } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const FontStyle: (props: FontStyleProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export type { FontStyles };
