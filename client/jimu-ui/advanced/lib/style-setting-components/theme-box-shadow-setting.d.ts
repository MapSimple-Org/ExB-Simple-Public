/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
import { type BoxShadowStyle } from 'jimu-ui';
/**
 * The `BoxShadowSetting` component props.
 */
export interface ThemeBoxShadowSettingProps {
    isCustom: boolean;
    /**
     * The value of this component, including the color, offset, etc.
     */
    value?: BoxShadowStyle;
    /**
     * Invoked when the box shadow value changes.
     */
    onChange?: (useCustom: boolean, value: BoxShadowStyle) => void;
    /**
     * Defines the class names added to the element.
     */
    className?: string;
    /**
     * The list of shadow styles.
     */
    shadowList?: {
        none: string;
        small: string;
        default: string;
        large: string;
    };
}
interface ExtraProps {
    intl?: IntlShape;
}
interface State {
    isDropdownOpen: boolean;
}
/**
 * The `BoxShadowSetting` component allows users to set the box-shadow of the box.
 *
 * ```ts
 * import { BoxShadowSetting } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare class _ThemeBoxShadowSetting extends React.PureComponent<ThemeBoxShadowSettingProps & ExtraProps, State> {
    static defaultProps: Partial<ThemeBoxShadowSettingProps & ExtraProps>;
    constructor(props: any);
    translate: (id: string) => string;
    toggleDropdown: () => void;
    getStyle: () => import("jimu-core").SerializedStyles;
    onCustomModeClick: () => void;
    isEmpty(): boolean;
    createItem: (mode: any) => import("@emotion/react/jsx-runtime").JSX.Element;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * The `BoxShadowSetting` component allows users to set the box-shadow of the box.
 *
 * ```ts
 * import { BoxShadowSetting } from 'jimu-ui/advanced/style-setting-components'
 * ```
 */
export declare const ThemeBoxShadowSetting: React.FC<import("react-intl").WithIntlProps<any>> & {
    WrappedComponent: React.ComponentType<any>;
};
export {};
