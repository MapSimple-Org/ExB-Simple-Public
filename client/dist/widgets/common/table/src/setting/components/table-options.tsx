/** @jsx jsx */
import { React, jsx, hooks } from 'jimu-core'
import { DistanceUnits, defaultMessages as jimuUIMessages, Label, Radio, Select, Switch } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuLayoutsMessages } from 'jimu-layouts/layout-runtime'
import { AlignModeType, ResponsiveType } from '../../config'
import { useTheme2 } from 'jimu-theme'
import type { LayerConfigProps } from './layer-config'
import { FontStyle, type FontStyles, InputUnit } from 'jimu-ui/advanced/style-setting-components'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import uppercaseOutlined from 'jimu-icons/svg/outlined/editor/uppercase.svg'

type TableOptionsProps = Pick<LayerConfigProps, 'layerConfig' | 'onChange'>

const TableOptions = (props: TableOptionsProps) => {
  const { layerConfig, onChange } = props
  const { columnSetting, headerFontSetting } = layerConfig
  const appTheme = useTheme2()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages, jimuLayoutsMessages)
  const FontStyleTypes = ['bold'] as FontStyles[]

  const handleColumnStyleChange = React.useCallback((key: string, value: ResponsiveType | number | boolean) => {
    if (columnSetting) {
      onChange(layerConfig.setIn(['columnSetting', key], value))
    } else {
      const newColumnSetting = {
        responsiveType: ResponsiveType.Fixed,
        columnWidth: 200,
        wrapText: false
      }
      newColumnSetting[key] = value
      onChange(layerConfig.set('columnSetting', newColumnSetting))
    }
  }, [columnSetting, layerConfig, onChange])

  const handleHeaderStyleChange = React.useCallback((key: string, value: string | number | boolean): void => {
    if (headerFontSetting) {
      onChange(layerConfig.setIn(['headerFontSetting', key], value))
    } else {
      const newFontSetting = {
        backgroundColor: '',
        fontSize: 14,
        bold: false,
        color: ''
      }
      newFontSetting[key] = value
      onChange(layerConfig.set('headerFontSetting', newFontSetting))
    }
  }, [headerFontSetting, layerConfig, onChange])

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

  return <SettingSection
    role='group'
    title={translate('tableOptions')}
    aria-label={translate('tableOptions')}
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
          value={columnSetting?.textAlign || 'start'}
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
        checked={columnSetting?.wrapText}
        onChange={evt => { handleColumnStyleChange('wrapText', evt.target.checked) }}
        aria-label={translate('wrapText')}
      />
    </SettingRow>
    <SettingRow label={<strong>{translate('columnSize')}</strong>} flow='wrap' role='group' aria-label={translate('columnSize')}>
      <div className='jimu-builder--background-setting'>
        <div role='radiogroup'>
          <Label className='d-flex align-items-center'>
            <Radio
              style={{ cursor: 'pointer' }}
              name='responsiveType'
              className='mr-2'
              checked={columnSetting?.responsiveType === ResponsiveType.Fit}
              onChange={() => { handleColumnStyleChange('responsiveType', ResponsiveType.Fit) }}
            />
            {translate('fitToData')}
          </Label>
          <Label className='d-flex align-items-center'>
            <Radio
              style={{ cursor: 'pointer' }}
              name='displayOrderType'
              className='mr-2'
              checked={columnSetting?.responsiveType === ResponsiveType.Fixed}
              onChange={() => { handleColumnStyleChange('responsiveType', ResponsiveType.Fixed) }}
            />
            {translate('fixed')}
          </Label>
        </div>
        {columnSetting?.responsiveType === ResponsiveType.Fixed &&
          <SettingRow label={translate('columnWidth')}>
            <InputUnit
              style={{ width: '35%' }}
              aria-label={translate('columnWidth')}
              min={80}
              max={8192}
              value={{ distance: columnSetting?.columnWidth ?? 80, unit: DistanceUnits.PIXEL }}
              onChange={({ distance }) => { handleColumnStyleChange('columnWidth', distance) }}
            />
          </SettingRow>
        }
      </div>
    </SettingRow>
    <SettingRow label={<strong>{translate('variableHeader')}</strong>} flow='wrap' role='group' aria-label={translate('variableHeader')}>
      <div className='jimu-builder--background-setting'>
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
            bold={headerFontSetting?.bold}
            types={FontStyleTypes}
            onChange={handleHeaderStyleChange}
          />
          <ThemeColorPicker
            icon={uppercaseOutlined}
            type='with-icon'
            title={translate('fontColor')}
            aria-label={translate('fontColor')}
            specificTheme={appTheme}
            value={headerFontSetting?.color}
            onChange={value => { handleHeaderStyleChange('color', value) }}
            className='jimu-outline-inside'
          />
          <InputUnit
            style={{ width: '35%' }}
            aria-label={translate('fontSize')}
            min={12}
            max={99}
            value={{ distance: headerFontSetting?.fontSize ?? 14, unit: DistanceUnits.PIXEL }}
            onChange={({ distance }) => { handleHeaderStyleChange('fontSize', distance) }}
          />
        </SettingRow>
        <SettingRow label={translate('backgroundColor')}>
          <ThemeColorPicker
            noBackground={true}
            specificTheme={appTheme}
            aria-label={translate('backgroundColor')}
            value={headerFontSetting?.backgroundColor}
            onChange={value => { handleHeaderStyleChange('backgroundColor', value) }}
          />
        </SettingRow>
      </div>
    </SettingRow>
  </SettingSection>
}

export default TableOptions
