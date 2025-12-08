/** @jsx jsx */
import { React, jsx, hooks, css, SupportedUtilityType, type ImmutableArray, type UseUtility, type IMUtilityJson, ReactRedux, type IMState, loadArcGISJSAPIModule, SessionManager, SignInErrorCode } from 'jimu-core'
import { Alert, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { UtilitySelector } from 'jimu-ui/advanced/utility-selector'
import type { AnalysisToolInfo } from '@arcgis/analysis-ui-schema'
import { getCustomToolUrlWithToken } from '../../utils/util'
import type { CustomToolAdded } from '../../config'
import ToolSelectorButton from './tool-selector-button'
import { getMapServiceLayerParameter, getResultMapServerNameByToolUrl } from '../utils'

export interface Props {
  onChange: (data: CustomToolAdded) => void
}

const style = css`
  position: relative;
  .select-button {
    font-size: 0.875rem;
  }
  &:hover {
    .select-button {
      background: var(--ref-palette-neutral-600);
    }
  }
  > div {
    padding-bottom: 0 !important;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    button.jimu-btn, button.jimu-btn:hover {
      height: 100%;
      border: none;
      overflow: hidden;
      color: rgba(0, 0, 0, 0);
      background: rgba(0, 0, 0, 0);
    }
  }
`

const supportedUtilityTypes = [SupportedUtilityType.GPTask, SupportedUtilityType.Printing]

const CustomAnalysisToolSelector = (props: Props): React.ReactElement => {
  const { onChange } = props
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessage)

  const getUtilityGPTaskUrl = (task: string, utilityJson: IMUtilityJson) => {
    return task ? `${utilityJson.url}/${task}` : utilityJson.url
  }

  const utilitiesState = ReactRedux.useSelector((state: IMState) => {
    return state.appStateInBuilder.appConfig.utilities
  })

  const esriRequest = React.useRef<typeof __esri.request>(null)

  const getWebToolJSON = (toolUrl: string, needToken: boolean = true): Promise<AnalysisToolInfo> => {
    const options: __esri.RequestOptions = { query: { f: 'json' }, responseType: 'json' }

    const toolUrlWithToken = needToken ? getCustomToolUrlWithToken(toolUrl) : toolUrl

    return esriRequest.current(toolUrlWithToken, options).then(r => r.data as AnalysisToolInfo).catch((error) => {
      const signInErrorCode = SessionManager.getInstance().getSignInErrorCodeByAuthError(error)
      if (signInErrorCode === SignInErrorCode.InvalidToken) {
        return getWebToolJSON(toolUrl, false)
      }
      return Promise.reject(new Error(error))
    })
  }

  const [openInvalidItemWarning, setOpenInvalidItemWarning] = React.useState(false)

  const onUtilityChange = async (utilities: ImmutableArray<UseUtility>) => {
    const utility = utilities?.[0]?.asMutable()
    if (utility) {
      if (!esriRequest.current) {
        esriRequest.current = await loadArcGISJSAPIModule('esri/request')
      }
      const utilityJson = utilitiesState[utility.utilityId]
      const toolUrl = getUtilityGPTaskUrl(utility.task, utilityJson)

      const resultMapServerName = await getResultMapServerNameByToolUrl(toolUrl)

      getWebToolJSON(toolUrl).then((toolInfo) => {
        // add extra parameter if the output of gp task is map service layer
        if (resultMapServerName) {
          toolInfo.parameters.push(getMapServiceLayerParameter(resultMapServerName))
        }

        onChange({
          utility,
          toolInfo,
          toolUrl
        })
      }).catch(() => {
        setOpenInvalidItemWarning(true)
        setTimeout(() => {
          setOpenInvalidItemWarning(false)
        }, 3000)
      })
    }
  }

  return (
    <React.Fragment>
      <div className="custom-analysis-tool-selector w-100" css={style} title={translate('addCustomTool')} role='group' aria-label={translate('addCustomTool')}>
        {/* use this button to cover the 'Select utility' button, set 'pointer-events: none' to this button to ignore events */}
        <ToolSelectorButton
          iconSvg={require('jimu-icons/svg/outlined/gis/custom-web-tool.svg')}
          text={translate('addCustomTool')}
          className='w-100 select-button'
          tabIndex={-1}
        />
        <UtilitySelector
          onChange={onUtilityChange}
          showRemove={false}
          showOrgUtility={false}
          closePopupOnSelect
          types={supportedUtilityTypes}
        />
      </div>
      <Alert
        className='w-100 mt-2' form="basic" variant='text' size='small' closable text={translate('invalidResourceItem')} style={{ minWidth: 'unset' }}
        type="warning" withIcon open={openInvalidItemWarning} onClose={() => { setOpenInvalidItemWarning(false) }} />
    </React.Fragment>
  )
}

export default CustomAnalysisToolSelector
