/** @jsx jsx */
import { React, type IntlShape } from 'jimu-core';
import { DistanceUnits, type LinearUnit } from 'jimu-ui';
import { LayoutItemSizeModes } from 'jimu-layouts/layout-runtime';
/**
 * The SizeEditor component props.
 */
interface Props {
    /**
     * @ignore
     */
    label: string;
    /**
     * The current size mode, one of `LayoutItemSizeModes`.
     */
    mode: LayoutItemSizeModes;
    /**
     * Whether to disable the mode select.
     */
    disableModeSelect?: boolean;
    /**
     * The current size value.
     */
    value?: LinearUnit | string;
    /**
     * The units available for the size value.
     */
    availableUnits?: DistanceUnits[];
    /**
     * The size modes available for the size value.
     */
    sizeModes?: LayoutItemSizeModes[];
    /**
     * Whether to disable all options and show Auto.
     */
    disabled?: boolean;
    /**
     * Fires when the mode select changes.
     * @event
     */
    onModeChange?: (mode: LayoutItemSizeModes) => void;
    /**
     * Fires when the size value changes.
     * @event
     */
    onChange: (value: LinearUnit) => void;
}
interface ExtraProps {
    intl: IntlShape;
}
export declare class _SizeEditor extends React.PureComponent<Props & ExtraProps> {
    static defaultProps: Partial<Props>;
    constructor(props: any);
    handleChange: (value: LayoutItemSizeModes) => void;
    nls: (id: string) => string;
    getPopperStyle: () => import("jimu-core").SerializedStyles;
    getStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const SizeEditor: React.FC<import("react-intl").WithIntlProps<Props & ExtraProps>> & {
    WrappedComponent: React.ComponentType<Props & ExtraProps>;
};
export {};
