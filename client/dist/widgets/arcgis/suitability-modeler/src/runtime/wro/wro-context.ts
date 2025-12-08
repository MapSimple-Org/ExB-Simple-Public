/**
  Licensing

  Copyright 2021 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/

import { ModelController, type WroModel } from './wro-model'
import { WroService } from './wro-service'

export class WroContext {
  // lib = {
  //   esri: {
  //     esriRequest: esriRequest
  //   }
  // }

  modelController: ModelController = new ModelController()

  // all overriden by widget.tsx
  getConfig = (): any => null
  getId = (): string => null
  getLabel = (): string => null
  getPortal = (): any => null
  getPortalUrl = (): string => null
  getTheme = (): any => null
  getUser = (): any => null
  getView = (): any => null

  async loadModel (serviceUrl: string, itemId: string): Promise<any> {
    const wroService: WroService = new WroService()
    const wroModel: WroModel = await wroService.loadModel(this, serviceUrl, itemId)
    return wroModel
  }

  nls = (id: string, values?: any): string => {
    return id
  }
}
