import { React } from 'jimu-core'
import { TextInput, NumericInput, Label, Button, CollapsablePanel } from 'jimu-ui'

const {useState, useEffect} = React

const UnitMaker = (props) => {
    const allUnits = props.allUnits
    const type = props.type
    const oldUnit = props.oldUnit

    const [unit, setUnit] = useState(oldUnit?.unit || '')
    const [label, setLabel] = useState(oldUnit?.label || '')
    const [abbreviation, setAbbreviation] = useState(oldUnit?.abbreviation || '')
    const [conversion, setConversion] = useState(oldUnit?.conversion || 1)
    const [allValid, setAllValid] = useState(false)
    const [validityText, setValidityText] = useState('')

    //checks unit for validity
    useEffect(() => {
        let valid = true
        let text = ''
        const letters = /^[a-zA-Z]+$/.test(unit)
        if (unit === '' || label === '' || abbreviation === '') {
            valid = false
            text = 'Required Field Missing'
        }
        if (!conversion) {
            valid = false
            text = 'Invalid Conversion Factor'
        }
        if (!letters) {
            valid = false
            text = 'Name May Only Contain Letters'
        }
        for (let i = 0; i < allUnits.length; i++) {
            if (unit === allUnits[i].unit) {
                if (oldUnit && oldUnit.unit === unit) {
                    //intentionally blank
                    continue
                } else {
                    valid = false
                    text = 'Name Must Be Unique'
                }
            }
        }
        setAllValid(valid)
        setValidityText(text)
    }, [unit, label, abbreviation, conversion])

    return <CollapsablePanel
        defaultIsOpen={!oldUnit}
        label={oldUnit ? `Edit/Delete - ${label}` : 'Create New Unit'}
        type={oldUnit ? 'primary' : 'default'}
        className='mb-2'
    >
        <Label
            className='w-100'
        >
            {props.handleChangeUnit ? 'Name (Cannot be changed):' : 'Name (Must be unique, letters only):'}
            <TextInput
                allowClear={!props.handleChangeUnit}
                required
                type='text'
                onChange={(e) => setUnit(e.target.value)}
                defaultValue={unit}
                readOnly={props.handleChangeUnit}
            />
        </Label>
        <Label
            className='w-100'
        >
            Label (Full name used in menus):
            <TextInput
                allowClear
                required
                type='text'
                onChange={(e) => setLabel(e.target.value)}
                defaultValue={label}
            />
        </Label>
        <Label
            className='w-100'
        >
            Abbreviation (Used on map):
            <TextInput
                allowClear
                required
                type='text'
                onChange={(e) => setAbbreviation(e.target.value)}
                defaultValue={abbreviation}
            />
        </Label>
        <Label
            className='w-100'
        >
            {type === 'linear' ? 'Conversion Factor (One meter is how many of your unit?):' : 'Conversion Factor (One square meter is how many of your unit?):'}
            <NumericInput
                className='w-100'
                required
                defaultValue={conversion}
                onChange={(e) => setConversion(e)}
            />
        </Label>
        {allValid ?
            <div>
                <h6>{type === 'linear' ? `1 meter = ${conversion} ${label} (${abbreviation})` : `1 square meter = ${conversion} ${label} (${abbreviation})`}</h6>
                <Button
                    block
                    onClick={() => props.handleAddUnit ? props.handleAddUnit({ unit, label, abbreviation, conversion }, type) : props.handleChangeUnit({ unit, label, abbreviation, conversion }, type)}
                >
                    Save Unit
                </Button>
            </div>
            : <h6>{validityText}</h6>}
        {props.handleDeleteUnit? 
            <Button
                block
                type='danger'
                onClick={() => props.handleDeleteUnit(unit, type)}
            >
                Delete Unit
            </Button>
            : <></>
        }
    </CollapsablePanel>
}

export default UnitMaker