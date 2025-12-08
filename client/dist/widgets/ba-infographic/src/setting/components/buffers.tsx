// /** @jsx jsx */
// import { React, jsx, classNames } from 'jimu-core'
// import { Radio, Checkbox, TextInput, Select } from 'jimu-ui'
// import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
// import defaultMessages from './translations/default'
// //import { Arrangement, ArrangementStyle, ArrangementDirection } from '../../constraints'

// export interface Props {
//   widgetMode: string
// }

// export const Buffers = React.memo((props: Props) => {
//   const _onChange = props.onChange
//   const handleArrangementStyleChange = React.useCallback((arrangementStyle: ArrangementStyle) => {
//     _onChange({
//       ...props,
//       style: arrangementStyle
//     })
//   }, [_onChange, props.arrangement])

//   return (
//     <React.Fragment>
//       {this.state.widgetMode === Mode.Preset && (
//             <SettingRow>
//             <Label centric>
//                 {this.localeString('selectPresetBuffer')}
//             </Label>
//             </SettingRow>
//         )}
//             <SettingRow>
//             <Label check centric>
//                 {this.state.userConfigBuffers && this.state.widgetMode === Mode.Workflow
//                 ? (
//                     <Checkbox style={{ cursor: 'pointer' }} className='mr-2'
//                     checked={this.state.workflowAvailableBufferRings === true} onChange={e => {
//                         this.updateState('workflowAvailableBufferRings', e.target.checked)
//                     }} />
//                     )
//                 : <Radio name='presetBuffer' style={{ cursor: 'pointer' }} className='mr-2'
//                     checked={this.state.presetBuffer === 'rings'} onChange={e => {
//                     this.updateState('presetBuffer', 'rings')
//                     }} />
//                 }
//                 {this.localeString('rings')}
//             </Label>
//             </SettingRow>
//             <div css={style} className='m-2'>
//             <SettingRow flow='no-wrap' className='w-100 d-flex'>
//                 <TextInput name='ringsBuffer1' data-key='ringsBuffer1' className='bufferInput'
//                 size='sm' value={this.state.ringsBuffer1} onChange={(e) => {
//                     this.updateState(e.currentTarget.name, e.currentTarget.value)
//                     //this.updatePlaceholders()
//                 }} />
//                 <TextInput name='ringsBuffer2' data-key='ringsBuffer2'
//                 className='bufferInput mx-1' size='sm'
//                 value={this.state.ringsBuffer2} onChange={(e) => {
//                     this.updateState(e.currentTarget.name, e.currentTarget.value)
//                     //this.updatePlaceholders()
//                 }} />
//                 <TextInput name='ringsBuffer3' data-key='ringsBuffer3' className='bufferInput'
//                 size='sm' value={this.state.ringsBuffer3} onChange={(e) => {
//                     this.updateState(e.currentTarget.name, e.currentTarget.value)
//                     //this.updatePlaceholders()
//                 }} />
//                 <Select name='ringsBufferUnit' className='bufferUnits ml-1' size='sm'
//                 value={this.state.ringsBufferUnit} onChange={(e) => {
//                     this.updateState('ringsBufferUnit', e.currentTarget.value)
//                 }}>
//                 <option value='miles'>{this.localeString('milesLow')}</option>
//                 <option value='kilometers'>{this.localeString('kilometerLow')}</option>
//                 </Select>
//             </SettingRow>
//             </div>
//             <SettingRow>
//             <Label check centric>
//                 {this.state.userConfigBuffers && this.state.widgetMode === Mode.Workflow
//                 ? (
//                     <Checkbox style={{ cursor: 'pointer' }} className='mr-2'
//                     checked={this.state.availableBufferDrive === true} onChange={e => {
//                         this.updateState('availableBufferDrive', e.target.checked)
//                     }} />
//                     )
//                 : <Radio name='presetBuffer' style={{ cursor: 'pointer' }} className='mr-2'
//                     checked={this.state.presetBuffer === 'drivetime'} onChange={e => {
//                     this.updateState('presetBuffer', 'drivetime')
//                     }} />
//                 }
//                 {/* <Checkbox style={{ cursor: 'pointer' }} className='mr-2'
//                 checked={this.state.drivetime} onChange={e => {
//                     this.updateState('drivetime', e.target.checked)

