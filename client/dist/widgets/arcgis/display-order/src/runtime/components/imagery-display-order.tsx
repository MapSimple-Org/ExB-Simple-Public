import { React, type AllWidgetProps } from 'jimu-core'
import { Loading, LoadingType } from 'jimu-ui'

import 'calcite-components'
import { defineCustomElements } from '@arcgis/imagery-components/dist/loader'

import type { IMConfig, QualifiedLayer } from '../../config'

import { getImageryComponentsAssetsPath } from '../../utils'

interface ImageryDisplayOrderProps extends AllWidgetProps<IMConfig> {
  layerId: string
  layerList: QualifiedLayer[]
}

const ImageryDisplayOrder = (props: ImageryDisplayOrderProps) => {
  const { layerId, layerList, context: { folderUrl } } = props

  const [hasComponentDefined, setHasComponentDefined] = React.useState(false)

  React.useEffect(() => {
    defineCustomElements(window, { resourcesUrl: getImageryComponentsAssetsPath(folderUrl) })
    setHasComponentDefined(true)
  }, [folderUrl])

  const currentLayer = layerList.find(({ id }) => id === layerId)

  return (
    <div style={{
      flexGrow: 1,
      overflowY: 'auto',
      height: 'calc(100%-3rem)'
    }}>
        {hasComponentDefined ? <arcgis-imagery-display-order layer={currentLayer} panelHeading="" hideButtons={true} /> : <Loading type={LoadingType.Secondary} />}
    </div>
  )
}

export default ImageryDisplayOrder
