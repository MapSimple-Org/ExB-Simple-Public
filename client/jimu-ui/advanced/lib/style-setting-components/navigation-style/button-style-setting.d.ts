import { type IconButtonStyles } from 'jimu-ui';
export interface ButtonStyleSettingProps {
    variant?: IconButtonStyles;
    onlyBorderColor?: boolean;
    onChange?: (property: string, value: any) => void;
    icon?: boolean;
    hideTextStyle?: boolean;
    onResetStyles?: (styles: Array<keyof IconButtonStyles>) => void;
}
export declare const ButtonStyleSetting: (props: ButtonStyleSettingProps) => import("@emotion/react/jsx-runtime").JSX.Element;
