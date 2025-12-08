exports.getCommon = function (commonOptions = {}) {
  const path = require('path');
  const fs = require('fs');
  const fsExtra = require('fs-extra')

  const MiniCssExtractPlugin = require('mini-css-extract-plugin');
  // remove unnecessary js files when entries are css
  const CssEntryPlugin = require('./css-entry-plugin');
  const {CleanWebpackPlugin} = require('clean-webpack-plugin');
  const CopyWebpackPlugin = require('copy-webpack-plugin');
  const RtlCssPlugin = require('rtlcss-webpack-plugin');
  const {StatsWriterPlugin} = require("webpack-stats-plugin");
  const TerserPlugin = require('terser-webpack-plugin');
  const webpack = require('webpack');

  /**
   * The following environment variables are supported. Environment variables can be set at system level, or set through npm script "cross-env".
   *  - NODE_ENV: development/production
   *  - IS_PORTAL: Whether it's a portal build, default is false.
   *  - IS_DE: Whether it's a DE build, default is false.
   *  - BUILD_NUMBER: This var is set by Jenkins when build, we can use this env var to simulate a Jenkins build. In development, this var is not set.
   *  - ARCGIS_JSAPI_URL: The JS API URL.
   *  - STAT: Enable build stat when true, default is false.
   *  - TYPING: Generate type declare files when build DE edition, default is false
   *  - TSCHECK: Do typescript typing check.
   *  - OUTPUT_FOLDER: By default, the build output is in `dist` or `dist/<buildNumber>` folder, but we can use this var to override the output folder.
   *                    This var is used when building at the download time.
   *  - TREE:
   */
  const isInPortal = process.env.IS_PORTAL ? true : false;
  const isDevEdition = process.env.IS_DE ? true : false;

  // DE build does not use buildNumber
  const buildNumber = isDevEdition ? '' : (process.env.BUILD_NUMBER || '');
  const jsApiUrl = process.env.ARCGIS_JSAPI_URL || 'https://js.arcgis.com/4.34/';
  const calciteComponentsUrl = 'https://js.arcgis.com/calcite-components/3.3.3/';
  // const calciteComponentsUrl = 'https://cdn.jsdelivr.net/npm/@esri/calcite-components@3.3.0/dist/calcite/';

  const cspWhiteList = [
    '*.arcgis.com',
    '*.esri.com',
    'https://cdn.jsdelivr.net/npm/@esri/arcgis-html-sanitizer@2.9.0/dist/umd/arcgis-html-sanitizer.min.js',
    calciteComponentsUrl,
    'https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js',
    'https://www.googletagmanager.com',
    'https://developer.api.autodesk.com'
  ].join(' ')
  const cspMetaTag = (isInPortal || isDevEdition) ? '' : `<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval' blob: ${cspWhiteList}">`

  const extractThemeStylePlugin = new MiniCssExtractPlugin({
    filename: '[name].css'
  });

  const extractRtlThemeStylePlugin = new RtlCssPlugin({
    filename: '[name]-rtl.css'
  });

  let stats = {
    chunks: false,
    chunkModules: false,
    assets: false,
    children: false,
    hash: false,
    reasons: false,
    modules: false,
    errorDetails: true,
    colors: true,
    entrypoints: true
  };

  if(process.env.NODE_ENV === 'production'){
    stats.chunks = true;
    stats.chunkModules = true;
  }

  if( process.env.TREE){
    stats.chunks = true;
    stats.chunkModules = true;
    stats.modules = true;
    stats.reasons = true;
    stats.children = true;
  }

  let cssLoaders = [{
    loader: 'css-loader',
    options: {
      sourceMap: process.env.NODE_ENV === 'production'? false: true,
      url: false
    }
  }, {
    loader: 'resolve-url-loader',
    options: {}
  }, {
    loader: 'sass-loader',
    options: {
      sourceMap: true
    }
  }];

  let htmlLoader = {loader: 'html-loader'};
  let urlLoader = {
    loader: 'url-loader',
    options: {
      esModule: false,
    }
  }

  let isThemeStyle = (styleFile) => /themes\/(.)+\/style\.(scss|css)$/.test(styleFile) ||
    /jimu-ui\/lib\/styles\/(.)+\.(scss|css)/.test(styleFile) || /jimu-theme\/lib\/base\/(.)+\.(scss|css)/.test(styleFile);
  const tsLoader = { loader: 'thread-loader', options: { workers: require('os').cpus().length - 1 } }

  class ConsoleLogOnWebpackPlugin {
    apply(compiler) {
      compiler.hooks.done.tap('ConsoleLogOnWebpackPlugin', (compilation) => {
        console.log(`${compilation.compilation.name} is done.`);
      })
    }
  }

  let commonPlugins = [
    new ConsoleLogOnWebpackPlugin(),
  ]

  if (process.env.FAST_DEV) {
    // The react development build includes some additional checks, which causes it to be slow.
    // Use the react production build to workaround this issue.
    commonPlugins = commonPlugins.concat([
      new webpack.NormalModuleReplacementPlugin(
        /react\.development\.js/,
        path.resolve(__dirname, '../node_modules/react/cjs/react.production.js')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /react-dom\.development\.js/,
        path.resolve(__dirname, '../node_modules/react-dom/cjs/react-dom.production.js')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /react-dom-client\.development\.js/,
        path.resolve(__dirname, '../node_modules/react-dom/cjs/react-dom-client.production.js')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /react-jsx-runtime\.development\.js/,
        path.resolve(__dirname, '../node_modules/react/cjs/react-jsx-runtime.production.js')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /emotion-sheet\.development\.esm\.js/,
        path.resolve(__dirname, '../node_modules/@emotion/sheet/dist/emotion-sheet.esm.js')
      ),
    ])
  }

  exports.commonPlugins = commonPlugins;
  exports.extractThemeStylePlugin = extractThemeStylePlugin;
  exports.extractRtlThemeStylePlugin = extractRtlThemeStylePlugin;
  exports.cssEntryPlugin = new CssEntryPlugin();
  exports.cssLoaders = cssLoaders;
  exports.htmlLoader = htmlLoader;
  exports.urlLoader = urlLoader;
  exports.cspMetaTag = cspMetaTag
  exports.optimization = {
    chunkIds: 'named',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          format: {
            ascii_only: true
          },
          // GeoBIM needs the 'userFunction' to be kept.
          mangle: {
            keep_fnames: /userFunction/
          },
          compress: {
            keep_fnames: /userFunction/
          }
        },
      }),
    ],
  }

  exports.arcgisJsApiUrl = jsApiUrl;
  exports.calciteComponentsUrl = calciteComponentsUrl;
  exports.useStructuralUrl = isInPortal ? false : true;
  exports.isInPortal = isInPortal;
  exports.isDevEdition = isDevEdition;
  exports.buildNumber = buildNumber;

  exports.outputPath = getOutputPath(); // the output path contains build number if has
  exports.distPath = path.join(__dirname, '../dist');
  exports.rootBase = buildNumber ? `/cdn/${buildNumber}/` : '/';

  exports.visitFolder = visitFolder;
  exports.getRelativePath = getRelativePath;
  exports.getModuleRules = () => {
    const commonRule = [{
      // compile quill
      test: file => {
        return  /'[\\/]node_modules[\\/]quill[\\/]dist'/.test(file) && /\.js$/.test(file);
      },
      use: [{
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            declaration: false,
            allowJs: true,
            target: 'es6',
            module: 'commonjs'
          },
          files: [
            'dist/quill.js'
          ],
          transpileOnly: true
        }
      }]
    }, {
      /**
       * Some module import react this way: `import React from 'react'`.
       * Although react does not have default export, but TypeScript and webpack can make this way work through `esModuleInterop`.
       *
       * However, we externalize the react as `jimu-core/react`, this make the `esModuleInterop` do not work,
       * so we need to add the default export to make it work.
       *
       * After this, we remove the `esModuleInterop` from tsconfig.
       */
      test: [
        /node_modules[\\/]react[\\/]index\.js/,
        /node_modules[\\/]react\-dom[\\/]index\.js/
      ],
      use: [{
        loader: path.join(__dirname, 'add-default-export-loader.js')
      }]
    }, {
      test: file => {
        return isThemeStyle(file.replace(/\\/g, '/'))
      },
      use: [{
        loader: MiniCssExtractPlugin.loader
      }].concat(cssLoaders)
    }, {
      test: (file) => {
        return /\.(scss|css)$/.test(file) && !isThemeStyle(file.replace(/\\/g, '/'));
      },
      use: [{
        loader: 'style-loader'
      }].concat(cssLoaders)
    }, {
      test: /\.(html)$/,
      exclude: [/index\.html/, /index-template\.html/],
      use: htmlLoader
    }, {
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      exclude: [
        /jimu-ui[\\/](.*)lib[\\/](.*)icons/,
        /jimu-icons[\\/](.*)svg[\\/]/,
        /widgets[\\/](.*)[\\/]assets[\\/]icon/,
        /widgets[\\/](.*)[\\/]assets[\\/]icons/,
        /widgets[\\/](.*)[\\/]icon\.svg/
      ],
      use: urlLoader
    }, {
      test: /\.svg$/,
      include: [
        /jimu-ui[\\/](.*)lib[\\/](.*)icons/,
        /jimu-icons[\\/](.*)svg[\\/]/,
        /widgets[\\/](.*)[\\/]assets[\\/]icon/,
        /widgets[\\/](.*)[\\/]assets[\\/]icons/,
        /widgets[\\/](.*)[\\/]icon\.svg/
      ],
      use: [{
        loader: 'svg-inline-loader'
      },{
        loader: 'svgo-loader',
        options: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  convertColors: {
                    shorthex: true,
                  },
                  removeViewBox: false,
                  cleanupIds: false
                },
              },
            }
          ]
        }
      }]
    }];

    const moduleRules = commonRule.concat([{
      test: file => {
        return /\.tsx?$/.test(file)
      },
      exclude: /node_modules/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            happyPackMode: true
          }
        },
        tsLoader
      ]
    }, {
      test: [
        /widgets[\\/](.)+[\\/]widget\.tsx/,
        /widgets[\\/](.)+[\\/]setting\.tsx/,
      ],
      use: [{
        loader: path.join(__dirname, 'update-webpack-public-path-loader.js')
      }]
    }])

    return moduleRules;
  };

  exports.getPlugins = (chunkName, toBeCopiedFiles, toBeCleanFiles = [], tsConfig) => {
    let plugins;

    if(process.env.STAT){
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

      plugins = [
        new BundleAnalyzerPlugin({
          analyzerPort: 'auto'
        }),
        createStatsWriterPlugin(chunkName)
      ];
    }else{
      plugins = [];
      if(!process.env.TSCHECK && !process.env.TREE){
        plugins = plugins.concat([
          new CleanWebpackPlugin({
            dry: false,
            verbose: false,
            cleanStaleWebpackAssets: false,
            cleanOnceBeforeBuildPatterns: toBeCleanFiles,
          }),
          ...((toBeCopiedFiles || []).length ? [new CopyWebpackPlugin({ patterns: toBeCopiedFiles })] : [])
        ]);
      }
      if(process.env.NODE_ENV === 'production'){
        plugins = plugins.concat([createStatsWriterPlugin(chunkName)]);
      }
    }

    return plugins.concat(commonPlugins);
  }

  function createStatsWriterPlugin(chunkName){
    const reportFolder = getStatReportsFolder(chunkName);
    const entryDepsFilePath = path.join(reportFolder, 'entry-dependency.json');
    return new StatsWriterPlugin({
      filename: compilation => path.join(path.relative(compilation.outputOptions.path, reportFolder), `${chunkName}.json`),
      stats: stats,
      transform: (data, options) => {
        const d = {
          entrypoints: {},
          chunks: {}, // widget shared chunks, see `getWidgetsWebpackConfig` in webpack-extensions.common
          errors: data.errors,
          warnings: data.warnings,
          outputPath: data.outputPath,
          publicPath: data.publicPath,
          version: data.version
        };
        const addSingleModuleNameToArray = (module, moduleNameArray) => {
          if (!module || !moduleNameArray) return
          // ignore webpack runtime dependencies and external dependencies
          if (module.name && !/^webpack\/runtime/.test(module.name) && !/^external \".*\"$/.test(module.name)) {
            moduleNameArray.push(module.name);
          }
        }
        const addModuleNamesToArray = (modules, moduleNameArray) => {
          if (!modules || !moduleNameArray) return
          modules.forEach(m => {
            if (m.modules && m.modules.length > 0) {
              addModuleNamesToArray(m.modules, moduleNameArray)
            } else {
              addSingleModuleNameToArray(m, moduleNameArray)
            }
          })
        }

        const findEntryDependencies = entryName => {
          const dependencies = []
          data.entrypoints[entryName].chunks.forEach(chunkId => {
            const chunk = data.chunks && data.chunks.find(c => c.id === chunkId)
            if (!chunk) {
              return
            }
            chunk.modules.forEach(module => {
              if(/^external \".*\"$/.test(module.name)){
                let name = module.name.split(' ')[1]
                name = name.substring(1, name.length - 1)
                if (!name.includes('/')) {
                  name = `${name}/index`
                }
                dependencies.push(name)
              }
            })
          })
          return dependencies
        }

        /**
         * The format of entries:
         * {
         *    nodes: [{
         *      name: 'jimu-core',
         *      size: 100
         *    }],
         *    links: [{
         *      source: 'jimu-core',
         *      target: 'jimu-arcgis'
         *    }]
         * }
         */
        let entryDeps = { nodes: [], links: [] }
        if (fs.existsSync(entryDepsFilePath)) {
          entryDeps = JSON.parse(fs.readFileSync(entryDepsFilePath), 'utf-8')
        }

        Object.keys(data.entrypoints).forEach(entryName => {
          if(!d.entrypoints[entryName]){
            d.entrypoints[entryName] = {};
          }
          d.entrypoints[entryName].chunks = data.entrypoints[entryName].chunks.map(chunkId => {
            const c = data.chunks && data.chunks.find(c => c.id === chunkId);
            if(c){
              const moduleNameArray = [];
              addModuleNamesToArray(c.modules, moduleNameArray);
              return {
                id: c.id,
                names: c.names,
                modules: moduleNameArray.sort((m1, m2) => m1.localeCompare(m2))
              }
            }else{
              return null;
            }
          });

          if (!entryDeps.nodes.find(n => n.name === entryName)) {
            const chunkId = data.entrypoints[entryName].chunks[0]
            const chunk = data.chunks && data.chunks.find(c => c.id === chunkId);
            entryDeps.nodes.push({
              name: entryName,
              size: chunk && chunk.size
            })
          }
          const dependencies = findEntryDependencies(entryName)
          dependencies.forEach(dName => {
            if (entryDeps.links.find(link => link.source === entryName && link.target === dName)) {
              return
            }
            entryDeps.links.push({
              source: entryName,
              target: dName
            })
          })
        });

        d.chunks = data.chunks && data.chunks.filter(c => c.files.length && c.files[0].startsWith('widgets/chunks')).map(chunck => {
          const modules = []
          addModuleNamesToArray(chunck.modules, modules)
          return {
            fileName: chunck.files[0],
            modules: modules,
            usedBy: chunck.parents
          }
        })

        fsExtra.ensureDirSync(reportFolder)
        fs.writeFileSync(entryDepsFilePath, JSON.stringify(entryDeps, null, 2), 'utf-8')

        return JSON.stringify(d, null, 2);
      }
    })
  }

  exports.resolveMainFields = ['module', 'main'];
  exports.extensions = ['.ts', '.tsx', '.js', '.jsx'];
  exports.stats = stats;
  exports.devServer = {
    contentBase: ['./dist'],
    stats: {
      chunks: true,
    }
  };
  exports.sourceMapOption = process.env.NODE_ENV === 'production'? false: 'inline-source-map';
  exports.moduleAlias = {
    'jimu-core': path.resolve(__dirname, '../jimu-core'),
    'jimu-data-source': path.resolve(__dirname, '../jimu-data-source'),
    'jimu-theme': path.resolve(__dirname, '../jimu-theme'),
    'jimu-ui': path.resolve(__dirname, '../jimu-ui'),
    'jimu-icons': path.resolve(__dirname, '../jimu-icons'),
    'jimu-arcgis': path.resolve(__dirname, '../jimu-arcgis'),
    'jimu-for-builder': path.resolve(__dirname, '../jimu-for-builder'),
    'builder': path.resolve(__dirname, '../builder'),
    'jimu-for-test': path.resolve(__dirname, '../jimu-for-test'),
    'jimu-layouts': path.resolve(__dirname, '../jimu-layouts'),
    'calcite-components': path.resolve(__dirname, '../jimu-ui/calcite-components'),
    'arcgis-charts-components': path.resolve(__dirname, '../jimu-ui/arcgis-charts-components'),
    'arcgis-map-components': path.resolve(__dirname, '../jimu-ui/arcgis-map-components'),
    'arcgis-coding-components': path.resolve(__dirname, '../jimu-ui/arcgis-coding-components'),
    'arcgis-portal-components': path.resolve(__dirname, '../jimu-ui/arcgis-portal-components'),
    '@emotion/react': path.resolve(__dirname, '../node_modules/@emotion/react'),
    '@emotion/react/jsx-runtime': path.resolve(__dirname, '../node_modules/@emotion/react/jsx-runtime'),
  };

  exports.externalFunction = function({request, contextInfo}, callback) {
    if (isRequestExternal(request)) {
      if(['react', 'react-dom', 'react-dom/client', 'react-dom/server'].indexOf(request) > -1){
        callback(null, 'system jimu-core/' + request);
      } else if (request.startsWith('@arcgis/core/')) {
        // for JSAPI ESM, we always use AMD, esri/xxx
        const segs = request.split('/')
        let moduleSegs = segs.slice(2, segs.length)
        moduleSegs.unshift('esri')
        const moduleName = moduleSegs.join('/')
        callback(null, 'system ' + moduleName);
      } else {
        callback(null, 'system ' + request);
      }
    } else {
      if (['@esri/calcite-components-react', '@esri/calcite-components'].includes(request) && !(contextInfo.issuer.endsWith('jimu-ui/calcite-components.ts') || contextInfo.issuer.endsWith('jimu-ui\\calcite-components.ts'))) {
        callback(null, 'system calcite-components');
      } else if (['@arcgis/map-components'].includes(request) && !(contextInfo.issuer.endsWith('jimu-ui/arcgis-map-components.ts') || contextInfo.issuer.endsWith('jimu-ui\\arcgis-map-components.ts'))) {
        callback(null, 'system arcgis-map-components');
      } else if (['@arcgis/coding-components'].includes(request) && !(contextInfo.issuer.endsWith('jimu-ui/arcgis-coding-components.ts') || contextInfo.issuer.endsWith('jimu-ui\\arcgis-coding-components.ts'))) {
        callback(null, 'system arcgis-coding-components');
      } else if (['@arcgis/portal-components'].includes(request) && !(contextInfo.issuer.endsWith('jimu-ui/arcgis-portal-components.ts') || contextInfo.issuer.endsWith('jimu-ui\\arcgis-portal-components.ts'))) {
        callback(null, 'system arcgis-portal-components');
      } else if (request.startsWith('@emotion/') && !(contextInfo.issuer.endsWith('jimu-core/emotion.ts') || contextInfo.issuer.endsWith('jimu-core\\emotion.ts') || contextInfo.issuer.includes('node_modules\\@emotion') || contextInfo.issuer.includes('node_modules/@emotion'))) {
        // console.log(11, contextInfo.issuer)
        callback(null, 'system jimu-core/emotion');
      } else {
        callback();
      }
    }
  }


  function isRequestExternal(request){
    const partialMatchPackages = ['dojo/', 'dijit/', 'dojox/', 'esri/', 'moment', 'dgrid', 'dstore', '@arcgis/core/', 'widgets/shared-code'];

    const fullMatchPackages = [
      'react', 'react-dom', 'react-dom/client', 'react-dom/server',
      'jimu-core', 'jimu-core/dnd', 'jimu-core/emotion',

      'jimu-arcgis',

      'jimu-layouts/layout-builder', 'jimu-layouts/layout-runtime',

      'jimu-for-builder', 'jimu-for-builder/service', 'jimu-for-builder/json-editor-setting', 'jimu-for-builder/templates',

      'jimu-theme',

      'jimu-ui',

      'jimu-data-source',

      'jimu-ui/basic/date-picker', 'jimu-ui/basic/sql-expression-runtime', 'jimu-ui/basic/qr-code', 'jimu-ui/basic/color-picker',
      'jimu-ui/basic/item-selector', 'jimu-ui/basic/imagecrop', 'jimu-ui/basic/guide', 'jimu-ui/basic/list-tree', 'jimu-ui/basic/copy-button', 'jimu-ui/basic/runtime-components',

      'jimu-ui/advanced/data-source-selector', 'jimu-ui/advanced/dynamic-url-editor', 'jimu-ui/advanced/expression-builder', 'jimu-ui/advanced/setting-components', 'jimu-ui/advanced/sql-expression-builder',
      'jimu-ui/advanced/utility-selector', 'jimu-ui/advanced/style-setting-components', 'jimu-ui/advanced/rich-text-editor', 'jimu-ui/advanced/resource-selector', 'jimu-ui/advanced/arcade-content-builder',
      'jimu-ui/advanced/map', 'jimu-ui/advanced/chart', 'jimu-ui/advanced/coordinate-control', 'jimu-ui/advanced/builder-components', 'jimu-ui/advanced/site-components', 'jimu-ui/advanced/dynamic-style-builder', 'jimu-ui/advanced/portal-components',

      'arcgis-charts-components', 'calcite-components', 'jimu-ui/advanced/chart-engine', 'arcgis-map-components', 'arcgis-coding-components', 'arcgis-portal-components'
    ].filter(commonOptions.filterExternals || (() => true));
    return partialMatchPackages.filter(p => request.substring(0, p.length) === p).length > 0 || fullMatchPackages.filter(p => request === p).length > 0;
  }

  exports.getJimuAMDLayer = function(request){
    let jimuCoreStatFile = path.join(__dirname, 'dist/jimu-core/stat.json');
    let statJson = JSON.parse(fs.readFileSync(jimuCoreStatFile));
    let chunks = statJson.chunks.filter(chunk => {
      return chunk.modules.filter(module => {
        return module.name.indexOf(request) > -1;
      }).length > 0;
    });

    if(chunks.length === 0){
      return;
    }
    return chunks[0].names[0];//why names not name?
  };

  /**
   * Visit the folder to find widgets/themes, identified by manifest.json
   * @param {*} folderPath
   */
  function visitFolder(folderPath, cb) {
    var files = fs.readdirSync(folderPath);
    files.forEach(fileName => {
      if (fileName === 'node_modules') {
        return
      }
      var filePath = path.normalize(folderPath + '/' + fileName);

      if(fs.statSync(filePath).isDirectory()){
        if(fs.existsSync(path.join(filePath, 'manifest.json'))){
          cb(filePath, fileName);
        }else{
          visitFolder(filePath, cb);
        }
      }
    });
  }

  function getRelativePath(fullPath, rootPath){
    fullPath = fullPath.replace(/\\/g, '/');
    rootPath = rootPath.replace(/\\/g, '/');
    if(!/\/$/.test(rootPath)){
      rootPath = rootPath + '/';
    }
    return fullPath.substring(rootPath.length);
  }

  function getStatReportsFolder(){
    return path.resolve(__dirname, `../dist-report/build-report`);
  }

  function getOutputPath(){
    if(process.env.OUTPUT_FOLDER){
      return path.resolve(__dirname, `../${process.env.OUTPUT_FOLDER}`)
    }
    return buildNumber ? path.resolve(__dirname, `../dist/cdn/${buildNumber}`) : path.resolve(__dirname, '../dist');
  }

  return exports;
}