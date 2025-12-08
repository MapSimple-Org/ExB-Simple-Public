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

import type { ColorInfo, ColormapInfo } from './wro-model'

// one object for all instances of the widget
let colormapDefinitions: ColormapInfo[]
let labelsInitialized: boolean = false

export function findColormapInfo (name: string): ColormapInfo {
  let found: ColormapInfo
  if (colormapDefinitions) {
    colormapDefinitions.some((def: ColormapInfo) => {
      if (name === def.name) {
        found = def
      }
      return !!found
    })
  }
  return found
}

export function findColormapNameFromRasterColormap (colormap): string {
  let found: string
  if (colormapDefinitions) {
    colormapDefinitions.some((def: ColormapInfo) => {
      const match = def.colors.every((colorInfo: ColorInfo, index) => {
        let match2 = false
        const a1 = [colorInfo.value].concat(colorInfo.rgb)
        const a2 = colormap[index]
        if (a1 && a2 && a1.length === a2.length) {
          match2 = a1.every((v, i) => {
            return v === a2[i]
          })
        }
        return match2
      })
      if (match) found = def.name
      return !!found
    })
  }
  return found
}

export function getDefinitions (): ColormapInfo[] {
  if (!colormapDefinitions) {
    colormapDefinitions = makeColormapDefinitions()
  }
  return colormapDefinitions
}

export function getDefaultColormapName (): string {
  return '1_9_red_yellow_green'
}

export function initLabels (nls): void {
  if (labelsInitialized) return
  if (!colormapDefinitions) {
    colormapDefinitions = makeColormapDefinitions()
  }
  colormapDefinitions.forEach(def => {
    def.label = nls('wro_' + def.name) || def.name
    def.colors.forEach(c => {
      c.label = nls('wro_colorRamp_' + c.value.toString()) || '' + c.value.toString()
    })
  })
  labelsInitialized = true
}

