/** @jsx jsx */
import { React, jsx, css, polished, LayoutType, ReactRedux, type IMState, hooks, type ImmutableObject, type UtilitiesJson, classNames } from 'jimu-core'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import { type AllWidgetSettingProps, getAppConfigAction, builderAppSync } from 'jimu-for-builder'
import { Icon, Button, Alert, CollapsablePanel, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { type IMConfig, ModeType, type IMPrintTemplateProperties } from '../config'
import defaultMessage from './translations/default'
import { isDefined } from '../utils/utils'
import TemplateSetting from './component/template-setting/template-setting'
import CommonTemplateSetting from './component/template-common-setting'
import PreviewStyle from './component/print-preview-style'
import UtilityPlaceholder from './component/utility-placeholder'
const { useEffect, useRef } = React

const CLASSIC_DEFAULT_SIZE = {
  width: '360px',
  height: '460px'
}

const COMPACT_DEFAULT_SIZE = {
  width: '40px',
  height: '40px'
}

const COMPACT_DEFAULT_SIZE_IN_CONTROLLER = {
  width: '295px',
  height: '107px'
}

interface ExtraProps {
  id: string
}

type SettingProps = AllWidgetSettingProps<IMConfig> & ExtraProps

const Setting = (props: SettingProps) => {
  const { config, id, portalUrl, onSettingChange, useMapWidgetIds, controllerWidgetId } = props
  const nls = hooks.useTranslation(defaultMessage, jimuUiDefaultMessage)

  const serviceErrorMessageTimeoutRef = useRef(null)

  const enableA11yForWidgetSettings = ReactRedux.useSelector((state: any) => state.appStateInBuilder?.appConfig?.attributes?.enableA11yForWidgetSettings)
  const layoutInfo = ReactRedux.useSelector((state: IMState) => state?.appStateInBuilder?.widgetsState[id]?.layoutInfo)
  const appConfig = ReactRedux.useSelector((state: IMState) => state.appStateInBuilder.appConfig)

  const [jimuMapView, setJimuMapView] = React.useState(null as JimuMapView)
  const [openRemind, setOpenRemind] = React.useState(false)
  const [isOpenCollapsablePanel, setIsOpenCollapsablePanel] = React.useState(false)
  const [showLoading, setShowLoading] = React.useState(false)

  const STYLE = css`
    & .custom-setting-collapse>div.collapse-header {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .placeholder-con {
      height: calc(100vh - 770px);
      overflow: hidden;
    }
    .no-utility-setting {
      border-bottom: none;
    }
    .select-mode-con {
      &>div {
        flex: 1;
      }
      button {
        height: ${polished.rem(80)};
        background: var(--ref-palette-neutral-300);
        border: 2px solid transparent;
        &:not(:disabled):not(.disabled).active {
          border-color: var(--sys-color-primary-main);
          background: var(--ref-palette-neutral-300);
        }
      }
      img {
        width: 100%;
        height: 100%;
        margin: 0 auto;
      }
    }
    .remind-con {
      top: ${polished.rem(90)};
    }
    .text-wrap {
      overflow: hidden;
      white-space: pre-wrap;
    }
    .mode-text {
      max-width: 100px;
      margin-left: auto;
      margin-right: auto;
    }
    .setting-collapse {
      & {
        margin-bottom: ${polished.rem(8)};
      }
      .collapse-header {
        line-height: 2.2;
      }
      .handle{
        height: ${polished.rem(32)};
        background: var(--ref-palette-neutral-500);
        padding-left: ${polished.rem(8)};
        padding-right: ${polished.rem(8)};
      }
    }
  `
  const utilitiesInConfig = ReactRedux.useSelector((state: IMState) => {
    return state.appStateInBuilder.appConfig.utilities
  })

  useEffect(() => {
    deleteUseUtilityWhenUseUtilityNotExist(utilitiesInConfig)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilitiesInConfig])

  useEffect(() => {
    initDefaultBorder()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  const deleteUseUtilityWhenUseUtilityNotExist = hooks.useEventCallback((utilitiesInConfig: ImmutableObject<UtilitiesJson>) => {
    const useUtilityId = config?.useUtility?.utilityId
    if (!useUtilityId) return
    const isExist = Object.keys(utilitiesInConfig || {})?.includes(useUtilityId)
    if (!isExist) {
      handlePropertyChange('useUtility', null)
    }
  })

  const initDefaultBorder = () => {
    const style = appConfig?.widgets?.[id]?.style
    if (!config?.hasInitBorder && !style?.border) {
      const appConfigAction = getAppConfigAction()
      const defaultBorder = {
        color: 'var(--ref-palette-neutral-700)',
        type: 'solid',
        width: '1px'
      }
      let newStyle
      if (style) {
        newStyle = style.set('border', defaultBorder)
      } else {
        newStyle = {
          border: defaultBorder
        }
      }
      const newConfig = config?.set('hasInitBorder', true)
      appConfigAction
        .editWidgetProperty(id, 'style', newStyle)
        .editWidgetProperty(id, 'config', newConfig)
        .editWidgetProperty(id, 'offPanel', false)
        .exec()
    }
  }

  const handlePropertyChange = (key: string, value: any) => {
    if (config?.[key] === value) return false
    const newConfig = config.setIn([key], value)
    onSettingChange({
      id: id,
      config: newConfig
    })
  }

  const handleMapWidgetChange = (useMapWidgetIds: string[]): void => {
    onSettingChange({
      id: id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  const toggleRemindPopper = (open: boolean = false) => {
    setOpenRemind(open)
    if (open) {
      clearTimeout(serviceErrorMessageTimeoutRef.current)
      serviceErrorMessageTimeoutRef.current = setTimeout(() => {
        setOpenRemind(false)
      }, 5000)
    }
  }

  const handleActiveViewChange = (newJimuMapView: JimuMapView): void => {
    if (!isDefined(newJimuMapView) || newJimuMapView.view.type === '3d') {
      setJimuMapView(null)
    } else if (newJimuMapView?.id !== jimuMapView?.id) {
      setJimuMapView(newJimuMapView)
    }
  }

  const handleModeTypeChange = (modeType: ModeType) => {
    const newConfig = config.setIn(['modeType'], modeType)
    //Edit default size of print layout when change mode type
    const appConfigAction = getAppConfigAction()
    let printSize = CLASSIC_DEFAULT_SIZE
    if (modeType === ModeType.Compact) {
      printSize = controllerWidgetId ? COMPACT_DEFAULT_SIZE_IN_CONTROLLER : COMPACT_DEFAULT_SIZE
    }
    const layoutType = getLayoutType()
    const offPanel = modeType === ModeType.Compact
    if (layoutType === LayoutType.FixedLayout) {
      const { layoutId, layoutItemId } = layoutInfo
      const layout = appConfig.layouts[layoutId]
      const layoutItem = layout?.content?.[layoutItemId]
      const bbox = layoutItem.bbox.set('width', printSize.width).set('height', printSize.height)
      appConfigAction
        .editLayoutItemProperty(layoutInfo, 'bbox', bbox)
        .editWidgetProperty(id, 'config', newConfig)
        .editWidgetProperty(id, 'offPanel', offPanel)
        .exec()
    } else {
      appConfigAction
        .editWidgetProperty(id, 'config', newConfig)
        .editWidgetProperty(id, 'offPanel', offPanel)
        .exec()
    }
  }

  const handleTemplatePropertyChange = (templateProperty: IMPrintTemplateProperties) => {
    const newConfig = config.set('commonSetting', templateProperty)
    onSettingChange({
      id: id,
      config: newConfig
    })
  }

  //Get layout type
  const getLayoutType = (): LayoutType => {
    const layoutId = layoutInfo?.layoutId
    const layoutType = appConfig?.layouts?.[layoutId]?.type
    return layoutType
  }

  const toggleOpenCollapsablePanel = () => {
    setIsOpenCollapsablePanel(!isOpenCollapsablePanel)
  }

  const toggleLoading = (isShowLoading: boolean) => {
    builderAppSync.publishChangeWidgetStatePropToApp({
      widgetId: id,
      propKey: 'loadingPrintService',
      value: isShowLoading
    })
    setShowLoading(isShowLoading)
  }

  const renderModeSetting = () => {
    return (
      <SettingSection className='map-selector-section'>
        <SettingRow flow='wrap' label={nls('printMode')} role='radiogroup' aria-label={nls('printMode')}>
          <div className='d-flex w-100 select-mode-con'>
            <div className='flex-grow-1'>
              <Button variant='text' role='radio' aria-checked={config?.modeType === ModeType.Classic} className='w-100' disableHoverEffect={true} disableRipple={true} title={nls('printClassic')} active={config?.modeType === ModeType.Classic} onClick={() => { handleModeTypeChange(ModeType.Classic) }}>
                <Icon autoFlip icon={require('./assets/Classic.svg')}/>
              </Button>
              <div className='mt-2 w-100 text-center text-truncate mode-text' title={nls('printClassic')}>{nls('printClassic')}</div>
            </div>

            <div className='flex-grow-1 ml-2'>
              <Button variant='text' role='radio' aria-checked={config?.modeType === ModeType.Compact} className='w-100' disableHoverEffect={true} disableRipple={true} active={config?.modeType === ModeType.Compact} title={nls('printCompact')} onClick={() => { handleModeTypeChange(ModeType.Compact) }}>
                <Icon autoFlip icon={require('./assets/Compact.svg')}/>
              </Button>
              <div className='mt-2 text-center text-truncate mode-text' title={nls('printCompact')}>{nls('printCompact')}</div>
            </div>
          </div>
        </SettingRow>
      </SettingSection>
    )
  }

  return (
    <div className='widget-setting-search jimu-widget-search' css={STYLE}>
      {/* Print source select */}
      <SettingSection className='map-selector-section'>
        <SettingRow flow='wrap' label={nls('selectMap')}>
          <MapWidgetSelector autoSelect onSelect={handleMapWidgetChange} aria-label={nls('selectMap')} useMapWidgetIds={useMapWidgetIds} />
        </SettingRow>
        <div className='fly-map'>
          <div><JimuMapViewComponent useMapWidgetId={useMapWidgetIds?.[0]} onActiveViewChange={handleActiveViewChange} /></div>
        </div>
      </SettingSection>

      {/* Print mode setting */}
      {renderModeSetting()}

      <div className='w-100 position-absolute remind-con'>
        <Alert
          withIcon
          form='basic'
          type='warning'
          open={openRemind}
          closable={true}
          className='w-100'
          text={nls('serviceIsNotAvailable')}
          onClose={() => { toggleRemindPopper(false) }}
        />
      </div>

      {/* Print template list */}
      <TemplateSetting
        id={id}
        config={config}
        portalUrl={portalUrl}
        handlePropertyChange={handlePropertyChange}
        onSettingChange={onSettingChange}
        jimuMapView={jimuMapView}
        toggleRemindPopper={toggleRemindPopper}
        showLoading={showLoading}
        toggleLoading={toggleLoading}
        className={(!config?.useUtility && !showLoading) && 'no-utility-setting'}
      />

      {/* Print template common setting */}
      {config?.useUtility && <SettingSection role='group' aria-label={nls('templateCommonSettings')}>
        <CollapsablePanel
          label={nls('templateCommonSettings')}
          isOpen={isOpenCollapsablePanel}
          onRequestOpen={toggleOpenCollapsablePanel}
          onRequestClose={toggleOpenCollapsablePanel}
          aria-label={nls('templateCommonSettings')}
          className='custom-setting-collapse'
        >
          <CommonTemplateSetting
            id={id}
            printTemplateProperties={config?.commonSetting}
            handleTemplatePropertyChange={handleTemplatePropertyChange}
            modeType={config?.modeType}
            jimuMapView={jimuMapView}
          />
        </CollapsablePanel>
      </SettingSection>}

      {/* Print preview style setting */}
      {config?.useUtility && <PreviewStyle
        config={config}
        handlePropertyChange={handlePropertyChange}
      />}

      {(!config?.useUtility && !showLoading) && <div className={classNames({'placeholder-con': enableA11yForWidgetSettings})}>
        <UtilityPlaceholder/>
      </div>}
    </div>
  )
}

export default Setting
