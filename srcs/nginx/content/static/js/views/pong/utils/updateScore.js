import { createText } from "./createText.js";

export const updateScore = (player, nb, scene) => {
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
