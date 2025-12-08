/**
 * This script demos how to use script to download an app.
 */

const {zipApp} = require('./src/middlewares/dev/apps/app-download')

/**
 * Download the app using default options, this will download all language files.
 *
 * @param {string} appId The app id.
 * @param {string} zipPath The path to save the zip file.
 * @param {string} clientId The OAuth2 client id.
 */
zipApp('1', 'app-1.zip', 'your-clientid')

/** Download some language files */
zipApp('1', 'app-1.zip', 'your-clientid', { locales: ['en', 'zh-cn'] })

/** Modify app config and download */
zipApp('1', 'app-1.zip', 'your-clientid', {
  configModifier: (config) => {
    config.attributes.portalUrl = 'new-portal-url'
    return config
  }
})

/** Modify app config and download. The configModifier follows the lodash.set rules, see https://lodash.com/docs/4.17.15#set  */
zipApp('1', 'app-1.zip', 'your-clientid', {
  configModifier: {
    'attributes.portalUrl': 'new-portal-url'
  }
})
