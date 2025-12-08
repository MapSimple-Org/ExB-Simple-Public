import { css } from 'jimu-core'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { Typography } from 'jimu-ui'

interface EmptyPlaceholderProps {
  emptyTips: string
}

const style = css`
  .edit-blank {
    min-height: 300px;
    & > div{
      top: calc(50% + 20px);
      transform: translateY(-50%);
    }
    p{
      margin-top: 16px;
      margin-bottom: 16px;
      color: var(--sys-color-surface-paper-hint);
    }
  }
`

const EmptyPlaceholder = (props: EmptyPlaceholderProps) => {
  const { emptyTips } = props

  return (
    <div className='surface-1 border-0 h-100' css={style}>
      <div className='w-100 text-center edit-blank'>
        <div className='position-absolute edit-blank-content w-100'>
          <InfoOutlined size={32} color='var(--sys-color-surface-paper-hint)' />
          <Typography component='p' variant='label1' className='empty-tips'>{emptyTips}</Typography>
        </div>
      </div>
    </div>
  )
}

export default EmptyPlaceholder
