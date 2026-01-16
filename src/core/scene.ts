import {
  AmbientLight,
  DirectionalLight,
  Fog,
  Scene
} from "three";

export const createScene = () => {
  const scene = new Scene();
  scene.fog = new Fog(0x0b0f17, 12, 28);

  const ambient = new AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dir = new DirectionalLight(0xffffff, 0.9);
  dir.position.set(5, 8, 2);
  scene.add(dir);

  return scene;
};
