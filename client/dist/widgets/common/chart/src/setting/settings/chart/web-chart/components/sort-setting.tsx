import { React, hooks } from 'jimu-core'
import { Button, Select, defaultMessages as jimUiDefaultMessage, Label, Checkbox } from 'jimu-ui'
import { SortAscendingOutlined } from 'jimu-icons/outlined/directional/sort-ascending'
import { SortDescendingOutlined } from 'jimu-icons/outlined/directional/sort-descending'
import type { WebChartDirectionalDataOrder, WebChartSortOrderKinds } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../translations/default'
import { styled } from 'jimu-theme'

export interface OrderValue extends WebChartDirectionalDataOrder {
  orderType: 'arcgis-charts-category' | 'arcgis-charts-y-value'
}

interface SortSettingProps {
  'aria-label'?: string
  value: OrderValue
  disabled?: boolean
  onChange: (value: OrderValue) => void
}

const Root = styled('div')({
  '.sort-select': {
    width: '85%'
  },
  '.order-arrow': {
    width: '26px',
    height: '26px'
  }
})

export const DefaultOrderValue: OrderValue = {
  orderType: 'arcgis-charts-category',
  orderBy: 'ASC',
  preferLabel: true
}

export const SortSetting = (props: SortSettingProps): React.ReactElement => {
  const { disabled = false, value = DefaultOrderValue, 'aria-label': ariaLabel, onChange } = props
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)
  const orderType = value.orderType ?? 'arcgis-charts-category'
  const orderBy = (value.orderBy ?? 'ASC')
  const preferLabel = value.preferLabel ?? true

  const handleOrderChange = (orderBy: WebChartSortOrderKinds): void => {
    onChange({ orderType, orderBy, preferLabel })
  }
  const handleFieldChange = (evt: React.MouseEvent<HTMLSelectElement>): void => {
    const orderType = evt.currentTarget.value as OrderValue['orderType']
    onChange({ orderType, orderBy, preferLabel })
  }

  const handlePreferLabelChange = (_, checked: boolean): void => {
    const preferLabel = checked
    onChange({ orderType, orderBy, preferLabel })
  }

  return (
    <Root className='sorted w-100'>
      <div className='field-row d-flex align-items-center justify-content-between'>
        <Select
          size='sm'
          className='sort-select'
          value={orderType}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={handleFieldChange}
        >
          <option value='arcgis-charts-category'>
            {translate('category')}
          </option>
          <option value='arcgis-charts-y-value'>
            {translate('value')}
          </option>
        </Select>
        <OrderArrow
          disabled={disabled}
          value={orderBy}
          onChange={handleOrderChange}
        />
      </div>
      {orderType === 'arcgis-charts-category' && <div className='mt-2'>
        <Label check centric>{translate('preferLabel')}
          <Checkbox className='ml-2' checked={preferLabel} onChange={handlePreferLabelChange} />
        </Label>
      </div>}
    </Root>
  )
}

interface OrderArrowProps {
  value: WebChartSortOrderKinds
  disabled?: boolean
  onChange: (value: WebChartSortOrderKinds) => void
}

export const OrderArrow = ({ disabled = false, value = 'ASC', onChange }: OrderArrowProps): React.ReactElement => {
  const translate = hooks.useTranslation(jimUiDefaultMessage)
  const label = translate(value === 'ASC' ? 'ascending' : 'descending')

  const handleClick = (): void => {
    onChange(value === 'DESC' ? 'ASC' : 'DESC')
  }

  return (
    <Button title={label} aria-label={label} disabled={disabled} variant='text' className='order-arrow' size='sm' icon onClick={handleClick}>
      {value === 'ASC' && <SortAscendingOutlined />}
      {value !== 'ASC' && <SortDescendingOutlined />}
    </Button>
  )
}
