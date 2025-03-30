import * as THREE from "three";

import { createCamera } from "./utils/createCamera.js";
import { createRenderer } from "./utils/createRenderer.js";
import { createControls } from "./utils/createControls.js";
import { Keys } from "./utils/Keys.js";
import { createBackground } from "./utils/createBackground.js";
import { createPlayground } from "./utils/createPlayground.js";
import { createPlayer } from "./utils/createPlayer.js";
import { createBall } from "./utils/createBall.js";
import { soundBtn } from "./utils/sound.js";
import { handleSocketMessage } from "./utils/handleSocketMessage.js";

export const onlineGame = (socket, signal) => {
  const scene = new THREE.Scene();
  const camera = createCamera();
  const renderer = createRenderer();
  const controls = createControls(camera, renderer);

  const keys = new Keys(socket);

  const objectManager = {
    scene: scene,
    camera: camera,
    renderer: renderer,
    controls: controls,
    background: createBackground(),
    playground: createPlayground(),
    player1: createPlayer(1),
    player2: createPlayer(2),
    ball: createBall(),
    firstMessage: null,
    secondMessage: null,
    sound: null
  };

  scene.add(
    objectManager.background.object,
    ...Object.values(objectManager.playground).map((obj) => obj.object),
    objectManager.player1.object,
    objectManager.player1.name3D.object,
    objectManager.player1.score3D.object,
    objectManager.player2.object,
    objectManager.player2.name3D.object,
    objectManager.player2.score3D.object,
    objectManager.ball.object
  );

  soundBtn(objectManager, signal);

  if (socket) handleSocketMessage(objectManager, socket);

  const animate = () => {
    objectManager.controls.update();
    objectManager.renderer.render(scene, camera);
  };

  objectManager.renderer.setAnimationLoop(animate);
  document.getElementById("app").appendChild(objectManager.renderer.domElement);

  window.addEventListener("keyup", (e) => keys.keyManager(e), {
    signal: signal,
  });
  window.addEventListener("keydown", (e) => keys.keyManager(e), {
    signal: signal,
  });

  window.addEventListener(
    "resize",
    () => {
      objectManager.camera.aspect = window.innerWidth / window.innerHeight;
      objectManager.camera.updateProjectionMatrix();
      objectManager.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    {
      signal: signal,
    }
  );

  return objectManager;
};
