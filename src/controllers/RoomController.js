import Room from '../geometry/Room';
import { updateStats, updateRooms } from '../stats';

import CONTROLS from '../constants/controls';

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
    if (!this.normal) return;
    if (this.selectedFace.normal.x > 0) {
      console.log('side 1');
    } else if (this.selectedFace.normal.x < 0) {
      console.log('side 3');
    } else if (this.selectedFace.normal.y > 0) {
      console.log('side 2');
    } else if (this.selectedFace.normal.y < 0) {
      console.log('side 4');
    }
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
