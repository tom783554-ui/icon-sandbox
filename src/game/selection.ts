import { Raycaster, Vector2 } from "three";
import type { Camera, Object3D } from "three";

export type SelectionHandler = (target: Object3D | null) => void;

export class SelectionManager {
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private camera: Camera;
  private targets: Object3D[] = [];
  private onSelect?: SelectionHandler;

  constructor(camera: Camera) {
    this.camera = camera;
  }

  setTargets(targets: Object3D[]) {
    this.targets = targets;
  }

  onSelection(handler: SelectionHandler) {
    this.onSelect = handler;
  }

  handlePointer(event: PointerEvent, canvas: HTMLCanvasElement) {
    if (!event.isPrimary) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.pointer.set(x, y);

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.targets, true);

    if (hits.length > 0) {
      const selected = hits[0].object;
      const root = selected.userData.selectRoot || selected;
      this.onSelect?.(root as Object3D);
      return;
    }

    this.onSelect?.(null);
  }
}
