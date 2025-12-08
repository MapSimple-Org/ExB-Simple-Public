import { type IMState, React, ReactRedux, hooks, UtilityManager, type ImmutableArray, type UseUtility } from 'jimu-core'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuUIMessages, Alert } from 'jimu-ui'
import { useEffect } from 'react'
import { styled } from 'jimu-theme'
interface UtilsAlertProps {
  useUtilities: ImmutableArray<UseUtility>
}
const um = UtilityManager.getInstance()
const AlertWrapper = styled.div`
  display: flex;
  .jimu-alert-panel {
    flex: 1;
    margin: 2px;
  }
`

export default function UtilsAlert (props: UtilsAlertProps) {
  const { useUtilities } = props
  const [invalidMsg, setInvalidMsg] = React.useState(null)
  const [needLoginMsg, setNeedLoginMsg] = React.useState(null)
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const [isLoginAlertOpen, setIsLoginAlertOpen] = React.useState(true)
  const [isInvalidAlertOpen, setIsInvalidAlertOpen] = React.useState(true)

  const resourceSessions = ReactRedux.useSelector((state: IMState) => {
    return state.resourceSessions
  })

  useEffect(() => {
    async function checkUtils () {
      const invalidUtilsLabel = []
      const needLoginUtilsLabel = []

      if (useUtilities) {
        // No utilityStates available in runtime, check manually

        for (let i = 0; i < useUtilities.length; i++) {
          const failedUtilLabel = um.getLabelOfUseUtility(useUtilities[i])
          const utilityJson = um.getUtilityJson(useUtilities[i].utilityId)
          const { success, isSignInError } = await um.checkUtilityStatus(utilityJson)
          if (!success) {
            if (isSignInError) {
              needLoginUtilsLabel.push(failedUtilLabel)
            } else {
              invalidUtilsLabel.push(failedUtilLabel)
            }
          }
        }
      }

      const newNeedLoginMsg = needLoginUtilsLabel.length > 0 ? translate('namedNeedLoginUtilMsg', { label: needLoginUtilsLabel.join(', ') }) : null
      if (newNeedLoginMsg !== needLoginMsg) {
        setNeedLoginMsg(newNeedLoginMsg)
      }
      const newInvalidMsg = invalidUtilsLabel.length > 0 ? translate('namedInvalidUtilMsg', { label: invalidUtilsLabel.join(', ') }) : null
      if (newInvalidMsg !== invalidMsg) {
        setInvalidMsg(newInvalidMsg)
      }
    }
    checkUtils()
  }, [invalidMsg, needLoginMsg, translate, useUtilities, resourceSessions, props?.useUtilities])

  return (
    <div className='util-alert-wrapper d-flex flex-column position-absolute w-100' style={{ bottom: 0 }}>
      {invalidMsg &&
        <AlertWrapper>
          <Alert
            closable
            form="basic"
            onClose={() => {
              setIsInvalidAlertOpen(false)
            }}
            open = {isInvalidAlertOpen}
            text={invalidMsg}
            withIcon
          />
        </AlertWrapper>
      }
      {needLoginMsg &&
        <AlertWrapper>
          <Alert
            closable
            form="basic"
            onClose={() => {
              setIsLoginAlertOpen(false)
            }}
            open = {isLoginAlertOpen}
            text={needLoginMsg}
            withIcon
          />
        </AlertWrapper>
      }
    </div>
  )
}
