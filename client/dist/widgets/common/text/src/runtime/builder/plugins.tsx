import { React, type IMState, appActions, getAppStore, ReactRedux, type ImmutableArray, type UseDataSource, type WidgetInitResizeCallback, hooks, BrowserSizeMode, ArcadeContentCapability, DynamicStyleType, Immutable } from 'jimu-core'
import { Bubble, RichExpressionBuilderPopper, type RichPluginRequiredProps } from 'jimu-ui/advanced/rich-text-editor'
import { defaultMessages } from 'jimu-ui'
import { ThemeSwitchComponent } from 'jimu-theme'
import { appBuilderSync } from 'jimu-for-builder'

interface _TextPluginsProps {
  useDataSources: ImmutableArray<UseDataSource>
  widgetId: string
  enabled: boolean
  onInitResizeHandler?: WidgetInitResizeCallback
}

type TextPluginsProps = _TextPluginsProps & RichPluginRequiredProps

const ARCADE_CONTENT_CAPABILITIES = [ArcadeContentCapability.Value, ArcadeContentCapability.Style]
const DYNAMIC_STYLE_TYPES = Immutable([DynamicStyleType.Text])

export const TextPlugins = (props: TextPluginsProps): React.ReactElement => {
  const { editor, formats, selection, useDataSources, widgetId, enabled, onInitResizeHandler } = props
  const showExpression = ReactRedux.useSelector((state: IMState) => !!state.widgetsState[widgetId]?.showExpression)
  const showArcade = ReactRedux.useSelector((state: IMState) => !!state.widgetsState[widgetId]?.showArcade)
  const browserSizeMode = ReactRedux.useSelector((state: IMState) => state.browserSizeMode)
  const uri = ReactRedux.useSelector((state: IMState) => state.appConfig.widgets[widgetId]?.uri)
  const translate = hooks.useTranslation(defaultMessages)
  //When version1 changes, `Bubble` will be hidden
  const [version1, setVersion1] = React.useState(0)
  //When version2 changes, `Expression` will be repositioned
  const [version2, setVersion2] = React.useState(0)
  const expressNodeRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    onInitResizeHandler?.(() => {
      setVersion1(v => v + 1)
      expressNodeRef.current?.classList.add('d-none')
    }, null, () => {
      setVersion2(v => v + 1)
      expressNodeRef.current?.classList.remove('d-none')
    })
  }, [onInitResizeHandler])

  const expressionHeaderProps = React.useMemo(() => ({
    title: translate('dynamicContent'),
    onClose: () => {
      getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showExpression', false))
      getAppStore().dispatch(appActions.widgetToolbarStateChange(widgetId, ['text-expression']))
    }
  }), [widgetId, translate])
  // In small screen mode, render the tool settingPanel to the right of the iframe.
  if (browserSizeMode === BrowserSizeMode.Small) {
    if (showExpression) {
      appBuilderSync.publishSidePanelToApp({
        type: 'textExpression',
        widgetId,
        uri,
        editor,
        formats,
        selection,
        useDataSources,
        active: showExpression
      })
    }
  }

  if (showArcade) {
    appBuilderSync.publishShowTextArcadePanelBuilder({
      widgetId,
      editor,
      formats,
      selection,
      useDataSources,
      useTitle: true,
      useIcons: false,
      dynamicStyleTypes: DYNAMIC_STYLE_TYPES,
      capabilities: ARCADE_CONTENT_CAPABILITIES,
      onModalClose: () => {
        appBuilderSync.publishShowTextArcadePanelBuilder(null)
        getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showArcade', false))
        getAppStore().dispatch(appActions.widgetToolbarStateChange(widgetId, ['text-arcade']))
      }
    })
  }

  hooks.useUpdateEffect(() => {
    setVersion1(v => v + 1)
  }, [enabled])

  return (
    <ThemeSwitchComponent useTheme2={true}>
      <Bubble editor={editor} formats={formats} selection={selection} source='user' version={version1} />
      {(browserSizeMode !== BrowserSizeMode.Small && showExpression) &&
        <RichExpressionBuilderPopper
          ref={expressNodeRef}
          version={version2}
          source='user'
          editor={editor}
          formats={formats}
          selection={selection}
          open={showExpression}
          useDataSources={useDataSources}
          header={expressionHeaderProps}
          widgetId={widgetId}
        />
      }
    </ThemeSwitchComponent>
  )
}
