/** @jsx jsx */
import { React, jsx, hooks, css } from 'jimu-core'
import defaultMessages from '../translations/default'
import { Checkbox, Label } from 'jimu-ui'

export interface AddToDominantRouteFormProps {
  addToDominantRoute: boolean
  onUpdateAddToDominantRoute: (addToDominantRoute: boolean) => void
}

export function AddToDominantRouteForm (props: AddToDominantRouteFormProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { addToDominantRoute, onUpdateAddToDominantRoute } = props

  React.useEffect(() => {
    // Reset the query form.
    onUpdateAddToDominantRoute(addToDominantRoute)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddToDominantRoute = (e, checked: boolean) => {
    onUpdateAddToDominantRoute(checked)
  }

  return (
    <div className="merge-retire-form px-3 h-100">
      <hr
          css={css`
            border: none;
            height: 1px;
            background-color: var(--ref-palette-neutral-400);
          `}
      />
      <Label size="sm" className="w-100 pt-0" centric check>
        <Checkbox
          className="mr-2"
          checked={addToDominantRoute}
          onChange={handleAddToDominantRoute}
        />
        {getI18nMessage('addToDominantRouteLabel')}
      </Label>
    </div>
  )
}
