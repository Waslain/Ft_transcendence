import * as THREE from "three";

export const cleanScene = (objectManager) => {
  objectManager.renderer.setAnimationLoop(null);
  objectManager.scene.children.forEach((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (child.material.map) child.material.map.dispose();
      child.material.dispose();
    }
  });
  objectManager.renderer.dispose();
};
