import { React, defaultMessages as jimuCoreMessages, } from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import { IMConfig, DrawMode } from '../config';
import defaultMessages from './translations/default';
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components';
import { Select, Option, defaultMessages as jimuUIDefaultMessages, Checkbox, TextInput, Label, Button, Alert } from 'jimu-ui'
import { SidePopper } from 'jimu-ui/advanced/setting-components'
import UnitMaker from './components/unitMaker';

// Define proper types for units
interface Unit {
    unit: string;
    label: string;
    abbreviation: string;
    conversion: number;
}

const defaultDistanceUnits: Unit[] = [
    { unit: 'kilometers', label: 'Kilometers', abbreviation: 'km', conversion: 0.001 },
    { unit: 'miles', label: 'Miles', abbreviation: 'mi', conversion: 0.000621371 },
    { unit: 'meters', label: 'Meters', abbreviation: 'm', conversion: 1 },
    { unit: 'nautical-miles', label: 'Nautical Miles', abbreviation: 'NM', conversion: 0.000539957 },
    { unit: 'feet', label: 'Feet', abbreviation: 'ft', conversion: 3.28084 },
    { unit: 'yards', label: 'Yards', abbreviation: 'yd', conversion: 1.09361 }
];

const defaultAreaUnits: Unit[] = [
    { unit: 'square-kilometers', label: 'Square Kilometers', abbreviation: 'km²', conversion: 0.000001 },
    { unit: 'square-miles', label: 'Square Miles', abbreviation: 'mi²', conversion: 3.86102e-7 },
    { unit: 'acres', label: 'Acres', abbreviation: 'ac', conversion: 0.000247105 },
    { unit: 'hectares', label: 'Hectares', abbreviation: 'ha', conversion: 0.0001 },
    { unit: 'square-meters', label: 'Square Meters', abbreviation: 'm²', conversion: 1 },
    { unit: 'square-feet', label: 'Square Feet', abbreviation: 'ft²', conversion: 10.7639 },
    { unit: 'square-yards', label: 'Square Yards', abbreviation: 'yd²', conversion: 1.19599 }
];


