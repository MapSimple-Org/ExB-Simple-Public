import React from 'react';
import {
    Button,
    TextInput,
    NumericInput,
    Label,
    AdvancedButtonGroup,
    Select,
    Option,
    Icon
} from 'jimu-ui';
import { ColorPicker } from 'jimu-ui/basic/color-picker';
import TextSymbol from 'esri/symbols/TextSymbol';
import Font from 'esri/symbols/Font';
import Color from 'esri/Color';

import fsBoldIcon from '../assets/bold.svg';
import fItalicIcon from '../assets/italic.svg';
import fUnderlineIcon from '../assets/underline.svg';
import hAlignLeft from 'jimu-icons/svg/outlined/editor/text-left.svg';
import hAlignCenter from 'jimu-icons/svg/outlined/editor/text-center.svg';
import hAlignRight from 'jimu-icons/svg/outlined/editor/text-right.svg';
import vAlignTop from '../assets/text-align-v-t.svg';
import vAlignMid from '../assets/text-align-v-m.svg';
import vAlignBot from '../assets/text-align-v-b.svg';
import vAlignBase from '../assets/text-align-v-base.svg';

interface Props {
    currentTextSymbol: TextSymbol;
    updateSymbol: (updated: TextSymbol) => void;
    show: boolean;
    onClose: () => void;
    graphic?: any; // Optional graphic reference that contains this text
}

/**
 * TextStyleEditor component with specialized handling to:
 * 1. Directly update only the properties that change
 * 2. Properly inherit text content from the map
 * 3. Allow spaces in the Label Text field
 * 4. Preserve all styling properties between editing sessions
 */