//                 }} /> */}
//                 {this.localeString('drivetime')}
//             </Label>
//             </SettingRow>
//             <div css={style} className='m-2'>
//             <SettingRow flow='no-wrap' className='w-100 d-flex'>
//                 <TextInput name='drivetimeBuffer1' data-key='drivetimeBuffer1' className='bufferInput'
//                 size='sm' value={this.state.drivetimeBuffer1} onChange={(e) => {
//                     this.updateState(e.currentTarget.name, e.currentTarget.value)
//                     //this.updatePlaceholders()
//                 }} />
//                 <TextInput name='drivetimeBuffer2' data-key='drivetimeBuffer2'
//                 className='bufferInput mx-1' size='sm'
//                 value={this.state.drivetimeBuffer2} onChange={(e) => {
//                     this.updateState(e.currentTarget.name, e.currentTarget.value)
//                     //this.updatePlaceholders()
//                 }} />
//                 <TextInput name='drivetimeBuffer3' data-key='drivetimeBuffer3' className='bufferInput'
//                 size='sm' value={this.state.drivetimeBuffer3} onChange={(e) => {
//                     this.updateState(e.currentTarget.name, e.currentTarget.value)
//                     //this.updatePlaceholders()
//                 }} />
//                 <Select name='drivetimeBufferUnit' className='bufferUnits ml-1' size='sm'
//                 value={this.state.drivetimeBufferUnit} onChange={(e) => {
//                     this.updateState('drivetimeBufferUnit', e.currentTarget.value)
//                 }}>
//                 <option value='min'>{this.localeString('minuteLow')}</option>
//                 <option value='miles'>{this.localeString('milesLow')}</option>
//                 <option value='kilometers'>{this.localeString('kilometerLow')}</option>
//                 </Select>
//             </SettingRow>
//             </div>
//             <SettingRow>
//             <Label check centric>
//                 {this.state.userConfigBuffers && this.state.widgetMode === Mode.Workflow
//                 ? (
//                     <Checkbox style={{ cursor: 'pointer' }} className='mr-2'
//                     checked={this.state.availableBufferWalk === true} onChange={e => {
//                         this.updateState('availableBufferWalk', e.target.checked)
//                     }} />
//                     )
//                 : <Radio name='presetBuffer' style={{ cursor: 'pointer' }} className='mr-2'
//                     checked={this.state.presetBuffer === 'walktime'} onChange={e => {
//                     this.updateState('presetBuffer', 'walktime')
//                     }} />
//                 }
//                 {this.localeString('walktime')}
//             </Label>
//             </SettingRow>
//             <div css={style} className='m-2'>
//             <SettingRow flow='no-wrap' className='w-100 d-flex mt-2'>
//                 <TextInput name='walktimeBuffer1' data-key='walktimeBuffer1' className='bufferInput'
//                 size='sm' value={this.state.walktimeBuffer1} onChange={(e) => {
//                     this.updateState(e.currentTarget.name, e.currentTarget.value)
//                     //this.updatePlaceholders()
//                 }} />
//                 <TextInput name='walktimeBuffer2' data-key='walktimeBuffer2'
//                 className='bufferInput mx-1' size='sm'
//                 value={this.state.walktimeBuffer2} onChange={(e) => {
//                     this.updateState(e.currentTarget.name, e.currentTarget.value)
//                     //this.updatePlaceholders()
//                 }} />
//                 <TextInput name='walktimeBuffer3' data-key='walktimeBuffer3' className='bufferInput'
//                 size='sm' value={this.state.walktimeBuffer3} onChange={(e) => {
//                     this.updateState(e.currentTarget.name, e.currentTarget.value)
//                     //this.updatePlaceholders()
//                 }} />
//                 <Select name='walktimeBufferUnit' className='bufferUnits ml-1' size='sm'
//                 value={this.state.walktimeBufferUnit} onChange={(e) => {
//                     this.updateState('walktimeBufferUnit', e.currentTarget.value)
//                 }}>
//                 <option value='min'>{this.localeString('minuteLow')}</option>
//                 <option value='miles'>{this.localeString('milesLow')}</option>
//                 <option value='kilometers'>{this.localeString('kilometerLow')}</option>
//                 </Select>
//             </SettingRow>
//             </div>
//         </div>
//     </React.Fragment>
//   )
// })
