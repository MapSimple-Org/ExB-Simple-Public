import { React, hooks } from 'jimu-core'
import { ByFieldColorList } from './by-field'
import { CategoryType } from '../../../../../../../../config'
import { SidePopperTooltip } from '../../../../../../components'
import defaultMessages from '../../../../../../../translations/default'
import { ByGroupColorList, type ByGroupColorListProps } from './by-group'

interface ColorListProps extends ByGroupColorListProps {
  open?: boolean
  trigger?: HTMLElement
  onRequestClose?: () => void
  categoryType: CategoryType
}

const totalNumberLimit = 50
const numberPerLoads = 20
export const ColorList = (props: ColorListProps) => {
  const { open, trigger, onRequestClose, categoryType, value, onChange, onColorsChange, ...others } = props
  const translate = hooks.useTranslation(defaultMessages)
  const tooltip = categoryType === CategoryType.ByGroup ? translate('sliceColorTip', { numberPerLoads, totalNumberLimit }) : ''

  return <SidePopperTooltip
    trigger={trigger}
    backToFocusNode={trigger}
    position='right'
    isOpen={open}
    title={translate('sliceColor')}
    tooltip={tooltip}
    toggle={onRequestClose}
  >
    {categoryType === CategoryType.ByGroup && (
      <ByGroupColorList
        value={value}
        onColorsChange={onColorsChange}
        onChange={onChange}
        {...others}
      />
    )}
    {categoryType === CategoryType.ByField && (
      <ByFieldColorList
        onColorsChange={onColorsChange}
        value={value}
        onChange={onChange}
      />
    )}
  </SidePopperTooltip>
}
