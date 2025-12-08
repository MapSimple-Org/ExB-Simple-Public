import { React, type WidgetInitResizeCallback, type WidgetInitDragCallback } from 'jimu-core';
import { type FloatingPanelProps } from 'jimu-ui';
export interface SettingPopperProps extends FloatingPanelProps {
    /**
     * Callback function for registering and listening to resize for widget, which can be retrieved from props of the widget.
     */
    onInitResizeHandler?: WidgetInitResizeCallback;
    /**
     * Callback function for registering and listening to drag for widget, which can be retrieved from props of the widget.
     */
    onInitDragHandler?: WidgetInitDragCallback;
}
export declare const SettingPopper: React.ForwardRefExoticComponent<SettingPopperProps & React.RefAttributes<HTMLDivElement>>;
