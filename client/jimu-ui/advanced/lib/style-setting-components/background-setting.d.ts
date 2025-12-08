import { type BackgroundStyle, type StandardComponentProps } from 'jimu-ui';
/**
 * The `BackgroundSetting` component props.
 */
export interface BackgroundSettingProps extends StandardComponentProps {
    /**
     * The value of this component, including the background color, background image, and the fill type of background image
     */
    background?: BackgroundStyle;
    /**
     * Whether to apply a default value when the input is empty.
     * @default true
     */
    applyDefaultValue?: boolean;
    /**
     * Invoked when the background value changes.
     */
    onChange?: (background: BackgroundStyle) => void;
    hasForeground?: boolean;
    foreground?: string;
    onForegroundChange?: (foreground: string) => void;
}
/**
 * The `BackgroundSetting` component allows users to set the background of the box.
 *
 * ```ts
 * import { BackgroundSetting } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const BackgroundSetting: (props: BackgroundSettingProps) => import("@emotion/react/jsx-runtime").JSX.Element;
