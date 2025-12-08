import { React, type IntlShape, type IMThemeVariables } from 'jimu-core';
import { type LinkSelectorContentProps } from './link-selector-content';
/**
 * The LinkSelectorSidePopper props
 */
export interface LinkSelectorSidePopperProps extends LinkSelectorContentProps {
    /**
     * Callback when cancel setting.
     */
    onSettingCancel?: () => void;
    /**
     * Whether to show the setting popup.
     */
    isOpen?: boolean;
    /**
     * See `SidePopper` in jimu-ui/advanced/setting-components for more details.
     */
    trigger?: HTMLElement | HTMLElement[];
    /**
     * See `SidePopper` in jimu-ui/advanced/setting-components for more details.
     */
    backToFocusNode?: HTMLElement;
    /**
     * @ignore
     * @deprecated
     * Same with `isOpen`.
     */
    showDialog?: boolean;
    /**
     * @ignore
     */
    isLinkPageSetting?: boolean;
    /**
     * The popup shows next to left panel of builder or right panel of builder.
     */
    position?: 'right' | 'left';
    /**
     * The title of the popup.
     */
    title?: string;
}
interface ExtraProps {
    /**
     * @ignore
     */
    theme?: IMThemeVariables;
    /**
     * @ignore
     */
    intl: IntlShape;
}
/**
 * The `LinkSelectorSidePopper` component allows users to configure a link using a popup.
 *
 * ```ts
 * import { LinkSelectorSidePopper } from 'jimu-ui/advanced/setting-components'
 * ```
 */
export declare class _LinkSelectorSidePopper extends React.PureComponent<LinkSelectorSidePopperProps & ExtraProps, unknown> {
    close: () => void;
    getIsOpen: () => boolean;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * A component to set link, such as link to a view, a page or url
 */
export declare const LinkSelectorSidePopper: React.FC<import("react-intl").WithIntlProps<Pick<LinkSelectorSidePopperProps & ExtraProps, "intl" | keyof LinkSelectorSidePopperProps> & {
    theme?: IMThemeVariables;
}>> & {
    WrappedComponent: React.ComponentType<Pick<LinkSelectorSidePopperProps & ExtraProps, "intl" | keyof LinkSelectorSidePopperProps> & {
        theme?: IMThemeVariables;
    }>;
};
/**
 * @deprecated
 */
export declare const LinkSettingPopup: React.FC<import("react-intl").WithIntlProps<Pick<LinkSelectorSidePopperProps & ExtraProps, "intl" | keyof LinkSelectorSidePopperProps> & {
    theme?: IMThemeVariables;
}>> & {
    WrappedComponent: React.ComponentType<Pick<LinkSelectorSidePopperProps & ExtraProps, "intl" | keyof LinkSelectorSidePopperProps> & {
        theme?: IMThemeVariables;
    }>;
};
/**
 * @deprecated
 */
export type LinkSettingPopupProps = LinkSelectorSidePopperProps;
export {};
