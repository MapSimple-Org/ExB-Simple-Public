/** @jsx jsx */
import { jsx } from 'jimu-core'
import { Loading } from 'jimu-ui'

export interface LoaderProps {
  isLoading: boolean
}

export function Loader (props: LoaderProps) {
  const { isLoading } = props

  return (
    <div>
     {isLoading && (
        <div className='d-flex h-100 w-100' style={{ position: 'absolute' }}>
          <div style={{ height: '80px', position: 'relative', width: '200px', margin: 'auto' }}>
            <Loading/>
          </div>
        </div>
     )}
    </div>
  )
}
