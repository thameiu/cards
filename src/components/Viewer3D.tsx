import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createLayeredCard, getCardSize } from "../lib/threeCard";
import { getImageSourceCandidates } from "../lib/imageSources";
import type { CardData } from "../types";
import { Loader } from "./Loader";

type Viewer3DProps = {
  card: CardData;
  isFullSize?: boolean;
};

function getImageDimensions(image: TexImageSource | ImageBitmap) {
  if ("naturalWidth" in image && "naturalHeight" in image) {
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }

  if ("videoWidth" in image && "videoHeight" in image) {
    return {
      width: image.videoWidth,
      height: image.videoHeight,
    };
  }

  return {
    width: image.width,
    height: image.height,
  };
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: TexImageSource | ImageBitmap,
  canvasWidth: number,
  canvasHeight: number
) {
  const sourceDimensions = getImageDimensions(image);
  const sourceScale = Math.max(canvasWidth / sourceDimensions.width, canvasHeight / sourceDimensions.height);
  const sourceWidth = sourceDimensions.width * sourceScale;
  const sourceHeight = sourceDimensions.height * sourceScale;
  context.drawImage(
    image,
    (canvasWidth - sourceWidth) / 2,
    (canvasHeight - sourceHeight) / 2,
    sourceWidth,
    sourceHeight
  );
}

