const fs = require('fs');
const path = require('path');
var os = require('os');
var ignore = require('ignore');
const { widgetOrder } = require('./widget-order');

const translatedLocales = [
  'en', 'ar', 'bg', 'bs', 'ca', 'cs', 'da', 'de', 'el', 'es', 'et', 'fi', 'fr', 'he', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'lt', 'lv',
  'no', 'nl', 'pl', 'pt-br', 'pt-pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'th', 'tr', 'zh-cn', 'uk', 'vi', 'zh-hk', 'zh-tw'
]

const webpackCommon = require('./webpack.common').getCommon()

exports.isIgnore = isIgnore
exports.isExtensionRepo = isExtensionRepo;
exports.mergeThemeWidgetWebpackInfo = mergeThemeWidgetWebpackInfo;

// widgets functions
exports.getWidgetsInfoForWebpack = getWidgetsInfoForWebpack;
exports.getOneWidgetEntries = getOneWidgetEntries;
exports.getOneWidgetToBeCopiedFiles = getOneWidgetToBeCopiedFiles;
exports.fixOneWidgetManifest = fixOneWidgetManifest
exports.getWidgetsWebpackConfigs = getWidgetsWebpackConfigs;

// themes functions
exports.getOneThemeEntries = getOneThemeEntries;
exports.getOneThemeToBeCopiedFiles = getOneThemeToBeCopiedFiles;
exports.getOneThemeInfo = getOneThemeInfo;
exports.getThemesInfoForWebpack = getThemesInfoForWebpack;
exports.getThemesWebpackConfig = getThemesWebpackConfig;

// templates functions
exports.getTemplatesInfoForWebpack = getTemplatesInfoForWebpack
exports.getTemplatesWebpackConfig = getTemplatesWebpackConfig;
exports.mergeTemplateWebpackInfo = mergeTemplateWebpackInfo;


function getOneWidgetToBeCopiedFiles(rootFolder, widgetFolder){
  let rPath = webpackCommon.getRelativePath(widgetFolder, rootFolder);

  let files = [
    { from: `${widgetFolder}/manifest.json`, to: `${rPath}/manifest.json`, transform: (content, filePath) => {
      let widgetFolder = filePath.substring(0, filePath.length - 'manifest.json'.length);
      let manifestJson = JSON.parse(content);

      fixOneWidgetManifest(manifestJson, widgetFolder);

      return JSON.stringify(manifestJson, null, 2);
    }},
  ];

  if(process.env.NODE_ENV === 'production' && /^widgets/.test(rPath) && webpackCommon.isDevEdition){
    files.push({ from: `${widgetFolder}/src`, to: `${rPath}/src`});
    fs.existsSync(`${widgetFolder}/tests`) && files.push({ from: `${widgetFolder}/tests`, to: `${rPath}/tests`});
  }

  fs.existsSync(`${widgetFolder}/icon.svg`) && files.push({ from: `${widgetFolder}/icon.svg`, to: `${rPath}/icon.svg`});
  fs.existsSync(`${widgetFolder}/config.json`) && files.push({ from: `${widgetFolder}/config.json`, to: `${rPath}/config.json`});
  fs.existsSync(`${widgetFolder}/download-files-filter.js`) && files.push({ from: `${widgetFolder}/download-files-filter.js`, to: `${rPath}/download-files-filter.js` });
  fs.existsSync(`${widgetFolder}/src/runtime/translations`) && files.push({ from: `${widgetFolder}/src/runtime/translations`, to: `${rPath}/dist/runtime/translations`});
  fs.existsSync(`${widgetFolder}/src/runtime/assets`) && files.push({ from: `${widgetFolder}/src/runtime/assets`, to: `${rPath}/dist/runtime/assets`});
  fs.existsSync(`${widgetFolder}/src/setting/translations`) && files.push({ from: `${widgetFolder}/src/setting/translations`, to: `${rPath}/dist/setting/translations`});
  fs.existsSync(`${widgetFolder}/src/setting/assets`) && files.push({ from: `${widgetFolder}/src/setting/assets`, to: `${rPath}/dist/setting/assets`});
  fs.existsSync(`${widgetFolder}/src/guide/translations`) && files.push({ from: `${widgetFolder}/src/guide/translations`, to: `${rPath}/dist/guide/translations` });
  fs.existsSync(`${widgetFolder}/src/guide/assets`) && files.push({ from: `${widgetFolder}/src/guide/assets`, to: `${rPath}/dist/guide/assets` });
  fs.existsSync(`${widgetFolder}/src/guide/steps.json`) && files.push({ from: `${widgetFolder}/src/guide/steps.json`, to: `${rPath}/dist/guide/steps.json` });

  fs.existsSync(`${widgetFolder}/dist`) && files.push({ from: `${widgetFolder}/dist`, to: `${rPath}/dist`});

  fs.existsSync(`${widgetFolder}/doc`) && files.push({ from: `${widgetFolder}/doc`, to: `${rPath}/doc`});

  const customCopyFiles = `${widgetFolder}/copy-files.json`
  if (fs.existsSync(customCopyFiles)) {
    const copyFilesJson = JSON.parse(fs.readFileSync(customCopyFiles, 'utf8'))
    copyFilesJson.forEach(copyFile => {
      files.push({ from: `${widgetFolder}/${copyFile.from}`, to: `${rPath}/${copyFile.to}`})
    })
  }
  return files;
}

