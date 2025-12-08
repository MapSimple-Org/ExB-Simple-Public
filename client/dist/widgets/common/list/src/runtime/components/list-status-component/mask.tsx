/** @jsx jsx */
import { jsx, React, css, AppMode, ReactRedux, type IMState } from 'jimu-core'
import { ListLayoutType, DS_TOOL_H } from '../../../config'
import type { IMConfig } from '../../../config'
import { useListRuntimeState, useListRuntimeDispatch } from '../../state'
import { getListContentLeftPadding } from '../../utils/list-element-util'
import { getBottomToolH } from '../../utils/utils'
const { useEffect, useState } = React
interface Props {
  config: IMConfig
  showTopTools: boolean
  showBottomTools: boolean
  bottomCon: any
  isEditing: boolean
}
const MaskOfList = (props: Props) => {
  const { config, showTopTools, showBottomTools, bottomCon, isEditing } = props
  const { records, currentCardSize, widgetRect, showLoading } = useListRuntimeState()
  const listRuntimeDispatch = useListRuntimeDispatch()
  const appMode = ReactRedux.useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)

  const [listLeftPadding, setListLeftPadding] = useState(0)
  const [topToolsH, setTopToolsH] = useState(0)
  const [bottomToolH, setBottomToolH] = useState(0)
  const [isShowListMask, setIsShowListMask] = useState(false)

  useEffect(() => {
    const isShowListMask = checkIsShowListMask(records, showLoading, isEditing, appMode)
    setIsShowListMask(isShowListMask)
    listRuntimeDispatch({ type: 'SET_IS_SHOW_EDITING_MASK', value: isShowListMask })
  }, [records, showLoading, isEditing, appMode, listRuntimeDispatch])

  useEffect(() => {
    const listLeftPadding = getListContentLeftPadding(config, widgetRect, currentCardSize)
    setListLeftPadding(listLeftPadding)
  }, [config, widgetRect, currentCardSize])

  useEffect(() => {
    const topToolsH = showTopTools ? DS_TOOL_H : 0
    setTopToolsH(topToolsH)
  }, [config, showTopTools])

  useEffect(() => {
    if (bottomCon && showBottomTools) {
      const bottomToolH = getBottomToolH(bottomCon.current, showBottomTools)
      setBottomToolH(bottomToolH)
    } else {
      setBottomToolH(0)
    }
  }, [showBottomTools, bottomCon])

  const checkIsShowListMask = (records, showLoading: boolean, isEditing: boolean, appMode: AppMode) => {
    const { isInBuilder } = window.jimuConfig
    const isNoData = !records || records.length < 1
    const isDataLoadedAndHasData = !(!showLoading && isNoData)
    return isInBuilder && isEditing && isDataLoadedAndHasData && appMode === AppMode.Design
  }

  const STYLE = css`
    &.editing-mask-con {
      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: ${topToolsH}px;
        z-index: 10;
        height: ${currentCardSize.height}px;
        width: ${listLeftPadding}px;
        background-color: rgba(0, 0, 0, 0.5);
      }
      .editing-mask-list-grid {
        position: absolute;
        left: ${currentCardSize.width + listLeftPadding}px;
        top: ${topToolsH}px;
        right: 0;
        z-index: 10;
        height: ${currentCardSize.height}px;
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
    .editing-mask-list {
      position: absolute;
      top: ${
        config?.layoutType !== ListLayoutType.Column && records?.length > 0
          ? currentCardSize.height + topToolsH
          : topToolsH
      }px;
      left: ${
        config?.layoutType === ListLayoutType.Column && records?.length > 0
          ? currentCardSize.width
          : 0
      }px;
      bottom: ${bottomToolH}px;
      right: 0;
      z-index: 10;
      background-color: rgba(0, 0, 0, 0.5);
    }
    .editing-mask-ds-tool {
      position: absolute;
      z-index: 10;
      top: 0;
      left: 0;
      height: ${topToolsH}px;
      right: 0;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .editing-mask-bottom-tool {
      position: absolute;
      z-index: 10;
      height: ${bottomToolH}px;
      left: 0;
      bottom: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.5);
    }
  `

  return (
    <React.Fragment>
      {isShowListMask && <div className='editing-mask-con' css={STYLE}>
        {showTopTools && <div className='editing-mask-ds-tool' />}
        <div className='editing-mask-list' />
        {config?.layoutType === ListLayoutType.GRID && <div className='editing-mask-list-grid' />}
        {showBottomTools && (
          <div className='editing-mask-bottom-tool' />
        )}
      </div>}
    </React.Fragment>
  )
}
export default MaskOfList