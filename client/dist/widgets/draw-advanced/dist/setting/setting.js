System.register(["jimu-core/emotion","jimu-core","jimu-ui/advanced/setting-components","jimu-ui"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_ui__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_ui__, "__esModule", { value: true });
	return {
		setters: [
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__[key] = module[key];
				});
			},
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_core__[key] = module[key];
				});
			},
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__[key] = module[key];
				});
			},
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_ui__[key] = module[key];
				});
			}
		],
		execute: function() {
			__WEBPACK_DYNAMIC_EXPORT__(
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./your-extensions/widgets/draw-advanced/src/config.ts":
/*!*************************************************************!*\
  !*** ./your-extensions/widgets/draw-advanced/src/config.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DrawMode: () => (/* binding */ DrawMode)
/* harmony export */ });
var DrawMode;
(function (DrawMode) {
    DrawMode["SINGLE"] = "single";
    DrawMode["CONTINUOUS"] = "continuous";
    DrawMode["UPDATE"] = "update";
})(DrawMode || (DrawMode = {}));


/***/ }),

/***/ "./your-extensions/widgets/draw-advanced/src/setting/components/unitMaker.tsx":
/*!************************************************************************************!*\
  !*** ./your-extensions/widgets/draw-advanced/src/setting/components/unitMaker.tsx ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/react/jsx-runtime */ "@emotion/react/jsx-runtime");
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jimu-ui */ "jimu-ui");



const { useState, useEffect } = jimu_core__WEBPACK_IMPORTED_MODULE_1__.React;
const UnitMaker = (props) => {
    const allUnits = props.allUnits;
    const type = props.type;
    const oldUnit = props.oldUnit;
    const [unit, setUnit] = useState((oldUnit === null || oldUnit === void 0 ? void 0 : oldUnit.unit) || '');
    const [label, setLabel] = useState((oldUnit === null || oldUnit === void 0 ? void 0 : oldUnit.label) || '');
    const [abbreviation, setAbbreviation] = useState((oldUnit === null || oldUnit === void 0 ? void 0 : oldUnit.abbreviation) || '');
    const [conversion, setConversion] = useState((oldUnit === null || oldUnit === void 0 ? void 0 : oldUnit.conversion) || 1);
    const [allValid, setAllValid] = useState(false);
    const [validityText, setValidityText] = useState('');
    //checks unit for validity
    useEffect(() => {
        let valid = true;
        let text = '';
        const letters = /^[a-zA-Z]+$/.test(unit);
        if (unit === '' || label === '' || abbreviation === '') {
            valid = false;
            text = 'Required Field Missing';
        }
        if (!conversion) {
            valid = false;
            text = 'Invalid Conversion Factor';
        }
        if (!letters) {
            valid = false;
            text = 'Name May Only Contain Letters';
        }
        for (let i = 0; i < allUnits.length; i++) {
            if (unit === allUnits[i].unit) {
                if (oldUnit && oldUnit.unit === unit) {
                    //intentionally blank
                    continue;
                }
                else {
                    valid = false;
                    text = 'Name Must Be Unique';
                }
            }
        }
        setAllValid(valid);
        setValidityText(text);
    }, [unit, label, abbreviation, conversion]);
    return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.CollapsablePanel, { defaultIsOpen: !oldUnit, label: oldUnit ? `Edit/Delete - ${label}` : 'Create New Unit', type: oldUnit ? 'primary' : 'default', className: 'mb-2', children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Label, { className: 'w-100', children: [props.handleChangeUnit ? 'Name (Cannot be changed):' : 'Name (Must be unique, letters only):', (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.TextInput, { allowClear: !props.handleChangeUnit, required: true, type: 'text', onChange: (e) => setUnit(e.target.value), defaultValue: unit, readOnly: props.handleChangeUnit })] }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Label, { className: 'w-100', children: ["Label (Full name used in menus):", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.TextInput, { allowClear: true, required: true, type: 'text', onChange: (e) => setLabel(e.target.value), defaultValue: label })] }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Label, { className: 'w-100', children: ["Abbreviation (Used on map):", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.TextInput, { allowClear: true, required: true, type: 'text', onChange: (e) => setAbbreviation(e.target.value), defaultValue: abbreviation })] }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Label, { className: 'w-100', children: [type === 'linear' ? 'Conversion Factor (One meter is how many of your unit?):' : 'Conversion Factor (One square meter is how many of your unit?):', (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.NumericInput, { className: 'w-100', required: true, defaultValue: conversion, onChange: (e) => setConversion(e) })] }), allValid ?
                (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h6", { children: type === 'linear' ? `1 meter = ${conversion} ${label} (${abbreviation})` : `1 square meter = ${conversion} ${label} (${abbreviation})` }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Button, { block: true, onClick: () => props.handleAddUnit ? props.handleAddUnit({ unit, label, abbreviation, conversion }, type) : props.handleChangeUnit({ unit, label, abbreviation, conversion }, type), children: "Save Unit" })] })
                : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h6", { children: validityText }), props.handleDeleteUnit ?
                (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_2__.Button, { block: true, type: 'danger', onClick: () => props.handleDeleteUnit(unit, type), children: "Delete Unit" })
                : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {})] });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (UnitMaker);


/***/ }),

/***/ "./your-extensions/widgets/draw-advanced/src/setting/translations/default.ts":
/*!***********************************************************************************!*\
  !*** ./your-extensions/widgets/draw-advanced/src/setting/translations/default.ts ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
  Licensing

  Copyright 2020 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    selectMapWidget: 'Select a Map widget',
    sourceLabel: 'Source Label',
    selectDrawMode: 'Select Draw Mode',
    drawModeSingle: 'Single',
    drawModeContinuous: 'Continuous',
    drawModeUpdate: 'Update'
});


/***/ }),

/***/ "@emotion/react/jsx-runtime":
/*!************************************!*\
  !*** external "jimu-core/emotion" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__;

/***/ }),

/***/ "jimu-core":
/*!****************************!*\
  !*** external "jimu-core" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_core__;

/***/ }),

/***/ "jimu-ui":
/*!**************************!*\
  !*** external "jimu-ui" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_ui__;

/***/ }),

/***/ "jimu-ui/advanced/setting-components":
/*!******************************************************!*\
  !*** external "jimu-ui/advanced/setting-components" ***!
  \******************************************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!******************************************!*\
  !*** ./jimu-core/lib/set-public-path.ts ***!
  \******************************************/
/**
 * Webpack will replace __webpack_public_path__ with __webpack_require__.p to set the public path dynamically.
 * The reason why we can't set the publicPath in webpack config is: we change the publicPath when download.
 * */
__webpack_require__.p = window.jimuConfig.baseUrl;

})();

// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!***********************************************************************!*\
  !*** ./your-extensions/widgets/draw-advanced/src/setting/setting.tsx ***!
  \***********************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __set_webpack_public_path__: () => (/* binding */ __set_webpack_public_path__),
/* harmony export */   "default": () => (/* binding */ Setting)
/* harmony export */ });
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/react/jsx-runtime */ "@emotion/react/jsx-runtime");
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../config */ "./your-extensions/widgets/draw-advanced/src/config.ts");
/* harmony import */ var _translations_default__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./translations/default */ "./your-extensions/widgets/draw-advanced/src/setting/translations/default.ts");
/* harmony import */ var jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! jimu-ui/advanced/setting-components */ "jimu-ui/advanced/setting-components");
/* harmony import */ var jimu_ui__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! jimu-ui */ "jimu-ui");
/* harmony import */ var _components_unitMaker__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/unitMaker */ "./your-extensions/widgets/draw-advanced/src/setting/components/unitMaker.tsx");








