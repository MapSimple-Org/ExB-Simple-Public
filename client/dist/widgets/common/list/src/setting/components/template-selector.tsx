/** @jsx jsx */
import { jsx, React, AppMode, hooks, classNames, Immutable, BrowserSizeMode, css, polished, focusElementInKeyboardMode, LayoutType, ReactRedux } from 'jimu-core'
import type { LayoutInfo, IMAppConfig, SerializedStyles } from 'jimu-core'
import { templateUtils, builderAppSync, widgetService, getAppConfigAction, type AppConfigAction } from 'jimu-for-builder'
import { defaultMessages as jimuLayoutsDefaultMessages } from 'jimu-layouts/layout-runtime'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Checkbox, Icon, Button, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { ItemStyle, type IMConfig, type ElementSize } from '../../config'
import defaultMessages from '../translations/default'
import type { Template } from 'jimu-for-builder/templates'

const { useState, useRef, useEffect } = React

const originAllStyles: { [key: string]: Template } = {
  STYLE0: require('../template/card-style0.json'),
  STYLE1: require('../template/card-style1.json'),
  STYLE2: require('../template/card-style2.json'),
  STYLE3: require('../template/card-style3.json'),
  STYLE4: require('../template/card-style4.json'),
  STYLE5: require('../template/card-style5.json'),
  STYLE6: require('../template/card-style6.json'),
  STYLE7: require('../template/card-style7.json'),
  STYLE8: require('../template/card-style8.json'),
  STYLE9: require('../template/card-style9.json'),
  STYLE10: require('../template/card-style10.json'),
  STYLE11: require('../template/card-style11.json'),
  STYLE12: require('../template/card-style12.json'),
}

let AllStyles: { [key: string]: Template }
const MESSAGES = Object.assign(
  {},
  defaultMessages,
  jimuUIDefaultMessages,
  jimuLayoutsDefaultMessages
)

function initStyles (widgetId: string) {
  if (AllStyles) {
    return AllStyles
  }
  AllStyles = {}
  Object.keys(originAllStyles).forEach(style => {
    AllStyles[style] = templateUtils.processForTemplate(
      originAllStyles[style],
      widgetId,
      MESSAGES
    )
  })
}

interface Props {
  config: IMConfig
  appMode: AppMode
  id: string
  appConfig: IMAppConfig
  layoutInfo: LayoutInfo
  theme: any
  resettingTheTemplateButtonRef: HTMLButtonElement
  parentSize: ElementSize
  settingPanelChange: string
  useDataSourcesEnabled: boolean
  onPropertyChange: (name, value) => void
}

