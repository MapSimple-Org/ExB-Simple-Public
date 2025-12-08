import type { IconButtonStyles } from 'jimu-ui';
import { type SizeColorSettingProps } from '../text-style/size-color-setting';
export interface IconStyleSettingProps extends Omit<SizeColorSettingProps, 'onChange'> {
    variant?: IconButtonStyles;
    onChange?: (property: string, value: IconButtonStyles['icon']) => void;
    onResetStyles?: (styles: Array<keyof IconButtonStyles>) => void;
}
export declare const IconStyleSetting: (props: IconStyleSettingProps) => import("@emotion/react/jsx-runtime").JSX.Element;
