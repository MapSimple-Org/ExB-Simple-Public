/** @jsx jsx */
import { React, jsx, defaultMessages as jimuCoreDefaultMessage, hooks } from 'jimu-core'
import { Button, Tooltip, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import { checkIsElementOverrideItemAvailable } from '../../../utils/utils'
import defaultMessages from '../../translations/default'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'

interface Props {
  elementOverridesOption: any,
  needDsSelector: boolean
}

const ElementOverridesOptionsLabel = (props: Props) => {
  const { elementOverridesOption, needDsSelector } = props
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage, jimuCoreDefaultMessage)
  const name = elementOverridesOption.name
  if (!needDsSelector) {
    return name
  } else {
    const available = checkIsElementOverrideItemAvailable(elementOverridesOption)
    return (<div className='d-flex w-100 align-item-center'>
      <span className='flex-grow-1'>{name}</span>
      {!available && <Tooltip title={translate('dynamicElementTemplateRemind')}>
        {/* CollapsablePanel triggers the expand/collapse event through Label. If Label element contains other interactive nodes, Label will point to other interactive nodes,
          which will cause CollapsablePanel to fail to expand.
          https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/25222#issuecomment-5482804
        */}
        <Button tag='div' tabIndex={0} icon variant='text' className='p-0 warning-icon-con' aria-label={translate('dynamicElementTemplateRemind')}>
          <WarningOutlined/>
        </Button>
      </Tooltip>}
    </div>)
  }
}
export default ElementOverridesOptionsLabel
