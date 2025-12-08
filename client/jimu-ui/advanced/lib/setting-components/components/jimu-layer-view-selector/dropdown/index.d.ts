import { type JimuLayerViewSelectorProps } from '../selector';
export interface JimuLayerViewSelectorDropdownProps extends Omit<JimuLayerViewSelectorProps, 'isInDropdown'> {
}
/**
 * A component for selecting layers in a map view. It is usually used on the settings page of a widget.
 * It includes a dropdown button to display the selected values and JimuLayerViewSelector component to select the layer.
 * ```
 * import { JimuLayerViewSelectorDropdown } from 'jimu-ui/advanced/setting-components'
 * ```
 */
export declare const JimuLayerViewSelectorDropdownComponent: (props: JimuLayerViewSelectorDropdownProps) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * A component for selecting layers in a map view. It is usually used on the settings page of a widget.
 * It includes a dropdown button to display the selected values and JimuLayerViewSelector component to select the layer.
 * ```
 * import { JimuLayerViewSelectorDropdown } from 'jimu-ui/advanced/setting-components'
 * ```
 */
export declare const JimuLayerViewSelectorDropdown: import("@emotion/styled").StyledComponent<JimuLayerViewSelectorDropdownProps, {}, {}>;
