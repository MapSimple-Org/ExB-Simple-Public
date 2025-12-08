"use strict";
/**
 * Test use script to download an app.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var app_download_1 = require("../../src/middlewares/dev/apps/app-download");
/**
 * set locales
 */
(0, app_download_1.zipApp)('15', 'server/temp/test-app-15-locale.zip', 'clientId1', { locales: ['en', 'zh-cn'] });