export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, any>{
    constructor(props) {
        super(props)

        this.state = {
            linearSidePopper: false,
            areaSidePopper: false,
            defaultDistanceUnit: this.props.config.defaultDistance,
            defaultAreaUnit: this.props.config.defaultArea,
            availableDistanceUnits: [...defaultDistanceUnits, ...(this.props.config.userDistances?.asMutable?.() || this.props.config.userDistances || [])],
            availableAreaUnits: [...defaultAreaUnits, ...(this.props.config.userAreas?.asMutable?.() || this.props.config.userAreas || [])]
        }
    }

    onPropertyChange = (name, value) => {
        const { config } = this.props
        if (value === config[name]) {
            return
        }
        const newConfig = config.set(name, value)
        const alterProps = {
            id: this.props.id,
            config: newConfig
        }
        this.props.onSettingChange(alterProps)
    }

    onMapWidgetSelected = (useMapWidgetsId: string[]) => {
        this.props.onSettingChange({
            id: this.props.id,
            useMapWidgetIds: useMapWidgetsId
        });
    }

    handleDrawModeChange = (evt) => {
        const value = evt?.target?.value
        this.onPropertyChange('creationMode', value)
    }

    handleTurnOff = () => {
        this.props.onSettingChange({
            id: this.props.id,
            config: this.props.config.set('turnOffOnClose', !this.props.config.turnOffOnClose)
        })
    }

    handleChangeTitle = () => {
        this.props.onSettingChange({
            id: this.props.id,
            config: this.props.config.set('changeTitle', !this.props.config.changeTitle)
        })
    }

    handleChangeListMode = () => {
        this.props.onSettingChange({
            id: this.props.id,
            config: this.props.config.set('changeListMode', !this.props.config.changeListMode)
        })
    }

    handleListMode = () => {
        this.props.onSettingChange({
            id: this.props.id,
            config: this.props.config.set('listMode', !this.props.config.listMode)
        })
    }

    handleTitle = (value) => {
        this.props.onSettingChange({
            id: this.props.id,
            config: this.props.config.set('title', value)
        })
    }

    handleDefaultDistance = (value) => {
        this.props.onSettingChange({
            id: this.props.id,
            config: this.props.config.set('defaultDistance', value)
        })
        this.setState({ defaultDistanceUnit: value })
    }

    handleDefaultArea = (value) => {
        this.props.onSettingChange({
            id: this.props.id,
            config: this.props.config.set('defaultArea', value)
        })
        this.setState({ defaultAreaUnit: value })
    }

    handleAddUnit = (newUnit: Unit, type: 'linear' | 'area') => {
        if (type === 'linear') {
            // Convert to mutable array, add item, then save
            const userDistances = (this.props.config.userDistances?.asMutable?.() || []) as unknown as Unit[]
            const updatedDistances = [...userDistances, newUnit]

            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('userDistances', updatedDistances)
            })
            this.setState({
                availableDistanceUnits: [...defaultDistanceUnits, ...updatedDistances],
                defaultDistanceUnit: null
            })
        } else {
            // Convert to mutable array, add item, then save
            const userAreas = (this.props.config.userAreas?.asMutable?.() || []) as unknown as Unit[]
            const updatedAreas = [...userAreas, newUnit]

            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('userAreas', updatedAreas)
            })
            this.setState({
                availableAreaUnits: [...defaultAreaUnits, ...updatedAreas],
                defaultAreaUnit: null
            })
        }
    }

    handleChangeUnit = (newUnit: Unit, type: 'linear' | 'area') => {
        if (type === 'linear') {
            const userDistances = (this.props.config.userDistances?.asMutable?.() || []) as unknown as Unit[]
            const updatedDistances = [...userDistances]
            const index = updatedDistances.findIndex(existing => existing.unit === newUnit.unit)

            if (index !== -1) {
                updatedDistances[index] = newUnit
            }

            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('userDistances', updatedDistances)
            })
            this.setState({
                availableDistanceUnits: [...defaultDistanceUnits, ...updatedDistances],
                defaultDistanceUnit: null
            })
        } else {
            const userAreas = (this.props.config.userAreas?.asMutable?.() || []) as unknown as Unit[]
            const updatedAreas = [...userAreas]
            const index = updatedAreas.findIndex(existing => existing.unit === newUnit.unit)

            if (index !== -1) {
                updatedAreas[index] = newUnit
            }

            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('userAreas', updatedAreas)
            })
            this.setState({
                availableAreaUnits: [...defaultAreaUnits, ...updatedAreas],
                defaultAreaUnit: null
            })
        }
    }

    handleDeleteUnit = (name: string, type: 'linear' | 'area') => {
        if (type === 'linear') {
            const userDistances = (this.props.config.userDistances?.asMutable?.() || []) as unknown as Unit[]
            const updatedDistances = userDistances.filter(existing => existing.unit !== name)

            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('userDistances', updatedDistances)
            })
            this.setState({
                availableDistanceUnits: [...defaultDistanceUnits, ...updatedDistances],
                defaultDistanceUnit: null
            })
        } else {
            const userAreas = (this.props.config.userAreas?.asMutable?.() || []) as unknown as Unit[]
            const updatedAreas = userAreas.filter(existing => existing.unit !== name)

            this.props.onSettingChange({
                id: this.props.id,
                config: this.props.config.set('userAreas', updatedAreas)
            })
            this.setState({
                availableAreaUnits: [...defaultAreaUnits, ...updatedAreas],
                defaultAreaUnit: null
            })
        }
    }

    formatMessage = (id: string, values?: { [key: string]: any }) => {
        const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages, jimuCoreMessages)
        return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] }, values)
    }

    render() {
        const { useMapWidgetIds, config } = this.props
        const userDistances = (config.userDistances?.asMutable?.() || config.userDistances || []) as unknown as Unit[]
        const userAreas = (config.userAreas?.asMutable?.() || config.userAreas || []) as unknown as Unit[]

        return (
            <div>
                <div className="widget-setting-psearch">
                    <SettingSection className="map-selector-section" title={this.props.intl.formatMessage({ id: 'sourceLabel', defaultMessage: defaultMessages.sourceLabel })}>
                        <SettingRow label={this.formatMessage('selectMapWidget')}></SettingRow>
                        <SettingRow>
                            <MapWidgetSelector onSelect={this.onMapWidgetSelected} useMapWidgetIds={useMapWidgetIds} />
                        </SettingRow>
                        <SettingRow label={this.formatMessage('selectDrawMode')} flow='wrap'>
                            <Select value={config.creationMode} onChange={this.handleDrawModeChange} className='drop-height'>
                                <option value={DrawMode.CONTINUOUS}>{this.formatMessage('drawModeContinuous')}</option>
                                <option value={DrawMode.SINGLE}>{this.formatMessage('drawModeSingle')}</option>
                            </Select>
                        </SettingRow>

                        <SettingRow label='Draw Layer Settings' flow='wrap'>
                            <Label
                                className='w-100 mt-2 mb-2'
                            >
                                Draw Layer Name:
                                <TextInput
                                    type='text'
                                    required
                                    defaultValue='Drawn Graphics'
                                    onChange={(e) => this.handleTitle(e.target.value)}
                                />
                            </Label>
                            <div>
                                <Checkbox checked={this.props.config.changeTitle} onChange={this.handleChangeTitle} />
                                <span>Allow Users To Change Draw Layer Name</span>
                            </div>
                            <div>
                                <Checkbox checked={this.props.config.listMode} onChange={this.handleListMode} />
                                <span>Show In Map Layer List</span>
                            </div>
                            <div>
                                <Checkbox checked={this.props.config.changeListMode} onChange={this.handleChangeListMode} />
                                <span>Allow Users To Show/Hide In Map Layer List</span>
                            </div>
                        </SettingRow>
                        <SettingRow label='Measurement Settings' flow='wrap'>
                            <Button
                                onClick={() => this.setState({ linearSidePopper: true })}
                            >
                                Add or Change Linear Units
                            </Button>
                            <Label
                                className='w-100 mt-2 mb-2'
                            >
                                Default Linear Unit:
                                <Select
                                    title='Linear Units'
                                    onChange={(e) => this.handleDefaultDistance(e.target.value)}
                                    value={this.state.defaultDistanceUnit}
                                >
                                    {this.state.availableDistanceUnits.map((unit, index) => {
                                        return (
                                            <Option
                                                key={index}
                                                value={index}
                                            >
                                                {unit.label + " (" + unit.abbreviation + ")"}
                                            </Option>
                                        )
                                    })}
                                </Select>
                                {this.state.defaultDistanceUnit !== null ? <></> : <Alert>Reset Default Distance Units</Alert>}
                            </Label>
                            <Button
                                onClick={() => { this.setState({ areaSidePopper: true }) }}
                            >
                                Add or Change Area Units
                            </Button>
                            <Label
                                className='w-100 mt-2 mb-2'
                            >
                                Default Area Units:
                                <Select
                                    title='Area Units'
                                    onChange={(e) => { this.handleDefaultArea(e.target.value) }}
                                    value={this.state.defaultAreaUnit}
                                >
                                    {this.state.availableAreaUnits.map((unit, index) => {
                                        return (
                                            <Option
                                                key={index}
                                                value={index}
                                            >
                                                {unit.label + " (" + unit.abbreviation + ")"}
                                            </Option>
                                        )
                                    })}
                                </Select>
                                Note: superscript numbers may not display correctly in this menu, but will work in application.
                                {this.state.defaultAreaUnit !== null ? <></> : <Alert>Reset Default Area Units</Alert>}
                            </Label>
                        </SettingRow>
                        <SettingRow label='Stop Drawing On Close' flow='wrap'>
                            <div>
                                <Checkbox checked={this.props.config.turnOffOnClose} onChange={this.handleTurnOff} />
                                <span>This widget is in a Widget Controller and I want to stop drawing when I close it.</span>
                            </div>
                        </SettingRow>
                    </SettingSection>
                </div>
                <SidePopper
                    position='right'
                    isOpen={this.state.linearSidePopper}
                    toggle={() => { this.setState({ linearSidePopper: !this.state.linearSidePopper }) }}
                    title='Change Linear Units'
                    trigger={<span /> as any as HTMLElement}
                >
                    <Alert>The Default Linear Unit must be reset after changes in this panel.</Alert>
                    <UnitMaker allUnits={this.state.availableDistanceUnits} handleAddUnit={this.handleAddUnit} type={'linear'}></UnitMaker>
                    {userDistances && userDistances.length > 0 ?
                        <div>
                            <hr />
                            <h3>Edit Units</h3>
                        </div>
                        : <></>
                    }
                    {userDistances && userDistances.map((oldUnit, index) => {
                        return <UnitMaker key={index} allUnits={this.state.availableDistanceUnits} handleChangeUnit={this.handleChangeUnit} type={'linear'} oldUnit={oldUnit} handleDeleteUnit={this.handleDeleteUnit}></UnitMaker>
                    })}
                </SidePopper>
                <SidePopper
                    position='right'
                    isOpen={this.state.areaSidePopper}
                    toggle={() => { this.setState({ areaSidePopper: !this.state.areaSidePopper }) }}
                    title='Change Area Units'
                    trigger={<span /> as any as HTMLElement}
                >
                    <Alert>The Default Area Unit must be reset after changes in this panel.</Alert>
                    <UnitMaker allUnits={this.state.availableAreaUnits} handleAddUnit={this.handleAddUnit} type={'area'}></UnitMaker>
                    {userAreas && userAreas.length > 0 ?
                        <div>
                            <hr />
                            <h3>Edit Units</h3>
                        </div>
                        : <></>
                    }
                    {userAreas && userAreas.map((oldUnit, index) => {
                        return <UnitMaker key={index} allUnits={this.state.availableAreaUnits} handleChangeUnit={this.handleChangeUnit} type={'area'} oldUnit={oldUnit} handleDeleteUnit={this.handleDeleteUnit}></UnitMaker>
                    })}
                </SidePopper>
            </div>
        )
    }
}