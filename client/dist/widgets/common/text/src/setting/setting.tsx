import { React, Immutable, type IMState, type UseDataSource, ReactRedux, type Expression, getAppStore, DataSourceTypes, hooks, type IMDynamicStyleConfig, DynamicStyleType, type IMDynamicStyleTypes, appConfigUtils, dynamicStyleUtils } from 'jimu-core'
import { builderAppSync, type AllWidgetSettingProps } from 'jimu-for-builder'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { RichTextFormatKeys, type Editor } from 'jimu-ui/advanced/rich-text-editor'
import type { IMConfig } from '../config'
import { Switch, defaultMessages as jimuUiMessage, richTextUtils, TextArea } from 'jimu-ui'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import defaultMessages from './translations/default'
import { ExpressionInput, ExpressionInputType } from 'jimu-ui/advanced/expression-builder'
import { replacePlaceholderTextContent } from '../utils'
import { RichFormatClear, RichTextFormats } from './editor-plugins'
import { DynamicStyleBuilderSwitch } from 'jimu-ui/advanced/dynamic-style-builder'


type SettingProps = AllWidgetSettingProps<IMConfig>

const SUPPORTED_TYPES = Immutable([
  DataSourceTypes.FeatureLayer,
  DataSourceTypes.SceneLayer,
  DataSourceTypes.BuildingComponentSubLayer,
  DataSourceTypes.OrientedImageryLayer,
  DataSourceTypes.ImageryLayer,
  DataSourceTypes.SubtypeGroupLayer,
  DataSourceTypes.SubtypeSublayer
])
const TEXT_CONDITION_DYNAMIC_STYLE_OPTIONS: IMDynamicStyleTypes = Immutable([
  DynamicStyleType.Text,
  DynamicStyleType.Background,
])
const TEXT_ARCADE_DYNAMIC_STYLE_OPTIONS: IMDynamicStyleTypes = Immutable([
  DynamicStyleType.Text,
  DynamicStyleType.Background
])
const defaultExpressionInputTypes = Immutable([ExpressionInputType.Static, ExpressionInputType.Attribute, ExpressionInputType.Statistics, ExpressionInputType.Expression])
const DefaultUseDataSources = Immutable([])
const Setting = (props: SettingProps): React.ReactElement => {
  const {
    id,
    config: propConfig,
    useDataSources: propUseDataSources,
    useDataSourcesEnabled,
    onSettingChange
  } = props

  const placeholderEditable = getAppStore().getState().appStateInBuilder?.appInfo?.type === 'Web Experience Template'
  const style = propConfig.style
  const wrap = style?.wrap ?? true
  const enableDynamicStyle = style?.enableDynamicStyle ?? false
  const dynamicStyleConfig = style?.dynamicStyleConfig
  const text = propConfig.text
  const placeholder = propConfig.placeholder
  const placeholderText = React.useMemo(() => richTextUtils.getHTMLTextContent(placeholder) ?? '', [placeholder])
  const expressions = React.useMemo(() => Object.values(richTextUtils.getAllExpressions(text)?.asMutable({ deep: true }) ?? {}), [text])
  const tooltip = propConfig.tooltip
  const appStateInBuilder = ReactRedux.useSelector((state: IMState) => state.appStateInBuilder)
  const mutableStateVersion = appStateInBuilder?.widgetsMutableStateVersion?.[id]?.editor
  const isInlineEditing = appStateInBuilder?.widgetsRuntimeInfo?.[id]?.isInlineEditing
  const hasDataSource = useDataSourcesEnabled && propUseDataSources?.length > 0
  const [editor, setEditor] = React.useState<Editor>(null)
  const [openTip, setOpenTip] = React.useState(false)

  React.useEffect(() => {
    const mutableStoreManager = window._appWindow._mutableStoreManager
    const editor = mutableStoreManager?.getStateValue([id, 'editor']) ?? null
    setEditor(editor)
  }, [mutableStateVersion, id])

  const translate = hooks.useTranslation(defaultMessages, jimuUiMessage)

  const handleDataSourceChange = (useDataSources: UseDataSource[]): void => {
    builderAppSync.publishWidgetToolbarStateChangeToApp(id, ['text-expression', 'text-arcade'])
    if (useDataSources == null) {
      const config = propConfig.set('style', propConfig.style?.without('enableDynamicStyle').without('dynamicStyleConfig'))
      onSettingChange({
        id,
        config
      })
    } else {
      // If change dataview or main ds, should update or reset dynamic style settings.
      if (propConfig.style?.enableDynamicStyle) {
        let config
        const updatedStyle = dynamicStyleUtils.updateDynamicStyleWhenUseDataSourcesChange(
          id,
          propUseDataSources,
          Immutable(useDataSources),
          Immutable(propConfig.style.dynamicStyleConfig),
        )
        if (updatedStyle) {
          config = propConfig.setIn(['style', 'dynamicStyleConfig'], updatedStyle)
        } else {
          config = propConfig.set('style', propConfig.style?.without('enableDynamicStyle').without('dynamicStyleConfig'))
        }
        onSettingChange({
          id,
          config,
          useDataSources
        })
      }else{
        onSettingChange({
        id,
        useDataSources
      })
      }
    }

  }

  const toggleUseDataEnabled = (): void => {
    builderAppSync.publishWidgetToolbarStateChangeToApp(id, ['text-expression', 'text-arcade'])
    const config = propConfig.without('tooltip').set('style', propConfig.style?.without('enableDynamicStyle').without('dynamicStyleConfig'))
    const dataSourcesEnabled = !useDataSourcesEnabled
    if ((tooltip || enableDynamicStyle) && !dataSourcesEnabled) {
      onSettingChange({
        id,
        config,
        useDataSourcesEnabled: dataSourcesEnabled
      })
    } else {
      onSettingChange({ id, useDataSourcesEnabled: dataSourcesEnabled })
    }
  }

  const toggleWrap = (): void => {
    onSettingChange({
      id,
      config: propConfig.setIn(['style', 'wrap'], !wrap)
    })
  }

  const handleTooltipChange = (expression: Expression): void => {
    if (expression == null) {
      return
    }

    onSettingChange({
      id,
      config: propConfig.set('tooltip', expression)
    })
    setOpenTip(false)
  }

  const handlePlaceholderTextChange = (text: string) => {
    text = text.replace(/\n/mg, '')
    const newPlaceholder = replacePlaceholderTextContent(placeholder, text)
    onSettingChange({
      id,
      config: propConfig.set('placeholder', newPlaceholder)
    })
  }

  const handleTextChange = (html: string, key?: RichTextFormatKeys, value?: any): void => {
    const onlyPlaceholder = richTextUtils.isBlankRichText(text) && !!placeholder
    const property = !isInlineEditing && onlyPlaceholder ? 'placeholder' : 'text'
    html = property === 'text' ? appConfigUtils.restoreResourceUrl(html) : html
    let config = propConfig.set(property, html)
    if (!isInlineEditing && key === RichTextFormatKeys.Color) {
      config = config.setIn(['style', 'color'], value)
    }
    onSettingChange({ id, config })
  }

  const expInputForms = React.useMemo(() => hasDataSource ? defaultExpressionInputTypes : Immutable([ExpressionInputType.Static]), [hasDataSource])

  const onDynamicStyleBuilderConfigChange = (dynamicStyleConfig: IMDynamicStyleConfig) => {
    const config = propConfig.setIn(['style', 'dynamicStyleConfig'], dynamicStyleConfig)
    onSettingChange({
      id,
      config
    })
  }

  const handleDynamicStyleSwitchChange = (_, enabled) => {
    let config = propConfig.setIn(['style', 'enableDynamicStyle'], enabled)
    if (!enabled) {
      config = config.set('style', config.style.without('dynamicStyleConfig'))
    }
    onSettingChange({
      id,
      config
    })
  }

  return (
    <div className='widget-setting-text jimu-widget-setting'>
      <SettingSection>
        <SettingRow>
          <DataSourceSelector
            isMultiple
            types={SUPPORTED_TYPES}
            useDataSources={propUseDataSources}
            useDataSourcesEnabled={useDataSourcesEnabled}
            onToggleUseDataEnabled={toggleUseDataEnabled}
            onChange={handleDataSourceChange}
            widgetId={id}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection>
        <SettingRow flow='no-wrap' tag='label' label={translate('wrap')}>
          <Switch checked={wrap} onChange={toggleWrap} />
        </SettingRow>
        <SettingRow label={translate('tooltip')} flow='wrap' role='group' aria-label={translate('tooltip')}>
          <div className='w-100'>
            <ExpressionInput
              aria-label={translate('tooltip')}
              autoHide useDataSources={hasDataSource ? propUseDataSources : DefaultUseDataSources} onChange={handleTooltipChange} openExpPopup={() => { setOpenTip(true) }}
              expression={typeof tooltip === 'object' ? tooltip : null} isExpPopupOpen={openTip} closeExpPopup={() => { setOpenTip(false) }}
              types={expInputForms}
              widgetId={id}
            />
          </div>
        </SettingRow>
        {placeholderEditable && <SettingRow flow='wrap' label={translate('placeholder')}>
          <TextArea aria-label={translate('placeholder')} defaultValue={placeholderText} onAcceptValue={handlePlaceholderTextChange}></TextArea>
        </SettingRow>}

      </SettingSection>

      {editor != null && <SettingSection>
        <SettingRow flow='no-wrap' label={translate('textFormat')} role='group' aria-label={translate('textFormat')}>
          <RichFormatClear
            editor={editor}
            onChange={handleTextChange}
          />
        </SettingRow>

        <SettingRow>
          <RichTextFormats
            widgetId={id}
            editor={editor}
            defaultColor={propConfig.style?.color}
            useDataSources={propUseDataSources}
            onChange={handleTextChange}
          />
        </SettingRow>
      </SettingSection>}
      {hasDataSource &&
        < SettingSection >
          <SettingRow>
            <DynamicStyleBuilderSwitch
              widgetId={id}
              disabled={isInlineEditing}
              useDataSources={propUseDataSources}
              expressions={expressions}
              widgetDynamicContentCapability='multiple'
              useIconsForArcade={false}
              config={dynamicStyleConfig}
              onChange={onDynamicStyleBuilderConfigChange}
              switchChecked={enableDynamicStyle}
              onSwitchChange={handleDynamicStyleSwitchChange}
              conditionStyleTypes={TEXT_CONDITION_DYNAMIC_STYLE_OPTIONS}
              arcacdeStyleTypes={TEXT_ARCADE_DYNAMIC_STYLE_OPTIONS}
            />
          </SettingRow>
        </SettingSection>
      }
    </div >
  )
}

export default Setting
