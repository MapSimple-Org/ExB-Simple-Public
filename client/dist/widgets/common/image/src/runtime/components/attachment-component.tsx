import { type DataRecord, React, type AttachmentInfo, type FeatureDataRecord as FeatureLayerDataRecord } from 'jimu-core'

interface Props {
  record: DataRecord
  onChange?: (attachmentInfos: AttachmentInfo[]) => void
  unmountAttachmentInfosChange?: () => void
}

interface State {
  attachmentInfos: AttachmentInfo[]
}

const attachmentTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/svg+xml', 'image/webp']

export class AttachmentComponent extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      attachmentInfos: null
    }
  }

  componentDidMount () {
    this.resolveExpressions(this.props.record)
  }

  componentWillUnmount () {
    this.props.unmountAttachmentInfosChange && this.props.unmountAttachmentInfosChange()
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    const sameRecordId = this.props.record?.getId() === prevProps.record?.getId()
    const sameDsId = this.props.record?.dataSource.id === prevProps.record?.dataSource.id
    if (!sameRecordId || !sameDsId) {
      this.resolveExpressions(this.props.record)
    }
  }

  resolveExpressions = async (record: DataRecord) => {
    const dataRecord = record as FeatureLayerDataRecord
    let attachmentInfos: AttachmentInfo[] = []
    if (dataRecord && dataRecord.attachmentInfos) {
      attachmentInfos= dataRecord.attachmentInfos
    } else if (dataRecord && dataRecord.queryAttachments) {
      try {
        attachmentInfos = await dataRecord.queryAttachments(attachmentTypes)
      } catch(err) {
        console.error('Error querying attachments:', err)
      }
    }
    this.props.onChange && this.props.onChange(attachmentInfos)
  }

  render () {
    return null
  }
}
