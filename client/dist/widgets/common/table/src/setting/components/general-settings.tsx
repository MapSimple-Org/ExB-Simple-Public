import { React, hooks, type IMThemeVariables, css, type ImmutableObject } from 'jimu-core'
import { Button, CollapsablePanel, DistanceUnits, defaultMessages as jimuUIMessages, Label, Radio, Select, Switch, Tooltip } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuLayoutsMessages } from 'jimu-layouts/layout-runtime'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { AlignModeType, type LayersConfig, ResponsiveType, SelectionModeType, type IMConfig } from '../../config'
import { FontStyle, type FontStyles, InputUnit } from 'jimu-ui/advanced/style-setting-components'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { useTheme, useTheme2 } from 'jimu-theme'
import uppercaseOutlined from 'jimu-icons/svg/outlined/editor/uppercase.svg'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

interface GeneralSettingsProps {
  isMapMode: boolean
  level: 'widget' | 'layer'
  config: IMConfig | ImmutableObject<LayersConfig>
  onPropertyChange: (name: string, value: any) => void
}

const getCollapsableStyle = (theme: IMThemeVariables) => css`
  &.general-settings-collapsable-area {
    .general-settings-collapse {
      padding-bottom: ${theme.sys.spacing(3)};
      border-bottom: 1px solid ${theme.sys.color.divider.secondary};
    }
    .jimu-widget-setting--row, .setting-collapse {
      margin-top: 16px;
    }
  }
`