function getOneTemplateToBeCopiedFiles(rootFolder, templateFolder) {
  let rPath = webpackCommon.getRelativePath(templateFolder, rootFolder);
  let files = [
    {
      from: `${templateFolder}/manifest.json`, to: `${rPath}/manifest.json`
    },
  ];
  fs.existsSync(`${templateFolder}/thumbnail.png`) && files.push({ from: `${templateFolder}/thumbnail.png`, to: `${rPath}/thumbnail.png` });
  fs.existsSync(`${templateFolder}/thumbnail.gif`) && files.push({ from: `${templateFolder}/thumbnail.gif`, to: `${rPath}/thumbnail.gif` });
  fs.existsSync(`${templateFolder}/config.json`) && files.push({ from: `${templateFolder}/config.json`, to: `${rPath}/config.json` });
  fs.existsSync(`${templateFolder}/guide/translations`) && files.push({ from: `${templateFolder}/guide/translations`, to: `${rPath}/dist/guide/translations` });
  fs.existsSync(`${templateFolder}/guide/assets`) && files.push({ from: `${templateFolder}/guide/assets`, to: `${rPath}/dist/guide/assets` });
  fs.existsSync(`${templateFolder}/guide/steps.json`) && files.push({ from: `${templateFolder}/guide/steps.json`, to: `${rPath}/dist/guide/steps.json` });
  const customCopyFiles = `${templateFolder}/copy-files.json`
  if (fs.existsSync(customCopyFiles)) {
    const copyFilesJson = JSON.parse(fs.readFileSync(customCopyFiles, 'utf8'))
    copyFilesJson.forEach(copyFile => {
      files.push({ from: `${templateFolder}/${copyFile.from}`, to: `${rPath}/${copyFile.to}` })
    })
  }
  return files;
}

const publicPathFile = path.join(__dirname, '../jimu-core/lib/set-public-path.ts')

function getOneWidgetEntries(rootFolder, widgetFolder){
  let entries = {};
  let rPath = webpackCommon.getRelativePath(widgetFolder, rootFolder);
  //widget.tsx
  if(fs.existsSync(path.join(widgetFolder, 'src/runtime/widget.tsx'))){
    entries[`${rPath}/dist/runtime/widget`] = [publicPathFile, `${widgetFolder}/src/runtime/widget.tsx`];
  }

  //builder-support.tsx
  if(fs.existsSync(path.join(widgetFolder, 'src/runtime/builder-support.tsx'))){
    entries[`${rPath}/dist/runtime/builder-support`] = [publicPathFile, `${widgetFolder}/src/runtime/builder-support.tsx`];
  }

  //extensions
  let manifestJson = JSON.parse(fs.readFileSync(path.join(widgetFolder, 'manifest.json')));
  if(manifestJson.extensions){
    manifestJson.extensions.forEach(ext => {
      if(fs.existsSync(path.join(widgetFolder, `src/${ext.uri}.ts`))){
        entries[`${rPath}/dist/${ext.uri}`] = [publicPathFile, `${widgetFolder}/src/${ext.uri}.ts`];
      }else if(fs.existsSync(path.join(widgetFolder, `src/${ext.uri}.tsx`))){
        entries[`${rPath}/dist/${ext.uri}`] = [publicPathFile, `${widgetFolder}/src/${ext.uri}.tsx`];
      }
    });
  }

  //message actions
  if(manifestJson.messageActions){
    manifestJson.messageActions.forEach(action => {
      entries[`${rPath}/dist/${action.uri}`] = [publicPathFile, `${widgetFolder}/src/${action.uri}.ts`];

      if (action.settingUri) {
        entries[`${rPath}/dist/${action.settingUri}`] = [publicPathFile, `${widgetFolder}/src/${action.settingUri}.tsx`];
      }
    });
  }

  //data actions
  if(manifestJson.dataActions){
    manifestJson.dataActions.forEach(action => {
      if (fs.existsSync(path.join(widgetFolder, `src/${action.uri}.ts`))){
        entries[`${rPath}/dist/${action.uri}`] = [publicPathFile, `${widgetFolder}/src/${action.uri}.ts`];
      } else {
        entries[`${rPath}/dist/${action.uri}`] = [publicPathFile, `${widgetFolder}/src/${action.uri}.tsx`];
      }

      if (action.settingUri) {
        entries[`${rPath}/dist/${action.settingUri}`] = [publicPathFile, `${widgetFolder}/src/${action.settingUri}.tsx`];
      }
    });
  }

  //setting.tsx
  if(fs.existsSync(path.join(widgetFolder, 'src/setting/setting.tsx'))){
    entries[`${rPath}/dist/setting/setting`] = [publicPathFile, `${widgetFolder}/src/setting/setting.tsx`];
  }

  //item-setting.tsx
  if(manifestJson.properties && manifestJson.widgetType === 'LAYOUT' &&
    fs.existsSync(path.join(widgetFolder, 'src/setting/item-setting.tsx'))) {
    entries[`${rPath}/dist/setting/item-setting`] = [publicPathFile, `${widgetFolder}/src/setting/item-setting.tsx`];
  }

  //guide.tsx
  if(fs.existsSync(path.join(widgetFolder, 'src/guide/guide.tsx'))) {
    entries[`${rPath}/dist/guide/guide`] = [publicPathFile, `${widgetFolder}/src/guide/guide.tsx`];
  }
  return entries;
}

function fixOneWidgetManifest(manifestJson, widgetFolder){
  if(!manifestJson.properties){
    manifestJson.properties = {};
  }

  //config.json
  if(!fs.existsSync(path.join(widgetFolder, 'config.json'))){
    manifestJson.properties.hasConfig = false;
  }

  //widget.tsx
  if(!fs.existsSync(path.join(widgetFolder, 'src/runtime/widget.tsx')) && !fs.existsSync(path.join(widgetFolder, 'dist/runtime/widget.js'))){
    manifestJson.properties.hasMainClass = false;
  }

  //setting.tsx
  if(!fs.existsSync(path.join(widgetFolder, 'src/setting/setting.tsx')) && !fs.existsSync(path.join(widgetFolder, 'dist/setting/setting.js'))){
    manifestJson.properties.hasSettingPage = false;
  }


  if(fs.existsSync(path.join(widgetFolder, 'src/runtime/builder-support.tsx')) || fs.existsSync(path.join(widgetFolder, 'dist/runtime/builder-support.js'))){
    manifestJson.properties.hasBuilderSupportModule = true;
  }

  //item-setting.tsx
  if(manifestJson.widgetType === 'LAYOUT' &&
    (fs.existsSync(path.join(widgetFolder, 'src/setting/item-setting.tsx')) || fs.existsSync(path.join(widgetFolder, 'dist/setting/item-setting.js')))){
    manifestJson.properties.hasLayoutItemSettingPage = true;
  }

  //guide.tsx
  if (fs.existsSync(path.join(widgetFolder, 'src/guide/guide.tsx')) || fs.existsSync(path.join(widgetFolder, 'dist/guide/guide.js'))) {
    manifestJson.properties.hasGuide = true;
    manifestJson.properties.guideType = 'PROGRAM';
  } else if (fs.existsSync(path.join(widgetFolder, 'src/guide/steps.json')) || fs.existsSync(path.join(widgetFolder, 'dist/guide/steps.js'))) {
    // guide steps.json
    // only one mode is allowed, if both guide.tsx and steps.json exist, we'll use guide.tsx
    manifestJson.properties.hasGuide = true;
    manifestJson.properties.guideType = 'CONFIG';
  }

}

