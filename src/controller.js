import DragControls from './js/draggable';

const OrbitControls = require('three-orbit-controls')(THREE);

export default class Controller {
  constructor(camera, renderer) {
    this.renderer = renderer;
    this.camera = camera;
    this.callbacks = {};
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.mouse = {};
    this.cursorElm = window.document.getElementById('cursor');
    document.addEventListener(
      'mousemove',
      this.onDocumentMouseMove.bind(this),
      false,
    );
  }
  addEventCallback(type, cb) {
    this.callbacks[type] = cb;
  }
  createDragController(objects) {
    this.dragControls = new DragControls(
      objects,
      this.camera,
      this.renderer.domElement,
    );
    this.dragControls.addEventListener('dragstart', event => {
      this.controls.enabled = false;
      // this.scene.add(skel);
      // this.updateFloor(event.object.floor);
      if (this.callbacks.dragstart) this.callbacks.dragstart(event);
    });
    this.dragControls.addEventListener('drag', event => {
      // skel.position.x = event.object.position.x.roundTo(1);
      // skel.position.y = this.getFloorHeight(event.object.floor);
      // skel.position.z = event.object.position.z.roundTo(1);
      // event.object.position.y = this.getFloorHeight(event.object.floor);
      if (this.callbacks.drag) this.callbacks.drag(event);
    });
    this.dragControls.addEventListener('dragend', event => {
      // event.object.position.x = event.object.position.x.roundTo(1);
      // event.object.position.y = this.getFloorHeight(event.object.floor);
      // event.object.position.z = event.object.position.z.roundTo(1);
      this.controls.enabled = true;
      if (this.callbacks.dragend) this.callbacks.dragend(event);
    });
  }

  onDocumentMouseMove(event) {
    event.preventDefault();
    this.mouse.x = event.clientX / window.innerWidth * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.cursorElm.style.left = event.clientX + 'px';
    this.cursorElm.style.top = event.clientY + 'px';
    if (this.intersection) {
      this.cursorElm.innerHTML = `${this.intersection.x.toFixed(
        2,
      )}, ${this.intersection.y.toFixed(2)}, ${this.intersection.z.toFixed(
        2,
      )} `;
    }
  }
}
