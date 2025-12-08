import { type FontStyleProps } from './text-font-style';
/**
 * The `TextStyle` component props.
 */
export interface TextStyleProps extends Omit<FontStyleProps, 'size' | 'vertical' | 'types' | 'onChange'> {
    /**
     * The color of the text.
     */
    color?: string;
    /**
     * The font size of the text.
     * @default 16px
     */
    size?: string;
    /**
     * Invoked when the text style changes.
     * @event
     */
    onChange?: (key: string, value: any) => void;
}
/**
 * The `TextStyle` component allows users to set the styles of text.
 *
 * ```ts
 * import { TextStyle } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const TextStyle: (props: TextStyleProps) => import("@emotion/react/jsx-runtime").JSX.Element;
