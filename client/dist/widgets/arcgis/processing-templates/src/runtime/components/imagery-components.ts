import 'calcite-components'
import { defineCustomElements } from '@arcgis/imagery-components/dist/loader'

import { getImageryComponentsAssetsPath } from '../../utils'

defineCustomElements(window, { resourcesUrl: getImageryComponentsAssetsPath() })
