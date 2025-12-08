/** @jsx jsx */
import { jsx, React, useIntl } from 'jimu-core'
import { Radio, Label } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { DrawingElevationMode3D } from 'jimu-ui/advanced/map'
import nls from '../translations/default'

interface Props {
  drawingElevationMode3D: DrawingElevationMode3D
  handleDrawingElevationMode3DChange: (drawingElevationMode3D: DrawingElevationMode3D) => void
}

export const Effect3DSelector = React.memo((props: (Props)) => {
  //DrawingElevationMode3D
  const drawingElevationMode3DTips = useIntl().formatMessage({ id: 'drawingElevationMode3DTips', defaultMessage: nls.drawingElevationMode3DTips })
  const relativeToGroundTips = useIntl().formatMessage({ id: 'relativeToGroundTips', defaultMessage: nls.relativeToGroundTips })
  const relativeToSceneTips = useIntl().formatMessage({ id: 'relativeToSceneTips', defaultMessage: nls.relativeToSceneTips })
  const onTheGroundTips = useIntl().formatMessage({ id: 'onTheGroundTips', defaultMessage: nls.onTheGroundTips })

  return (
    <SettingSection title={drawingElevationMode3DTips} className='px-0' role='group' aria-label={drawingElevationMode3DTips}>
    <SettingRow flow="wrap">
      <div role='radiogroup' className="mb-4">
        {/* relative-to-ground */}
        <Label className="d-flex align-items-center" style={{ cursor: 'pointer' }} title={relativeToGroundTips}>
          <Radio
            style={{ cursor: 'pointer' }} className='m-0 mr-2'
            title={relativeToGroundTips} name="drawingElevationMode3D"
            onChange={() => { props.handleDrawingElevationMode3DChange(DrawingElevationMode3D.RelativeToGround) }}
            checked={props.drawingElevationMode3D === DrawingElevationMode3D.RelativeToGround}
          />
          {relativeToGroundTips}
        </Label>
        {/* Relative to scene */}
        <Label className="d-flex align-items-center" style={{ cursor: 'pointer' }} title={relativeToSceneTips}>
          <Radio
            style={{ cursor: 'pointer' }} className='m-0 mr-2'
            title={relativeToSceneTips} name="drawingElevationMode3D"
            onChange={() => { props.handleDrawingElevationMode3DChange(DrawingElevationMode3D.RelativeToScene) }}
            checked={props.drawingElevationMode3D === DrawingElevationMode3D.RelativeToScene}
          />
          {relativeToSceneTips}
        </Label>
        {/* on-the-ground */}
        <Label className="d-flex align-items-center" style={{ cursor: 'pointer' }} title={onTheGroundTips}>
          <Radio
            style={{ cursor: 'pointer' }} className='m-0 mr-2'
            title={onTheGroundTips} name="drawingElevationMode3D"
            onChange={() => { props.handleDrawingElevationMode3DChange(DrawingElevationMode3D.OnTheGround) }}
            checked={props.drawingElevationMode3D === DrawingElevationMode3D.OnTheGround}
          />
          {onTheGroundTips}
        </Label>
      </div>
    </SettingRow>
  </SettingSection>
  )
})
