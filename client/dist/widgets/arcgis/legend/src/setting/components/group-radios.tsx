/** @jsx jsx */
import { React, css, hooks, jsx } from 'jimu-core'
import { Label, Radio } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuLayoutMessages } from 'jimu-layouts/layout-runtime'

interface RadioItemProps {
  onRadioChange: (evt: any) => any
  checked: boolean
  itemId: string
  name: string
}

interface GroupRadiosProps {
  itemsIds: string[]
  itemsOptions: string[]
  value: string
  onChange: (evt: any) => any
  name: string
}

const RadioItem = (props: RadioItemProps) => {
  const { onRadioChange, checked, itemId, name } = props
  const translate = hooks.useTranslation(defaultMessages, jimuLayoutMessages)
  return (
    <div className="w-100 legend-tools">
      <div className="legend-tools-item card-style-radio">
        <Label className='d-flex align-items-center' style={{ cursor: 'pointer', fontWeight: 'normal' }}>
          <Radio
            id={itemId}
            name={name}
            className='mr-1'
            onChange={(e) => {
              onRadioChange(e)
            }}
            checked={checked}
          />
          {translate(itemId)}
        </Label>
      </div>
    </div>
  )
}

const GroupRadios = (props: GroupRadiosProps) => {
  const { itemsIds, itemsOptions, value, onChange, name } = props
  const radiosContent = itemsIds.map((radioItemProps, index) => {
    const itemProps: RadioItemProps = {
      itemId: itemsIds[index],
      checked: value === itemsOptions[index],
      onRadioChange: () => { onChange(itemsOptions[index]) },
      name: name
    }
    return <RadioItem key={index} {...itemProps} ></RadioItem>
  })
  return (
    <div className="card-layout-content pl-2" role="radiogroup" css={groupRadioStyles} aria-label={name}>
      {radiosContent}
    </div>
  )
}

export default GroupRadios

const groupRadioStyles = css`
  .legend-tools:last-child {
    .legend-tools-item {
      margin-bottom: -0.5rem;
    }
  }
`
