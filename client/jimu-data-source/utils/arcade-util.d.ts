export declare const arcadeDataSourceProfile: {
    id: string;
    bundles: string[];
    variables: any[];
};
export interface ArcadeDataSourceResult {
    layer?: __esri.FeatureLayer;
    arcadeResult?: any;
}
/**
 * The result of executing an Arcade script can be a FeatureLayer or a result.
 * When the result is a FeatureLayer, we'll use the layer to create a data source.
 * When the result is not a FeatureLayer, we'll load the features from the result when widgets need to query data.
 */
export declare function execArcadeDataSourceScript(script: string, abortSignal?: AbortSignal): Promise<ArcadeDataSourceResult>;
