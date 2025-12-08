const fs = require('fs')
const childProcess = require("child_process");
const path = require('path')

const subfolders = getDirectSubfolders(process.cwd())

for(const subfolder of subfolders) {
  if(!isExtensionRepo(subfolder)) {
    continue
  }

  if(hasPackageJson(subfolder)) {
    outputPathLog(subfolder)
    childProcess.execSync('npm ci', { cwd: subfolder, env: process.env, stdio: 'inherit' })
  }
  const widgetsFolder = path.join(subfolder, 'widgets')
  if(fs.existsSync(widgetsFolder)) {
    const widgetSubFolders = getAllSubfolders(widgetsFolder)
    for(const widgetDir of widgetSubFolders) {
      if(fs.existsSync(path.join(widgetDir, 'package-lock.json'))) {
        outputPathLog(widgetDir, fs.existsSync(path.join(widgetDir, 'package-lock.json')))
        npmInstall(widgetDir)
      }
    }
  }
}

// Lists subfolders in a folder
function getDirectSubfolders (folder) {
  return fs.readdirSync(folder)
    .filter(subfolder => fs.statSync(path.join(folder, subfolder)).isDirectory())
    .filter(subfolder => subfolder !== 'node_modules' && subfolder[0] !== '.')
    .map(subfolder => path.join(folder, subfolder))
}

function getAllSubfolders (folders) {
  const directSubfolders = getDirectSubfolders(folders)
  const nonDirectFolders =  directSubfolders.map(directSubfolder => getAllSubfolders(directSubfolder)).flat(1)
  return [...directSubfolders, ...nonDirectFolders]
}

// Check whether it is extension repo
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

function hasPackageJson (folder) {
  return !!fs.existsSync(path.join(folder, 'package-lock.json'))
}

function outputPathLog (folder) {
  console.log('=========================================================')
  console.log(`Installing dependencies in ${folder}`)
  console.log('=========================================================')
}

function npmInstall (where) {
  childProcess.execSync('npm ci', { cwd: where, env: process.env, stdio: 'inherit' })
}