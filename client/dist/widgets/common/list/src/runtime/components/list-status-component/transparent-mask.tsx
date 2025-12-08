/** @jsx jsx */
import { jsx, React, AppMode, hooks, ReactRedux, getAppStore, Immutable } from 'jimu-core'
import type {IMState, SizeModeLayoutJson } from 'jimu-core'
import { searchUtils } from 'jimu-layouts/layout-runtime'
import type { IMConfig, Status } from '../../../config'
const { useEffect, useState } = React
interface Props {
  config: IMConfig
  selectionIsInSelf: boolean
  selectionIsSelf: boolean
  builderStatus: Status
  layouts?: { [name: string]: SizeModeLayoutJson }
  forceShowMask: any
}
const TransparentMask = (props: Props) => {
  const browserSizeMode = ReactRedux.useSelector((state: IMState) => state?.browserSizeMode)
  const appMode = ReactRedux.useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)

  const [showMask, setShowMask] = useState(false)
  useEffect(() => {
    checkIsShowMask(props)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props])

  const checkIsShowMask = hooks.useEventCallback((props: Props) => {
    const { config, selectionIsInSelf, selectionIsSelf, builderStatus, layouts, forceShowMask } = props
    let newShowMask = showMask
    const appConfig = getAppStore().getState().appConfig
    const isInBuilder = window.jimuConfig.isInBuilder
    const currentLayout =
      appConfig?.layouts[
        searchUtils.findLayoutId(
          Immutable(layouts[builderStatus]),
          browserSizeMode,
          appConfig.mainSizeMode
        )
      ]
    const currentLayoutType = currentLayout && currentLayout.type

    if (!isInBuilder || appMode === AppMode.Run) {
      newShowMask = false
    } else {
      if (appMode === AppMode.Express) {
        newShowMask = !!(!config.isItemStyleConfirm && currentLayoutType)
      } else {
        newShowMask = forceShowMask || (!selectionIsInSelf && !selectionIsSelf) || (!config.isItemStyleConfirm && currentLayoutType)
      }
    }
    setShowMask(newShowMask)
  })

  return (
    <React.Fragment>
      {showMask && <div className='list-with-mask' />}
    </React.Fragment>
  )
}
export default TransparentMask