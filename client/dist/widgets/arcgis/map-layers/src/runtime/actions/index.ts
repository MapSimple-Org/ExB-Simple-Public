import Goto from './goto'
import Label from './label'
import Transparency from './transparency'
import Information from './information'
import OptionAction from './option-action'
import Popup from './popup'
import VisibilityRange from './visibility-range'
import ChangeSymbol from './change-symbol'
import Remove from './remove'

export function getLayerListActions (widget) {
  const translate = widget.translate

  const rawActions = [
    new Goto(
      widget,
      translate('goto')
    ),
    new Label(
      widget,
      translate('showLabels'),
      translate('hideLabels')
    ),
    new Popup(
      widget,
      translate('enablePopup'),
      translate('disablePopup')
    ),
    new Transparency(
      widget,
      translate('transparency')
    ),
    new VisibilityRange(
      widget,
      translate('visibilityRange')
    ),
    new Information(
      widget,
      translate('information')
    ),
    new ChangeSymbol(
      widget,
      translate('changeSymbol')
    ),
    new Remove(
      widget,
      translate('remove')
    ),
    new OptionAction(
      widget,
      translate('options')
    )
  ]
  // Sort actions according to the group number
  return rawActions.sort((a, b) => {
    return a.group - b.group
  })
}