const ListTemplateSelector = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages, jimuLayoutsDefaultMessages)
  const enableA11yForWidgetSettings = ReactRedux.useSelector((state: any) => state.appStateInBuilder?.appConfig?.attributes?.enableA11yForWidgetSettings)
  const templatesContainRef = useRef<HTMLDivElement>(null)
  const updatePositionTimeoutRef = useRef(null)
  const settingPanelChangeRef = useRef(null)
  const appConfigRef = useRef(null as IMAppConfig)

  const { config, appMode, id, appConfig, theme, resettingTheTemplateButtonRef, layoutInfo, parentSize, settingPanelChange, useDataSourcesEnabled, onPropertyChange } = props

  const [isTemplateContainScroll, setIsTemplateContainScroll] = useState(false)
  const [templateConWidth, setTemplateConWidth] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleItemStyleImageClick = evt => {
    const style = evt.currentTarget.dataset.value
    if (config.itemStyle === style) return
    onItemStyleChanged(style, config?.isCheckEmptyTemplate)
  }

  const handleCheckEmptyTemplateChange = () => {
    const newIsCheckEmptyTemplate = !config?.isCheckEmptyTemplate
    const newConfig = config.set('isCheckEmptyTemplate', newIsCheckEmptyTemplate)
    const newAppConfig = appConfig.setIn(['widgets', id, 'config'], newConfig)
    onItemStyleChanged(config.itemStyle, newIsCheckEmptyTemplate, newAppConfig)
  }

  const switchLoading = React.useCallback((show: boolean) => {
    setLoading(show)
    builderAppSync.publishChangeWidgetStatePropToApp({
      widgetId: id,
      propKey: 'showLoading',
      value: show
    })
  }, [id])

  const getTemplateSize = React.useCallback(() => {
    const columnRowTemplateWidth = 620
    const columnRowTemplateHeight = 275
    const parentWidth = parentSize?.width || 1280
    const parentHeight = parentSize?.height || 800
    const templateWidth = checkTemplateDefaultSize((columnRowTemplateWidth * 100) / parentWidth)
    const templateHeight = checkTemplateDefaultSize((columnRowTemplateHeight * 100) / parentHeight)
    const templateSize = {
      STYLE0: { width: templateWidth, height: templateHeight },
      STYLE1: { width: templateWidth, height: templateHeight },
      STYLE2: { width: templateWidth, height: templateHeight },
      STYLE3: { width: templateWidth, height: templateHeight },
      STYLE4: { width: templateWidth, height: templateHeight },
      STYLE5: { width: templateWidth, height: templateHeight },
      STYLE6: { width: templateWidth, height: templateHeight },
      STYLE7: { width: templateWidth, height: templateHeight },
      STYLE8: { width: checkTemplateDefaultSize(65400 / parentWidth), height: checkTemplateDefaultSize(33500 / parentHeight) },
      STYLE9: { width: checkTemplateDefaultSize(50000 / parentWidth), height: checkTemplateDefaultSize(50000 / parentHeight) },
      STYLE10: { width: templateWidth, height: templateHeight },
      STYLE11: { width: templateWidth, height: templateHeight },
      STYLE12: { width: checkTemplateDefaultSize(87000 / parentWidth), height: checkTemplateDefaultSize(33500 / parentHeight) }
    }
    return templateSize
  }, [parentSize])

  const getLayoutType = hooks.useEventCallback((): LayoutType => {
    const layoutId = layoutInfo?.layoutId
    const layoutType = appConfig?.layouts?.[layoutId]?.type
    return layoutType
  })

  const editListLayoutSize = React.useCallback((appConfigAction: AppConfigAction, style: ItemStyle) => {
    const templateSize = getTemplateSize()
    const listSize = templateSize[style]
    const layoutType = getLayoutType()
    if (layoutType === LayoutType.FixedLayout) {
      const { layoutId, layoutItemId } = layoutInfo
      const layout = appConfigRef.current.layouts[layoutId]
      const layoutItem = layout?.content?.[layoutItemId]
      const bbox = layoutItem.bbox.set('width', `${listSize.width}%`).set('height', `${listSize.height}%`)
      appConfigAction
        .editLayoutItemProperty(layoutInfo, 'bbox', bbox)
        .exec()
    }
  }, [getLayoutType, getTemplateSize, layoutInfo])

  const checkTemplateDefaultSize = (size) => {
    if (size > 100) {
      return 100
    } else {
      return size
    }
  }

  const getEmptyTemplate = (style: ItemStyle) => {
    const styleTemp = AllStyles[style]
    const layouts = styleTemp?.config?.layouts || {}
    const widgets = styleTemp?.config?.widgets || {}
    let newStyle = Immutable(AllStyles[style])
    let newLayouts = Immutable(layouts)
    for (const layoutId in layouts) {
      newLayouts = newLayouts.setIn([layoutId, 'content'], {})
      newLayouts = newLayouts.setIn([layoutId, 'order'], [])
    }
    newStyle = newStyle.setIn(['config', 'layouts'], newLayouts)
    newStyle = newStyle.setIn(['config', 'widgets'], {
      widget_x: widgets?.widget_x
    })
    return newStyle?.asMutable({ deep: true })
  }

  const getWidgetConfigItemsNeedToBeRetained = React.useCallback(() => {
    const widgetConfig = appConfigRef.current.widgets[id]?.config
    return Immutable({
      filter: widgetConfig?.filter,
      filterOpen: widgetConfig?.filterOpen,
      filters: widgetConfig?.filters,
      noDataMessage: widgetConfig?.noDataMessage,
      searchExact: widgetConfig?.searchExact,
      searchFields: widgetConfig?.searchFields,
      searchHint: widgetConfig?.searchHint,
      searchOpen: widgetConfig?.searchOpen,
      showClearSelected: widgetConfig?.showClearSelected,
      showRecordCount: widgetConfig?.showRecordCount,
      showRefresh: widgetConfig?.showRefresh,
      showSelectedOnlyOpen: widgetConfig?.showSelectedOnlyOpen,
      sortOpen: widgetConfig?.sortOpen,
      sorts: widgetConfig?.sorts,
    })
  }, [id])

  const getNewWidgetConfigWhenItemStyleChange = React.useCallback((wJson, style, isCheckEmptyTemplate = false) => {
    const widgetConfigItemsNeedToBeRetained = getWidgetConfigItemsNeedToBeRetained()
    return Immutable({
      ...wJson.config,
      ...widgetConfigItemsNeedToBeRetained,
      itemStyle: style,
      isItemStyleConfirm: false,
      isInitialed: true,
      isCheckEmptyTemplate: isCheckEmptyTemplate
    })
  }, [getWidgetConfigItemsNeedToBeRetained])

  const _onItemStyleChange = React.useCallback((appConfig: IMAppConfig, style, isCheckEmptyTemplate = false) => {
    const oldConfig = config
    const appConfigAction = getAppConfigAction(appConfig)
    const wJson = appConfig.widgets[id]
    const template: Template = AllStyles[style]
    const templateWidgetJson = template.config.widgets[template.widgetId]
    wJson.layouts &&
      Object.keys(wJson.layouts).forEach(name => {
        wJson.layouts[name] &&
          Object.keys(wJson.layouts[name]).forEach(device => {
            if (
              templateWidgetJson?.layouts?.[name]?.[device] ||
              !templateWidgetJson?.layouts
            ) {
              return
            }

            // Judge if layout is empty
            let sizeLayouts = templateWidgetJson.layouts[name]
            if (!sizeLayouts) {
              const layoutKeys = Object.keys(templateWidgetJson.layouts)
              sizeLayouts = wJson.layouts[layoutKeys[layoutKeys.length - 1]]
            } else {
              sizeLayouts = wJson.layouts[name]
            }
            const length = Object.keys(sizeLayouts).length
            let embedLayoutJson
            for (const key in sizeLayouts) {
              if (key === BrowserSizeMode.Large) {
                embedLayoutJson = appConfig.layouts[sizeLayouts[key]]
              }
            }

            if (!embedLayoutJson) {
              embedLayoutJson =
              appConfig.layouts[
                sizeLayouts[Object.keys(sizeLayouts)[length - 1]]
              ]
            }
          })
      })

    // process inherit properties
    if (wJson.useDataSources && wJson.useDataSources.length > 0) {
      appConfigAction.copyUseDataSourceToAllChildWidgets(
        wJson.set('useDataSources', null),
        wJson
      )
    }

    editListLayoutSize(appConfigAction, style)
    const newConfig = getNewWidgetConfigWhenItemStyleChange(wJson, style, isCheckEmptyTemplate)
    appConfigAction
      .editWidgetProperty(wJson.id, 'config', newConfig)
      .editWidgetProperty(wJson.id, 'layouts', wJson.layouts)
      .exec(!oldConfig.isInitialed)
    // selectSelf(this.props);
  }, [config, id, editListLayoutSize, getNewWidgetConfigWhenItemStyleChange])

  const onItemStyleChanged = React.useCallback((style: ItemStyle, isCheckEmptyTemplate = false, updatedAppConfig = undefined) => {
    // if(this.props.appMode === AppMode.Run) return;
    switchLoading(true)
    let appConfig = appConfigRef.current
    const allBrowserSizeMode = Object.keys(appConfig.widgets[id]?.parent) as any
    if (updatedAppConfig) {
      appConfig = updatedAppConfig
    }
    let styleTemp = AllStyles[style]
    if (isCheckEmptyTemplate) {
      styleTemp = getEmptyTemplate(style)
    }
    widgetService.updateWidgetByTemplate(
      appConfig,
      styleTemp,
      id,
      styleTemp.widgetId,
      allBrowserSizeMode,
      {}
    ).then(newAppConfig => {
      _onItemStyleChange(newAppConfig, style, isCheckEmptyTemplate)
      switchLoading(false)
    })
  }, [_onItemStyleChange, id, switchLoading])

  const handleItemStyleConfirmClick = evt => {
    onPropertyChange('isItemStyleConfirm', true)
    setTimeout(() => { focusElementInKeyboardMode(resettingTheTemplateButtonRef) }, 200)
  }

  const setTemplatesContain = (ref) => {
    const preTemplatesContain = templatesContainRef.current
    if (ref) {
      templatesContainRef.current = ref
    }
    if (!preTemplatesContain) {
      getIsScrollAndWidthOfTemplateCon()
    }
  }

  const getIsScrollAndWidthOfTemplateCon = React.useCallback(() => {
    const templateConHeight = templatesContainRef.current?.clientHeight || 0
    const templateConWidth = templatesContainRef.current?.clientWidth || 0
    const listSettingConElement = templatesContainRef.current?.parentElement?.parentElement
    const parentElementWithScrollbar = appMode === AppMode.Express ? listSettingConElement?.parentElement?.parentElement?.parentElement : listSettingConElement
    const templateConParentHeight = parentElementWithScrollbar?.clientHeight || 0
    const isStartButtonAbsolute = templateConParentHeight < templateConHeight
    setIsTemplateContainScroll(isStartButtonAbsolute)
    setTemplateConWidth(templateConWidth)
  }, [appMode])

  const updateStartButtonPosition = React.useCallback(() => {
    clearTimeout(updatePositionTimeoutRef.current)
    updatePositionTimeoutRef.current = setTimeout(() => {
      getIsScrollAndWidthOfTemplateCon()
    }, 500)
  }, [getIsScrollAndWidthOfTemplateCon])

  const getStartButtonStyle = (): SerializedStyles => {
    return css`
      &.start-con {
        & {
          height: ${polished.rem(64)};
          margin-top: ${polished.rem(-16)};
        }
        .position-absolute-con, .position-relative-con {
          margin-left: ${polished.rem(-16)};
        }
        div{
          padding: ${polished.rem(16)};
          background: ${theme.ref.palette.neutral[400]};
          left: 1rem;
          bottom: 0;
          width: ${templateConWidth ? `${templateConWidth}px` : '100%'}
        }
      }
    `
  }

  useEffect(() => {
    initStyles(id)
  }, [id])

  useEffect(() => {
    appConfigRef.current = appConfig
  }, [appConfig])

  useEffect(() => {
    if (settingPanelChangeRef.current !== 'content' && settingPanelChange === 'content') {
      updateStartButtonPosition()
    }
    settingPanelChangeRef.current = settingPanelChange
  }, [settingPanelChange, enableA11yForWidgetSettings, updateStartButtonPosition])

  useEffect(() => {
    updateStartButtonPosition()
  }, [enableA11yForWidgetSettings, updateStartButtonPosition])

  useEffect(() => {
    updateStartButtonPosition()
    window.addEventListener('resize', updateStartButtonPosition)
    return () => {
      window.removeEventListener('resize', updateStartButtonPosition)
    }
  }, [updateStartButtonPosition])

  useEffect(() => {
    if (!config.isInitialed) {
      let newAppConfig = appConfig
      if (!useDataSourcesEnabled) {
        newAppConfig = getAppConfigAction().editWidget(appConfig.widgets[id].set('useDataSourcesEnabled', true) as any).appConfig
      }
      onItemStyleChanged(config.itemStyle, config?.isCheckEmptyTemplate, newAppConfig)
    }
  }, [config, appConfig, useDataSourcesEnabled, id, onItemStyleChanged])

  return (<div ref={ref => { setTemplatesContain(ref) }}>
      <SettingSection title={nls('chooseTemplateTip')} role='group' aria-label={nls('chooseTemplateTip')} >
        <SettingRow flow='wrap' role='group' aria-label={nls('layoutRow')} label={nls('layoutRow')}>
          <div className='style-group w-100'>
            <Button
              data-value={ItemStyle.Style5}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              title={nls('listRowTemplateTitle', {
                index: 1
              })}
              aria-label={nls('listRowTemplateTitle', {
                index: 1
              })}
            >
              <Icon
                autoFlip
                className={`style-img ${config.itemStyle === ItemStyle.Style5 &&
                  'active'}`}
                icon={require('../assets/style6.png')}
              />
            </Button>
            <div className='vertical-space' />

            <Button
              data-value={ItemStyle.Style4}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              title={nls('listRowTemplateTitle', {
                index: 2
              })}
              aria-label={nls('listRowTemplateTitle', {
                index: 2
              })}
            >
              <Icon
                autoFlip
                className={`style-img ${config.itemStyle === ItemStyle.Style4 &&
                  'active'}`}
                icon={require('../assets/style5.png')}
              />
            </Button>
            <div className='vertical-space' />

            <Button
              data-value={ItemStyle.Style6}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              className='w-100'
              title={nls('listRowTemplateTitle', {
                index: 3
              })}
              aria-label={nls('listRowTemplateTitle', {
                index: 3
              })}
            >
              <Icon
                autoFlip
                className={`style-img low ${config.itemStyle ===
                  ItemStyle.Style6 && 'active'}`}
                icon={require('../assets/style7.png')}
              />
            </Button>
          </div>
        </SettingRow>

        {/* Column template */}
        <SettingRow flow='wrap' role='group' aria-label={nls('layoutColumn')} label={nls('layoutColumn')}>
          <div className='style-group w-100 style-img d-flex justify-content-between w-100'>
            <Button
              data-value={ItemStyle.Style0}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              className='template-icon-margin-r'
              title={nls('listColumnTemplateTitle', {
                index: 1
              })}
              aria-label={nls('listColumnTemplateTitle', {
                index: 1
              })}
            >
              <Icon
                className={`style-img style-img-h w-100 h-auto ${config.itemStyle ===
                  ItemStyle.Style0 && 'active'}`}
                icon={require('../assets/style1.png')}
              />
            </Button>
            <Button
              data-value={ItemStyle.Style1}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              title={nls('listColumnTemplateTitle', {
                index: 2
              })}
              aria-label={nls('listColumnTemplateTitle', {
                index: 2
              })}
            >
              <Icon
                className={`style-img style-img-h w-100 h-auto ${config.itemStyle ===
                  ItemStyle.Style1 && 'active'}`}
                icon={require('../assets/style2.png')}
              />
            </Button>
          </div>
          <div className='vertical-space w-100' />
          <div className='style-group w-100 d-flex justify-content-between w-100'>
            <Button
              data-value={ItemStyle.Style2}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              className='template-icon-margin-r'
              title={nls('listColumnTemplateTitle', {
                index: 3
              })}
              aria-label={nls('listColumnTemplateTitle', {
                index: 3
              })}
            >
              <Icon
                autoFlip
                className={`style-img style-img-h w-100 h-auto ${config.itemStyle ===
                  ItemStyle.Style2 && 'active'}`}
                icon={require('../assets/style3.png')}
              />
            </Button>
            <Button
              data-value={ItemStyle.Style3}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              title={nls('listColumnTemplateTitle', {
                index: 4
              })}
              aria-label={nls('listColumnTemplateTitle', {
                index: 4
              })}
            >
              <Icon
                autoFlip
                className={`style-img style-img-h w-100 h-auto ${config.itemStyle ===
                  ItemStyle.Style3 && 'active'}`}
                icon={require('../assets/style4.png')}
              />
            </Button>
          </div>
        </SettingRow>

        <SettingRow flow='wrap' role='group' aria-label={nls('layoutGrid')} label={nls('layoutGrid')}>
          <div className='style-group w-100'>
            <Button
              data-value={ItemStyle.Style8}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              className='w-100'
              title={nls('listGridTemplateTitle', {
                index: 1
              })}
              aria-label={nls('listGridTemplateTitle', {
                index: 1
              })}
            >
              <Icon
                autoFlip
                className={`style-img ${config.itemStyle === ItemStyle.Style8 &&
                  'active'}`}
                icon={require('../assets/style8.png')}
              />
            </Button>
            <div className='vertical-space' />
          </div>
          <div className='vertical-space' />
          <div className='style-group w-100 d-flex justify-content-between w-100'>
            <Button
              data-value={ItemStyle.Style9}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              className='template-icon-margin-r'
              title={nls('listGridTemplateTitle', {
                index: 2
              })}
              aria-label={nls('listGridTemplateTitle', {
                index: 2
              })}
            >
              <Icon
                autoFlip
                className={`style-img style-img-h ${config.itemStyle ===
                  ItemStyle.Style9 && 'active'}`}
                icon={require('../assets/style9.png')}
              />
            </Button>
          </div>
        </SettingRow>


        <SettingRow flow='wrap' role='group' aria-label={nls('flow')} label={nls('flow')}>
          <div className='style-group w-100'>
            <Button
              data-value={ItemStyle.Style10}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              className='w-100'
              title={nls('listFlowTemplate', {index : 1})}
              aria-label={nls('listFlowTemplate', {index : 1})}
            >
              <Icon
                autoFlip
                className={`style-img style-img10 ${config.itemStyle === ItemStyle.Style10 &&
                  'active'}`}
                icon={require('../assets/style10.png')}
              />
            </Button>
            <div className='vertical-space' />
          </div>
          <div className='vertical-space' />

          <div className='style-group w-100'>
            <Button
              data-value={ItemStyle.Style11}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              className='w-100'
              title={nls('listFlowTemplate', {index : 2})}
              aria-label={nls('listFlowTemplate', {index : 2})}
            >
              <Icon
                autoFlip
                className={`style-img style-img11 ${config.itemStyle === ItemStyle.Style11 &&
                  'active'}`}
                icon={require('../assets/style11.png')}
              />
            </Button>
            <div className='vertical-space' />
          </div>

          <div className='vertical-space' />
          <div className='style-group w-100'>
            <Button
              data-value={ItemStyle.Style12}
              onClick={handleItemStyleImageClick}
              type='tertiary'
              className='w-100'
              title={nls('listFlowTemplate', {index : 3})}
              aria-label={nls('listFlowTemplate', {index : 3})}
            >
              <Icon
                autoFlip
                className={`style-img style-img12 ${config.itemStyle === ItemStyle.Style12 &&
                  'active'}`}
                icon={require('../assets/style12.png')}
              />
            </Button>
            <div className='vertical-space' />
          </div>
          <div className='vertical-space' />
        </SettingRow>

        {appMode !== AppMode.Express && <SettingRow>
          <div className='style-group w-100'>
            <div title={nls('emptyTemplateCheckboxString')} aria-label={nls('emptyTemplateCheckboxString')} className='d-flex w-100 cursor-pointer align-items-center' style={{ paddingLeft: 0, paddingRight: 0 }} onClick={() => { handleCheckEmptyTemplateChange() }}>
              <Checkbox
                title={nls('emptyTemplateCheckboxString')}
                className='lock-item-ratio'
                data-field='isCheckEmptyTemplate'
                checked={config?.isCheckEmptyTemplate || false}
                aria-label={nls('emptyTemplateCheckboxString')}
              />
              <div className='lock-item-ratio-label text-left'>
                {nls('emptyTemplateCheckboxString')}
              </div>
            </div>
          </div>
        </SettingRow>}
        <SettingRow>
          <div className='start-con w-100' css={getStartButtonStyle()}>
            <div className={classNames({'position-absolute position-absolute-con': isTemplateContainScroll, 'position-relative-con': !isTemplateContainScroll})}>
              <Button
                className="w-100"
                type='primary'
                onClick={handleItemStyleConfirmClick}
                aria-label={nls('start')}
                title={nls('start')}
                disabled={loading}
              >
                {nls('start')}
              </Button>
            </div>
          </div>
        </SettingRow>
      </SettingSection>
    </div>
  )
}

export default ListTemplateSelector