const GeneralSettings = (props: GeneralSettingsProps) => {
  const { isMapMode, level, config, onPropertyChange } = props
  const isWidgetLevel = level === 'widget'
  const {
    columnSetting, headerFontSetting, enableSelect, selectMode
  } = isWidgetLevel ? config as IMConfig : config as ImmutableObject<LayersConfig>
  const { textAlign, wrapText, responsiveType, columnWidth } = columnSetting || {}
  const { fontSize, bold, backgroundColor, color } = headerFontSetting || {}
  const [showColumn, setShowColumn] = React.useState<boolean>(false)
  const [showHeader, setShowHeader] = React.useState<boolean>(false)
  const [showBody, setShowBody] = React.useState<boolean>(false)
  const [showTools, setShowTools] = React.useState<boolean>(false)
  const theme = useTheme()
  const appTheme = useTheme2()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages, jimuLayoutsMessages)
  const FontStyleTypes = ['bold'] as FontStyles[]
  const toolOptionsArray = ['enableSelect', 'enableRefresh', 'enableDelete', 'enableShowHideColumn', 'showCount']
  const columnOptionsArray = isMapMode
    ? ['enableRelatedRecords', 'enableAttachments']
    : ['enableAttachments']
  const handleShowColumnClick = () => {
    setShowColumn(!showColumn)
  }

  const handleShowHeaderClick = () => {
    setShowHeader(!showHeader)
  }

  const handleShowBodyClick = () => {
    setShowBody(!showBody)
  }

  const handleShowToolsClick = () => {
    setShowTools(!showTools)
  }

  const getAlignModeOptions = React.useCallback((): React.JSX.Element[] => {
    return [
      <option key={AlignModeType.Start} value={AlignModeType.Start}>
        {translate('start')}
      </option>,
      <option key={AlignModeType.Center} value={AlignModeType.Center}>
        {translate('center')}
      </option>,
      <option key={AlignModeType.End} value={AlignModeType.End}>
        {translate('end')}
      </option>
    ]
  }, [translate])

  const getSelectModeOptions = React.useCallback((): React.JSX.Element[] => {
    return [
      <option key={SelectionModeType.Single} value={SelectionModeType.Single}>
        {translate('single')}
      </option>,
      <option
        key={SelectionModeType.Multiple}
        value={SelectionModeType.Multiple}
      >
        {translate('multiple')}
      </option>
    ]
  }, [translate])

  const handleColumnStyleChange = React.useCallback((key: string, value: ResponsiveType | number | boolean) => {
    if (columnSetting) {
      onPropertyChange('columnSetting', columnSetting.setIn([key], value))
    } else {
      const newColumnSetting = {
        responsiveType: ResponsiveType.Fixed,
        columnWidth: 200,
        wrapText: false,
        textAlign: AlignModeType.Start
      }
      newColumnSetting[key] = value
      onPropertyChange('columnSetting', columnSetting.setIn([key], value))
    }
  }, [columnSetting, onPropertyChange])

  const handleHeaderStyleChange = React.useCallback((key: string, value: string | number | boolean) => {
    if (headerFontSetting) {
      onPropertyChange('headerFontSetting', headerFontSetting.setIn([key], value))
    } else {
      const newFontSetting = {
        backgroundColor: '',
        fontSize: 14,
        bold: false,
        color: ''
      }
      newFontSetting[key] = value
      onPropertyChange('headerFontSetting', newFontSetting)
    }
  }, [headerFontSetting, onPropertyChange])

  const deleteOptionLabel = (
    <div className='w-100 d-flex tip-container'>
      <Label className='tip-text' for='embed-honor-theme-font' title={translate('enableDelete')}>{translate('enableDelete')}</Label>
      <Tooltip title={translate('deleteOptionTips')} showArrow placement='bottom'>
        <Button icon type='tertiary' className='d-inline jimu-outline-inside' disableHoverEffect={true} disableRipple={true}>
          <InfoOutlined />
        </Button>
      </Tooltip>
    </div>
  )

  const collapsableArea = (
    <div className='general-settings-collapsable-area' css={getCollapsableStyle(theme)}>
      <CollapsablePanel
        role='group'
        label={translate('col')}
        isOpen={showColumn}
        onRequestOpen={handleShowColumnClick}
        onRequestClose={handleShowColumnClick}
        aria-label={translate('col')}
        className='general-settings-collapse'
      >
        <SettingRow label={<strong>{translate('columnSize')}</strong>} flow='wrap' role='group' aria-label={translate('columnSize')}>
          <div className='jimu-builder--background-setting'>
            <div role='radiogroup'>
              <Label className='d-flex align-items-center'>
                <Radio
                  style={{ cursor: 'pointer' }}
                  name='responsiveType'
                  className='mr-2'
                  checked={responsiveType === ResponsiveType.Fit}
                  onChange={() => { handleColumnStyleChange('responsiveType', ResponsiveType.Fit) }}
                />
                {translate('fitToData')}
              </Label>
              <Label className='d-flex align-items-center'>
                <Radio
                  style={{ cursor: 'pointer' }}
                  name='displayOrderType'
                  className='mr-2'
                  checked={responsiveType === ResponsiveType.Fixed}
                  onChange={() => { handleColumnStyleChange('responsiveType', ResponsiveType.Fixed) }}
                />
                {translate('fixed')}
              </Label>
            </div>
            {responsiveType === ResponsiveType.Fixed &&
              <SettingRow label={translate('columnWidth')}>
                <InputUnit
                  style={{ width: '35%' }}
                  aria-label={translate('columnWidth')}
                  min={80}
                  max={8192}
                  value={{ distance: columnWidth ?? 80, unit: DistanceUnits.PIXEL }}
                  onChange={({ distance }) => { handleColumnStyleChange('columnWidth', distance) }}
                />
              </SettingRow>
            }
          </div>
        </SettingRow>
        {columnOptionsArray.map((key, index) => {
          const isChecked = config[key] || false
          return (
            <SettingRow tag='label' label={translate(key)}>
              <Switch
                className='can-x-switch'
                checked={isChecked}
                onChange={evt => { onPropertyChange(key, evt.target.checked) }}
                aria-label={translate(key)}
              />
            </SettingRow>
          )
        })}
      </CollapsablePanel>
      <CollapsablePanel
        role='group'
        label={translate('variableHeader')}
        isOpen={showHeader}
        onRequestOpen={handleShowHeaderClick}
        onRequestClose={handleShowHeaderClick}
        aria-label={translate('variableHeader')}
        className='general-settings-collapse'
      >
        <SettingRow
          truncateLabel
          flow='no-wrap'
          role='group'
          label={translate('font')}
          aria-label={translate('font')}
          className='mt-2'
        >
          <FontStyle
            aria-label={translate('fontStyle')}
            bold={bold}
            types={FontStyleTypes}
            onChange={(key, value) => { handleHeaderStyleChange('bold', value) }}
          />
          <ThemeColorPicker
            icon={uppercaseOutlined}
            type='with-icon'
            title={translate('fontColor')}
            aria-label={translate('fontColor')}
            specificTheme={appTheme}
            value={color}
            onChange={value => { handleHeaderStyleChange('color', value) }}
            className='jimu-outline-inside'
          />
          <InputUnit
            style={{ width: '35%' }}
            aria-label={translate('fontSize')}
            min={12}
            max={99}
            value={{ distance: fontSize ?? 14, unit: DistanceUnits.PIXEL }}
            onChange={({ distance }) => { handleHeaderStyleChange('fontSize', distance) }}
          />
        </SettingRow>
        <SettingRow label={translate('backgroundColor')}>
          <ThemeColorPicker
            noBackground={true}
            specificTheme={appTheme}
            aria-label={translate('backgroundColor')}
            value={backgroundColor}
            onChange={value => { handleHeaderStyleChange('backgroundColor', value) }}
          />
        </SettingRow>
      </CollapsablePanel>
      <CollapsablePanel
        role='group'
        label={translate('variableBody')}
        isOpen={showBody}
        onRequestOpen={handleShowBodyClick}
        onRequestClose={handleShowBodyClick}
        aria-label={translate('variableBody')}
        className='general-settings-collapse'
      >
        <SettingRow
          flow='no-wrap'
          label={translate('textAlign')}
          className='select-option'
          truncateLabel
        >
          <div style={{ width: '40%' }}>
            <Select
              size='sm'
              value={textAlign || 'start'}
              onChange={evt => { handleColumnStyleChange('textAlign', evt.target.value) }}
              aria-label={translate('textAlign')}
            >
              {getAlignModeOptions()}
            </Select>
          </div>
        </SettingRow>
        <SettingRow tag='label' label={translate('wrapText')}>
          <Switch
            className='can-x-switch'
            checked={wrapText}
            onChange={evt => { handleColumnStyleChange('wrapText', evt.target.checked) }}
            aria-label={translate('wrapText')}
          />
        </SettingRow>
      </CollapsablePanel>
      <CollapsablePanel
        role='group'
        label={translate('tools')}
        isOpen={showTools}
        onRequestOpen={handleShowToolsClick}
        onRequestClose={handleShowToolsClick}
        aria-label={translate('tools')}
      >
        {toolOptionsArray.map((key, index) => {
          const isChecked = config[key] || false
          const isDelete = key === 'enableDelete'
          return (
            <React.Fragment key={index}>
              <SettingRow tag='label' label={isDelete ? deleteOptionLabel : translate(key)}>
                <Switch
                  className='can-x-switch'
                  checked={isChecked}
                  onChange={evt => { onPropertyChange(key, evt.target.checked) }}
                  aria-label={translate(key)}
                />
              </SettingRow>
              {key === 'enableSelect' && enableSelect && (
                <SettingRow
                  flow='no-wrap'
                  label={translate('selectMode')}
                  className='select-option'
                  truncateLabel
                >
                  <div style={{ width: '40%' }}>
                    <Select
                      size='sm'
                      value={selectMode || SelectionModeType.Multiple}
                      onChange={evt => { onPropertyChange('selectMode', evt.target.value) }}
                      aria-label={translate('selectMode')}
                    >
                      {getSelectModeOptions()}
                    </Select>
                  </div>
                </SettingRow>
              )}
            </React.Fragment>
          )
        })}
      </CollapsablePanel>
    </div>
  )

  return isWidgetLevel
    ? <SettingSection
      role='group'
      className='general-settings-container'
      title={translate('options')}
      aria-label={translate('options')}
    >
      {collapsableArea}
    </SettingSection>
    : collapsableArea
}

export default GeneralSettings