function createFaceTexture(sourceTexture: THREE.Texture, canvasWidth: number, canvasHeight: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create canvas context for card texture.");
  }

  const sourceImage = sourceTexture.image as TexImageSource | ImageBitmap;
  drawImageCover(context, sourceImage, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createBackTexture(sourceTexture: THREE.Texture | null, canvasWidth: number, canvasHeight: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create canvas context for back texture.");
  }

  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (sourceTexture) {
    const sourceImage = sourceTexture.image as TexImageSource | ImageBitmap;
    drawImageCover(context, sourceImage, canvas.width, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createMaskTexture(
  sourceTexture: THREE.Texture,
  canvasWidth: number,
  canvasHeight: number,
  flipX = false
) {
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create canvas context for mask texture.");
  }

  const sourceImage = sourceTexture.image as TexImageSource | ImageBitmap;
  if (flipX) {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
  }
  drawImageCover(context, sourceImage, canvas.width, canvas.height);
  if (flipX) {
    context.setTransform(1, 0, 0, 1, 0, 0);
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    const value = alpha > 8 ? 255 : 0;
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
    data[index + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

function positionCamera(
  camera: THREE.PerspectiveCamera,
  size: { width: number; height: number; depth: number },
  center = new THREE.Vector3(0, 0, 0),
  options?: {
    fitMultiplier?: number;
    targetYOffset?: number;
  }
) {
  const halfVerticalFov = THREE.MathUtils.degToRad(camera.fov / 2);
  const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * camera.aspect) || 0.0001;
  const fitHeightDistance = (size.height / 2) / Math.max(Math.tan(halfVerticalFov), 0.0001);
  const fitWidthDistance = (size.width / 2) / Math.max(Math.tan(halfHorizontalFov), 0.0001);
  const distance = Math.max(fitHeightDistance, fitWidthDistance) + size.depth * 8;
  const fitMultiplier = options?.fitMultiplier ?? 1.08;
  const targetYOffset = options?.targetYOffset ?? 0;
  const target = new THREE.Vector3(center.x, center.y + targetYOffset, center.z);

  camera.position.set(center.x, center.y, center.z + distance * fitMultiplier);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
}

async function loadTextureWithFallback(loader: THREE.TextureLoader, src: string) {
  const candidates = getImageSourceCandidates(src);

  for (const candidate of candidates) {
    try {
      return await loader.loadAsync(candidate);
    } catch {
      continue;
    }
  }

  throw new Error(`Failed to load texture for ${src}`);
}

export function Viewer3D({ card, isFullSize = false }: Viewer3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isErrorEasterEgg = card.id === "__error__";

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    setIsReady(false);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0xffffff, 0);
    renderer.domElement.className = "viewer-canvas";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
    keyLight.position.set(5, 6, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.55);
    rimLight.position.set(-6, -2, -6);
    scene.add(rimLight);

    const textureLoader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.8;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minPolarAngle = 0.8;
    controls.maxPolarAngle = 2.34;
    controls.target.set(0, 0, 0);
    let isInteracting = false;

    const handleInteractionStart = () => {
      isInteracting = true;
    };

    const handleInteractionEnd = () => {
      isInteracting = false;
    };

    controls.addEventListener("start", handleInteractionStart);
    controls.addEventListener("end", handleInteractionEnd);

    let frameId = 0;
    let disposed = false;
    let cardGroup: THREE.Group | undefined;
    let cardSize = getCardSize(1);
    const cardCenter = new THREE.Vector3(0, 0, 0);

    const updateSize = () => {
      const { clientWidth, clientHeight } = mount;
      if (!clientWidth || !clientHeight) {
        return;
      }

      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      const targetYOffset = isFullSize ? -cardSize.height * 0.035 : 0;
      positionCamera(camera, cardSize, cardCenter, {
        fitMultiplier: isErrorEasterEgg ? (isFullSize ? 0.34 : 0.28) : isFullSize ? 1.2 : 1.12,
        targetYOffset,
      });
      controls.target.set(cardCenter.x, cardCenter.y + targetYOffset, cardCenter.z);
      controls.update();
    };

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      if (cardGroup) {
        if (!isInteracting) {
          cardGroup.rotation.y += 0.0035;
        }
        cardGroup.rotation.z = Math.sin(performance.now() * 0.0006) * 0.015;
      }
      controls.update();
      renderer.render(scene, camera);
    };

    const loadCardModel = async () => {
      if (card.front.toLowerCase().endsWith(".glb")) {
        const gltf = await gltfLoader.loadAsync(card.front);
        if (disposed) {
          return;
        }

        const model = gltf.scene;
        const boundingBox = new THREE.Box3().setFromObject(model);
        const boxSize = boundingBox.getSize(new THREE.Vector3());
        const boxCenter = boundingBox.getCenter(new THREE.Vector3());
        const longestSide = Math.max(boxSize.x, boxSize.y, boxSize.z, 0.0001);
        const scale = 7.5 / longestSide;

        model.scale.setScalar(scale);
        model.position.sub(boxCenter.multiplyScalar(scale));

        const scaledBox = new THREE.Box3().setFromObject(model);
        const scaledSize = scaledBox.getSize(new THREE.Vector3());
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        cardSize = {
          width: scaledSize.x,
          height: scaledSize.y,
          depth: scaledSize.z,
        };
        cardCenter.copy(scaledCenter);
        cardGroup = new THREE.Group();
        cardGroup.add(model);
        scene.add(cardGroup);
        updateSize();
        setIsReady(true);
        animate();
        return;
      }

      const [frontTexture, backTexture] = await Promise.all([
        loadTextureWithFallback(textureLoader, card.front),
        card.back
          ? loadTextureWithFallback(textureLoader, card.back).catch(() => null)
          : Promise.resolve(null),
      ]);

      if (disposed) {
        frontTexture.dispose();
        backTexture?.dispose();
        return;
      }

      const frontImage = frontTexture.image as TexImageSource | ImageBitmap;
      const { width: sourceWidth, height: sourceHeight } = getImageDimensions(frontImage);
      const aspectRatio = sourceWidth / Math.max(sourceHeight, 1);
      const canvasWidth = Math.min(sourceWidth, 2048);
      const canvasHeight = Math.max(Math.round(canvasWidth / Math.max(aspectRatio, 0.01)), 1);

      const composedFrontTexture = createFaceTexture(frontTexture, canvasWidth, canvasHeight);
      const composedBackTexture = createBackTexture(backTexture, canvasWidth, canvasHeight);
      const frontMaskTexture = createMaskTexture(frontTexture, canvasWidth, canvasHeight);
      const backMaskTexture = createMaskTexture(frontTexture, canvasWidth, canvasHeight, true);

      for (const texture of [
        composedFrontTexture,
        composedBackTexture,
        frontMaskTexture,
        backMaskTexture,
      ]) {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }

      cardGroup = createLayeredCard(
        composedFrontTexture,
        composedBackTexture,
        frontMaskTexture,
        backMaskTexture,
        { aspectRatio }
      );
      cardSize = getCardSize(aspectRatio);
      const boundingBox = new THREE.Box3().setFromObject(cardGroup);
      const boxSize = boundingBox.getSize(new THREE.Vector3());
      const boxCenter = boundingBox.getCenter(new THREE.Vector3());
      cardSize = {
        width: boxSize.x,
        height: boxSize.y,
        depth: boxSize.z,
      };
      cardCenter.copy(boxCenter);
      scene.add(cardGroup);
      updateSize();
      setIsReady(true);

      frontTexture.dispose();
      backTexture?.dispose();
      animate();
    };

    loadCardModel()
      .catch((error) => {
        console.error("Failed to load card asset", error);
        setIsReady(true);
      });

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(mount);
    updateSize();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener("start", handleInteractionStart);
      controls.removeEventListener("end", handleInteractionEnd);
      controls.dispose();

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) {
          return;
        }

        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (material.map) {
            material.map.dispose();
          }
          if (material.alphaMap) {
            material.alphaMap.dispose();
          }
          material.dispose();
        }
      });

      renderer.dispose();
      mount.innerHTML = "";
    };
  }, [card, isFullSize]);

  return (
    <div className={`viewer-shell${isReady ? " is-ready" : " is-loading"}`}>
      {!isReady ? <Loader className="viewer-loader" /> : null}
      <div ref={mountRef} className="viewer-mount" />
    </div>
  );
}
