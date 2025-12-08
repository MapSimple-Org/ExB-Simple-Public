/**
 * The interface for the shadow of the jimu-theme.
 */
export interface Shadow {
    /**
     * The level 1 shadow.
     */
    shadow1: string;
    /**
     * The level 2 shadow.
     */
    shadow2: string;
    /**
     * The level 3 shadow.
     */
    shadow3: string;
}
/**
 * The options for the shadow of the jimu-theme.
 */
export type ShadowsOptions = Partial<Shadow>;
export declare const createShadow: (options: ShadowsOptions) => Shadow;
export default createShadow;
