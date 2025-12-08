const fs = require('fs')
const path = require('path')

const webpackExtCommon = require('./webpack-extensions.common')
const basePath = path.join(__dirname, '..')

// eslint-disable-next-line one-var, prefer-const
let configs = [], widgetsConfigInfo = [], themesConfigInfo = []

fs.readdirSync(basePath).forEach(repoFolder => {
  if(!fs.statSync(path.join(basePath, repoFolder)).isDirectory()) {
    return
  }
  if(!webpackExtCommon.isExtensionRepo(path.join(basePath, repoFolder))) {
    return
  }

  const widgetsFolder = path.join(basePath, repoFolder, 'widgets')
  if(fs.existsSync(widgetsFolder)) {
    widgetsConfigInfo.push(webpackExtCommon.getWidgetsInfoForWebpack(widgetsFolder))
  }

  const themesFolder = path.join(basePath, repoFolder, 'themes')
  if(fs.existsSync(themesFolder)) {
    themesConfigInfo.push(webpackExtCommon.getThemesInfoForWebpack(themesFolder))
  }
})

const mergedWidgetConfigInfo = webpackExtCommon.mergeThemeWidgetWebpackInfo(widgetsConfigInfo, 'widgets')
const mergedThemeConfigInfo = webpackExtCommon.mergeThemeWidgetWebpackInfo(themesConfigInfo, 'themes')

const allWidgetInfo = mergedWidgetConfigInfo.shared.infos.concat(Object.values(mergedWidgetConfigInfo.standalone).map(e => e.info))

const allThemeInfo = mergedThemeConfigInfo.shared.infos.concat(Object.values(mergedThemeConfigInfo.standalone).map(e => e.info))
const toBeCleanThemes = allThemeInfo.map(info => {
  return `dist/${info.uri}`
})

clearCustomWidgets()
clearCustomSharedCode()

if (Object.keys(allWidgetInfo).length > 0) {
  let widgetWebpackConfigs = webpackExtCommon.getWidgetsWebpackConfigs(mergedWidgetConfigInfo)

  const widgetWebpackOverridePath = path.join(basePath, 'webpack/widget-webpack-override.js')
  if (fs.existsSync(widgetWebpackOverridePath)) {
    const widgetWebpackOverride = require(widgetWebpackOverridePath)
    widgetWebpackConfigs = widgetWebpackOverride(widgetWebpackConfigs)
  }

  configs = configs.concat(widgetWebpackConfigs)
}

Object.keys(mergedThemeConfigInfo.shared.entries).length > 0 && configs.push(webpackExtCommon.getThemesWebpackConfig(mergedThemeConfigInfo.shared.entries, mergedThemeConfigInfo.shared.files, toBeCleanThemes))

module.exports = configs


function clearCustomWidgets() {
  const existedWidgetInfos = getWidgetInfos('../dist/widgets/widgets-info-existed.json')
  const widgetInfos = getWidgetInfos('../dist/widgets/widgets-info.json')
  widgetInfos.forEach(w => {
    // Not in existed widgets means the widget is custom widget, need to remove it.
    if (!existedWidgetInfos.some(existedWidget => existedWidget.uri === w.uri)) {
      let distPath
      if(process.env.OUTPUT_FOLDER) {
        distPath = path.join(__dirname, `../${process.env.OUTPUT_FOLDER}`)
      }else{
        distPath = path.join(__dirname, '../dist')
      }

      const widgetFolder = path.join(distPath, w.uri)
      if(fs.existsSync(widgetFolder)) {
        fs.rmSync(widgetFolder, {recursive: true, maxRetries: 2})
      }
    }
  })
}

function clearCustomSharedCode() {
  const sharedCodePath = path.join(__dirname, '../dist/widgets/shared-code')
  const filePath = path.join(sharedCodePath, 'files-existed.json')
  let existedSharedCodeFiles = []
  if(fs.existsSync(filePath)) {
    existedSharedCodeFiles = JSON.parse(fs.readFileSync(filePath))
  }

  visitSharedCodeFolder(path.join(__dirname, '../dist/widgets/shared-code'), (filePath, fileName) => {
    const rPath = path.relative(sharedCodePath, filePath).replace(/\\/g, '/')
    if(!existedSharedCodeFiles.includes(rPath)) {
      fs.rmSync(filePath, {recursive: true, maxRetries: 2})
    }
  })
}

function getWidgetInfos(relativePath) {
  const infoPath = path.join(__dirname, relativePath)
  let infos = []
  if(fs.existsSync(infoPath)) {
    infos = JSON.parse(fs.readFileSync(infoPath))
  }

  return infos
}

function visitSharedCodeFolder(folderPath, cb) {
  const files = fs.readdirSync(folderPath)
  files.forEach(fileName => {
    const filePath = path.normalize(folderPath + '/' + fileName)

    if(fs.statSync(filePath).isDirectory()) {
      if (fileName === 'node_modules') {
        return
      }
      if (fileName === 'assets' || fileName === 'translations') {
        cb(filePath, fileName)
      } else {
        visitSharedCodeFolder(filePath, cb)
      }
    } else {
      cb(filePath, fileName)
    }
  })
}
