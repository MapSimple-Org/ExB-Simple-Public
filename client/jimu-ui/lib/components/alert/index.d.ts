import { React } from 'jimu-core';
import { type AlertPanelProps } from './panel';
import { type AlertTooltipProps } from './tooltip';
import type { AlertForm } from './type';
/**
 * The `Alert` component props.
 */
export interface AlertProps extends AlertTooltipProps, AlertPanelProps {
    /**
       * Display form of warning message.
       * @default basic
       */
    form?: AlertForm;
}
/**
 * The `Alert` component displays a short, important message in a way that attracts the user's attention without interrupting the user's task.
 *
 * ```ts
 * import { Alert } from 'jimu-ui'
 * ```
 */
export declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLElement>>;
export * from './button';
export * from './panel';
