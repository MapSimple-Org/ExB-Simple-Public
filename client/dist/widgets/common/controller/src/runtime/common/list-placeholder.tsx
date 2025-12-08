import { Immutable, React } from 'jimu-core'
import { AvatarCard } from './avatar-card'
import WidgetPlaceHolderOutlined from 'jimu-icons/svg/outlined/brand/widget-place-holder.svg'
import { styled } from 'jimu-theme'
import { type AvatarProps, ControllerAlignment, type IMAvatarProps } from '../../config'

export interface ListPlaceholderProps {
  vertical?: boolean
  space?: number
  size?: AvatarProps['size']
  alignment?: ControllerAlignment
  shape?: AvatarProps['shape']
  buttonSize?: AvatarProps['buttonSize']
}

const createArray = (length: number) => {
  const arr = []
  while (length > 0) {
    arr.push(length)
    length--
  }
  return arr
}

const PlaceholderRoot = styled('div', {
  shouldForwardProp: (propName: string) => !['vertical', 'space', 'alignment'].includes(propName)
}) <{ vertical: boolean, space: number, alignment: ControllerAlignment }>(props => `
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: ${
    props.alignment === ControllerAlignment.Start
    ? 'flex-start'
    : props.alignment === ControllerAlignment.End
    ? 'flex-end'
    : 'center'
  };
  flex-direction: ${props.vertical ? 'column' : 'row'};
  .avatar-placeholder {
    &:not(:first-of-type) {
      margin-top: ${props.vertical ? `${props.space}px` : 'unset'};
      margin-left: ${!props.vertical ? `${props.space}px` : 'unset'};
    }
  }
`)
const dummyData = createArray(3)
const defaultAvatar: IMAvatarProps = Immutable({ type: 'secondary', size: 'lg', shape: 'circle' })
export const ListPlaceholder = (props: ListPlaceholderProps) => {
  const { vertical, space, size = 'lg', alignment = ControllerAlignment.Center, shape = 'circle', buttonSize } = props
  const avatar = React.useMemo(() => (defaultAvatar.set('size', size).set('shape', shape).set('buttonSize', buttonSize)), [size, shape, buttonSize])

  return (
    <PlaceholderRoot className='list-placeholder' vertical={vertical} space={space} alignment={alignment}>
      {dummyData.map((_, idx) => (
        <AvatarCard key={idx} disabled={true} className='avatar-placeholder' icon={WidgetPlaceHolderOutlined} label='' showTooltip={false} avatar={avatar}></AvatarCard>
      ))}
    </PlaceholderRoot>
  )
}
