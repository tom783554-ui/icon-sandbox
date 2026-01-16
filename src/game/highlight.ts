import type { Mesh, MeshStandardMaterial, Object3D } from "three";

const HIGHLIGHT_COLOR = 0x3ddc97;

const setEmissive = (object: Object3D, enabled: boolean) => {
  object.traverse((child) => {
    if (child instanceof Mesh) {
      const material = child.material as MeshStandardMaterial;
      if (!material.emissive) {
        return;
      }

      if (!child.userData.originalEmissive) {
        child.userData.originalEmissive = material.emissive.clone();
      }

      material.emissive.setHex(
        enabled ? HIGHLIGHT_COLOR : child.userData.originalEmissive.getHex()
      );
    }
  });
};

export class HighlightManager {
  private current: Object3D | null = null;

  setSelected(target: Object3D | null) {
    if (this.current) {
      setEmissive(this.current, false);
    }

    this.current = target;

    if (this.current) {
      setEmissive(this.current, true);
    }
  }

  getSelected() {
    return this.current;
  }
}
