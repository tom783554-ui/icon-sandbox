import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry
} from "three";

const makeMaterial = (color: number) =>
  new MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 });

export const createIcuRoom = () => {
  const room = new Group();
  room.name = "icu-room";

  const floor = new Mesh(
    new PlaneGeometry(12, 10),
    makeMaterial(0x1b2433)
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = false;
  floor.name = "floor";

  const backWall = new Mesh(
    new PlaneGeometry(12, 5),
    makeMaterial(0x202b3a)
  );
  backWall.position.set(0, 2.5, -5);

  const sideWall = new Mesh(
    new PlaneGeometry(10, 5),
    makeMaterial(0x1f2a3a)
  );
  sideWall.position.set(-6, 2.5, 0);
  sideWall.rotation.y = Math.PI / 2;

  room.add(floor, backWall, sideWall);

  const bedGroup = new Group();
  bedGroup.name = "bed";

  const bedFrame = new Mesh(
    new BoxGeometry(3.2, 0.4, 1.5),
    makeMaterial(0x30435f)
  );
  bedFrame.position.set(0, 0.4, 1.2);

  const mattress = new Mesh(
    new BoxGeometry(3, 0.3, 1.4),
    makeMaterial(0x6b7a8f)
  );
  mattress.position.set(0, 0.7, 1.2);

  const pillow = new Mesh(
    new BoxGeometry(0.8, 0.15, 0.6),
    makeMaterial(0x8b97a8)
  );
  pillow.position.set(-1.0, 0.85, 1.2);

  [bedFrame, mattress, pillow].forEach((mesh) => {
    mesh.userData.selectRoot = bedGroup;
    bedGroup.add(mesh);
  });

  const monitorGroup = new Group();
  monitorGroup.name = "monitor";

  const monitorStand = new Mesh(
    new BoxGeometry(0.2, 1.4, 0.2),
    makeMaterial(0x38465c)
  );
  monitorStand.position.set(2.2, 1, -1.2);

  const monitorScreen = new Mesh(
    new BoxGeometry(1.1, 0.7, 0.1),
    new MeshStandardMaterial({
      color: 0x111827,
      emissive: 0x1f6feb,
      emissiveIntensity: 0.35,
      roughness: 0.4
    })
  );
  monitorScreen.position.set(2.2, 1.6, -1.2);

  monitorStand.userData.selectRoot = monitorGroup;
  monitorScreen.userData.selectRoot = monitorGroup;
  monitorGroup.add(monitorStand, monitorScreen);

  const ventGroup = new Group();
  ventGroup.name = "ventilator";

  const ventBody = new Mesh(
    new BoxGeometry(0.8, 1.2, 0.8),
    makeMaterial(0x2d3b52)
  );
  ventBody.position.set(-2.6, 0.6, -0.8);

  const ventDial = new Mesh(
    new CylinderGeometry(0.2, 0.2, 0.1, 20),
    new MeshStandardMaterial({
      color: 0x2c7a7b,
      emissive: 0x2c7a7b,
      emissiveIntensity: 0.2,
      roughness: 0.5
    })
  );
  ventDial.rotation.x = Math.PI / 2;
  ventDial.position.set(-2.6, 0.9, -0.4);

  ventBody.userData.selectRoot = ventGroup;
  ventDial.userData.selectRoot = ventGroup;
  ventGroup.add(ventBody, ventDial);

  const tableGroup = new Group();
  tableGroup.name = "bedside-table";

  const tableTop = new Mesh(
    new BoxGeometry(1.1, 0.15, 0.7),
    makeMaterial(0x3c4f6c)
  );
  tableTop.position.set(2.4, 0.9, 1.4);

  const tableLeg = new Mesh(
    new BoxGeometry(0.1, 0.8, 0.1),
    makeMaterial(0x2c3b50)
  );
  tableLeg.position.set(2.4, 0.45, 1.4);

  tableTop.userData.selectRoot = tableGroup;
  tableLeg.userData.selectRoot = tableGroup;
  tableGroup.add(tableTop, tableLeg);

  room.add(bedGroup, monitorGroup, ventGroup, tableGroup);

  return {
    room,
    selectable: [bedGroup, monitorGroup, ventGroup, tableGroup]
  };
};
