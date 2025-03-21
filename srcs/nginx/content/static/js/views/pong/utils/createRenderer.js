import * as THREE from "three";

export const createRenderer = () => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
};
