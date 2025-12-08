/** @jsx jsx */
import { React, jsx, hooks, css, defaultMessages as jimCoreDefaultMessage, ReactRedux, type IMState, UtilityManager } from 'jimu-core'
import { Alert, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { type IMServiceList, SearchServiceType } from '../../config'
import { getJsonLength } from '../utils/utils'
const { useState, useRef, useEffect } = React

interface Props {
  open: boolean
  serviceList: IMServiceList
  toggleUtilityErrorRemind: (open?: boolean) => void
}

const STYLE = css`
  & .utility-err-remind-con {
    bottom: 0;
  }
`

const UtilityErrorRemind = (props: Props) => {
  const nls = hooks.useTranslation(jimuiDefaultMessage, jimCoreDefaultMessage)
  const closeRemindTimeout = useRef(null)
  const { serviceList, open, toggleUtilityErrorRemind } = props
  const [text, setText] = useState(null)

  const utilityStates = ReactRedux.useSelector((state: IMState) => {
    return state?.appRuntimeInfo?.utilityStates
  })

  useEffect(() => {
    if (open) {
      clearTimeout(closeRemindTimeout.current)
      closeRemindTimeout.current = setTimeout(() => {
        toggleUtilityErrorRemind(false)
      }, 5000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    getErrorText(utilityStates)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilityStates])

  const getErrorText = (utilityStates) => {
    if (!serviceList) return
    let newText = null
    let noServiceUtility = []
    let noSignInErrorUtility = []

    Object.keys(serviceList)?.forEach(configId => {
      const serviceItem = serviceList[configId]
      if (serviceItem.searchServiceType === SearchServiceType.GeocodeService) {
        const utilityId = serviceItem?.useUtility?.utilityId
        if (utilityId) {
          const utilityState = utilityStates?.[utilityId]
          if (utilityState?.isSignInError) {
            noSignInErrorUtility.push(utilityId)
          } else if (utilityState?.success === false) {
            noServiceUtility.push(utilityId)
          }
        }
      }
    })

    noServiceUtility = getUtilityLabels(noServiceUtility)
    noSignInErrorUtility = getUtilityLabels(noSignInErrorUtility)

    if (noServiceUtility?.length === 0 && noSignInErrorUtility?.length > 0) {
      newText = getSignInErrorsText(noSignInErrorUtility)
    } else if (noSignInErrorUtility?.length === 0 && noServiceUtility?.length > 0) {
      newText = getUtilityNotAvailableText(noServiceUtility)
    } else if (noSignInErrorUtility?.length > 0 && noServiceUtility?.length > 0) {
      const signInErrorsText = getSignInErrorsText(noSignInErrorUtility)
      const utilityNotAvailableText = getUtilityNotAvailableText(noServiceUtility)
      newText = `${signInErrorsText} ${utilityNotAvailableText}`
    }

    setText(newText)
  }

  const getUtilityLabels = (utilityIds: string[] = []): string[] => {
    utilityIds = Array.from(new Set(utilityIds))
    return utilityIds.map(utilityId => {
      const utilityJson = UtilityManager.getInstance().getUtilityJson(utilityId)
      return utilityJson?.label
    })
  }

  const getSignInErrorsText = (noSignInErrorUtility: string[]): string => {
    let newText = null
    const serviceLength = getJsonLength(serviceList)
    if (serviceLength === 1) {
      noSignInErrorUtility?.length > 0 && (newText = nls('signInErrorDefault'))
    } else {
      noSignInErrorUtility?.length > 0 && (newText = nls('signInErrorsDefault', { names: noSignInErrorUtility.join(', ') }))
    }
    return newText
  }

  const getUtilityNotAvailableText = (noServiceUtility: string[]): string => {
    let newText = null
    const serviceLength = getJsonLength(serviceList)
    if (serviceLength === 1) {
      noServiceUtility?.length === 1 && (newText = nls('utilityInaccessible'))
    } else {
      noServiceUtility?.length > 0 && (newText = nls('utilityNotAvailableWidthName', { name: noServiceUtility.join(', ') }))
    }
    return newText
  }

  return (
    <div className='position-relative w-100' css={STYLE}>
      <div className='w-100 utility-err-remind-con'>
        <Alert
          buttonType='tertiary'
          className='w-100'
          type='warning'
          withIcon
          closable
          onClose={() => { toggleUtilityErrorRemind(false) }}
          text={text}
          title={text}
        />
      </div>
    </div>
  )
}

export default UtilityErrorRemind
