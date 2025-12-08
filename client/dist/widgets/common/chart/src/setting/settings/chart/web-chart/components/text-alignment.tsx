import { classNames, React, hooks } from 'jimu-core'
import { defaultMessages, Select } from 'jimu-ui'

type VerticalAlignment = 'baseline' | 'top' | 'middle' | 'bottom'
type HorizontalAlignment = 'left' | 'right' | 'center' | 'justify'

export const TextAlignments = {
  verticalAlignment: ['baseline', 'top', 'middle', 'bottom'],
  horizontalAlignment: ['left', 'right', 'center', 'justify']
}

export const getCorrespondingAlignment = (alignment: string): string => {
  let index = TextAlignments.horizontalAlignment.indexOf(alignment)
  if (index > -1) {
    return TextAlignments.verticalAlignment[index]
  } else {
    index = TextAlignments.verticalAlignment.indexOf(alignment)
    if (index > -1) {
      return TextAlignments.horizontalAlignment[index]
    }
  }
}

interface TextAlignmentProps {
  'aria-label'?: string
  className?: string
  vertical: boolean
  hideBaseLineOrJustify?: boolean
  value: VerticalAlignment | HorizontalAlignment
  onChange: (value: VerticalAlignment | HorizontalAlignment) => void
}

export const TextAlignment = (props: TextAlignmentProps): React.ReactElement => {
  const { className, vertical, value, 'aria-label': ariaLabel, hideBaseLineOrJustify = false, onChange } = props
  const translate = hooks.useTranslation(defaultMessages)

  const alignments = React.useMemo(() => {
    let alignments = vertical ? TextAlignments.verticalAlignment : TextAlignments.horizontalAlignment
    alignments = !hideBaseLineOrJustify ? alignments : alignments.filter((alignment) => alignment !== 'baseline' && alignment !== 'justify')
    return alignments
  }, [vertical, hideBaseLineOrJustify])

  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
    onChange?.(evt.target.value as any)
  }

  return (<Select
    size='sm'
    aria-label={ariaLabel}
    className={classNames('text-alignment', className)}
    value={value}
    onChange={handleChange}
  >
    {alignments.map(alignment => (
      <option key={alignment} value={alignment}>
        {translate(alignment)}
      </option>
    ))}
  </Select>)
}