function getOneTemplateEntries(rootFolder, templatesFolder) {
  let entries = {};
  let rPath = webpackCommon.getRelativePath(templatesFolder, rootFolder);

  //guide.tsx
  if (fs.existsSync(path.join(templatesFolder, 'guide/guide.tsx'))) {
    entries[`${rPath}/dist/guide/guide`] = `${templatesFolder}/guide/guide.tsx`;
  }

  return entries;
}

function fixOneTemplateManifest(manifestJson, templateFolder) {
  if (!manifestJson.properties) {
    manifestJson.properties = {};
  }
  //config.json
  if (!fs.existsSync(path.join(templateFolder, 'config.json'))) {
    manifestJson.properties.hasConfig = false;
  }

  //guide.tsx
  if (fs.existsSync(path.join(templateFolder, 'guide/guide.tsx')) || fs.existsSync(path.join(templateFolder, 'guide/guide.js'))) {
    manifestJson.properties.hasGuide = true;
    manifestJson.properties.guideType = 'PROGRAM';
  } else if (fs.existsSync(path.join(templateFolder, 'guide/steps.json')) || fs.existsSync(path.join(templateFolder, '/guide/steps.js'))) {
    //steps.json
    manifestJson.properties.hasGuide = true;
    manifestJson.properties.guideType = 'CONFIG';
  }
}

/**
 * widgetsFolder: the folder contains all widgets, this is an absolute path.
 *
 * A infoForWebpack contains: entries, files, infos.
 * This method will return two infoForWebpack, one is shared, the other one is standalone.
 * The return value is like below:
 *  {
 *   shared: { entries, files, infos },
 *   standalone: {
 *    widgetName: { entries, files, info }
 *   }
 *  }
 *
 */
function getWidgetsInfoForWebpack(widgetsFolder){
  const infoForWebpack = {
    shared: { entries: {}, files: [], infos: [] },
    standalone: {}
  }

  let existedInfoPath = path.join(__dirname, `../dist/widgets/widgets-info-existed.json`);
  let existedInfos = [];
  if(fs.existsSync(existedInfoPath)){
    existedInfos = JSON.parse(fs.readFileSync(existedInfoPath));
  }

  webpackCommon.visitFolder(widgetsFolder, (widgetFolder, widgetName) => {
    if(existedInfos.find(info => info.name === widgetName)){
      console.error('Name is duplicated.', widgetName);
      return;
    }

    const allInfos = infoForWebpack.shared.infos.concat(Object.values(infoForWebpack.standalone).map(v => v.info))
    if(allInfos.find(info => info.name === widgetName)){
      console.error('Name is duplicated.', widgetName);
      return;
    }

    if(isIgnore(widgetsFolder, widgetFolder)){
      return;
    }

    if (!fs.existsSync(path.join(widgetFolder, 'src')) && fs.existsSync(path.join(widgetFolder, 'dist'))) {
      console.log(`Find a widget without source code: ${widgetName}`)
    }

    const oneWidgetInfo = getOneWidgetInfo(path.resolve(widgetsFolder, '..'), widgetFolder)
    if (oneWidgetInfo.manifest.type !== 'widget' || !oneWidgetInfo.manifest.version || !oneWidgetInfo.manifest.exbVersion) {
      // some folder have the manifest.json but not a widget
      return
    }

    if (oneWidgetInfo.name !== widgetName) {
      console.error(`The widget name in manifest.json is not the same with the folder name: ${widgetFolder}`)
      return
    }

    if (!webpackCommon.isDevEdition && !webpackCommon.isInPortal) {
      if (oneWidgetInfo.manifest.notSupportAGOL) {
        // it's online edition, but the widget does not supported in AGOL
        return
      }
    }

    if (oneWidgetInfo.manifest.properties.notShareDynamicModules) {
      infoForWebpack.standalone[widgetName] = {info: oneWidgetInfo}
    } else {
      infoForWebpack.shared.infos.push(oneWidgetInfo);
    }

    const oneWidgetEntry = getOneWidgetEntries(path.resolve(widgetsFolder, '..'), widgetFolder)
    // If multiple widgets create the same entry, we'll remove the duplicated ones.
    Object.keys(oneWidgetEntry).forEach(e => {
      const ePath = path.resolve(e)
      const allEntries = getAllEntries(infoForWebpack)
      if (Object.keys(allEntries).find(e => path.resolve(e) === ePath)) {
        return
      }
      if (oneWidgetInfo.manifest.properties.notShareDynamicModules) {
        if (!infoForWebpack.standalone[widgetName].entries) {
          infoForWebpack.standalone[widgetName].entries = {}
        }
        infoForWebpack.standalone[widgetName].entries[e] = oneWidgetEntry[e]
      } else {
        infoForWebpack.shared.entries[e] = oneWidgetEntry[e]
      }
    })

    const oneWidgetToBeCopiedFiles = getOneWidgetToBeCopiedFiles(path.resolve(widgetsFolder, '..'), widgetFolder)
    // If multiple widgets copy the same file, we'll remove the duplicated ones.
    oneWidgetToBeCopiedFiles.forEach(f => {
      const allFiles = infoForWebpack.shared.files.concat(Object.values(infoForWebpack.standalone).map(v => v.files || []))
      if (allFiles.find(_f => _f.from === f.from && _f.to === f.to)){
        return
      }
      if (oneWidgetInfo.manifest.properties.notShareDynamicModules) {
        if (!infoForWebpack.standalone[widgetName].files) {
          infoForWebpack.standalone[widgetName].files = []
        }
        infoForWebpack.standalone[widgetName].files.push(f)
      } else {
        infoForWebpack.shared.files.push(f)
      }
    })
  });

  const allInfos = infoForWebpack.shared.infos.concat(Object.values(infoForWebpack.standalone).map(v => v.info))
  allInfos.forEach(info => {
    const group = Object.keys(widgetOrder).find(group => !!widgetOrder[group][info.name]);
    if(group){
      info.order = widgetOrder[group][info.name];
      info.group = parseInt(group);
    }else{ // custom widgets
      info.order = 700
      info.group = 7
    }
  });

  // allInfos = allInfos.sort((a, b) => a.order - b.order);

  // handle shared-code folder
  handleSharedCode(widgetsFolder, infoForWebpack)

  return infoForWebpack;
}

