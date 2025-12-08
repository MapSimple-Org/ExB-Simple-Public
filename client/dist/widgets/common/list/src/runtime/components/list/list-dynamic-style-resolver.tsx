/** @jsx jsx */
import { jsx, React, Immutable, type IMDynamicStyle, DynamicStyleResolverComponent, type ImmutableArray, type UseDataSource } from 'jimu-core'
import type { IMDynamicStyleOfCard, IMCardConfig, Status } from '../../../config'
const { useRef, useEffect, Fragment } = React

interface Props {
  id: string
  cardConfig: IMCardConfig
  dynamicStyleOfCard: IMDynamicStyleOfCard
  useDataSources: ImmutableArray<UseDataSource>
  handleDynamicStyleChange: (dynamicStyleOfCard: IMDynamicStyleOfCard) => void
}
const DynamicStyleResolver = (props: Props) => {
  const dynamicStyleOfCardRef = useRef(Immutable({}) as IMDynamicStyleOfCard)
  const { id, cardConfig, useDataSources, dynamicStyleOfCard, handleDynamicStyleChange } = props

  useEffect(() => {
    dynamicStyleOfCardRef.current = dynamicStyleOfCard
  }, [dynamicStyleOfCard])

  const dynamicStyleChange = (style: IMDynamicStyle, status: Status) => {
    const newDynamicStyleOfCard = dynamicStyleOfCardRef.current.setIn([status], style)
    dynamicStyleOfCardRef.current = newDynamicStyleOfCard
    handleDynamicStyleChange(newDynamicStyleOfCard)
  }

  const getEnableDynamicStyle = (cardConfig): string[] => {
    return Object.keys(cardConfig).filter(status => {
      const cardConfigItem = cardConfig[status]
      const dynamicStyleConfig = cardConfigItem?.dynamicStyleConfig || {}
      return cardConfigItem?.enableDynamicStyle && Object.keys(dynamicStyleConfig)?.length > 0
    })
  }

  return (
    <Fragment>
      {getEnableDynamicStyle(cardConfig).map((status: Status) => {
        return (<DynamicStyleResolverComponent
          key={status}
          widgetId={id}
          useDataSources={useDataSources}
          dynamicStyleConfig={cardConfig[status]?.dynamicStyleConfig}
          onChange={(style) => { dynamicStyleChange(style, status) }}
        />)
      })}
    </Fragment>)
}

export default DynamicStyleResolver
