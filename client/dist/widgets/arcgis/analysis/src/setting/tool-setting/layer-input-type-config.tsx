import { React, jsx, hooks } from 'jimu-core'
import { Alert, Checkbox, defaultMessages as jimuiDefaultMessages, Label } from 'jimu-ui'
import defaultMessages from '../translations/default'

export type LayerInputType = 'selectFromMapLayer' | 'allowBrowserLayers' | 'allowDrawingOnTheMap' | 'allowLocalFileUpload' | 'allowServiceUrl' | 'selectFromOtherWidget'
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type LayerInputTypeInfo = Partial<Record<LayerInputType, boolean>>

const useLayerInputTypes = (show?: LayerInputTypeInfo) => {
  return useMemo(() => {
    return (['selectFromMapLayer', 'allowBrowserLayers', 'allowDrawingOnTheMap', 'allowLocalFileUpload', 'allowServiceUrl', 'selectFromOtherWidget'] as LayerInputType[]).filter((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
      return show?.[key] !== false
    })
  }, [show])
}

interface Props {
  show?: LayerInputTypeInfo
  checked?: LayerInputTypeInfo
  disabled?: LayerInputTypeInfo
  onChange: (key: LayerInputType, checked: boolean) => void
}

const { useMemo } = React
const LayerInputTypeConfig = (props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessages)
  const { show = {}, checked = {}, disabled = {}, onChange } = props

  const layerInputTypes = useLayerInputTypes(show)

  return (
    <React.Fragment>
      {layerInputTypes.map((key) => {
        return <div style={disabled[key] ? { color: 'var(--ref-palette-neutral-900)' } : undefined} key={key}>
            <Label className='label-for-checkbox' key={key}>
              <Checkbox checked={checked[key]} disabled={disabled[key]} onChange={(e, c) => { onChange(key, c) }}/>
              {translate(key)}
            </Label>
          {disabled[key] && <Alert className='w-100' withIcon form="basic" variant='text' size='small' text={translate('serviceNotSupportUpload')} type="warning" style={{ minWidth: 'unset' }} />}
        </div>
      })}
    </React.Fragment>
  )
}

export default LayerInputTypeConfig