const defaultDistanceUnits = [
    { unit: 'kilometers', label: 'Kilometers', abbreviation: 'km', conversion: 0.001 },
    { unit: 'miles', label: 'Miles', abbreviation: 'mi', conversion: 0.000621371 },
    { unit: 'meters', label: 'Meters', abbreviation: 'm', conversion: 1 },
    { unit: 'nautical-miles', label: 'Nautical Miles', abbreviation: 'NM', conversion: 0.000539957 },
    { unit: 'feet', label: 'Feet', abbreviation: 'ft', conversion: 3.28084 },
    { unit: 'yards', label: 'Yards', abbreviation: 'yd', conversion: 1.09361 }
];
const defaultAreaUnits = [
    { unit: 'square-kilometers', label: 'Square Kilometers', abbreviation: 'km�', conversion: 0.000001 },
    { unit: 'square-miles', label: 'Square Miles', abbreviation: 'mi�', conversion: 3.86102e-7 },
    { unit: 'acres', label: 'Acres', abbreviation: 'ac', conversion: 0.000247105 },
    { unit: 'hectares', label: 'Hectares', abbreviation: 'ha', conversion: 0.0001 },
    { unit: 'square-meters', label: 'Square Meters', abbreviation: 'm�', conversion: 1 },
    { unit: 'square-feet', label: 'Square Feet', abbreviation: 'ft�', conversion: 10.7639 },
    { unit: 'square-yards', label: 'Square Yards', abbreviation: 'yd�', conversion: 1.19599 }
];
class Setting extends jimu_core__WEBPACK_IMPORTED_MODULE_1__.React.PureComponent {
    constructor(props) {
        var _a, _b, _c, _d;
        super(props);
        this.onPropertyChange = (name, value) => {
            const { config } = this.props;
            if (value === config[name]) {
                return;
            }
            const newConfig = config.set(name, value);
            const alterProps = {
                id: this.props.id,
                config: newConfig
            };
            this.props.onSettingChange(alterProps);
        };
        this.onMapWidgetSelected = (useMapWidgetsId) => {
            this.props.onSettingChange({
                id: this.props.id,
                useMapWidgetIds: useMapWidgetsId
            });
        };
        this.handleDrawModeChange = (evt) => {
            var _a;
            const value = (_a = evt === null || evt === void 0 ? void 0 : evt.target) === null || _a === void 0 ? void 0 : _a.value;
            this.onPropertyChange('creationMode', value);
        };
        this.handleTurnOff = () => {
            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('turnOffOnClose', !this.props.config.turnOffOnClose)
            });
        };
        this.handleChangeTitle = () => {
            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('changeTitle', !this.props.config.changeTitle)
            });
        };
        this.handleChangeListMode = () => {
            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('changeListMode', !this.props.config.changeListMode)
            });
        };
        this.handleListMode = () => {
            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('listMode', !this.props.config.listMode)
            });
        };
        this.handleTitle = (value) => {
            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('title', value)
            });
        };
        this.handleDefaultDistance = (value) => {
            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('defaultDistance', value)
            });
            this.setState({ defaultDistanceUnit: value });
        };
        this.handleDefaultArea = (value) => {
            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('defaultArea', value)
            });
            this.setState({ defaultAreaUnit: value });
        };
        this.handleAddUnit = (newUnit, type) => {
            var _a, _b, _c, _d;
            if (type === 'linear') {
                // Convert to mutable array, add item, then save
                const userDistances = (((_b = (_a = this.props.config.userDistances) === null || _a === void 0 ? void 0 : _a.asMutable) === null || _b === void 0 ? void 0 : _b.call(_a)) || []);
                const updatedDistances = [...userDistances, newUnit];
                this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('userDistances', updatedDistances)
                });
                this.setState({
                    availableDistanceUnits: [...defaultDistanceUnits, ...updatedDistances],
                    defaultDistanceUnit: null
                });
            }
            else {
                // Convert to mutable array, add item, then save
                const userAreas = (((_d = (_c = this.props.config.userAreas) === null || _c === void 0 ? void 0 : _c.asMutable) === null || _d === void 0 ? void 0 : _d.call(_c)) || []);
                const updatedAreas = [...userAreas, newUnit];
                this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('userAreas', updatedAreas)
                });
                this.setState({
                    availableAreaUnits: [...defaultAreaUnits, ...updatedAreas],
                    defaultAreaUnit: null
                });
            }
        };
        this.handleChangeUnit = (newUnit, type) => {
            var _a, _b, _c, _d;
            if (type === 'linear') {
                const userDistances = (((_b = (_a = this.props.config.userDistances) === null || _a === void 0 ? void 0 : _a.asMutable) === null || _b === void 0 ? void 0 : _b.call(_a)) || []);
                const updatedDistances = [...userDistances];
                const index = updatedDistances.findIndex(existing => existing.unit === newUnit.unit);
                if (index !== -1) {
                    updatedDistances[index] = newUnit;
                }
                this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('userDistances', updatedDistances)
                });
                this.setState({
                    availableDistanceUnits: [...defaultDistanceUnits, ...updatedDistances],
                    defaultDistanceUnit: null
                });
            }
            else {
                const userAreas = (((_d = (_c = this.props.config.userAreas) === null || _c === void 0 ? void 0 : _c.asMutable) === null || _d === void 0 ? void 0 : _d.call(_c)) || []);
                const updatedAreas = [...userAreas];
                const index = updatedAreas.findIndex(existing => existing.unit === newUnit.unit);
                if (index !== -1) {
                    updatedAreas[index] = newUnit;
                }
                this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('userAreas', updatedAreas)
                });
                this.setState({
                    availableAreaUnits: [...defaultAreaUnits, ...updatedAreas],
                    defaultAreaUnit: null
                });
            }
        };
        this.handleDeleteUnit = (name, type) => {
            var _a, _b, _c, _d;
            if (type === 'linear') {
                const userDistances = (((_b = (_a = this.props.config.userDistances) === null || _a === void 0 ? void 0 : _a.asMutable) === null || _b === void 0 ? void 0 : _b.call(_a)) || []);
                const updatedDistances = userDistances.filter(existing => existing.unit !== name);
                this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('userDistances', updatedDistances)
                });
                this.setState({
                    availableDistanceUnits: [...defaultDistanceUnits, ...updatedDistances],
                    defaultDistanceUnit: null
                });
            }
            else {
                const userAreas = (((_d = (_c = this.props.config.userAreas) === null || _c === void 0 ? void 0 : _c.asMutable) === null || _d === void 0 ? void 0 : _d.call(_c)) || []);
                const updatedAreas = userAreas.filter(existing => existing.unit !== name);
                this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('userAreas', updatedAreas)
                });
                this.setState({
                    availableAreaUnits: [...defaultAreaUnits, ...updatedAreas],
                    defaultAreaUnit: null
                });
            }
        };
        this.formatMessage = (id, values) => {
            const messages = Object.assign({}, _translations_default__WEBPACK_IMPORTED_MODULE_3__["default"], jimu_ui__WEBPACK_IMPORTED_MODULE_5__.defaultMessages, jimu_core__WEBPACK_IMPORTED_MODULE_1__.defaultMessages);
            return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] }, values);
        };
        this.state = {
            linearSidePopper: false,
            areaSidePopper: false,
            defaultDistanceUnit: this.props.config.defaultDistance,
            defaultAreaUnit: this.props.config.defaultArea,
            availableDistanceUnits: [...defaultDistanceUnits, ...(((_b = (_a = this.props.config.userDistances) === null || _a === void 0 ? void 0 : _a.asMutable) === null || _b === void 0 ? void 0 : _b.call(_a)) || this.props.config.userDistances || [])],
            availableAreaUnits: [...defaultAreaUnits, ...(((_d = (_c = this.props.config.userAreas) === null || _c === void 0 ? void 0 : _c.asMutable) === null || _d === void 0 ? void 0 : _d.call(_c)) || this.props.config.userAreas || [])]
        };
    }
    render() {
        var _a, _b, _c, _d;
        const { useMapWidgetIds, config } = this.props;
        const userDistances = (((_b = (_a = config.userDistances) === null || _a === void 0 ? void 0 : _a.asMutable) === null || _b === void 0 ? void 0 : _b.call(_a)) || config.userDistances || []);
        const userAreas = (((_d = (_c = config.userAreas) === null || _c === void 0 ? void 0 : _c.asMutable) === null || _d === void 0 ? void 0 : _d.call(_c)) || config.userAreas || []);
        return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "widget-setting-psearch", children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SettingSection, { className: "map-selector-section", title: this.props.intl.formatMessage({ id: 'sourceLabel', defaultMessage: _translations_default__WEBPACK_IMPORTED_MODULE_3__["default"].sourceLabel }), children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SettingRow, { label: this.formatMessage('selectMapWidget') }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SettingRow, { children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.MapWidgetSelector, { onSelect: this.onMapWidgetSelected, useMapWidgetIds: useMapWidgetIds }) }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SettingRow, { label: this.formatMessage('selectDrawMode'), flow: 'wrap', children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Select, { value: config.creationMode, onChange: this.handleDrawModeChange, className: 'drop-height', children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: _config__WEBPACK_IMPORTED_MODULE_2__.DrawMode.CONTINUOUS, children: this.formatMessage('drawModeContinuous') }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: _config__WEBPACK_IMPORTED_MODULE_2__.DrawMode.SINGLE, children: this.formatMessage('drawModeSingle') })] }) }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SettingRow, { label: 'Draw Layer Settings', flow: 'wrap', children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Label, { className: 'w-100 mt-2 mb-2', children: ["Draw Layer Name:", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.TextInput, { type: 'text', required: true, defaultValue: 'Drawn Graphics', onChange: (e) => this.handleTitle(e.target.value) })] }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Checkbox, { checked: this.props.config.changeTitle, onChange: this.handleChangeTitle }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: "Allow Users To Change Draw Layer Name" })] }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Checkbox, { checked: this.props.config.listMode, onChange: this.handleListMode }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: "Show In Map Layer List" })] }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Checkbox, { checked: this.props.config.changeListMode, onChange: this.handleChangeListMode }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: "Allow Users To Show/Hide In Map Layer List" })] })] }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SettingRow, { label: 'Measurement Settings', flow: 'wrap', children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Button, { onClick: () => this.setState({ linearSidePopper: true }), children: "Add or Change Linear Units" }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Label, { className: 'w-100 mt-2 mb-2', children: ["Default Linear Unit:", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Select, { title: 'Linear Units', onChange: (e) => this.handleDefaultDistance(e.target.value), value: this.state.defaultDistanceUnit, children: this.state.availableDistanceUnits.map((unit, index) => {
                                                    return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Option, { value: index, children: unit.label + " (" + unit.abbreviation + ")" }, index));
                                                }) }), this.state.defaultDistanceUnit !== null ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {}) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Alert, { children: "Reset Default Distance Units" })] }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Button, { onClick: () => { this.setState({ areaSidePopper: true }); }, children: "Add or Change Area Units" }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Label, { className: 'w-100 mt-2 mb-2', children: ["Default Area Units:", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Select, { title: 'Area Units', onChange: (e) => { this.handleDefaultArea(e.target.value); }, value: this.state.defaultAreaUnit, children: this.state.availableAreaUnits.map((unit, index) => {
                                                    return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Option, { value: index, children: unit.label + " (" + unit.abbreviation + ")" }, index));
                                                }) }), "Note: superscript numbers may not display correctly in this menu, but will work in application.", this.state.defaultAreaUnit !== null ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {}) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Alert, { children: "Reset Default Area Units" })] })] }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SettingRow, { label: 'Stop Drawing On Close', flow: 'wrap', children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Checkbox, { checked: this.props.config.turnOffOnClose, onChange: this.handleTurnOff }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: "This widget is in a Widget Controller and I want to stop drawing when I close it." })] }) })] }) }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SidePopper, { position: 'right', isOpen: this.state.linearSidePopper, toggle: () => { this.setState({ linearSidePopper: !this.state.linearSidePopper }); }, title: 'Change Linear Units', trigger: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", {}), children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Alert, { children: "The Default Linear Unit must be reset after changes in this panel." }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_unitMaker__WEBPACK_IMPORTED_MODULE_6__["default"], { allUnits: this.state.availableDistanceUnits, handleAddUnit: this.handleAddUnit, type: 'linear' }), userDistances && userDistances.length > 0 ?
                            (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("hr", {}), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { children: "Edit Units" })] })
                            : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {}), userDistances && userDistances.map((oldUnit, index) => {
                            return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_unitMaker__WEBPACK_IMPORTED_MODULE_6__["default"], { allUnits: this.state.availableDistanceUnits, handleChangeUnit: this.handleChangeUnit, type: 'linear', oldUnit: oldUnit, handleDeleteUnit: this.handleDeleteUnit }, index);
                        })] }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_4__.SidePopper, { position: 'right', isOpen: this.state.areaSidePopper, toggle: () => { this.setState({ areaSidePopper: !this.state.areaSidePopper }); }, title: 'Change Area Units', trigger: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", {}), children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui__WEBPACK_IMPORTED_MODULE_5__.Alert, { children: "The Default Area Unit must be reset after changes in this panel." }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_unitMaker__WEBPACK_IMPORTED_MODULE_6__["default"], { allUnits: this.state.availableAreaUnits, handleAddUnit: this.handleAddUnit, type: 'area' }), userAreas && userAreas.length > 0 ?
                            (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("hr", {}), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { children: "Edit Units" })] })
                            : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {}), userAreas && userAreas.map((oldUnit, index) => {
                            return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_unitMaker__WEBPACK_IMPORTED_MODULE_6__["default"], { allUnits: this.state.availableAreaUnits, handleChangeUnit: this.handleChangeUnit, type: 'area', oldUnit: oldUnit, handleDeleteUnit: this.handleDeleteUnit }, index);
                        })] })] }));
    }
}
function __set_webpack_public_path__(url) { __webpack_require__.p = url; }

})();