function makeColormapDefinitions (): ColormapInfo[] {
  const definitions: ColormapInfo[] = [
    {
      name: '1_9_green_yellow_red',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [38, 115, 0] },
        { label: null, value: 2, rgb: [86, 148, 0] },
        { label: null, value: 3, rgb: [39, 181, 0] },
        { label: null, value: 4, rgb: [197, 219, 0] },
        { label: null, value: 5, rgb: [255, 255, 0] },
        { label: null, value: 6, rgb: [255, 195, 0] },
        { label: null, value: 7, rgb: [250, 142, 0] },
        { label: null, value: 8, rgb: [242, 85, 0] },
        { label: null, value: 9, rgb: [230, 0, 0] }
      ]
    }, {
      name: '1_9_red_yellow_green',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [230, 0, 0] },
        { label: null, value: 2, rgb: [242, 85, 0] },
        { label: null, value: 3, rgb: [250, 142, 0] },
        { label: null, value: 4, rgb: [255, 195, 0] },
        { label: null, value: 5, rgb: [255, 255, 0] },
        { label: null, value: 6, rgb: [197, 219, 0] },
        { label: null, value: 7, rgb: [39, 181, 0] },
        { label: null, value: 8, rgb: [86, 148, 0] },
        { label: null, value: 9, rgb: [38, 115, 0] }
      ]
    }, {
      name: '1_9_yellow_to_dark_red',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [255, 255, 128] },
        { label: null, value: 2, rgb: [252, 233, 106] },
        { label: null, value: 3, rgb: [250, 209, 85] },
        { label: null, value: 4, rgb: [247, 190, 67] },
        { label: null, value: 5, rgb: [242, 167, 46] },
        { label: null, value: 6, rgb: [207, 122, 31] },
        { label: null, value: 7, rgb: [173, 83, 19] },
        { label: null, value: 8, rgb: [138, 46, 10] },
        { label: null, value: 9, rgb: [107, 0, 0] }
      ]
    }, {
      name: '1_9_dark_red_to_yellow',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [107, 0, 0] },
        { label: null, value: 2, rgb: [138, 46, 10] },
        { label: null, value: 3, rgb: [173, 83, 19] },
        { label: null, value: 4, rgb: [207, 122, 31] },
        { label: null, value: 5, rgb: [242, 167, 46] },
        { label: null, value: 6, rgb: [247, 190, 67] },
        { label: null, value: 7, rgb: [250, 209, 85] },
        { label: null, value: 8, rgb: [252, 233, 106] },
        { label: null, value: 9, rgb: [255, 255, 128] }
      ]
    }, {
      name: '1_9_light_gray_to_dark_gray',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [219, 219, 219] },
        { label: null, value: 2, rgb: [196, 196, 196] },
        { label: null, value: 3, rgb: [176, 176, 176] },
        { label: null, value: 4, rgb: [156, 156, 156] },
        { label: null, value: 5, rgb: [135, 135, 135] },
        { label: null, value: 6, rgb: [117, 117, 117] },
        { label: null, value: 7, rgb: [99, 99, 99] },
        { label: null, value: 8, rgb: [84, 84, 84] },
        { label: null, value: 9, rgb: [69, 69, 69] }
      ]
    }, {
      name: '1_9_dark_gray_to_light_gray',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [69, 69, 69] },
        { label: null, value: 2, rgb: [84, 84, 84] },
        { label: null, value: 3, rgb: [99, 99, 99] },
        { label: null, value: 4, rgb: [117, 117, 117] },
        { label: null, value: 5, rgb: [135, 135, 135] },
        { label: null, value: 6, rgb: [156, 156, 156] },
        { label: null, value: 7, rgb: [176, 176, 176] },
        { label: null, value: 8, rgb: [196, 196, 196] },
        { label: null, value: 9, rgb: [219, 219, 219] }
      ]
    }, {
      name: '1_9_light_brown_to_dark_brown',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [250, 233, 212] },
        { label: null, value: 2, rgb: [242, 208, 184] },
        { label: null, value: 3, rgb: [235, 187, 160] },
        { label: null, value: 4, rgb: [224, 163, 135] },
        { label: null, value: 5, rgb: [217, 144, 113] },
        { label: null, value: 6, rgb: [207, 124, 91] },
        { label: null, value: 7, rgb: [194, 103, 70] },
        { label: null, value: 8, rgb: [184, 84, 53] },
        { label: null, value: 9, rgb: [171, 65, 36] }
      ]
    }, {
      name: '1_9_dark_brown_to_light_brown',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [171, 65, 36] },
        { label: null, value: 2, rgb: [184, 84, 53] },
        { label: null, value: 3, rgb: [194, 103, 70] },
        { label: null, value: 4, rgb: [207, 124, 91] },
        { label: null, value: 5, rgb: [217, 144, 113] },
        { label: null, value: 6, rgb: [224, 163, 135] },
        { label: null, value: 7, rgb: [235, 187, 160] },
        { label: null, value: 8, rgb: [242, 208, 184] },
        { label: null, value: 9, rgb: [250, 233, 212] }
      ]
    }, {
      name: '1_9_full_spectrum_bright_red_to_blue',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [255, 0, 0] },
        { label: null, value: 2, rgb: [255, 119, 0] },
        { label: null, value: 3, rgb: [255, 200, 0] },
        { label: null, value: 4, rgb: [238, 255, 56] },
        { label: null, value: 5, rgb: [182, 255, 143] },
        { label: null, value: 6, rgb: [89, 255, 225] },
        { label: null, value: 7, rgb: [51, 194, 255] },
        { label: null, value: 8, rgb: [56, 106, 255] },
        { label: null, value: 9, rgb: [0, 0, 255] }
      ]
    }, {
      name: '1_9_full_spectrum_bright_blue_to_red',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [0, 0, 255] },
        { label: null, value: 2, rgb: [56, 106, 255] },
        { label: null, value: 3, rgb: [51, 194, 255] },
        { label: null, value: 4, rgb: [89, 255, 225] },
        { label: null, value: 5, rgb: [182, 255, 143] },
        { label: null, value: 6, rgb: [238, 255, 56] },
        { label: null, value: 7, rgb: [255, 200, 0] },
        { label: null, value: 8, rgb: [255, 119, 0] },
        { label: null, value: 9, rgb: [255, 0, 0] }
      ]
    }, {
      name: '1_9_partial_spectrum_yellow_to_blue',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [242, 241, 162] },
        { label: null, value: 2, rgb: [252, 250, 98] },
        { label: null, value: 3, rgb: [255, 255, 0] },
        { label: null, value: 4, rgb: [255, 149, 0] },
        { label: null, value: 5, rgb: [255, 0, 0] },
        { label: null, value: 6, rgb: [245, 5, 189] },
        { label: null, value: 7, rgb: [176, 7, 237] },
        { label: null, value: 8, rgb: [99, 24, 204] },
        { label: null, value: 9, rgb: [7, 29, 173] }
      ]
    }, {
      name: '1_9_partial_spectrum_blue_to_yellow',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [7, 29, 173] },
        { label: null, value: 2, rgb: [99, 24, 204] },
        { label: null, value: 3, rgb: [176, 7, 237] },
        { label: null, value: 4, rgb: [245, 5, 189] },
        { label: null, value: 5, rgb: [255, 0, 0] },
        { label: null, value: 6, rgb: [255, 149, 0] },
        { label: null, value: 7, rgb: [255, 255, 0] },
        { label: null, value: 8, rgb: [252, 250, 98] },
        { label: null, value: 9, rgb: [242, 241, 162] }
      ]
    }, {
      name: '1_9_yellow_green_to_dark_blue',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [255, 255, 128] },
        { label: null, value: 2, rgb: [182, 245, 88] },
        { label: null, value: 3, rgb: [113, 235, 47] },
        { label: null, value: 4, rgb: [59, 214, 45] },
        { label: null, value: 5, rgb: [61, 184, 104] },
        { label: null, value: 6, rgb: [42, 156, 154] },
        { label: null, value: 7, rgb: [33, 110, 158] },
        { label: null, value: 8, rgb: [31, 62, 140] },
        { label: null, value: 9, rgb: [12, 16, 120] }
      ]
    }, {
      name: '1_9_dark_blue_to_yellow_green',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [12, 16, 120] },
        { label: null, value: 2, rgb: [31, 62, 140] },
        { label: null, value: 3, rgb: [33, 110, 158] },
        { label: null, value: 4, rgb: [42, 156, 154] },
        { label: null, value: 5, rgb: [61, 184, 104] },
        { label: null, value: 6, rgb: [59, 214, 45] },
        { label: null, value: 7, rgb: [113, 235, 47] },
        { label: null, value: 8, rgb: [182, 245, 88] },
        { label: null, value: 9, rgb: [255, 255, 128] }
      ]
    }, {
      name: '1_9_cold_to_hot_diverging',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [40, 146, 199] },
        { label: null, value: 2, rgb: [109, 169, 179] },
        { label: null, value: 3, rgb: [160, 194, 155] },
        { label: null, value: 4, rgb: [206, 222, 129] },
        { label: null, value: 5, rgb: [250, 250, 100] },
        { label: null, value: 6, rgb: [252, 196, 76] },
        { label: null, value: 7, rgb: [250, 141, 52] },
        { label: null, value: 8, rgb: [242, 89, 34] },
        { label: null, value: 9, rgb: [232, 16, 20] }
      ]
    }, {
      name: '1_9_hot_to_cold_diverging',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [232, 16, 20] },
        { label: null, value: 2, rgb: [242, 89, 34] },
        { label: null, value: 3, rgb: [250, 141, 52] },
        { label: null, value: 4, rgb: [252, 196, 76] },
        { label: null, value: 5, rgb: [250, 250, 100] },
        { label: null, value: 6, rgb: [206, 222, 129] },
        { label: null, value: 7, rgb: [160, 194, 155] },
        { label: null, value: 8, rgb: [109, 169, 179] },
        { label: null, value: 9, rgb: [40, 146, 199] }
      ]
    }, {
      name: '1_9_surface_low_to_high',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [112, 153, 89] },
        { label: null, value: 2, rgb: [176, 196, 124] },
        { label: null, value: 3, rgb: [242, 238, 162] },
        { label: null, value: 4, rgb: [242, 224, 150] },
        { label: null, value: 5, rgb: [242, 206, 133] },
        { label: null, value: 6, rgb: [217, 169, 130] },
        { label: null, value: 7, rgb: [194, 140, 124] },
        { label: null, value: 8, rgb: [255, 184, 193] },
        { label: null, value: 9, rgb: [255, 242, 255] }
      ]
    }, {
      name: '1_9_surface_high_to_low',
      label: null,
      colors: [
        { label: null, value: 1, rgb: [255, 242, 255] },
        { label: null, value: 2, rgb: [255, 184, 193] },
        { label: null, value: 3, rgb: [194, 140, 124] },
        { label: null, value: 4, rgb: [217, 169, 130] },
        { label: null, value: 5, rgb: [242, 206, 133] },
        { label: null, value: 6, rgb: [242, 224, 150] },
        { label: null, value: 7, rgb: [242, 238, 162] },
        { label: null, value: 8, rgb: [176, 196, 124] },
        { label: null, value: 9, rgb: [112, 153, 89] }
      ]
    }
  ]

  return definitions
}
