import {
  AxisHelper,
  AmbientLight,
  OrthographicCamera,
  PointLight,
  PlaneBufferGeometry,
  MeshPhongMaterial,
  WebGLRenderer,
  Color,
  Scene,
  SpotLight,
  Raycaster,
  SpotLightHelper,
  Vector3,
  MeshToonMaterial,
  Vector2,
  Mesh,
} from 'three';

import Controller from './controller';
import RoomController from './controllers/RoomController';

const frustumSize = 20;

class Floorplan {
  constructor() {
    this.rooms = [];
    this.initRenderer();
    this.initCamera();
    this.initController();
    this.initScene();
    this.initRoomController();
    this.initRaycaster();
    this.createGrid();
    this.createRoom({
      floor: 0,
      width: 8,
      length: 8,
      height: 4,
      position: { x: -4, z: -4 },
    });
    this.intersected;
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.raycaster.setFromCamera(this.controller.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 2) {
      if (
        this.intersected != intersects[0].object &&
        intersects[0].object.highlight
      ) {
        if (this.intersected)
          this.intersected.material.emissive.setHex(
            this.intersected.currentHex,
          );

        this.intersected = intersects[0].object;
        this.intersected.currentHex = this.intersected.material.emissive.getHex();
        this.intersected.material.emissive.setHex(0xff0000);
      }
    } else {
      if (this.intersected) {
        this.intersected.material.emissive.setHex(this.intersected.currentHex);
      }

      this.intersected = null;
    }

    if (intersects.length > 0) {
      this.controller.intersection = intersects[0].point;
    }
  }

  createRoom(opts) {
    this.roomController.createRoom(opts);
  }

  initRenderer() {
    // renderer
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMapSoft = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  initCamera() {
    console.log('Placing the camera...');
    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      2000,
    );
    this.camera.position.set(20, 20, 20);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = -Math.PI / 4;
    this.camera.rotation.x = Math.atan(-1 / Math.sqrt(2));
  }

  initRaycaster() {
    console.log('Initializing raycaster...');
    this.raycaster = new Raycaster();
  }

  initController() {
    console.log('Adding some controls...');
    this.controller = new Controller(this.camera, this.renderer);
  }

  initRoomController() {
    this.roomController = new RoomController(
      this.camera,
      this.renderer,
      this.scene,
      this.controller,
      this.intersects,
    );
  }

  initScene() {
    console.log('Setting up the scene...');
    this.scene = new Scene();
    this.scene.add(new AmbientLight(0xffffff, 0.1));
    let spotLight = new SpotLight(0xffffff, 0.1);
    spotLight.position.set(15, 40, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.25;
    spotLight.decay = 2;
    spotLight.castShadow = true;
    this.scene.add(spotLight);
    this.scene.add(new SpotLightHelper(spotLight));
  }

  createGrid() {
    // grid
    console.log('Initializing grid...');
    this.scene.add(new AxisHelper(40));
    let geometry = new PlaneBufferGeometry(512, 512, 128, 128);
    let material = new MeshPhongMaterial({ color: 0xffffff, opacity: 0.35 });
    let wireframeMaterial = new MeshPhongMaterial({
      color: 0xf5f5f5,
      wireframe: true,
      opacity: 0.5,
    });
    let grid = new Mesh(geometry, material);
    let wireframe = new Mesh(geometry, wireframeMaterial);
    grid.receiveShadow = true;
    wireframe.receiveShadow = true;
    grid.rotation.order = 'YXZ';
    wireframe.rotation.order = 'YXZ';
    grid.rotation.y = -Math.PI / 2;
    wireframe.rotation.y = -Math.PI / 2;
    grid.rotation.x = -Math.PI / 2;
    wireframe.rotation.x = -Math.PI / 2;
    this.scene.add(grid);
    this.scene.add(wireframe);
  }
  onWindowResize() {
    var aspect = window.innerWidth / window.innerHeight;
    this.camera.left = -frustumSize * aspect / 2;
    this.camera.right = frustumSize * aspect / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = -frustumSize / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }
}

export default Floorplan;
