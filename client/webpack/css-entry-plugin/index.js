const RE_CSS = /\.css$/i;
const RE_JS_MAP = /\.js(|\.map)$/i;

class CssEntryPlugin {
  apply (compiler) {
    compiler.hooks.emit.tapAsync('CssEntryPlugin', (compilation, callback) => {
      const newChunks = []
      compilation.chunks.forEach(chunk => {
        if (RE_CSS.test(chunk.name)) {
          newChunks.push(chunk)
        }
      })
      newChunks.forEach(chunk => {
        chunk.files.forEach(file => {
          if (RE_JS_MAP.test(file)) {
            delete compilation.assets[file];
          }
        });
      });
      callback();
    });
  }
}

module.exports = CssEntryPlugin;