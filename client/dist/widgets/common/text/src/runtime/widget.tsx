/** @jsx jsx */
import {
  React, classNames, type AllWidgetProps, type IMState, type RepeatedDataSource, appActions, AppMode, Immutable,
  ReactRedux, type IntlShape, type IMExpressionMap, expressionUtils, type ExpressionMap, MutableStoreManager, getAppStore, hooks,
  appConfigUtils,
  jsx,
  css,
  type DynamicStyleWidgetPreviewRepeatedRecordInfo,
  type IMArcadeContentConfigMap,
  type IMArcadeContentConfig,
  type ImmutableArray,
  type UseDataSource
} from 'jimu-core'
import { styled } from 'jimu-theme'
import type { IMConfig } from '../config'
import type { Editor } from 'jimu-ui/advanced/rich-text-editor'
import { Displayer } from './displayer'
import defaultMessages from './translations/default'
import { Popper, richTextUtils, type StyleState, defaultMessages as jimuUiDefaultMessages, type ShiftOptions, type FlipOptions } from 'jimu-ui'
import { versionManager } from '../version-manager'
import { hasSameDataSourceFields } from '../utils'
import { dynamicStyleUtils } from 'jimu-core'

enum RepeatType { None, Main, Sub }

/* Ensure that the cursor can be displayed when automatic width of layout */
const MinHeight = '12px'

const translate = (id: string, intl: IntlShape): string => {
  return intl !== null ? intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }) : ''
}

const translatePlaceholder = (placeholder: string, intl: IntlShape): string => {
  if (placeholder === defaultMessages.defaultPlaceholder) {
    placeholder = translate('defaultPlaceholder', intl)
  }
  return placeholder
}
const WidgetRoot = styled('div')<StyleState<{ dynamicStyles: React.CSSProperties, color: string }>>(({ styleState }) => {
  const { dynamicStyles, color } = styleState
  const { backgroundColor, backgroundImage, backgroundPosition, backgroundRepeat, backgroundSize, ...generalStyles } = dynamicStyles || {}
  // If the color is from styleState, use it; otherwise, use the default color from config
  return {
    minHeight: MinHeight,
    ...generalStyles,
    backgroundColor,
    backgroundImage,
    backgroundPosition,
    backgroundRepeat,
    backgroundSize,
    color: generalStyles.color || color,
    'h1,h2,h3,h4,h5,h6,span,p,span,p,s,strong,em,u,ol,ul,li,exp,a,arcade': generalStyles
  }
})

const shiftOptions: ShiftOptions = {
  rootBoundary: 'viewport',
  crossAxis: true,
  padding: 4
}

