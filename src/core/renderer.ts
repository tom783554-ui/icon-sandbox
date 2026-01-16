import { WebGLRenderer } from "three";

const MOBILE_MAX_DPR = 1.5;

const isMobileDevice = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const createRenderer = (canvas: HTMLCanvasElement) => {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });

  renderer.setClearColor(0x0b0f17, 1);

  const dpr = isMobileDevice()
    ? Math.min(window.devicePixelRatio || 1, MOBILE_MAX_DPR)
    : window.devicePixelRatio || 1;

  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);

  return renderer;
};

export const resizeRenderer = (
  renderer: WebGLRenderer,
  width: number,
  height: number
) => {
  renderer.setSize(width, height);

  const dpr = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? Math.min(window.devicePixelRatio || 1, MOBILE_MAX_DPR)
    : window.devicePixelRatio || 1;

  renderer.setPixelRatio(dpr);
};