function getThemesInfoForWebpack(themesFolder){
  let entries = {};
  let files = [];
  let infos = [];

  let themeOrder = {
    'master': 1,
    'astro': 2,
    'ocean': 3,
    'velvet': 4,
    'abyss': 5,
    'meadow': 6,
    'shared': 7,
    default: 8,
    dark: 9,
    ink: 10,
    morandi: 11,
    vivid: 12,
    'shared-theme': 13,
  }

  let existedInfoPath = path.join(__dirname, `../dist/themes/themes-info-existed.json`);
  let existedInfos = [];
  if(fs.existsSync(existedInfoPath)){
    existedInfos = JSON.parse(fs.readFileSync(existedInfoPath));
  }

  webpackCommon.visitFolder(themesFolder, (themeFolder, themeName) => {
    if(existedInfos.find(info => info.name === themeName)){
      return;
    }

    if(infos.find(info => info.name === themeName)){
      return;
    }

    Object.assign(entries, getOneThemeEntries(path.resolve(themesFolder, '..'), themeFolder));

    files = files.concat(getOneThemeToBeCopiedFiles(path.resolve(themesFolder, '..'), themeFolder));

    if(isIgnore(themesFolder, themeFolder)){
      return;
    }
    let info = getOneThemeInfo(path.resolve(themesFolder, '..'), themeFolder);
    if (info.manifest.type !== 'theme' || !info.manifest.version || !info.manifest.exbVersion) {
      // some folder have the manifest.json but not a theme
      return
    }
    if (info.name !== themeName) {
      console.error(`The theme name in manifest.json is not the same with the folder name: ${themeFolder}`)
      return
    }
    info.order = themeOrder[info.name];
    infos.push(info);
  });

  infos = infos.sort((a, b) => a.order - b.order);
  return { shared: {entries, files, infos} };
}

function getTemplatesInfoForWebpack(templatesFolder){
  const entries = {}, files = [], infos = {} //the key is template type
  let existedInfos = {};
  let existedInfoPath = path.join(__dirname, '../dist/templates/templates-info-existed.json');
  if(fs.existsSync(existedInfoPath)){
    existedInfos = JSON.parse(fs.readFileSync(existedInfoPath));
  }

  const templateTyps = fs.readdirSync(templatesFolder)
  const rootFolder = path.join(templatesFolder, '..')
  templateTyps.forEach(tt => {
    if(tt === 'translations'){
      return
    }
    const ttFolder = path.join(templatesFolder, tt)

    if (fs.statSync(ttFolder).isFile()) {
      return
    }

    infos[tt] = []
    webpackCommon.visitFolder(ttFolder, (templateFolder, templateName) => {
      if(existedInfos[tt] && existedInfos[tt].find(info => info.name === templateName)){
        return;
      }
      if(infos[tt].find(info => info.name === templateName)){
        return;
      }

      if(isIgnore(templatesFolder, templateFolder)){
        return;
      }

      const oneTemplateInfo = getOneTemplateInfo(templateFolder, templatesFolder)
      if (oneTemplateInfo.name !== templateName) {
        console.error(`The template name in manifest.json is not the same with the folder name: ${templateFolder}`)
        return
      }

      if (!webpackCommon.isDevEdition && !webpackCommon.isInPortal) {
        if (oneTemplateInfo.notSupportAGOL) {
          // it's online edition, but the template does not supported in AGOL
          return
        }
      }

      // entries
      const oneTemplateEntry = getOneTemplateEntries(path.resolve(templatesFolder, '..'), templateFolder)
      const oneTemplateToBeCopiedFiles = getOneTemplateToBeCopiedFiles(path.resolve(templatesFolder, '..'), templateFolder)

      // If multiple templates create the same entry, we'll remove the duplicated ones.
      Object.keys(oneTemplateEntry).forEach(e => {
        const ePath = path.resolve(e)
        if (Object.keys(entries).find(e => path.resolve(e) === ePath)) {
          return
        }
        entries[e] = oneTemplateEntry[e]
      })
      // If multiple templates copy the same file, we'll remove the duplicated ones.
      oneTemplateToBeCopiedFiles.forEach(f => {
        if (files.find(_f => _f.from === f.from && _f.to === f.to)) {
          return
        }
        files.push(f)
      })

      infos[tt].push(oneTemplateInfo);

    });
    infos[tt] = infos[tt].sort((a, b) => a.order - b.order);
  })

  let rPath = webpackCommon.getRelativePath(path.join(templatesFolder, 'translations'), rootFolder);
  files.push({from: path.join(templatesFolder, 'translations'), to: rPath})

  return { entries, files, infos};
}

/**
 *
 * {
 *  "name": "arcgis-map",
    "path": "widgets/arcgis/arcgis-map/",
    "icon": "",
    "manifest": {},
    "i18nLabel": {
      "en": '',
      "zh-cn": ''
    },
    "i18nDescription": {
      "en": '',
      "zh-cn": ''
    }
   }
 * @param {*} rootFolder
 * @param {*} widgetFolder
 */
function getOneWidgetInfo(rootFolder, widgetFolder){
  let widget = {};
  let rPath = webpackCommon.getRelativePath(widgetFolder, rootFolder);
  let manifestFile = path.join(widgetFolder, 'manifest.json');

  let manifestJson = JSON.parse(fs.readFileSync(manifestFile));
  fixOneWidgetManifest(manifestJson, widgetFolder);

  widget.name = manifestJson.name;
  widget.manifest = manifestJson;
  let {labels, descriptions} = getI18nLabelAndDescription(widgetFolder, manifestJson, 'widget');
  widget.i18nLabel = labels;
  widget.i18nDescription = descriptions;
  widget.uri = rPath.charAt(rPath.length - 1) === '/' ? rPath : rPath + '/';
  if(fs.existsSync(`${widgetFolder}/icon.svg`)){
    widget.icon = `${rPath}/icon.svg`;
  }else{
    widget.icon = `${rPath}/icon.png`;
  }
  return widget;
}

