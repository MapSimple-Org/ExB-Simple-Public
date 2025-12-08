import { React } from 'jimu-core'
import { Collapse, Switch, Label } from 'jimu-ui'

interface Props {
  title: string
  isOpen: boolean
  toggle: () => void
  children?: React.ReactNode
}
export default class AdvanceCollapse extends React.PureComponent<Props> {
  render () {
    return (
      <div className='w-100'>
        <Label className='collapse-label title3 hint-default mb-2 d-flex justify-content-between align-items-center'>
          {this.props.title}
          <Switch name='open-collapse' onChange={this.props.toggle} checked={this.props.isOpen} />
        </Label>
        <Collapse isOpen={this.props.isOpen}>
          {
            this.props.isOpen && this.props.children
          }
        </Collapse>
      </div>
    )
  }
}
