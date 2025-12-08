/** @jsx jsx */
import { jsx, hooks } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { defaultMessages as jimuUIDefaultMessages, Select } from 'jimu-ui'
import defaultMessages from '../../translations/default'
import { ItemSizeType } from '../../../config'

interface ItemSizeSelectorProps {
  itemSizeType: ItemSizeType
  onPropertyChange: (name: any, value: any) => void
}

export const ItemSizeSelector = (props: ItemSizeSelectorProps) => {
  const { itemSizeType, onPropertyChange } = props
  const translate = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages)
  const itemSizeCustom = translate('custom')
  const itemSizeHonorMap = translate('honorMapSize')
  const itemSizeTypeTip = itemSizeType === ItemSizeType.Custom ? itemSizeCustom : itemSizeHonorMap

  const handleItemSizeTypeChange = (evt) => {
    const value = evt?.target?.value
    onPropertyChange('itemSizeType', value)
  }

  return (
    <SettingRow className='mt-2' flow='wrap' label={translate('itemSize')} aria-label={translate('itemSize')}>
      <Select value={itemSizeType} title={itemSizeTypeTip} aria-label={translate('itemSize')} onChange={handleItemSizeTypeChange} size='sm'>
        <option key='custom' value={ItemSizeType.Custom} title={itemSizeCustom}>
          <div className='text-truncate'>{itemSizeCustom}</div>
        </option>
        <option key='honorMap' value={ItemSizeType.HonorMap} title={itemSizeHonorMap}>
          <div className='text-truncate'>{itemSizeHonorMap}</div>
        </option>
      </Select>
    </SettingRow>
  )
}
