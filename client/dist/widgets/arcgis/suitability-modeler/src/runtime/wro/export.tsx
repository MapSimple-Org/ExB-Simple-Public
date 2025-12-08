/** @jsx jsx */
/**
  Licensing

  Copyright 2021 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/

import { React, jsx } from 'jimu-core'
import { AlertPopup, Form, FormGroup, Label, Select, TextArea, TextInput } from 'jimu-ui'

import type { WroModel } from './wro-model'
import * as rasterUtil from './wro-raster-util'
import { createWroPopupTemplate } from './wro-layer-util'

import Portal from 'esri/portal/Portal'

interface State {
  title: string
  summary: string
  description: string
  tags: string
  folder: string
  folders: any
  hasPortal: boolean
  hasTitle: boolean
}

export class Export extends React.PureComponent<any, State> {
  home = '__home__'
  itemData: any
  portal: Portal
  serviceUrl: string

  constructor (props: any) {
    super(props)
    this.state = {
      title: null,
      summary: null,
      description: null,
      tags: null,
      folder: this.home,
      folders: null,
      hasPortal: false,
      hasTitle: false
    }
  }

  componentDidMount (): void {
    this.init()
  }

  chk = (v: string): string => {
    if (typeof v === 'string') {
      v = v.trim()
      if (v.length > 0) {
        return v
      }
    };
    return null
  }

  close = (): void => {
    if (this.props.close) {
      this.props.close()
    }
  }

  exportModel = (): void => {
    const portal = this.portal
    const itemData = this.itemData
    const serviceUrl = this.serviceUrl
    const { title, summary, description, tags, folder } = this.state
    if (!portal || !portal.user || !title) return

    const task: any = {
      title,
      summary,
      description,
      tags,
      itemData,
      portal,
      serviceUrl
    }
    if (folder !== this.home) task.folder = folder

    if (this.props.exportModel) {
      this.props.exportModel(task)
    }
    this.close()
  }

  handleDescriptionChange = (e): void => {
    const v = this.chk(e.target.value)
    this.setState({ description: v })
  }

  handleFolderChange = (e): void => {
    const v = this.chk(e.target.value)
    this.setState({ folder: v })
  }

  handleSummaryChange = (e): void => {
    const v = this.chk(e.target.value)
    this.setState({ summary: v })
  }

  handleTagsChange = (e): void => {
    const v = this.chk(e.target.value)
    this.setState({ tags: v })
  }

  handleTitleChange = (e): void => {
    const v = this.chk(e.target.value)
    this.setState({
      title: v,
      hasTitle: !!v
    })
  }

  _handleToggle = (isOK: boolean): void => {
    if (isOK) {
      this.exportModel()
    } else {
      this.close()
    }
  }

  init = async (): Promise<void> => {
    try {
      const wroModel: WroModel = this.props.wroModel
      this.serviceUrl = wroModel.serviceUrl
      this.itemData = {
        ...rasterUtil.modelToItemData(wroModel),
        popupInfo: createWroPopupTemplate(this.props.wroContext, wroModel).toJSON()
      }
      const folders = []
      const url = this.props.wroContext.getPortalUrl()
      const portal = new Portal({
        url: url
      })
      await portal.load()
      if (portal.user) {
        this.portal = portal
        const list = await portal.user.fetchFolders()
        if (list) {
          list.forEach(f => {
            folders.push({
              id: f.id,
              title: f.title
            })
          })
        }
      }
      if (folders.length > 0) {
        this.setState({
          folders: folders,
          hasPortal: !!portal.user
        })
      }
    } catch (ex) {
      console.error(ex)
      // @todo need to inform user
    }
  }

  render (): any {
    const nls = this.props.wroContext.nls
    const hasTitle = !!this.state.title
    const modalClassName = hasTitle ? 'widget-wro-valid-modal' : 'widget-wro-invalid-modal'
    return (
      <div>
        <AlertPopup
          className={`widget-wro-export-popup ${modalClassName}`}
          isOpen
          okLabel={nls('wro_general_export')}
          title={nls('wro_general_export')}
          toggle={this._handleToggle}
        >
          {this.renderForm()}
        </AlertPopup>
      </div>
    )
  }

  renderForm (): any {
    const nls = this.props.wroContext.nls
    const id = (this.props.wroContext.getId() as string) + '_export'
    const user = this.props.wroContext.getUser()
    const username = (user?.username) || ''
    const hasTitle = !!this.state.title
    const home = this.home
    const tags = 'weightedOverlayModel, geodesign'

    const folderOptions = []
    const homeLabel = nls('wro_saveModel_homeFolderPattern', {
      username: username
    })
    folderOptions.push(
      <option key={home} value={home}>{homeLabel}</option>
    )
    const folders = this.state.folders
    if (folders) {
      folders.forEach(f => {
        folderOptions.push(
          <option key={f.id} value={f.id}>{f.title}</option>
        )
      })
    }

    let titleLabelKey = 'wro_saveModel_title'
    if (!hasTitle) titleLabelKey = 'wro_saveModel_titleRequired'

    return (
      <Form className='widget-wro-form'>

        <FormGroup>
          <Label for={id + '_title'}>
            {nls(titleLabelKey)}
          </Label>
          <TextInput
            id={id + '_title'} type='text'
            onChange={this.handleTitleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label for={id + '_summary'}>
            {nls('wro_saveModel_summary')}
          </Label>
          <TextInput
            id={id + '_summary'} type='text'
            onChange={this.handleSummaryChange}
          />
        </FormGroup>

        <FormGroup>
          <Label for={id + '_description'}>
            {nls('wro_saveModel_description')}
          </Label>
          <TextArea
            id={id + '_description'}
            onChange={this.handleDescriptionChange}
          />
        </FormGroup>

        <FormGroup>
          <Label for={id + '_tags'}>
            {nls('wro_saveModel_tags')}
          </Label>
          <TextInput
            id={id + '_tags'} type='text'
            defaultValue={tags}
            onChange={this.handleTagsChange}
          />
        </FormGroup>

        <FormGroup>
          <Label for={id + '_folder'}>
            {nls('wro_saveModel_folder')}
          </Label>
          <Select
            id={id + '_folder'} defaultValue={home}
            onChange={this.handleFolderChange}
          >
            {folderOptions}
          </Select>
        </FormGroup>

      </Form>
    )
  }
}
