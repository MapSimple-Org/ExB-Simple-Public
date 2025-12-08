/** @jsx jsx */
import { jsx, React, type IconResult, type IMIconResult, useIntl, defaultMessages } from 'jimu-core'
import { defaultMessages as commonMessages } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { IconPicker } from 'jimu-ui/advanced/resource-selector'
import { getDefaultIconConfig } from '../../common/default-icon-utils'
import { useTheme } from 'jimu-theme'

interface Props {
  popupIcon: '' | IMIconResult
  onIconChange: (icon: IMIconResult) => void
}

export const IconSelector = React.memo((props: Props) => {
  const intl = useIntl()
  const theme = useTheme()
  const DefaultIconConfig = getDefaultIconConfig(theme)

  // share icon updates ,#13386#issue comment-4030639
  const SHARE_ICONS = [
    { icon: require('../../assets/icons/share-icon-1.svg'), name: intl.formatMessage({ id: 'share', defaultMessage: commonMessages.share }) }, // old#default-main-icon
    { icon: require('../../assets/icons/share-icon-2.svg'), name: intl.formatMessage({ id: 'share2', defaultMessage: commonMessages.share2 }) }, // new added
    { icon: require('../../assets/icons/share-icon-3.svg'), name: intl.formatMessage({ id: 'share3', defaultMessage: commonMessages.share3 }) }, // old#5
    { icon: require('../../assets/icons/share-icon-4.svg'), name: intl.formatMessage({ id: 'share4', defaultMessage: commonMessages.share4 }) }, // old#6
    { icon: require('../../assets/icons/share-icon-5.svg'), name: intl.formatMessage({ id: 'share5', defaultMessage: commonMessages.share5 }) }, // old#2
    { icon: require('../../assets/icons/share-icon-6.svg'), name: intl.formatMessage({ id: 'share6', defaultMessage: commonMessages.share6 }) }, // old#3
    { icon: require('../../assets/icons/share-icon-7.svg'), name: intl.formatMessage({ id: 'share7', defaultMessage: commonMessages.share7 }) }, // old#4
    { icon: require('../../assets/icons/share-icon-8.svg'), name: intl.formatMessage({ id: 'share8', defaultMessage: commonMessages.share8 }) }, // old#7
    { icon: require('../../assets/icons/share-icon-9.svg'), name: intl.formatMessage({ id: 'share9', defaultMessage: commonMessages.share9 }) } // old#8
  ]

  const getShareWidgetIcons = (): IconResult[] => {
    const resList = []
    for (let i = 0, len = SHARE_ICONS.length; i < len; i++) {
      resList.push({
        svg: SHARE_ICONS[i].icon,
        properties: {
          filename: SHARE_ICONS[i].name,
          originalName: SHARE_ICONS[i].name,
          color: theme.ref.palette.neutral[700],
          size: DefaultIconConfig.properties.size,
          inlineSvg: DefaultIconConfig.properties.inlineSvg
        }
      })
    }
    return resList
  }

  const shareWidgetIcons = getShareWidgetIcons()
  const icon = props.popupIcon ? props.popupIcon : shareWidgetIcons[0]
  const iconTip = intl.formatMessage({ id: 'icon', defaultMessage: defaultMessages.icon })
  return (
    <SettingRow>
      <div className='d-flex justify-content-between align-items-center w-100 align-items-start'>
        <h6 className='icon-tip' title={iconTip}>{iconTip}</h6>
        <IconPicker
          configurableOption='all' groups='none' hideRemove aria-label={iconTip}
          icon={icon as IconResult}
          customIcons={shareWidgetIcons}
          previewOptions={{ size: false, color: true }}
          onChange={props.onIconChange}
          setButtonUseColor={false}
        />
        {/* this.props.icon ? <label>{this.props.icon.properties?.filename}</label> : null */}
      </div>
    </SettingRow>
  )
})
