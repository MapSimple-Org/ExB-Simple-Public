import { React, type DataActionSettingProps, Immutable, FormattedMessage, type ImmutableObject } from 'jimu-core'
import { Label, Checkbox } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../setting/translations/default'

export interface ViewInTableConfig {
  isViewInSameSheet?: boolean
}

type IMViewInTableConfig = ImmutableObject<ViewInTableConfig>

class _ViewInTableSetting extends React.PureComponent<DataActionSettingProps<IMViewInTableConfig>> {
  static defaultProps = {
    config: Immutable({
      isViewInSameSheet: false
    })
  }

  onOpenInSameTabChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const checked = !!(evt?.target?.checked)
    const newConfig = this.props.config.set('isViewInSameSheet', checked)
    this.props.onSettingChange(newConfig)
  }

  render () {
    const isViewInSameSheet = !!(this.props.config?.isViewInSameSheet)

    return (
      <div className='w-100'>
        <SettingSection style={{ paddingTop: 0 }}>
          <SettingRow>
            <Label>
              <Checkbox
                checked={isViewInSameSheet}
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

// export default injectIntl(_ViewInTableSetting)
export default _ViewInTableSetting
