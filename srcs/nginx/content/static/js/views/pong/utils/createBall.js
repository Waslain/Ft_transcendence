import * as THREE from "three";

export const createBall = () => {
  const geometry = new THREE.SphereGeometry(0.3, 30, 15);
  const material = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const sphere = new THREE.Mesh(geometry, material);

  const ball = {
    object: sphere,
  };

  ball.object.position.set(0, 0.3, 0);

  const insidePointLight = new THREE.PointLight(0xffffff, 3, 10);
  ball.object.add(insidePointLight);
  insidePointLight.position.set(0, 0.3, 0);

  const upPointLight = new THREE.PointLight(0xffffff, 1.5, 1);
  ball.object.add(upPointLight);
  upPointLight.position.set(0, 0.4, 0);

  return ball;
};