/**
 * The extType can be: widget, theme
 */
function getI18nLabelAndDescription(extFolder, manifest, extType){
  let locales = manifest.translatedLocales;
  if(!locales || locales.length === 0){
    if(manifest.supportedLocales){
      console.warn('***supportedLocales is renamed to translatedLocales***');
    }
    return {};
  }
  let ret = {
    labels: {},
    descriptions: {}
  }
  locales.forEach((locale, i) => {
    let filePath;
    if(extType === 'widget'){
      if(i === 0){
        filePath = `${extFolder}/src/runtime/translations/default.ts`;
      }else{
        filePath = `${extFolder}/src/runtime/translations/${locale}.js`;
      }
    }else{
      if(i === 0){
        filePath = `${extFolder}/translations/default.ts`;
      }else{
        filePath = `${extFolder}/translations/${locale}.js`;
      }
    }

    if(fs.existsSync(filePath)){
      let content = fs.readFileSync(filePath, 'utf-8');
      const [labelKey, descriptionKey] = getLabelAndDescriptionTranslationKey(extType)
      let label = getValueFromTranslation(content, labelKey);
      if(label){
        ret.labels[locale] = label;
      }

      let description = getValueFromTranslation(content, descriptionKey);
      if(label){
        ret.descriptions[locale] = description;
      }
    }
  });

  return ret;
}

function getLabelAndDescriptionTranslationKey(extType){
  switch(extType){
    case 'widget':
      return ['_widgetLabel', '_widgetDescription']
    case 'theme':
      return ['_themeLabel', '_themeDescription']
    case 'template':
      return ['_templateLabel', '_templateDescription']
  }
}

function getValueFromTranslation(translationContent, key){
  let lines = translationContent.split(os.EOL);
  /**
   * If translation file is created in macOS and is used in Windows, EOL of the file will be '\n' or '\r' and the split separator (os.EOL) will be `\r\n`.
   * In the case, can not split translation file correctly. Need to use '\n' and '\r' to split it again.
   *
   * Translation file should follow a default format, number of its lines should be 2 at least.
   */
  if (lines.length <= 1) {
    lines = translationContent.split('\n');
  }
  if (lines.length <= 1) {
    lines = translationContent.split('\r');
  }
  //Adding ":" is to prevent getting a wrong value when the key is partially repeated,
  //such as 'template_tag_Map_centric' and 'template_tag_Map'
  let labelLine = lines.find(line => line.indexOf(`${key}:`) > -1);
  if(!labelLine){
    return null;
  }

  let label = labelLine.substr(labelLine.indexOf(':') + 1).trim()
  const lastChar = label.substr(label.length - 1)
  if(lastChar === ','){
    label = label.substring(0, label.length - 1) // remove last comma
  }
  label = label.replace(/\\"/g, '"').replace(/\\'/g, "'") // remove the \' and \"
  label = label.substring(1, label.length - 1) // remove heading and trailing quotation
  return label
  // if(label.indexOf('"') > -1){
  //   // for double quotes, the \" is allowed
  //   return label.match(/"(.+)"/)[1].replace('\\\"', '\"');
  // }else if(label.indexOf("'") > -1){
  //   // for single quotes, the \' is allowed
  //   return label.match(/'(.+)'/)[1].replace('\\\'', '\'');
  // }else{
  //   return null;
  // }
}

function isIgnore(rootFolder, folder){
  // the ignore pattern: https://git-scm.com/docs/gitignore
  if(!fs.existsSync(path.join(rootFolder, '.ignore'))){
    return false;
  }
  let ignorePatterns = fs.readFileSync(path.join(rootFolder, '.ignore'), 'utf-8').split(os.EOL);
  let igCheck = ignore().add(ignorePatterns);

  let rPath = webpackCommon.getRelativePath(folder, rootFolder);
  return igCheck.ignores(rPath);
}

function getOneThemeEntries(rootFolder, themeFolder){
  let entries = {};
  let rPath = webpackCommon.getRelativePath(themeFolder, rootFolder);

  if(fs.existsSync(themeFolder)){
    if(fs.existsSync(`${themeFolder}/style.scss`)) {
      entries[`${rPath}/style`] = `${themeFolder}/style.scss`;
    }else if(fs.existsSync(`${themeFolder}/style.ts`)) {
      entries[`${rPath}/style`] = `${themeFolder}/style.ts`;
    }else{
      entries[`${rPath}/style`] = './webpack/fake-theme-style.js';
    }
  }

  return entries;
}

function getOneThemeToBeCopiedFiles(rootFolder, themeFolder){
  let rPath = webpackCommon.getRelativePath(themeFolder, rootFolder);
  let files = [];

  files = files.concat([
    { from: `${themeFolder}/manifest.json`, to: `${rPath}/manifest.json`, transform: extendOneThemeManifest},
  ]);

  fs.existsSync(`${themeFolder}/variables.json`) && files.push({ from: `${themeFolder}/variables.json`, to: `${rPath}/variables.json`},);
  fs.existsSync(`${themeFolder}/thumbnail.png`) && files.push({ from: `${themeFolder}/thumbnail.png`, to: `${rPath}/thumbnail.png` });
  fs.existsSync(`${themeFolder}/thumbnail.svg`) && files.push({ from: `${themeFolder}/thumbnail.svg`, to: `${rPath}/thumbnail.svg` });
  fs.existsSync(path.join(themeFolder, 'assets')) && files.push({ from: `${themeFolder}/assets`, to: `${rPath}/assets`});

  return files;
}

