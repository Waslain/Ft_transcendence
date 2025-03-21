import { createText } from "./createText.js";

export const displayMessage = (firstStr, SecondStr, scene) => {
  const firstMsg = createText(firstStr, firstStr.length, 3);
  firstMsg.object.position.set(-(firstMsg.size.x / 2), 7, -16);
  firstMsg.object.rotation.x = -0.5;

  const secondMsg = createText(SecondStr, SecondStr.length, 3);
  secondMsg.object.position.set(-(secondMsg.size.x / 2), 3, -15);
  secondMsg.object.rotation.x = -0.5;

  scene.add(firstMsg.object, secondMsg.object);
};
