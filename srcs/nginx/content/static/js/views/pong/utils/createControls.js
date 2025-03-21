import { OrbitControls } from "three/addons/controls/OrbitControls";

export const createControls = (camera, renderer) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.mouseButtons.RIGHT = 0;
  controls.minDistance = 20;
  controls.maxDistance = 30;
  controls.maxPolarAngle = 1.5;
  return controls;
};
