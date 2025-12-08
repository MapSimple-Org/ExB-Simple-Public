/** @jsx jsx */
import { React, jsx, hooks, css } from 'jimu-core'
import defaultMessages from '../translations/default'
import { Checkbox, Label } from 'jimu-ui'
import type {
  EventInfo
} from 'widgets/shared-code/lrs'

export interface MergeRetireAddFormProps {
  eventInfo: EventInfo
  onUpdateEventInfo: (updatedEventInfo: EventInfo) => void
  hideAddToDominantRouteOption: boolean
  addToDominantRoute: boolean
  onUpdateAddToDominantRoute: (addToDominantRoute: boolean) => void
}

export function MergeRetireAddForm (props: MergeRetireAddFormProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { eventInfo, onUpdateEventInfo, hideAddToDominantRouteOption, addToDominantRoute, onUpdateAddToDominantRoute } = props
  const [useMergeEvents, setUseMergeEvents] = React.useState<boolean>(false)
  const [useRetireEvents, setUseRetireEvents] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Reset the query form.
    const updatedEventInfo = {
      ...eventInfo,
      mergeCoincident: false,
      retireOverlapping: false
    }
    onUpdateEventInfo(updatedEventInfo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    setUseMergeEvents(eventInfo.mergeCoincident)
    setUseRetireEvents(eventInfo.retireOverlapping)
  }, [eventInfo])

  const handleUseMergeEvents = (e, checked: boolean) => {
    setUseMergeEvents(checked)
    const updatedEventInfo = {
      ...eventInfo,
      mergeCoincident: checked
    }
    onUpdateEventInfo(updatedEventInfo)
  }

  const handleUseRetireEvents = (e, checked: boolean) => {
    setUseRetireEvents(checked)
    const updatedEventInfo = {
      ...eventInfo,
      retireOverlapping: checked
    }
    onUpdateEventInfo(updatedEventInfo)
  }

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
            background-color: var(--sys-color-divider-secondary);
          `}
      />
      <Label size="sm" className="w-100 pt-1 label2" centric check>
        <Checkbox
          checked={useMergeEvents}
          className="mr-2"
          onChange={handleUseMergeEvents}
        />
        {getI18nMessage('useMergeEventsLabel')}
      </Label>

      <Label size="sm" className="w-100 pt-0 label2" centric check>
        <Checkbox
          checked={useRetireEvents}
          className="mr-2"
          onChange={handleUseRetireEvents}
        />
        {getI18nMessage('useRetireEventsLabel')}
      </Label>
      {!hideAddToDominantRouteOption && (
        <Label size="sm" className="w-100 pt-0" centric check>
          <Checkbox
            className="mr-2"
            checked={addToDominantRoute}
            onChange={handleAddToDominantRoute}
          />
          {getI18nMessage('addToDominantRouteLabel')}
        </Label>
      )}
    </div>
  )
}
