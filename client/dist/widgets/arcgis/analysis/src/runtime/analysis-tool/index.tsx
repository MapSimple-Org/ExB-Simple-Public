/** @jsx jsx */
import {
  React, jsx
} from 'jimu-core'
import type { ToolProps } from './config'
import StandardTool from './standard-tool'
import RFxTool from './rfx-tool'
import CustomTool from './custom-tool'
import { ToolType } from '../../config'
import { useAnalysisComponentDefined } from '../../utils/util'
import { useShowToolDetail } from '../utils'
import { Loading } from 'jimu-ui'
import ToolError from './error'

const AnalysisTool = (props: ToolProps) => {
  const { toolInfo, disableBack, hasAccess, signIn, onBack } = props

  const defined = useAnalysisComponentDefined('analysis-tool')

  const { showToolDetail, showError } = useShowToolDetail(signIn, toolInfo)

  const renderTool = () => {
    return toolInfo.type === ToolType.Standard
      ? <StandardTool {...props} />
      : toolInfo.type === ToolType.RasterFunction
        ? <RFxTool {...props} />
        : <CustomTool {...props} />
  }

  const isLoading = !defined || (!showToolDetail && !showError)

  return isLoading
    ? <Loading />
    : !hasAccess || showError
      ? <ToolError onBack={onBack} disableBack={disableBack} />
      : showToolDetail && renderTool()

}

export default AnalysisTool
