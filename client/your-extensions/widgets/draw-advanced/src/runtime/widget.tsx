/** @jsx jsx */
import { React, AllWidgetProps, jsx, WidgetState } from 'jimu-core';
import { useEffect, useRef, useState } from 'react';
import { IMConfig, DrawMode } from '../config';
import {
	Icon, Button, TextInput, NumericInput, Switch, TextAlignValue, Popper, Checkbox,
	Slider, Label, defaultMessages, AdvancedButtonGroup, Select, Option, CollapsablePanel
} from 'jimu-ui';
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash';
import { ArrowRedoOutlined } from 'jimu-icons/outlined/directional/arrow-redo';
import { ArrowUndoOutlined } from 'jimu-icons/outlined/directional/arrow-undo';
import { WrongOutlined } from 'jimu-icons/outlined/suggested/wrong';
import { CloseOutlined } from 'jimu-icons/outlined/editor/close';
import SettingOutlined from 'jimu-icons/svg/outlined/application/setting.svg'
import { JimuMapView, JimuMapViewComponent } from 'jimu-arcgis';
import { getStyle } from './lib/style';
import defMessages from './translations/default';
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel';
import { SymbolSelector, JimuSymbolType } from 'jimu-ui/advanced/map';
import { InputUnit } from 'jimu-ui/advanced/style-setting-components';
import { ColorPicker } from 'jimu-ui/basic/color-picker';
import Color from '@arcgis/core/Color';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import Graphic from 'esri/Graphic';
import TextSymbol from 'esri/symbols/TextSymbol';
import hAlignLeft from 'jimu-icons/svg/outlined/editor/text-left.svg';
import hAlignCenter from 'jimu-icons/svg/outlined/editor/text-center.svg';
import hAlignRight from 'jimu-icons/svg/outlined/editor/text-right.svg';
import esriColor from 'esri/Color';
import './widget.css';
import Measure from './components/measure';
import { MyDrawingsPanel } from './components/MyDrawingsPanel';
import { SnappingControls } from './components/SnappingControls';
import { BufferControls } from './components/BufferControls';
import { Tabs, Tab } from 'jimu-ui';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import SimpleMarkerSymbol from 'esri/symbols/SimpleMarkerSymbol';

const pinIcon = require('./assets/pin.svg');
const curveIcon = require('./assets/curve.svg');
const lineIcon = require('./assets/polygonal.svg');
const rectIcon = require('./assets/rectangle.svg');
const polyIcon = require('./assets/polygon.svg');
const freePolyIcon = require('./assets/irregular.svg');
const circleIcon = require('./assets/circle.svg');
const textIcon = require('./assets/text.svg');
const vAlignTop = require('./assets/text-align-v-t.svg');
const vAlignBot = require('./assets/text-align-v-b.svg');
const vAlignMid = require('./assets/text-align-v-m.svg');
const vAlignBase = require('./assets/text-align-v-base.svg');
const fsBoldIcon = require('./assets/bold.svg');
const fItalicIcon = require('./assets/italic.svg');
const fUnderlineIcon = require('./assets/underline.svg');

interface States {
	currentJimuMapView: JimuMapView;
	graphics?: any[];
	pointBtnActive: boolean;
	lineBtnActive: boolean;
	flineBtnActive: boolean;
	rectBtnActive: boolean;
	polygonBtnActive: boolean;
	fpolygonBtnActive: boolean;
	circleBtnActive: boolean;
	undoBtnActive: boolean;
	redoBtnActive: boolean;
	clearBtnActive: boolean;
	textBtnActive: boolean;
	showSymPreview: boolean;
	showTextPreview: boolean;
	currentSymbol: any;
	currentSymbolType: JimuSymbolType;
	currentTextSymbol: TextSymbol;
	drawGLLengthcheck: boolean;
	currentTool: 'point' | 'polyline' | 'freepolyline' | 'extent' | 'polygon' | 'circle' | 'freepolygon' | 'text' | '';
	clearBtnTitle: string;
	canUndo: boolean;
	canRedo: boolean;
	textSymPreviewText: string;
	fontColor: string;
	fontSize: string;
	fontHaloSize: number;
	fontHaloColor: string;
	fontHaloEnabled: boolean;
	fontHalo: string;
	fontWeight: string;
	fontDecoration: string;
	fontStyle: string;
	hTextAlign: TextAlignValue;
	vTextAlign: 'baseline' | 'top' | 'middle' | 'bottom';
	fontRotation: number;
	vAlignBaseBtnActive: boolean;
	vAlignTopBtnActive: boolean;
	vAlignMidBtnActive: boolean;
	vAlignBotBtnActive: boolean;
	textPreviewHeight: number;
	hAlignLeftBtnActive: boolean;
	hAlignCenterBtnActive: boolean;
	hAlignRightBtnActive: boolean;
	fsBoldBtnActive: boolean;
	fsItalicBtnActive: boolean;
	fsUnderlineBtnActive: boolean;
	widgetInit: boolean;
	textPreviewisOpen: boolean;
	fontOpacity: number;
	fontHaloOpacity: number;
	textHasChanged: boolean;
	rotationMode: boolean;
	drawLayerTitle: string;
	listMode: string;
	confirmDelete: boolean;
	fontBackgroundColor: string | null | esriColor;
	showDrawingsPanel: boolean; // Added BM
	selectedDrawingIndex: number | null; // Added BM
	activeTab: 'draw' | 'mydrawings'; // Added BM
	selectedGraphicIndex: number | null;
	selectedGraphics: Set<number>;
	arrowEnabled: boolean;
	arrowPosition: 'start' | 'end' | 'both';
	arrowSize: number;
	measurementCheckboxOn: boolean;
}
interface ScrollIndicatorProps {
	children: React.ReactNode;
	className?: string;
}

interface ExtendedGraphic extends __esri.Graphic {
	measure?: {
		graphic: ExtendedGraphic;
		areaUnit?: string;
		lengthUnit?: string;
	};
	measureParent?: ExtendedGraphic;
	checked?: boolean;
	originalSymbol?: any;
	isBufferDrawing?: boolean;
	sourceGraphicId?: string;
	bufferGraphic?: ExtendedGraphic;
	_selectionOverlay?: __esri.Graphic | null;
	bufferSettings?: {
		distance: number;
		unit: string;
		enabled: boolean;
		opacity?: number;
	};
}

