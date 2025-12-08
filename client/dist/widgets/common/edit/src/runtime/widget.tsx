import { React, WidgetState, type AllWidgetProps } from 'jimu-core'
import { EditModeType, type IMConfig } from '../config'
import FeatureFormComponent from './components/feature-form-component'
import EditorComponent from './components/editor-component'
import { getPrivilege } from './components/utils'
import { versionManager } from '../version-manager'

export interface CommonProps {
  config: IMConfig
  canEditFeature: boolean
}

const EditWidget = (props: AllWidgetProps<IMConfig>) => {
  const { id, label, config, useDataSources, useMapWidgetIds, controllerWidgetId, state } = props
  const isAttributeOnly = config.editMode === EditModeType.Attribute
  // use exb privilege instead of api's supportsUpdateByOthers
  const [canEditFeature, setCanEditFeature] = React.useState(undefined)
  React.useEffect(() => {
    getPrivilege().then((canEdit) => {
      setCanEditFeature(canEdit)
    }).catch(() => {
      setCanEditFeature(false)
    })
  }, [])

  const visible = controllerWidgetId ? [WidgetState.Active, WidgetState.Opened].includes(state) : state !== WidgetState.Hidden

  return isAttributeOnly
    ? <FeatureFormComponent label={label} config={config} canEditFeature={canEditFeature} useDataSources={useDataSources} />
    : <EditorComponent id={id} visible={visible} config={config} canEditFeature={canEditFeature} useMapWidgetIds={useMapWidgetIds} />
}

EditWidget.versionManager = versionManager

export default EditWidget
