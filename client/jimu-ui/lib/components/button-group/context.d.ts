import * as React from 'react';
import type { ButtonGroupProps } from './button-group';
interface ButtonGroupContextType {
    className?: string;
    color?: ButtonGroupProps['color'];
    disabled?: boolean;
    fullWidth?: boolean;
    size?: ButtonGroupProps['size'];
    variant?: ButtonGroupProps['variant'];
}
/**
 * @ignore - internal component.
 */
declare const ButtonGroupContext: React.Context<ButtonGroupContextType>;
export default ButtonGroupContext;
