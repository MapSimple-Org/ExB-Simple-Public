/** @jsx jsx */
import { React, type LayoutItemConstructorProps } from 'jimu-core';
export interface WidgetListProps {
    className?: string;
    isPlaceholder?: boolean;
    isAccepted: (item: LayoutItemConstructorProps, isReplacePlaceholder: boolean) => boolean;
    onSelect: (item: LayoutItemConstructorProps) => void;
    onWidgetLoaded?: () => void;
}
export declare const WidgetList: React.FC<import("react-intl").WithIntlProps<WidgetListProps>> & {
    WrappedComponent: React.ComponentType<WidgetListProps>;
};
