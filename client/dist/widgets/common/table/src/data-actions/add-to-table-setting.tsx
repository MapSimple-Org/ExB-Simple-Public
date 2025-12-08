import { React, type DataActionSettingProps, Immutable, FormattedMessage, type ImmutableObject } from 'jimu-core'
import { Label, Checkbox } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../setting/translations/default'

export interface AddToTableConfig {
  isAddInSameSheet?: boolean
}

type IMAddToTableConfig = ImmutableObject<AddToTableConfig>

class _AddToTableSetting extends React.PureComponent<DataActionSettingProps<IMAddToTableConfig>> {
  static defaultProps = {
    config: Immutable({
      isAddInSameSheet: false
    })
  }

  onOpenInSameTabChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const checked = !!(evt?.target?.checked)
    const newConfig = this.props.config.set('isAddInSameSheet', checked)
    this.props.onSettingChange(newConfig)
  }

  render () {
    const isAddInSameSheet = !!(this.props.config?.isAddInSameSheet)

    return (
      <div className='w-100'>
        <SettingSection style={{ paddingTop: 0 }}>
          <SettingRow>
            <Label>
              <Checkbox
                checked={isAddInSameSheet}
                className='mr-1'
                onChange={this.onOpenInSameTabChange}
              />
              <FormattedMessage id='tableAction_OpenInSameTab' defaultMessage={defaultMessages.tableAction_OpenInSameTab} />
            </Label>
          </SettingRow>
        </SettingSection>
      </div>
    )
  }
}

export default _AddToTableSetting
