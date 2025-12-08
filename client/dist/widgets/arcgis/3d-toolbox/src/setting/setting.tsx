/** @jsx jsx */
import {
  jsx, React, classNames, type ImmutableObject, type ImmutableArray, LayoutType,
  ReactRedux, type IMState, type IMAppConfig, hooks
} from 'jimu-core'
import { useTheme } from 'jimu-theme'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import { type AllWidgetSettingProps, getAppConfigAction } from 'jimu-for-builder'
import { MapWidgetSelector, SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from './translations/default'
import type { IMConfig } from '../config'
import { getStyle } from './style'
import { type ToolsID, type Tool3D, type Arrangement, ArrangementStyle, ArrangementDirection } from '../constraints'
import { ToolsContainer } from './components/tools-container'
import { SidePopperContainer } from './components/side-popper-container'
import { ArrangementContainer } from './components/arrangement-container'

import { ClickOutlined } from 'jimu-icons/outlined/application/click'

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const theme = useTheme()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const extraStateProps = ReactRedux.useSelector((state: IMState) => {
    let appConfig: IMAppConfig
    if (window.jimuConfig.isBuilder) {
      appConfig = state.appStateInBuilder.appConfig
    } else {
      appConfig = state.appConfig
    }

    return {
      appConfig: appConfig,
      layoutInfo: state?.appStateInBuilder?.widgetsState[props.id]?.layoutInfo
    }
  })

  // Map
  const selectedMap = React.useMemo(() => props.useMapWidgetIds?.length > 0, [props.useMapWidgetIds])
  const onMapWidgetSelected = (ids: string[]) => {
    props.onSettingChange({
      id: props.id,
      useMapWidgetIds: ids
    })
  }

  // Tools
  const onToolsConfigChanged = (tools: ImmutableArray<Tool3D>) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['tools'], tools)
    })
  }

  // Arrangement
  const ControllerStyleSize = {
    list: { w: 382, h: 290 },
    iconHorizontal: { w: 170, h: 42 },
    iconVertical: { w: 42, h: 170 }
  }
  const onArrangementChanged = (arrangement: ImmutableObject<Arrangement>) => {
    let size = ControllerStyleSize.list
    const { style, direction } = arrangement
    if (style === ArrangementStyle.List) {
      size = ControllerStyleSize.list
    } else if (style === ArrangementStyle.Icon && direction === ArrangementDirection.Horizontal) {
      size = ControllerStyleSize.iconHorizontal
    } else if (style === ArrangementStyle.Icon && direction === ArrangementDirection.Vertical) {
      size = ControllerStyleSize.iconVertical
    }

    const layoutId = extraStateProps.layoutInfo?.layoutId
    const layoutType = extraStateProps.appConfig?.layouts?.[layoutId]?.type
    if (layoutId && (layoutType === LayoutType.FixedLayout)) {
      getAppConfigAction().editLayoutItemSize(extraStateProps.layoutInfo, size.w, size.h).exec()
    }

    if (style === ArrangementStyle.Icon) {
      getAppConfigAction().editWidgetProperty(props.id, 'offPanel', true).exec()
    } else {
      getAppConfigAction().editWidgetProperty(props.id, 'offPanel', false).exec()
    }

    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['arrangement'], arrangement)
    })
  }

  // L2 side popper
  const [sidePopperOpenState, setSidePopperOpenState] = React.useState<ToolsID>(null)
  const onSidePopperToggle = (toolsID: ToolsID, btnRef?) => {
    if (btnRef) {
      toolSettingBtnRefFor508.current = btnRef
    }

    setSidePopperOpenState(toolsID)
  }
  const onSidePopperSettingChanged = (toolsConfig: ImmutableArray<Tool3D>) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['tools'], toolsConfig)
    })
  }
  // 508 for L2 popper's trigger prop
  const toolSettingBtnRefFor508 = React.useRef(null)

  return (
    <div className='widget-setting-directions jimu-widget-setting' css={getStyle(theme)}>
      <SettingSection title={translate('selectMapWidget')} className={classNames({ 'border-0': !selectedMap })}>
        <SettingRow>
          <MapWidgetSelector
            onSelect={onMapWidgetSelected}
            useMapWidgetIds={props.useMapWidgetIds}
          />
        </SettingRow>
      </SettingSection>
      {/* 1.placeholder */}
      {(!selectedMap) && <div className='d-flex justify-content-center align-items-center placeholder-container'>
        <div className='text-center'>
          <ClickOutlined size={48} className='d-inline-block placeholder-icon mb-2' />
          <p className='placeholder-hint'>{translate('selectMapHint')}</p>
        </div>
      </div>}
      {/* 2.setting */}
      {
        (selectedMap) && <React.Fragment>
          {/* tools */}
          <ToolsContainer
            tools={props.config.tools}
            onToolsConfigChanged={onToolsConfigChanged}
            onSidePopperToggle={onSidePopperToggle}
          ></ToolsContainer>

          {/* Arrangement */}
          <ArrangementContainer
            widgetId={props.id}
            arrangement={props.config.arrangement}
            onChange={onArrangementChanged}
          ></ArrangementContainer>

          {/* SidePopper */}
          <React.Fragment>
            <SidePopperContainer
              toolsConfig={props.config.tools}
              shownMode={sidePopperOpenState}
              onSidePopperClose={() => { onSidePopperToggle(null) }}
              onSettingChanged={onSidePopperSettingChanged}
              //
              useMapWidgetIds={props.useMapWidgetIds}
              useDataSources={props.useDataSources}
              // 508
              triggerFor508={toolSettingBtnRefFor508}
            ></SidePopperContainer>
          </React.Fragment>
        </React.Fragment>
      }
    </div>
  )
}

export default Setting
