import { DataSourceManager, type FeatureLayerDataSource, type FeatureQueryDataSource, DataSourceTypes, esri } from 'jimu-core'

/*
This 'GDBVersionManager' supports Version Management Service (VMS) (Branch Versioning) available through ArcGIS Enterprise.
The Feature service must have branch versioning enabled to use this class.
If you standalone, call GDBVersionManager.getInstance().getUnqiueVMSURL(). This will look through all the data sources and return
an array of valid VMS URLs.
If you also have a VMS enabled service, you can call the other methods directly such as GDBVersionManager.getInstance().getVersions()
*/

export default class GDBVersionManager {
  private static instance: GDBVersionManager
  static getInstance (): GDBVersionManager {
    if (!GDBVersionManager.instance) {
      GDBVersionManager.instance = new GDBVersionManager()
    }
    return GDBVersionManager.instance
  }

  private readonly defaultVersion: string = 'sde.DEFAULT'
  private isOrgUser: boolean = false
  private uniqueURLs: any[] = []

  getUniqueVMSURL (specific?: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const ds = DataSourceManager.getInstance()
      const dsList = ds.getDataSources()
      const urls = []
      const vmsUrls = []
      for (const key in dsList) {
        if (specific) {
          if (key.includes(specific)) {
            if (dsList[key].type === DataSourceTypes.FeatureLayer) {
              const dsJson = dsList[key].getDataSourceJson()
              if (dsJson.url.includes('FeatureServer')) {
                const trunURL = dsJson.url.substring(0, dsJson.url.indexOf('FeatureServer'))
                if (!urls.includes(trunURL)) {
                  urls.push(trunURL)
                }
              }
            }
          }
        } else {
          if (dsList[key].type === DataSourceTypes.FeatureLayer) {
            const dsJson = dsList[key].getDataSourceJson()
            if (dsJson.url.includes('FeatureServer')) {
              const trunURL = dsJson.url.substring(0, dsJson.url.indexOf('FeatureServer'))
              if (!urls.includes(trunURL)) {
                urls.push(trunURL)
              }
            }
          }
        }
      }
      //check if the uniqueURLs have VMS
      if (urls.length > 0) {
        const promises = urls.map(async (u: string, i: number) => {
          let valid = false
          valid = await this.checkValidVMS(u)
          if (valid) {
            const name = await this.serviceNameLookup(u)
            vmsUrls.push({ url: u, name: name })
          }
        })
        Promise.all(promises).then((result) => {
          this.uniqueURLs = vmsUrls
          resolve(vmsUrls)
        })
      } else {
        this.uniqueURLs = vmsUrls
        resolve(vmsUrls)
      }
    })
  }

  async checkValidVMS (url: string, token?: string): Promise<boolean> {
    let returnVal = false
    let trunURL = url
    if (trunURL.includes('FeatureServer')) {
      trunURL = trunURL.substring(0, trunURL.indexOf('FeatureServer'))
    }
    if (trunURL.includes('MapServer')) {
      trunURL = trunURL.substring(0, trunURL.indexOf('MapServer'))
    }
    const requestURL = trunURL + 'VersionManagementServer'
    let params = null
    if (token) {
      params = { f: 'json', token: token }
    } else {
      params = { f: 'json' }
    }
    returnVal = await this.requestService({ method: 'POST', url: requestURL, params: params }).then((result: any) => {
      // eslint-disable-next-line no-prototype-builtins
      if (result.hasOwnProperty('name')) {
        if (result.name === 'Version Management Server') {
          return (true)
        } else {
          return (false)
        }
      } else {
        return (false)
      }
    })
      .catch((e: any) => {
        return (false)
      })
    return returnVal
  }

  getVersions (service?: string, url?: string, token?: string): any {
    return new Promise((resolve, reject) => {
      if (url) {
        let trunURL = url
        if (trunURL.includes('FeatureServer')) {
          trunURL = trunURL.substring(0, trunURL.indexOf('FeatureServer'))
        }
        if (trunURL.includes('MapServer')) {
          trunURL = trunURL.substring(0, trunURL.indexOf('MapServer'))
        }
        if (token) {
          resolve(this.requestVersions(trunURL, token))
        } else {
          resolve(this.requestVersions(trunURL))
        }
      } else {
        if (this.uniqueURLs.length === 0) {
          this.getUniqueVMSURL().then((arrResult: any[]) => {
            let serviceObj = arrResult[0]
            if (service) {
              serviceObj = arrResult.filter((val: any) => {
                return (val.name === service)
              })
            }
            const serviceURL = serviceObj[0].url
            if (token) {
              resolve(this.requestVersions(serviceURL, token))
            } else {
              resolve(this.requestVersions(serviceURL))
            }
          })
        } else {
          let serviceObj = this.uniqueURLs[0]
          if (service) {
            serviceObj = this.uniqueURLs.filter((val: any) => {
              return (val.name === service)
            })
          }
          const serviceURL = serviceObj[0].url
          if (token) {
            resolve(this.requestVersions(serviceURL, token))
          } else {
            resolve(this.requestVersions(serviceURL))
          }
        }
      }
    })
  }

  changeGDBVersion (name: string, dsList: any[]): boolean {
    let returnVal = false
    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const key in dsList) {
      if (dsList[key].type === DataSourceTypes.FeatureLayer ||
        dsList[key].type === DataSourceTypes.SubtypeGroupLayer ||
        dsList[key].type === DataSourceTypes.SubtypeSublayer
      ) {
        const dsObj = this.getLayerObject(dsList[key])
        dsObj.changeGDBVersion(name)
        returnVal = true
      }
      if (dsList[key].type === DataSourceTypes.FeatureService) {
        dsList[key].changeGDBVersion(name)
        returnVal = true
      } else if (dsList[key].type === DataSourceTypes.MapService) {
        dsList[key].changeGDBVersion(name)
        returnVal = true
      } else {
        //do nothing
      }
    }
    return returnVal
  }

  createGDBVersion (versionObj: any, token: string, dsList: any[], service?: string, url?: string, autoSwitch?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      const returnVal = {}
      let requestURL = null
      if (this.isOrgUser) {
        const isValid = this.checkValidVersionName(versionObj.versionName)
        if (isValid.success) {
          if (url) {
            requestURL = url
            if (requestURL.indexOf('FeatureServer') >= 0) {
              requestURL = requestURL.substring(0, requestURL.indexOf('FeatureServer'))
              requestURL = requestURL + 'VersionManagementServer/create'
            } else if (requestURL.indexOf('MapServer') >= 0) {
              requestURL = requestURL.substring(0, requestURL.indexOf('MapServer'))
              requestURL = requestURL + 'VersionManagementServer/create'
            } else {
              requestURL = requestURL + 'VersionManagementServer/create'
            }
          } else {
            let serviceObj = this.uniqueURLs[0]
            if (service) {
              serviceObj = this.uniqueURLs.filter((val: any) => {
                return (val.name === service)
              })
            }
            const serviceURL = serviceObj[0].url
            requestURL = serviceURL + 'VersionManagementServer/create'
          }
          this.requestService({
            method: 'POST',
            url: requestURL,
            params: {
              f: 'json',
              versionName: versionObj.versionName,
              description: versionObj.versionDescription,
              accessPermission: versionObj.versionScope,
              token: token
            }
          })
            .then((result: any) => {
              if (autoSwitch) {
                // eslint-disable-next-line no-prototype-builtins
                if (result.hasOwnProperty('versionInfo')) {
                  this.changeGDBVersion(result.versionInfo.versionName, dsList)
                }
              }
              resolve(result)
            })
            .catch((e: any) => {
              resolve(e)
            })
        } else {
          resolve(isValid)
        }
      } else {
        resolve(returnVal)
      }
    })
  }

  deleteGDBVersion (name: string, token: string, dsList: any[], service?: string, url?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (name.toLowerCase() !== 'sde.default') {
        const returnVal = {}
        let requestURL = null
        if (this.isOrgUser) {
          if (url) {
            requestURL = url
            if (requestURL.indexOf('FeatureServer') >= 0) {
              requestURL = requestURL.substring(0, requestURL.indexOf('FeatureServer'))
              requestURL = requestURL + 'VersionManagementServer/delete'
            } else if (requestURL.indexOf('MapServer') >= 0) {
              requestURL = requestURL.substring(0, requestURL.indexOf('MapServer'))
              requestURL = requestURL + 'VersionManagementServer/delete'
            } else {
              requestURL = requestURL + 'VersionManagementServer/delete'
            }
          } else {
            let serviceObj = this.uniqueURLs[0]
            if (service) {
              serviceObj = this.uniqueURLs.filter((val: any) => {
                return (val.name === service)
              })
            }
            const serviceURL = serviceObj[0].url
            requestURL = serviceURL + 'VersionManagementServer/delete'
          }
          this.requestService({
            method: 'POST',
            url: requestURL,
            params: {
              f: 'json',
              versionName: name,
              token: token
            }
          })
            .then((result: any) => {
              const layersToSwitchToDefault = []
              // eslint-disable-next-line @typescript-eslint/no-for-in-array
              for (const key in dsList) {
                if (dsList[key].type === DataSourceTypes.FeatureLayer) {
                  const dsObj = this.getLayerObject(dsList[key])
                  if (dsObj.getGDBVersion() === name) {
                    layersToSwitchToDefault[key] = dsList[key]
                  }
                }
              }
              this.changeGDBVersion(this.defaultVersion, layersToSwitchToDefault)
              result.version = this.defaultVersion
              resolve(result)
            })
            .catch((e: any) => {
              resolve(e)
            })
        } else {
          resolve(returnVal)
        }
      } else {
        resolve({ error: { message: 'Cannot delete Default version' } })
      }
    })
  }

  alterGDBVersion (versionObj: any, token: string, dsList: any[], service?: string, url?: string, autoSwitch?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      const returnVal = {}
      let requestURL = null
      if (this.isOrgUser) {
        const isValid = this.checkValidVersionName(versionObj.versionName)
        if (isValid.success) {
          let versionStripped = versionObj.versionGuid.replace('{', '')
          versionStripped = versionStripped.replace('}', '')
          if (url) {
            requestURL = url
            if (requestURL.indexOf('FeatureServer') >= 0) {
              requestURL = requestURL.substring(0, requestURL.indexOf('FeatureServer'))
              requestURL = requestURL + 'VersionManagementServer/versions/' + versionStripped + '/alter'
            } else if (requestURL.indexOf('MapServer') >= 0) {
              requestURL = requestURL.substring(0, requestURL.indexOf('MapServer'))
              requestURL = requestURL + 'VersionManagementServer/versions/' + versionStripped + '/alter'
            } else {
              requestURL = requestURL + 'VersionManagementServer/versions/' + versionStripped + '/alter'
            }
          } else {
            let serviceObj = this.uniqueURLs[0]
            if (service) {
              serviceObj = this.uniqueURLs.filter((val: any) => {
                return (val.name === service)
              })
            }
            const serviceURL = serviceObj[0].url
            requestURL = serviceURL + 'VersionManagementServer/versions/' + versionStripped + '/alter'
          }
          this.requestService({
            method: 'POST',
            url: requestURL,
            params: {
              f: 'json',
              versionName: versionObj.versionName,
              description: versionObj.versionDescription,
              accessPermission: versionObj.versionScope,
              ownerName: versionObj.versionOwner,
              token: token
            }
          })
            .then((result: any) => {
              if (autoSwitch) {
                this.changeGDBVersion(versionObj.versionOwner + '.' + versionObj.versionName, dsList)
              }
              resolve(result)
            })
            .catch((e: any) => {
              resolve(e)
            })
        } else {
          resolve(isValid)
        }
      } else {
        resolve(returnVal)
      }
    })
  }

  getVersionState (versionObj: any, token: string, service?: string, url?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let requestURL = null
      let versionStripped = versionObj.versionGuid.replace('{', '')
      versionStripped = versionStripped.replace('}', '')
      if (url) {
        requestURL = url
        if (requestURL.indexOf('FeatureServer') >= 0) {
          requestURL = requestURL.substring(0, requestURL.indexOf('FeatureServer'))
          requestURL = requestURL + 'VersionManagementServer/versions/' + versionStripped
        } else if (requestURL.indexOf('MapServer') >= 0) {
          requestURL = requestURL.substring(0, requestURL.indexOf('MapServer'))
          requestURL = requestURL + 'VersionManagementServer/versions/' + versionStripped
        } else {
          requestURL = requestURL + 'VersionManagementServer/versions/' + versionStripped
        }
      } else {
        let serviceObj = this.uniqueURLs[0]
        if (service) {
          serviceObj = this.uniqueURLs.filter((val: any) => {
            return (val.name === service)
          })
        }
        const serviceURL = serviceObj[0].url
        requestURL = serviceURL + 'VersionManagementServer/versions/' + versionStripped
      }
      this.requestService({
        method: 'POST',
        url: requestURL,
        params: {
          f: 'json',
          token: token
        }
      })
        .then((result: any) => {
          resolve(result)
        })
        .catch((e: any) => {
          resolve(e)
        })
    })
  }

  checkValidVersionName (name: string): any {
    const retVal = { success: true, error: { message: 'Version is valid' } }
    const charLimit = 62
    if (name.length <= charLimit) {
      //first character cannot be a space
      if (name.substring(0, 1) === ' ') {
        retVal.success = false
        retVal.error.message = 'Version name can not start with a space'
      } else {
        //version cannot have . ; ' or '
        if (name.match(/(?=.*[.;'"])/)) {
          retVal.success = false
          retVal.error.message = 'Version name can not have a period, semicolon, and single or double quotes'
        }
      }
    } else {
      retVal.success = false
      retVal.error.message = 'Exceeded ' + charLimit + ' characters for version name'
    }
    return retVal
  }

  private requestVersions (serviceURL?: string, token?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let requestURL = serviceURL
      let params = {}
      if (token) {
        requestURL = requestURL + 'VersionManagementServer/versionInfos'
        params = { f: 'json', includeHidden: true, token: token }
        this.isOrgUser = true
      } else {
        requestURL = requestURL + 'VersionManagementServer/versions'
        params = { f: 'json', includeHidden: true }
        this.isOrgUser = false
      }
      //requestURL = requestURL + 'VersionManagementServer/versions';
      this.requestService({ method: 'POST', url: requestURL, params: params })
        .then((result: any) => {
          // eslint-disable-next-line no-prototype-builtins
          if (result.hasOwnProperty('error')) {
            //if there is an error, call again, this time with no token so it goes to the open end point
            //(won't have create/delete abilities, just for listing and switching)
            if (token) {
              if (serviceURL) {
                console.log('second pass, service url')
                this.getVersions(serviceURL).then((secondPass: any) => {
                  //although we get a list of versions using non token endpoint. Manage version tools should not be enabled in consumer.
                  secondPass.canManage = false
                  resolve(secondPass)
                })
              } else {
                console.log('second pass, no service url')
                this.getVersions().then((secondPass: any) => {
                  //although we get a list of versions using non token endpoint. Manage version tools should not be enabled in consumer.
                  secondPass.canManage = false
                  resolve(secondPass)
                })
              }
            } else {
              result.canManage = false
              resolve(result)
            }
          } else {
            //inject that you can manage version since it's a signed on org user
            result.canManage = true
            resolve(result)
          }
        })
        .catch((e: any) => {
          resolve(e)
        })
    })
  }

  private getLayerObject (ds: FeatureLayerDataSource | FeatureQueryDataSource): FeatureQueryDataSource | FeatureLayerDataSource {
    if (ds.type === DataSourceTypes.FeatureLayer) {
      return (ds as FeatureLayerDataSource)
    } else {
      return ds
    }
  }

  private serviceNameLookup (service: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const requestURL = service + 'FeatureServer'
      const params = { f: 'json' }
      this.requestService({ method: 'POST', url: requestURL, params: params }).then((result: any) => {
        // eslint-disable-next-line no-prototype-builtins
        if (result.hasOwnProperty('documentInfo')) {
          resolve(result.documentInfo.Title)
        } else {
          resolve('')
        }
      })
        .catch((e: any) => {
          resolve(e)
        })
    })
  }

  private versionRead (opts: any): any {
    return new Promise((resolve, reject) => {
      let requestURL = this.uniqueURLs[0]
      let versionStripped = opts.versionGuid.replace('{', '')
      versionStripped = versionStripped.replace('}', '')
      requestURL = requestURL + 'VersionManagementServer/versions/' + versionStripped + '/' + opts.action + 'Reading/'
      this.requestService({
        method: 'POST',
        url: requestURL,
        params: {
          f: 'json',
          sessionId: opts.versionGuid,
          token: opts.token
        }
      }).then((result) => {
        resolve(result)
      })
    })
  }

  searchPortalUsers (url: string, search: string, token: string): any {
    return new Promise((resolve, reject) => {
      //let portalUrl = portalUrlUtils.getPortalSelfInfoUrl(url);
      let userURL = url + '/sharing/rest/community/users'
      if (url.includes('sharing/rest')) {
        userURL = url + '/community/users'
      }
      this.requestService({
        method: 'POST',
        url: userURL,
        params: {
          f: 'json',
          q: search,
          token: token
        }
      })
        .then((result: any) => {
          resolve(result)
        })
        .catch((e: any) => {
          resolve(e)
        })
    })
  }

  private requestService (opts: any): Promise<any> {
    return new Promise(function (resolve, reject) {
      const requestOptions = {
        params: opts.params,
        httpMethod: opts.method
      }
      esri.restRequest.request(opts.url, requestOptions).then((result: any) => {
        resolve(result)
      })
        .catch((e: any) => {
          resolve(e)
        })
    })
  }
}
