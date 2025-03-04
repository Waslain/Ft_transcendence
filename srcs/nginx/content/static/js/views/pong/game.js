import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";

import { Keys } from "./utils/Keys.js";
import { createBackground } from "./utils/createBackground.js";
import { createPlayground } from "./utils/createPlayground.js";
import { createBall } from "./utils/createBall.js";
import { createText } from "./utils/createText.js";
import { soundBtn } from "./utils/sound.js";
import { helpers } from "./utils/helpers.js";

export const game = (socket) => {
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

  const playerName1 = "Player 1";
  const playerName2 = "Player 2";

  const objectManager = {
    background: createBackground(),
    playground: createPlayground(),
    player1: createPlayer(-1, playerName1),
    player2: createPlayer(1, playerName2),
    ball: createBall(),
    wallhit: 1,
    playerhit: 1,
  };

  // helpers(objectManager, scene);

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
    if (data.action === "loop") {
      objectManager.ball.object.position.set(
        data.params.ball.x,
        0.3,
        data.params.ball.z
      );
      objectManager.player1.object.position.set(
        data.params.players[0].paddle.x,
        0.3,
        data.params.players[0].paddle.z
      );
      if (data.params.players.length > 1) {
        objectManager.player2.object.position.set(
          data.params.players[1].paddle.x,
          0.3,
          data.params.players[1].paddle.z
        );
      }
    }
  };

  const animate = () => {
    controls.update();
    // keys.rotate(objectManager);
    // objectManager.player1.hitbox.setFromObject(objectManager.player1.object);
    // objectManager.player2.hitbox.setFromObject(objectManager.player2.object);
    // ballDirection(objectManager, scene);
    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(animate);
  document.getElementById("app").appendChild(renderer.domElement);

  window.addEventListener("keyup", (e) => keys.keyManager(e));
  window.addEventListener("keydown", (e) => keys.keyManager(e));

  window.addEventListener("resize", onWindowResize);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

const createPlayer = (index, name) => {
  const geometry = new THREE.CapsuleGeometry(0.3, 2, 20, 20);
  const material = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const player = {
    object: new THREE.Mesh(geometry, material),
    hitbox: new THREE.Box3(),
    name,
    name3D: createText(name, 10, 1),
    score: 0,
    score3D: createText("0", 10, 6),
  };

  player.object.rotateX((Math.PI / 2) * 3);
  player.object.position.set(13.5 * index, 0.3, 0);

  player.name3D.object.rotation.x = -0.5;
  player.score3D.object.rotation.z = -0.5 * index;
  player.score3D.object.rotateY((Math.PI / 2) * 3);
  player.score3D.object.position.set(15 * index, 1.5, -2.5);

  if (index < 0) player.name3D.object.position.set(-14, 1.5, -10);
  else player.name3D.object.position.set(14 - player.name3D.size.x, 1.5, -10);

  const pointLight = new THREE.PointLight(0xc2c2c2, 1.5, 50);
  player.object.add(pointLight);
  pointLight.position.set(-1 * index, 0, 0.3);

  return player;
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

const updateScore = (player, scene, index) => {
  scene.remove(player.score3D.object);
  player.score3D.object.geometry.dispose();
  player.score3D.object.material.dispose();

  const newScore3D = createText(
    "" + player.score,
    ("" + player.score).length,
    6
  );
  player.score3D = newScore3D;

  player.score3D.object.rotation.z = -0.5 * index;
  player.score3D.object.rotateY((Math.PI / 2) * 3 * index);
  player.score3D.object.position.set(
    15 * index,
    1.5,
    -2.5 * ("" + player.score).length * index
  );

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