function getOneThemeInfo(rootFolder, themeFolder){
  let manifestFile = path.join(themeFolder, 'manifest.json');
  let manifestJson = JSON.parse(fs.readFileSync(manifestFile));
  let themeName = manifestJson.name;
  const locales = manifestJson.translatedLocales ?? translatedLocales;
  let rPath = webpackCommon.getRelativePath(themeFolder, rootFolder);

  let {labels, descriptions} = getI18nLabelAndDescription(themeFolder, manifestJson, 'theme');

  let variablesFile = path.join(themeFolder, 'variables.json');
  let variablesJson = fs.existsSync(variablesFile) ? JSON.parse(fs.readFileSync(variablesFile)) : {};
  const mode = variablesJson?.darkTheme === true ? 'dark' : variablesJson.sys?.color?.mode ?? 'light'
  const primary = variablesJson.src?.primary?.color ?? variablesJson.sys?.color?.[mode]?.primary?.main
  const secondary = variablesJson.src?.secondary?.color ?? variablesJson.sys?.color?.[mode]?.secondary?.main

  const styles = { primary, secondary, mode }
  const thumbnail = fs.existsSync(`${themeFolder}/thumbnail.svg`) ? 'thumbnail.svg' : 'thumbnail.png'

  const hasStyleFiles = fs.existsSync(`${themeFolder}/style.scss`) || fs.existsSync(`${themeFolder}/style.ts`)
  const themeCustomizable = manifestJson.themeCustomizable ?? !hasStyleFiles

  return {
    name: themeName,
    label: manifestJson.label,
    uri: rPath.charAt(rPath.length - 1) === '/' ? rPath : rPath + '/',
    thumbnail,
    styles,
    i18nLabel: labels,
    i18nDescription: descriptions,
    isNewTheme: manifestJson.isNewTheme || false,
    translatedLocales: locales,
    themeCustomizable,
    manifest: manifestJson,
  };
}

function getOneTemplateInfo(templateFolder, templatesFolder){
  let manifestFile = path.join(templateFolder, 'manifest.json');
  let manifestJson = JSON.parse(fs.readFileSync(manifestFile));
  fixOneTemplateManifest(manifestJson, templateFolder);
  let templateName = manifestJson.name;
  let gifThumbnail = path.join(templateFolder, 'thumbnail.gif');

  const tags = manifestJson?.tags || []
  const i18nLabel = {}, i18nDescription = {}, i18nTags = tags;

  let capabilities = {'default': [...tags]}

  translatedLocales.forEach((locale, i) => {
    let filePath;
    if(i === 0){
      filePath = `${templatesFolder}/translations/default.ts`;
    }else{
      filePath = `${templatesFolder}/translations/${locale}.js`;
    }

    if(fs.existsSync(filePath)){
      let content = fs.readFileSync(filePath, 'utf-8');
      const labelKey = `_template_label_${templateName}`, descriptionKey = `_template_description_${templateName}`
      let label = getValueFromTranslation(content, labelKey);
      if(label){
        i18nLabel[locale] = label;
      }

      let description = getValueFromTranslation(content, descriptionKey);
      if(description){
        i18nDescription[locale] = description;
      }

      tags.forEach(tag => {
        if (tag) {
          const initializedKeyByTag = tag.replace(/ /g, "_")
          const tagKey = `_template_tag_${initializedKeyByTag}`
          const i18nTag = getValueFromTranslation(content, tagKey)
          if (i18nTag && !i18nTags.includes(i18nTag)) {
            i18nTags.push(i18nTag)
          }
          //Update capabilities
          capabilities = updateCapabilities(capabilities, i18nTag, locale)
        }
      })
    }
  });

  const info = {
    type: manifestJson.templateType,
    name: templateName,
    label: manifestJson.label,
    hasGuide: manifestJson.properties?.hasGuide,
    guideType: manifestJson.properties?.guideType,
    description: manifestJson.description,
    notSupportAGOL: manifestJson.notSupportAGOL,
    categoriesTags: manifestJson.categoriesTags,
    i18nLabel: i18nLabel,
    tags: i18nTags,
    i18nDescription: i18nDescription,
    thumbnail: manifestJson.thumbnail,
    thumbnailWidth: manifestJson.thumbnailWidth,
    thumbnailHeight: manifestJson.thumbnailHeight,
    order: manifestJson.order,
    capabilities: capabilities,
    flipThumbnail: (typeof manifestJson.flipThumbnail === 'undefined' || manifestJson.flipThumbnail === true) ? true : false
  }

  if(fs.existsSync(gifThumbnail)){
    info.gifThumbnail = 'thumbnail.gif'
  }

  if(manifestJson.templateType === 'app'){
    info.isMultiplePage = manifestJson.isMultiplePage,
    info.isMapAware = manifestJson.isMapAware,
    info.templateCreateVersion = manifestJson.templateCreateVersion
  }

  return info;
}

function updateCapabilities (capabilities, tag, locale) {
  if (!capabilities || !tag || !locale) {
    return capabilities
  } else {
    const capabilitiesInCurrentLocale = capabilities?.[locale] || []
    if (!capabilitiesInCurrentLocale.includes(tag)) {
      capabilitiesInCurrentLocale.push(tag)
    }
    capabilities[locale] = capabilitiesInCurrentLocale
  }
  return capabilities
}

function extendOneThemeManifest(content, manifestFile){
  let themeFolder = manifestFile.substring(0, manifestFile.length - 'manifest.json'.length);
  let manifestJson = JSON.parse(content.toString('utf-8'));

  manifestJson.styleFiles = {
    css: fs.existsSync(`${themeFolder}/style.scss`),
    js: fs.existsSync(`${themeFolder}/style.ts`)
  }

  return JSON.stringify(manifestJson, null, 2);
}

function isExtensionRepo(folder){
  if(!fs.existsSync(path.join(folder, 'manifest.json'))){
    return false;
  }

  let manifestJson = JSON.parse(fs.readFileSync(path.join(folder, 'manifest.json')));
  if(manifestJson.type === 'exb-web-extension-repo'){
    return true;
  }else{
    return false;
  }
}

