/** @jsx jsx */
import { React } from 'jimu-core';
/**
 * The AddItemDialog component props.
 */
export interface ExportDataDialogProps {
    defaultName?: string;
    keepOpenAfterConfirm: boolean;
    sourceWkid?: number;
    targetWkid?: number;
    format: 'Shapefile' | 'File Geodatabase' | 'KML';
    reference: Element;
    /**
     * Be invoked when clicking the cancel button.
     */
    onClose?: () => void;
    /**
     * Be invoked when clicking the ok button.
     */
    onConfirm: (name: string, folderId: string) => Promise<string>;
}
export declare function ExportLoadingIndicator(props: {
    message: string;
}): import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * The `ExportDataDialog` component let users to export shapefile, file gdb and kml.
 *
 * ```ts
 * import { ExportDataDialog } from 'jimu-ui'
 * ```
 */
export declare function ExportDataDialog(props: ExportDataDialogProps): React.JSX.Element;
