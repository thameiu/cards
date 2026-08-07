import * as THREE from "three";

type CardSize = {
  width: number;
  height: number;
  depth: number;
};

type CreateCardOptions = {
  aspectRatio: number;
};

const MAX_FACE_SIZE = 3.05;

export function getCardSize(aspectRatio: number): CardSize {
  const safeAspectRatio = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;

  if (safeAspectRatio >= 1) {
    return {
      width: MAX_FACE_SIZE,
      height: MAX_FACE_SIZE / safeAspectRatio,
      depth: 0.004,
    };
  }

  return {
    width: MAX_FACE_SIZE * safeAspectRatio,
    height: MAX_FACE_SIZE,
    depth: 0.004,
  };
}

export function createLayeredCard(
  frontTexture: THREE.Texture,
  backTexture: THREE.Texture,
  maskTexture: THREE.Texture,
  options: CreateCardOptions
) {
  const { width, height, depth } = getCardSize(options.aspectRatio);
  const frontMaterial = new THREE.MeshPhongMaterial({
    map: frontTexture,
    alphaMap: maskTexture,
    transparent: true,
    alphaTest: 0.5,
    color: 0xffffff,
    specular: new THREE.Color(0x3a3a3a),
    shininess: 42,
    side: THREE.DoubleSide,
  });

  const backMaterial = new THREE.MeshPhongMaterial({
    map: backTexture,
    alphaMap: maskTexture,
    transparent: true,
    alphaTest: 0.5,
    color: 0xffffff,
    specular: new THREE.Color(0x3a3a3a),
    shininess: 42,
    side: THREE.DoubleSide,
  });

  const group = new THREE.Group();
  const planeGeometry = new THREE.PlaneGeometry(width, height);
  const layerCount = 10;
  const layerSpacing = depth / Math.max(layerCount - 1, 1);

  for (let index = 0; index < layerCount; index += 1) {
    const layerMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      alphaMap: maskTexture,
      transparent: true,
      alphaTest: 0.5,
      specular: new THREE.Color(0x242424),
      shininess: 24,
      side: THREE.DoubleSide,
    });
    const layer = new THREE.Mesh(planeGeometry, layerMaterial);
    layer.position.z = -depth / 2 + index * layerSpacing;
    group.add(layer);
  }

  const front = new THREE.Mesh(planeGeometry, frontMaterial);
  front.position.z = depth / 2 + 0.0005;
  group.add(front);

  const back = new THREE.Mesh(planeGeometry, backMaterial);
  back.rotation.y = Math.PI;
  back.position.z = -depth / 2 - 0.0005;
  group.add(back);

  group.userData.cardSize = { width, height, depth } satisfies CardSize;

  return group;
}
