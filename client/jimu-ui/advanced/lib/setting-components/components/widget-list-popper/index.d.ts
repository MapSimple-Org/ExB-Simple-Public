/** @jsx jsx */
import { React, type LayoutItemConstructorProps } from 'jimu-core';
import { type Placement } from 'jimu-ui';
import type { SerializedStyles } from 'jimu-theme';
export interface WidgetListPopperProps {
    className?: string;
    referenceElement: HTMLElement;
    isPlaceholder?: boolean;
    isAccepted: (item: LayoutItemConstructorProps, isReplacePlaceholder: boolean) => boolean;
    onSelect: (item: LayoutItemConstructorProps) => void;
    onClose: (evt?: React.MouseEvent<any>) => void;
    placement?: Placement;
    css?: SerializedStyles;
}
export declare const WidgetListPopper: React.FC<import("react-intl").WithIntlProps<WidgetListPopperProps>> & {
    WrappedComponent: React.ComponentType<WidgetListPopperProps>;
};
