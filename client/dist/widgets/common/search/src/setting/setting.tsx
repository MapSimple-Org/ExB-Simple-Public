/** @jsx jsx */
import { jsx, css, React, ReactRedux, type IMState, AppMode } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { type IMConfig, SourceType } from '../config'
import SearchResultSetting from './component/search-setting-option'
import ArrangementStyleSetting from './component/arrangement-style'
import CustomSearchDataSetting from './component/search-data-setting'
import Placeholder from './component/placeholder'

interface ExtraProps {
  id: string
}

type SettingProps = AllWidgetSettingProps<IMConfig> & ExtraProps

const Setting = (props: SettingProps) => {
  const { config, id, portalUrl, useMapWidgetIds, onSettingChange, useDataSources } = props
  const appMode = ReactRedux.useSelector((state: IMState) => state?.appStateInBuilder?.appRuntimeInfo?.appMode)

  const [showPlaceholder, setShowPLaceholder] = React.useState(false)

  React.useEffect(() => {
    const showPlaceholder = config?.sourceType === SourceType.MapCentric && (!useMapWidgetIds || useMapWidgetIds?.length === 0)
    setShowPLaceholder(showPlaceholder)
  }, [config, useMapWidgetIds])

  const STYLE = css`
    .suggestion-setting-con  {
      padding-bottom: 0;
    }
  `
  return (
    <div className='widget-setting-search jimu-widget-search' css={STYLE}>
      <CustomSearchDataSetting
        id={id}
        portalUrl={portalUrl}
        useDataSources={useDataSources}
        useMapWidgetIds={useMapWidgetIds}
        onSettingChange={onSettingChange}
        config={config}
        showPlaceholder={showPlaceholder}
      />
      {(showPlaceholder && appMode !== AppMode.Express) && <Placeholder/>}
      {!showPlaceholder && <SearchResultSetting
        id={id}
        config={config}
        onSettingChange={onSettingChange}
        useDataSources={useDataSources}
      />}
      {!showPlaceholder && <ArrangementStyleSetting
        id={id}
        config={config}
        onSettingChange={onSettingChange}
      />}
    </div>
  )
}

export default Setting
