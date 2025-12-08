import { type ImmutableArray } from 'jimu-core';
/**
 * The MapWidgetSelector component props
 */
export interface MapWidgetSelectorProps {
    /**
     * The array of Map widget IDs. It is returned from the onSelect function.
     */
    useMapWidgetIds?: ImmutableArray<string>;
    /**
     * Whether automatically select the only Map widget in the same page/window
     * @default true
     */
    autoSelect?: boolean;
    /**
     * The function will be called when a Map widget item listed in this component is selected.
     */
    onSelect?: (useMapWidgetIds: string[]) => void;
    /**
     * Whether need a confirm modal popup when changed the connected map widget.
     * @default false
     */
    isNeedConfirmBeforeChange?: boolean;
    /**
     * Defines the confirm text if need a confirm modal.
     */
    confirmMessage?: string;
    /**
     * If true, show a default label('Select a map widget')
     * @default false
     */
    showLabel?: boolean;
    /**
     * Show a warning message for a non-empty string
     * @default ''
     */
    warningMessage?: string;
    /**
     * To provide a label for interactive components for accessibility purposes.
     * By default, the accessible name is computed from any text content inside the element.
     */
    'aria-label'?: string;
    /**
     * To provide a description for interactive components for accessibility purposes.
     * `aria-describedby` has a high priority than `a11y-description`.
     */
    'a11y-description'?: string;
    /**
     * Identifies the element (or elements) that describes the object for accessibility purposes.
     */
    'aria-describedby'?: string;
}
export declare const MapWidgetSelectorComponent: (props: MapWidgetSelectorProps) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * A react component for selecting Map widgets. It is usually used on the setting page of a widget,
 * and works with JimuMapViewComponent, JimuLayerViewComponent, JimuMapViewS and JimuLayerViewSelector.
 */
export declare const MapWidgetSelector: (props: MapWidgetSelectorProps) => import("@emotion/react/jsx-runtime").JSX.Element;
