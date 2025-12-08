/**
 * If a widget utilizes the "import()" function to dynamically load modules, the dynamic modules are written to "widgets/chunks" folder.
 * However, when a widget is deployed out and added as a custom widget, the chunks used by this widget can not be loaded correctly.
 * For this case, we need to update the public path so we can load the widget chunks.
 * */

module.exports = function loader(source){
  return `${source}\n export function __set_webpack_public_path__(url) { __webpack_public_path__ = url }`
}