const flipOptions: FlipOptions = {
  boundary: document.body,
  fallbackPlacements: ['right-start', 'left-start', 'top', 'bottom', 'left', 'right', 'top-start', 'bottom-start']
}

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const {
    builderSupportModules,
    id,
    intl,
    useDataSources: propUseDataSources,
    repeatedDataSource,
    useDataSourcesEnabled,
    isInlineEditing,
    config,
    onInitResizeHandler
  } = props

  const dispatch = ReactRedux.useDispatch()
  const { current: isInBuilder } = React.useRef(getAppStore().getState().appContext.isInBuilder)

  // Check whether the widget is selected in builder
  const selected = hooks.useWidgetSelected(id)
  const selectedRef = hooks.useLatest(selected)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const appMode = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.appMode)
  const dynamicStyleState = ReactRedux.useSelector((state: IMState) => state.dynamicStyleState)

  const getAppConfigAction = builderSupportModules?.jimuForBuilderLib.getAppConfigAction
  const RichEditor = builderSupportModules?.widgetModules.Editor
  const builderUtils = builderSupportModules?.widgetModules.builderUtils

  const wrap = config.style?.wrap ?? true
  const color = config.style?.color
  const text = React.useMemo(() => appConfigUtils.processResourceUrl(config.text), [config.text])
  const tooltip = config.tooltip
  const placeholder = translatePlaceholder(config.placeholder, intl)
  const useDataSources = useDataSourcesEnabled ? propUseDataSources : undefined
  const useDataSourcesLength = useDataSources?.length ?? 0
  const arcade = config.style?.dynamicStyleConfig

  const [styles, setStyles] = React.useState<React.CSSProperties>({})
  // The expressions in rich-text
  const [expressions, setExpressions] = React.useState<IMExpressionMap>(null)
  // The arcades in rich-text
  const [arcadeContentConfigs, setArcadeContentConfigs] = React.useState<IMArcadeContentConfigMap>(null)

  const hasExpressionRef = React.useRef(false)

  // Check whether the text is in the list widget according to the repeatedDataSource
  //  If there is no repeatedDataSource, it is not in the list widget => RepeatType.None
  //  If repeatedDataSource.recordIndex is 0, means that it is the edited one in the list widget => RepeatType.Main
  //  If repeatedDataSource.recordIndex is not 0, means that it is the widget in the list that only displays text => RepeatType.Sub
  const repeat = React.useMemo(() => {
    let repeat = RepeatType.Sub
    if (repeatedDataSource == null) {
      repeat = RepeatType.None
    } else {
      if ((repeatedDataSource as RepeatedDataSource).recordIndex === 0) {
        repeat = RepeatType.Main
      } else {
        repeat = RepeatType.Sub
      }
    }
    return repeat
  }, [repeatedDataSource])

  const isDynamicStyleActive = React.useMemo(
    () => typeof dynamicStyleState?.previewConditionInfo?.[id]?.conditionId === 'number',
    [dynamicStyleState, id]
  )

  const prevIsDynamicStyleActive = hooks.usePrevious(isDynamicStyleActive)

  React.useEffect(() => {
    // Only trigger when isDynamicStyleActive becomes true
    if (isDynamicStyleActive && !prevIsDynamicStyleActive && repeatedDataSource) {
      const ds = repeatedDataSource as RepeatedDataSource
      const prevRepeatedRecordInfo = dynamicStyleState?.previewRepeatedRecordInfo?.[ds.widgetId]?.asMutable() || {}
      // If the widget is in a repeated data source like List, update the record index for dynamic style preview
      dispatch(appActions.changeDynamicStylePreviewRepeatedRecordInfo(ds.widgetId, { ...prevRepeatedRecordInfo, needUpdateRecordIndex: true } as DynamicStyleWidgetPreviewRepeatedRecordInfo))
    }
  }, [dispatch, isDynamicStyleActive, prevIsDynamicStyleActive, repeatedDataSource, dynamicStyleState])

  // Check if the dynamic style setting is active
  const isDynamicStyleSettingActive = React.useMemo(() => {
    let isDynamicActive = isDynamicStyleActive
    if (repeatedDataSource && isDynamicActive) {
      // If the widget is in a repeated data source, check if the recordIndex matches the preview index
      const newRepeatedDataSource = repeatedDataSource as RepeatedDataSource
      const widgetId = newRepeatedDataSource.widgetId
      const recordIndex = newRepeatedDataSource.recordIndex
      if (widgetId && recordIndex !== undefined) {
        const previewIndex = dynamicStyleState?.previewRepeatedRecordInfo?.[widgetId]?.recordIndex
        if (previewIndex !== recordIndex) {
          isDynamicActive = false
        }
      }
    }
    return isDynamicActive
  }, [dynamicStyleState, isDynamicStyleActive, repeatedDataSource])

  const isMainWidgetRef = hooks.useLatest(repeat !== RepeatType.Sub)

  // When appMode changed, set `isInlineEditing` to false
  React.useEffect(() => {
    if (!isMainWidgetRef.current || !selectedRef.current) {
      return
    }
    if (appMode === AppMode.Run) {
      dispatch(appActions.setWidgetIsInlineEditingState(id, false))
    }
  }, [isMainWidgetRef, selectedRef, appMode, dispatch, id])

  // When `isInlineEditing` changed or `useDataSourcesLength` is 0, set `showExpression` `showArcade` to false
  hooks.useUpdateEffect(() => {
    if (!isMainWidgetRef.current || !isInBuilder) {
      return
    }
    if (!isInlineEditing || useDataSourcesLength === 0) {
      // Hide the expression and arcade panel when `isInlineEditing` is false
      dispatch(appActions.widgetStatePropChange(id, 'showExpression', false))
      dispatch(appActions.widgetStatePropChange(id, 'showArcade', false))
    }
  }, [isMainWidgetRef, isInlineEditing, useDataSourcesLength, dispatch, id])

  /**
   * Determine whether it can be edited:
   * 1: When the widget is selected and not only used to display the text in the list(RepeatType.Sub), create the rich text editor for the setting panel to use
   * 2: Show rich text editor when `isInlineEditing`
   */
  const editingAbility = (appMode === AppMode.Design || appMode === AppMode.Express) && repeat !== RepeatType.Sub
  const createEditor = editingAbility && selected
  const editable = editingAbility && isInlineEditing

  // Send `editor` instance to setting through `widgetMutableStatePropChange`
  const onEditorCreate = (editor: Editor): void => {
    MutableStoreManager.getInstance().updateStateValue(id, 'editor', editor)
  }

  const onEditorDestroy = (): void => {
    MutableStoreManager.getInstance().updateStateValue(id, 'editor', null)
  }

  const syncInlineEditingTool = () => {
    dispatch(appActions.widgetToolbarStateChange(id, ['text-inline-editing']))
  }

  const unMountingRef = React.useRef(false)
  React.useEffect(() => {
    return () => {
      unMountingRef.current = true
    }
  }, [])

  hooks.useUpdateEffect(() => {
    if (!isMainWidgetRef.current) return
    let expressions = richTextUtils.getAllExpressions(text)
    expressions = expressions != null ? expressions : Immutable({}) as IMExpressionMap
    expressions = expressions.merge((tooltip != null ? { tooltip } : {}) as ExpressionMap)
    if (!hasExpressionRef.current && Object.keys(expressions).length === 0) {
      setExpressions(null)
    } else {
      hasExpressionRef.current = Object.keys(expressions).length > 0
      setExpressions(expressions)
    }
    const arcades = richTextUtils.getArcades(text)
    setArcadeContentConfigs(arcades)
  }, [isMainWidgetRef, text, tooltip, useDataSourcesLength])

  // Save text and placeholder to config
  const onEditorComplete = (value: string, placeholder: string): void => {
    if (unMountingRef.current) return
    if (!isInBuilder) return
    getAppConfigAction().editWidget({ id, config: config.set('text', value).set('placeholder', placeholder) }).exec()
  }

  const handleExpressionChange = hooks.useEventCallback(() => {
    if (unMountingRef.current) return
    if (!isInBuilder) return
    const parts = builderUtils.getExpressionParts(expressions)
    let udsWithFields = expressionUtils.generateFieldsForUseDataSourcesByExpressionParts(parts, useDataSources)
    if (arcade) {
      const dynamicStyleUDSWithFields = dynamicStyleUtils.generateFieldsForUseDataSourcesByDynamicStyle(arcade, useDataSources)
      udsWithFields = expressionUtils.mergeUseDataSources(udsWithFields, dynamicStyleUDSWithFields)
    }
    if (arcadeContentConfigs && Object.keys(arcadeContentConfigs).length > 0) {
      const arcadeUDSWithFields = generateFieldsForUseDataSourcesByArcadeStyle(arcadeContentConfigs, useDataSources)
      udsWithFields = expressionUtils.mergeUseDataSources(udsWithFields, arcadeUDSWithFields)
    }
    if (!hasSameDataSourceFields(useDataSources, udsWithFields)) {
      getAppConfigAction(getAppStore().getState().appConfig).editWidget({
        id,
        useDataSources: udsWithFields?.asMutable({ deep: true })
      }).exec()
    }
  })
  // Generate useDataSources with fields from arcade content configs
  function generateFieldsForUseDataSourcesByArcadeStyle(arcadeContentConfigMap: IMArcadeContentConfigMap, useDataSources: ImmutableArray<UseDataSource>): ImmutableArray<UseDataSource> {
    const initial = Immutable(useDataSources || [])
    return Object.values(arcadeContentConfigMap).reduce<ImmutableArray<UseDataSource>>((acc, arcadeContentConfig: IMArcadeContentConfig) => {
      const arcadeUseDataSources = arcadeContentConfig?.useDataSources
      if (arcadeUseDataSources?.length > 0) {
        return expressionUtils.mergeUseDataSources(acc, arcadeUseDataSources)
      }
      return acc
    }, initial)
  }

  // When `expressions` changed, put the fields in `useDataSources`
  hooks.useUpdateEffect(() => {
    handleExpressionChange()
  }, [expressions, arcade, arcadeContentConfigs, handleExpressionChange])

  const handleArcadeChange = (styles: React.CSSProperties) => {
    setStyles(styles)
  }

  // Extract style properties for the styled component
  const dynamicStyleProps = React.useMemo(() => {
    const importantize = (value: string | undefined | number) => value ? `${value} !important` : undefined
    return {
      color: importantize(styles.color),
      fontStyle: importantize(styles.fontStyle),
      fontWeight: importantize(styles.fontWeight),
      fontSize: importantize(styles.fontSize),
      textDecoration: importantize(styles.textDecoration),
      backgroundColor: importantize(styles.backgroundColor),
      backgroundImage: importantize(styles.backgroundImage),
      backgroundPosition: importantize(styles.backgroundPosition),
      backgroundRepeat: importantize(styles.backgroundRepeat),
      backgroundSize: importantize(styles.backgroundSize),
    }
  }, [styles])

  const getDynamicPreviewStyle = () => {
    return css`
          white-space: nowrap;
          z-index: 12;
          background-color: var(--sys-color-info-dark);
          font-size: 12px;
          font-weight: 400;
          border: none;
          box-shadow: none;
          color: var(--sys-color-info-text);
      `
  }

  return (
    <WidgetRoot
      data-testid='text-widget'
      className={classNames('widget-text jimu-widget p-1')}
      styleState={{ dynamicStyles: dynamicStyleProps, color: color }}
      ref={rootRef}
    >
      {createEditor && <RichEditor
        className={classNames({ 'd-none': !editable })}
        widgetId={id}
        nowrap={!wrap}
        onInitResizeHandler={onInitResizeHandler}
        useDataSources={useDataSources}
        enabled={!!isInlineEditing}
        onCreate={onEditorCreate}
        onDestroy={onEditorDestroy}
        onComplete={onEditorComplete}
        onEditorFocus={syncInlineEditingTool}
        placeholder={placeholder}
        preserveWhitespace
        value={text}
      />}
      <Displayer
        className={classNames({ 'd-none': editable })}
        value={text}
        tooltip={tooltip}
        wrap={wrap}
        placeholder={placeholder}
        useDataSources={useDataSources}
        widgetId={id}
        dynamicStyleConfig={arcade}
        onArcadeChange={handleArcadeChange}
        repeatedDataSource={repeatedDataSource as RepeatedDataSource}
      />
      <Popper open={isDynamicStyleSettingActive} offsetOptions={[0, 4]} css={getDynamicPreviewStyle()} autoUpdate shiftOptions={shiftOptions}
        flipOptions={flipOptions} placement='right-start' reference={rootRef} >
        <div className='pl-2 pr-2 pt-1 pb-1'>
          {intl.formatMessage({ id: 'conditionalStylePreview', defaultMessage: jimuUiDefaultMessages.conditionalStylePreview })}
        </div>
      </Popper>
    </WidgetRoot>
  )
}

Widget.versionManager = versionManager

export default Widget
