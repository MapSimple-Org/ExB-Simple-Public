module.exports = function (webpackConfigs) {
  /**
   * If you need to change the widget webpack config, you can change the webpack config here and return the changed config.
   *
   * The `webpackConfigs` is an array of webpack configurations for widgets.
   * If the widget manifest does not have the `notShareDynamicModules` property set to `true`, it's webpack configuration will be included in a shared webpack configuration, named `widgets`.
   * If the widget manifest has the `notShareDynamicModules` property set to `true`, its webpack configuration will be included in a separate webpack configuration, named `widget-{widget name}`.
   */

  return webpackConfigs
}
