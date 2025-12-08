import { React } from 'jimu-core';
import type { IconPickerProps } from '..';
export interface IconPreviewProps extends Pick<IconPickerProps, 'icon' | 'configurableOption' | 'previewOptions'> {
    showColorSketch: boolean;
    onColorBlockClick: () => void;
    onSizeChange: (size: number) => void;
}
export declare const IconPreview: React.MemoExoticComponent<(props: IconPreviewProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
