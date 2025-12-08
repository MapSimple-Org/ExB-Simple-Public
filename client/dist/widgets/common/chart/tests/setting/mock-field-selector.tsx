import { Immutable, React } from 'jimu-core'

export const StringFields = ['Year', 'Arrest', 'Primary_Ty']
export const NumericFields = ['Beat', 'District', 'Ward']

export const MockFieldSelector = ({
  className,
  type,
  isMultiple,
  fields: propFields,
  defaultFields,
  onChange
}) => {
  const AllFields = type === 'category' ? StringFields : NumericFields
  const selectedFields = (propFields || defaultFields) ?? []
  const [open, setOpen] = React.useState(false)
  const handleClick = (e): void => {
    let fields = []
    const field = e.target.value
    if (isMultiple === false) {
      fields = [field]
    } else {
      if (selectedFields.includes(field)) {
        fields = selectedFields.filter(e => e !== field)
      } else {
        fields = selectedFields.concat([field])
      }
    }
    setOpen(false)
    onChange?.(Immutable(fields))
  }
  return (
    <div className={`mock-field-selector ${className}`}>
      <div className='selected-fields' onClick={() => { setOpen(!open) }}>
        {isMultiple
          ? (
              selectedFields?.map((field, idx) => (
              <div key={idx} className='selected-field-item'>
                {field}
              </div>
              ))
            )
          : (
            <div className='selected-field-item'>{selectedFields?.[0]}</div>
            )}
      </div>
      {open && (
        <div>
          {AllFields.map((field, idx) => (
            <option
              key={idx}
              className='field-selector-item'
              value={field}
              onClick={handleClick}
            >
              {field}
            </option>
          ))}
        </div>
      )}
    </div>
  )
}
