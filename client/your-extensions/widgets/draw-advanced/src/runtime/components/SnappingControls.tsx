import { React, ImmutableObject } from 'jimu-core';
import { CollapsableCheckbox, Alert } from 'jimu-ui';
import { JimuMapView } from 'jimu-arcgis';
import FeatureSnappingLayerSource from 'esri/views/interactive/snapping/FeatureSnappingLayerSource';
import FeatureLayer from 'esri/layers/FeatureLayer';
import Collection from 'esri/core/Collection';

interface SnappingControlsProps {
    jimuMapView: JimuMapView;
    sketchViewModel: __esri.SketchViewModel;
}

export const SnappingControls = (props: SnappingControlsProps): JSX.Element => {
    const [enabled, setEnabled] = React.useState(false);
    const [snapSourcesCount, setSnapSourcesCount] = React.useState(0);
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const processedLayerKeys = React.useRef(new Set<string>());

    const isSnappableLayer = (layer: any): boolean => {
        if (!layer?.visible) return false;
        const snappableTypes = ['feature', 'graphics', 'csv', 'geojson', 'wfs'];
        return snappableTypes.includes(layer?.type?.toLowerCase() || '');
    };

    const addSnappingSource = (layer: any, snapSources: __esri.FeatureSnappingLayerSource[], key: string) => {
        if (processedLayerKeys.current.has(key)) return;
        try {
            const source = new FeatureSnappingLayerSource({ layer, enabled: true });
            snapSources.push(source);
            processedLayerKeys.current.add(key);
        } catch (err) {
            console.warn(`Failed to add snapping source for ${key}: ${err.message}`);
        }
    };

    const recurseLayers = async (
        layer: any,
        snapSources: __esri.FeatureSnappingLayerSource[],
        depth = 0
    ) => {
        if (!layer || depth > 10 || !layer.visible) return;

        const key = layer.id || layer.url || `${layer.title}-${depth}`;

        if (isSnappableLayer(layer)) {
            addSnappingSource(layer, snapSources, key);
        }

        if (layer?.url && layer?.type === 'sublayer' && layer?.layerType === 'Feature Layer') {
            const urlKey = `url:${layer.url}`;
            if (!processedLayerKeys.current.has(urlKey)) {
                try {
                    const featureLayer = new FeatureLayer({ url: layer.url, visible: true, outFields: ['*'] });
                    await featureLayer.load();
                    addSnappingSource(featureLayer, snapSources, urlKey);
                } catch (err) {
                    console.warn(`❌ Could not load feature layer from URL ${layer.url}: ${err.message}`);
                }
            }
        }

        const sublayerCollections = [
            layer.sublayers,
            layer.allSublayers,
            layer.layers,
            layer.subLayers,
            layer.layerInfos
        ];

        for (const coll of sublayerCollections) {
            if (coll?.items) {
                for (const sub of coll.items) await recurseLayers(sub, snapSources, depth + 1);
            } else if (Array.isArray(coll)) {
                for (const sub of coll) await recurseLayers(sub, snapSources, depth + 1);
            }
        }
    };

    const configureSnapping = async () => {
        setIsLoading(true);
        setError(null);
        processedLayerKeys.current.clear();

        const view = props.jimuMapView?.view;
        const sketchVM = props.sketchViewModel;

        if (!view) {
            setError('Map view is not available.');
            setIsLoading(false);
            return;
        }
        if (!sketchVM) {
            setError('SketchViewModel is not available.');
            setIsLoading(false);
            return;
        }

        try {
            const snapSources: __esri.FeatureSnappingLayerSource[] = [];
            const allLayers = view.map.allLayers.toArray();

            await Promise.all(
                allLayers
                    .filter((l) => l.load && !l.loaded)
                    .map((l) => l.load().catch(() => { }))
            );

            for (const layer of allLayers) {
                await recurseLayers(layer, snapSources);
            }

            const options = {
                enabled: true,
                featureEnabled: true,
                selfEnabled: true,
                distance: 15,
                featureSources: new Collection(snapSources)
            };

            sketchVM.snappingOptions = options;
            (view as any).snappingOptions = options;

            setSnapSourcesCount(snapSources.length);
            if (snapSources.length === 0) {
                setError('No visible snappable layers found.');
            }
        } catch (err: any) {
            console.error('Error configuring snapping:', err);
            setError(`Snapping failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = () => {
        const newState = !enabled;
        setEnabled(newState);
    };

    React.useEffect(() => {
        if (enabled && props.jimuMapView?.view && props.sketchViewModel) {
            configureSnapping();
        }
        // Added Jeff
        if (!enabled && props.jimuMapView?.view && props.sketchViewModel) {
            props.sketchViewModel.snappingOptions.enabled = false
        }
        //End Jeff Add
    }, [enabled, props.jimuMapView, props.sketchViewModel]);

    //Jeff changed div className from w-100 to drawToolbarDiv, CollapsableCheckbox classname to w-100, make label text responsive
    return (
        <div className='drawToolbarDiv'>
            <CollapsableCheckbox
                label={enabled ? 'Disable Snapping' : 'Enable Snapping'}
                checked={enabled}
                onCheckedChange={handleToggle}
                disableActionForUnchecked
                openForCheck
                closeForUncheck
                className='w-100'
            >
                <div className='ml-3 my-1'>
                    <ul className='text-dark m-0 pl-3 small'>
                        <li>Hold <strong>Ctrl</strong> (Windows) or <strong>Cmd</strong> (Mac) to temporarily disable snapping.</li>
                        <li>Snap to feature vertices, edges, and intersections while drawing.</li>
                    </ul>
                    {isLoading && <p className='text-info my-1'>Configuring snapping...</p>}
                    {error && (
                        <Alert type='warning' className='mt-2' withIcon text={error} closable />
                    )}
                </div>
            </CollapsableCheckbox>
        </div>
    );
};
