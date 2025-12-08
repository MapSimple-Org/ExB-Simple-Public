/** @jsx jsx */
import { React, jsx, hooks, css } from 'jimu-core'
import type { JimuLayerView } from 'jimu-arcgis'
import { Dropdown, DropdownMenu, DropdownButton, DropdownItem, defaultMessages as jimuUIMessages } from 'jimu-ui'
import defaultMessages from '../../../translations/default'

export interface Props {
  defaultValue: string
  allVisibleBuildingLayerViews: JimuLayerView[]
  onOptionClick: (layerId: string) => void
}

export const SingleModeSelector = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const [isOpenStates, setIsOpenStates] = React.useState<boolean>(false)
  const [currentValueStates, setCurrentValueStates] = React.useState<string>(props.defaultValue || null)
  React.useEffect(() => {
    setCurrentValueStates(props.defaultValue)
  }, [props.defaultValue])

  // DropdownButton
  const getBtnContent = () => {
    let string = ''
    if (currentValueStates === '') {
      string = translate('selectLayerToExplore')
    } else {
      const layerView = props.allVisibleBuildingLayerViews.find((layerView) => layerView.id === currentValueStates)
      string = layerView?.layer?.title
    }

    return string
  }

  const onDropDownToggle = () => {
    setIsOpenStates(!isOpenStates)
  }

  // DropdownItems
  const getDropdownItems = () => {
    const options = []
    // 1.none
    if (props.allVisibleBuildingLayerViews && props.allVisibleBuildingLayerViews.length > 0) {
      const emptyValue = ''
      options.push(
        <DropdownItem key={emptyValue} header={false}
          active={(currentValueStates === emptyValue)}
          onClick={() => { onItemClick(emptyValue) }}
        >
          {translate('none')}
        </DropdownItem>
      )
    }
    // 2.layers
    props.allVisibleBuildingLayerViews.forEach((buildingLayerView, index) => {
      options.push(
        <DropdownItem key={index} header={false}
          active={(currentValueStates === buildingLayerView.id)}
          onClick={() => { onItemClick(buildingLayerView.id) }}
        >
          <div className='text-truncate'>{buildingLayerView.layer?.title}</div>
        </DropdownItem>
      )
    })

    return options
  }

  const onItemClick = (layerId: string) => {
    setCurrentValueStates(layerId)
    setIsOpenStates(false)

    props.onOptionClick(layerId)
  }

  const getDropdownStyle = () => {
    return css`
      & {
        max-width: 536px;
        overflow: hidden;
      }
    `
  }

  return (
    <div className='single-mode-selector'>
      <Dropdown
        isOpen={isOpenStates}
        toggle={onDropDownToggle}
        activeIcon={true} direction='down' size='sm' fluid
      >
        <DropdownButton size='sm' type='default'>
          {getBtnContent()}
        </DropdownButton>
        <DropdownMenu css={getDropdownStyle()}>
          {getDropdownItems()}
        </DropdownMenu>
      </Dropdown>
    </div>
  )
})
