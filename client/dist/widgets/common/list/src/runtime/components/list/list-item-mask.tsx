/** @jsx jsx */
import { jsx, React, css, classNames, AppMode, hooks, ReactRedux, type IMState } from 'jimu-core'
import { defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import type { IMConfig } from '../../../config'
import { useListRuntimeState } from '../../state'
const { useEffect } = React
interface Props {
  id: string
  config: IMConfig
  recordIndex: number
  previewDynamicStyle: boolean
  updatePreviewDynamicStyle: (isPreview: boolean) => void
}
const MaskOfListItem = (props: Props) => {
  const nls = hooks.useTranslation(jimuUiDefaultMessage)

  const { config, id, recordIndex, previewDynamicStyle, updatePreviewDynamicStyle } = props
  const { records, showLoading, currentCardSize } = useListRuntimeState()
  const isDynamicStyleSettingActive = ReactRedux.useSelector((state: IMState) => typeof state?.dynamicStyleState?.previewConditionInfo?.[id]?.conditionId === 'number')
  const previewRecordIndex = ReactRedux.useSelector((state: IMState) => state?.dynamicStyleState?.previewRepeatedRecordInfo?.[id]?.recordIndex)
  const appMode = ReactRedux.useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)

  const checkIsShowListMask = React.useCallback(() => {
    const { isInBuilder } = window.jimuConfig
    const isNoData = !records || records.length < 1
    const isDataLoadedAndHasData = !(!showLoading && isNoData)
    return isInBuilder && isDynamicStyleSettingActive && isDataLoadedAndHasData && !previewDynamicStyle && appMode !== AppMode.Design
  }, [isDynamicStyleSettingActive, records, showLoading, previewDynamicStyle, appMode])

  useEffect(() => {
    const isPreviewItem = (recordIndex === previewRecordIndex && isDynamicStyleSettingActive)
    updatePreviewDynamicStyle(isPreviewItem)
  }, [previewRecordIndex, recordIndex, isDynamicStyleSettingActive, updatePreviewDynamicStyle])

  const STYLE = css`
    .list-item-mask {
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10;
      background-color: rgba(0, 0, 0, 0.5);
    }
    .space-mask {
      &::before, &::after{
        display: block;
        content: '';
        position: absolute;
        z-index: 10;
        background-color: rgba(0, 0, 0, 0.5);
      }
      &::before{
        top: ${currentCardSize.height}px;
        left: 0;
        right: 0;
        bottom: 0;
      }
      &::after {
        top: 0;
        left: ${currentCardSize.width}px;
        right: 0;
        bottom: 0;
      }
      &.space-mask-GRID::after {
        bottom: ${config.verticalSpace}px;
      }
    }
    .preview-remind {
      white-space: nowrap;
      z-index: 12;
      background-color: var(--sys-color-info-dark);
      color: var(--sys-color-info-text);
      height: 24px;
      line-height: 24px;
      font-size: 12px;
      top: ${currentCardSize.height}px;
      left: 0;
      transform: translateZ(0);
    }
    .preview-remind-COLUMN {
      top: auto;
      bottom: 0;
      left: ${currentCardSize.width}px;
    }
  `
  return (
    <div css={STYLE}>
      {checkIsShowListMask() && <div className={classNames('list-item-mask position-absolute', `list-item-mask-${config?.layoutType}`)}/>}
      {previewDynamicStyle && <React.Fragment>
        {appMode !== AppMode.Design && <div className={classNames('space-mask', `space-mask-${config?.layoutType}`)}/>}
        <div className={classNames('preview-remind pl-2 pr-2 position-absolute', `preview-remind-${config?.layoutType}`)}>
          {nls('conditionalStylePreview')}
        </div>
      </React.Fragment>}
    </div>
  )
}
export default MaskOfListItem