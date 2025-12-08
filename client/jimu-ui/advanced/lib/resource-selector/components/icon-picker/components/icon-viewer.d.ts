import { React, type IconResult } from 'jimu-core';
import type { IconPickerProps } from '..';
export interface IconViewerProps extends Pick<IconPickerProps, 'icon' | 'applyDefaultColor' | 'configurableOption' | 'previewOptions' | 'groups' | 'customIcons'> {
    isOpen?: boolean;
    className?: string;
    onChange?: (result: IconResult) => void;
    onIconUploadError?: () => void;
}
export declare const IconViewer: React.MemoExoticComponent<(props: IconViewerProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
