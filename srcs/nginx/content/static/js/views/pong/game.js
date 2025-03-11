import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";

import { Keys } from "./utils/Keys.js";
import { createBackground } from "./utils/createBackground.js";
import { createPlayground } from "./utils/createPlayground.js";
import { createPlayer } from "./utils/createPlayer.js";
import { createBall } from "./utils/createBall.js";
import { createText } from "./utils/createText.js";
import { soundBtn } from "./utils/sound.js";

export const game = (socket, signal) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.mouseButtons.RIGHT = 0;
  camera.position.set(0, 15, 15);
  controls.minDistance = 20;
  controls.maxDistance = 30;
  controls.maxPolarAngle = 1.5;

  const keys = new Keys(socket);

  const objectManager = {
    background: createBackground(),
    playground: createPlayground(),
    player1: createPlayer(1),
    player2: createPlayer(2),
    ball: createBall(),
    wallhit: 1,
    playerhit: 1,
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

  soundBtn(camera);

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    switch (data.action) {
      case "names":
        objectManager.player1.name = data.params.names[0];
        updateName(objectManager.player1, 1, scene);
        objectManager.player2.name = data.params.names[1];
        updateName(objectManager.player2, 2, scene);
        break;
      case "scores":
        if (data.params.scores[0] !== objectManager.player1.score) {
          objectManager.player1.score = data.params.scores[0];
          updateScore(objectManager.player1, 1, scene);
        }
        if (
          data.params.scores.length >= 2 &&
          data.params.scores[1] !== objectManager.player2.score
        ) {
          objectManager.player2.score = data.params.scores[1];
          updateScore(objectManager.player2, 2, scene, 1);
        }
        break;
      case "loop":
        objectManager.ball.object.position.set(
          data.params.data.ball.x,
          0.3,
          data.params.data.ball.z
        );
        objectManager.player1.object.position.set(
          data.params.data.players[0].x,
          0.3,
          data.params.data.players[0].z
        );
        objectManager.player2.object.position.set(
          data.params.data.players[1].x,
          0.3,
          data.params.data.players[1].z
        );
        break;
      case "win":
        displayWinner(data.params.winner, scene);
        break;
    }
  };

  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(animate);
  document.getElementById("app").appendChild(renderer.domElement);

  window.addEventListener("keyup", (e) => keys.keyManager(e), {
    signal: signal,
  });
  window.addEventListener("keydown", (e) => keys.keyManager(e), {
    signal: signal,
  });

  window.addEventListener("resize", onWindowResize, {
    signal: signal,
  });

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

const ballDirection = (objectManager, scene) => {
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
    updateScore(objectManager.player1, scene, -1);
    objectManager.ball.object.position.set(0, 0.3, 0);
  } else if (
    objectManager.ball.hitbox.intersectsBox(
      objectManager.playground.westWall.hitbox
    )
  ) {
    objectManager.player2.score++;
    updateScore(objectManager.player2, scene, 1);
    objectManager.ball.object.position.set(0, 0.3, 0);
  }

  const vector = new THREE.Vector3(
    0.05 * objectManager.playerhit,
    0,
    0.05 * objectManager.wallhit
  );

  objectManager.ball.object.position.add(vector);
};

const updateName = (player, nb, scene) => {
  scene.remove(player.name3D.object);
  player.name3D.object.geometry.dispose();
  player.name3D.object.material.dispose();

  const newName3D = createText(player.name, 10, 1);
  player.name3D = newName3D;

  player.name3D.object.rotation.x = -0.5;
  if (nb == 1) player.name3D.object.position.set(-14, 1.5, -10);
  else if (nb == 2)
    player.name3D.object.position.set(14 - player.name3D.size.x, 1.5, -10);

  scene.add(player.name3D.object);
};

const updateScore = (player, nb, scene) => {
  scene.remove(player.score3D.object);
  player.score3D.object.geometry.dispose();
  player.score3D.object.material.dispose();

  const newScore3D = createText(
    "" + player.score,
    ("" + player.score).length,
    6
  );
  player.score3D = newScore3D;

  if (nb == 1) {
    player.score3D.object.rotation.z = 0.5;
    player.score3D.object.rotateY((Math.PI / 2) * -3);
    player.score3D.object.position.set(
      -15,
      1.5,
      2.5 * ("" + player.score).length
    );
  } else if (nb == 2) {
    player.score3D.object.rotation.z = -0.5;
    player.score3D.object.rotateY((Math.PI / 2) * 3);
    player.score3D.object.position.set(
      15,
      1.5,
      -2.5 * ("" + player.score).length
    );
  }

  scene.add(player.score3D.object);
};

const checkScore = (objectManager, scene) => {
  const scoreMin = 2;
  if (
    (objectManager.player1.score >= scoreMin &&
      objectManager.player1.score - 2 >= objectManager.player2.score) ||
    (objectManager.player2.score >= scoreMin &&
      objectManager.player2.score - 2 >= objectManager.player1.score)
  ) {
    displayWinner(
      objectManager.player1.score > objectManager.player2.score
        ? objectManager.player1.name
        : objectManager.player2.name,
      scene
    );
    return false;
  }
  return true;
};

const displayWinner = (name, scene) => {
  const text = createText(name, name.length, 3);
  text.object.position.set(-(text.size.x / 2), 3, -15);
  text.object.rotation.x = -0.5;

  const winMsg = "And the winner is";
  const textDef = createText(winMsg, winMsg.length, 3);
  textDef.object.position.set(-(textDef.size.x / 2), 7, -16);
  textDef.object.rotation.x = -0.5;

  scene.add(text.object, textDef.object);
};
