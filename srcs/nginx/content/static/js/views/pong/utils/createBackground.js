import * as THREE from "three";

export const createBackground = () => {
  const loader = new THREE.TextureLoader();
  const sphereGeometry = new THREE.SphereGeometry(100, 64, 32);
  const sphereMaterial = new THREE.MeshLambertMaterial({
    side: THREE.BackSide,
    map: loader.load("/static/js/views/pong/utils/textures/night.jpg"),
  });

  const background = { object: new THREE.Mesh(sphereGeometry, sphereMaterial) };

  const pointLight = new THREE.PointLight(0xc2c2c2, 0.5, 1000);
  background.object.add(pointLight);
  pointLight.position.set(0, -2, 0);

  return background;
};
