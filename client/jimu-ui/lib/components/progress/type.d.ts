import type { BrandFunctionColors } from 'jimu-theme';
export interface BasicProgressProps {
    /**
     * Defines color of the progress bar based on theme variables.
     * @default primary
     */
    color?: BrandFunctionColors | (string & {});
    /**
     * The value of the progress, which should be a number between 0 and 100.
     */
    value?: number;
    /**
     * The thickness of the progress track.
     * @default 2
     */
    thickness?: number;
    /**
     * Whether to show the number corresponding to the progress.
     * @default false
     */
    showProgress?: boolean;
}