export const ScrollableContainer: React.FC<ScrollIndicatorProps> = ({
	children,
	className = ''
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [showTopShadow, setShowTopShadow] = useState(false);
	const [showBottomShadow, setShowBottomShadow] = useState(false);

	const checkScroll = () => {
		if (!containerRef.current) return;

		const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

		// Show top shadow if scrolled down
		setShowTopShadow(scrollTop > 10);

		// Show bottom shadow if there's more content below
		setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 10);
	};

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Initial check
		checkScroll();

		// Add scroll listener
		container.addEventListener('scroll', checkScroll);

		// Add resize observer to handle dynamic content changes
		const resizeObserver = new ResizeObserver(() => {
			setTimeout(checkScroll, 100); // Delay to allow content to settle
		});

		resizeObserver.observe(container);

		return () => {
			container.removeEventListener('scroll', checkScroll);
			resizeObserver.disconnect();
		};
	}, []);

	return (
		<div className="scrollable-container-wrapper">
			{/* Top scroll indicator */}
			<div
				className={`scroll-shadow scroll-shadow-top ${showTopShadow ? 'visible' : ''}`}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					height: '8px',
					background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)',
					pointerEvents: 'none',
					zIndex: 5,
					opacity: showTopShadow ? 1 : 0,
					transition: 'opacity 0.3s ease'
				}}
			/>

			{/* Scrollable content */}
			<div
				ref={containerRef}
				className={`tab-content ${className}`}
				style={{
					flex: 1,
					overflowY: 'auto',
					overflowX: 'hidden',
					minHeight: 0,
					position: 'relative'
				}}
			>
				{children}
			</div>

			{/* Bottom scroll indicator */}
			<div
				className={`scroll-shadow scroll-shadow-bottom ${showBottomShadow ? 'visible' : ''}`}
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: '8px',
					background: 'linear-gradient(to top, rgba(0,0,0,0.1), transparent)',
					pointerEvents: 'none',
					zIndex: 5,
					opacity: showBottomShadow ? 1 : 0,
					transition: 'opacity 0.3s ease'
				}}
			/>
		</div>
	);
};

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, States> {
	textPreviewSpan: React.RefObject<HTMLSpanElement> = React.createRef();
	sketchViewModel: SketchViewModel;
	drawLayer: GraphicsLayer = null;
	Graphic: typeof __esri.Graphic = null;
	creationMode: DrawMode;
	currentSymbol: __esri.SimpleMarkerSymbol | __esri.PictureMarkerSymbol | __esri.PointSymbol3D | __esri.SimpleFillSymbol | __esri.PolygonSymbol3D | __esri.SimpleLineSymbol | __esri.LineSymbol3D;
	measureRef: React.RefObject<any> = React.createRef();
	
	private _selectionEpoch = 0;
	private _measurementWasEnabled: boolean = false;
	private _measurementUpdateTimeout: any = null;
	private _activeMeasurementUpdateTimeout: any = null;
	private _positionWatchers: { [key: string]: __esri.WatchHandle } = {};
	private handleTabChange = (nextTab: 'draw' | 'mydrawings') => {
		if (nextTab === 'mydrawings') {
			const drawings = this.snapshotDrawingsFromLayer();
			this.myDrawingsRef?.current?.ingestDrawings?.(drawings);

			// Stop any active drawing so clicks on My Drawings won't complete a shape
			this.setDrawToolBtnState('');
			try { this.sketchViewModel?.cancel(); } catch { }

			// Turn off edit mode only (keep existing measurement labels visible)
			this.measureRef?.current?.disableMeasurementEditing?.();

			this.setState({ graphics: drawings, activeTab: 'mydrawings' });
			return;
		}

		// Back to Draw: FIRST disable measurements synchronously
		if (this.measureRef?.current) {
			// Disable measurements IMMEDIATELY before any state changes
			this.measureRef.current.setMeasurementEnabled?.(false);
		}

		// THEN clear drawing tool and update state
		this.setDrawToolBtnState('');

		this.setState({
			activeTab: nextTab,
			measurementCheckboxOn: false,
			// Clear all drawing tool states
			pointBtnActive: false,
			lineBtnActive: false,
			flineBtnActive: false,
			rectBtnActive: false,
			polygonBtnActive: false,
			fpolygonBtnActive: false,
			circleBtnActive: false,
			textBtnActive: false,
			currentTool: ''
		});
	};
	private onMeasurementCheckboxChange = (checked: boolean) => {
		// Update your own UI state if you track it
		this.setState({ measurementCheckboxOn: checked });

		// Push state to Measure so ONLY the checkbox controls new label generation
		this.measureRef?.current?.setMeasurementEnabled?.(checked);
	};
	private _savePositionTimeout: any = null;
	private renderSymbolSelectorSection() {
		const { currentSymbol, currentSymbolType, rotationMode } = this.state;

		return (
			<div className='mb-2'>
				<h6 className='drawToolbarDiv'>Change symbol style:</h6>
				<div className="myss border" style={{width: '90%', margin: '0 auto'}}>
					<SymbolSelector
						symbol={currentSymbol}
						jimuSymbolType={currentSymbolType}
						btnSize={'sm'}
						onPopperToggle={this.onSymbolPopper}
						onPointSymbolChanged={this.onPointSymChanged}
						onPolygonSymbolChanged={this.onPolygonSymbolChanged}
						onPolylineSymbolChanged={this.onPolylineSymbolChanged}
						theme={this.props.theme}
					/>
				</div>

				{/* Point symbol rotation controls */}
				{rotationMode && (
					<div className='drawToolbarDiv'>
						<h6 className='mt-2'>Rotate Point Symbol:</h6>
						<div className='w-100 d-flex align-items-center'>
							<NumericInput
								size='sm'
								value={this.state.currentSymbol.angle}
								min={0}
								max={360}
								step={0.1}
								onChange={(e) => this.handlePointRotation(e)}
								className='mr-2 decimalInput'
							/>
							<span>0°</span>
							<Slider
								value={this.state.currentSymbol.angle}
								min={0}
								max={360}
								step={0.1}
								onChange={(e) => this.handlePointRotation(e)}
								className='mx-2 flex-grow-1'
							/>
							<span>360°</span>
						</div>
					</div>
				)}

				{/* Arrow controls for polylines */}
				{currentSymbolType === JimuSymbolType.Polyline && this.renderArrowControls()}
			</div>
		);
	}
	private snapshotDrawingsFromLayer = (): any[] => {
		if (!this.drawLayer || !this.drawLayer.graphics) return [];
		const all = this.drawLayer.graphics.toArray();

		// Exclude labels/overlays/buffers, keep real user drawings
		return all.filter((g: any) => {
			if (g?.attributes?.isMeasurementLabel) return false;
			if (g?.attributes?.isSelectionOverlay) return false;
			if (g?.attributes?.isPreviewBuffer || g?.attributes?.isBuffer || g?.attributes?.isBufferDrawing) return false;
			return !!g?.geometry;
		});
	};

	private myDrawingsRef: React.RefObject<MyDrawingsPanel> = React.createRef();
	private _drawingMap: Map<string, number> = new Map();
	private renderTextSymbolPreviewButton() {
		const { fontColor, fontSize, fontWeight, fontStyle, fontDecoration, fontRotation, fontHalo, currentTextSymbol } = this.state;

		// Convert Color object to CSS color string with proper type checking
		const backgroundColorString = currentTextSymbol.backgroundColor
			? (typeof currentTextSymbol.backgroundColor === 'string'
				? currentTextSymbol.backgroundColor
				: `rgba(${currentTextSymbol.backgroundColor.r}, ${currentTextSymbol.backgroundColor.g}, ${currentTextSymbol.backgroundColor.b}, ${currentTextSymbol.backgroundColor.a})`)
			: 'transparent';

		return (
			<div className='mb-2'>
				<h6 className='drawToolbarDiv'>Change text options:</h6>
				<div className="myss">
					<div className="jimu-symbol-selector" style={{ width: '90%', margin: '0 auto' }}>
						<Button
							size='sm'
							type='default'
							onClick={this.showTextSymbolPopper}
							id={this.props.widgetId + '_btnTextSymbol'}
							style={{
								width: '100%',
								height: '36px',
								padding: '0',
								backgroundColor: backgroundColorString
							}}
						>
							<span className='icon-btn-sizer'>
								<div className="justify-content-center align-items-center symbol-wapper outer-preview-btn d-flex">
									<div className="w-100 h-100 justify-content-center d-flex align-items-center symbol-item text-symbol-item">
										<span className='text-symbol-span' style={{
											color: fontColor,
											fontSize: `${fontSize}px`,
											fontWeight,
											fontStyle,
											fontFamily: currentTextSymbol.font.family,
											textDecoration: fontDecoration,
											zIndex: 100,
											WebkitTransform: `rotate(${fontRotation}deg)`
										}}>
											{currentTextSymbol.text}
										</span>
										<span style={{
											color: fontColor,
											fontSize: `${fontSize}px`,
											WebkitTextStroke: fontHalo,
											fontWeight,
											fontStyle,
											fontFamily: currentTextSymbol.font.family,
											textDecoration: fontDecoration,
											position: 'absolute',
											WebkitTransform: `rotate(${fontRotation}deg)`
										}}>
											{currentTextSymbol.text}
										</span>
									</div>
								</div>
							</span>
						</Button>
					</div>
				</div>
			</div>
		);
	}
	private ensureBufferWatchersForSelectedGraphic = (graphic: any) => {
		// If the graphic has buffer settings, ensure geometry watcher is active
		if (graphic.bufferSettings && graphic.bufferSettings.enabled && graphic.bufferGraphic) {
			const parentId = graphic.attributes?.uniqueId;

			if (parentId) {
				////console.log(`🔧 Widget: Ensuring buffer watcher for selected graphic: ${parentId}`);

				// Set up geometry watcher for real-time buffer updates
				const watcherKey = parentId + '_widget_buffer';
				const existingWatcher = this._positionWatchers[watcherKey];
				if (existingWatcher) {
					existingWatcher.remove();
				}

				// Create a geometry watcher specifically for buffer updates
				this._positionWatchers[watcherKey] = graphic.watch('geometry', async (newGeometry) => {
					//console.log(`🔄 Widget: Geometry changed, updating buffer for ${parentId}`);

					if (graphic.bufferGraphic && graphic.bufferSettings) {
						try {
							// Update buffer immediately
							await this.updateAttachedBuffer(graphic);
						} catch (error) {
							console.error('❌ Widget: Error updating buffer:', error);
						}
					}
				});
			}
		}
	};
	// Add this method to the Widget class
	private ensurePointTextOverlayFromMap = (graphic: ExtendedGraphic) => {
		// console.log('🔶 ensurePointTextOverlayFromMap called with:', {
		//   hasGraphic: !!graphic,
		//   hasDrawLayer: !!this.drawLayer,
		//   geometryType: graphic?.geometry?.type,
		//   symbolType: graphic?.symbol?.type,
		//   graphicName: graphic?.attributes?.name
		// });

		// Guards
		if (!graphic || !this.drawLayer) {
			//console.log('❌ ensurePointTextOverlayFromMap: missing graphic or layer');
			return;
		}
		if (!graphic.geometry || graphic.geometry.type !== 'point') {
			//console.log('❌ ensurePointTextOverlayFromMap: not a point geometry');
			return;
		}

		// Ensure attributes & uniqueId (used for overlay→parent linkage)
		try {
			if (!(graphic as any).attributes) (graphic as any).attributes = {};
			if (!(graphic as any).attributes.uniqueId) {
				(graphic as any).attributes.uniqueId = `auto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
			}
		} catch (e) {
			console.warn('ensurePointTextOverlayFromMap: could not ensure uniqueId:', e);
		}

		// SINGLE-SELECTION POLICY: clear ALL other overlays before creating this one
		try {
			const all = this.drawLayer.graphics.toArray();
			for (const g of all as any[]) {
				if (g && g.attributes?.isSelectionOverlay) {
					try { this.drawLayer.remove(g); } catch { }
				}
				if (g && g._selectionOverlay && g !== graphic) {
					try { if (g._selectionOverlay.layer === this.drawLayer) this.drawLayer.remove(g._selectionOverlay); } catch { }
					g._selectionOverlay = null;
				}
			}
		} catch (e) {
			console.warn('ensurePointTextOverlayFromMap: failed clearing prior overlays:', e);
		}

		// If this graphic already had an overlay, remove it so we can recreate cleanly
		if ((graphic as any)._selectionOverlay) {
			try {
				if ((graphic as any)._selectionOverlay.layer === this.drawLayer) {
					this.drawLayer.remove((graphic as any)._selectionOverlay);
				}
			} catch { }
			(graphic as any)._selectionOverlay = null;
		}

		// Build halo symbol (square for text, circle for markers); faint fill so hitTest can pick it
		const isText = (graphic.symbol as any)?.type === 'text';
		const overlaySymbol = new SimpleMarkerSymbol({
			style: isText ? 'square' : 'circle',
			size: isText ? 28 : 24,
			color: [255, 128, 0, 0.10],                 // faint orange fill (hit-testable)
			outline: { color: [255, 128, 0, 1], width: 2 }
		});

		const overlay = new Graphic({
			geometry: graphic.geometry,
			symbol: overlaySymbol,
			attributes: {
				hideFromList: true,
				isMeasurementLabel: false,
				isSelectionOverlay: true,
				parentGraphicId: (graphic as any).attributes?.uniqueId ?? null
			}
		});

		try {
			// Add + attach pointer on parent
			this.drawLayer.add(overlay);
			(graphic as any)._selectionOverlay = overlay;

			// Prefer top-of-layer order: remove→add now, then again next frame
			const bringToFront = () => {
				try { this.drawLayer.remove(overlay); } catch { }
				this.drawLayer.add(overlay);
			};

			bringToFront();

			// Next macrotask (guards against SVM repaint on the same tick)
			setTimeout(() => {
				try {
					if ((graphic as any)._selectionOverlay && (graphic as any)._selectionOverlay.layer === this.drawLayer) {
						bringToFront();
					}
				} catch (e) {
					console.warn('Overlay bring-to-front next-tick failed:', e);
				}
			}, 0);

			// If zIndex is supported by your API version, push it up (harmless if unsupported)
			try { (overlay as any).zIndex = 99999; } catch { }

			// Final verification + prune any stray duplicate overlays that may have slipped in
			const overlays = this.drawLayer.graphics.toArray().filter((g: any) => g.attributes?.isSelectionOverlay);
			if (overlays.length > 1) {
				overlays.forEach((g: any) => { if (g !== overlay) { try { this.drawLayer.remove(g); } catch { } } });
			}

			const overlayInLayer = this.drawLayer.graphics.toArray()
				.some((g: any) => g === overlay || g.attributes?.isSelectionOverlay);
			console.log('🔍 Overlay present in layer:', overlayInLayer);
		} catch (error) {
			console.error('❌ Error creating overlay:', error);
		}
	};

	private updateAttachedBuffer = async (parentGraphic: any) => {
		if (!this.drawLayer || !parentGraphic.bufferGraphic || !parentGraphic.bufferSettings) return;

		try {
			const { distance, unit, opacity } = parentGraphic.bufferSettings;

			//console.log(`🔄 Widget: Creating new buffer geometry for ${parentGraphic.attributes?.uniqueId} with ${opacity || 50}% opacity`);

			// Create new buffer geometry using async geometry engine
			const newBufferGeometry = await this.createBufferGeometry(
				parentGraphic.geometry,
				distance,
				unit
			);

			if (newBufferGeometry) {
				// Update the buffer graphic's geometry immediately
				const bufferGraphic = parentGraphic.bufferGraphic;

				// 🔧 ENHANCED: Also update the symbol to reflect any opacity changes
				const updatedSymbol = this.createBufferSymbolWithOpacity(parentGraphic, opacity || 50);
				bufferGraphic.symbol = updatedSymbol;

				// Remove from layer
				this.drawLayer.remove(bufferGraphic);

				// Update geometry
				bufferGraphic.geometry = newBufferGeometry;

				// Re-add to layer at correct position
				const parentIndex = this.drawLayer.graphics.indexOf(parentGraphic);
				if (parentIndex >= 0) {
					this.drawLayer.graphics.add(bufferGraphic, parentIndex);
				} else {
					this.drawLayer.add(bufferGraphic);
				}

				//console.log(`✅ Widget: Buffer geometry updated and refreshed for graphic ${parentGraphic.attributes?.uniqueId} with ${opacity || 50}% opacity`);
			}
		} catch (error) {
			console.error('❌ Widget: Error updating attached buffer:', error);
		}
	};
	private createBufferSymbolWithOpacity = (parentGraphic: any, opacity: number): SimpleFillSymbol => {
		const geomType = parentGraphic.geometry?.type;
		const parentSymbol = parentGraphic.symbol;
		const opacityMultiplier = opacity / 100;

		let fillColor = new Color([0, 0, 0, 0.15 * opacityMultiplier]);
		let outlineColor = new Color([0, 0, 0, 0.6 * opacityMultiplier]);
		let outlineWidth = 1.5;

		try {
			if (geomType === 'polygon' && parentSymbol) {
				const fillSym = parentSymbol as __esri.SimpleFillSymbol;
				if (fillSym?.color) {
					const rgba = fillSym.color.toRgba ? fillSym.color.toRgba() : [0, 0, 0, 1];
					fillColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * opacityMultiplier, 1.0)]);
					outlineColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * opacityMultiplier, 1.0)]);
				}
				if (fillSym?.outline?.color) {
					const rgba = fillSym.outline.color.toRgba ? fillSym.outline.color.toRgba() : [0, 0, 0, 1];
					outlineColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * opacityMultiplier, 1.0)]);
					if (fillSym.outline?.width) {
						outlineWidth = fillSym.outline.width * 0.8;
					}
				}
			} else if (geomType === 'polyline' && parentSymbol) {
				const lineSym = parentSymbol as __esri.SimpleLineSymbol;
				if (lineSym?.color) {
					const rgba = lineSym.color.toRgba ? lineSym.color.toRgba() : [0, 0, 0, 1];
					fillColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * 0.6 * opacityMultiplier, 1.0)]);
					outlineColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * opacityMultiplier, 1.0)]);
					if (lineSym.width) {
						outlineWidth = lineSym.width * 0.8;
					}
				}
			} else if (geomType === 'point' && parentSymbol) {
				const markerSym = parentSymbol as __esri.SimpleMarkerSymbol;
				if (markerSym?.color) {
					const rgba = markerSym.color.toRgba ? markerSym.color.toRgba() : [0, 0, 0, 1];
					fillColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * 0.6 * opacityMultiplier, 1.0)]);
					outlineColor = new Color([rgba[0], rgba[1], rgba[2], Math.min(rgba[3] * opacityMultiplier, 1.0)]);
					if (markerSym.outline?.width) {
						outlineWidth = markerSym.outline.width * 0.8;
					}
				}
			}
		} catch (error) {
			console.warn('Error processing colors:', error);
		}

		//console.log(`🎨 Widget: Creating buffer symbol with ${opacity}% opacity`);

		return new SimpleFillSymbol({
			color: fillColor,
			outline: new SimpleLineSymbol({
				color: outlineColor,
				width: outlineWidth,
				style: 'dash'
			})
		});
	};
	private createBufferGeometry = async (geometry: __esri.Geometry, distance: number, unit: string): Promise<__esri.Geometry | null> => {
		try {
			const view = this.state.currentJimuMapView?.view;
			if (!view) return null;

			const linearUnit = unit as __esri.LinearUnits;
			let bufferResult: __esri.Geometry | __esri.Geometry[] | null = null;

			// Import geometry engine async for better performance
			const geometryEngineAsync = await import("esri/geometry/geometryEngineAsync");

			if (view.spatialReference?.isGeographic || view.spatialReference?.isWebMercator) {
				bufferResult = await geometryEngineAsync.geodesicBuffer(geometry as any, distance, linearUnit);
			} else {
				bufferResult = await geometryEngineAsync.buffer(geometry as any, distance, linearUnit, true);
			}

			if (!bufferResult) {
				console.warn('Widget: Buffer operation returned null');
				return null;
			}

			if (Array.isArray(bufferResult)) {
				if (bufferResult.length === 0) {
					console.warn('Widget: Buffer operation returned empty array');
					return null;
				}
				return bufferResult[0];
			}

			return bufferResult;
		} catch (error) {
			console.error('Widget: Error creating buffer geometry:', error);
			return null;
		}
	};

	private createLineSymbolWithBuiltInArrows = (
		base: __esri.SimpleLineSymbol,
		arrowPosition: 'start' | 'end' | 'both',
		arrowSize: number
	): __esri.SimpleLineSymbol => {
		// console.log('Creating SimpleLineSymbol with built-in arrows:', {
		//   baseColor: base.color,
		//   baseWidth: base.width,
		//   arrowPosition
		// });

		// Map arrow position to API placement values
		let placement: 'begin' | 'end' | 'begin-end';
		switch (arrowPosition) {
			case 'start':
				placement = 'begin';
				break;
			case 'end':
				placement = 'end';
				break;
			case 'both':
				placement = 'begin-end';
				break;
			default:
				console.warn('Unknown arrow position:', arrowPosition, 'defaulting to end');
				placement = 'end';
		}

		//console.log('Mapped placement:', placement);

		// Create SimpleLineSymbol with marker - arrows scale with line width
		const result = new SimpleLineSymbol({
			color: base.color,
			style: base.style,
			width: base.width,
			marker: {
				type: 'line-marker',
				style: 'arrow',
				placement: placement,
				color: base.color
			}
		});

		//console.log('Created SimpleLineSymbol with arrows');
		return result;
	};

	private renderArrowControls() {
		const { arrowEnabled, arrowPosition } = this.state;

		return (
			<div className="arrow-controls mt-3">
				<div className="d-flex align-items-center drawToolbarDiv">
					<Label centric>
						Enable Arrows
						<Switch
							className="ml-2"
							checked={arrowEnabled}
							onChange={this.handleArrowToggle}
						/>
					</Label>
				</div>

				{arrowEnabled && (
					<div className="d-flex align-items-center mb-2 drawToolbarDiv">
						<Label centric className="mb-0">Arrow Position:
							<AdvancedButtonGroup className='ml-2'>
								<Button
									className='m-0'
									size="sm"
									type={arrowPosition === 'start' ? 'primary' : 'secondary'}
									active={arrowPosition === 'start'}
									onClick={() => {
										//console.log('Arrow position button clicked: start');
										this.setState({ arrowPosition: 'start' }, () => {
											//console.log('Arrow position updated to:', this.state.arrowPosition);
											this.updateLineArrows();
										});
									}}
								>
									Start
								</Button>
								<Button
									className='m-0'
									size="sm"
									type={arrowPosition === 'end' ? 'primary' : 'secondary'}
									active={arrowPosition === 'end'}
									onClick={() => {
										//console.log('Arrow position button clicked: end');
										this.setState({ arrowPosition: 'end' }, () => {
											//console.log('Arrow position updated to:', this.state.arrowPosition);
											this.updateLineArrows();
										});
									}}
								>
									End
								</Button>
								<Button
									className='m-0'
									size="sm"
									type={arrowPosition === 'both' ? 'primary' : 'secondary'}
									active={arrowPosition === 'both'}
									onClick={() => {
										//console.log('Arrow position button clicked: both');
										this.setState({ arrowPosition: 'both' }, () => {
											//console.log('Arrow position updated to:', this.state.arrowPosition);
											this.updateLineArrows();
										});
									}}
								>
									Both
								</Button>
							</AdvancedButtonGroup>
						</Label>
					</div>
				)}
			</div>
		);
	}

	private updateLineArrows = () => {
		//console.log('Updating line arrows with built-in markers, enabled:', this.state.arrowEnabled);
		//console.log('Using arrow size:', this.state.arrowSize);

		// Validate SketchViewModel before proceeding
		if (!this.sketchViewModel || !this.sketchViewModel.view) {
			console.warn('SketchViewModel not available for updateLineArrows');
			return;
		}

		// Update existing graphics
		if (this.state.graphics?.length > 0) {
			this.state.graphics.forEach((gra: Graphic) => {
				if (gra.geometry?.type !== 'polyline') return;

				//console.log('Updating arrows for polyline:', gra.attributes?.uniqueId);

				// Get clean base symbol (remove any existing marker)
				let baseSymbol: __esri.SimpleLineSymbol;

				if (gra.symbol?.type === 'simple-line') {
					baseSymbol = (gra.symbol as __esri.SimpleLineSymbol).clone();
					delete (baseSymbol as any).marker; // Remove existing marker
				} else {
					// Fall back to SketchViewModel's default - with validation
					if (!this.sketchViewModel.polylineSymbol) {
						console.warn('SketchViewModel polylineSymbol not available');
						return;
					}
					baseSymbol = (this.sketchViewModel.polylineSymbol as __esri.SimpleLineSymbol).clone();
					delete (baseSymbol as any).marker;
				}

				if (!baseSymbol || baseSymbol.type !== 'simple-line') {
					console.warn('Could not find valid base line symbol');
					return;
				}

				// Apply arrows or remove them - PASS CURRENT STATE VALUES DIRECTLY
				if (this.state.arrowEnabled) {
					try {
						const arrowSymbol = this.createLineSymbolWithBuiltInArrows(
							baseSymbol,
							this.state.arrowPosition,
							this.state.arrowSize
						);
						gra.symbol = arrowSymbol;
						//console.log('Applied built-in arrows to graphic with size:', this.state.arrowSize);
					} catch (error) {
						console.warn('Error applying arrows to graphic:', error);
					}
				} else {
					gra.symbol = baseSymbol; // Remove arrows, use base symbol
					//console.log('Removed arrows from graphic');
				}
			});
		}

		// Update the SketchViewModel symbol for new drawings - FIXED VERSION
		const svmBase = this.sketchViewModel.polylineSymbol as __esri.SimpleLineSymbol;
		if (svmBase && svmBase.type === 'simple-line') {
			try {
				// Create a completely clean base symbol without any marker properties
				const cleanBase = new SimpleLineSymbol({
					color: svmBase.color,
					width: svmBase.width,
					style: svmBase.style
					// Explicitly NOT copying the marker property
				});

				const updatedSymbol = this.state.arrowEnabled
					? this.createLineSymbolWithBuiltInArrows(
						cleanBase,
						this.state.arrowPosition,
						this.state.arrowSize
					)
					: cleanBase;

				this.sketchViewModel.polylineSymbol = updatedSymbol;
				this.setState({ currentSymbol: updatedSymbol });
				//console.log('Updated SketchViewModel polyline symbol - arrows enabled:', this.state.arrowEnabled);
			} catch (error) {
				console.warn('Error updating SketchViewModel polyline symbol:', error);
			}
		}
	};

	handleArrowToggle = (e) => {
		const enabled = e.target.checked;
		//console.log('Arrow toggle changed:', enabled);

		this.setState({ arrowEnabled: enabled }, () => {
			//console.log('State updated, calling updateLineArrows');
			this.updateLineArrows();
		});
	};
	private invalidatePendingOverlays = () => {
		// Bump epoch so any scheduled overlay tasks from previous selections are ignored
		this._selectionEpoch++;
	};

	private clearAllSelectionOverlays = () => {
		if (!this.drawLayer) return;
		try {
			this.drawLayer.graphics.toArray().forEach((g: any) => {
				if (g && g._selectionOverlay) {
					try {
						if (g._selectionOverlay.layer === this.drawLayer) {
							this.drawLayer.remove(g._selectionOverlay);
						}
					} catch { }
					g._selectionOverlay = null;
				}
			});
		} catch { }
	};

	private removeAttachedBuffer = (parentGraphic: any) => {
		if (!this.drawLayer || !parentGraphic) return;

		const parentId = parentGraphic.attributes?.uniqueId;
		if (!parentId) return;

		//console.log(`🗑️ Widget: Removing attached buffer for graphic ${parentId}`);

		// Remove buffer graphic from layer
		if (parentGraphic.bufferGraphic) {
			this.drawLayer.remove(parentGraphic.bufferGraphic);
			parentGraphic.bufferGraphic = null;
			//console.log(`✅ Widget: Removed attached buffer graphic`);
		}

		// Clear buffer settings
		if (parentGraphic.bufferSettings) {
			parentGraphic.bufferSettings = null;
			//console.log(`✅ Widget: Cleared buffer settings`);
		}

		// Remove geometry watcher if it exists
		const watcherKey = parentId + '_widget_buffer';
		if (this._positionWatchers && this._positionWatchers[watcherKey]) {
			try {
				this._positionWatchers[watcherKey].remove();
				delete this._positionWatchers[watcherKey];
				//console.log(`✅ Widget: Removed buffer geometry watcher`);
			} catch (error) {
				console.warn('Widget: Error removing buffer geometry watcher:', error);
			}
		}
	};
	private cleanupOrphanedBuffers = () => {
		if (!this.drawLayer) return;

		try {
			const allGraphics = this.drawLayer.graphics.toArray();

			// Get all buffer graphics (including preview buffers and attached buffers)
			const allBuffers = allGraphics.filter(g =>
				g.attributes?.isPreviewBuffer ||
				g.attributes?.isBuffer ||
				g.attributes?.isBufferDrawing
			);

			const measurementLabels = allGraphics.filter(g => g.attributes?.isMeasurementLabel);

			// Get all main graphics (potential parents)
			const mainGraphics = allGraphics.filter(g =>
				!g.attributes?.isPreviewBuffer &&
				!g.attributes?.isBuffer &&
				!g.attributes?.isMeasurementLabel &&
				!g.attributes?.hideFromList &&
				!g.attributes?.isBufferDrawing
			);

			// Create set of valid parent IDs
			const validParentIds = new Set(
				mainGraphics
					.map(g => g.attributes?.uniqueId)
					.filter(id => id)
			);

			// Find orphaned buffers
			const orphanedBuffers = allBuffers.filter(buffer => {
				const parentId = buffer.attributes?.parentId ||
					buffer.attributes?.sourceGraphicId;
				return !parentId || !validParentIds.has(parentId);
			});

			// Find orphaned measurement labels
			const orphanedMeasurementLabels = measurementLabels.filter(label => {
				const parentId = label.attributes?.parentGraphicId;
				return !parentId || !validParentIds.has(parentId);
			});

			// Remove orphaned items
			if (orphanedBuffers.length > 0) {
				//console.log(`Widget: Cleaning up ${orphanedBuffers.length} orphaned buffer graphics`);
				orphanedBuffers.forEach(buffer => {
					this.drawLayer.remove(buffer);
				});
			}

			if (orphanedMeasurementLabels.length > 0) {
				//console.log(`Widget: Cleaning up ${orphanedMeasurementLabels.length} orphaned measurement labels`);
				orphanedMeasurementLabels.forEach(label => {
					this.drawLayer.remove(label);
				});
			}

			if (orphanedBuffers.length > 0 || orphanedMeasurementLabels.length > 0) {
				//console.log(`✅ Widget: Buffer cleanup completed - removed ${orphanedBuffers.length} buffers and ${orphanedMeasurementLabels.length} labels`);
			}
		} catch (error) {
			console.error('❌ Widget: Error cleaning up orphaned graphics:', error);
		}
	};

	constructor(props) {
		super(props);
		this.state = {
			currentJimuMapView: null,
			graphics: [],
			pointBtnActive: false,
			lineBtnActive: false,
			flineBtnActive: false,
			rectBtnActive: false,
			polygonBtnActive: false,
			fpolygonBtnActive: false,
			circleBtnActive: false,
			textBtnActive: false,
			showSymPreview: false,
			currentSymbol: null,
			currentSymbolType: null,
			currentTextSymbol: new TextSymbol({
				verticalAlignment: 'middle',
				font: { family: 'Avenir Next LT Pro' },
				text: 'Text'
			}),
			undoBtnActive: false,
			redoBtnActive: false,
			clearBtnActive: false,
			drawGLLengthcheck: false,
			currentTool: '',
			clearBtnTitle: this.nls('drawClear'),
			canUndo: false,
			canRedo: false,
			showTextPreview: false,
			textSymPreviewText: 'Text',
			fontColor: 'rgba(0,0,0,1)',
			fontSize: `${new TextSymbol().font.size ?? 14}`,
			fontHaloSize: 1,
			fontHaloColor: 'rgba(255,255,255,1)',
			fontHaloEnabled: false,
			fontHalo: 'unset',
			fontWeight: 'normal',
			fontDecoration: 'none',
			fontStyle: 'normal',
			hTextAlign: TextAlignValue.CENTER,
			vTextAlign: 'middle',
			fontRotation: 0,
			vAlignBaseBtnActive: false,
			vAlignTopBtnActive: false,
			vAlignMidBtnActive: true,
			vAlignBotBtnActive: false,
			textPreviewHeight: 25,
			hAlignLeftBtnActive: false,
			hAlignCenterBtnActive: true,
			hAlignRightBtnActive: false,
			fsBoldBtnActive: false,
			fsItalicBtnActive: false,
			fsUnderlineBtnActive: false,
			widgetInit: false,
			textPreviewisOpen: false,
			fontOpacity: 1,
			fontHaloOpacity: 1,
			textHasChanged: false,
			rotationMode: false,
			drawLayerTitle: this.props.config.title,
			listMode: this.props.config.listMode ? 'show' : 'hide',
			confirmDelete: false,
			fontBackgroundColor: 'rgba(0,0,0,0)',
			showDrawingsPanel: false, // Added BM
			selectedDrawingIndex: null, // Added BM
			activeTab: 'draw', // Added BM
			selectedGraphicIndex: null,
			selectedGraphics: new Set<number>(),
			arrowEnabled: false,
			arrowPosition: 'end',
			arrowSize: 24,
			measurementCheckboxOn: false
		};
		this.creationMode = this.props.config.creationMode || DrawMode.SINGLE;
	}

	nls = (id: string) => {
		return this.props.intl ? this.props.intl.formatMessage({ id: id, defaultMessage: defMessages[id] }) : id;
	}

	componentDidMount() {
		this.setState({ widgetInit: true });
		this.drawLayer = new GraphicsLayer({
			id: 'DrawGL',
			listMode: this.props.config.listMode ? 'show' : 'hide',
			title: this.props.config.title
		});

		// Initialize drawing map for graphic tracking
		this._drawingMap = new Map();

		// Listen for save events from BufferControls
		window.addEventListener('saveDrawingsToStorage', this.handleSaveEvent);
	}

	// Add this new method to handle save events
	private handleSaveEvent = (event: CustomEvent) => {
		//console.log('📦 Received save event from BufferControls');

		// Trigger the save to localStorage
		if (this.drawLayer) {
			const allDrawings = this.drawLayer.graphics.toArray();
			this.handleDrawingsUpdate(allDrawings);
		}
	};

	componentDidUpdate(prevProps: Readonly<AllWidgetProps<IMConfig>>, prevState: Readonly<States>) {
		if (this.state.currentJimuMapView) {
			const widgetState: WidgetState = this.props.state;
			const view = this.state.currentJimuMapView.view;

			if (widgetState === WidgetState.Closed && this.sketchViewModel) {
				// Properly cancel any active operations
				this.sketchViewModel.cancel();
				this.sketchViewModel.updateOnGraphicClick = false;

				// Clear any active drawing states to prevent interference with map interactions
				this.setDrawToolBtnState(null);

				// Restore original popup state
				if (view) {
					// Only restore if we have the original value
					if (this.originalPopupEnabled !== null) {
						view.popupEnabled = this.originalPopupEnabled;
						//console.log('Restored popup state to:', this.originalPopupEnabled);
					}

					if (view.popup && "autoCloseEnabled" in view.popup) {
						view.popup.autoCloseEnabled = true;
					}

					// Restore highlight appearance
					view.highlightOptions = {
						color: [0, 255, 255, 1],
						fillOpacity: 0.0,
						haloOpacity: 0.8
					};

					// Restore layer-level highlight styling
					view.map.layers.forEach(layer => {
						view.whenLayerView(layer).then((layerView: __esri.LayerView) => {
							if (layer.type === "feature") {
								const featureLayerView = layerView as any;
								if ("highlightOptions" in featureLayerView) {
									featureLayerView.highlightOptions = {
										color: [0, 255, 255, 1],
										fillOpacity: 0.0,
										haloOpacity: 0.8
									};
								}
							}
						});
					});

					// Clear widget graphics but preserve draw layer
					const allGraphics = view.graphics.toArray();
					const graphicsToRemove = allGraphics.filter(graphic =>
						graphic.layer !== this.drawLayer
					);
					view.graphics.removeMany(graphicsToRemove);
				}

				if (this.props.config.turnOffOnClose) {
					this.setDrawToolBtnState(null);
				}
			} else if (widgetState === WidgetState.Opened && this.sketchViewModel) {
				this.sketchViewModel.updateOnGraphicClick = true;

				// Disable interactions when widget opens
				if (view) {
					// Store original state only if not already stored
					if (this.originalPopupEnabled === null) {
						this.originalPopupEnabled = view.popupEnabled;
						//console.log('Stored original popup state:', this.originalPopupEnabled);
					}

					// Disable popups and interactions
					view.popupEnabled = false;
					if (view.popup && "autoCloseEnabled" in view.popup) {
						view.popup.autoCloseEnabled = false;
					}
					view.popup.visible = false;

					// Make highlights invisible
					view.highlightOptions = {
						color: [0, 0, 0, 0],
						fillOpacity: 0,
						haloOpacity: 0
					};
				}
			}

			// Backup check for widgets without state management (used outside widget controller)
			if (view && this.originalPopupEnabled !== null) {
				// Check if widget state is undefined/null (not managed by controller)
				const isWidgetControlled = widgetState !== undefined && widgetState !== null;

				if (!isWidgetControlled) {
					// For uncontrolled widgets, restore popups when not in drawing mode
					const isDrawingActive = this.state.pointBtnActive || this.state.lineBtnActive ||
						this.state.flineBtnActive || this.state.rectBtnActive ||
						this.state.polygonBtnActive || this.state.fpolygonBtnActive ||
						this.state.circleBtnActive || this.state.textBtnActive;

					// Check if drawing state changed from active to inactive
					const wasDrawingActive = prevState.pointBtnActive || prevState.lineBtnActive ||
						prevState.flineBtnActive || prevState.rectBtnActive ||
						prevState.polygonBtnActive || prevState.fpolygonBtnActive ||
						prevState.circleBtnActive || prevState.textBtnActive;

					// Restore popups when exiting drawing mode
					if (wasDrawingActive && !isDrawingActive && !view.popupEnabled && this.originalPopupEnabled) {
						view.popupEnabled = this.originalPopupEnabled;
						//console.log('Restored popup state (uncontrolled widget):', this.originalPopupEnabled);

						if (view.popup && "autoCloseEnabled" in view.popup) {
							view.popup.autoCloseEnabled = true;
						}

						// Restore highlight appearance
						view.highlightOptions = {
							color: [0, 255, 255, 1],
							fillOpacity: 0.0,
							haloOpacity: 0.8
						};
					}
					// Disable popups when entering drawing mode
					else if (!wasDrawingActive && isDrawingActive && view.popupEnabled) {
						view.popupEnabled = false;
						//console.log('Disabled popups (uncontrolled widget, entering drawing mode)');

						if (view.popup && "autoCloseEnabled" in view.popup) {
							view.popup.autoCloseEnabled = false;
						}
						view.popup.visible = false;

						// Make highlights invisible
						view.highlightOptions = {
							color: [0, 0, 0, 0],
							fillOpacity: 0,
							haloOpacity: 0
						};
					}
				}
			}
		}

		// Set titles for color picker inputs
		if (document.getElementsByClassName('fontcolorpicker')[0]) {
			(document.getElementsByClassName('fontcolorpicker')[0] as HTMLElement).title = this.nls('fontColor');
		}
		if (document.getElementsByClassName('fontrotationinput')[0]) {
			(document.getElementsByClassName('fontrotationinput')[0] as HTMLElement).title = this.nls('fontRotation');
		}
		if (document.getElementsByClassName('fontsizeinput')[0]) {
			(document.getElementsByClassName('fontsizeinput')[0] as HTMLElement).title = this.nls('fontSize');
		}
		if (document.getElementsByClassName('fonthalocolorpicker')[0]) {
			(document.getElementsByClassName('fonthalocolorpicker')[0] as HTMLElement).title = this.nls('fontHaloColor');
		}
		if (document.getElementsByClassName('fonthalosizeinput')[0]) {
			(document.getElementsByClassName('fonthalosizeinput')[0] as HTMLElement).title = this.nls('fontHaloSize');
		}
	}

	componentWillUnmount() {
		// Clean up measurement update timeouts
		if (this._measurementUpdateTimeout) {
			clearTimeout(this._measurementUpdateTimeout);
			this._measurementUpdateTimeout = null;
		}

		if (this._activeMeasurementUpdateTimeout) {
			clearTimeout(this._activeMeasurementUpdateTimeout);
			this._activeMeasurementUpdateTimeout = null;
		}

		if (this._savePositionTimeout) {
			clearTimeout(this._savePositionTimeout);
			this._savePositionTimeout = null;
		}

		// Clean up position watchers
		if (this._positionWatchers) {
			Object.values(this._positionWatchers).forEach(watcher => {
				if (watcher && typeof watcher.remove === 'function') {
					try {
						watcher.remove();
					} catch (error) {
						console.warn('Error removing position watcher:', error);
					}
				}
			});
			this._positionWatchers = {};
		}

		// Remove save event listener
		window.removeEventListener('saveDrawingsToStorage', this.handleSaveEvent);

		// Always restore original popup state if we have it stored
		if (this.state?.currentJimuMapView?.view && this.originalPopupEnabled !== null) {
			const view = this.state.currentJimuMapView.view;

			try {
				// Restore popup functionality
				view.popupEnabled = this.originalPopupEnabled;
				//console.log('componentWillUnmount: Restored popup state to:', this.originalPopupEnabled);

				if (view.popup && "autoCloseEnabled" in view.popup) {
					view.popup.autoCloseEnabled = true;
				}

				// Restore highlight options to default
				view.highlightOptions = {
					color: [0, 255, 255, 1],
					fillOpacity: 0.0,
					haloOpacity: 0.8
				};

				// Restore layer-level highlight styling
				view.map.layers.forEach(layer => {
					view.whenLayerView(layer).then((layerView: __esri.LayerView) => {
						if (layer.type === "feature") {
							const featureLayerView = layerView as any;
							if ("highlightOptions" in featureLayerView) {
								featureLayerView.highlightOptions = {
									color: [0, 255, 255, 1],
									fillOpacity: 0.0,
									haloOpacity: 0.8
								};
							}
						}
					}).catch(err => {
						console.warn(`Could not restore highlight options for layer ${layer.title}:`, err);
					});
				});

				// Clear any widget graphics but preserve draw layer
				const allGraphics = view.graphics.toArray();
				const graphicsToRemove = allGraphics.filter(graphic =>
					graphic.layer !== this.drawLayer
				);
				if (graphicsToRemove.length > 0) {
					view.graphics.removeMany(graphicsToRemove);
				}

			} catch (error) {
				console.warn('Error restoring view state during unmount:', error);
			}

			// Reset the stored value after restoration
			this.originalPopupEnabled = null;
		}

		// Clean up SketchViewModel
		if (this.sketchViewModel) {
			try {
				this.sketchViewModel.cancel();
				this.sketchViewModel.destroy();
			} catch (error) {
				console.warn('Error cleaning up SketchViewModel:', error);
			}
			this.sketchViewModel = null;
		}

		// Clean up draw layer
		if (this.drawLayer) {
			try {
				this.drawLayer.removeAll();
			} catch (error) {
				console.warn('Error clearing draw layer:', error);
			}
			this.drawLayer = null;
		}
	}

	activeViewChangeHandler = (jimuMapView: JimuMapView) => {
		// Attach to new map view or clear if null
		if (!jimuMapView) {
			if (this.sketchViewModel) {
				try { this.sketchViewModel.cancel(); this.sketchViewModel.destroy(); } catch (error) {
					console.warn('Error cleaning up SketchViewModel:', error);
				}
				this.sketchViewModel = null;
			}
			this.setState({ currentJimuMapView: null });
			return;
		}

		this.setState({ currentJimuMapView: jimuMapView });

		jimuMapView.whenJimuMapViewLoaded().then(async () => {
			const { map } = jimuMapView.view;
			const view = jimuMapView.view;

			if (!view || view.destroyed) {
				console.warn('View is not valid for SketchViewModel initialization');
				return;
			}

			// Store original popup state
			this.originalPopupEnabled = view.popupEnabled;
			//console.log('Stored original popup state:', this.originalPopupEnabled);

			// Check if widget is controlled by widget state
			const widgetState: WidgetState = this.props.state;
			const isWidgetControlled = widgetState !== undefined && widgetState !== null;

			// Only disable popups immediately if widget is controlled and opened, or if a drawing tool is active
			const isDrawingActive = this.state.pointBtnActive || this.state.lineBtnActive ||
				this.state.flineBtnActive || this.state.rectBtnActive ||
				this.state.polygonBtnActive || this.state.fpolygonBtnActive ||
				this.state.circleBtnActive || this.state.textBtnActive;

			if ((isWidgetControlled && widgetState === WidgetState.Opened) || isDrawingActive) {
				// Disable popups and interactions
				view.popupEnabled = false;
				if (view.popup && "autoCloseEnabled" in view.popup) view.popup.autoCloseEnabled = false;
				view.popup.visible = false;

				view.highlightOptions = { color: [0, 0, 0, 0], fillOpacity: 0, haloOpacity: 0 };
				//console.log('Disabled popups on widget initialization (controlled widget or drawing active)');
			} else {
				// For uncontrolled widgets with no active drawing tools, leave popups enabled
				//console.log('Leaving popups enabled on widget initialization (uncontrolled widget, no drawing active)');
			}

			// Clear existing highlights/effects
			view.map.layers.forEach(layer => {
				view.whenLayerView(layer).then((layerView: __esri.LayerView) => {
					try {
						if (layer.type === "feature") {
							const flv = layerView as any;
							if (typeof flv.highlight === "function") {
								const h = flv.highlight([]); h.remove();
								// Only disable highlight options if widget is controlled or drawing is active
								if ("highlightOptions" in flv && ((isWidgetControlled && widgetState === WidgetState.Opened) || isDrawingActive)) {
									flv.highlightOptions = { color: [0, 0, 0, 0], fillOpacity: 0, haloOpacity: 0 };
								}
								if (flv.hasOwnProperty("_highlightIds")) flv._highlightIds = {};
							}
						}
						if ("featureEffect" in layerView) (layerView as any).featureEffect = null;
						if ("filter" in layerView) (layerView as any).filter = null;
						if (typeof (layerView as any).refresh === "function") (layerView as any).refresh();
					} catch (err) {
						console.warn(`Error clearing highlight for layer ${layer.title}:`, err);
					}
				}).catch(err => console.warn(`Could not get layerView for ${layer.title}:`, err));
			});

			if (this.state.widgetInit) {
				this.creationMode = this.props.config.creationMode || DrawMode.SINGLE;
				const dLayer: GraphicsLayer = map.findLayerById('DrawGL') as GraphicsLayer;
				if (dLayer) {
					this.drawLayer = dLayer;
					if (this.drawLayer.graphics.length > 0) this.setState({ drawGLLengthcheck: true });
				} else {
					map.add(this.drawLayer);
				}
			}

			this.drawLayer.graphics.watch('length', (len) => {
				this.setState({ drawGLLengthcheck: len > 0 });
			});

			// Rebuild SketchViewModel cleanly with enhanced configuration
			if (this.sketchViewModel) {
				try { this.sketchViewModel.cancel(); this.sketchViewModel.destroy(); } catch (error) {
					console.warn('Error cleaning up existing SketchViewModel:', error);
				}
			}

			try {
				this.sketchViewModel = new SketchViewModel({
					view,
					updateOnGraphicClick: false, // CRITICAL: prevents SVM from intercepting measurement label clicks
					layer: this.drawLayer,
					defaultUpdateOptions: {
						toggleToolOnClick: false // Prevents automatic tool switching
					}
				});

				// Extra safeguard: ensure it stays off even if modified elsewhere
				(this.sketchViewModel as any).updateOnGraphicClick = false;

				if (!this.sketchViewModel.view) {
					console.error('SketchViewModel created without valid view');
					return;
				}

				// Wait for SketchViewModel to be fully ready before proceeding
				await new Promise<void>((resolve) => {
					if (this.sketchViewModel.state === "ready") {
						resolve();
					} else {
						const handle = this.sketchViewModel.watch("state", (state) => {
							if (state === "ready") {
								handle.remove();
								resolve();
							}
						});
					}
				});

				this.sketchViewModel.on('create', this.svmGraCreate);
				this.sketchViewModel.on('update', this.svmGraUpdate);

				//console.log('✅ SketchViewModel fully initialized and ready');
			} catch (error) {
				console.error('Error creating SketchViewModel:', error);
				return;
			}

			// --- Helper Functions ----------------------------------------------------------

			// Remove ALL selection overlay graphics and null pointers on base graphics
			const clearAllSelectionOverlaysLocal = () => {
				if (!this.drawLayer) return;
				try {
					this.drawLayer.graphics.toArray().forEach((g: any) => {
						if (g && g._selectionOverlay) {
							try {
								if (g._selectionOverlay.layer === this.drawLayer) {
									this.drawLayer.remove(g._selectionOverlay);
								}
							} catch { }
							g._selectionOverlay = null;
						}
					});
				} catch (e) {
					console.warn('clearAllSelectionOverlaysLocal failed:', e);
				}
			};

			// Enhanced measurement label detection
			const isMeasurementLabelGraphic = (graphic: any): boolean => {
				if (!graphic || !graphic.symbol) return false;

				// Primary identification
				if (graphic.attributes?.isMeasurementLabel === true) return true;
				if (graphic.attributes?.measurementType) return true;
				if (graphic.attributes?.hideFromList && graphic.symbol.type === 'text') return true;

				// Pattern-based identification for restored labels
				if (graphic.symbol.type === 'text') {
					const text = graphic.symbol.text || '';
					const measurementPatterns = [
						/\d+(\.\d+)?\s*(km|mi|m|ft|yd|km²|mi²|ac|ha|m²|ft²|yd²)/,
						/Area:|Perimeter:|Radius:|Total:|Lat:|Lon:|X:|Y:/
					];
					return measurementPatterns.some(pattern => pattern.test(text));
				}

				return false;
			};

			// --- Event Handlers -----------------------------------------------------------

			// HIGH PRIORITY: immediate-click for measurement label interactions
			view.on("immediate-click", async (event) => {
				try {
					//console.log('🔍 WIDGET: Immediate-click for measurement labels at:', event.x, event.y);

					// Only handle measurement labels in this handler
					if (!this.measureRef?.current?.isEditingMeasurements?.()) {
						return; // Not in measurement editing mode
					}

					// Check if drawing tools are active - if so, skip measurement handling
					const isDrawingActive = this.state.pointBtnActive || this.state.lineBtnActive ||
						this.state.flineBtnActive || this.state.rectBtnActive ||
						this.state.polygonBtnActive || this.state.fpolygonBtnActive ||
						this.state.circleBtnActive || this.state.textBtnActive;

					if (isDrawingActive) {
						//console.log('🎨 Drawing tool active - skipping measurement label handling');
						return;
					}

					// Enhanced hit test specifically for measurement labels
					const hitTestResult = await view.hitTest(event, {
						include: [this.drawLayer]
					});

					// Enhanced measurement label detection
					const measurementLabelHit = hitTestResult.results.find(result => {
						if (!result || !('graphic' in result) || !result.graphic) return false;
						return isMeasurementLabelGraphic(result.graphic);
					}) as __esri.GraphicHit | undefined;

					if (measurementLabelHit) {
						//console.log('🏷️ Measurement label detected via immediate-click');

						// Handle measurement label selection
						this.measureRef.current?.handleMeasurementLabelSelection?.(measurementLabelHit.graphic);
						return; // Don't let this fall through to normal click handler
					}

				} catch (error) {
					console.error('❌ Error in immediate-click measurement handler:', error);
				}
			});

			// STANDARD: click handler for drawing selection and general interactions
			view.on("click", async (event) => {
				try {
					//console.log('🔍 WIDGET: Standard click detected at:', event.x, event.y);

					if (!this.sketchViewModel || !this.sketchViewModel.view) {
						console.warn('SketchViewModel not available for click handling');
						return;
					}

					// Check drawing state first to avoid conflicts
					const isDrawingActive = this.state.pointBtnActive || this.state.lineBtnActive ||
						this.state.flineBtnActive || this.state.rectBtnActive ||
						this.state.polygonBtnActive || this.state.fpolygonBtnActive ||
						this.state.circleBtnActive || this.state.textBtnActive;

					// If drawing is active, skip entirely (let SketchViewModel handle)
					if (isDrawingActive) {
						//console.log('🎨 Drawing tool active - letting SketchViewModel handle click');
						return;
					}

					// If measurement editing is active, clear selection when clicking non-measurement graphics
					if (this.measureRef?.current?.isEditingMeasurements?.()) {
						// Do a quick check to see if we hit a measurement label
						const quickHitTest = await view.hitTest(event, { include: [this.drawLayer] });
						const hitMeasurementLabel = quickHitTest.results.some(result => {
							if (!result || !('graphic' in result)) return false;
							return isMeasurementLabelGraphic(result.graphic);
						});

						if (!hitMeasurementLabel) {
							// Clicked on non-measurement, clear measurement selection
							this.measureRef.current?.cleanupMeasurementLabelSelection?.();
							// Continue with normal selection logic below
						} else {
							// This is a measurement label, but immediate-click should have handled it
							// If it gets here, it means immediate-click didn't catch it, so we can handle it
							const measurementLabelHit = quickHitTest.results.find(result => {
								if (!result || !('graphic' in result)) return false;
								return isMeasurementLabelGraphic(result.graphic);
							}) as __esri.GraphicHit | undefined;

							if (measurementLabelHit) {
								//console.log('🏷️ Measurement label caught by standard click (fallback)');
								this.measureRef.current?.handleMeasurementLabelSelection?.(measurementLabelHit.graphic);
								return;
							}
						}
					}

					//console.log('Performing hit test for drawing graphics');

					// Enhanced hit testing for drawing graphics
					let hitTestResult = await view.hitTest(event, { include: [this.drawLayer] });

					// Fallback hit testing if no results from layer-specific test
					if (hitTestResult.results.length === 0) {
						const allHitTest = await view.hitTest(event);
						const drawGraphics = this.drawLayer?.graphics?.toArray?.() ?? [];
						const idSet = new Set<string>(
							drawGraphics.map(g => (g as any).attributes?.uniqueId).filter(Boolean)
						);

						const drawLayerResults = allHitTest.results.filter(result => {
							if (!result || !('graphic' in result) || !result.graphic) return false;
							const g = result.graphic as any;

							const onOurLayer = g.layer === this.drawLayer || g.layer?.id === 'DrawGL' || g.layer?.id === this.drawLayer?.id;
							const isOverlay = !!g.attributes?.isSelectionOverlay;
							const hasKnownId = !!g.attributes?.uniqueId && idSet.has(g.attributes.uniqueId);

							return onOurLayer || isOverlay || hasKnownId;
						});

						if (drawLayerResults.length > 0) {
							hitTestResult = { results: drawLayerResults } as any;
						}
					}

					// Normalize overlay hits to parent graphics
					const results = (hitTestResult.results as any[]) || [];
					const normalizedResults: __esri.GraphicHit[] = [];

					for (const r of results) {
						if (!r || !r.graphic) continue;
						const g = r.graphic as any;

						// Convert overlay hits to parent graphic hits
						if (g.attributes?.isSelectionOverlay && g.attributes?.parentGraphicId) {
							const parentId = g.attributes.parentGraphicId;
							const parent = this.drawLayer?.graphics?.find(
								(pg: __esri.Graphic) => (pg as any).attributes?.uniqueId === parentId
							) as __esri.Graphic | undefined;
							if (parent) {
								normalizedResults.push({ ...r, graphic: parent } as __esri.GraphicHit);
								continue;
							}
						}
						normalizedResults.push(r as __esri.GraphicHit);
					}

					// Filter out measurement labels, buffers, and other non-selectable graphics
					const selectableGraphicHits = normalizedResults.filter((result: __esri.GraphicHit) => {
						if (!result || !result.graphic || result.graphic.layer !== this.drawLayer) return false;

						const graphic = result.graphic as any;

						// Exclude measurement labels
						if (isMeasurementLabelGraphic(graphic)) return false;

						// Exclude buffers
						if (graphic.attributes?.isPreviewBuffer ||
							graphic.attributes?.isBuffer ||
							graphic.attributes?.isBufferDrawing ||
							graphic.attributes?.uniqueId?.startsWith('buffer_')) return false;

						// Exclude selection overlays
						if (graphic.attributes?.isSelectionOverlay) return false;

						return true;
					});

					// Process selectable graphic hits
					if (selectableGraphicHits.length > 0) {
						const clickedGraphic = selectableGraphicHits[0].graphic as __esri.Graphic;
						//console.log('✅ Selecting drawing graphic:', (clickedGraphic as any).attributes?.name);

						// Invalidate any pending overlay schedules from previous selection
						this._selectionEpoch++;

						// Clear previous halos BEFORE selecting the new one
						clearAllSelectionOverlaysLocal();

						// Handle the selection
						const uid = (clickedGraphic as any).attributes?.uniqueId;
						const idx = uid && this._drawingMap?.has(uid) ? this._drawingMap.get(uid) : -1;
						this.handleDrawingSelect(clickedGraphic, idx);

						// Sync list UI if index is known
						if (uid && this._drawingMap?.has(uid)) {
							const index = this._drawingMap.get(uid);
							document.querySelectorAll('.drawing-item').forEach(item => item.classList.remove('selected-drawing'));
							const item = document.getElementById(`drawing-item-${index}`);
							if (item) {
								item.classList.add('selected-drawing');
								item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
							}
							this.setState({ selectedGraphicIndex: index, selectedGraphics: new Set([index]) });
						}
					} else {
						// Click away - clear all selections
						//console.log('🔘 WIDGET: No selectable graphics hit - clearing selections');

						try {
							if (this.sketchViewModel && this.sketchViewModel.view) {
								this.sketchViewModel.cancel();
							}
						} catch (error) {
							console.warn('Error canceling SketchViewModel:', error);
						}

						// Invalidate any pending overlay schedules
						this._selectionEpoch++;

						// Clear halos and selection states
						clearAllSelectionOverlaysLocal();

						if (this.state.selectedGraphicIndex !== null) {
							this.setState({ selectedGraphicIndex: null, selectedGraphics: new Set() });
							document.querySelectorAll('.drawing-item').forEach(item => item.classList.remove('selected-drawing'));
						}
					}

				} catch (err) {
					console.error("❌ Hit test error:", err);
				}
			});

			// Clean up orphaned buffers when graphics are removed
			this.drawLayer.graphics.on("change", (event) => {
				if (event.removed && event.removed.length > 0) {
					setTimeout(() => { this.cleanupOrphanedBuffers(); }, 100);
				}
			});

			//console.log('✅ Enhanced event handlers configured successfully');

		}).catch(error => {
			console.error('❌ Error in activeViewChangeHandler:', error);
		});
	};

	handleMeasurementSystemControl = (enabled: boolean) => {
		if (this.measureRef?.current) {
			if (enabled) {
				// Remove the complex delay logic - SketchViewModel is now properly initialized
				if (this.sketchViewModel && this.sketchViewModel.view) {
					// Check if drawing tools are active before enabling
					const isDrawingActive = this.state.pointBtnActive || this.state.lineBtnActive ||
						this.state.flineBtnActive || this.state.rectBtnActive ||
						this.state.polygonBtnActive || this.state.fpolygonBtnActive ||
						this.state.circleBtnActive || this.state.textBtnActive;

					if (!isDrawingActive) {
						this.measureRef.current.enableMeasurements();
					} else {
						//console.log('Drawing tool active - measurement enable deferred');
					}
				} else {
					console.warn('SketchViewModel not ready for measurements');
				}
			} else {
				this.measureRef.current.disableMeasurements();
			}
		}
	};

	toggleDrawingsPanel = () => {
		this.setState({ showDrawingsPanel: !this.state.showDrawingsPanel });
	}

	private clearSelectionOverlaysInDrawLayer = () => {
		if (!this.drawLayer) return;
		try {
			this.drawLayer.graphics.toArray().forEach(g => {
				const ext: any = g;
				if (ext._selectionOverlay) {
					try { this.drawLayer.remove(ext._selectionOverlay); } catch { }
					ext._selectionOverlay = null;
				}
			});
		} catch (e) {
			console.warn('Error clearing selection overlays:', e);
		}
	};


	handleDrawingSelect = (graphic: __esri.Graphic, index: number) => {
		// Guard & skip buffers
		if (!graphic) return;
		if ((graphic as any).attributes?.isBuffer) return;

		// Validate SketchViewModel and view before proceeding
		if (!this.sketchViewModel || !this.sketchViewModel.view) {
			console.warn('SketchViewModel or view not ready for selection');
			return;
		}

		// Ensure attributes/uniqueId exist (used for overlay parent linkage & list sync)
		try {
			if (!(graphic as any).attributes) (graphic as any).attributes = {};
			if (!(graphic as any).attributes.uniqueId) {
				(graphic as any).attributes.uniqueId = `auto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
			}
		} catch (e) {
			console.warn('Could not ensure uniqueId on graphic:', e);
		}

		// Cancel any active operations before starting a new one
		try {
			this.sketchViewModel.cancel();
		} catch (error) {
			console.warn('Error canceling sketch operation:', error);
			return;
		}

		// Bump epoch to invalidate any pending overlay timeouts from prior selections
		const myEpoch = ++this._selectionEpoch;

		// --- SINGLE-SELECTION POLICY: clear ALL existing halos before selecting anew ---
		try {
			if (this.drawLayer) {
				this.drawLayer.graphics.toArray().forEach((g: any) => {
					if (g && g._selectionOverlay) {
						try {
							if (g._selectionOverlay.layer === this.drawLayer) {
								this.drawLayer.remove(g._selectionOverlay);
							}
						} catch { }
						g._selectionOverlay = null;
					}
				});
			}
		} catch (e) {
			console.warn('Failed clearing existing selection overlays:', e);
		}

		// Normalize unsupported polyline symbol types to SimpleLineSymbol
		if (graphic.geometry?.type === 'polyline' && (graphic.symbol as any)?.type !== 'simple-line') {
			const symbolColor = (graphic.symbol as any)?.color || [0, 0, 0, 1];
			const symbolWidth = (graphic.symbol as any)?.width || 2;
			const symbolStyle = (graphic.symbol as any)?.style || 'solid';
			graphic.symbol = new SimpleLineSymbol({ color: symbolColor, width: symbolWidth, style: symbolStyle });
		}

		// Use our internal SketchVM to edit the graphic
		try {
			if (!this.sketchViewModel.view) {
				console.warn('SketchViewModel view became invalid during selection');
				return;
			}

			this.sketchViewModel.update([graphic]);

			// Update measurements when graphic is selected for editing
			// FIXED: Add SketchViewModel validation before updating measurements
			if (this.measureRef?.current) {
				// Check if SketchViewModel is available before attempting measurement update
				if (this.sketchViewModel && this.sketchViewModel.view) {
					// Also check if measurements are not currently processing
					if (!this.measureRef.current.isBusy || !this.measureRef.current.isBusy()) {
						this.measureRef.current.updateMeasurementsForGraphic(graphic);
					} else {
						//console.log('Measurement system busy, deferring update');
						setTimeout(() => {
							if (this.measureRef?.current && this.sketchViewModel?.view) {
								this.measureRef.current.updateMeasurementsForGraphic(graphic);
							}
						}, 500);
					}
				} else {
					console.warn('SketchViewModel not ready for measurement update during selection');
				}
			}

			// Auto-select measurement label if measurement editing is active
			if (this.measureRef?.current?.isEditingMeasurements?.()) {
				//console.log('Measurement editing active - auto-selecting measurement label for newly selected graphic');
				// Use a small delay to ensure measurement updates are complete
				setTimeout(() => {
					if (this.measureRef?.current?.selectGraphicMeasurementLabel) {
						this.measureRef.current.selectGraphicMeasurementLabel(graphic as any);
					}
				}, 100);
			}

			// Set up buffer watcher for the selected graphic
			this.ensureBufferWatchersForSelectedGraphic(graphic as any);

			// ----- Overlay scheduling for point/text selections (epoch-guarded) -----
			const isPoint = graphic.geometry?.type === 'point';
			const ext = graphic as any;

			// If selecting a non-point (line/polygon), ensure any prior overlay on THIS graphic is gone
			if (!isPoint && ext._selectionOverlay) {
				try {
					if (ext._selectionOverlay.layer === this.drawLayer) this.drawLayer.remove(ext._selectionOverlay);
				} catch { }
				ext._selectionOverlay = null;
			}

			if (isPoint) {
				// Proactively clear stale pointer on this graphic (in case it somehow had one)
				try {
					if (ext._selectionOverlay) {
						if (ext._selectionOverlay.layer === this.drawLayer) this.drawLayer.remove(ext._selectionOverlay);
						ext._selectionOverlay = null;
					}
				} catch (e) {
					console.warn('Overlay pre-clear on target failed:', e);
					ext._selectionOverlay = null;
				}

				// Give SketchViewModel a tick to settle, then add halo; double-check shortly after.
				setTimeout(() => {
					if (myEpoch !== this._selectionEpoch) return; // stale job
					this.ensurePointTextOverlayFromMap(ext);

					setTimeout(() => {
						if (myEpoch !== this._selectionEpoch) return; // stale job
						if (!ext._selectionOverlay || ext._selectionOverlay.layer !== this.drawLayer) {
							this.ensurePointTextOverlayFromMap(ext);
						} else {
							// Keep geometry current & bring-to-front again for good measure
							try {
								ext._selectionOverlay.geometry = ext.geometry;
								this.drawLayer.remove(ext._selectionOverlay);
								this.drawLayer.add(ext._selectionOverlay);
							} catch { }
						}
					}, 250);
				}, 150);
			}
			// -----------------------------------------------------------------------

			// ----- Watchers for this graphic -----
			const graphicKey = (graphic.attributes && (graphic.attributes as any).uniqueId) || `temp_${Date.now()}`;

			// Remove any existing watchers for this graphic if present
			if (this._positionWatchers) {
				try {
					if (this._positionWatchers[graphicKey]) {
						this._positionWatchers[graphicKey].remove?.();
						delete this._positionWatchers[graphicKey];
					}
					if (this._positionWatchers[graphicKey + '_symbol']) {
						this._positionWatchers[graphicKey + '_symbol'].remove?.();
						delete this._positionWatchers[graphicKey + '_symbol'];
					}
					if (this._positionWatchers[graphicKey + '_attributes']) {
						this._positionWatchers[graphicKey + '_attributes'].remove?.();
						delete this._positionWatchers[graphicKey + '_attributes'];
					}
				} catch (e) {
					console.warn('Error clearing prior watchers:', e);
				}
			} else {
				this._positionWatchers = {};
			}

			// Geometry watcher - FIXED: Add SketchViewModel validation
			this._positionWatchers[graphicKey] = graphic.watch('geometry', async () => {
				// Debounced measurement update with SketchViewModel validation
				if (this.measureRef?.current && this.sketchViewModel?.view) {
					clearTimeout(this._measurementUpdateTimeout);
					this._measurementUpdateTimeout = setTimeout(() => {
						// Double-check SketchViewModel is still valid
						if (this.measureRef?.current && this.sketchViewModel?.view) {
							this.measureRef.current.updateMeasurementsForGraphic(graphic);
						}
					}, 300);
				}

				// Keep buffer synced if present
				const extendedGraphic = graphic as any;
				if (extendedGraphic.bufferGraphic && extendedGraphic.bufferSettings) {
					try {
						await this.updateAttachedBuffer(extendedGraphic);
					} catch (error) {
						console.error('❌ Widget: Error updating buffer:', error);
					}
				}

				// Keep overlay geometry in sync if present (points only)
				if (isPoint && (graphic as any)._selectionOverlay) {
					try { (graphic as any)._selectionOverlay.geometry = graphic.geometry; } catch { }
				}
			});

			// Symbol watcher - FIXED: Add SketchViewModel validation
			this._positionWatchers[graphicKey + '_symbol'] = graphic.watch('symbol', () => {
				if (graphic.geometry?.type === 'point' && this.measureRef?.current && this.sketchViewModel?.view) {
					setTimeout(() => {
						if (this.measureRef?.current && this.sketchViewModel?.view) {
							this.measureRef.current.updateMeasurementsForGraphic(graphic);
						}
					}, 100);
				}
			});

			// Attributes watcher - FIXED: Add SketchViewModel validation
			this._positionWatchers[graphicKey + '_attributes'] = graphic.watch('attributes', () => {
				if ((graphic.symbol as any)?.type === 'text' && this.measureRef?.current && this.sketchViewModel?.view) {
					setTimeout(() => {
						if (this.measureRef?.current && this.sketchViewModel?.view) {
							this.measureRef.current.updateMeasurementsForGraphic(graphic);
						}
					}, 100);
				}
			});

		} catch (error) {
			console.error('Error in handleDrawingSelect:', error);
		}
	};


	handleDrawingsUpdate = (updatedDrawings: Graphic[]) => {
		// Filter to get only main drawings (exclude buffers and measurement labels)
		const mainDrawings = updatedDrawings.filter(g =>
			!g.attributes?.isBuffer &&
			!g.attributes?.isMeasurementLabel &&
			!g.attributes?.hideFromList
		);

		// Save to localStorage using the same method as MyDrawingsPanel
		this.saveDrawingsToLocalStorage(mainDrawings);

		//console.log(`Saved ${mainDrawings.length} drawings to localStorage`);
	}

	private originalPopupEnabled: boolean | null = null;

	// Add this method to save drawings to localStorage
	private saveDrawingsToLocalStorage = (drawings: Graphic[]) => {
		try {
			// Use the same localStorage key format as MyDrawingsPanel
			const fullUrl = `${window.location.origin}${window.location.pathname}`;
			const baseKey = btoa(fullUrl).replace(/[^a-zA-Z0-9]/g, '_');
			const localStorageKey = `drawings_${baseKey}`;

			// Get all graphics from the layer
			const allGraphics = this.drawLayer.graphics.toArray();

			// Separate main drawings from measurement labels
			const mainDrawings = allGraphics.filter(g =>
				!g.attributes?.isMeasurementLabel &&
				!g.attributes?.hideFromList &&
				!g.attributes?.isPreviewBuffer &&
				!g.attributes?.isBuffer &&
				!g.attributes?.isBufferDrawing
			);

			const measurementLabels = allGraphics.filter(g =>
				g.attributes?.isMeasurementLabel &&
				!g.attributes?.isPreviewBuffer
			);

			// Prepare main drawings for storage with buffer settings
			const drawingsToSave = mainDrawings.map((graphic) => {
				const extendedGraphic = graphic as any;
				const json = graphic.toJSON();

				// Ensure each graphic has a uniqueId
				if (!json.attributes) {
					json.attributes = {};
				}
				if (!json.attributes.uniqueId) {
					const uniqueId = `saved_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
					json.attributes.uniqueId = uniqueId;
				}
				if (!json.attributes.createdDate) {
					json.attributes.createdDate = Date.now();
				}

				// Save buffer settings if this graphic has an attached buffer
				if (extendedGraphic.bufferSettings) {
					json.attributes.bufferSettings = {
						distance: extendedGraphic.bufferSettings.distance,
						unit: extendedGraphic.bufferSettings.unit,
						enabled: extendedGraphic.bufferSettings.enabled
					};
				}

				return json;
			});

			// Prepare measurement labels for storage
			const measurementLabelsToSave = measurementLabels.map((label) => {
				const extendedLabel = label as any;
				const json = label.toJSON();

				if (!json.attributes) {
					json.attributes = {};
				}

				// Store the parent graphic's uniqueId for restoration
				if (extendedLabel.measureParent?.attributes?.uniqueId) {
					json.attributes.parentGraphicId = extendedLabel.measureParent.attributes.uniqueId;
				}

				// Ensure measurement label flags are preserved
				json.attributes.isMeasurementLabel = true;
				json.attributes.hideFromList = true;

				return json;
			});

			// Combine drawings and measurement labels
			const allGraphicsToSave = {
				drawings: drawingsToSave,
				measurementLabels: measurementLabelsToSave,
				version: "1.3"
			};

			// Save to localStorage
			const stringified = JSON.stringify(allGraphicsToSave);
			localStorage.setItem(localStorageKey, stringified);

			//console.log(`✅ Successfully saved ${drawingsToSave.length} drawing(s) and ${measurementLabelsToSave.length} measurement label(s) to localStorage`);

		} catch (error) {
			console.error(`❌ Error saving drawings to localStorage:`, error);
		}
	};

	showAlert = (message: string, type: 'success' | 'error' | 'info') => {
		//console.log(`${type}: ${message}`);
		alert(message);
	}

	svmGraCreate = async (evt) => {
		try {
			// Basic validation
			if (!evt || !evt.graphic) return;

			const g = evt.graphic;

			// ---- ACTIVE STATE: Show live measurements during drawing ----
			if (evt.state === 'active') {
				// Update live measurements if the measurement system is enabled
				if (this.measureRef?.current) {
					try {
						await this.measureRef.current.updateMeasurementsForGraphic(g);
					} catch (error) {
						console.warn('Error updating live measurements:', error);
					}
				}
				return; // Exit early for active state
			}

			// ---- COMPLETE STATE: Finalize the drawing ----
			if (evt.state !== 'complete') return;

			// ---- 1) Initialize base attributes immediately (before any async) ----
			g.attributes = g.attributes || {};
			if (!g.attributes.uniqueId) {
				g.attributes.uniqueId = `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
			}
			g.attributes.isDrawing = true;       // important: prevents measurement cleanup from touching parents
			g.attributes.hideFromList = false;   // ensure it shows in My Drawings
			g.attributes.drawMode = this.state.currentTool;
			g.attributes.createdDate = Date.now();

			// Name after current tool; index will be refined after we ensure layer presence
			g.attributes.name = `${this.state.currentTool} ${this.drawLayer.graphics.length + 1}`;

			// ---- 2) Ensure visibility and layer membership (prevents "exists but not shown") ----
			if (g.visible === false) g.visible = true;

			// SketchViewModel normally adds it, but re-assert to be safe
			if (!this.drawLayer.graphics?.includes?.(g)) {
				try { this.drawLayer.add(g); } catch { /* no-op */ }
			}

			// Give the layer a render turn (prevents race with measurement code)
			const v = this.sketchViewModel?.view;
			if (v && typeof v.whenLayerView === 'function') {
				try { await v.whenLayerView(this.drawLayer); } catch { /* no-op */ }
			}
			await new Promise(r => requestAnimationFrame(() => r(null)));

			// ---- 3) Apply arrows (if enabled) for polylines ----
			if (this.state.arrowEnabled &&
				g.geometry?.type === 'polyline' &&
				g.symbol?.type === 'simple-line') {
				try {
					const baseSymbol = g.symbol as __esri.SimpleLineSymbol;
					const arrowSymbol = this.createLineSymbolWithBuiltInArrows(
						baseSymbol,
						this.state.arrowPosition,
						this.state.arrowSize
					);
					g.symbol = arrowSymbol;
				} catch (e) {
					console.warn('Error applying arrows on create:', e);
				}
			}

			// ---- 4) If text tool, ensure the text symbol is applied now ----
			if (this.state.currentTool === 'text') {
				try {
					g.symbol = this.state.currentTextSymbol.clone();
				} catch (e) {
					console.warn('Failed to apply currentTextSymbol:', e);
				}
			}

			// ---- 5) Update name using only real drawings (excludes buffers/labels) ----
			try {
				const mainDrawings = this.drawLayer.graphics.toArray().filter(gg =>
					!gg.attributes?.isBuffer &&
					!gg.attributes?.isMeasurementLabel &&
					gg.attributes?.isDrawing === true &&
					gg.attributes?.hideFromList !== true
				);
				// Position in list is 1-based
				const idx = Math.max(1, mainDrawings.indexOf(g) + 1);
				g.attributes.name = `${this.state.currentTool} ${idx}`;
			} catch { /* best effort */ }

			// ---- 6) Persist drawings (deferred a tick) ----
			setTimeout(() => {
				try {
					if (this._drawingMap && g.attributes?.uniqueId) {
						const mainDrawings = this.drawLayer.graphics.toArray().filter(gg =>
							!gg.attributes?.isBuffer &&
							!gg.attributes?.isMeasurementLabel &&
							gg.attributes?.isDrawing === true &&
							gg.attributes?.hideFromList !== true
						);
						this._drawingMap.set(g.attributes.uniqueId, Math.max(0, mainDrawings.indexOf(g)));
					}
					this.handleDrawingsUpdate(this.drawLayer.graphics.toArray());
				} catch (e) {
					console.warn('Error saving drawings after create:', e);
				}
			}, 100);

			// ---- 7) Handle creation mode ----
			if (this.creationMode === 'continuous') {
				switch (this.state.currentTool) {
					case 'extent':
						this.sketchViewModel.create('rectangle');
						break;
					case 'freepolyline':
						this.sketchViewModel.create('polyline', { mode: 'freehand' });
						break;
					case 'polyline':
						this.sketchViewModel.create('polyline');
						break;
					case 'point':
						this.sketchViewModel.create('point');
						break;
					case 'polygon':
						this.sketchViewModel.create('polygon');
						break;
					case 'freepolygon':
						this.sketchViewModel.create('polygon', { mode: 'freehand' });
						break;
					case 'circle':
						this.sketchViewModel.create('circle');
						break;
					case 'text':
						// already applied text symbol above; start a new one
						this.sketchViewModel.create('point');
						break;
					default:
						break;
				}
			} else if (this.creationMode === 'single') {
				// For single mode: if tool was text, we already set symbol; now exit draw mode
				this.setDrawToolBtnState(null);
			}

			// ---- 8) Optional: light refresh to ensure visibility in edge cases ----
			requestAnimationFrame(() => {
				try {
					if (typeof (this.drawLayer as any).refresh === 'function') {
						(this.drawLayer as any).refresh();
					}
				} catch { /* no-op */ }
			});
		} catch (err) {
			console.error('Error in svmGraCreate:', err);
		}
	};

	svmGraUpdate = (evt) => {
		try {
			// Validate SketchViewModel and view before proceeding
			if (!this.sketchViewModel || !this.sketchViewModel.view) {
				console.warn('SketchViewModel view not available in update');
				return;
			}

			// Update undo/redo availability in state
			this.setState({
				canUndo: this.sketchViewModel.canUndo(),
				canRedo: this.sketchViewModel.canRedo()
			});

			if (evt.state === 'start') {
				if (evt.graphics) {
					// Filter out ALL buffer graphics and measurement labels from selection
					const selectableGraphics = evt.graphics.filter((gra: Graphic) => {
						// Skip ALL buffer graphics (both attached and standalone)
						if (gra.attributes?.isBuffer ||
							gra.attributes?.isBufferDrawing ||
							gra.attributes?.isPreviewBuffer ||
							gra.attributes?.uniqueId?.startsWith('buffer_')) {
							return false;
						}
						// Skip measurement labels
						if (gra.attributes?.isMeasurementLabel) {
							return false;
						}
						// Skip hidden graphics
						if (gra.attributes?.hideFromList) {
							return false;
						}
						// Additional safety check for text measurement labels
						if (gra.geometry?.type === 'point' &&
							gra.symbol?.type === 'text' &&
							gra.attributes?.isMeasurementLabel) {
							return false;
						}
						return true;
					});

					// If no selectable graphics remain, cancel the update
					if (selectableGraphics.length === 0) {
						try {
							if (this.sketchViewModel && this.sketchViewModel.view) {
								this.sketchViewModel.cancel();
							}
						} catch (error) {
							console.warn('Error canceling SketchViewModel in svmGraUpdate:', error);
						}
						return;
					}

					// NEW: Ensure buffer watchers for selected graphics
					selectableGraphics.forEach((graphic: any) => {
						try {
							this.ensureBufferWatchersForSelectedGraphic(graphic);
						} catch (error) {
							console.warn('Error setting up buffer watcher:', error);
						}
					});

					// Continue with only selectable graphics
					selectableGraphics.forEach((gra: Graphic) => {
						try {
							if (gra.geometry.type === 'point' && gra.symbol.type === 'text') {
								// Handle text graphics...
								const cTextSym: TextSymbol = gra.symbol.clone();
								let cState: any = {};
								cState['vTextAlign'] = cTextSym.verticalAlignment;
								cState['vAlignBaseBtnActive'] = cTextSym.verticalAlignment === 'baseline';
								cState['vAlignTopBtnActive'] = cTextSym.verticalAlignment === 'top';
								cState['vAlignMidBtnActive'] = cTextSym.verticalAlignment === 'middle';
								cState['vAlignBotBtnActive'] = cTextSym.verticalAlignment === 'bottom';
								cState['hTextAlign'] = cTextSym.horizontalAlignment;
								cState['hAlignLeftBtnActive'] = cTextSym.horizontalAlignment === 'left';
								cState['hAlignCenterBtnActive'] = cTextSym.horizontalAlignment === 'center';
								cState['hAlignRightBtnActive'] = cTextSym.horizontalAlignment === 'right';
								cState['fontRotation'] = cTextSym.angle;
								cState['showSymPreview'] = false;
								cState['showTextPreview'] = true;
								cState['currentSymbol'] = null;
								cState['currentSymbolType'] = null;
								cState['currentTextSymbol'] = cTextSym;
								cState['graphics'] = selectableGraphics;
								cState['clearBtnTitle'] = this.nls('drawClearSelected');
								cState['fontColor'] = this.convertSymbolColorToColorPickerValue(cTextSym.color);
								cState['fontOpacity'] = cTextSym.color.a;
								cState['fontSize'] = cTextSym.font.size;
								cState['textSymPreviewText'] = cTextSym.text;
								cState['fontHaloEnabled'] = cTextSym.haloSize !== null;
								if (cTextSym.haloColor) {
									cState['fontHaloOpacity'] = cTextSym.haloColor.a;
									cState['fontHaloColor'] = this.convertSymbolColorToColorPickerValue(cTextSym.haloColor);
									cState['fontHaloSize'] = cTextSym.haloSize;
									cState['fontHalo'] = cState['fontHaloSize'] + 'px ' + cState['fontHaloColor'];
								} else {
									cState['fontHaloOpacity'] = 1;
									cState['fontHalo'] = 'unset';
									cState['fontHaloColor'] = 'rgba(255,255,255,1)';
									cState['fontHaloSize'] = 1;
								}
								cState['fontWeight'] = cTextSym.font.weight;
								cState['fontDecoration'] = cTextSym.font.decoration;
								cState['fontStyle'] = cTextSym.font.style;
								cState['fsBoldBtnActive'] = cTextSym.font.weight !== 'normal';
								cState['fsItalicBtnActive'] = cTextSym.font.style !== 'normal';
								cState['fsUnderlineBtnActive'] = cTextSym.font.decoration !== 'none';
								cState['fontBackgroundColor'] = this.convertSymbolColorToColorPickerValue(cTextSym.backgroundColor);
								this.setState(cState);
							} else {
								// For non-text graphics, prepare state to show symbol preview settings

								// ADDITION: Preserve arrow settings for polylines during selection
								if (gra.geometry.type === 'polyline') {
									//console.log('Selected polyline - checking for arrows:', gra.attributes?.uniqueId);

									// Check if this polyline has arrows that need to be preserved
									if (gra.symbol?.type === 'simple-line') {
										const lineSymbol = gra.symbol as __esri.SimpleLineSymbol;
										const hasArrows = !!(lineSymbol as any).marker;

										if (hasArrows) {
											//console.log('Polyline has arrows - preserving arrow settings');
											// Don't override arrow settings for polylines that already have them
										} else if (this.state.arrowEnabled) {
											//console.log('Applying current arrow settings to selected polyline');
											// Apply current arrow settings to polylines without arrows
											try {
												const arrowSymbol = this.createLineSymbolWithBuiltInArrows(
													lineSymbol,
													this.state.arrowPosition,
													this.state.arrowSize
												);
												gra.symbol = arrowSymbol;
											} catch (error) {
												console.warn('Error applying arrow settings:', error);
											}
										}
									}
								}

								if (gra.geometry.type === 'point') {
									this.setState({ rotationMode: true });
								}
								this.setState({
									showSymPreview: true,
									showTextPreview: false,
									currentSymbol: selectableGraphics[0].symbol,
									graphics: selectableGraphics,
									clearBtnTitle: this.nls('drawClearSelected')
								});
							}
						} catch (error) {
							console.warn('Error processing selectable graphic:', error);
						}
					});
				}
			} else if (evt.state === 'active') {
				// Handle active editing state
				if (evt.graphics && evt.graphics.length > 0) {
					const activeGraphic = evt.graphics[0];

					// ADDITION: Preserve arrows during active editing
					if (activeGraphic.geometry?.type === 'polyline' && this.state.arrowEnabled) {
						// Check if the symbol has lost its arrows during editing
						if (activeGraphic.symbol?.type === 'simple-line') {
							const lineSymbol = activeGraphic.symbol as __esri.SimpleLineSymbol;
							const hasMarker = !!(lineSymbol as any).marker;

							if (!hasMarker) {
								//console.log('Reapplying arrows during active editing');
								try {
									const arrowSymbol = this.createLineSymbolWithBuiltInArrows(
										lineSymbol,
										this.state.arrowPosition,
										this.state.arrowSize
									);
									activeGraphic.symbol = arrowSymbol;
								} catch (error) {
									console.warn('Error reapplying arrows during active editing:', error);
								}
							}
						}
					}
				}
			} else if (evt.state === 'complete') {
				// When editing is complete, reset states
				this.setState({
					graphics: null,
					clearBtnTitle: this.nls('drawClear'),
					rotationMode: false
				});

				// ADDITION: Ensure arrows are preserved after editing completion
				if (evt.graphics && evt.graphics.length > 0) {
					const completedGraphic = evt.graphics[0];

					if (completedGraphic.geometry?.type === 'polyline' && this.state.arrowEnabled) {
						if (completedGraphic.symbol?.type === 'simple-line') {
							const lineSymbol = completedGraphic.symbol as __esri.SimpleLineSymbol;
							const hasMarker = !!(lineSymbol as any).marker;

							if (!hasMarker) {
								//console.log('Reapplying arrows after editing completion');
								try {
									const arrowSymbol = this.createLineSymbolWithBuiltInArrows(
										lineSymbol,
										this.state.arrowPosition,
										this.state.arrowSize
									);
									completedGraphic.symbol = arrowSymbol;
								} catch (error) {
									console.warn('Error reapplying arrows after editing completion:', error);
								}
							}
						}
					}
				}
			}
		} catch (error) {
			console.error('Error in svmGraUpdate:', error);
		}
	};


	onSymbolPopper = (evt) => {
		//workarounds for symbol selector styling issues
		if (evt) {
			if (this.state.currentSymbolType === JimuSymbolType.Polyline) {
				let ddBtnCont = document.getElementsByClassName('dropdown-button-content')[0] as HTMLElement;
				ddBtnCont.style.filter = 'invert(1)';
			}
			let ddBtn = document.getElementsByClassName('jimu-btn jimu-dropdown-button dropdown-button')[0] as HTMLElement;
			if (ddBtn) {
				ddBtn.addEventListener('click', (evt) => {
					setTimeout(() => {
						let ddInner = document.getElementsByClassName('dropdown-menu--inner')[0] as HTMLElement;
						if (ddInner) {
							for (let i = 0; i < ddInner.children.length; i++) {
								let btn = ddInner.children[i];
								const imgs = btn.getElementsByTagName('img');
								for (let im = 0; im < imgs.length; im++) {
									imgs[im].style.filter = 'invert(1)';
								}
							}
						}
					}, 20);
				});
			}
			let unitSelectors = document.getElementsByClassName('style-setting--unit-selector');
			Array.from(unitSelectors).forEach((ele: HTMLElement) => {
				// Fix: Check if firstChild exists before accessing its style
				if (ele.firstChild && ele.firstChild instanceof HTMLElement) {
					ele.firstChild.style.padding = '0';
				}
			});
			let popper = document.getElementsByClassName('content-container')[0].parentNode.parentElement;
			setTimeout(() => {
				popper.style.zIndex = '1004';
			}, 5);
			let colorPickerBlocks = document.getElementsByClassName('color-picker-block');
			Array.from(colorPickerBlocks).forEach((ele: HTMLElement) => {
				ele.addEventListener('click', e => { this.onColorPickerToggle(e) });
			});
		}
	}

  onPointSymChanged = (evt) => {
	this.setState({
	  currentSymbol: evt,
	  currentSymbolType: JimuSymbolType.Point
	}, ()=>{
	  this.sketchViewModel.pointSymbol = evt;
	  if(this.state.graphics && this.state.graphics.length > 0){
		this.state.graphics.map((gra:Graphic)=>{
		  if(gra.geometry.type === 'point'){
			gra.symbol = evt;
		  }
		});
	  }
	});
  }

  onPolygonSymbolChanged = (evt) => {
	this.setState({
	  currentSymbol: evt,
	  currentSymbolType: JimuSymbolType.Polygon
	}, ()=>{
	  this.sketchViewModel.polygonSymbol = evt;
	  if(this.state.graphics && this.state.graphics.length > 0){
		this.state.graphics.map((gra:Graphic)=>{
		  if(gra.geometry.type === 'polygon' || gra.geometry.type === 'extent'){
			gra.symbol = evt;
		  }
		});
	  }
	});
  }

	onPolylineSymbolChanged = (evt) => {
		//console.log('Polyline symbol changed - preserving arrow settings:', evt);

		if (!evt || evt.type !== 'simple-line') {
			console.warn('Invalid symbol passed to onPolylineSymbolChanged');
			return;
		}

		// Clone and clean the symbol
		const cleanSymbol = evt.clone();
		delete (cleanSymbol as any).marker; // Remove any existing marker

		let finalSymbol = cleanSymbol;

		// Apply arrows if enabled using current state values
		if (this.state.arrowEnabled) {
			// console.log('Arrows enabled, creating symbol with current settings:', {
			//   position: this.state.arrowPosition,
			//   size: this.state.arrowSize
			// });
			finalSymbol = this.createLineSymbolWithBuiltInArrows(
				cleanSymbol,
				this.state.arrowPosition,
				this.state.arrowSize
			);
		}

		this.setState({
			currentSymbol: finalSymbol,
			currentSymbolType: JimuSymbolType.Polyline
		}, () => {
			this.sketchViewModel.polylineSymbol = finalSymbol;
			if (this.state.graphics && this.state.graphics.length > 0) {
				this.state.graphics.map((gra: Graphic) => {
					if (gra.geometry.type === 'polyline') {
						gra.symbol = finalSymbol;
					}
				});
			}
		});
	}

	drawClearBtnClick = () => {
		if (!this.sketchViewModel || !this.sketchViewModel.view) {
			console.warn('SketchViewModel not available for clear operation');
			return;
		}

		try {
			if (this.state.graphics && this.state.graphics.length) {
				// Remove any associated measurements, buffers, and attached buffers before deleting the drawing
				this.state.graphics.forEach((gra: Graphic) => {
					try {
						const extendedGraphic = gra as any; // Type assertion for extended properties

						// Remove measurement graphics
						if (extendedGraphic.measure?.graphic) {
							this.drawLayer.remove(extendedGraphic.measure.graphic);
						}
						if (gra.attributes?.relatedSegmentLabels) {
							this.drawLayer.removeMany(gra.attributes.relatedSegmentLabels);
						}

						// 🔧 ENHANCED: Remove attached buffer graphics
						if (extendedGraphic.bufferGraphic) {
							//console.log(`🗑️ Widget: Removing attached buffer for selected graphic`);
							this.drawLayer.remove(extendedGraphic.bufferGraphic);
							extendedGraphic.bufferGraphic = null;
						}

						// Clear buffer settings
						if (extendedGraphic.bufferSettings) {
							extendedGraphic.bufferSettings = null;
						}

						// 🔧 NEW: Remove geometry watchers for this graphic
						const parentId = gra.attributes?.uniqueId;
						if (parentId && this._positionWatchers) {
							const watcherKey = parentId + '_widget_buffer';
							if (this._positionWatchers[watcherKey]) {
								try {
									this._positionWatchers[watcherKey].remove();
									delete this._positionWatchers[watcherKey];
								} catch (error) {
									console.warn('Error removing geometry watcher during clear:', error);
								}
							}
						}
					} catch (error) {
						console.warn('Error processing graphic during clear:', error);
					}
				});

				// Now delete the drawing itself
				try {
					this.sketchViewModel.delete();
				} catch (error) {
					console.error('Error deleting selected graphics:', error);
				}
				return;
			}

			// If clearing all graphics, also remove all buffers and clean up watchers
			const allGraphics = this.drawLayer.graphics.toArray();

			// 🔧 ENHANCED: Remove ALL buffer types when clearing all
			const allBuffers = allGraphics.filter(g =>
				g.attributes?.isBuffer ||
				g.attributes?.isPreviewBuffer ||
				g.attributes?.isBufferDrawing
			);

			if (allBuffers.length > 0) {
				//console.log(`🗑️ Widget: Removing ${allBuffers.length} buffer graphics during clear all`);
				allBuffers.forEach(buffer => {
					try {
						this.drawLayer.remove(buffer);
					} catch (error) {
						console.warn('Error removing buffer graphic:', error);
					}
				});
			}

			// 🔧 NEW: Clean up ALL geometry watchers
			if (this._positionWatchers) {
				Object.values(this._positionWatchers).forEach(watcher => {
					if (watcher && typeof watcher.remove === 'function') {
						try {
							watcher.remove();
						} catch (error) {
							console.warn('Error removing watcher during clear all:', error);
						}
					}
				});
				this._positionWatchers = {};
				//console.log(`✅ Widget: Cleared all geometry watchers`);
			}

			// Clear the drawing layer
			try {
				this.drawLayer.removeAll();
			} catch (error) {
				console.warn('Error clearing draw layer:', error);
			}

			// BUGFIX: Removed this.sketchViewModel.cancel() to prevent button state mismatch
			// This was causing the draw tools to become inactive while buttons remained visually selected

			// Close the confirmation dialog
			this.setState({ confirmDelete: false });

			//console.log(`✅ Widget: Clear all completed with buffer cleanup`);

		} catch (error) {
			console.error('Error in drawClearBtnClick:', error);
			// Ensure confirmation dialog is closed even if there's an error
			this.setState({ confirmDelete: false });
		}
	};

	drawUndoBtnClick = () => {
		if (!this.sketchViewModel || !this.sketchViewModel.view) {
			console.warn('SketchViewModel not available for undo');
			return;
		}

		try {
			if (this.sketchViewModel.canUndo()) {
				this.sketchViewModel.undo();
			}
			this.setState({
				canUndo: this.sketchViewModel.canUndo(),
				canRedo: this.sketchViewModel.canRedo()
			});
		} catch (error) {
			console.error('Error in drawUndoBtnClick:', error);
		}
	}

	drawRedoBtnClick = () => {
		if (!this.sketchViewModel || !this.sketchViewModel.view) {
			console.warn('SketchViewModel not available for redo');
			return;
		}

		try {
			if (this.sketchViewModel.canRedo()) {
				this.sketchViewModel.redo();
			}
			this.setState({
				canUndo: this.sketchViewModel.canUndo(),
				canRedo: this.sketchViewModel.canRedo()
			});
		} catch (error) {
			console.error('Error in drawRedoBtnClick:', error);
		}
	}

  TextOnChange = (evt) => {
	let value = evt.currentTarget.value;
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.text = value;
	this.setState({
	  textSymPreviewText: value,
	  currentTextSymbol: ts,
	  textHasChanged: true
	}, ()=>{this.updateSelectedTextGras()});
  }

  fontSizeOnChange = (size) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.font.size = size;
	this.setState({
	  fontSize : size,
	  currentTextSymbol: ts,
	  textPreviewHeight: this.getRotatedTextHeight()
	}, ()=>{this.updateSelectedTextGras()});
  }

  fontHaloSizeChange = (evt) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.haloSize = parseInt(evt);
	this.setState({
	  fontHaloSize : parseInt(evt),
	  currentTextSymbol: ts,
	  fontHalo: this.state.fontHaloEnabled ?  evt + "px " + this.state.fontHaloColor : 'unset'
	}, ()=>{this.updateSelectedTextGras()});
  }

  updateTextColor = (evt) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.color = evt;
	this.setState({
	  fontColor: this.convertSymbolColorToColorPickerValue(ts.color),
	  fontOpacity: ts.color.a,
	  currentTextSymbol: ts
	}, ()=>{this.updateSelectedTextGras()});
  }

  updateFontHaloColor = (evt) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.haloColor = evt;
	this.setState({
	  fontHaloColor: evt,
	  currentTextSymbol: ts,
	  fontHalo: this.state.fontHaloEnabled ?  this.state.fontHaloSize + "px " + evt : 'unset'
	}, ()=>{this.updateSelectedTextGras()});
  }

  updateBackgroundColor = (evt) => {
	  const color = new Color(evt)
	  let ts: TextSymbol = this.state.currentTextSymbol;
	  ts.backgroundColor = color;
	this.setState({
	  fontBackgroundColor: color,
	  currentTextSymbol: ts
	}, ()=>{this.updateSelectedTextGras()});
  }

  fontHaloChkChange = (evt) => {
	const target = evt.currentTarget;
	if (!target) return;
	let ts: TextSymbol = this.state.currentTextSymbol;
	if(!target.checked){
	  ts.haloColor = null;
	  ts.haloSize = null;
	}else{
	  ts.haloColor = this.state.fontHaloColor as any;
	  ts.haloSize = this.state.fontHaloSize
	}
	this.setState({
	  currentTextSymbol: ts,
	  fontHaloEnabled: target.checked,
	  fontHalo: target.checked ? this.state.fontHaloSize + "px " + this.state.fontHaloColor : 'unset'
	}, ()=>{this.updateSelectedTextGras()});
  }

  onHTextAlignChange = (evt) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.horizontalAlignment = evt;

	this.setState({
	  hTextAlign: evt,
	  currentTextSymbol: ts
	}, ()=>{this.updateSelectedTextGras()});
  }

  fontRotationChange = (evt) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.angle = evt;

	this.setState({
	  fontRotation: evt,
	  currentTextSymbol: ts,
	  textPreviewHeight: this.getRotatedTextHeight()
	}, ()=>{this.updateSelectedTextGras()});
  }

  onVertFontAlignChange = (evt, valign) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.verticalAlignment = valign;
	this.setState({
	  vTextAlign: valign,
	  vAlignBaseBtnActive: valign==='baseline',
	  vAlignTopBtnActive: valign==='top',
	  vAlignMidBtnActive: valign==='middle',
	  vAlignBotBtnActive: valign==='bottom',
	  currentTextSymbol: ts
	}, ()=>{this.updateSelectedTextGras()});
	this.updateActiveBtnIcons();
  }

  updateActiveBtnIcons = () => {
	setTimeout(() => {
	  let activeBtns = document.querySelectorAll('.btn-group>.icon-btn');
	  Array.from(activeBtns).forEach((ele:HTMLElement) =>{
		this.setImgElemFilter(ele, ele.classList.contains('active'));
	  });
	}, 20);
  }

  setImgElemFilter = (ele:HTMLElement, isActive:boolean) => {
	let img = ele.getElementsByTagName('img')[0] as HTMLElement;
	if(!img){
	  return;
	}
	if(img.getAttribute('style') && img.getAttribute('style').indexOf("filter:") > -1 && !isActive){
	  img.style.filter = '';
	}
	if((!img.getAttribute('style') || img.style.filter == "")  && isActive){
	  img.style.filter = 'invert(1)';
	}
  }

  onHorizFontAlignChange = (evt, halign) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.horizontalAlignment = halign;
	this.setState({
	  hTextAlign: halign,
	  hAlignLeftBtnActive: halign==='left',
	  hAlignCenterBtnActive: halign==='center',
	  hAlignRightBtnActive: halign==='right',
	  currentTextSymbol: ts
	}, ()=>{this.updateSelectedTextGras()});
  }

	updateSelectedTextGras = () => {
		if (this.state.graphics && this.state.graphics.length > 0) {
			this.state.graphics.forEach((gra: Graphic) => {
				if (gra.geometry.type === 'point' && gra.symbol.type === 'text') {
					// Skip updating if this is a measurement label
					if (gra.attributes?.isMeasurementLabel) {
						return; // Don't modify measurement labels' text symbol
					}

					// Apply the current text symbol for non-measurement labels
					gra.symbol = this.state.currentTextSymbol;

					// Clone the graphic to ensure we don't modify the original directly
					const uGra = gra.clone();

					// Remove and re-add the updated graphic to reflect changes
					this.drawLayer.remove(gra);
					this.drawLayer.add(uGra);

					// Update the sketch view model with the new graphic
					this.sketchViewModel.update(uGra);
				}
			});
		}
	};

  getRotatedTextHeight = () => {
	let span, spanParent, 
	  rad = this.state.fontRotation * (Math.PI / 180);
	if(document.getElementsByClassName('text-symbol-span')[0]){
	  span = (document.getElementsByClassName('text-symbol-span')[0] as HTMLElement);
	};
	if(document.getElementsByClassName('text-symbol-item')[0]){
	  spanParent = (document.getElementsByClassName('text-symbol-item')[0] as HTMLElement);
	};
	if(span === undefined || span === null){
	  return 13;
	}
	return Math.abs(span.clientWidth * Math.sin(rad) + span.clientHeight * Math.cos(rad)) + 12;
  }

  onFontStyleChange = (evt, key) => {
	let cState = {};
	let ts: TextSymbol = this.state.currentTextSymbol;
	if(key === 'bold') {
	  if(!this.state.fsBoldBtnActive){
		ts.font.weight = 'bold';
	  }else{
		ts.font.weight = 'normal';
	  }
	  cState['fontWeight'] = ts.font.weight;
	  cState['fsBoldBtnActive'] = !this.state.fsBoldBtnActive;
	}
	if(key === 'italic') {
	  if(!this.state.fsItalicBtnActive){
		ts.font.style = 'italic';
	  }else{
		ts.font.style = 'normal';
	  }
	  cState['fontStyle'] = ts.font.style;
	  cState['fsItalicBtnActive'] = !this.state.fsItalicBtnActive;
	}
	if(key === 'underline') {
	  if(!this.state.fsUnderlineBtnActive){
		ts.font.decoration = 'underline'
	  }else{
		ts.font.decoration = 'none';
	  }
	  cState['fontDecoration'] = ts.font.decoration;
	  cState['fsUnderlineBtnActive'] = !this.state.fsUnderlineBtnActive;
	}
	cState['currentTextSymbol'] = ts;
	this.setState(cState, ()=>{this.updateSelectedTextGras()});
	this.updateActiveBtnIcons();
  }

	setDrawToolBtnState = (toolBtn: 'point' | 'polyline' | 'freepolyline' | 'extent' | 'polygon' | 'circle' | 'freepolygon' | 'text' | '') => {
		// ENHANCED: Clean measurement editing coordination before drawing tool activation
		if (toolBtn !== '' && this.measureRef?.current?.isEditingMeasurements?.()) {
			//console.log('Drawing tool activating - cleaning up measurement editing');
			this.measureRef.current.cleanupMeasurementLabelSelection?.();
			// Note: disableMeasurements() will be called automatically by the measurement component
			// when it detects currentTool prop change
		}

		// Validate SketchViewModel before proceeding with drawing tools
		if (toolBtn !== '' && (!this.sketchViewModel || !this.sketchViewModel.view)) {
			console.warn('SketchViewModel not available for drawing tool activation');
			return;
		}

		// Check if we're exiting all drawing tools for popup restoration
		const wasInDrawingMode = this.state.pointBtnActive || this.state.lineBtnActive ||
			this.state.flineBtnActive || this.state.rectBtnActive ||
			this.state.polygonBtnActive || this.state.fpolygonBtnActive ||
			this.state.circleBtnActive || this.state.textBtnActive;

		const willBeInDrawingMode = toolBtn !== '';

		// FIXED: Check if clicking the same active button to toggle it off
		const isTogglingOff = (
			(toolBtn === 'point' && this.state.pointBtnActive) ||
			(toolBtn === 'polyline' && this.state.lineBtnActive) ||
			(toolBtn === 'freepolyline' && this.state.flineBtnActive) ||
			(toolBtn === 'extent' && this.state.rectBtnActive) ||
			(toolBtn === 'polygon' && this.state.polygonBtnActive) ||
			(toolBtn === 'freepolygon' && this.state.fpolygonBtnActive) ||
			(toolBtn === 'circle' && this.state.circleBtnActive) ||
			(toolBtn === 'text' && this.state.textBtnActive)
		);

		// If toggling off the active tool, treat it as exiting drawing mode
		if (isTogglingOff) {
			toolBtn = '';
		}

		// Initialize button state - all tools off by default
		let cState: Partial<States> = {
			pointBtnActive: false,
			lineBtnActive: false,
			flineBtnActive: false,
			rectBtnActive: false,
			polygonBtnActive: false,
			fpolygonBtnActive: false,
			circleBtnActive: false,
			textBtnActive: false,
			currentTool: toolBtn
		};

		try {
			// Always cancel any existing operations first
			if (this.sketchViewModel) {
				this.sketchViewModel.cancel();
			}

			switch (toolBtn) {
				case 'point':
					cState.currentSymbol = this.sketchViewModel.pointSymbol;
					cState.currentSymbolType = JimuSymbolType.Point;
					this.sketchViewModel.create("point");
					cState.pointBtnActive = true;
					break;

				case 'polyline': {
					let baseSymbol = this.sketchViewModel.polylineSymbol as __esri.SimpleLineSymbol;
					let finalSymbol: __esri.SimpleLineSymbol = baseSymbol;

					// Apply arrows if enabled
					if (this.state.arrowEnabled && baseSymbol?.type === 'simple-line') {
						try {
							finalSymbol = this.createLineSymbolWithBuiltInArrows(
								baseSymbol,
								this.state.arrowPosition,
								this.state.arrowSize
							);
						} catch (error) {
							console.warn('Error creating arrow symbol, using base symbol:', error);
							finalSymbol = baseSymbol;
						}
					}

					cState.currentSymbol = finalSymbol;
					cState.currentSymbolType = JimuSymbolType.Polyline;
					this.sketchViewModel.polylineSymbol = finalSymbol;
					this.sketchViewModel.create("polyline");
					cState.lineBtnActive = true;
					break;
				}

				case 'freepolyline': {
					let baseSymbol = this.sketchViewModel.polylineSymbol as __esri.SimpleLineSymbol;
					let finalSymbol: __esri.SimpleLineSymbol = baseSymbol;

					// Apply arrows if enabled
					if (this.state.arrowEnabled && baseSymbol?.type === 'simple-line') {
						try {
							finalSymbol = this.createLineSymbolWithBuiltInArrows(
								baseSymbol,
								this.state.arrowPosition,
								this.state.arrowSize
							);
						} catch (error) {
							console.warn('Error creating arrow symbol, using base symbol:', error);
							finalSymbol = baseSymbol;
						}
					}

					cState.currentSymbol = finalSymbol;
					cState.currentSymbolType = JimuSymbolType.Polyline;
					this.sketchViewModel.polylineSymbol = finalSymbol;
					this.sketchViewModel.create("polyline", { mode: 'freehand' });
					cState.flineBtnActive = true;
					break;
				}

				case 'extent':
					cState.currentSymbol = this.sketchViewModel.polygonSymbol;
					cState.currentSymbolType = JimuSymbolType.Polygon;
					this.sketchViewModel.create("rectangle");
					cState.rectBtnActive = true;
					break;

				case 'polygon':
					cState.currentSymbol = this.sketchViewModel.polygonSymbol;
					cState.currentSymbolType = JimuSymbolType.Polygon;
					this.sketchViewModel.create("polygon");
					cState.polygonBtnActive = true;
					break;

				case 'freepolygon':
					cState.currentSymbol = this.sketchViewModel.polygonSymbol;
					cState.currentSymbolType = JimuSymbolType.Polygon;
					this.sketchViewModel.create("polygon", { mode: 'freehand' });
					cState.fpolygonBtnActive = true;
					break;

				case 'circle':
					cState.currentSymbol = this.sketchViewModel.polygonSymbol;
					cState.currentSymbolType = JimuSymbolType.Polygon;
					this.sketchViewModel.create("circle");
					cState.circleBtnActive = true;
					break;

				case 'text':
					cState.currentSymbol = this.sketchViewModel.pointSymbol;
					cState.currentSymbolType = JimuSymbolType.Point;
					this.sketchViewModel.create("point");
					cState.textBtnActive = true;
					break;

				default:
					// Exiting all drawing tools - cancel is already called above
					break;
			}
		} catch (error) {
			console.error('Error in setDrawToolBtnState:', error);
			// Reset state on error to prevent UI inconsistencies
			cState = {
				pointBtnActive: false,
				lineBtnActive: false,
				flineBtnActive: false,
				rectBtnActive: false,
				polygonBtnActive: false,
				fpolygonBtnActive: false,
				circleBtnActive: false,
				textBtnActive: false,
				currentTool: ''
			};
		}

		// Handle popup restoration for widgets not controlled by widget state
		if (this.state.currentJimuMapView) {
			const view = this.state.currentJimuMapView.view;
			const widgetState: WidgetState = this.props.state;
			const isWidgetControlled = widgetState !== undefined && widgetState !== null;

			if (!isWidgetControlled && view && this.originalPopupEnabled !== null) {
				// Restore popups when exiting drawing mode if not controlled by widget state
				if (wasInDrawingMode && !willBeInDrawingMode && !view.popupEnabled && this.originalPopupEnabled) {
					view.popupEnabled = this.originalPopupEnabled;
					//console.log('Restored popup state (uncontrolled widget, exiting drawing):', this.originalPopupEnabled);

					if (view.popup && "autoCloseEnabled" in view.popup) {
						view.popup.autoCloseEnabled = true;
					}

					// Restore highlight appearance
					view.highlightOptions = {
						color: [0, 255, 255, 1],
						fillOpacity: 0.0,
						haloOpacity: 0.8
					};

					// Restore layer-level highlight styling
					view.map.layers.forEach(layer => {
						view.whenLayerView(layer).then((layerView: __esri.LayerView) => {
							if (layer.type === "feature") {
								const featureLayerView = layerView as any;
								if ("highlightOptions" in featureLayerView) {
									featureLayerView.highlightOptions = {
										color: [0, 255, 255, 1],
										fillOpacity: 0.0,
										haloOpacity: 0.8
									};
								}
							}
						});
					});
				}
				// Disable popups when entering drawing mode
				else if (!wasInDrawingMode && willBeInDrawingMode && view.popupEnabled) {
					// Store original state if not already stored
					if (this.originalPopupEnabled === null) {
						this.originalPopupEnabled = view.popupEnabled;
						//console.log('Stored original popup state (uncontrolled widget):', this.originalPopupEnabled);
					}

					view.popupEnabled = false;
					//console.log('Disabled popups (uncontrolled widget, entering drawing mode)');

					if (view.popup && "autoCloseEnabled" in view.popup) {
						view.popup.autoCloseEnabled = false;
					}
					view.popup.visible = false;

					// Make highlights invisible
					view.highlightOptions = {
						color: [0, 0, 0, 0],
						fillOpacity: 0,
						haloOpacity: 0
					};
				}
			}
		}

		// Set preview states
		cState.showSymPreview = toolBtn !== 'text' && toolBtn !== '';
		cState.showTextPreview = toolBtn === 'text';

		// Apply state changes
		this.setState(cState as States);
	};

	handleSwitchToDrawings = () => {
		// Store measurement editing state before switching
		const wasMeasurementEditingEnabled = this.measureRef?.current?.isEditingMeasurements?.() || false;

		this.setDrawToolBtnState('');
		this.setState({ activeTab: 'mydrawings' }, () => {
			// Restore measurement editing state after tab switch if it was enabled
			if (wasMeasurementEditingEnabled) {
				setTimeout(() => {
					if (this.measureRef?.current) {
						// Re-enable measurement editing after tab switch
						this.measureRef.current.enableMeasurements();
					}
				}, 250);
			}
		});
	};

	handleSwitchFromDrawings = () => {
		// Store measurement editing state before switching
		const wasMeasurementEditingEnabled = this.measureRef?.current?.isEditingMeasurements?.() || false;

		this.setDrawToolBtnState('');
		this.setState({ activeTab: 'draw' }, () => {
			// Restore measurement editing state after tab switch if it was enabled
			if (wasMeasurementEditingEnabled) {
				setTimeout(() => {
					if (this.measureRef?.current) {
						// Re-enable measurement editing after tab switch
						this.measureRef.current.enableMeasurements();
					}
				}, 250);
			}
		});
	};

	showTextSymbolPopper = (evt) => {
		// Prevent event bubbling and default behavior
		if (evt) {
			evt.preventDefault();
			evt.stopPropagation();
		}

		this.updateActiveBtnIcons();

		// Workaround for InputUnit styling issue
		setTimeout(() => {
			let unitSelectors = document.getElementsByClassName('style-setting--unit-selector');
			Array.from(unitSelectors).forEach((ele: HTMLElement) => {
				(ele.firstChild as HTMLElement).style.padding = '0';
			});
		}, 200);

		// Toggle the text preview popper state
		this.setState({ textPreviewisOpen: !this.state.textPreviewisOpen });
	}

  updateSymbolOpacity = (value) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.color.a = value;
	this.setState({
	  fontOpacity: value,
	  currentTextSymbol: ts,
	  fontColor: this.convertSymbolColorToColorPickerValue(ts.color)
	}, ()=>{this.updateSelectedTextGras()});
  }

  onOpacityInputChanged = (e) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.color.a = e.distance/100;
	this.setState({
	  fontOpacity: e.distance/100,
	  currentTextSymbol: ts,
	  fontColor: this.convertSymbolColorToColorPickerValue(ts.color)
	}, ()=>{this.updateSelectedTextGras()});
  }

  updateSymbolHaloOpacity = (value) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.haloColor.a = value;
	this.setState({
	  fontHaloOpacity: value,
	  currentTextSymbol: ts,
	  fontHaloColor: this.convertSymbolColorToColorPickerValue(ts.haloColor),
	  fontHalo: this.state.fontHaloEnabled ?  this.state.fontHaloSize + "px " + this.convertSymbolColorToColorPickerValue(ts.haloColor) : 'unset'
	}, ()=>{this.updateSelectedTextGras()});
  }

  onHaloOpacityInputChanged = (e) => {
	let ts: TextSymbol = this.state.currentTextSymbol;
	ts.haloColor.a = e.distance/100;
	this.setState({
	  fontHaloOpacity: e.distance/100,
	  currentTextSymbol: ts,
	  fontHaloColor: this.convertSymbolColorToColorPickerValue(ts.haloColor),
	  fontHalo: this.state.fontHaloEnabled ?  this.state.fontHaloSize + "px " + this.convertSymbolColorToColorPickerValue(ts.haloColor) : 'unset'
	}, ()=>{this.updateSelectedTextGras()});
  }

  convertSymbolColorToColorPickerValue = (color:esriColor) => {
	if(color){
	  const rgbaClr = color.toRgba();
	  return`rgba(${rgbaClr[0]},${rgbaClr[1]},${rgbaClr[2]},${rgbaClr[3]})`
	}
	return null
  }

  onColorPickerToggle = (evt) => {
	  //workaround for color picker style issue
	setTimeout(() => {
	  let colorPicker = document.querySelectorAll('.color-picker-popper>.popper-box>.sketch-standard')[0] as HTMLElement;
	  colorPicker.style.backgroundColor = 'unset';
	}, 200);
  }

	handlePointRotation = (e) => {
		const symbol = this.state.currentSymbol.clone()
		symbol.angle = e.target? e.target.value : e
		this.onPointSymChanged(symbol)
	}

	handleFontFamily = (e) => {
		const newFont = e.target.value;
		const cTextSym: TextSymbol = this.state.currentTextSymbol.clone();
		cTextSym.font.family = newFont;

		// Update state and apply changes to any selected text graphics
		this.setState({
			currentTextSymbol: cTextSym
		}, () => {
			// Callback to ensure state is updated before applying to graphics
			this.updateSelectedTextGras();
		});
	}

	handleListMode = (e) => {
		const checked = e.target.checked
		if (checked) {
			this.drawLayer.listMode = 'show'
		} else {
			this.drawLayer.listMode = 'hide'
		}
		this.setState({ listMode : this.drawLayer.listMode })
	}

	handleTitleChange = (e) => {
		const title = e.target.value
		this.drawLayer.title = title
		this.setState({drawLayerTitle: title})
	}

	renderMyDrawingsTab() {
		return (
			<div className="my-drawings-tab-container p-3">
				{this.drawLayer && (
					<MyDrawingsPanel
						ref={this.myDrawingsRef}
						graphicsLayer={this.drawLayer}
						jimuMapView={this.state.currentJimuMapView}
						drawings={this.drawLayer.graphics.toArray()}
						allowLocalStorage={true}
						confirmOnDelete={true}
						onDrawingSelect={this.handleDrawingSelect}
						onDrawingsUpdate={this.handleDrawingsUpdate}
						showAlert={this.showAlert}
						isActiveTab={this.state.activeTab === 'mydrawings'}
						onClearSelectionOverlays={this.clearSelectionOverlaysInDrawLayer}
					/>
				)}
			</div>
		);
	}

	renderDrawPanel() {
		const { config } = this.props;
		const {
			showSymPreview, showTextPreview, drawGLLengthcheck, canRedo, canUndo,
			fontColor, fontSize, fontHaloEnabled, fontHaloColor, fontHaloSize, textSymPreviewText,
			currentSymbol, undoBtnActive, redoBtnActive, clearBtnActive, clearBtnTitle, pointBtnActive,
			lineBtnActive, flineBtnActive, rectBtnActive, polygonBtnActive, fpolygonBtnActive, circleBtnActive,
			textBtnActive, fontHalo, fontWeight, fontDecoration, fontStyle, fontRotation,
			vAlignBaseBtnActive, vAlignBotBtnActive, vAlignMidBtnActive, vAlignTopBtnActive,
			textPreviewHeight, hAlignLeftBtnActive, hAlignCenterBtnActive, hAlignRightBtnActive,
			fsBoldBtnActive, fsItalicBtnActive, fsUnderlineBtnActive, currentSymbolType, textPreviewisOpen,
			fontOpacity, fontHaloOpacity, textHasChanged
		} = this.state;

		const isDrawingActive = pointBtnActive || lineBtnActive || flineBtnActive ||
			rectBtnActive || polygonBtnActive || fpolygonBtnActive || circleBtnActive || textBtnActive;

		return (
			<div className="draw-panel-content">
				{/* Mode Message */}
				<div className="mode-message text-center mb-3">
					{!isDrawingActive ? (
						<div>
							{this.drawLayer?.graphics.length > 0 ? (
								<div>
									<h5>Edit Mode</h5>
									<h6>Select a Drawing Style to enter Drawing Mode.</h6>
								</div>
							) : (
								<div>
									<h5>No Drawings Yet</h5>
									<h6>Select a Drawing Style to get started.</h6>
								</div>
							)}
						</div>
					) : (
						<div>
							<h5>Drawing Mode</h5>
							<h6>Click the Active Drawing Style Button to Exit Drawing Mode and Activate Editing Mode.</h6>
						</div>
					)}
				</div>

				{/* Drawing Buttons */}
				<div className="drawing-tools-section mb-3">
					<div className="d-flex justify-content-center">
						<div className="drawToolbarDiv d-flex flex-column">
							<div className="buttonRow">
								<Button
									size="sm"
									type="default"
									color={pointBtnActive ? 'primary' : 'default'}
									active={pointBtnActive}
									onClick={() => this.setDrawToolBtnState('point')}
									title={this.nls('drawPoint')}
								>
									<Icon icon={pinIcon} />
								</Button>
								<Button
									size="sm"
									type="default"
									color={lineBtnActive ? 'primary' : 'default'}
									active={lineBtnActive}
									onClick={() => this.setDrawToolBtnState('polyline')}
									title={this.nls('drawLine')}
								>
									<Icon icon={lineIcon} />
								</Button>
								<Button
									size="sm"
									type="default"
									color={flineBtnActive ? 'primary' : 'default'}
									active={flineBtnActive}
									onClick={() => this.setDrawToolBtnState('freepolyline')}
									title={this.nls('drawFreeLine')}
								>
									<Icon icon={curveIcon} />
								</Button>
								<Button
									size="sm"
									type="default"
									color={textBtnActive ? 'primary' : 'default'}
									active={textBtnActive}
									onClick={() => this.setDrawToolBtnState('text')}
									title={this.nls('drawText')}
								>
									<Icon icon={textIcon} />
								</Button>
							</div>
							<div className="buttonRow">
								<Button
									size="sm"
									type="default"
									color={rectBtnActive ? 'primary' : 'default'}
									active={rectBtnActive}
									onClick={() => this.setDrawToolBtnState('extent')}
									title={this.nls('drawRectangle')}
								>
									<Icon icon={rectIcon} />
								</Button>
								<Button
									size="sm"
									type="default"
									color={polygonBtnActive ? 'primary' : 'default'}
									active={polygonBtnActive}
									onClick={() => this.setDrawToolBtnState('polygon')}
									title={this.nls('drawPolygon')}
								>
									<Icon icon={polyIcon} />
								</Button>
								<Button
									size="sm"
									type="default"
									color={fpolygonBtnActive ? 'primary' : 'default'}
									active={fpolygonBtnActive}
									onClick={() => this.setDrawToolBtnState('freepolygon')}
									title={this.nls('drawFreePolygon')}
								>
									<Icon icon={freePolyIcon} />
								</Button>
								<Button
									size="sm"
									type="default"
									color={circleBtnActive ? 'primary' : 'default'}
									active={circleBtnActive}
									onClick={() => this.setDrawToolBtnState('circle')}
									title={this.nls('drawCircle')}
								>
									<Icon icon={circleIcon} />
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Symbol Settings */}
				{showSymPreview && this.sketchViewModel && this.renderSymbolSelectorSection()}

				{/* Text Symbol Settings */}
				{showTextPreview && this.renderTextSymbolPreviewButton()}

				{/* Text Popper - This stays outside the scroll area for proper positioning */}
				{textPreviewisOpen && this.renderTextPopper()}

				{/* === MAIN CHECKBOX STACK: 20px between Measure / Snapping / Buffer === */}
				<div className="main-checkbox-stack">
					{/* Measurements */}
						<Measure
							key={`measure-${this.state.activeTab}`}  // 🔧 Forces remount when tab changes
							ref={this.measureRef}
							nls={this.nls}
							config={config}
							drawLayer={this.drawLayer}
							currentTextSymbol={this.state.currentTextSymbol}
							sketchViewModel={this.sketchViewModel}
							currentTool={this.state.currentTool}
							showTextPreview={this.state.showTextPreview}
							currentSymbol={this.state.currentSymbol}
							isDrawingActive={isDrawingActive}
						/>

					{/* Snapping Controls */}
						<SnappingControls
							jimuMapView={this.state.currentJimuMapView}
							sketchViewModel={this.sketchViewModel}
						/>

					{/* Buffer Controls - Hidden for text tool */}
					{!textBtnActive && (
							<BufferControls
								sketchViewModel={this.sketchViewModel}
								jimuMapView={this.state.currentJimuMapView}
							/>
					)}
				</div>
				<div className='d-flex flex-column justify-content-between' style={{height: '150px'}}>
					{/* Bottom Toolbar */}
					<div className="drawToolbarBottomDiv">
					
						{(canUndo || canRedo) && (
							<div className="d-flex gap-2">
								<Button
									size="sm"
									type="secondary"
									active={undoBtnActive}
									onClick={this.drawUndoBtnClick}
									title={this.nls('drawUndo')}
									disabled={!canUndo}
								>
									<ArrowUndoOutlined /> Undo
								</Button>
								<Button
									size="sm"
									type="secondary"
									active={redoBtnActive}
									onClick={this.drawRedoBtnClick}
									title={this.nls('drawRedo')}
									disabled={!canRedo}
								>
									<ArrowRedoOutlined /> Redo
								</Button>
							</div>
						)}

						{/* Clear Button Logic */}
						{this.state.clearBtnTitle === this.nls('drawClear') ? (
							this.state.confirmDelete ? (
								<div className="d-flex gap-2">
									<Button
										size="sm"
										type="danger"
										active={clearBtnActive}
										onClick={this.drawClearBtnClick}
										title={clearBtnTitle}
									>
										<TrashOutlined /> {clearBtnTitle}
									</Button>
									<Button
										size="sm"
										type="secondary"
										active={clearBtnActive}
										onClick={() => this.setState({ confirmDelete: false })}
										title="Cancel"
									>
										<WrongOutlined /> Cancel
									</Button>
								</div>
							) : (
								<Button
									size="sm"
									type="secondary"
									active={clearBtnActive}
									onClick={() => this.setState({ confirmDelete: true })}
									title={clearBtnTitle}
									disabled={!drawGLLengthcheck}
								>
									<TrashOutlined /> {clearBtnTitle}
								</Button>
							)
						) : (
							<Button
								size="sm"
								type="danger"
								active={clearBtnActive}
								onClick={this.drawClearBtnClick}
								title={clearBtnTitle}
							>
								<TrashOutlined /> {clearBtnTitle}
							</Button>
						)}
					</div>
					{/* Draw Layer Settings */}
					{(this.props.config.changeListMode || this.props.config.changeTitle) && (
						<div className="drawToolbarDiv">
							<CollapsablePanel label="Draw Layer Settings" leftIcon={SettingOutlined}>
								<div>
									<Label className="w-100">
										Draw Layer Title:
										<TextInput
											defaultValue={this.props.config.title}
											onChange={(e) => this.handleTitleChange(e)}
											type="text"
											allowClear
											required
										/>
									</Label>
									<Label centric>
										<Checkbox
											checked={this.state.listMode === 'show'}
											onClick={(e) => this.handleListMode(e)}
											className="mr-2 mt-2 mb-2 ml-4"
										/>
										Show In Map Layer List
									</Label>
								</div>
							</CollapsablePanel>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Add the missing renderTextPopper method
	private renderTextPopper() {
		// Convert backgroundColor to string for style prop
		const backgroundColorString = this.state.fontBackgroundColor
			? (typeof this.state.fontBackgroundColor === 'string'
				? this.state.fontBackgroundColor
				: `rgba(${this.state.fontBackgroundColor.r}, ${this.state.fontBackgroundColor.g}, ${this.state.fontBackgroundColor.b}, ${this.state.fontBackgroundColor.a})`)
			: 'transparent';

		return (
			<Popper
				open={this.state.textPreviewisOpen}
				reference={this.props.widgetId + '_btnTextSymbol'}
				placement={'bottom'}
				showArrow={true}
				zIndex={1002}
				toggle={this.showTextSymbolPopper}
			>
				<div className='p-3 d-flex'>
					<div>
						<div className="w-100 d-flex mt-2 mb-3">
							<div className="justify-content-start d-flex align-items-center mr-4 pl-2">{this.nls('preview')}</div>
							<div className="justify-content-center d-flex mt-1 mb-1 ml-3" style={{
								height: `${this.state.textPreviewHeight}px`,
								maxHeight: '220px',
								backgroundColor: backgroundColorString
							}}>
								<div>
									<div className="w-100 h-100 justify-content-center d-flex align-items-center symbol-item text-symbol-item">
										<span className='text-symbol-span' style={{
											color: `${this.state.fontColor}`,
											fontSize: `${this.state.fontSize}px`,
											fontWeight: this.state.fontWeight === 'normal' ? 'normal' : 'bold',
											fontStyle: this.state.fontStyle,
											fontFamily: this.state.currentTextSymbol.font.family,
											textDecoration: this.state.fontDecoration,
											zIndex: 100,
											WebkitTransform: `rotate(${this.state.fontRotation}deg)`,
											MozTransition: `rotate(${this.state.fontRotation}deg)`,
											filter: `progid:DXImageTransform.Microsoft.BasicImage(rotation=${this.state.fontRotation})`
										}}>
											{this.state.textSymPreviewText}
										</span>
										<span style={{
											color: `${this.state.fontColor}`,
											fontSize: `${this.state.fontSize}px`,
											WebkitTextStroke: `${this.state.fontHalo}`,
											fontWeight: this.state.fontWeight === 'normal' ? 'normal' : 'bold',
											fontStyle: this.state.fontStyle,
											fontFamily: this.state.currentTextSymbol.font.family,
											textDecoration: this.state.fontDecoration,
											position: 'absolute',
											WebkitTransform: `rotate(${this.state.fontRotation}deg)`,
											MozTransition: `rotate(${this.state.fontRotation}deg)`,
											filter: `progid:DXImageTransform.Microsoft.BasicImage(rotation=${this.state.fontRotation})`
										}}>
											{this.state.textSymPreviewText}
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="w-100">
							<div className='w-100 d-flex justify-content-between align-items-center pb-2'>
								<TextInput
									className='w-100'
									size='sm'
									title={this.nls('drawText')}
									onChange={e => this.TextOnChange(e)}
									placeholder='Your Text Here'
									value={this.state.textHasChanged ? this.state.textSymPreviewText : ''}
									style={{ fontFamily: this.state.currentTextSymbol.font.family }}
								/>
							</div>
						</div>
						<div className='w-100 d-flex'>
							Font:
							<Select
								size='sm'
								onChange={(e) => this.handleFontFamily(e)}
								className='ml-2'
								value={this.state.currentTextSymbol.font.family}
							>
								<Option value='Alegreya' style={{ fontFamily: 'Alegreya' }}>Alegreya</Option>
								<Option value='Arial' style={{ fontFamily: 'Arial' }}>Arial</Option>
								<Option value='Avenir Next LT Pro' style={{ fontFamily: 'Avenir Next LT Pro' }}>Avenir Next</Option>
								<Option value='Josefin Slab' style={{ fontFamily: 'Josefin Slab' }}>Josefin Slab</Option>
								<Option value='Merriweather' style={{ fontFamily: 'Merriweather' }}>Merriweather</Option>
								<Option value='Montserrat' style={{ fontFamily: 'Montserrat' }}>Montserrat</Option>
								<Option value='Noto Sans' style={{ fontFamily: 'Noto Sans' }}>Noto Sans</Option>
								<Option value='Noto Serif' style={{ fontFamily: 'Noto Serif' }}>Noto Serif</Option>
								<Option value='Playfair Display' style={{ fontFamily: 'Playfair Display' }}>Playfair Display</Option>
								<Option value='Roboto' style={{ fontFamily: 'Roboto' }}>Roboto</Option>
								<Option value='Ubuntu' style={{ fontFamily: 'Ubuntu' }}>Ubuntu</Option>
							</Select>
						</div>
						<div className="w-100">
							<div className='w-100 d-flex justify-content-between align-items-center mb-2'>
								<ColorPicker
									className="fontcolorpicker"
									title={this.nls('fontColor')}
									style={{ padding: '0' }}
									width={26}
									height={26}
									color={this.state.fontColor ? this.state.fontColor : 'rgba(0,0,0,1)'}
									onChange={this.updateTextColor}
									onClick={e => { this.onColorPickerToggle(e) }}
								/>
								<NumericInput
									size='sm'
									onChange={this.fontSizeOnChange}
									value={this.state.fontSize}
									className="fontsizeinput"
									style={{ width: '5rem' }}
									showHandlers={true}
									min={1}
									max={120}
								/>
								<div style={{ borderRight: '1px solid rgb(182, 182, 182)', height: '26px' }} />
								<AdvancedButtonGroup>
									<Button
										icon={true}
										size='sm'
										active={this.state.fsBoldBtnActive}
										onClick={(evt) => { this.onFontStyleChange(evt, 'bold') }}
										title={this.nls('fontBold')}
									>
										<Icon icon={fsBoldIcon} size={'m'} />
									</Button>
									<Button
										icon={true}
										size='sm'
										active={this.state.fsItalicBtnActive}
										onClick={(evt) => { this.onFontStyleChange(evt, 'italic') }}
										title={this.nls('fontItalic')}
									>
										<Icon icon={fItalicIcon} size={'m'} />
									</Button>
									<Button
										icon={true}
										size='sm'
										active={this.state.fsUnderlineBtnActive}
										onClick={(evt) => { this.onFontStyleChange(evt, 'underline') }}
										title={this.nls('fontUnderline')}
									>
										<Icon icon={fUnderlineIcon} width={12} />
									</Button>
								</AdvancedButtonGroup>
							</div>
						</div>
						<Label>
							Opacity:
							<div className='w-100 d-flex justify-content-between align-items-center mb-2 border'>
								<Slider
									size='default'
									value={this.state.fontOpacity}
									min={0}
									max={1}
									step={0.1}
									hideThumb={false}
									className='mr-2'
									style={{ width: 'calc(100% - 80px)' }}
									title={`${this.props.intl.formatMessage({
										id: 'drawToolOpacity',
										defaultMessage: defaultMessages.drawToolOpacity
									})}: ${100 * this.state.fontOpacity}%`}
									onChange={(e) => this.updateSymbolOpacity(e.currentTarget.value)}
								/>
								<InputUnit
									value={`${100 * this.state.fontOpacity}%`}
									className='input-unit'
									onChange={(e) => this.onOpacityInputChanged(e)}
									style={{ width: '70px' }}
								/>
							</div>
						</Label>
						<div className="w-100">
							<div className='w-100 d-flex justify-content-around align-items-center mb-2'>
								<span>Text Rotation:</span>
								<NumericInput
									size='sm'
									onChange={this.fontRotationChange}
									value={this.state.fontRotation}
									className="fontrotationinput"
									style={{ width: '80px' }}
									showHandlers={true}
									min={-360}
									max={360}
								/>
							</div>
						</div>
						<div className="w-100">
							<div className='w-100 d-flex justify-content-between align-items-center mb-2'>
								<AdvancedButtonGroup>
									<Button
										icon={true}
										size='sm'
										active={this.state.hAlignLeftBtnActive}
										onClick={(evt) => { this.onHorizFontAlignChange(evt, 'left') }}
										title={this.nls('fontHAleft')}
									>
										<Icon icon={hAlignLeft} size={'m'} />
									</Button>
									<Button
										icon={true}
										size='sm'
										active={this.state.hAlignCenterBtnActive}
										onClick={(evt) => { this.onHorizFontAlignChange(evt, 'center') }}
										title={this.nls('fontHAcenter')}
									>
										<Icon icon={hAlignCenter} size={'m'} />
									</Button>
									<Button
										icon={true}
										size='sm'
										active={this.state.hAlignRightBtnActive}
										onClick={(evt) => { this.onHorizFontAlignChange(evt, 'right') }}
										title={this.nls('fontHAright')}
									>
										<Icon icon={hAlignRight} size={'m'} />
									</Button>
								</AdvancedButtonGroup>
								<div style={{ borderRight: '1px solid rgb(182, 182, 182)', height: '26px' }} />
								<AdvancedButtonGroup>
									<Button
										icon={true}
										size='sm'
										active={this.state.vAlignBaseBtnActive}
										onClick={(evt) => { this.onVertFontAlignChange(evt, 'baseline') }}
										title={this.nls('fontVAbase')}
									>
										<Icon icon={vAlignBase} currentColor={true} />
									</Button>
									<Button
										icon={true}
										size='sm'
										active={this.state.vAlignTopBtnActive}
										onClick={(evt) => { this.onVertFontAlignChange(evt, 'top') }}
										title={this.nls('fontVAtop')}
									>
										<Icon icon={vAlignTop} />
									</Button>
									<Button
										icon={true}
										size='sm'
										active={this.state.vAlignMidBtnActive}
										onClick={(evt) => { this.onVertFontAlignChange(evt, 'middle') }}
										title={this.nls('fontVAmid')}
									>
										<Icon icon={vAlignMid} />
									</Button>
									<Button
										icon={true}
										size='sm'
										active={this.state.vAlignBotBtnActive}
										onClick={(evt) => { this.onVertFontAlignChange(evt, 'bottom') }}
										title={this.nls('fontVAbottom')}
									>
										<Icon icon={vAlignBot} />
									</Button>
								</AdvancedButtonGroup>
							</div>
						</div>
						<Label centric>
							Background Color:
							<ColorPicker
								className='mr-4 ml-2'
								style={{ padding: '0' }}
								width={26}
								height={26}
								type='icon-only'
								icon={this.state.fontBackgroundColor === 'rgba(0,0,0,0)' ?
									<CloseOutlined title='No Background Color' /> :
									<div title='Background Color' style={{ backgroundColor: backgroundColorString, height: '100%', width: '100%' }} />
								}
								color={this.state.fontBackgroundColor ? backgroundColorString : "#000000"}
								onClick={e => { this.onColorPickerToggle(e) }}
								onChange={this.updateBackgroundColor}
							/>
						</Label>
					</div>
					<div className='ml-2'>
						<div className='border p-2 mb-2'>
							<h6>Text Halo Options</h6>
							<div className="w-100">
								<div className='w-100 d-flex justify-content-between align-items-center mb-2'>
									<Label centric>
										{this.state.fontHaloEnabled ? 'Disable' : 'Enable'}
										<Switch
											title={this.nls('enableFontHalo')}
											className="mr-4 ml-2"
											onChange={this.fontHaloChkChange}
											checked={this.state.fontHaloEnabled}
										/>
									</Label>
									<ColorPicker
										className='mr-4 fonthalocolorpicker'
										style={{ padding: '0' }}
										width={26}
										height={26}
										color={this.state.fontHaloColor ? this.state.fontHaloColor : '#000000'}
										onClick={e => { this.onColorPickerToggle(e) }}
										onChange={this.updateFontHaloColor}
										disabled={!this.state.fontHaloEnabled}
									/>
									<NumericInput
										size='sm'
										onChange={e => this.fontHaloSizeChange(e)}
										value={this.state.fontHaloSize}
										disabled={!this.state.fontHaloEnabled}
										className="fonthalosizeinput"
										style={{ width: '80px' }}
										showHandlers={true}
										min={1}
										max={20}
									/>
								</div>
							</div>
							<Label>
								Opacity:
								<div className='w-100 d-flex justify-content-between align-items-center mb-2 border'>
									<Slider
										size='default'
										value={this.state.fontHaloOpacity}
										min={0}
										max={1}
										step={0.1}
										hideThumb={false}
										className='mr-2'
										style={{ width: 'calc(100% - 80px)' }}
										title={`${this.nls('fontHalo')} ${this.props.intl.formatMessage({
											id: 'drawToolOpacity',
											defaultMessage: defaultMessages.drawToolOpacity
										})}: ${100 * this.state.fontHaloOpacity}%`}
										onChange={(e) => {
											if (this.state.fontHaloEnabled) {
												this.updateSymbolHaloOpacity(e.currentTarget.value);
											}
										}}
									/>
									<InputUnit
										value={`${100 * this.state.fontHaloOpacity}%`}
										className='input-unit'
										onChange={(e) => this.onHaloOpacityInputChanged(e)}
										style={{ width: '70px' }}
										disabled={!this.state.fontHaloEnabled}
									/>
								</div>
							</Label>
						</div>
					</div>
				</div>
			</Popper>
		);
	}

	render() {
		const { config } = this.props;
		const {
			fontColor, fontSize, fontHalo, fontRotation, fontWeight, fontStyle, fontDecoration,
			fontHaloColor, fontHaloEnabled, fontHaloSize, textSymPreviewText, textPreviewHeight,
			currentSymbol, currentSymbolType, fontOpacity, fontHaloOpacity, textHasChanged,
			undoBtnActive, redoBtnActive, clearBtnActive, clearBtnTitle, canUndo, canRedo,
			showSymPreview, showTextPreview, textPreviewisOpen, drawGLLengthcheck, rotationMode,
			pointBtnActive, lineBtnActive, flineBtnActive, rectBtnActive, polygonBtnActive,
			fpolygonBtnActive, circleBtnActive, textBtnActive, vAlignBaseBtnActive, vAlignTopBtnActive,
			vAlignMidBtnActive, vAlignBotBtnActive, hAlignLeftBtnActive, hAlignCenterBtnActive,
			hAlignRightBtnActive, fsBoldBtnActive, fsItalicBtnActive, fsUnderlineBtnActive,
			activeTab,
			measurementCheckboxOn
		} = this.state as any;

		return (
			<div className="widget-draw jimu-widget" css={getStyle(this.props.theme, config)}>
				{/* Attach to Map View */}
				{this.props.useMapWidgetIds && this.props.useMapWidgetIds.length === 1 && (
					<JimuMapViewComponent
						useMapWidgetId={this.props.useMapWidgetIds[0]}
						onActiveViewChange={this.activeViewChangeHandler}
					/>
				)}

				{/* Fixed Tab Header */}
				<div className="tab-header">
					<div
						className={`tab-button ${activeTab === 'draw' ? 'active' : ''}`}
						onClick={() => this.handleTabChange('draw')}
					>
						Draw
					</div>
					<div
						className={`tab-button ${activeTab === 'mydrawings' ? 'active' : ''}`}
						onClick={() => this.handleTabChange('mydrawings')}
					>
						My Drawings
					</div>
				</div>

				{/* Scrollable Tab Content */}
				<div className="tab-content">
					{activeTab === 'draw' && (
						<div className="draw-tab-content" key="draw-tab">
							{/* Your existing Draw panel UI */}
							{this.renderDrawPanel()}
						</div>
					)}

					{activeTab === 'mydrawings' && this.renderMyDrawingsTab()}
				</div>
			</div>
		);
	}
}
