"use strict";
/**
 * Test use script to download an app.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var app_download_1 = require("../../src/middlewares/dev/apps/app-download");
/**
 * use config modifier
 */
(0, app_download_1.zipApp)('15', 'server/temp/test-app-15-config-modifier2.zip', 'clientId1', { configModifier: {
        'attributes.portalUrl': 'https://esridevbeijing.maps.arcgis.com'
    } });
