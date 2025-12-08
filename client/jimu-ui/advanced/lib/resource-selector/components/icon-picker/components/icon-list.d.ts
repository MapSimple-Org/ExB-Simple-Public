import { type IconProps, React } from 'jimu-core';
import type { IconPickerProps } from '..';
interface IconListProps extends Pick<IconPickerProps, 'icon' | 'groups' | 'customIcons'> {
    isOpen: boolean;
    showColorSketch: boolean;
    onIconChange: (iconComponent: string, iconProps: Partial<IconProps>) => void;
    onError?: () => void;
}
export declare const IconList: React.MemoExoticComponent<(props: IconListProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
export {};
