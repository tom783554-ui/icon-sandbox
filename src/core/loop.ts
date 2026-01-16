import type { Camera, Scene, WebGLRenderer } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class RenderLoop {
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: Camera;
  private controls?: OrbitControls;
  private frameId: number | null = null;

  constructor(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    controls?: OrbitControls
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
  }

  start() {
    if (this.frameId !== null) {
      return;
    }

    const render = () => {
      this.controls?.update();
      this.renderer.render(this.scene, this.camera);
      this.frameId = requestAnimationFrame(render);
    };

    this.frameId = requestAnimationFrame(render);
  }

  stop() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}
