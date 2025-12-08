import { type IMThemeVariables } from 'jimu-core';
import { type StandardComponentProps } from 'jimu-ui';
export interface ColorContrastWarningProps extends StandardComponentProps {
    /**
     * Background color
     */
    backgroundColor: string;
    /**
     * Foreground color
     */
    foregroundColor: string;
    /**
     * Theme variables. If backgroundColor and foregroundColor are theme color
     * variables (such as `var(--sys-color-surface-paper)`), theme is needed for
     * parsing the real color values.
     */
    theme?: IMThemeVariables;
}
/**
 * The `ColorContrastWarning` component displays a warning icon when the color
 * contrast is insufficient.
 *
 * ```ts
 * import { ColorContrastWarning } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const ColorContrastWarning: (props: ColorContrastWarningProps) => import("@emotion/react/jsx-runtime").JSX.Element;
