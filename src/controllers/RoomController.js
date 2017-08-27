import Room from '../geometry/Room';
import { updateStats, updateRooms } from '../stats';

export default class RoomController {
  constructor(camera, renderer, scene, controller) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.controller = controller;
    this.selectedFloor = 0;
    this.rooms = [];
    this.floorHeights = {};
    this.lastLight = null;
  }
  createRoom(opts) {
    const room = new Room(opts);
    this.rooms.push(room.mesh);
    this.controller.addEventCallback('dragstart', event => {
      this.scene.add(room.skeleton);
      this.scene.add(room.light);
      if (this.lastLight && this.lastLight !== room.light.uuid)
        this.scene.remove(this.scene.getObjectByName(this.lastLight));
      room.updateSkeleton(
        event.object,
        this.getFloorHeight(event.object.floor),
      );
      this.updateFloor(event.object.floor);
      updateStats(event.object);
    });
    this.controller.addEventCallback('drag', event => {
      room.updateSkeleton(
        event.object,
        this.getFloorHeight(event.object.floor),
      );
      room.updateLight(event.object, this.getFloorHeight(event.object.floor));
      event.object.position.y = this.getFloorHeight(event.object.floor);
      updateStats(event.object);
    });
    this.controller.addEventCallback('dragend', event => {
      event.object.position.x = event.object.position.x.roundTo(1);
      event.object.position.y = this.getFloorHeight(event.object.floor);
      event.object.position.z = event.object.position.z.roundTo(1);
      this.scene.remove(this.scene.getObjectByName(room.skeleton.name));
      updateStats(event.object);

      this.lastLight = room.light.name;
    });
    this.controller.createDragController(this.rooms);

    this.floorHeights[opts.floor] = this.floorHeights[opts.floor]
      ? Math.max(this.floorHeights[opts.floor], opts.height)
      : opts.height;
    room.mesh.position.y = this.getFloorHeight(opts.floor);
    room.mesh.name = `Room ${this.rooms.length}`;
    this.scene.add(room.mesh);
    this.updateFloor(this.selectedFloor);
    this.updateDropdown();
    updateRooms(this.rooms);
  }

  updateFloor(floor) {
    this.selectedFloor = floor;
    for (let i in this.rooms) {
      if (this.rooms[i].floor !== floor) {
        this.rooms[i].material = Room.createMaterialOpac();
      } else {
        this.rooms[i].material = Room.createMaterial();
      }
    }
  }

  getFloorHeight(floor) {
    let y = 0;
    for (let x in this.floorHeights) {
      if (x < floor) {
        y += this.floorHeights[x];
      }
    }
    return y;
  }

  updateDropdown() {
    let select = window.document.getElementById('toolbar-floor');
    select.innerHTML = '';
    for (let i in this.floorHeights) {
      let opt = document.createElement('option');
      opt.value = i;
      opt.innerHTML = parseInt(i) + 1;
      select.appendChild(opt);
    }
  }
}
