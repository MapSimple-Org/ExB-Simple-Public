import { React, classNames, type ImmutableArray, hooks } from 'jimu-core'
import { LoadOutlined } from 'jimu-icons/outlined/editor/load'
import { Button, Tooltip } from 'jimu-ui'
import defaultMessages from '../../../../../../../translations/default'
import type { WebChartPieChartSlice } from 'jimu-ui/advanced/chart'
import type { LoadSlices } from '../utils'
import { Message } from '../../components'

interface ColorLoaderProps {
  className?: string
  loadSlices?: LoadSlices
  onChange?: (value: ImmutableArray<WebChartPieChartSlice>) => void
}

const NumberPerLoads = 10
export const ColorLoader = (props: ColorLoaderProps): React.ReactElement => {
  const { className, loadSlices, onChange } = props
  const translate = hooks.useTranslation(defaultMessages)
  const [version, setVersion] = React.useState(0)
  const messageRef = React.useRef<'loadout' | 'exceed'>('loadout')
  const message = messageRef.current === 'loadout' ? translate('categoriesLatest') : translate('manyDistinctValues')
  const unmountRef = React.useRef<boolean>(false)
  hooks.useUnmount(() => { unmountRef.current = true })

  const handleLoadClick = () => {
    loadSlices(NumberPerLoads).then(({ value: slices, loadout, exceed }) => {
      if (unmountRef.current) return
      onChange?.(slices)
      if (loadout || exceed) {
        messageRef.current = exceed ? 'exceed' : 'loadout'
        setVersion(v => v + 1)
      }
    })
  }

  return (<>
    <Tooltip placement='left' title={translate('loadMoreCategory')} showArrow enterDelay={300}>
      <Button aria-label={translate('loadMoreCategory')} className={classNames('color-loader', className)} size='sm' icon onClick={handleLoadClick}>
        <LoadOutlined size='m' />
      </Button>
    </Tooltip>
    <Message version={version} message={message} />
  </>)
}
