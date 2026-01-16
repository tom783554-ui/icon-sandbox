import type { Object3D } from "three";

export class ObjectRegistry {
  private objects: Object3D[] = [];

  register(object: Object3D) {
    this.objects.push(object);
  }

  registerMany(objects: Object3D[]) {
    objects.forEach((object) => this.register(object));
  }

  getAll() {
    return this.objects;
  }
}
