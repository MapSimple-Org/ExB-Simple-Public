import { React } from 'jimu-core';
import type { Placement } from '../overlay';
import { type TooltipProps } from '../tooltip';
import { type AlertButtonProps } from './button';
/**
 * The `AlertTooltip` component props.
 */
export interface AlertTooltipProps extends AlertButtonProps, Pick<TooltipProps, 'showArrow' | 'interactive' | 'leaveDelay'> {
    /**
     * Text content to display.
     */
    text?: string;
    /**
     * The placement of the tooltip.
     * @default bottom
     */
    placement?: Placement;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode | undefined;
}
/**
 * The `AlertTooltip` component is used to display warning messages in the form of tooltips.
 *
 * ```ts
 * import { AlertTooltip } from 'jimu-ui'
 * ```
 */
export declare const AlertTooltip: React.ForwardRefExoticComponent<AlertTooltipProps & React.RefAttributes<HTMLButtonElement>>;
