import * as THREE from "three";
import { createText } from "./createText.js";

export const createPlayer = (nb) => {
  const geometry = new THREE.CapsuleGeometry(0.3, 2, 20, 20);
  const material = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const player = {
    object: new THREE.Mesh(geometry, material),
    name: "",
    name3D: createText("", 10, 1),
    score: -1,
    score3D: createText("", 10, 6),
  };

  player.object.rotateX((Math.PI / 2) * 3);
  player.name3D.object.rotation.x = -0.5;
  player.score3D.object.rotateY((Math.PI / 2) * 3);
  const pointLight = new THREE.PointLight(0xc2c2c2, 1.5, 50);
  player.object.add(pointLight);
  if (nb == 1) {
    player.object.position.set(-13.5, 0.3, 0);
    player.score3D.object.rotation.z = 0.5;
    player.score3D.object.position.set(-15, 1.5, -2.5);
    player.name3D.object.position.set(-14, 1.5, -10);
    pointLight.position.set(1, 0, 0.3);
  } else if (nb == 2) {
    player.object.position.set(13.5, 0.3, 0);
    player.score3D.object.rotation.z = -0.5;
    player.score3D.object.position.set(15, 1.5, -2.5);
    player.name3D.object.position.set(14 - player.name3D.size.x, 1.5, -10);
    pointLight.position.set(-1, 0, 0.3);
  }

  return player;
};
