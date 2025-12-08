/** @jsx jsx */
import { React, jsx, css, Immutable, ReactRedux, type IMState, type IMUseUtility, type UseUtility, type ImmutableArray, SupportedUtilityType, hooks, getAppStore } from 'jimu-core'
import { defaultMessages as jimuUiDefaultMessages } from 'jimu-ui'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { UtilitySelector } from 'jimu-ui/advanced/utility-selector'
import defaultMessages from '../translations/default'
import type { IMConfig } from '../../config'
import { getNewTemplateInfo } from '../../utils/service-util'
import { reportUtilityState } from '../../utils/utils'
import { getDefaultUtility } from '../util/util'
const { useState, useEffect, useRef } = React
interface Props {
  config: IMConfig
  id: string
  showLoading: boolean
  onSettingChange: SettingChangeFunction
  toggleLoading: (isShowLoading: boolean) => void
  toggleRemindPopper: (open?: boolean) => void
}

const supportedUtilityTypes = [SupportedUtilityType.Printing]

const PrintServiceSelect = (props: Props) => {
  const isRemoveServiceRef = useRef(false)
  const nls = hooks.useTranslation(defaultMessages, jimuUiDefaultMessages)
  const { config, id, onSettingChange, toggleLoading, toggleRemindPopper } = props
  const useUtilities = ReactRedux.useSelector((state: IMState) => state.appStateInBuilder.appConfig.widgets[id]?.useUtilities)

  const [useUtility, setUseUtility] = useState(config?.useUtility)

  const STYLE = css`
    &>div>div {
      padding-left: 0!important;
      padding-right: 0!important;
    }
    .utility-list {
      margin-bottom: 0 !important;
    }
  `

  useEffect(() => {
    setUseUtility(config?.useUtility)
  }, [config])

  useEffect(() => {
    if (config && !useUtilities) {
      autoSelectUtility()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useUtilities, config])

  const autoSelectUtility = () => {
    const defaultUtility = getDefaultUtility(nls)
    if (defaultUtility?.utilityId) {
      isRemoveServiceRef.current = false
      addUseUtility(Immutable(defaultUtility))
    }
  }

  const handleUtilityChange = (utilities: ImmutableArray<UseUtility>) => {
    const utility = utilities[0]
    setUseUtility(utility)
    if (!utility) {
      isRemoveServiceRef.current = true
      removeUtility()
    } else {
      isRemoveServiceRef.current = false
      addUseUtility(utility)
    }
  }

  const removeUtility = () => {
    let newConfig = config
    newConfig = newConfig.set('useUtility', null)
    setUseUtility(null)
    toggleLoading(false)
    onSettingChange({
      id: id,
      config: newConfig,
      useUtilities: []
    })
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  const addUseUtility = async (utility: IMUseUtility) => {
    toggleLoading(true)
    setUseUtility(utility)
    getNewTemplateInfo(utility, config).then(newConfig => {
      if (isRemoveServiceRef.current) {
        return false
      }
      toggleLoading(false)
      onSettingChange({
        id: id,
        config: newConfig,
        useUtilities: utility ? [utility] : []
      })
    }, err => {
      reportUtilityState(utility?.utilityId, null, err)
      removeUtility()
      toggleLoading(false)
      toggleRemindPopper(true)
    })
  }

  const getUseUtility = (useUtility) => {
    if (!useUtility) return Immutable([])
    const utilities = getAppStore().getState().appStateInBuilder.appConfig?.utilities
    if (utilities?.[useUtility.utilityId]) {
      return Immutable([useUtility])
    } else {
      Immutable([])
    }
  }

  return (
    <div css={STYLE}>
      <SettingRow flow='wrap' label={nls('printService')} aria-label={nls('printService')}>
        <UtilitySelector
          useUtilities={getUseUtility(useUtility)}
          onChange={handleUtilityChange}
          showRemove
          closePopupOnSelect
          types={supportedUtilityTypes}
        />
      </SettingRow>
    </div>
  )
}

export default PrintServiceSelect
