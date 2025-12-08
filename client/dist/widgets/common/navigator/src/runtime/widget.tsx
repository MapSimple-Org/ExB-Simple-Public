/** @jsx jsx */
import { React, type AllWidgetProps, jsx, type IMState, ReactRedux, type ImmutableArray, hooks, type SectionNavInfo, ViewChangeMessage, MessageManager, ButtonClickMessage, Immutable } from 'jimu-core'
import type { IMConfig } from '../config'
import { Placeholder } from './components/placeholder'
import { ViewNavigation, type ViewNavigationStandard, type ViewNavigationType } from './components/view-navigation'
import { versionManager } from '../version-manager'
import {
  useWidgetStyle, useSectionViewsChange, useNavigationLinks, useHandleSectionsChange, useContainerSectionChange,
  useHandleViewsChange, useSwitchView, useUpdateProgress, useNavigationViews, useHandleViewsLayoutChangeInExpressMode
} from './utils'
const { useRef } = React
const { useSelector } = ReactRedux

type NavigatorProps = AllWidgetProps<IMConfig>

const getNavButtonGroupInfo = (currentViewId: string, progress: number, useProgress: boolean, views: ImmutableArray<string>) => {
  let disablePrevious, disableNext
  const totalPage = views?.length ?? 0
  let current = !views?.includes(currentViewId) ? 0 : views?.indexOf(currentViewId)
  current = current + 1
  if (!useProgress) {
    disablePrevious = current <= 1
    disableNext = current === totalPage
  } else {
    let index = 0
    const length = views?.length ?? 0
    if (length > 1) {
      index = progress * (length - 1)
      const offset = index % 1
      index = Math.floor(index)

      disablePrevious = index === 0 && offset === 0
      disableNext = index === totalPage - 1 && offset === 0
    }
  }
  return { current, totalPage, disableNext, disablePrevious }
}

const Widget = (props: NavigatorProps) => {
  const {
    id,
    config,
    builderSupportModules,
    theme
  } = props

  const getAppConfigAction = builderSupportModules?.jimuForBuilderLib?.getAppConfigAction
  const nodeRef = useRef<HTMLDivElement>(null)

  const display = config?.display
  const data = config?.data
  const propStandard = display?.standard
  const type = data?.type
  const section = data?.section
  const step = propStandard?.step ?? 1

  const defaultView = useSelector((state: IMState) => state?.appConfig?.sections?.[section]?.views?.[0])
  const sectionNavInfo = useSelector((state: IMState) => state?.appRuntimeInfo?.sectionNavInfos?.[section])
  const views = useNavigationViews(section, data?.views, type)
  const links = useNavigationLinks(views, display)

  const progress = sectionNavInfo?.progress
  const useProgress = sectionNavInfo?.useProgress
  const currentViewId = sectionNavInfo?.currentViewId ?? defaultView

  const style = useWidgetStyle(display?.vertical)

  const standard = React.useMemo(() => {
    const navButtonGroupInfo = getNavButtonGroupInfo(currentViewId, progress, useProgress, views)
    return (propStandard || Immutable({})).merge(navButtonGroupInfo).asMutable({ deep: true }) as ViewNavigationStandard
  }, [currentViewId, progress, propStandard, useProgress, views])

  //Listen the changes of sections
  const handleSectionsChange = useHandleSectionsChange(id, getAppConfigAction)
  useContainerSectionChange(id, handleSectionsChange)
  //Listen the changes of views
  const handleViewChange = useHandleViewsChange(id, getAppConfigAction)
  useSectionViewsChange(section, handleViewChange)

  //The method used to switch views
  const switchView = useSwitchView(section)
  //The method used to update the progress of `SectionNavInfo`
  const updateProgress = useUpdateProgress(section)

  const publishViewChangeMessage = (viewId: string, preViewId: string) => {
    if (viewId === preViewId) {
      return
    }
    const dataSourcesChangeMessage = new ViewChangeMessage(id, viewId, preViewId)
    MessageManager.getInstance().publishMessage(dataSourcesChangeMessage)
  }

  const publishTabClickMessage = (newViewId: string, preViewId: string) => {
    if (newViewId === preViewId) {
      const buttonClickMessage = new ButtonClickMessage(id)
      MessageManager.getInstance().publishMessage(buttonClickMessage)
    }
  }

  const handleChange = hooks.useEventCallback((type: ViewNavigationType, value: boolean | number | string) => {
    let navInfo: SectionNavInfo
    if (type === 'navButtonGroup') {
      navInfo = switchView(value as boolean, step)
    } else if (type === 'slider') {
      navInfo = updateProgress(value as number)
    }

    const preViewId = currentViewId
    // if no navInfo, the type is "nav"
    const viewId = navInfo ? navInfo.currentViewId : value as string
    publishViewChangeMessage(viewId, preViewId)
    if (type === 'nav') {
      publishTabClickMessage(viewId, preViewId)
    }
  })

  useHandleViewsLayoutChangeInExpressMode(section, getAppConfigAction)

  return <div className="widget-view-navigation jimu-widget" css={style} ref={nodeRef}>
    <Placeholder
      widgetId={id} show={!links.length}
      message={section && !links.length ? 'widgetPlaceholderWithNoView' : 'widgetPlaceholder'}
      direction={display?.vertical ? 'vertical' : 'horizontal'}
    ></Placeholder>
    <ViewNavigation
      data={links}
      activeView={currentViewId}
      progress={progress}
      onChange={handleChange}
      {...display}
      standard={standard}
      theme={theme}
    />
  </div>
}

Widget.versionManager = versionManager

export default Widget