/******/ 	return __webpack_exports__;
/******/ })()

			);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9kcmF3LWFkdmFuY2VkL2Rpc3Qvc2V0dGluZy9zZXR0aW5nLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCQSxJQUFZLFFBSVg7QUFKRCxXQUFZLFFBQVE7SUFDbEIsNkJBQWlCO0lBQ2pCLHFDQUF5QjtJQUN6Qiw2QkFBaUI7QUFDbkIsQ0FBQyxFQUpXLFFBQVEsS0FBUixRQUFRLFFBSW5COzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzFCZ0M7QUFDaUQ7QUFFbEYsTUFBTSxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUMsR0FBRyw0Q0FBSztBQUVuQyxNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFO0lBQ3hCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRO0lBQy9CLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJO0lBQ3ZCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPO0lBRTdCLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLEtBQUksRUFBRSxDQUFDO0lBQ3JELE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxLQUFLLEtBQUksRUFBRSxDQUFDO0lBQ3hELE1BQU0sQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxZQUFZLEtBQUksRUFBRSxDQUFDO0lBQzdFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxVQUFVLEtBQUksQ0FBQyxDQUFDO0lBQ3RFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsV0FB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QUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsSUFBaEssS0FBSyxDQUF5Szt3QkFDek0sQ0FBQyxDQUFDLElBQ08sSUFDWCxDQUNUO0lBQ0wsQ0FBQztDQUNKO0FBQ08sU0FBUywyQkFBMkIsQ0FBQyxHQUFHLElBQUkscUJBQXVCLEdBQUcsR0FBRyxFQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvZHJhdy1hZHZhbmNlZC9zcmMvY29uZmlnLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9kcmF3LWFkdmFuY2VkL3NyYy9zZXR0aW5nL2NvbXBvbmVudHMvdW5pdE1ha2VyLnRzeCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvZHJhdy1hZHZhbmNlZC9zcmMvc2V0dGluZy90cmFuc2xhdGlvbnMvZGVmYXVsdC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtY29yZS9lbW90aW9uXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmVcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtdWlcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtdWkvYWR2YW5jZWQvc2V0dGluZy1jb21wb25lbnRzXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9kcmF3LWFkdmFuY2VkL3NyYy9zZXR0aW5nL3NldHRpbmcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEltbXV0YWJsZU9iamVjdCB9IGZyb20gJ3NlYW1sZXNzLWltbXV0YWJsZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XHJcbiAgY3JlYXRpb25Nb2RlOiBEcmF3TW9kZTtcclxuICAgIHR1cm5PZmZPbkNsb3NlOiBib29sZWFuO1xyXG4gICAgY2hhbmdlVGl0bGU6IGJvb2xlYW47XHJcbiAgICBkaXN0YW5jZVVuaXRzPzogQXJyYXk8eyB1bml0OiBzdHJpbmcgfT4gLy8g4pyFIEZJWEVEXHJcbiAgICBhcmVhVW5pdHM/OiBBcnJheTx7IHVuaXQ6IHN0cmluZyB9PiAvLyDinIUgRklYRURcclxuICAgIHJhZGl1c1VuaXRzPzogQXJyYXk8eyB1bml0OiBzdHJpbmcgfT4gLy8g4pyFIEZJWEVEXHJcbiAgICBtZWFzdXJlUG9pbnRMYWJlbD86IHN0cmluZ1xyXG4gICAgbWVhc3VyZVBvbHlsaW5lTGFiZWw/OiBzdHJpbmdcclxuICAgIG1lYXN1cmVQb2x5Z29uTGFiZWw/OiBzdHJpbmdcclxuICAgIG1lYXN1cmVDaXJjbGVMYWJlbD86IHN0cmluZ1xyXG4gICAgdGl0bGU6IHN0cmluZ1xyXG4gICAgbGlzdE1vZGU6IGJvb2xlYW5cclxuICAgIGNoYW5nZUxpc3RNb2RlOiBib29sZWFuXHJcbiAgICB1c2VyRGlzdGFuY2VzOiBbT2JqZWN0XVxyXG4gICAgZGVmYXVsdERpc3RhbmNlOiBudW1iZXJcclxuICAgIHVzZXJBcmVhczogW09iamVjdF1cclxuICAgIGRlZmF1bHRBcmVhOiBudW1iZXJcclxufVxyXG5cclxuZXhwb3J0IGVudW0gRHJhd01vZGV7XHJcbiAgU0lOR0xFID0gJ3NpbmdsZScsXHJcbiAgQ09OVElOVU9VUyA9ICdjb250aW51b3VzJyxcclxuICBVUERBVEUgPSAndXBkYXRlJ1xyXG59XHJcblxyXG5leHBvcnQgdHlwZSBJTUNvbmZpZyA9IEltbXV0YWJsZU9iamVjdDxDb25maWc+O1xyXG4iLCJpbXBvcnQgeyBSZWFjdCB9IGZyb20gJ2ppbXUtY29yZSdcclxuaW1wb3J0IHsgVGV4dElucHV0LCBOdW1lcmljSW5wdXQsIExhYmVsLCBCdXR0b24sIENvbGxhcHNhYmxlUGFuZWwgfSBmcm9tICdqaW11LXVpJ1xyXG5cclxuY29uc3Qge3VzZVN0YXRlLCB1c2VFZmZlY3R9ID0gUmVhY3RcclxuXHJcbmNvbnN0IFVuaXRNYWtlciA9IChwcm9wcykgPT4ge1xyXG4gICAgY29uc3QgYWxsVW5pdHMgPSBwcm9wcy5hbGxVbml0c1xyXG4gICAgY29uc3QgdHlwZSA9IHByb3BzLnR5cGVcclxuICAgIGNvbnN0IG9sZFVuaXQgPSBwcm9wcy5vbGRVbml0XHJcblxyXG4gICAgY29uc3QgW3VuaXQsIHNldFVuaXRdID0gdXNlU3RhdGUob2xkVW5pdD8udW5pdCB8fCAnJylcclxuICAgIGNvbnN0IFtsYWJlbCwgc2V0TGFiZWxdID0gdXNlU3RhdGUob2xkVW5pdD8ubGFiZWwgfHwgJycpXHJcbiAgICBjb25zdCBbYWJicmV2aWF0aW9uLCBzZXRBYmJyZXZpYXRpb25dID0gdXNlU3RhdGUob2xkVW5pdD8uYWJicmV2aWF0aW9uIHx8ICcnKVxyXG4gICAgY29uc3QgW2NvbnZlcnNpb24sIHNldENvbnZlcnNpb25dID0gdXNlU3RhdGUob2xkVW5pdD8uY29udmVyc2lvbiB8fCAxKVxyXG4gICAgY29uc3QgW2FsbFZhbGlkLCBzZXRBbGxWYWxpZF0gPSB1c2VTdGF0ZShmYWxzZSlcclxuICAgIGNvbnN0IFt2YWxpZGl0eVRleHQsIHNldFZhbGlkaXR5VGV4dF0gPSB1c2VTdGF0ZSgnJylcclxuXHJcbiAgICAvL2NoZWNrcyB1bml0IGZvciB2YWxpZGl0eVxyXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgICAgICBsZXQgdmFsaWQgPSB0cnVlXHJcbiAgICAgICAgbGV0IHRleHQgPSAnJ1xyXG4gICAgICAgIGNvbnN0IGxldHRlcnMgPSAvXlthLXpBLVpdKyQvLnRlc3QodW5pdClcclxuICAgICAgICBpZiAodW5pdCA9PT0gJycgfHwgbGFiZWwgPT09ICcnIHx8IGFiYnJldmlhdGlvbiA9PT0gJycpIHtcclxuICAgICAgICAgICAgdmFsaWQgPSBmYWxzZVxyXG4gICAgICAgICAgICB0ZXh0ID0gJ1JlcXVpcmVkIEZpZWxkIE1pc3NpbmcnXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghY29udmVyc2lvbikge1xyXG4gICAgICAgICAgICB2YWxpZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRleHQgPSAnSW52YWxpZCBDb252ZXJzaW9uIEZhY3RvcidcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFsZXR0ZXJzKSB7XHJcbiAgICAgICAgICAgIHZhbGlkID0gZmFsc2VcclxuICAgICAgICAgICAgdGV4dCA9ICdOYW1lIE1heSBPbmx5IENvbnRhaW4gTGV0dGVycydcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxVbml0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodW5pdCA9PT0gYWxsVW5pdHNbaV0udW5pdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9sZFVuaXQgJiYgb2xkVW5pdC51bml0ID09PSB1bml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pbnRlbnRpb25hbGx5IGJsYW5rXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSAnTmFtZSBNdXN0IEJlIFVuaXF1ZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRBbGxWYWxpZCh2YWxpZClcclxuICAgICAgICBzZXRWYWxpZGl0eVRleHQodGV4dClcclxuICAgIH0sIFt1bml0LCBsYWJlbCwgYWJicmV2aWF0aW9uLCBjb252ZXJzaW9uXSlcclxuXHJcbiAgICByZXR1cm4gPENvbGxhcHNhYmxlUGFuZWxcclxuICAgICAgICBkZWZhdWx0SXNPcGVuPXshb2xkVW5pdH1cclxuICAgICAgICBsYWJlbD17b2xkVW5pdCA/IGBFZGl0L0RlbGV0ZSAtICR7bGFiZWx9YCA6ICdDcmVhdGUgTmV3IFVuaXQnfVxyXG4gICAgICAgIHR5cGU9e29sZFVuaXQgPyAncHJpbWFyeScgOiAnZGVmYXVsdCd9XHJcbiAgICAgICAgY2xhc3NOYW1lPSdtYi0yJ1xyXG4gICAgPlxyXG4gICAgICAgIDxMYWJlbFxyXG4gICAgICAgICAgICBjbGFzc05hbWU9J3ctMTAwJ1xyXG4gICAgICAgID5cclxuICAgICAgICAgICAge3Byb3BzLmhhbmRsZUNoYW5nZVVuaXQgPyAnTmFtZSAoQ2Fubm90IGJlIGNoYW5nZWQpOicgOiAnTmFtZSAoTXVzdCBiZSB1bmlxdWUsIGxldHRlcnMgb25seSk6J31cclxuICAgICAgICAgICAgPFRleHRJbnB1dFxyXG4gICAgICAgICAgICAgICAgYWxsb3dDbGVhcj17IXByb3BzLmhhbmRsZUNoYW5nZVVuaXR9XHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZFxyXG4gICAgICAgICAgICAgICAgdHlwZT0ndGV4dCdcclxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0VW5pdChlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU9e3VuaXR9XHJcbiAgICAgICAgICAgICAgICByZWFkT25seT17cHJvcHMuaGFuZGxlQ2hhbmdlVW5pdH1cclxuICAgICAgICAgICAgLz5cclxuICAgICAgICA8L0xhYmVsPlxyXG4gICAgICAgIDxMYWJlbFxyXG4gICAgICAgICAgICBjbGFzc05hbWU9J3ctMTAwJ1xyXG4gICAgICAgID5cclxuICAgICAgICAgICAgTGFiZWwgKEZ1bGwgbmFtZSB1c2VkIGluIG1lbnVzKTpcclxuICAgICAgICAgICAgPFRleHRJbnB1dFxyXG4gICAgICAgICAgICAgICAgYWxsb3dDbGVhclxyXG4gICAgICAgICAgICAgICAgcmVxdWlyZWRcclxuICAgICAgICAgICAgICAgIHR5cGU9J3RleHQnXHJcbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldExhYmVsKGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT17bGFiZWx9XHJcbiAgICAgICAgICAgIC8+XHJcbiAgICAgICAgPC9MYWJlbD5cclxuICAgICAgICA8TGFiZWxcclxuICAgICAgICAgICAgY2xhc3NOYW1lPSd3LTEwMCdcclxuICAgICAgICA+XHJcbiAgICAgICAgICAgIEFiYnJldmlhdGlvbiAoVXNlZCBvbiBtYXApOlxyXG4gICAgICAgICAgICA8VGV4dElucHV0XHJcbiAgICAgICAgICAgICAgICBhbGxvd0NsZWFyXHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZFxyXG4gICAgICAgICAgICAgICAgdHlwZT0ndGV4dCdcclxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0QWJicmV2aWF0aW9uKGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT17YWJicmV2aWF0aW9ufVxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgIDwvTGFiZWw+XHJcbiAgICAgICAgPExhYmVsXHJcbiAgICAgICAgICAgIGNsYXNzTmFtZT0ndy0xMDAnXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgICB7dHlwZSA9PT0gJ2xpbmVhcicgPyAnQ29udmVyc2lvbiBGYWN0b3IgKE9uZSBtZXRlciBpcyBob3cgbWFueSBvZiB5b3VyIHVuaXQ/KTonIDogJ0NvbnZlcnNpb24gRmFjdG9yIChPbmUgc3F1YXJlIG1ldGVyIGlzIGhvdyBtYW55IG9mIHlvdXIgdW5pdD8pOid9XHJcbiAgICAgICAgICAgIDxOdW1lcmljSW5wdXRcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0ndy0xMDAnXHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPXtjb252ZXJzaW9ufVxyXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRDb252ZXJzaW9uKGUpfVxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgIDwvTGFiZWw+XHJcbiAgICAgICAge2FsbFZhbGlkID9cclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxoNj57dHlwZSA9PT0gJ2xpbmVhcicgPyBgMSBtZXRlciA9ICR7Y29udmVyc2lvbn0gJHtsYWJlbH0gKCR7YWJicmV2aWF0aW9ufSlgIDogYDEgc3F1YXJlIG1ldGVyID0gJHtjb252ZXJzaW9ufSAke2xhYmVsfSAoJHthYmJyZXZpYXRpb259KWB9PC9oNj5cclxuICAgICAgICAgICAgICAgIDxCdXR0b25cclxuICAgICAgICAgICAgICAgICAgICBibG9ja1xyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHByb3BzLmhhbmRsZUFkZFVuaXQgPyBwcm9wcy5oYW5kbGVBZGRVbml0KHsgdW5pdCwgbGFiZWwsIGFiYnJldmlhdGlvbiwgY29udmVyc2lvbiB9LCB0eXBlKSA6IHByb3BzLmhhbmRsZUNoYW5nZVVuaXQoeyB1bml0LCBsYWJlbCwgYWJicmV2aWF0aW9uLCBjb252ZXJzaW9uIH0sIHR5cGUpfVxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIFNhdmUgVW5pdFxyXG4gICAgICAgICAgICAgICAgPC9CdXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA6IDxoNj57dmFsaWRpdHlUZXh0fTwvaDY+fVxyXG4gICAgICAgIHtwcm9wcy5oYW5kbGVEZWxldGVVbml0PyBcclxuICAgICAgICAgICAgPEJ1dHRvblxyXG4gICAgICAgICAgICAgICAgYmxvY2tcclxuICAgICAgICAgICAgICAgIHR5cGU9J2RhbmdlcidcclxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHByb3BzLmhhbmRsZURlbGV0ZVVuaXQodW5pdCwgdHlwZSl9XHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIERlbGV0ZSBVbml0XHJcbiAgICAgICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgICAgICA6IDw+PC8+XHJcbiAgICAgICAgfVxyXG4gICAgPC9Db2xsYXBzYWJsZVBhbmVsPlxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBVbml0TWFrZXIiLCIvKipcbiAgTGljZW5zaW5nXG5cbiAgQ29weXJpZ2h0IDIwMjAgRXNyaVxuXG4gIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IFlvdVxuICBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heVxuICBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3JcbiAgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nXG4gIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuICBBIGNvcHkgb2YgdGhlIGxpY2Vuc2UgaXMgYXZhaWxhYmxlIGluIHRoZSByZXBvc2l0b3J5J3NcbiAgTElDRU5TRSBmaWxlLlxuKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc2VsZWN0TWFwV2lkZ2V0OiAnU2VsZWN0IGEgTWFwIHdpZGdldCcsXG4gIHNvdXJjZUxhYmVsOiAnU291cmNlIExhYmVsJyxcbiAgc2VsZWN0RHJhd01vZGU6ICdTZWxlY3QgRHJhdyBNb2RlJyxcbiAgZHJhd01vZGVTaW5nbGU6ICdTaW5nbGUnLFxuICBkcmF3TW9kZUNvbnRpbnVvdXM6ICdDb250aW51b3VzJyxcbiAgZHJhd01vZGVVcGRhdGU6ICdVcGRhdGUnXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfX2Vtb3Rpb25fcmVhY3RfanN4X3J1bnRpbWVfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfdWlfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV91aV9hZHZhbmNlZF9zZXR0aW5nX2NvbXBvbmVudHNfXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCJpbXBvcnQgeyBSZWFjdCwgZGVmYXVsdE1lc3NhZ2VzIGFzIGppbXVDb3JlTWVzc2FnZXMsIH0gZnJvbSAnamltdS1jb3JlJztcclxuaW1wb3J0IHsgQWxsV2lkZ2V0U2V0dGluZ1Byb3BzIH0gZnJvbSAnamltdS1mb3ItYnVpbGRlcic7XHJcbmltcG9ydCB7IElNQ29uZmlnLCBEcmF3TW9kZSB9IGZyb20gJy4uL2NvbmZpZyc7XHJcbmltcG9ydCBkZWZhdWx0TWVzc2FnZXMgZnJvbSAnLi90cmFuc2xhdGlvbnMvZGVmYXVsdCc7XHJcbmltcG9ydCB7IE1hcFdpZGdldFNlbGVjdG9yLCBTZXR0aW5nU2VjdGlvbiwgU2V0dGluZ1JvdyB9IGZyb20gJ2ppbXUtdWkvYWR2YW5jZWQvc2V0dGluZy1jb21wb25lbnRzJztcclxuaW1wb3J0IHsgU2VsZWN0LCBPcHRpb24sIGRlZmF1bHRNZXNzYWdlcyBhcyBqaW11VUlEZWZhdWx0TWVzc2FnZXMsIENoZWNrYm94LCBUZXh0SW5wdXQsIExhYmVsLCBCdXR0b24sIEFsZXJ0IH0gZnJvbSAnamltdS11aSdcclxuaW1wb3J0IHsgU2lkZVBvcHBlciB9IGZyb20gJ2ppbXUtdWkvYWR2YW5jZWQvc2V0dGluZy1jb21wb25lbnRzJ1xyXG5pbXBvcnQgVW5pdE1ha2VyIGZyb20gJy4vY29tcG9uZW50cy91bml0TWFrZXInO1xyXG5cclxuLy8gRGVmaW5lIHByb3BlciB0eXBlcyBmb3IgdW5pdHNcclxuaW50ZXJmYWNlIFVuaXQge1xyXG4gICAgdW5pdDogc3RyaW5nO1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIGFiYnJldmlhdGlvbjogc3RyaW5nO1xyXG4gICAgY29udmVyc2lvbjogbnVtYmVyO1xyXG59XHJcblxyXG5jb25zdCBkZWZhdWx0RGlzdGFuY2VVbml0czogVW5pdFtdID0gW1xyXG4gICAgeyB1bml0OiAna2lsb21ldGVycycsIGxhYmVsOiAnS2lsb21ldGVycycsIGFiYnJldmlhdGlvbjogJ2ttJywgY29udmVyc2lvbjogMC4wMDEgfSxcclxuICAgIHsgdW5pdDogJ21pbGVzJywgbGFiZWw6ICdNaWxlcycsIGFiYnJldmlhdGlvbjogJ21pJywgY29udmVyc2lvbjogMC4wMDA2MjEzNzEgfSxcclxuICAgIHsgdW5pdDogJ21ldGVycycsIGxhYmVsOiAnTWV0ZXJzJywgYWJicmV2aWF0aW9uOiAnbScsIGNvbnZlcnNpb246IDEgfSxcclxuICAgIHsgdW5pdDogJ25hdXRpY2FsLW1pbGVzJywgbGFiZWw6ICdOYXV0aWNhbCBNaWxlcycsIGFiYnJldmlhdGlvbjogJ05NJywgY29udmVyc2lvbjogMC4wMDA1Mzk5NTcgfSxcclxuICAgIHsgdW5pdDogJ2ZlZXQnLCBsYWJlbDogJ0ZlZXQnLCBhYmJyZXZpYXRpb246ICdmdCcsIGNvbnZlcnNpb246IDMuMjgwODQgfSxcclxuICAgIHsgdW5pdDogJ3lhcmRzJywgbGFiZWw6ICdZYXJkcycsIGFiYnJldmlhdGlvbjogJ3lkJywgY29udmVyc2lvbjogMS4wOTM2MSB9XHJcbl07XHJcblxyXG5jb25zdCBkZWZhdWx0QXJlYVVuaXRzOiBVbml0W10gPSBbXHJcbiAgICB7IHVuaXQ6ICdzcXVhcmUta2lsb21ldGVycycsIGxhYmVsOiAnU3F1YXJlIEtpbG9tZXRlcnMnLCBhYmJyZXZpYXRpb246ICdrbe+/vScsIGNvbnZlcnNpb246IDAuMDAwMDAxIH0sXHJcbiAgICB7IHVuaXQ6ICdzcXVhcmUtbWlsZXMnLCBsYWJlbDogJ1NxdWFyZSBNaWxlcycsIGFiYnJldmlhdGlvbjogJ21p77+9JywgY29udmVyc2lvbjogMy44NjEwMmUtNyB9LFxyXG4gICAgeyB1bml0OiAnYWNyZXMnLCBsYWJlbDogJ0FjcmVzJywgYWJicmV2aWF0aW9uOiAnYWMnLCBjb252ZXJzaW9uOiAwLjAwMDI0NzEwNSB9LFxyXG4gICAgeyB1bml0OiAnaGVjdGFyZXMnLCBsYWJlbDogJ0hlY3RhcmVzJywgYWJicmV2aWF0aW9uOiAnaGEnLCBjb252ZXJzaW9uOiAwLjAwMDEgfSxcclxuICAgIHsgdW5pdDogJ3NxdWFyZS1tZXRlcnMnLCBsYWJlbDogJ1NxdWFyZSBNZXRlcnMnLCBhYmJyZXZpYXRpb246ICdt77+9JywgY29udmVyc2lvbjogMSB9LFxyXG4gICAgeyB1bml0OiAnc3F1YXJlLWZlZXQnLCBsYWJlbDogJ1NxdWFyZSBGZWV0JywgYWJicmV2aWF0aW9uOiAnZnTvv70nLCBjb252ZXJzaW9uOiAxMC43NjM5IH0sXHJcbiAgICB7IHVuaXQ6ICdzcXVhcmUteWFyZHMnLCBsYWJlbDogJ1NxdWFyZSBZYXJkcycsIGFiYnJldmlhdGlvbjogJ3lk77+9JywgY29udmVyc2lvbjogMS4xOTU5OSB9XHJcbl07XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2V0dGluZyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8QWxsV2lkZ2V0U2V0dGluZ1Byb3BzPElNQ29uZmlnPiwgYW55PntcclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIocHJvcHMpXHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIGxpbmVhclNpZGVQb3BwZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICBhcmVhU2lkZVBvcHBlcjogZmFsc2UsXHJcbiAgICAgICAgICAgIGRlZmF1bHREaXN0YW5jZVVuaXQ6IHRoaXMucHJvcHMuY29uZmlnLmRlZmF1bHREaXN0YW5jZSxcclxuICAgICAgICAgICAgZGVmYXVsdEFyZWFVbml0OiB0aGlzLnByb3BzLmNvbmZpZy5kZWZhdWx0QXJlYSxcclxuICAgICAgICAgICAgYXZhaWxhYmxlRGlzdGFuY2VVbml0czogWy4uLmRlZmF1bHREaXN0YW5jZVVuaXRzLCAuLi4odGhpcy5wcm9wcy5jb25maWcudXNlckRpc3RhbmNlcz8uYXNNdXRhYmxlPy4oKSB8fCB0aGlzLnByb3BzLmNvbmZpZy51c2VyRGlzdGFuY2VzIHx8IFtdKV0sXHJcbiAgICAgICAgICAgIGF2YWlsYWJsZUFyZWFVbml0czogWy4uLmRlZmF1bHRBcmVhVW5pdHMsIC4uLih0aGlzLnByb3BzLmNvbmZpZy51c2VyQXJlYXM/LmFzTXV0YWJsZT8uKCkgfHwgdGhpcy5wcm9wcy5jb25maWcudXNlckFyZWFzIHx8IFtdKV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25Qcm9wZXJ0eUNoYW5nZSA9IChuYW1lLCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHsgY29uZmlnIH0gPSB0aGlzLnByb3BzXHJcbiAgICAgICAgaWYgKHZhbHVlID09PSBjb25maWdbbmFtZV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ld0NvbmZpZyA9IGNvbmZpZy5zZXQobmFtZSwgdmFsdWUpXHJcbiAgICAgICAgY29uc3QgYWx0ZXJQcm9wcyA9IHtcclxuICAgICAgICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXHJcbiAgICAgICAgICAgIGNvbmZpZzogbmV3Q29uZmlnXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucHJvcHMub25TZXR0aW5nQ2hhbmdlKGFsdGVyUHJvcHMpXHJcbiAgICB9XHJcblxyXG4gICAgb25NYXBXaWRnZXRTZWxlY3RlZCA9ICh1c2VNYXBXaWRnZXRzSWQ6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5vblNldHRpbmdDaGFuZ2Uoe1xyXG4gICAgICAgICAgICBpZDogdGhpcy5wcm9wcy5pZCxcclxuICAgICAgICAgICAgdXNlTWFwV2lkZ2V0SWRzOiB1c2VNYXBXaWRnZXRzSWRcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVEcmF3TW9kZUNoYW5nZSA9IChldnQpID0+IHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGV2dD8udGFyZ2V0Py52YWx1ZVxyXG4gICAgICAgIHRoaXMub25Qcm9wZXJ0eUNoYW5nZSgnY3JlYXRpb25Nb2RlJywgdmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVHVybk9mZiA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnByb3BzLm9uU2V0dGluZ0NoYW5nZSh7XHJcbiAgICAgICAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxyXG4gICAgICAgICAgICBjb25maWc6IHRoaXMucHJvcHMuY29uZmlnLnNldCgndHVybk9mZk9uQ2xvc2UnLCAhdGhpcy5wcm9wcy5jb25maWcudHVybk9mZk9uQ2xvc2UpXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVDaGFuZ2VUaXRsZSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnByb3BzLm9uU2V0dGluZ0NoYW5nZSh7XHJcbiAgICAgICAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxyXG4gICAgICAgICAgICBjb25maWc6IHRoaXMucHJvcHMuY29uZmlnLnNldCgnY2hhbmdlVGl0bGUnLCAhdGhpcy5wcm9wcy5jb25maWcuY2hhbmdlVGl0bGUpXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVDaGFuZ2VMaXN0TW9kZSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnByb3BzLm9uU2V0dGluZ0NoYW5nZSh7XHJcbiAgICAgICAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxyXG4gICAgICAgICAgICBjb25maWc6IHRoaXMucHJvcHMuY29uZmlnLnNldCgnY2hhbmdlTGlzdE1vZGUnLCAhdGhpcy5wcm9wcy5jb25maWcuY2hhbmdlTGlzdE1vZGUpXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVMaXN0TW9kZSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnByb3BzLm9uU2V0dGluZ0NoYW5nZSh7XHJcbiAgICAgICAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxyXG4gICAgICAgICAgICBjb25maWc6IHRoaXMucHJvcHMuY29uZmlnLnNldCgnbGlzdE1vZGUnLCAhdGhpcy5wcm9wcy5jb25maWcubGlzdE1vZGUpXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVUaXRsZSA9ICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIHRoaXMucHJvcHMub25TZXR0aW5nQ2hhbmdlKHtcclxuICAgICAgICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXHJcbiAgICAgICAgICAgIGNvbmZpZzogdGhpcy5wcm9wcy5jb25maWcuc2V0KCd0aXRsZScsIHZhbHVlKVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlRGVmYXVsdERpc3RhbmNlID0gKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5vblNldHRpbmdDaGFuZ2Uoe1xyXG4gICAgICAgICAgICBpZDogdGhpcy5wcm9wcy5pZCxcclxuICAgICAgICAgICAgY29uZmlnOiB0aGlzLnByb3BzLmNvbmZpZy5zZXQoJ2RlZmF1bHREaXN0YW5jZScsIHZhbHVlKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRlZmF1bHREaXN0YW5jZVVuaXQ6IHZhbHVlIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlRGVmYXVsdEFyZWEgPSAodmFsdWUpID0+IHtcclxuICAgICAgICB0aGlzLnByb3BzLm9uU2V0dGluZ0NoYW5nZSh7XHJcbiAgICAgICAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxyXG4gICAgICAgICAgICBjb25maWc6IHRoaXMucHJvcHMuY29uZmlnLnNldCgnZGVmYXVsdEFyZWEnLCB2YWx1ZSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkZWZhdWx0QXJlYVVuaXQ6IHZhbHVlIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQWRkVW5pdCA9IChuZXdVbml0OiBVbml0LCB0eXBlOiAnbGluZWFyJyB8ICdhcmVhJykgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlID09PSAnbGluZWFyJykge1xyXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHRvIG11dGFibGUgYXJyYXksIGFkZCBpdGVtLCB0aGVuIHNhdmVcclxuICAgICAgICAgICAgY29uc3QgdXNlckRpc3RhbmNlcyA9ICh0aGlzLnByb3BzLmNvbmZpZy51c2VyRGlzdGFuY2VzPy5hc011dGFibGU/LigpIHx8IFtdKSBhcyB1bmtub3duIGFzIFVuaXRbXVxyXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkRGlzdGFuY2VzID0gWy4uLnVzZXJEaXN0YW5jZXMsIG5ld1VuaXRdXHJcblxyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uU2V0dGluZ0NoYW5nZSh7XHJcbiAgICAgICAgICAgICAgICBpZDogdGhpcy5wcm9wcy5pZCxcclxuICAgICAgICAgICAgICAgIGNvbmZpZzogdGhpcy5wcm9wcy5jb25maWcuc2V0KCd1c2VyRGlzdGFuY2VzJywgdXBkYXRlZERpc3RhbmNlcylcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVEaXN0YW5jZVVuaXRzOiBbLi4uZGVmYXVsdERpc3RhbmNlVW5pdHMsIC4uLnVwZGF0ZWREaXN0YW5jZXNdLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdERpc3RhbmNlVW5pdDogbnVsbFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gbXV0YWJsZSBhcnJheSwgYWRkIGl0ZW0sIHRoZW4gc2F2ZVxyXG4gICAgICAgICAgICBjb25zdCB1c2VyQXJlYXMgPSAodGhpcy5wcm9wcy5jb25maWcudXNlckFyZWFzPy5hc011dGFibGU/LigpIHx8IFtdKSBhcyB1bmtub3duIGFzIFVuaXRbXVxyXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkQXJlYXMgPSBbLi4udXNlckFyZWFzLCBuZXdVbml0XVxyXG5cclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblNldHRpbmdDaGFuZ2Uoe1xyXG4gICAgICAgICAgICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXHJcbiAgICAgICAgICAgICAgICBjb25maWc6IHRoaXMucHJvcHMuY29uZmlnLnNldCgndXNlckFyZWFzJywgdXBkYXRlZEFyZWFzKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIGF2YWlsYWJsZUFyZWFVbml0czogWy4uLmRlZmF1bHRBcmVhVW5pdHMsIC4uLnVwZGF0ZWRBcmVhc10sXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0QXJlYVVuaXQ6IG51bGxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQ2hhbmdlVW5pdCA9IChuZXdVbml0OiBVbml0LCB0eXBlOiAnbGluZWFyJyB8ICdhcmVhJykgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlID09PSAnbGluZWFyJykge1xyXG4gICAgICAgICAgICBjb25zdCB1c2VyRGlzdGFuY2VzID0gKHRoaXMucHJvcHMuY29uZmlnLnVzZXJEaXN0YW5jZXM/LmFzTXV0YWJsZT8uKCkgfHwgW10pIGFzIHVua25vd24gYXMgVW5pdFtdXHJcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWREaXN0YW5jZXMgPSBbLi4udXNlckRpc3RhbmNlc11cclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSB1cGRhdGVkRGlzdGFuY2VzLmZpbmRJbmRleChleGlzdGluZyA9PiBleGlzdGluZy51bml0ID09PSBuZXdVbml0LnVuaXQpXHJcblxyXG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVkRGlzdGFuY2VzW2luZGV4XSA9IG5ld1VuaXRcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblNldHRpbmdDaGFuZ2Uoe1xyXG4gICAgICAgICAgICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXHJcbiAgICAgICAgICAgICAgICBjb25maWc6IHRoaXMucHJvcHMuY29uZmlnLnNldCgndXNlckRpc3RhbmNlcycsIHVwZGF0ZWREaXN0YW5jZXMpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlRGlzdGFuY2VVbml0czogWy4uLmRlZmF1bHREaXN0YW5jZVVuaXRzLCAuLi51cGRhdGVkRGlzdGFuY2VzXSxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHREaXN0YW5jZVVuaXQ6IG51bGxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCB1c2VyQXJlYXMgPSAodGhpcy5wcm9wcy5jb25maWcudXNlckFyZWFzPy5hc011dGFibGU/LigpIHx8IFtdKSBhcyB1bmtub3duIGFzIFVuaXRbXVxyXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkQXJlYXMgPSBbLi4udXNlckFyZWFzXVxyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHVwZGF0ZWRBcmVhcy5maW5kSW5kZXgoZXhpc3RpbmcgPT4gZXhpc3RpbmcudW5pdCA9PT0gbmV3VW5pdC51bml0KVxyXG5cclxuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlZEFyZWFzW2luZGV4XSA9IG5ld1VuaXRcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblNldHRpbmdDaGFuZ2Uoe1xyXG4gICAgICAgICAgICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXHJcbiAgICAgICAgICAgICAgICBjb25maWc6IHRoaXMucHJvcHMuY29uZmlnLnNldCgndXNlckFyZWFzJywgdXBkYXRlZEFyZWFzKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIGF2YWlsYWJsZUFyZWFVbml0czogWy4uLmRlZmF1bHRBcmVhVW5pdHMsIC4uLnVwZGF0ZWRBcmVhc10sXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0QXJlYVVuaXQ6IG51bGxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlRGVsZXRlVW5pdCA9IChuYW1lOiBzdHJpbmcsIHR5cGU6ICdsaW5lYXInIHwgJ2FyZWEnKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGUgPT09ICdsaW5lYXInKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVzZXJEaXN0YW5jZXMgPSAodGhpcy5wcm9wcy5jb25maWcudXNlckRpc3RhbmNlcz8uYXNNdXRhYmxlPy4oKSB8fCBbXSkgYXMgdW5rbm93biBhcyBVbml0W11cclxuICAgICAgICAgICAgY29uc3QgdXBkYXRlZERpc3RhbmNlcyA9IHVzZXJEaXN0YW5jZXMuZmlsdGVyKGV4aXN0aW5nID0+IGV4aXN0aW5nLnVuaXQgIT09IG5hbWUpXHJcblxyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uU2V0dGluZ0NoYW5nZSh7XHJcbiAgICAgICAgICAgICAgICBpZDogdGhpcy5wcm9wcy5pZCxcclxuICAgICAgICAgICAgICAgIGNvbmZpZzogdGhpcy5wcm9wcy5jb25maWcuc2V0KCd1c2VyRGlzdGFuY2VzJywgdXBkYXRlZERpc3RhbmNlcylcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVEaXN0YW5jZVVuaXRzOiBbLi4uZGVmYXVsdERpc3RhbmNlVW5pdHMsIC4uLnVwZGF0ZWREaXN0YW5jZXNdLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdERpc3RhbmNlVW5pdDogbnVsbFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVzZXJBcmVhcyA9ICh0aGlzLnByb3BzLmNvbmZpZy51c2VyQXJlYXM/LmFzTXV0YWJsZT8uKCkgfHwgW10pIGFzIHVua25vd24gYXMgVW5pdFtdXHJcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRBcmVhcyA9IHVzZXJBcmVhcy5maWx0ZXIoZXhpc3RpbmcgPT4gZXhpc3RpbmcudW5pdCAhPT0gbmFtZSlcclxuXHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25TZXR0aW5nQ2hhbmdlKHtcclxuICAgICAgICAgICAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxyXG4gICAgICAgICAgICAgICAgY29uZmlnOiB0aGlzLnByb3BzLmNvbmZpZy5zZXQoJ3VzZXJBcmVhcycsIHVwZGF0ZWRBcmVhcylcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVBcmVhVW5pdHM6IFsuLi5kZWZhdWx0QXJlYVVuaXRzLCAuLi51cGRhdGVkQXJlYXNdLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdEFyZWFVbml0OiBudWxsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvcm1hdE1lc3NhZ2UgPSAoaWQ6IHN0cmluZywgdmFsdWVzPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE1lc3NhZ2VzLCBqaW11VUlEZWZhdWx0TWVzc2FnZXMsIGppbXVDb3JlTWVzc2FnZXMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuaW50bC5mb3JtYXRNZXNzYWdlKHsgaWQ6IGlkLCBkZWZhdWx0TWVzc2FnZTogbWVzc2FnZXNbaWRdIH0sIHZhbHVlcylcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgY29uc3QgeyB1c2VNYXBXaWRnZXRJZHMsIGNvbmZpZyB9ID0gdGhpcy5wcm9wc1xyXG4gICAgICAgIGNvbnN0IHVzZXJEaXN0YW5jZXMgPSAoY29uZmlnLnVzZXJEaXN0YW5jZXM/LmFzTXV0YWJsZT8uKCkgfHwgY29uZmlnLnVzZXJEaXN0YW5jZXMgfHwgW10pIGFzIHVua25vd24gYXMgVW5pdFtdXHJcbiAgICAgICAgY29uc3QgdXNlckFyZWFzID0gKGNvbmZpZy51c2VyQXJlYXM/LmFzTXV0YWJsZT8uKCkgfHwgY29uZmlnLnVzZXJBcmVhcyB8fCBbXSkgYXMgdW5rbm93biBhcyBVbml0W11cclxuXHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2lkZ2V0LXNldHRpbmctcHNlYXJjaFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxTZXR0aW5nU2VjdGlvbiBjbGFzc05hbWU9XCJtYXAtc2VsZWN0b3Itc2VjdGlvblwiIHRpdGxlPXt0aGlzLnByb3BzLmludGwuZm9ybWF0TWVzc2FnZSh7IGlkOiAnc291cmNlTGFiZWwnLCBkZWZhdWx0TWVzc2FnZTogZGVmYXVsdE1lc3NhZ2VzLnNvdXJjZUxhYmVsIH0pfT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdSb3cgbGFiZWw9e3RoaXMuZm9ybWF0TWVzc2FnZSgnc2VsZWN0TWFwV2lkZ2V0Jyl9PjwvU2V0dGluZ1Jvdz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdSb3c+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TWFwV2lkZ2V0U2VsZWN0b3Igb25TZWxlY3Q9e3RoaXMub25NYXBXaWRnZXRTZWxlY3RlZH0gdXNlTWFwV2lkZ2V0SWRzPXt1c2VNYXBXaWRnZXRJZHN9IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvU2V0dGluZ1Jvdz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdSb3cgbGFiZWw9e3RoaXMuZm9ybWF0TWVzc2FnZSgnc2VsZWN0RHJhd01vZGUnKX0gZmxvdz0nd3JhcCc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8U2VsZWN0IHZhbHVlPXtjb25maWcuY3JlYXRpb25Nb2RlfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVEcmF3TW9kZUNoYW5nZX0gY2xhc3NOYW1lPSdkcm9wLWhlaWdodCc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT17RHJhd01vZGUuQ09OVElOVU9VU30+e3RoaXMuZm9ybWF0TWVzc2FnZSgnZHJhd01vZGVDb250aW51b3VzJyl9PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT17RHJhd01vZGUuU0lOR0xFfT57dGhpcy5mb3JtYXRNZXNzYWdlKCdkcmF3TW9kZVNpbmdsZScpfTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9TZWxlY3Q+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvU2V0dGluZ1Jvdz5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxTZXR0aW5nUm93IGxhYmVsPSdEcmF3IExheWVyIFNldHRpbmdzJyBmbG93PSd3cmFwJz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMYWJlbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0ndy0xMDAgbXQtMiBtYi0yJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIERyYXcgTGF5ZXIgTmFtZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGV4dElucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9J3RleHQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT0nRHJhd24gR3JhcGhpY3MnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gdGhpcy5oYW5kbGVUaXRsZShlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvTGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDaGVja2JveCBjaGVja2VkPXt0aGlzLnByb3BzLmNvbmZpZy5jaGFuZ2VUaXRsZX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlVGl0bGV9IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+QWxsb3cgVXNlcnMgVG8gQ2hhbmdlIERyYXcgTGF5ZXIgTmFtZTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q2hlY2tib3ggY2hlY2tlZD17dGhpcy5wcm9wcy5jb25maWcubGlzdE1vZGV9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUxpc3RNb2RlfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlNob3cgSW4gTWFwIExheWVyIExpc3Q8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENoZWNrYm94IGNoZWNrZWQ9e3RoaXMucHJvcHMuY29uZmlnLmNoYW5nZUxpc3RNb2RlfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVDaGFuZ2VMaXN0TW9kZX0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5BbGxvdyBVc2VycyBUbyBTaG93L0hpZGUgSW4gTWFwIExheWVyIExpc3Q8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9TZXR0aW5nUm93PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8U2V0dGluZ1JvdyBsYWJlbD0nTWVhc3VyZW1lbnQgU2V0dGluZ3MnIGZsb3c9J3dyYXAnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMuc2V0U3RhdGUoeyBsaW5lYXJTaWRlUG9wcGVyOiB0cnVlIH0pfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZCBvciBDaGFuZ2UgTGluZWFyIFVuaXRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMYWJlbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0ndy0xMDAgbXQtMiBtYi0yJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIERlZmF1bHQgTGluZWFyIFVuaXQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFNlbGVjdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT0nTGluZWFyIFVuaXRzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHRoaXMuaGFuZGxlRGVmYXVsdERpc3RhbmNlKGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuZGVmYXVsdERpc3RhbmNlVW5pdH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmF2YWlsYWJsZURpc3RhbmNlVW5pdHMubWFwKCh1bml0LCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8T3B0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17aW5kZXh9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtpbmRleH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt1bml0LmxhYmVsICsgXCIgKFwiICsgdW5pdC5hYmJyZXZpYXRpb24gKyBcIilcIn1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L09wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9TZWxlY3Q+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuZGVmYXVsdERpc3RhbmNlVW5pdCAhPT0gbnVsbCA/IDw+PC8+IDogPEFsZXJ0PlJlc2V0IERlZmF1bHQgRGlzdGFuY2UgVW5pdHM8L0FsZXJ0Pn1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvTGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4geyB0aGlzLnNldFN0YXRlKHsgYXJlYVNpZGVQb3BwZXI6IHRydWUgfSkgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGQgb3IgQ2hhbmdlIEFyZWEgVW5pdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPExhYmVsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSd3LTEwMCBtdC0yIG1iLTInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGVmYXVsdCBBcmVhIFVuaXRzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTZWxlY3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9J0FyZWEgVW5pdHMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4geyB0aGlzLmhhbmRsZURlZmF1bHRBcmVhKGUudGFyZ2V0LnZhbHVlKSB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5kZWZhdWx0QXJlYVVuaXR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5hdmFpbGFibGVBcmVhVW5pdHMubWFwKCh1bml0LCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8T3B0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17aW5kZXh9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtpbmRleH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt1bml0LmxhYmVsICsgXCIgKFwiICsgdW5pdC5hYmJyZXZpYXRpb24gKyBcIilcIn1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L09wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9TZWxlY3Q+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZTogc3VwZXJzY3JpcHQgbnVtYmVycyBtYXkgbm90IGRpc3BsYXkgY29ycmVjdGx5IGluIHRoaXMgbWVudSwgYnV0IHdpbGwgd29yayBpbiBhcHBsaWNhdGlvbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5kZWZhdWx0QXJlYVVuaXQgIT09IG51bGwgPyA8PjwvPiA6IDxBbGVydD5SZXNldCBEZWZhdWx0IEFyZWEgVW5pdHM8L0FsZXJ0Pn1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvTGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvU2V0dGluZ1Jvdz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdSb3cgbGFiZWw9J1N0b3AgRHJhd2luZyBPbiBDbG9zZScgZmxvdz0nd3JhcCc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDaGVja2JveCBjaGVja2VkPXt0aGlzLnByb3BzLmNvbmZpZy50dXJuT2ZmT25DbG9zZX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlVHVybk9mZn0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5UaGlzIHdpZGdldCBpcyBpbiBhIFdpZGdldCBDb250cm9sbGVyIGFuZCBJIHdhbnQgdG8gc3RvcCBkcmF3aW5nIHdoZW4gSSBjbG9zZSBpdC48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9TZXR0aW5nUm93PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvU2V0dGluZ1NlY3Rpb24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxTaWRlUG9wcGVyXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb249J3JpZ2h0J1xyXG4gICAgICAgICAgICAgICAgICAgIGlzT3Blbj17dGhpcy5zdGF0ZS5saW5lYXJTaWRlUG9wcGVyfVxyXG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZT17KCkgPT4geyB0aGlzLnNldFN0YXRlKHsgbGluZWFyU2lkZVBvcHBlcjogIXRoaXMuc3RhdGUubGluZWFyU2lkZVBvcHBlciB9KSB9fVxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPSdDaGFuZ2UgTGluZWFyIFVuaXRzJ1xyXG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXI9ezxzcGFuIC8+IGFzIGFueSBhcyBIVE1MRWxlbWVudH1cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8QWxlcnQ+VGhlIERlZmF1bHQgTGluZWFyIFVuaXQgbXVzdCBiZSByZXNldCBhZnRlciBjaGFuZ2VzIGluIHRoaXMgcGFuZWwuPC9BbGVydD5cclxuICAgICAgICAgICAgICAgICAgICA8VW5pdE1ha2VyIGFsbFVuaXRzPXt0aGlzLnN0YXRlLmF2YWlsYWJsZURpc3RhbmNlVW5pdHN9IGhhbmRsZUFkZFVuaXQ9e3RoaXMuaGFuZGxlQWRkVW5pdH0gdHlwZT17J2xpbmVhcid9PjwvVW5pdE1ha2VyPlxyXG4gICAgICAgICAgICAgICAgICAgIHt1c2VyRGlzdGFuY2VzICYmIHVzZXJEaXN0YW5jZXMubGVuZ3RoID4gMCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aHIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz5FZGl0IFVuaXRzPC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogPD48Lz5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAge3VzZXJEaXN0YW5jZXMgJiYgdXNlckRpc3RhbmNlcy5tYXAoKG9sZFVuaXQsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8VW5pdE1ha2VyIGtleT17aW5kZXh9IGFsbFVuaXRzPXt0aGlzLnN0YXRlLmF2YWlsYWJsZURpc3RhbmNlVW5pdHN9IGhhbmRsZUNoYW5nZVVuaXQ9e3RoaXMuaGFuZGxlQ2hhbmdlVW5pdH0gdHlwZT17J2xpbmVhcid9IG9sZFVuaXQ9e29sZFVuaXR9IGhhbmRsZURlbGV0ZVVuaXQ9e3RoaXMuaGFuZGxlRGVsZXRlVW5pdH0+PC9Vbml0TWFrZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgfSl9XHJcbiAgICAgICAgICAgICAgICA8L1NpZGVQb3BwZXI+XHJcbiAgICAgICAgICAgICAgICA8U2lkZVBvcHBlclxyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uPSdyaWdodCdcclxuICAgICAgICAgICAgICAgICAgICBpc09wZW49e3RoaXMuc3RhdGUuYXJlYVNpZGVQb3BwZXJ9XHJcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlPXsoKSA9PiB7IHRoaXMuc2V0U3RhdGUoeyBhcmVhU2lkZVBvcHBlcjogIXRoaXMuc3RhdGUuYXJlYVNpZGVQb3BwZXIgfSkgfX1cclxuICAgICAgICAgICAgICAgICAgICB0aXRsZT0nQ2hhbmdlIEFyZWEgVW5pdHMnXHJcbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dlcj17PHNwYW4gLz4gYXMgYW55IGFzIEhUTUxFbGVtZW50fVxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIDxBbGVydD5UaGUgRGVmYXVsdCBBcmVhIFVuaXQgbXVzdCBiZSByZXNldCBhZnRlciBjaGFuZ2VzIGluIHRoaXMgcGFuZWwuPC9BbGVydD5cclxuICAgICAgICAgICAgICAgICAgICA8VW5pdE1ha2VyIGFsbFVuaXRzPXt0aGlzLnN0YXRlLmF2YWlsYWJsZUFyZWFVbml0c30gaGFuZGxlQWRkVW5pdD17dGhpcy5oYW5kbGVBZGRVbml0fSB0eXBlPXsnYXJlYSd9PjwvVW5pdE1ha2VyPlxyXG4gICAgICAgICAgICAgICAgICAgIHt1c2VyQXJlYXMgJiYgdXNlckFyZWFzLmxlbmd0aCA+IDAgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGhyIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+RWRpdCBVbml0czwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IDw+PC8+XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHt1c2VyQXJlYXMgJiYgdXNlckFyZWFzLm1hcCgob2xkVW5pdCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxVbml0TWFrZXIga2V5PXtpbmRleH0gYWxsVW5pdHM9e3RoaXMuc3RhdGUuYXZhaWxhYmxlQXJlYVVuaXRzfSBoYW5kbGVDaGFuZ2VVbml0PXt0aGlzLmhhbmRsZUNoYW5nZVVuaXR9IHR5cGU9eydhcmVhJ30gb2xkVW5pdD17b2xkVW5pdH0gaGFuZGxlRGVsZXRlVW5pdD17dGhpcy5oYW5kbGVEZWxldGVVbml0fT48L1VuaXRNYWtlcj5cclxuICAgICAgICAgICAgICAgICAgICB9KX1cclxuICAgICAgICAgICAgICAgIDwvU2lkZVBvcHBlcj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG59XG4gZXhwb3J0IGZ1bmN0aW9uIF9fc2V0X3dlYnBhY2tfcHVibGljX3BhdGhfXyh1cmwpIHsgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB1cmwgfSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==