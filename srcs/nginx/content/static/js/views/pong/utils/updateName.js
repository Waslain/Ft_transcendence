import { createText } from "./createText.js";

export const updateName = (player, nb, scene) => {
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
