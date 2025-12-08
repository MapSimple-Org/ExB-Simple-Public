import { React, ReactRedux, type IMState, type AllWidgetProps } from 'jimu-core'
import { versionManager } from '../version-manager'
import { ListRuntimeStateProvider } from './state'
import type { IMConfig } from '../config'
import List from './components/list-widget'
import { getExtraStateProps } from './utils/utils'
import { Paper } from 'jimu-ui'

const { useSelector } = ReactRedux

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const extraStatePropsRef = React.useRef(null)
  const extraStateProps = useSelector((state: IMState) => {
    const extraState = getExtraStateProps(state, props)
    if (JSON.stringify(extraStatePropsRef.current) === JSON.stringify(extraState)) {
      return extraStatePropsRef.current
    } else {
      extraStatePropsRef.current = extraState
      return extraState
    }
  })

  return (
    <Paper shape="none" transparent className='jimu-widget widget-list'>
      <ListRuntimeStateProvider>
        <List
          {...extraStateProps}
          {...props}
        />
      </ListRuntimeStateProvider>
    </Paper>
  )
}

Widget.versionManager = versionManager

export default Widget