function getWidgetsWebpackConfigs(allWidgetInfo) {
  const defaultConfig = {
    devtool: webpackCommon.sourceMapOption,
    resolve: {
      alias: webpackCommon.moduleAlias,
      extensions: webpackCommon.extensions,
      mainFields: webpackCommon.resolveMainFields
    },
    module: {
      rules: webpackCommon.getModuleRules()
    },
    externals: [
      webpackCommon.externalFunction
    ],
    stats: webpackCommon.stats,
    devServer: webpackCommon.devServer,
    optimization: webpackCommon.optimization
  };
  if(process.env.STAT){
    defaultConfig.optimization = {concatenateModules: false}
  }

  const sharedConfig = Object.assign({}, defaultConfig, {
    name: 'widgets',
    entry: allWidgetInfo.shared.entries,
    output: {
      filename: '[name].js',
      path: webpackCommon.outputPath,
      libraryTarget: "system",
      publicPath: '',
      chunkFilename: (pathData, assetInfo) => {
        // Widgets dynamic load chunks(using the import() function) are put in the widgets folder.
        // If multiple widgets use the same module, they'll share the same chunk.
        const chunckId = pathData.chunk.id
        const i = chunckId.indexOf('_widgets_')
        if (i < 0) {
          // generally, this means code uses /* webpackChunkName: "..." */ to name the chunk
          return `widgets/chunks/${chunckId}.js`
        }
        const sharedCodeI = chunckId.indexOf('_widgets_shared-code_')
        if (sharedCodeI > 0) {
          let fileName = chunckId.substring(sharedCodeI + '_widgets_shared-code_'.length)
          fileName = `widgets/shared-code/chunks/${fileName}.js`
          return fileName
        } else {
          let fileName = chunckId.substring(i + '_widgets_'.length)
          fileName = `widgets/chunks/${fileName}.js`
          return fileName
        }
      }
    },
    plugins: webpackCommon.getPlugins('widgets', allWidgetInfo.shared.files, []),
  });

  const standaloneConfigs = Object.keys(allWidgetInfo.standalone).map(widgetName => {
    const widgetInfo = allWidgetInfo.standalone[widgetName]
    return Object.assign({}, defaultConfig, {
      name: `widget-${widgetName}`,
      entry: widgetInfo.entries,
      output: {
        filename: '[name].js',
        path: webpackCommon.outputPath,
        libraryTarget: "system",
        publicPath: '',
        chunkFilename: (pathData, assetInfo) => {
          // Widgets dynamic load chunks(using the import() function) are put in the widgets folder.
          // If multiple widgets use the same module, they'll share the same chunk.
          const chunckId = pathData.chunk.id
          const i = chunckId.indexOf('_widgets_')
          if (i < 0) {
            // generally, this means code uses /* webpackChunkName: "..." */ to name the chunk
            return `${widgetInfo.info.uri}chunks/${chunckId}.js`
          }
          let fileName = chunckId.substring(i + '_widgets_'.length)
          fileName = `${widgetInfo.info.uri}chunks/${fileName}.js`
          return fileName
        }
      },
      plugins: webpackCommon.getPlugins(`widget-${widgetName}`, widgetInfo.files, []),
    });
  });

  return [sharedConfig].concat(standaloneConfigs);
}

function getThemesWebpackConfig(entries, toBeCopiedFiles, toBeCleanFiles){
  return {
    name: 'themes',
    entry: entries,
    output: {
      filename: '[name].js',
      path: webpackCommon.outputPath,
      libraryTarget: "system",
    },
    devtool: webpackCommon.sourceMapOption,
    resolve: {
      alias: webpackCommon.moduleAlias,
      extensions: webpackCommon.extensions,
      mainFields: webpackCommon.resolveMainFields
    },
    module: {
      rules: webpackCommon.getModuleRules()
    },
    plugins: webpackCommon.getPlugins('themes', toBeCopiedFiles, toBeCleanFiles).concat([
      webpackCommon.cssEntryPlugin,
      webpackCommon.extractThemeStylePlugin,
      webpackCommon.extractRtlThemeStylePlugin
    ]),
    externals: [
      webpackCommon.externalFunction
    ],
    stats: webpackCommon.stats,
    devServer: webpackCommon.devServer,
  };
}

function getTemplatesWebpackConfig(entries,toBeCopiedFiles, toBeCleanFiles){
  return {
    name: 'templates',
    entry: entries,
    output: {
      filename: '[name].js',
      path: webpackCommon.outputPath,
      libraryTarget: "system",
    },
    devtool: webpackCommon.sourceMapOption,
    resolve: {
      alias: webpackCommon.moduleAlias,
      extensions: webpackCommon.extensions,
      mainFields: webpackCommon.resolveMainFields
    },
    module: {
      rules: webpackCommon.getModuleRules()
    },
    plugins: webpackCommon.getPlugins('templates', toBeCopiedFiles, toBeCleanFiles),
    externals: [
    ],
    stats: webpackCommon.stats,
    devServer: webpackCommon.devServer,
  };
}

function mergeThemeWidgetWebpackInfo(configInfo, type){
  const ret = {
    shared: { entries: {}, files: [], infos: [] },
    standalone: {}
  }
  // let allInfos = [], allEntries = {}, allToBeCopiedFiles = [];
  configInfo.forEach(cInfo => {
    if (cInfo.shared) {
      ret.shared.infos = ret.shared.infos.concat(cInfo.shared.infos);
      ret.shared.files = ret.shared.files.concat(cInfo.shared.files);
      ret.shared.entries = Object.assign(ret.shared.entries, cInfo.shared.entries);
    }
    if (cInfo.standalone) {
      ret.standalone = Object.assign(ret.standalone, cInfo.standalone);
    }
  });

  const from = `./webpack/${type}-info.json`;
  if(fs.existsSync(from)){
    ret.shared.files = ret.shared.files.concat([{
      from,
      to: `${type}/${type}-info.json`,
      transform (content, _path) {
        let existedInfoPath = path.join(__dirname, `../dist/${type}/${type}-info-existed.json`);
        let existedInfos = [];
        if(fs.existsSync(existedInfoPath)){
          existedInfos = JSON.parse(fs.readFileSync(existedInfoPath));
        }

        const allInfos = ret.shared.infos.concat(Object.values(ret.standalone).map(v => v.info))
        let finalInfos = existedInfos.concat(allInfos);
        return JSON.stringify(finalInfos, null, 2);
      }
    }]);
  }

  return ret;
}

