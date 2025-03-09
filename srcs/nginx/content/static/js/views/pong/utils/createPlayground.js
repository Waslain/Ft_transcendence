import * as THREE from "three";

export const createPlayground = () => {
  const planeTexture = new THREE.TextureLoader().load(
    "/static/js/views/pong/utils/textures/solar.jpg"
  );
  planeTexture.wrapS = THREE.RepeatWrapping;
  planeTexture.wrapT = THREE.RepeatWrapping;
  planeTexture.repeat.set(3, 2);

  const planeGeometry = new THREE.PlaneGeometry(30, 20);
  const planeMaterial = new THREE.MeshLambertMaterial({ map: planeTexture });

  const capsTexture = new THREE.TextureLoader().load(
    "/static/js/views/pong/utils/textures/metal.jpg"
  );
  capsTexture.wrapS = THREE.RepeatWrapping;
  capsTexture.wrapT = THREE.RepeatWrapping;
  capsTexture.repeat.set(1, 500);

  const bigCapsuleGeometry = new THREE.CapsuleGeometry(0.5, 30, 20, 20);
  const littleCapsuleGeometry = new THREE.CapsuleGeometry(0.5, 20, 20, 20);
  const capsuleMaterial = new THREE.MeshLambertMaterial({ map: capsTexture });

  const playground = {
    ground: { object: new THREE.Mesh(planeGeometry, planeMaterial) },
    northWall: {
      object: new THREE.Mesh(bigCapsuleGeometry, capsuleMaterial),
      hitbox: new THREE.Box3(),
    },
    southWall: {
      object: new THREE.Mesh(bigCapsuleGeometry, capsuleMaterial),
      hitbox: new THREE.Box3(),
    },
    westWall: {
      object: new THREE.Mesh(littleCapsuleGeometry, capsuleMaterial),
      hitbox: new THREE.Box3(),
    },
    eastWall: {
      object: new THREE.Mesh(littleCapsuleGeometry, capsuleMaterial),
      hitbox: new THREE.Box3(),
    },
  };

  playground.ground.object.rotateX((Math.PI / 2) * 3);
  playground.northWall.object.rotateZ((Math.PI / 2) * 3);
  playground.southWall.object.rotateZ((Math.PI / 2) * 3);
  playground.westWall.object.rotateX((Math.PI / 2) * 3);
  playground.eastWall.object.rotateX((Math.PI / 2) * 3);

  playground.ground.object.position.set(0, 0, 0);
  playground.northWall.object.position.set(0, 0.1, -10);
  playground.southWall.object.position.set(0, 0.1, 10);
  playground.westWall.object.position.set(-15, 0.1, 0);
  playground.eastWall.object.position.set(15, 0.1, 0);

  for (const object of Object.values(playground)) {
    if ("hitbox" in object) {
      object.hitbox.setFromObject(object.object);
      object.hitbox.min.z -= 0.1;
      object.hitbox.max.z += 0.1;
      object.hitbox.min.x -= 0.1;
      object.hitbox.max.x += 0.1;
    }
  }

  return playground;
};
