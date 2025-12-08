import { React } from 'jimu-core';
import { type ButtonSize } from 'jimu-ui';
/**
 * The DirectionSelector component props.
 */
export interface DirectionSelectorProps extends Omit<React.HtmlHTMLAttributes<HTMLDivElement>, 'onChange'> {
    /**
     * Defines the size of this component.
     * @default sm
     */
    size?: ButtonSize;
    /**
     * Flip the icon automatically if the locale is following right-to-left (RTL).
     * @default true
     */
    autoFlip?: boolean;
    /**
     * Display components vertically or not.
     * @default false
     */
    vertical?: boolean;
    /**
     * Invoked when direction changes.
     * @param vertical
     * @event
     */
    onChange?: (vertical?: boolean) => void;
}
/**
 * The `DirectionSelector` component provides the user with the ability to set the direction.
 *
 * ```ts
 * import { DirectionSelector } from 'jimu-ui/advanced/setting-components'
 * ```
 */
export declare const DirectionSelector: (props: DirectionSelectorProps) => import("@emotion/react/jsx-runtime").JSX.Element;