function mergeTemplateWebpackInfo(configInfo){
  let allInfos = {}, allEntries = {}, allToBeCopiedFiles = [];

  const mergeInfo = (all, cur) => {
    Object.keys(cur.infos || {}).forEach(tType => {
      if(all[tType]) {
        all[tType] = all[tType].concat(cur.infos[tType])
      }else{
        all[tType] = cur.infos[tType]
      }
    })
  }

  configInfo.forEach(cInfo => {
    allToBeCopiedFiles = allToBeCopiedFiles.concat(cInfo.files);
    mergeInfo(allInfos, cInfo)
    allEntries = Object.assign(allEntries, cInfo.entries);
  });

  let from = `./webpack/templates-info.json`;
  if(fs.existsSync(from)){
    allToBeCopiedFiles = allToBeCopiedFiles.concat([{
      from,
      to: `templates/templates-info.json`,
      transform (content, _path) {
        let existedInfoPath = path.join(__dirname, `../dist/templates/templates-info-existed.json`);
        let existedInfos = {};
        if(fs.existsSync(existedInfoPath)){
          existedInfos = JSON.parse(fs.readFileSync(existedInfoPath));
        }

        mergeInfo(allInfos, existedInfos);
        return JSON.stringify(allInfos, null, 2);
      }
    }]);
  }

  return { allEntries,allToBeCopiedFiles, allInfos};
}

const getAllEntries = (infoForWebpack) => {
  const allEntries = [].concat(infoForWebpack.shared.entries)
  Object.keys(infoForWebpack.standalone).forEach(widgetName => {
    Object.assign(allEntries, infoForWebpack.standalone[widgetName].entries)
  })
  return allEntries
}

function handleSharedCode(widgetsFolder, infoForWebpack) {
  const sharedCodeFolder = path.join(widgetsFolder, 'shared-code')
  if(fs.existsSync(sharedCodeFolder)){
    webpackCommon.moduleAlias['widgets/shared-code'] = sharedCodeFolder

    const sharedCodeExistedFilePath = path.join(__dirname, '../dist/widgets/shared-code/files-existed.json')
    let existedSharedCodeFiles = []
    if(fs.existsSync(sharedCodeExistedFilePath)){
      existedSharedCodeFiles = JSON.parse(fs.readFileSync(sharedCodeExistedFilePath))
    }

    fs.readdirSync(sharedCodeFolder).forEach(sharedCodeFile => {
      const allFiles = infoForWebpack.shared.files.concat(Object.values(infoForWebpack.standalone).map(v => v.files || []))
      const allEntries = getAllEntries(infoForWebpack)

      if (!fs.statSync(path.join(sharedCodeFolder, sharedCodeFile)).isDirectory()) {
        // all files end with .ts or .tsx under the shared-code folder are considered as an entry
        if (!/\.tsx?$/.test(sharedCodeFile)) {
          return
        }
        const entryName = `widgets/shared-code/${sharedCodeFile.replace(/\.[^/.]+$/, "")}`
        if (existedSharedCodeFiles.find(f => f.replace(/\.[^/.]+$/, "") == sharedCodeFile.replace(/\.[^/.]+$/, ""))) {
          console.error(`The entry ${entryName} is duplicated, please rename the file name.`)
          return
        }
        if (allEntries[entryName]) {
          console.error(`The entry ${entryName} is duplicated, please rename the file name.`)
          return
        }
        infoForWebpack.shared.entries[entryName] = [publicPathFile, path.join(sharedCodeFolder, sharedCodeFile)]
      } else {
        if (sharedCodeFile === 'translations') {
          // copy the translations folder to the dist folder
          if (existedSharedCodeFiles.includes('translations')) {
            console.error(`The translations folder is used.`)
            return
          }
          if (allFiles.find(f => f.from === path.join(sharedCodeFolder, sharedCodeFile))) {
            console.error(`The folder ${sharedCodeFile} is duplicated, please rename the folder name and copy the translations in "widget-webpack-override.js.".`)
            return
          }
          infoForWebpack.shared.files.push({ from: path.join(sharedCodeFolder, sharedCodeFile), to: 'widgets/shared-code/translations'})
        } else if (sharedCodeFile === 'lib') {
          fs.readdirSync(path.join(sharedCodeFolder, 'lib')).forEach(libSubFolder => {
            const subTranslationFolder = path.join(sharedCodeFolder, 'lib', libSubFolder, 'translations')
            if (fs.existsSync(subTranslationFolder) && fs.statSync(subTranslationFolder).isDirectory()) {
              // copy the translations folder to the dist folder
              if (existedSharedCodeFiles.includes(`lib/${libSubFolder}/translations`)) {
                console.error(`The ${subTranslationFolder} folder is duplicated.`)
                return
              }
              if (allFiles.find(f => f.from === subTranslationFolder)) {
                console.error(`The folder ${subTranslationFolder} is duplicated, please rename the folder name and copy the translations in "widget-webpack-override.js.".`)
                return
              }
              infoForWebpack.shared.files.push({ from: subTranslationFolder, to: `widgets/shared-code/lib/${libSubFolder}/translations`})
            }

            const subAssets = path.join(sharedCodeFolder, 'lib', libSubFolder, 'assets')
            if (fs.existsSync(subAssets) && fs.statSync(subAssets).isDirectory()) {
              // copy the assets folder to the dist folder
              if (existedSharedCodeFiles.includes(`lib/${libSubFolder}/assets`)) {
                console.error(`The lib/${libSubFolder}/assets folder is duplicated.`)
                return
              }
              if (allFiles.find(f => f.from === subAssets)) {
                console.error(`The folder ${subAssets} is duplicated, please rename the folder name and copy the assets in "widget-webpack-override.js.".`)
                return
              }
              infoForWebpack.shared.files.push({ from: subAssets, to: `widgets/shared-code/lib/${libSubFolder}/assets`})
            }
          })
        } else if (sharedCodeFile === 'assets') {
          // copy the assets folder to the dist folder
          if (existedSharedCodeFiles.includes(`assets`)) {
            console.error(`The assets folder is used.`)
            return
          }
          if (allFiles.find(f => f.from === path.join(sharedCodeFolder, sharedCodeFile))) {
            console.error(`The folder ${sharedCodeFile} is duplicated, please rename the folder name and copy the assets in "widget-webpack-override.js.".`)
            return
          }
          infoForWebpack.shared.files.push({ from: path.join(sharedCodeFolder, sharedCodeFile), to: 'widgets/shared-code/assets'})
        }
      }
    })
  }
}
