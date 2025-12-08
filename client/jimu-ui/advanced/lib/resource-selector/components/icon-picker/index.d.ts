import { React, type IconResult, type IMIconResult } from 'jimu-core';
import { type ButtonProps, type StandardComponentProps } from 'jimu-ui';
import type { PublicIconGroupType, ConfigurableOption, PreviewOptions } from './types';
/**
 * Properties for the IconPicker component.
 */
export interface IconPickerProps extends StandardComponentProps {
    /**
     * The selected icon.
     */
    icon?: IconResult;
    /**
     * Defines which icon properties can be configured in the icon picker.
     * @default color
     */
    configurableOption?: ConfigurableOption;
    /**
     * Turn on/off preview options in the icon picker's dropdown pane.
     * @default { size: true, color: true }
     */
    previewOptions?: PreviewOptions;
    /**
     * Whether to apply a default color `--ref-palette-neutral-1100` when the icon color is empty.
     * @default true
     */
    applyDefaultColor?: boolean;
    /**
     * The options apply to the dropdown button.
     * @default { type: 'secondary', size: 'sm' }
     */
    buttonOptions?: ButtonProps;
    /**
     * If `true`, the selected icon will display in the dropdown button.
     * @default true
     */
    showIcon?: boolean;
    /**
     * If `true`, the dropdown button icon rotates 90 degrees.
     *
     * This only works when `showIcon` is `true`.
     * @default false
     */
    vertical?: boolean;
    /**
     * Define whether the icon in the dropdown button applies icon color.
     *
     * This only works when `showIcon` is `true`.
     * @default true
     */
    setButtonUseColor?: boolean;
    /**
     * If `true`, the button title of the selected icon will display in the button node.
     * @default false
     */
    showLabel?: boolean;
    /**
     * If showLabel is `true` and the value is passed, it will be displayed as button title of the selected icon.
     * If showLabel is `true` and the value is not set, for the default icons or custom icons, the file name will be displayed as selected button title; for the uploaded icons, the original name will be displayed as selected button title.
     *
     * This only works when `showLabel` is `true`.
     */
    customLabel?: string;
    /**
     * If `true`, the remove button will be hidden.
     * @default false
     */
    hideRemove?: boolean;
    /**
     * The options apply to the remove button element.
     * @default { type: 'default', size: 'sm' }
     */
    removeButtonOptions?: ButtonProps;
    /**
     * Defines which groups of icons to show as the default icon options from Jimu Icon's predefined library.
     *
     * If not set, all icon groups will be shown.
     * If set to 'none', no default icons will be shown.
     * If set to a specific group, only that group will be shown.
     * If set to an array, multiple groups will be shown.
     *
     * PublicIconGroupType has the following values:
     * - 'generalAndArrows'
     * - 'directional'
     * - 'suggested'
     * - 'editor'
     * - 'data'
     * - 'brand'
     * - 'application'
     * - 'gis'
     */
    groups?: PublicIconGroupType | PublicIconGroupType[] | 'none';
    /**
     * Add additional icons as options.
     */
    customIcons?: IconResult[];
    /**
     * @default false
     * @ignore
     */
    useKeyUpEvent?: boolean;
    /**
     * Callback fired when the dropdown button is clicked.
     * @event
     * @property e - the click event raised by the dropdown button.
     */
    onButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    /**
     * Callback fired when the dropdown button is triggered by Keyboard.
     * @event
     * @property e - the keyboard event raised by the dropdown button.
     * @ignore
     */
    onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
    /**
     * Callback fired when the icon selection has been changed.
     * @event
     * @property result - the selected icon object.
     */
    onChange?: (result: IMIconResult) => void;
}
/**
 * The Icon Picker is used to select an icon from a predefined icon library. This is usually used in a setting panel.
 *
 * #### Example:
 * ```typescript
 * import { IconPicker } from 'jimu-ui/advanced/resource-selector'
 * import sampleIcon from 'jimu-icons/svg/outlined/xxx/widget.svg'
 * <IconPicker icon={{svg: sampleIcon, properties: {filename: 'widget.svg'}}} />
 * ```
 * #### Props:
 * See {@link IconPickerProps} for more details.
 */
export declare const IconPicker: React.MemoExoticComponent<(props: IconPickerProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
