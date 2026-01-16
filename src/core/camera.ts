import { PerspectiveCamera } from "three";

export const createCamera = () => {
  const camera = new PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(4, 3, 6);
  return camera;
};

export const resizeCamera = (
  camera: PerspectiveCamera,
  width: number,
  height: number
) => {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};
