import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry";
import { theFont } from "./font.js";

export const createText = (str, strLim, size) => {
  if (str.length > strLim) str = str.slice(0, strLim) + " . . .";
  const geometry = new TextGeometry(str, {
    font: theFont,
    size: size,
    height: 0.25,
  });
  const material = new THREE.MeshLambertMaterial({ color: 0xb0c4de });
  const text3D = new THREE.Mesh(geometry, material);

  geometry.computeBoundingBox();
  const boundingBox = geometry.boundingBox;
  const size3D = new THREE.Vector3();
  boundingBox.getSize(size3D);

  const text = {
    object: text3D,
    size: size3D,
  };

  return text;
};
