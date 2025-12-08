import type { StandardComponentProps } from 'jimu-ui';
/**
 * The `SizeColorSetting` component props.
 */
export interface SizeColorSettingProps extends StandardComponentProps {
    /**
     * The color of the text.
     */
    color?: string;
    /**
     * The font size of the text.
     * @default 12px
     */
    size?: string;
    /**
     * Whether to apply a default value when the input is empty.
     * @default true
     */
    applyDefaultValue?: boolean;
    /**
     * Whether to use the ColorPicker.
     * @default false
     */
    useColorPicker?: boolean;
    /**
     * Invoked when the text style changes.
     * @event
     */
    onChange?: (key: string, value: string) => void;
}
/**
 * The `SizeColorSetting` component allows users to set the `color` and `font-size` of text.
 *
 * ```ts
 * import { SizeColorSetting } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const SizeColorSetting: (props: SizeColorSettingProps) => import("@emotion/react/jsx-runtime").JSX.Element;
