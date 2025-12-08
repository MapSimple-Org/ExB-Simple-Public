import { React, hooks, css, type ImmutableArray } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Select, Typography } from 'jimu-ui'
import type { LayersConfig } from '../../config'

interface FeatureFormSelectProps {
  addLayersConfig: ImmutableArray<LayersConfig>
  activeId: string
  onChange: (dsId: string) => void
}

const style = css`
  &.layer-selector{
    padding: 12px 15px;
    label {
      margin-bottom: 12px;
    }
  }
`

const FeatureFormSelect = (props: FeatureFormSelectProps) => {
  const { activeId, addLayersConfig, onChange } = props
  const translate = hooks.useTranslation(jimuUIMessages)

  const isSingle = addLayersConfig.length === 1
  const label = isSingle ? addLayersConfig[0].name : translate('selectLayer')

  const handleChange = React.useCallback((evt) => {
    const selectedLayerId = evt?.target?.value
    onChange(selectedLayerId)
  }, [onChange])

  return (
    <div className='layer-selector' css={style}>
      <label>
        <Typography variant='label1'>{label}</Typography>
      </label>
      {!isSingle && <Select
        value={activeId}
        onChange={handleChange}
      >
        {addLayersConfig.map(config => {
          return (
            <option key={config.id} value={config.id}>
              {config.name}
            </option>
          )
        })}
      </Select>}
    </div>
  )
}

export default FeatureFormSelect
