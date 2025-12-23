import React, { useEffect, useRef, useState, useCallback } from 'react';
import { jsx } from 'jimu-core';
import { Label, NumericInput, Select, Option, Button } from 'jimu-ui';
import { CollapsableCheckbox } from 'jimu-ui/advanced/setting-components';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import Graphic from 'esri/Graphic';
import geometryEngineAsync from 'esri/geometry/geometryEngineAsync';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import Color from '@arcgis/core/Color';

interface ExtendedGraphic extends __esri.Graphic {
    isBufferDrawing?: boolean;
    sourceGraphicId?: string;
    bufferGraphic?: ExtendedGraphic | null;
    bufferSettings?: {
        distance: number;
        unit: string;
        enabled: boolean;
        opacity?: number;
    } | null;
}

interface BufferControlsProps {
    jimuMapView: any;
    sketchViewModel: __esri.SketchViewModel;
}

const asExtended = (g: __esri.Graphic) => g as ExtendedGraphic;

export const BufferControls: React.FC<BufferControlsProps> = ({ jimuMapView, sketchViewModel }) => {
    // OFF by default
    const [bufferEnabled, setBufferEnabled] = useState<boolean>(false);
    const [bufferDistance, setBufferDistance] = useState<number>(100);
    const [bufferUnit, setBufferUnit] = useState<string>('feet');
    const [bufferOpacity, setBufferOpacity] = useState<number>(75);

    const geometryWatchers = useRef<Map<string, __esri.WatchHandle>>(new Map());

    // --- persistence ---
    const saveSettings = useCallback((partial?: { enabled?: boolean; distance?: number; unit?: string; opacity?: number }) => {
        try {
            const toSave = {
                enabled: bufferEnabled,
                distance: bufferDistance,
                unit: bufferUnit,
                opacity: bufferOpacity,
                ...partial
            };
            localStorage.setItem('bufferControlSettings', JSON.stringify(toSave));
        } catch { /* no-op */ }
    }, [bufferEnabled, bufferDistance, bufferUnit, bufferOpacity]);

    const loadSettings = useCallback(() => {
        try {
            const raw = localStorage.getItem('bufferControlSettings');
            if (!raw) return;
            const parsed = JSON.parse(raw);

            // Always start with buffers disabled, regardless of saved state
            // if (typeof parsed.enabled === 'boolean') setBufferEnabled(parsed.enabled); // REMOVED

            // Load other user preferences
            if (typeof parsed.distance === 'number') setBufferDistance(parsed.distance);
            if (typeof parsed.unit === 'string') setBufferUnit(parsed.unit);
            if (typeof parsed.opacity === 'number') setBufferOpacity(parsed.opacity);
        } catch { /* no-op */ }
    }, []);

    useEffect(() => { loadSettings(); }, [loadSettings]);
    useEffect(() => { saveSettings(); }, [bufferEnabled, saveSettings]);

    // cleanup
    useEffect(() => {
        return () => {
            geometryWatchers.current.forEach(w => { try { w.remove(); } catch { } });
            geometryWatchers.current.clear();
        };
    }, []);

    // --- helpers ---
    const getDrawLayer = useCallback((): GraphicsLayer | null => {
        const view = jimuMapView?.view;
        if (!view) return null;
        return view.map.findLayerById('DrawGL') as GraphicsLayer;
    }, [jimuMapView]);

    const colorToArray = (c: any): number[] => {
        if (!c) return [0, 0, 0, 1];
        if (Array.isArray(c)) return c.length >= 3 ? c : [0, 0, 0, 1];
        if (typeof c === 'object') {
            // @ts-ignore
            if ('r' in c && 'g' in c && 'b' in c) return [c.r ?? 0, c.g ?? 0, c.b ?? 0, c.a ?? 1];
            // @ts-ignore
            if (typeof c.toRgba === 'function') { try { return c.toRgba(); } catch { return [0, 0, 0, 1]; } }
        }
        return [0, 0, 0, 1];
    };

    const getSelectedMainGraphics = useCallback((): ExtendedGraphic[] => {
        const arr = sketchViewModel?.updateGraphics?.toArray?.() ?? [];
        return arr.filter((g: __esri.Graphic) => {
            const a = g.attributes || {};
            if (a.isBuffer || a.isMeasurementLabel || a.hideFromList) return false;
            if (g.geometry?.type === 'point' && g.symbol?.type === 'text' && a.isMeasurementLabel) return false;
            return true;
        }) as ExtendedGraphic[];
    }, [sketchViewModel]);

    // --- geometry/symbol ---
    const createBufferGeometry = async (geometry: __esri.Geometry, distance: number, unit: string) => {
        try {
            const view = jimuMapView?.view;
            if (!view) return null;
            const ge = await geometryEngineAsync;
            const linearUnit = unit as __esri.LinearUnits;
            const res = (view.spatialReference?.isGeographic || view.spatialReference?.isWebMercator)
                ? await ge.geodesicBuffer(geometry as any, distance, linearUnit)
                : await ge.buffer(geometry as any, distance, linearUnit, true);
            if (!res) return null;
            return Array.isArray(res) ? (res[0] ?? null) : res;
        } catch (e) {
            console.error('Buffer geometry error', e);
            return null;
        }
    };

    const makeBufferSymbol = (parent: ExtendedGraphic): SimpleFillSymbol => {
        const op = ((parent.bufferSettings?.opacity ?? bufferOpacity) / 100);
        const gType = parent.geometry?.type;

        let fill = new Color([0, 122, 194, 0.3 * op]);
        let out = new Color([0, 122, 194, 1.0 * op]);
        let width = 2.5;

        try {
            if (gType === 'polygon' && parent.symbol?.type === 'simple-fill') {
                const s = parent.symbol as __esri.SimpleFillSymbol;
                const fc = colorToArray(s.color);
                fill = new Color([fc[0], fc[1], fc[2], (fc[3] ?? 1) * op]);
                if (s.outline?.color) {
                    const oc = colorToArray(s.outline.color);
                    out = new Color([oc[0], oc[1], oc[2], (oc[3] ?? 1) * op]);
                }
                if (s.outline?.width) width = Math.max(s.outline.width * 1.2, 2.0);
            } else if (gType === 'polyline' && parent.symbol?.type === 'simple-line') {
                const l = parent.symbol as __esri.SimpleLineSymbol;
                const lc = colorToArray(l.color);
                fill = new Color([lc[0], lc[1], lc[2], (lc[3] ?? 1) * 0.6 * op]);
                out = new Color([lc[0], lc[1], lc[2], (lc[3] ?? 1) * op]);
                if (l.width) width = Math.max(l.width * 1.2, 2.0);
            } else if (gType === 'point' && parent.symbol?.type === 'simple-marker') {
                const m = parent.symbol as __esri.SimpleMarkerSymbol;
                const mc = colorToArray(m.color);
                fill = new Color([mc[0], mc[1], mc[2], (mc[3] ?? 1) * 0.6 * op]);
                out = new Color([mc[0], mc[1], mc[2], (mc[3] ?? 1) * op]);
                if (m.outline?.width) width = Math.max(m.outline.width * 1.2, 2.5);
            }
        } catch { /* defaults */ }

        return new SimpleFillSymbol({
            color: fill,
            outline: new SimpleLineSymbol({ color: out, width, style: 'dash' })
        });
    };

    const ensureWatcher = (parent: ExtendedGraphic) => {
        const id = parent.attributes?.uniqueId;
        if (!id) return;
        const existing = geometryWatchers.current.get(id);
        if (existing) { try { existing.remove(); } catch { } }
        const h = parent.watch('geometry', () => updateAttachedBuffer(parent));
        geometryWatchers.current.set(id, h);
    };

    const updateAttachedBuffer = async (parent: ExtendedGraphic) => {
        const layer = getDrawLayer();
        if (!layer || !parent.bufferGraphic || !parent.bufferSettings) return;
        try {
            const geom = await createBufferGeometry(parent.geometry, parent.bufferSettings.distance, parent.bufferSettings.unit);
            if (!geom) return;
            const buf = parent.bufferGraphic;
            layer.remove(buf);
            buf.geometry = geom;
            buf.symbol = makeBufferSymbol(parent);
            const idx = layer.graphics.indexOf(parent);
            if (idx >= 0) layer.graphics.add(buf, idx);
            else layer.add(buf);
        } catch (e) {
            console.error('Update buffer error', e);
        }
    };

    const createOrUpdateBufferFor = async (parent: ExtendedGraphic, distance: number, unit: string) => {
        const layer = getDrawLayer();
        if (!layer) return;

        const id = parent.attributes?.uniqueId;
        if (!id) return;

        const a = parent.attributes || {};
        if (a.isBuffer || a.isMeasurementLabel || a.hideFromList) return;
        if (parent.geometry?.type === 'point' && parent.symbol?.type === 'text') return;

        if (parent.bufferGraphic) {
            try { layer.remove(parent.bufferGraphic); } catch { }
            parent.bufferGraphic = null;
        }

        const geom = await createBufferGeometry(parent.geometry, distance, unit);
        if (!geom) return;

        parent.bufferSettings = { distance, unit, enabled: true, opacity: bufferOpacity };

        const buf = new Graphic({
            geometry: geom,
            symbol: makeBufferSymbol(parent),
            attributes: {
                uniqueId: `buffer_${id}_${Date.now()}`,
                name: `${a.name ?? 'Drawing'} Buffer`,
                parentId: id,
                isBuffer: true,
                hideFromList: true,
                isMeasurementLabel: false,
                bufferDistance: distance,
                bufferUnit: unit
            }
        }) as ExtendedGraphic;

        buf.isBufferDrawing = true;
        buf.sourceGraphicId = id;
        parent.bufferGraphic = buf;

        const idx = layer.graphics.indexOf(parent);
        if (idx >= 0) layer.graphics.add(buf, idx);
        else layer.add(buf);

        ensureWatcher(parent);
        window.dispatchEvent(new CustomEvent('saveDrawingsToStorage', { detail: { ts: Date.now() } }));
    };

    const removeBufferFor = (parent: ExtendedGraphic) => {
        const layer = getDrawLayer();
        if (!layer) return;
        const id = parent.attributes?.uniqueId;
        if (!id) return;

        if (parent.bufferGraphic) {
            try { layer.remove(parent.bufferGraphic); } catch { }
            parent.bufferGraphic = null;
        }
        parent.bufferSettings = null;

        const w = geometryWatchers.current.get(id);
        if (w) { try { w.remove(); } catch { } geometryWatchers.current.delete(id); }
    };

    const triggerSave = () => {
        window.dispatchEvent(new CustomEvent('saveDrawingsToStorage', { detail: { ts: Date.now() } }));
    };

    // auto-create buffer on new drawings when enabled
    useEffect(() => {
        if (!sketchViewModel) return;
        const handle = sketchViewModel.on('create', (evt: any) => {
            if (evt?.state === 'complete' && bufferEnabled) {
                const g = asExtended(evt.graphic);
                if (g?.geometry) {
                    setTimeout(async () => {
                        try {
                            await createOrUpdateBufferFor(g, bufferDistance, bufferUnit);
                            triggerSave();
                        } catch (e) { console.error('Auto buffer on create failed', e); }
                    }, 100);
                }
            }
        });
        return () => { try { handle.remove(); } catch { } };
    }, [sketchViewModel, bufferEnabled, bufferDistance, bufferUnit]);

    // --- button handlers (selected only) ---
    const handleUpdateBuffer = async () => {
        if (!bufferEnabled) return;
        const selected = getSelectedMainGraphics();
        for (const g of selected) {
            if (!g.bufferGraphic) await createOrUpdateBufferFor(g, bufferDistance, bufferUnit);
            else {
                if (g.bufferSettings) {
                    g.bufferSettings.distance = bufferDistance;
                    g.bufferSettings.unit = bufferUnit;
                }
                await updateAttachedBuffer(g);
            }
        }
        saveSettings({ distance: bufferDistance, unit: bufferUnit });
    };

    const handleUpdateOpacity = () => {
        if (!bufferEnabled) return;
        const selected = getSelectedMainGraphics();
        selected.forEach(g => {
            if (g.bufferSettings && g.bufferGraphic) {
                g.bufferSettings.opacity = bufferOpacity;
                g.bufferGraphic.symbol = makeBufferSymbol(g);
            }
        });
        saveSettings({ opacity: bufferOpacity });
        triggerSave();
    };

    const handleRemoveBuffer = () => {
        const selected = getSelectedMainGraphics();
        selected.forEach(g => removeBufferFor(g));
        triggerSave();
    };

    // --- UI ---
    return (
        <div className='drawToolbarDiv'>
            <CollapsableCheckbox
                className='w-100'
                label='Enable Buffer'
                checked={bufferEnabled}
                onCheckedChange={(val) => setBufferEnabled(val)}
                disableActionForUnchecked
                openForCheck
                closeForUncheck
            >
                <div className='ml-3 my-1'>
                    <div className='d-flex align-items-center mb-2'>
                        <Label className='mr-2 mb-0 d-flex align-items-center'>Distance:</Label>
                        <NumericInput
                            size='sm'
                            value={bufferDistance}
                            onChange={(v: number) => { setBufferDistance(v); saveSettings({ distance: v }); }}
                            className='mr-2'
                            style={{ width: '80px' }}
                            min={0.1}
                            step={0.1}
                        />
                        <Select
                            size='sm'
                            value={bufferUnit}
                            onChange={(e) => { const u = (e.target as HTMLSelectElement).value; setBufferUnit(u); saveSettings({ unit: u }); }}
                            style={{ width: '110px' }}
                        >
                            <Option value='feet'>Feet</Option>
                            <Option value='meters'>Meters</Option>
                            <Option value='miles'>Miles</Option>
                            <Option value='kilometers'>Kilometers</Option>
                        </Select>
                    </div>

                    <div className='d-flex align-items-center mb-2'>
                        <Label className='mr-2 mb-0 d-flex align-items-center'>Opacity:</Label>
                        <NumericInput
                            size='sm'
                            value={bufferOpacity}
                            onChange={(v: number) => { setBufferOpacity(v); saveSettings({ opacity: v }); }}
                            className='mr-2'
                            style={{ width: '80px' }}
                            min={1}
                            max={100}
                            step={1}
                        />
                        <span className='text-muted'>%</span>
                    </div>

                    <div className='d-flex gap-2 mt-1'>
                        <Button size='sm' onClick={handleUpdateBuffer} className='flex-fill' style={{ minWidth: 0 }} title='Update buffer geometry for selected graphics'>
                            Update Buffer
                        </Button>
                        <Button size='sm' onClick={handleUpdateOpacity} className='flex-fill' style={{ minWidth: 0 }} title='Update buffer opacity for selected graphics'>
                            Update Graphic
                        </Button>
                        <Button size='sm' onClick={handleRemoveBuffer} className='flex-fill' style={{ minWidth: 0 }} title='Remove buffers from selected graphics'>
                            Remove Buffer
                        </Button>
                    </div>
                </div>
            </CollapsableCheckbox>
        </div>
    );
};
