import { type StandardComponentProps } from 'jimu-ui';
import { type ColorItem } from './color-swatch';
/**
 * The Sketch component props.
 */
export interface SketchProps extends StandardComponentProps {
    /**
     * The currently selected color as a string.
     */
    color?: string;
    /**
     * An array of preset color items to display as selectable options.
     */
    presetColors?: ColorItem[] | string[];
    /**
     * If true, disables the alpha (transparency) slider in the color picker.
     * @default false
     */
    disableAlpha?: boolean;
    /**
     * If true, displays the eye dropper tool for picking colors from the screen.
     * @default true
     */
    showPicker?: boolean;
    /**
     * Callback function that is called when the color changes. Receives the new color as a string.
     */
    onChange?: (color: string) => void;
    /**
   * Whether the color picker can be reset.
   * @default false
   */
    resettable?: boolean;
    /**
     * Callback fired when the reset button is clicked.
     */
    onReset?: () => void;
}
/**
 * The Sketch component is a color picker that allows users to select colors using a saturation and hue interface.
 * The Sketch component will try to output a color string in the format of hex if no alpha is present(alpha is 1), otherwise it will output an rgba string.
 *
 * ```tsx
 * import { Sketch } from 'jimu-ui/basic/color-picker'
 * ```
 */
export declare const Sketch: (props: SketchProps) => import("@emotion/react/jsx-runtime").JSX.Element;
