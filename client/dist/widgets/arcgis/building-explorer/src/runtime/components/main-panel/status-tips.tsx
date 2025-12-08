/** @jsx jsx */
import { React, jsx, hooks } from 'jimu-core'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import defaultMessages from '../../translations/default'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

import { WidgetBuildingExplorerOutlined } from 'jimu-icons/outlined/brand/widget-building-explorer'

export interface Props {
  isNoSelectedLayersFlag: boolean
  isNoBuildingLayersFlag: boolean
  isNoToolFlag: boolean
}

export const StatusTips = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  return (
    <div className={'status-tips d-flex flex-column h-100 align-items-center justify-content-center'}>
      <div className={''}>
        {/* 1.no selected layer */}
        { (props.isNoSelectedLayersFlag && !props.isNoBuildingLayersFlag) && <WidgetBuildingExplorerOutlined size={40} color='var(--ref-palette-neutral-600)'/> }
        {/* 2.no building layer */}
        { props.isNoBuildingLayersFlag && <WarningOutlined size={40} color='var(--sys-color-warning-dark)'/> }
        {/* 3.no tool */}
        { props.isNoToolFlag && <InfoOutlined size={32} color='var(--sys-color-info-main)'/> }
      </div>
      <div className={'mt-2'} style={{ textAlign: 'center' }}>
        {/* 2.no building layer */}
        { props.isNoBuildingLayersFlag && translate('noBuildingLayers') }
        {/* 3.no tool */}
        { props.isNoToolFlag && <div className='d-flex flex-column h-100 align-items-center justify-content-center'>
            <div>{translate('noTool')}</div>
            <div>{translate('preConfigTool')}</div>
          </div>
        }
      </div>
    </div>
  )
})
