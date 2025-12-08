//import { GlCamera } from 'esri/views/3d/webgl-engine/lib/Camera'
//import RenderNode from 'esri/views/3d/webgl/RenderNode'

// update for 4.30 API upgrade
// cameraParams: eye Pos, center Pos, up-direction
export function getGLCamera (sceneView, cameraParams: { eye, center, up }) {
  const camera = sceneView.state.camera.clone()
  // ExperienceBuilder-Web-Extensions/issues/18825#issuecomment-4700006
  // const CameraNode = RenderNode.createSubclass({ consumes: { required: [] }, produces: [], render () {} })
  // const node = new CameraNode({ view: sceneView })
  // const camera = node.camera.clone()

  let glCamera = camera.set('eye', cameraParams.eye)
  glCamera = camera.set('center', cameraParams.center)
  glCamera = camera.set('up', cameraParams.up)

  return glCamera
}
