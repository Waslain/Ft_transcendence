import * as THREE from "three";

export const helpers = (objectManager, scene) => {
  for (const object of Object.values(objectManager.playground)) {
    if ("hitbox" in object)
      scene.add(new THREE.Box3Helper(object.hitbox, 0xffffff));
  }

  scene.add(
    new THREE.Box3Helper(objectManager.player1.hitbox, 0xffffff),
    new THREE.Box3Helper(objectManager.player2.hitbox, 0xffffff)
  );

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
};
