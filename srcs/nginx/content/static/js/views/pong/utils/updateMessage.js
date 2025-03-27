import { createText } from "./createText.js";

export const updateMessage = (objectManager, firstStr, secondStr, scene) => {
  if (objectManager.firstMessage) {
    scene.remove(objectManager.firstMessage.object);
    objectManager.firstMessage.object.geometry.dispose();
    objectManager.firstMessage.object.material.dispose();
  }
  const firstMsg = createText(firstStr, firstStr.length, 3);
  firstMsg.object.position.set(-(firstMsg.size.x / 2), 7, -16);
  firstMsg.object.rotation.x = -0.5;
  objectManager.firstMessage = firstMsg;

  if (objectManager.secondMessage) {
    scene.remove(objectManager.secondMessage.object);
    objectManager.secondMessage.object.geometry.dispose();
    objectManager.secondMessage.object.material.dispose();
  }
  const secondMsg = createText(secondStr, secondStr.length, 3);
  secondMsg.object.position.set(-(secondMsg.size.x / 2), 3, -15);
  secondMsg.object.rotation.x = -0.5;
  objectManager.secondMessage = secondMsg;

  scene.add(
    objectManager.firstMessage.object,
    objectManager.secondMessage.object
  );
};
