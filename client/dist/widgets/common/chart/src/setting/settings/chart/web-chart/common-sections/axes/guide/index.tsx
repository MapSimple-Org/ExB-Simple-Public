import { React, type ImmutableObject, type ImmutableArray, Immutable, hooks } from 'jimu-core'
import type { WebChartGuide } from 'jimu-ui/advanced/chart'
import { defaultMessages as jimuUiDefaultMessage, Button } from 'jimu-ui'
import defaultMessages from '../../../../../../translations/default'
import Guide from './guide'
import { getDefaultGuide } from '../../../../../../../utils/default'
import { getGuideName, getValidGuides } from './utils'
import { AnchoredSidePanel, Placeholder } from '../../../../../components'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import { styled } from 'jimu-theme'

interface GuidesProps {
  label?: string
  isHorizontal?: boolean
  renderVisible?: boolean
  labelVisible?: boolean
  labelAlignmentVisible?: boolean
  value: ImmutableArray<WebChartGuide>
  onChange: (value: ImmutableArray<WebChartGuide>) => void
}

const Root = styled.div`
  height: 100%;
  .guilds-panel {
    overflow-y: auto;
    height: calc(100% - 50px);
  }
`

const Guides = (props: GuidesProps) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)

  const { value: propValue, label: propLabel, onChange, isHorizontal, renderVisible = true, labelVisible = true, labelAlignmentVisible = true } = props
  const [defaultOpenIndex, setDefaultOpenIndex] = React.useState(-1)
  const [guides, setGuides] = React.useState<ImmutableArray<WebChartGuide>>(
    propValue ?? Immutable([])
  )

  const label = propLabel || translate('auxiliaryGuide')

  const handleCreate = () => {
    const name = getGuideName(guides)
    const guide = getDefaultGuide(name, '', isHorizontal)
    setGuides(guides.concat(guide))
    setDefaultOpenIndex(guides.length)
  }

  const handleChange = (
    guide: ImmutableObject<WebChartGuide>,
    index: number
  ) => {
    setGuides(Immutable.set(guides, index, guide))
  }

  const handleDelete = (index: number) => {
    setGuides(guides.filter((_, i) => i !== index))
  }

  hooks.useUpdateEffect(() => {
    const gs = getValidGuides(guides)
    onChange(gs)
  }, [guides])

  return (
    <AnchoredSidePanel
      label={label}
      title={label}
      level={2}
      buttonStickRight={true}
    >
      <Root className='px-4' role='group' aria-label={label}>
        <Button
          size='sm'
          type='primary'
          onClick={handleCreate}
          className='w-100'
          aria-label={translate('add')}
          aria-describedby='no-guides-msg'
        >
          <PlusOutlined></PlusOutlined>
          <span>{translate('add')}</span>
        </Button>
        {!!guides.length && (
          <div className='guilds-panel mt-1'>
            {guides.map((guide, index) => {
              return (
                <Guide
                  className='mt-2'
                  renderVisible={renderVisible}
                  labelVisible={labelVisible}
                  labelAlignmentVisible={labelAlignmentVisible}
                  key={guide.name ?? index}
                  isHorizontal={isHorizontal}
                  value={guide}
                  defaultIsOpen={index === defaultOpenIndex}
                  onChange={(guide) => { handleChange(guide, index) }}
                  onDelete={() => { handleDelete(index) }}
                />
              )
            })}
          </div>
        )}
        {!guides.length && (
          <Placeholder
            messageId='no-guides-msg'
            placeholder={translate('noGuideTip')}
          />
        )}
      </Root>
    </AnchoredSidePanel>
  )
}

export default Guides
