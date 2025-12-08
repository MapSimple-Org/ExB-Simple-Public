/** @jsx jsx */
import { jsx, React, useIntl, type ImmutableObject } from 'jimu-core'
import { Checkbox, Label, Switch, Tooltip, Button, defaultMessages } from 'jimu-ui'
import { type DrawOptionsInfo, SnappingMode } from 'jimu-ui/advanced/map'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

interface Props {
  drawOptions: ImmutableObject<DrawOptionsInfo>
  onSnappingOptionsChange: (item: string, value) => void
  // ui
  labelNls: string
  enabledItemName: string
  defaultEnabledItemName: string
  // control
  isShow?: boolean
  tips?: React.ReactNode
}

export const SnappingOption = React.memo((props: (Props)) => {
  // flags
  const enabledFlag = props.drawOptions[props.enabledItemName]
  const defaultEnabledFlag = props.drawOptions[props.defaultEnabledItemName]

  const isShowFlag = ((typeof props.isShow === 'undefined') || props.isShow) // not false

  // nls
  const defaultEnabledNls = useIntl().formatMessage({ id: 'defaultEnabled', defaultMessage: defaultMessages.defaultEnabled })

  // 1.geometryGuides
  // 2.featureToFeature
  // 3.grid
  return (isShowFlag && <div className='mt-4'>
    {/* a. Flexible mode */}
    {(props.drawOptions?.snappingMode === SnappingMode.Flexible) && <React.Fragment>
      <SettingRow className='mt-3 d-flex align-items-center justify-content-between'>
        <div className='d-flex'>
          <Label className={'item-label'}>{props.labelNls}</Label>
          {props.tips && <Tooltip showArrow role="tooltip" title={props.tips}>
            <Button icon disableHoverEffect disableRipple variant="text"> <InfoOutlined /> </Button>
          </Tooltip>}
        </div>
        <Switch
          checked={enabledFlag}
          onChange={evt => { props.onSnappingOptionsChange(props.enabledItemName, evt.target.checked) }}
        />
      </SettingRow>
      {enabledFlag &&
        <div className='mt-3'>
          <Label className='d-flex align-items-center default-enable-label'>
            <Checkbox
              checked={defaultEnabledFlag}
              className='mr-2'
              onChange={evt => { props.onSnappingOptionsChange(props.defaultEnabledItemName, evt.target.checked) }}
            />
            {defaultEnabledNls}
          </Label>
        </div>
      }</React.Fragment>}

    {/* b. Prescriptive mode */}
    {(props.drawOptions?.snappingMode === SnappingMode.Prescriptive) && <React.Fragment>
      <SettingRow>
        <Label className='d-flex align-items-center'>
          <Checkbox
            checked={defaultEnabledFlag}
            className='mr-2'
            onChange={evt => { props.onSnappingOptionsChange(props.defaultEnabledItemName, evt.target.checked) }}
          />
          {props.labelNls}
        </Label>
      </SettingRow>
    </React.Fragment>}
  </div>)
})
