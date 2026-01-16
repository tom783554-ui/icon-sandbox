import "./style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createCamera, resizeCamera } from "./core/camera";
import { RenderLoop } from "./core/loop";
import { createRenderer, resizeRenderer } from "./core/renderer";
import { createScene } from "./core/scene";
import { createIcuRoom } from "./game/icuRoom";
import { HighlightManager } from "./game/highlight";
import { ObjectRegistry } from "./game/objectRegistry";
import { SelectionManager } from "./game/selection";
import { createHud } from "./ui/hud";
import { createLoader } from "./ui/loader";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

const canvas = document.createElement("canvas");
app.appendChild(canvas);

const uiLayer = document.createElement("div");
uiLayer.className = "ui-layer";
app.appendChild(uiLayer);

const hud = createHud(uiLayer);
const loader = createLoader(app, {
  onRetry: () => {
    window.location.reload();
  }
});

let loop: RenderLoop | null = null;

const startFakeProgress = () => {
  let progress = 0;
  loader.setProgress(progress);
  const interval = window.setInterval(() => {
    progress = Math.min(progress + 8 + Math.random() * 10, 92);
    loader.setProgress(progress);
  }, 200);

  return () => window.clearInterval(interval);
};

const initialize = () => {
  loader.show();
  const stopProgress = startFakeProgress();

  try {
    const renderer = createRenderer(canvas);
    const scene = createScene();
    const camera = createCamera();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.5;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 1, 0);
    controls.touches = {
      ONE: OrbitControls.TOUCH.ROTATE,
      TWO: OrbitControls.TOUCH.DOLLY_PAN
    };

    const registry = new ObjectRegistry();
    const highlight = new HighlightManager();
    const selection = new SelectionManager(camera);

    const { room, selectable } = createIcuRoom();
    scene.add(room);
    registry.registerMany(selectable);
    selection.setTargets(registry.getAll());

    selection.onSelection((target) => {
      highlight.setSelected(target);
      hud.setSelected(target?.name ?? null);
    });

    canvas.addEventListener("pointerdown", (event) => {
      selection.handlePointer(event, canvas);
    });

    loop = new RenderLoop(renderer, scene, camera, controls);
    loop.start();

    const handleResize = () => {
      resizeRenderer(renderer, window.innerWidth, window.innerHeight);
      resizeCamera(camera, window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        loop?.stop();
      } else {
        loop?.start();
      }
    });

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      loop?.stop();
      loader.show();
      loader.showError("WebGL context lost. Tap retry to reload.");
    });

    canvas.addEventListener("webglcontextrestored", () => {
      window.location.reload();
    });

    stopProgress();
    loader.setProgress(100);
    window.setTimeout(() => loader.hide(), 300);
  } catch (error) {
    stopProgress();
    loader.showError("Failed to initialize WebGL. Please retry.");
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

initialize();
