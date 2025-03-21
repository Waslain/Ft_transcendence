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
import { updateScore } from "./utils/updateScore.js";
import { updateName } from "./utils/updateName.js";

export const game = (socket, signal) => {
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
    wallhit: 1,
    playerhit: 1,
    sound: null,
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
  else {
    objectManager.player1.name = "Player 1";
    updateName(objectManager.player1, 1, objectManager.scene);
    objectManager.player2.name = "Player 2";
    updateName(objectManager.player2, 2, objectManager.scene);
    objectManager.player1.score = 0;
    updateScore(objectManager.player1, 1, objectManager.scene);
    objectManager.player2.score = 0;
    updateScore(objectManager.player2, 2, objectManager.scene);
  }

  const animate = () => {
    objectManager.controls.update();
    if (!socket) {
      keys.rotate(objectManager);
      objectManager.player1.hitbox.setFromObject(objectManager.player1.object);
      objectManager.player2.hitbox.setFromObject(objectManager.player2.object);
      ballDirection(objectManager);
      // checkScore(objectManager);
    }
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

const ballDirection = (objectManager) => {
  if (
    objectManager.ball.hitbox.intersectsBox(
      objectManager.playground.southWall.hitbox
    ) ||
    objectManager.ball.hitbox.intersectsBox(
      objectManager.playground.northWall.hitbox
    )
  )
    objectManager.wallhit *= -1;
  else if (
    (objectManager.ball.hitbox.intersectsBox(objectManager.player1.hitbox) &&
      objectManager.playerhit < 0) ||
    (objectManager.ball.hitbox.intersectsBox(objectManager.player2.hitbox) &&
      objectManager.playerhit > 0)
  )
    objectManager.playerhit *= -1;
  else if (
    objectManager.ball.hitbox.intersectsBox(
      objectManager.playground.eastWall.hitbox
    )
  ) {
    objectManager.player1.score++;
    updateScore(objectManager.player1, 1, objectManager.scene);
    objectManager.ball.object.position.set(0, 0.3, 0);
  } else if (
    objectManager.ball.hitbox.intersectsBox(
      objectManager.playground.westWall.hitbox
    )
  ) {
    objectManager.player2.score++;
    updateScore(objectManager.player2, 2, objectManager.scene);
    objectManager.ball.object.position.set(0, 0.3, 0);
  }

  const vector = new THREE.Vector3(
    0.05 * objectManager.playerhit,
    0,
    0.05 * objectManager.wallhit
  );

  objectManager.ball.object.position.add(vector);
};

const checkScore = (objectManager) => {
  const scoreMin = 2;
  if (
    (objectManager.player1.score >= scoreMin &&
      objectManager.player1.score - 2 >= objectManager.player2.score) ||
    (objectManager.player2.score >= scoreMin &&
      objectManager.player2.score - 2 >= objectManager.player1.score)
  ) {
    // displayMessage(
    //   objectManager.player1.score > objectManager.player2.score
    //     ? objectManager.player1.name
    //     : objectManager.player2.name,
    //   objectManager.scene
    // );
    return false;
  }
  return true;
};