export const TextStyleEditor: React.FC<Props> = ({ currentTextSymbol, updateSymbol, show, onClose, graphic }) => {
    // Add a ref to store the original display text from the map
    const originalDisplayTextRef = React.useRef<string>('');

    // Direct reference to the current symbol (no cloning)
    const [symbol, setSymbol] = React.useState<TextSymbol | null>(null);

    // Track if any changes were made
    const [hasChanges, setHasChanges] = React.useState(false);

    // UI state - separate from the actual symbol properties
    const [text, setText] = React.useState<string>('');
    const [fontSize, setFontSize] = React.useState<number>(12);
    const [fontColor, setFontColor] = React.useState<string>('#000000');
    const [fontFamily, setFontFamily] = React.useState<string>('Arial');
    const [fontWeight, setFontWeight] = React.useState<string>('normal');
    const [fontStyle, setFontStyle] = React.useState<string>('normal');
    const [fontDecoration, setFontDecoration] = React.useState<string>('none');
    const [fontRotation, setFontRotation] = React.useState<number>(0);
    const [horizontalAlignment, setHorizontalAlignment] = React.useState<'left' | 'center' | 'right'>('center');
    const [verticalAlignment, setVerticalAlignment] = React.useState<'top' | 'middle' | 'bottom' | 'baseline'>('middle');

    // Enhanced DOM text search function with listener capability
    const findTextInDOM = (): string | null => {
        if (typeof document === 'undefined') return null;

        try {
            // Setup MutationObserver to watch for DOM changes that might indicate text updates
            // This helps detect changes even after initial loading
            if (!(window as any)._textChangeObserver) {
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        if (mutation.type === 'childList' || mutation.type === 'characterData') {
                            const target = mutation.target as HTMLElement;

                            // Check if this is related to text graphics
                            if (target.classList &&
                                (target.classList.contains('esri-text-symbol') ||
                                    target.tagName.toLowerCase() === 'text' ||
                                    target.tagName.toLowerCase() === 'tspan')) {

                                const text = target.textContent;
                                if (text &&
                                    text.trim() !== '' &&
                                    text.trim().toLowerCase() !== 'text') {

                                    // Store the observed text for later use
                                    (window as any)._lastTextChangeValue = text.trim();
                                }
                            }
                        }
                    }
                });

                // Observe the entire document for text changes
                observer.observe(document.body, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });

                (window as any)._textChangeObserver = observer;
            }

            // First check if we have a recently observed text change
            if ((window as any)._lastTextChangeValue &&
                (window as any)._lastTextChangeValue.trim() !== '' &&
                (window as any)._lastTextChangeValue.trim().toLowerCase() !== 'text') {
                return (window as any)._lastTextChangeValue;
            }

            // Then check for any "selected" or "active" text on the map

            // ESRI specific selections - look for visual selection indicators
            const selectionHandles = document.querySelectorAll(
                '.esri-view .esri-feature-table__selection-indicator, ' +
                '.esri-view .esri-feature__selection-indicator, ' +
                '.esri-view .esri-selection-handle, ' +
                '.esri-view .esri-editor__selection-handle, ' +
                '.esri-view .esri-view-surface-selection, ' +
                '.esri-view [class*="selection"], ' +
                '.esri-view [class*="selected"]'
            );

            if (selectionHandles.length > 0) {
                // If we find selection handles, look for the closest text element
                for (let i = 0; i < selectionHandles.length; i++) {
                    const handle = selectionHandles[i];
                    // Check if the handle itself contains text
                    if (handle.textContent &&
                        handle.textContent.trim() !== '' &&
                        handle.textContent.trim().toLowerCase() !== 'text') {
                        return handle.textContent.trim();
                    }

                    // Look for nearby text elements (siblings or parents)
                    let currentNode: Node | null = handle;
                    while (currentNode && currentNode.parentNode) {
                        // Check siblings
                        const siblings = Array.from(currentNode.parentNode.childNodes);
                        for (const sibling of siblings) {
                            if (sibling !== currentNode &&
                                sibling.textContent &&
                                sibling.textContent.trim() !== '' &&
                                sibling.textContent.trim().toLowerCase() !== 'text') {
                                return sibling.textContent.trim();
                            }
                        }
                        // Move up to parent
                        currentNode = currentNode.parentNode;

                        // If parent has text content, use it
                        if (currentNode.textContent &&
                            currentNode.textContent.trim() !== '' &&
                            currentNode.textContent.trim().toLowerCase() !== 'text') {
                            // Check if parent is a text element itself
                            if (currentNode.nodeName === 'text' ||
                                currentNode.nodeName === 'tspan' ||
                                (currentNode as Element).classList?.contains('esri-text-symbol')) {
                                return currentNode.textContent.trim();
                            }
                        }
                    }
                }
            }

            // Check if there's a cursor/caret on the map (usually indicates text editing)
            const cursorElements = document.querySelectorAll(
                '.esri-view .esri-text-editing-cursor, ' +
                '.esri-view .esri-caret, ' +
                '.esri-view [class*="cursor"], ' +
                '.esri-view [class*="caret"]'
            );

            if (cursorElements.length > 0) {
                for (const cursor of cursorElements) {
                    // Check for parent text element
                    let parent = cursor.parentElement;
                    while (parent) {
                        if (parent.nodeName === 'text' ||
                            parent.nodeName === 'tspan' ||
                            parent.classList?.contains('esri-text-symbol')) {

                            if (parent.textContent &&
                                parent.textContent.trim() !== '' &&
                                parent.textContent.trim().toLowerCase() !== 'text') {
                                return parent.textContent.trim();
                            }
                        }
                        parent = parent.parentElement;
                    }
                }
            }

            // Directly look for SVG text elements
            // Start with any that might have been recently added or modified
            const allTextElements = Array.from(document.querySelectorAll('.esri-view svg text, .esri-view svg tspan'));

            // Sort by any timestamp or data attribute that might indicate recency
            const sortedElements = allTextElements.sort((a, b) => {
                const aTime = parseInt(a.getAttribute('data-timestamp') || '0', 10);
                const bTime = parseInt(b.getAttribute('data-timestamp') || '0', 10);
                return bTime - aTime; // Most recent first
            });

            // Process sorted elements (most recent first)
            for (const elem of sortedElements) {
                const textContent = elem.textContent;

                // Skip empty or default text
                if (!textContent ||
                    textContent.trim() === '' ||
                    textContent.trim().toLowerCase() === 'text' ||
                    textContent.includes('NaN')) {
                    continue;
                }

                // Skip if element or parent has a system class (like esri-basemap-layer)
                let parent = elem.parentElement;
                let isSystemLabel = false;

                while (parent && parent.classList) {
                    if (parent.classList.contains('esri-basemap-layer') ||
                        parent.classList.contains('esri-legend') ||
                        parent.classList.contains('esri-attribution') ||
                        parent.classList.contains('esri-scale-bar') ||
                        parent.classList.contains('esri-ui') ||
                        parent.classList.contains('esri-widget')) {
                        isSystemLabel = true;
                        break;
                    }
                    parent = parent.parentElement;
                }

                if (!isSystemLabel) {
                    return textContent.trim();
                }
            }

            // Check for ESRI text symbols specifically
            const textSymbols = document.querySelectorAll(
                '.esri-view .esri-text-symbol, ' +
                '.esri-view .esri-text-graphic, ' +
                '.esri-view .esri-graphic-text'
            );

            for (const symbol of textSymbols) {
                if (symbol.textContent &&
                    symbol.textContent.trim() !== '' &&
                    symbol.textContent.trim().toLowerCase() !== 'text') {
                    return symbol.textContent.trim();
                }
            }

            // Check for recent input in text fields
            // This might catch text that was entered but not yet applied to the map
            const textInputs = document.querySelectorAll('input[type="text"], textarea');
            for (const input of textInputs) {
                const inputElem = input as HTMLInputElement;
                if (inputElem.value &&
                    inputElem.value.trim() !== '' &&
                    inputElem.value.trim().toLowerCase() !== 'text') {

                    // Check if this is likely related to map text
                    const isTextLabel = inputElem.id?.toLowerCase().includes('text') ||
                        inputElem.name?.toLowerCase().includes('text') ||
                        inputElem.className.toLowerCase().includes('text') ||
                        inputElem.placeholder?.toLowerCase().includes('text') ||
                        inputElem.closest('[class*="text-editor"]') ||
                        inputElem.closest('[class*="label-editor"]');

                    if (isTextLabel) {
                        return inputElem.value.trim();
                    }
                }
            }

            // Look for any popup content that might contain text
            const popupContents = document.querySelectorAll('.esri-popup__content');
            for (const popup of popupContents) {
                if (popup.textContent &&
                    popup.textContent.trim() !== '' &&
                    popup.textContent.trim().toLowerCase() !== 'text') {
                    return popup.textContent.trim();
                }
            }
        } catch (error) {
            // Error handling without logging
        }

        return null;
    };

    // Add helper function to find text in object with advanced type handling
    const findTextInObject = (obj: any, path = ''): { text: string, path: string } | null => {
        if (!obj) return null;

        // Skip null and undefined
        if (obj === null || obj === undefined) return null;

        // First check if this is a TextSymbol with a text property
        if (obj.declaredClass === 'esri.symbols.TextSymbol' && obj.text) {
            // Skip default values
            if (obj.text.trim().toLowerCase() !== 'text' && obj.text.trim() !== '') {
                return { text: obj.text, path: `${path}.text` };
            }
        }

        // Check for common text properties on the object
        const textProps = [
            'text', 'label', 'value', 'displayValue', 'displayText', 'textString',
            'content', 'description', 'name', 'title', 'innerHTML', 'textContent',
            'innerText', 'labelText', 'caption', 'heading'
        ];

        for (const prop of textProps) {
            if (obj[prop] !== undefined && obj[prop] !== null) {
                // Convert to string if needed
                const propValue = typeof obj[prop] === 'string' ?
                    obj[prop] : String(obj[prop]);

                // Skip default values
                if (propValue.trim().toLowerCase() !== 'text' && propValue.trim() !== '') {
                    return { text: propValue, path: `${path}.${prop}` };
                }
            }
        }

        // Check graphics properties
        if (obj.graphic && typeof obj.graphic === 'object') {
            const graphicResult = findTextInObject(obj.graphic, `${path}.graphic`);
            if (graphicResult) return graphicResult;
        }

        // Check attributes
        if (obj.attributes && typeof obj.attributes === 'object') {
            // First check for common text attribute names
            const textAttrs = [
                'name', 'label', 'text', 'description', 'title', 'displayName', 'display',
                'caption', 'value', 'content', 'textString', 'NAME', 'LABEL', 'TEXT',
                'DESCRIPTION', 'TITLE', 'DISPLAY_NAME', 'DISPLAY'
            ];

            for (const attr of textAttrs) {
                if (obj.attributes[attr] !== undefined && obj.attributes[attr] !== null) {
                    // Convert to string if needed
                    const attrValue = typeof obj.attributes[attr] === 'string' ?
                        obj.attributes[attr] : String(obj.attributes[attr]);

                    // Skip default or empty values
                    if (attrValue.trim().toLowerCase() !== 'text' && attrValue.trim() !== '') {
                        return { text: attrValue, path: `${path}.attributes.${attr}` };
                    }
                }
            }

            // Then check all attributes for anything text-like
            for (const key in obj.attributes) {
                if (obj.attributes[key] !== undefined && obj.attributes[key] !== null) {
                    if (typeof obj.attributes[key] === 'string' ||
                        typeof obj.attributes[key] === 'number') {

                        const attrValue = String(obj.attributes[key]);

                        // Skip default or empty values
                        if (attrValue.trim().toLowerCase() !== 'text' &&
                            attrValue.trim() !== '') {
                            return { text: attrValue, path: `${path}.attributes.${key}` };
                        }
                    }
                }
            }
        }

        // Check symbol
        if (obj.symbol && typeof obj.symbol === 'object') {
            const symbolResult = findTextInObject(obj.symbol, `${path}.symbol`);
            if (symbolResult) return symbolResult;
        }

        // Check properties that could contain text content
        // These might be DOM-like properties or custom properties
        if (obj.textContent && typeof obj.textContent === 'string' &&
            obj.textContent.trim() !== '' &&
            obj.textContent.trim().toLowerCase() !== 'text') {
            return { text: obj.textContent, path: `${path}.textContent` };
        }

        if (obj.innerText && typeof obj.innerText === 'string' &&
            obj.innerText.trim() !== '' &&
            obj.innerText.trim().toLowerCase() !== 'text') {
            return { text: obj.innerText, path: `${path}.innerText` };
        }

        if (obj.innerHTML && typeof obj.innerHTML === 'string' &&
            obj.innerHTML.trim() !== '' &&
            obj.innerHTML.trim().toLowerCase() !== 'text') {
            // Strip any HTML tags for cleaner text
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = obj.innerHTML;
            const textOnly = tempDiv.textContent || tempDiv.innerText || '';

            if (textOnly.trim() !== '' && textOnly.trim().toLowerCase() !== 'text') {
                return { text: textOnly, path: `${path}.innerHTML` };
            }
        }

        // Check properties that start with underscore (ESRI often uses these)
        for (const key in obj) {
            // Skip non-enumerable properties and functions
            if (!Object.prototype.propertyIsEnumerable.call(obj, key) ||
                typeof obj[key] === 'function') continue;

            // Check string properties that start with underscore
            if (key.startsWith('_') &&
                (typeof obj[key] === 'string' || typeof obj[key] === 'number')) {

                const keyValue = String(obj[key]);

                // Skip default or empty values
                if (keyValue.trim().toLowerCase() !== 'text' &&
                    keyValue.trim() !== '') {
                    return { text: keyValue, path: `${path}.${key}` };
                }
            }

            // Recursively check objects with underscore prefix that might contain text
            if (key.startsWith('_') &&
                typeof obj[key] === 'object' &&
                obj[key] !== null &&
                !Array.isArray(obj[key])) {
                const result = findTextInObject(obj[key], `${path}.${key}`);
                if (result) return result;
            }
        }

        // Look for properties that might contain text items inside collections
        const collectionProps = ['items', 'graphics', 'features', 'elements', '_items', '_graphics'];

        for (const prop of collectionProps) {
            if (obj[prop] && Array.isArray(obj[prop]) && obj[prop].length > 0) {
                // Process in reverse order (latest items first)
                for (let i = obj[prop].length - 1; i >= 0; i--) {
                    const item = obj[prop][i];
                    if (item) {
                        const itemResult = findTextInObject(item, `${path}.${prop}[${i}]`);
                        if (itemResult) return itemResult;
                    }
                }
            }
        }

        return null;
    };

    // Add a more exhaustive approach to check for text in ArcGIS/ESRI data structures
    const findTextInEsriObjects = (): string | null => {
        if (typeof window === 'undefined') return null;

        try {
            // Check for all possible ESRI-specific global objects that might contain our text

            // 1. Check for any specific text editing state
            if ((window as any).textBeingEdited) {
                return (window as any).textBeingEdited;
            }

            // 2. Try to directly access the latest text element from the ESRI framework
            // This is a direct approach to get the text that was just added to the map
            if ((window as any)._textElementJustAdded ||
                (window as any)._lastAddedTextContent ||
                (window as any)._recentlyAddedText) {
                const directText = (window as any)._textElementJustAdded ||
                    (window as any)._lastAddedTextContent ||
                    (window as any)._recentlyAddedText;
                if (directText &&
                    typeof directText === 'string' &&
                    directText.trim() !== '' &&
                    directText.trim().toLowerCase() !== 'text') {
                    return directText;
                }
            }

            // Look for any newly added text elements in the DOM
            // Checking for elements that have been recently added (within last few seconds)
            if (typeof document !== 'undefined') {
                const now = Date.now();
                const recentThreshold = 5000; // 5 seconds

                // Check for elements with a data-timestamp attribute
                const recentTextElements = document.querySelectorAll('.esri-text-symbol[data-timestamp]');
                for (let i = 0; i < recentTextElements.length; i++) {
                    const elem = recentTextElements[i];
                    const timestamp = parseInt(elem.getAttribute('data-timestamp') || '0', 10);

                    // If element was added recently
                    if ((now - timestamp) < recentThreshold) {
                        const textContent = elem.textContent;
                        if (textContent &&
                            textContent.trim() !== '' &&
                            textContent.trim().toLowerCase() !== 'text') {
                            return textContent;
                        }
                    }
                }

                // Look for text elements that have been added recently (no timestamp)
                // We can check elements that have specific classes or properties that indicate they're new
                const possiblyNewElements = document.querySelectorAll(
                    '.esri-text-symbol.esri-view__animation-delay, ' +
                    '.esri-text-symbol.esri-effect, ' +
                    '.esri-text-symbol:not([data-processed]), ' +
                    '.esri-view text:not([data-processed]), ' +
                    '.esri-view tspan:not([data-processed])'
                );

                for (let i = 0; i < possiblyNewElements.length; i++) {
                    const elem = possiblyNewElements[i];
                    const textContent = elem.textContent;
                    if (textContent &&
                        textContent.trim() !== '' &&
                        textContent.trim().toLowerCase() !== 'text') {

                        // Mark as processed to avoid re-processing
                        elem.setAttribute('data-processed', 'true');
                        return textContent;
                    }
                }
            }

            // 3. Check active map view
            let activeView = null;
            let activeMap = null;

            // Experience Builder specific
            if ((window as any).jimuMapView) {
                activeView = (window as any).jimuMapView.view;
                activeMap = activeView?.map;
            }

            // ArcGIS JS API specific
            if (!activeView) {
                if ((window as any).activeView) {
                    activeView = (window as any).activeView;
                    activeMap = activeView?.map;
                } else if ((window as any).view) {
                    activeView = (window as any).view;
                    activeMap = activeView?.map;
                } else if ((window as any).map) {
                    activeMap = (window as any).map;
                    // For ArcGIS JS 3.x
                    if (activeMap.infoWindow) {
                        const content = activeMap.infoWindow.getContent();
                        if (typeof content === 'string' &&
                            content.trim() !== '' &&
                            content.trim().toLowerCase() !== 'text') {
                            return content;
                        }
                    }
                }
            }

            // 4. Check Direct ArcGIS API references for text elements
            // This targets newly created text elements that might not be fully integrated yet
            if ((window as any).view && (window as any).view._stage &&
                (window as any).view._stage.graphics &&
                (window as any).view._stage.graphics._items) {

                const graphicsItems = (window as any).view._stage.graphics._items;
                // Look for the most recently added text graphics
                for (let i = graphicsItems.length - 1; i >= 0; i--) {
                    const g = graphicsItems[i];
                    if (g && g.symbol && g.symbol.text &&
                        g.symbol.text.trim() !== '' &&
                        g.symbol.text.trim().toLowerCase() !== 'text') {
                        return g.symbol.text;
                    }
                }
            }

            // 5. Check for active drawing tools or sketch widgets
            if ((window as any).sketch || (window as any).activeSketch ||
                (window as any).drawingTool || (window as any).activeDrawingTool) {

                const sketch = (window as any).sketch ||
                    (window as any).activeSketch ||
                    (window as any).drawingTool ||
                    (window as any).activeDrawingTool;

                if (sketch) {
                    // Check for active/current sketch
                    if (sketch.viewModel && sketch.viewModel.activeTool === 'text') {
                        if (sketch.viewModel.textSymbol &&
                            sketch.viewModel.textSymbol.text &&
                            sketch.viewModel.textSymbol.text.trim() !== '' &&
                            sketch.viewModel.textSymbol.text.trim().toLowerCase() !== 'text') {
                            return sketch.viewModel.textSymbol.text;
                        }
                    }

                    // Check for the graphic being created
                    if (sketch.viewModel && sketch.viewModel.graphic) {
                        const graphic = sketch.viewModel.graphic;
                        if (graphic.symbol &&
                            graphic.symbol.text &&
                            graphic.symbol.text.trim() !== '' &&
                            graphic.symbol.text.trim().toLowerCase() !== 'text') {
                            return graphic.symbol.text;
                        }
                    }
                }
            }

            // 6. Check selected/active features in the view
            if (activeView) {
                // Check if popup is open with a selected feature
                if (activeView.popup && activeView.popup.visible) {
                    // Try to get text from popup title or content
                    const popupTitle = activeView.popup.title;
                    if (typeof popupTitle === 'string' &&
                        popupTitle.trim() !== '' &&
                        popupTitle.trim().toLowerCase() !== 'text') {
                        return popupTitle;
                    }

                    const popupContent = activeView.popup.content;
                    if (typeof popupContent === 'string' &&
                        popupContent.trim() !== '' &&
                        popupContent.trim().toLowerCase() !== 'text') {
                        return popupContent;
                    }

                    // Check selected feature
                    if (activeView.popup.selectedFeature) {
                        const feature = activeView.popup.selectedFeature;

                        // Check for text symbols on the feature
                        if (feature.symbol && feature.symbol.declaredClass === 'esri.symbols.TextSymbol') {
                            if (feature.symbol.text &&
                                feature.symbol.text.trim() !== '' &&
                                feature.symbol.text.trim().toLowerCase() !== 'text') {
                                return feature.symbol.text;
                            }
                        }

                        // Check for text in attributes - common in ArcGIS
                        if (feature.attributes) {
                            const textFields = ['NAME', 'name', 'LABEL', 'label', 'TEXT', 'text',
                                'DESCRIPTION', 'description', 'TITLE', 'title',
                                'DISPLAY_NAME', 'display_name', 'DISPLAYNAME', 'displayname',
                                'DISPLAY', 'display'];

                            for (const field of textFields) {
                                if (feature.attributes[field] &&
                                    feature.attributes[field].toString().trim() !== '' &&
                                    feature.attributes[field].toString().trim().toLowerCase() !== 'text') {
                                    return feature.attributes[field].toString();
                                }
                            }

                            // Last resort: Check for any text-like attribute
                            for (const key in feature.attributes) {
                                if (typeof feature.attributes[key] === 'string' &&
                                    feature.attributes[key].trim() !== '' &&
                                    feature.attributes[key].trim().toLowerCase() !== 'text') {
                                    return feature.attributes[key];
                                }
                            }
                        }
                    }
                }

                // 7. Check for selected or highlighted graphics
                if (activeView.graphics && activeView.graphics.items && activeView.graphics.items.length > 0) {
                    // First look for selected graphics
                    let selectedGraphics = activeView.graphics.items.filter((g: any) => g.selected);

                    // If no selected property found, look for _selected or selected attribute
                    if (!selectedGraphics.length) {
                        selectedGraphics = activeView.graphics.items.filter((g: any) =>
                            g._selected || g.attributes?.selected
                        );
                    }

                    // Process selected graphics if found
                    for (const g of selectedGraphics) {
                        // Check for text symbol
                        if (g.symbol && g.symbol.declaredClass === 'esri.symbols.TextSymbol') {
                            if (g.symbol.text &&
                                g.symbol.text.trim() !== '' &&
                                g.symbol.text.trim().toLowerCase() !== 'text') {
                                return g.symbol.text;
                            }
                        }

                        // Check attributes
                        if (g.attributes) {
                            for (const key in g.attributes) {
                                if (typeof g.attributes[key] === 'string' &&
                                    g.attributes[key].trim() !== '' &&
                                    g.attributes[key].trim().toLowerCase() !== 'text') {
                                    return g.attributes[key];
                                }
                            }
                        }

                        // Check for text property directly
                        if (g.text &&
                            g.text.trim() !== '' &&
                            g.text.trim().toLowerCase() !== 'text') {
                            return g.text;
                        }
                    }

                    // Look for most recently added graphics (they're likely to be what we're editing)
                    const allGraphics = Array.from(activeView.graphics.items);
                    // Sort by any timestamp or creation property if available
                    const sortedGraphics = allGraphics.sort((a, b) => {
                        const aTime = (a as any)._creationTime || (a as any).timestamp || (a as any)._timestamp || 0;
                        const bTime = (b as any)._creationTime || (b as any).timestamp || (b as any)._timestamp || 0;
                        return bTime - aTime; // Most recent first
                    });

                    // First check only text graphics (most likely what we want)
                    const textGraphics = sortedGraphics
                        .filter((g: any) => g.symbol && g.symbol.declaredClass === 'esri.symbols.TextSymbol');

                    for (const g of textGraphics) {
                        if ((g as any).symbol.text &&
                            (g as any).symbol.text.trim() !== '' &&
                            (g as any).symbol.text.trim().toLowerCase() !== 'text') {
                            return (g as any).symbol.text;
                        }
                    }

                    // If no text graphics found, check all graphics for any text content
                    for (const g of sortedGraphics) {
                        // Check direct text property
                        if ((g as any).text &&
                            (g as any).text.trim() !== '' &&
                            (g as any).text.trim().toLowerCase() !== 'text') {
                            return (g as any).text;
                        }

                        // Check attributes for text
                        if ((g as any).attributes) {
                            for (const key in (g as any).attributes) {
                                if (typeof (g as any).attributes[key] === 'string' &&
                                    (g as any).attributes[key].trim() !== '' &&
                                    (g as any).attributes[key].trim().toLowerCase() !== 'text') {
                                    return (g as any).attributes[key];
                                }
                            }
                        }
                    }
                }

                // 8. Check for any other graphics collections in the view
                // Some ESRI implementations have other collections
                const graphicsCollections = [
                    activeView._graphicsCollection,
                    activeView.graphicsCollection,
                    activeView.layerCollection,
                    activeView.graphics,
                    activeView._layers?.items
                ];

                for (const collection of graphicsCollections) {
                    if (!collection) continue;

                    const items = collection.items || collection._items || collection;
                    if (!items || !items.length) continue;

                    // Try to find text graphics in reverse order (most recent first)
                    for (let i = items.length - 1; i >= 0; i--) {
                        const g = items[i];
                        if (!g) continue;

                        // Check for symbol with text
                        if ((g as any).symbol && (g as any).symbol.text &&
                            (g as any).symbol.text.trim() !== '' &&
                            (g as any).symbol.text.trim().toLowerCase() !== 'text') {
                            return (g as any).symbol.text;
                        }

                        // Check direct text property
                        if ((g as any).text &&
                            (g as any).text.trim() !== '' &&
                            (g as any).text.trim().toLowerCase() !== 'text') {
                            return (g as any).text;
                        }
                    }
                }
            }

            // 9. Check if there's an editor widget active with a feature being edited
            let editorWidget = null;

            // Experience Builder specific editor widget
            if ((window as any).activeEditorWidget) {
                editorWidget = (window as any).activeEditorWidget;
            } else if ((window as any).editor) {
                editorWidget = (window as any).editor;
            } else if (activeView && activeView.ui && activeView.ui.components) {
                // Try to find editor widget in UI components
                for (const component of activeView.ui.components) {
                    if (component.widget &&
                        (component.widget.declaredClass === 'esri.widgets.Editor' ||
                            component.widget.declaredClass === 'esri.widgets.TextEditor')) {
                        editorWidget = component.widget;
                        break;
                    }
                }
            }

            if (editorWidget) {
                // Check if there's a viewModel with active feature
                if (editorWidget.viewModel) {
                    const vm = editorWidget.viewModel;

                    // Check editor state for active features
                    const feature = vm.activeFeature || vm.editFeature || vm.editingFeature ||
                        vm.feature || vm.currentFeature;

                    if (feature) {
                        // Check for text in feature
                        if (feature.symbol && feature.symbol.declaredClass === 'esri.symbols.TextSymbol') {
                            if (feature.symbol.text &&
                                feature.symbol.text.trim() !== '' &&
                                feature.symbol.text.trim().toLowerCase() !== 'text') {
                                return feature.symbol.text;
                            }
                        }

                        // Check attributes
                        if (feature.attributes) {
                            for (const key in feature.attributes) {
                                if (typeof feature.attributes[key] === 'string' &&
                                    feature.attributes[key].trim() !== '' &&
                                    feature.attributes[key].trim().toLowerCase() !== 'text') {
                                    return feature.attributes[key];
                                }
                            }
                        }

                        // Check direct text property
                        if (feature.text &&
                            feature.text.trim() !== '' &&
                            feature.text.trim().toLowerCase() !== 'text') {
                            return feature.text;
                        }
                    }

                    // Check if editor is in specific modes that might contain text
                    if (vm.state === 'editing' || vm.state === 'creating') {
                        const activeTemplate = vm.activeTemplate || vm.template;
                        if (activeTemplate) {
                            if (activeTemplate.label &&
                                activeTemplate.label.trim() !== '' &&
                                activeTemplate.label.trim().toLowerCase() !== 'text') {
                                return activeTemplate.label;
                            }

                            if (activeTemplate.description &&
                                activeTemplate.description.trim() !== '' &&
                                activeTemplate.description.trim().toLowerCase() !== 'text') {
                                return activeTemplate.description;
                            }
                        }
                    }
                }
            }

            // 10. Experience Builder specific: check widget state
            if ((window as any).widgetState && (window as any).widgetState.textContent) {
                return (window as any).widgetState.textContent;
            }

            // 11. Try to capture from recent events - a more dynamic approach
            if (typeof document !== 'undefined') {
                // Setup event listeners for text input
                // Watch for paste events, keydown events, etc.
                let recentText = '';

                // Look for input elements that might contain the text
                const textInputs = document.querySelectorAll('input[type="text"], textarea');
                for (let i = 0; i < textInputs.length; i++) {
                    const input = textInputs[i] as HTMLInputElement;
                    if (input.value &&
                        input.value.trim() !== '' &&
                        input.value.trim().toLowerCase() !== 'text') {

                        // Check if this input is related to map labels or text
                        const isTextLabel = input.id?.toLowerCase().includes('text') ||
                            input.name?.toLowerCase().includes('text') ||
                            input.placeholder?.toLowerCase().includes('text') ||
                            input.className.toLowerCase().includes('text');

                        if (isTextLabel) {
                            recentText = input.value;
                            break;
                        }
                    }
                }

                if (recentText) {
                    return recentText;
                }
            }
        } catch (error) {
            // Error handling without logging
        }

        return null;
    };

    // Try to capture the map text directly when opened - with a retry mechanism
    React.useEffect(() => {
        if (!show) return;

        // Add a retry mechanism to handle cases where the map might not be fully rendered
        const attemptToFindText = (attempt = 0, maxAttempts = 3) => {
            // Only run this effect when the editor is shown
            try {
                // Try to find the displayed text on the map first using DOM
                const domText = findTextInDOM();
                if (domText) {
                    setText(domText);
                    originalDisplayTextRef.current = domText;
                    if (currentTextSymbol) {
                        currentTextSymbol.text = domText;
                    }
                    return true; // Success
                }

                // Fallback to searching in graphic/symbol objects
                // Check global variables for selected text
                if (typeof window !== 'undefined') {
                    // ESRI specific: Check for selected text in the current view
                    if ((window as any).jimuMapView?.view?.popup?.selectedFeature?.attributes) {
                        const attributes = (window as any).jimuMapView.view.popup.selectedFeature.attributes;
                        // Check for common text fields in the attributes
                        const textFields = ['name', 'label', 'text', 'description', 'title', 'display_name', 'displayname'];
                        for (const field of textFields) {
                            if (attributes[field] &&
                                attributes[field].trim() !== '' &&
                                attributes[field].trim().toLowerCase() !== 'text') {
                                setText(attributes[field]);
                                originalDisplayTextRef.current = attributes[field];
                                if (currentTextSymbol) {
                                    currentTextSymbol.text = attributes[field];
                                }
                                return true; // Success
                            }
                        }
                    }

                    // Check for any explicit selections or active text elements
                    if ((window as any).selectedGraphicText) {
                        const selectedText = (window as any).selectedGraphicText;
                        if (selectedText &&
                            selectedText.trim() !== '' &&
                            selectedText.trim().toLowerCase() !== 'text') {
                            setText(selectedText);
                            originalDisplayTextRef.current = selectedText;
                            if (currentTextSymbol) {
                                currentTextSymbol.text = selectedText;
                            }
                            return true; // Success
                        }
                    }

                    // Check if there's a jimuMapView with active/selected graphics
                    if ((window as any).jimuMapView?.view?.graphics?.items) {
                        const view = (window as any).jimuMapView.view;

                        // First check the currently selected graphic directly
                        if (view.popup && view.popup.selectedFeature) {
                            const selectedFeature = view.popup.selectedFeature;
                            if (selectedFeature.symbol &&
                                selectedFeature.symbol.text &&
                                selectedFeature.symbol.text.trim() !== '' &&
                                selectedFeature.symbol.text.trim().toLowerCase() !== 'text') {
                                setText(selectedFeature.symbol.text);
                                originalDisplayTextRef.current = selectedFeature.symbol.text;
                                if (currentTextSymbol) {
                                    currentTextSymbol.text = selectedFeature.symbol.text;
                                }
                                return true; // Success
                            }

                            const featureTextResult = findTextInObject(selectedFeature, 'view.popup.selectedFeature');
                            if (featureTextResult?.text) {
                                setText(featureTextResult.text);
                                originalDisplayTextRef.current = featureTextResult.text;
                                if (currentTextSymbol) {
                                    currentTextSymbol.text = featureTextResult.text;
                                }
                                return true; // Success
                            }
                        }

                        // Look for selected graphics
                        const selectedGraphics = view.graphics.items.filter((g: any) => g.selected);

                        for (const g of selectedGraphics) {
                            const gTextResult = findTextInObject(g, 'view.graphics.selected');
                            if (gTextResult?.text) {
                                setText(gTextResult.text);
                                originalDisplayTextRef.current = gTextResult.text;
                                if (currentTextSymbol) {
                                    currentTextSymbol.text = gTextResult.text;
                                }
                                return true; // Success
                            }
                        }

                        // If no selected graphics found with text, check all graphics
                        for (const g of view.graphics.items) {
                            const gTextResult = findTextInObject(g, 'view.graphics');
                            if (gTextResult?.text) {
                                setText(gTextResult.text);
                                originalDisplayTextRef.current = gTextResult.text;
                                if (currentTextSymbol) {
                                    currentTextSymbol.text = gTextResult.text;
                                }
                                return true; // Success
                            }
                        }
                    }

                    // ArcGIS JavaScript API specific: check for active editor widget
                    if ((window as any).activeEditorWidget && (window as any).activeEditorWidget.viewModel) {
                        const editorVM = (window as any).activeEditorWidget.viewModel;

                        // Check if there's an active feature being edited
                        if (editorVM.activeFeature || editorVM.editFeature) {
                            const feature = editorVM.activeFeature || editorVM.editFeature;
                            if (feature) {
                                const featureTextResult = findTextInObject(feature, 'editorVM.feature');
                                if (featureTextResult?.text) {
                                    setText(featureTextResult.text);
                                    originalDisplayTextRef.current = featureTextResult.text;
                                    if (currentTextSymbol) {
                                        currentTextSymbol.text = featureTextResult.text;
                                    }
                                    return true; // Success
                                }
                            }
                        }

                        // Check editor states that might contain the text
                        if (editorVM.state && editorVM.state === "editing") {
                            const editingFeature = editorVM.editingFeature || editorVM.editFeature;
                            if (editingFeature) {
                                const featureTextResult = findTextInObject(editingFeature, 'editorVM.editingFeature');
                                if (featureTextResult?.text) {
                                    setText(featureTextResult.text);
                                    originalDisplayTextRef.current = featureTextResult.text;
                                    if (currentTextSymbol) {
                                        currentTextSymbol.text = featureTextResult.text;
                                    }
                                    return true; // Success
                                }
                            }
                        }
                    }
                }

                return false; // No text found
            } catch (error) {
                // Error handling without logging
                return false;
            }
        };

        // Try immediately
        const found = attemptToFindText();
        if (found) return;

        // If not found, retry after a short delay to allow for rendering
        const delayedSearch = setTimeout(() => {
            const foundOnRetry = attemptToFindText(1);
            if (!foundOnRetry) {
                // One last attempt with longer delay
                setTimeout(() => attemptToFindText(2), 500);
            }
        }, 100);

        // Cleanup
        return () => clearTimeout(delayedSearch);
    }, [show, currentTextSymbol]);

    // Initialize when shown or symbol changes
    React.useEffect(() => {
        if (!currentTextSymbol || !show) return;

        try {
            // Store reference to the symbol
            setSymbol(currentTextSymbol);
            setHasChanges(false);

            // Get initial text using multiple strategies

            // First check DOM for visible text
            const domText = findTextInDOM();

            // Then check ESRI specific objects
            const esriText = findTextInEsriObjects();

            // Start with the original text from the symbol
            let textContent = graphic?.symbol?.text ?? currentTextSymbol.text;

            // Is this a default or empty text value?
            const isDefaultText =
                !textContent ||
                textContent.trim().toLowerCase() === 'text' ||
                textContent.trim() === '';

            // If we found text in the DOM, prioritize that
            if (domText && domText.trim().toLowerCase() !== 'text') {
                textContent = domText;
            }
            // Otherwise check ESRI objects
            else if (esriText && esriText.trim().toLowerCase() !== 'text') {
                textContent = esriText;
            }
            // Otherwise if we have default text, try to find something better
            else if (isDefaultText) {
                // Fallback 1: Search graphic
                if (graphic) {
                    const graphicTextResult = findTextInObject(graphic, 'graphic');
                    if (graphicTextResult?.text) {
                        textContent = graphicTextResult.text;
                    }
                }

                // Fallback 2: Search symbol object
                if ((!textContent || textContent.trim() === '') && currentTextSymbol) {
                    const symbolTextResult = findTextInObject(currentTextSymbol, 'symbol');
                    if (symbolTextResult?.text && symbolTextResult.path !== 'symbol.text') {
                        textContent = symbolTextResult.text;
                    }
                }

                // Fallback 3: Search window context
                if ((!textContent || textContent.trim() === '') && typeof window !== 'undefined') {
                    if ((window as any).selectedGraphicText) {
                        textContent = (window as any).selectedGraphicText;
                    }
                }
            }

            // Final fallback to empty string
            textContent = textContent || '';
            originalDisplayTextRef.current = textContent;

            // Sync back to symbol if needed
            if (textContent !== currentTextSymbol.text) {
                currentTextSymbol.text = textContent;
            }

            // Set the UI state
            setText(textContent);

            if (currentTextSymbol.font) {
                setFontSize(currentTextSymbol.font.size ?? 12);
                setFontFamily(currentTextSymbol.font.family ?? 'Arial');
                setFontWeight(currentTextSymbol.font.weight ?? 'normal');
                setFontStyle(currentTextSymbol.font.style ?? 'normal');
                setFontDecoration(currentTextSymbol.font.decoration ?? 'none');
            }

            if (currentTextSymbol.color) {
                const colorCss = currentTextSymbol.color.toCss
                    ? currentTextSymbol.color.toCss(true)
                    : '#000000';
                setFontColor(colorCss);
            } else {
                setFontColor('#000000');
            }

            setFontRotation(currentTextSymbol.angle ?? 0);
            setHorizontalAlignment((currentTextSymbol.horizontalAlignment ?? 'center') as any);
            setVerticalAlignment((currentTextSymbol.verticalAlignment ?? 'middle') as any);

            // If we still have default text, retry after a short delay
            if (textContent.trim() === '' || textContent.trim().toLowerCase() === 'text') {
                setTimeout(() => {
                    // Try DOM again after render
                    const retryDomText = findTextInDOM();
                    if (retryDomText && retryDomText.trim().toLowerCase() !== 'text') {
                        setText(retryDomText);
                        originalDisplayTextRef.current = retryDomText;
                        if (currentTextSymbol) {
                            currentTextSymbol.text = retryDomText;
                            setHasChanges(true);
                        }
                    } else {
                        // Try ESRI objects again
                        const retryEsriText = findTextInEsriObjects();
                        if (retryEsriText && retryEsriText.trim().toLowerCase() !== 'text') {
                            setText(retryEsriText);
                            originalDisplayTextRef.current = retryEsriText;
                            if (currentTextSymbol) {
                                currentTextSymbol.text = retryEsriText;
                                setHasChanges(true);
                            }
                        }
                    }
                }, 300);
            }
        } catch (error) {
            // Error handling without logging
        }
    }, [currentTextSymbol, show, graphic]);

    // DIRECT PROPERTY UPDATE FUNCTIONS
    // These update the actual symbol immediately when a property changes

    const updateText = (newText: string) => {
        if (!symbol) return;

        // Update UI state - make sure to preserve spaces
        setText(newText);

        // Directly update the symbol
        try {
            // Make sure the text property is updated on the symbol directly
            // and ensure spaces are preserved
            symbol.text = newText;

            // Also update the original display text reference
            originalDisplayTextRef.current = newText;

            // Try to update the text in any global variables or selected graphics
            // This is a bit of a hack, but might help update text in the Experience Builder environment
            if (typeof window !== 'undefined') {
                if ((window as any).selectedGraphicText !== undefined) {
                    (window as any).selectedGraphicText = newText;
                }

                if ((window as any).jimuMapView && (window as any).jimuMapView.view) {
                    const view = (window as any).jimuMapView.view;
                    if (view.graphics && view.graphics.items) {
                        const selectedGraphics = view.graphics.items.filter((g: any) => g.selected);
                        for (const g of selectedGraphics) {
                            if (g.text !== undefined) {
                                g.text = newText;
                            }
                            if (g.attributes && g.attributes.text !== undefined) {
                                g.attributes.text = newText;
                            }
                            if (g.symbol && g.symbol.text !== undefined) {
                                g.symbol.text = newText;
                            }
                        }
                    }
                }
            }

            setHasChanges(true);
        } catch (e) {
            // Error handling without logging
        }
    };

    const updateFontSize = (newSize: number) => {
        if (!symbol || !symbol.font) return;

        // Update UI state
        setFontSize(newSize);

        // Directly update the symbol
        try {
            const font = symbol.font.clone();
            font.size = newSize;
            symbol.font = font;
            setHasChanges(true);
        } catch (e) {
            // Error handling without logging
        }
    };

    const updateFontColor = (newColor: string) => {
        if (!symbol) return;

        // Update UI state
        setFontColor(newColor);

        // Directly update the symbol
        try {
            symbol.color = new Color(newColor);
            setHasChanges(true);
        } catch (e) {
            // Error handling without logging
        }
    };

    const updateFontFamily = (newFamily: string) => {
        if (!symbol || !symbol.font) return;

        // Update UI state
        setFontFamily(newFamily);

        // Directly update the symbol
        try {
            const font = symbol.font.clone();
            font.family = newFamily;
            symbol.font = font;
            setHasChanges(true);
        } catch (e) {
            // Error handling without logging
        }
    };

    const updateFontWeight = (newWeight: string) => {
        if (!symbol || !symbol.font) return;

        // Update UI state
        setFontWeight(newWeight);

        // Directly update the symbol
        try {
            const font = symbol.font.clone();
            font.weight = newWeight as any;
            symbol.font = font;
            setHasChanges(true);
        } catch (e) {
            // Error handling without logging
        }
    };

    const updateFontStyle = (newStyle: string) => {
        if (!symbol || !symbol.font) return;

        // Update UI state
        setFontStyle(newStyle);

        // Directly update the symbol
        try {
            const font = symbol.font.clone();
            font.style = newStyle as any;
            symbol.font = font;
            setHasChanges(true);
        } catch (e) {
            // Error handling without logging
        }
    };

    const updateFontDecoration = (newDecoration: string) => {
        if (!symbol || !symbol.font) return;

        // Update UI state
        setFontDecoration(newDecoration);

        // Directly update the symbol
        try {
            const font = symbol.font.clone();
            font.decoration = newDecoration as any;
            symbol.font = font;
            setHasChanges(true);
        } catch (e) {
            // Error handling without logging
        }
    };

    const updateFontRotation = (newRotation: number) => {
        if (!symbol) return;

        // Update UI state
        setFontRotation(newRotation);

        // Directly update the symbol
        try {
            symbol.angle = newRotation;
            setHasChanges(true);
        } catch (e) {
            // Error handling without logging
        }
    };

    const updateHorizontalAlignment = (newAlignment: 'left' | 'center' | 'right') => {
        if (!symbol) return;

        // Update UI state
        setHorizontalAlignment(newAlignment);

        // Directly update the symbol
        try {
            symbol.horizontalAlignment = newAlignment;
            setHasChanges(true);
        } catch (e) {
            // Error handling without logging
        }
    };

    const updateVerticalAlignment = (newAlignment: 'top' | 'middle' | 'bottom' | 'baseline') => {
        if (!symbol) return;

        // Update UI state
        setVerticalAlignment(newAlignment);

        // Directly update the symbol
        try {
            symbol.verticalAlignment = newAlignment;
            setHasChanges(true);
        } catch (e) {
            // Error handling without logging
        }
    };

    const handleApply = () => {
        if (!symbol) return;

        try {
            // If no changes were made, just close
            if (!hasChanges) {
                onClose();
                return;
            }

            // The symbol has already been updated with each property change
            // Here we just need to let the parent component know

            // Make one final check to ensure text is synchronized
            if (originalDisplayTextRef.current && symbol.text !== originalDisplayTextRef.current) {
                symbol.text = originalDisplayTextRef.current;
            }

            // Call the parent's update function
            updateSymbol(symbol);
            onClose();
        } catch (error) {
            // Error handling without logging
        }
    };

    if (!show) return null;

    return (
        <div className="text-style-editor p-3">
            <Label className="font-weight-semibold">Label Text</Label>
            <TextInput
                className="mb-2"
                value={text}
                onChange={e => updateText(e.target.value)}
                onAcceptValue={value => updateText(value)}
                onKeyDown={e => {
                    // Make sure pressing space works correctly
                    if (e.key === ' ') {
                        // Prevent default in case there's any special handling of space
                        e.preventDefault();
                        // Update the text with a space added
                        updateText(text + ' ');
                    }
                }}
                aria-label="Edit label text"
            />

            <Label className="font-weight-semibold">Font Size</Label>
            <NumericInput className="mb-2" value={fontSize} min={1} max={120} onChange={updateFontSize} aria-label="Font size" />

            <Label className="font-weight-semibold">Font Color</Label>
            <ColorPicker color={fontColor} onChange={updateFontColor} className="mb-2" aria-label="Font color picker" />

            <Label className="font-weight-semibold">Font Family</Label>
            <Select value={fontFamily} onChange={e => updateFontFamily(e.target.value)} className="mb-2" aria-label="Font family">
                {[
                    'Arial',
                    'Avenir Next',
                    'Josefin Slab',
                    'Merriweather',
                    'Montserrat',
                    'Noto Sans',
                    'Noto Serif',
                    'Open Sans',
                    'Playfair Display',
                    'Roboto',
                    'Ubuntu'
                ].map(f => (
                    <Option key={f} value={f} style={{ fontFamily: f }}>{f}</Option>
                ))}
            </Select>

            <Label className="font-weight-semibold">Font Style</Label>
            <AdvancedButtonGroup className="mb-2 d-flex">
                <Button icon active={fontWeight === 'bold'} onClick={() => updateFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')} title="Bold" aria-label="Bold">
                    <Icon icon={fsBoldIcon} />
                </Button>
                <Button icon active={fontStyle === 'italic'} onClick={() => updateFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')} title="Italic" aria-label="Italic">
                    <Icon icon={fItalicIcon} />
                </Button>
                <Button icon active={fontDecoration === 'underline'} onClick={() => updateFontDecoration(fontDecoration === 'underline' ? 'none' : 'underline')} title="Underline" aria-label="Underline">
                    <Icon icon={fUnderlineIcon} />
                </Button>
            </AdvancedButtonGroup>

            <Label className="font-weight-semibold">Horizontal Alignment</Label>
            <AdvancedButtonGroup className="mb-2 d-flex">
                <Button icon active={horizontalAlignment === 'left'} onClick={() => updateHorizontalAlignment('left')} title="Align Left" aria-label="Align Left">
                    <Icon icon={hAlignLeft} />
                </Button>
                <Button icon active={horizontalAlignment === 'center'} onClick={() => updateHorizontalAlignment('center')} title="Align Center" aria-label="Align Center">
                    <Icon icon={hAlignCenter} />
                </Button>
                <Button icon active={horizontalAlignment === 'right'} onClick={() => updateHorizontalAlignment('right')} title="Align Right" aria-label="Align Right">
                    <Icon icon={hAlignRight} />
                </Button>
            </AdvancedButtonGroup>

            <Label className="font-weight-semibold">Vertical Alignment</Label>
            <AdvancedButtonGroup className="mb-3 d-flex">
                <Button icon active={verticalAlignment === 'top'} onClick={() => updateVerticalAlignment('top')} title="Align Top" aria-label="Align Top">
                    <Icon icon={vAlignTop} />
                </Button>
                <Button icon active={verticalAlignment === 'middle'} onClick={() => updateVerticalAlignment('middle')} title="Align Middle" aria-label="Align Middle">
                    <Icon icon={vAlignMid} />
                </Button>
                <Button icon active={verticalAlignment === 'bottom'} onClick={() => updateVerticalAlignment('bottom')} title="Align Bottom" aria-label="Align Bottom">
                    <Icon icon={vAlignBot} />
                </Button>
                <Button icon active={verticalAlignment === 'baseline'} onClick={() => updateVerticalAlignment('baseline')} title="Align Baseline" aria-label="Align Baseline">
                    <Icon icon={vAlignBase} />
                </Button>
            </AdvancedButtonGroup>

            <Label className="font-weight-semibold">Rotation</Label>
            <NumericInput className="mb-3" value={fontRotation} min={-360} max={360} onChange={updateFontRotation} aria-label="Rotation angle" />

            <Button onClick={handleApply} type="primary" className="w-100" title="Apply changes and close" aria-label="Apply and close">
                Apply and Close
            </Button>
        </div>
    );
};