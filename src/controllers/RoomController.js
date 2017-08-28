import Room from '../geometry/Room';
import { updateStats, updateRooms } from '../stats';

import CONTROLS from '../constants/controls';

const SCALE_SENSITIVITY = 10;
const MAX_SCALE = 2;
const MIN_SCALE = 1;

const MAX_LENGTH = 32;

export default class RoomController {
  constructor(camera, renderer, scene, controller) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.controller = controller;
    this.selectedFloor = 0;
    this.rooms = [];
    this.floorHeights = {};
    this.selectedFace = null;
    this.lastLight = null;
    this.startPoint = null;
  }
  createRoom(opts) {
    const room = new Room(opts);
    this.rooms.push(room);
    this.controller.addEventCallback('dragstart', event => {
      updateStats(event.object);
      switch (this.controller.selectedTool) {
        case CONTROLS.MOVE:
          this.handleMoveDragStart(event);
          break;

        case CONTROLS.DELETE:
          this.handleDelete(event);
          break;
        case CONTROLS.SCALE:
          this.handleScaleDragStart(event);
          break;
      }
    });
    this.controller.addEventCallback('drag', event => {
      updateStats(event.object);
      switch (this.controller.selectedTool) {
        case CONTROLS.MOVE:
          this.handleMoveDrag(event);
          break;
        case CONTROLS.DELETE:
          break;
        case CONTROLS.SCALE:
          this.handleScaleDrag(event);
          break;
      }
    });
    this.controller.addEventCallback('dragend', event => {
      updateStats(event.object);
      switch (this.controller.selectedTool) {
        case CONTROLS.MOVE:
          this.handleMoveDragEnd(event);
          break;
        case CONTROLS.DELETE:
          break;
        case CONTROLS.SCALE:
          this.handleScaleDragEnd(event);
          break;
      }
    });

    this.controller.createDragController(this.rooms);
    this.floorHeights[opts.floor] = this.floorHeights[opts.floor]
      ? Math.max(this.floorHeights[opts.floor], opts.height)
      : opts.height;
    room.position.y = this.getFloorHeight(opts.floor);
    room.name = `Room ${this.rooms.length}`;
    this.scene.add(room);
    this.updateFloor(this.selectedFloor);
    this.updateDropdown();
    updateRooms(this.rooms);
  }

  handleScaleDragStart(event) {
    console.log('scale start');
    console.log(this.selectedFace);
    this.dragStartPosition = event.object.position.clone();
    console.log(this.dragStartPosition);
    if (!this.selectedFace) return;
    if (this.selectedFace.normal.x > 0) {
      console.log('side 1');
      this.side = 1;
      console.log(event.object.position.x);
    } else if (this.selectedFace.normal.x < 0) {
      this.side = 3;
      console.log('side 3');
    } else if (this.selectedFace.normal.y > 0) {
      this.side = 2;
      console.log('side 2');
    } else if (this.selectedFace.normal.y < 0) {
      this.side = 4;
      console.log('side 4');
    }
  }

  handleScaleDrag(event) {
    event.object.position.y = this.getFloorHeight(event.object.floor);
    if (this.side === 1) {
      const diff = (event.object.position.x - this.dragStartPosition.x) / SCALE_SENSITIVITY;
      event.object.scale.set(Math.min(Math.max(event.object.scale.x + diff, MIN_SCALE), MAX_SCALE), event.object.scale.y, event.object.scale.z);
    } else if (this.side === 4) {
      const diff = (event.object.position.z - this.dragStartPosition.z) / SCALE_SENSITIVITY;
      event.object.scale.set(event.object.scale.x, Math.min(Math.max(event.object.scale.y + diff, MAX_SCALE), MIN_SCALE), event.object.scale.z);
    }
    event.object.position.set(this.dragStartPosition.x, this.dragStartPosition.y, this.dragStartPosition.z);

  }

  handleScaleDragEnd(event) {
    console.log('scale end', event.object.scale, Math.max((event.object.length * event.object.scale.x).roundTo(1), MIN_SCALE));
    this.handleDelete(event);
    this.createRoom({ position: this.dragStartPosition, width: (event.object.width * event.object.scale.y).roundTo(1), length: Math.min((event.object.length * event.object.scale.x).roundTo(1), MAX_LENGTH), height: event.object.height, floor: event.object.floor });
  }

  handleDelete(event) {
    this.scene.remove(this.scene.getObjectByName(event.object.light.uuid));
    this.scene.remove(this.scene.getObjectByName(event.object.skeleton.uuid));
    this.scene.remove(this.scene.getObjectByName(event.object.name));
    this.lastLight = null;
    this.rooms = this.rooms.filter(r => r.uuid !== event.object.uuid);
    this.controller.createDragController(this.rooms);
    updateRooms(this.rooms);
  }

  handleMoveDragEnd(event) {
    event.object.position.x = event.object.position.x.roundTo(1);
    event.object.position.y = this.getFloorHeight(event.object.floor);
    event.object.position.z = event.object.position.z.roundTo(1);
    this.scene.remove(this.scene.getObjectByName(event.object.skeleton.name));
    this.lastLight = event.object.light.name;
  }

  handleMoveDrag(event) {
    Room.updatePosition(
      event.object.skeleton,
      event.object,
      this.getFloorHeight(event.object.floor),
    );
    Room.updatePosition(
      event.object.light,
      event.object,
      this.getFloorHeight(event.object.floor),
      true,
    );
    event.object.position.y = this.getFloorHeight(event.object.floor);
  }

  handleMoveDragStart(event) {
    this.scene.add(event.object.skeleton);
    this.scene.add(event.object.light);
    if (this.lastLight && this.lastLight !== event.object.light.uuid)
      this.scene.remove(this.scene.getObjectByName(this.lastLight));
    Room.updatePosition(
      event.object.skeleton,
      event.object,
      this.getFloorHeight(event.object.floor),
    );
    this.updateFloor(event.object.floor);
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
