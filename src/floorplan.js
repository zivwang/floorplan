import {
	AxisHelper,
	AmbientLight,
	OrthographicCamera,
	PointLight,
	PlaneBufferGeometry,
	WebGLRenderer,
  Color,
  Fog,
  MeshPhongMaterial,
	Scene,
	PerspectiveCamera,
	BoxGeometry,
  SpotLight,
  SpotLightHelper,
  SphereGeometry,
	MeshBasicMaterial,
  PointLightHelper,
	PCFSoftShadowMap,
	MeshNormalMaterial,
  ShaderMaterial,
	TrackballControls,
  Vector3,
  DirectionalLight,
  DirectionalLightHelper,
  HemisphereLight,
	MeshToonMaterial,
	Vector2,
	Mesh,
} from 'three';

import Room from './geometry/Room';
import Controller from './controller';

const frustumSize = 20;

class Floorplan {
  constructor() {
    this.rooms = [];
    this.initRenderer();
    this.initCamera();
    this.initController();
    this.initScene();
    window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
    this.createGrid();
    this.floorHeights = {};
    this.selectedFloor= 0 ;
    this.createRoom({ floor: 0, height:  4 });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  createRoom(opts) {
    const room = new Room(opts);
    this.rooms.push(room.mesh);
    // room.light.position.set( 15, 40, 10 );

    this.controller.addEventCallback('dragstart', event => {
      this.scene.add(room.skeleton);
      this.updateFloor(event.object.floor);
    })
    this.controller.addEventCallback('drag', event => {
      room.updateSkeleton(event.object, this.getFloorHeight(event.object.floor));
      room.updateLight(event.object, this.getFloorHeight(event.object.floor));
      event.object.position.y = this.getFloorHeight(event.object.floor);
    })
    this.controller.addEventCallback('dragend', event => {
      event.object.position.x = event.object.position.x.roundTo(1);
      event.object.position.y = this.getFloorHeight(event.object.floor);
      event.object.position.z = event.object.position.z.roundTo(1);
      this.scene.remove(this.scene.getObjectByName(room.skeleton.name));
    })
    this.controller.createDragController(this.rooms);

    this.floorHeights[opts.floor] = this.floorHeights[opts.floor] ? Math.max(this.floorHeights[opts.floor], opts.height) : opts.height;
    room.mesh.position.y = this.getFloorHeight(opts.floor);
    this.scene.add(room.mesh);
    this.scene.add(room.light);
    this.updateFloor(this.selectedFloor);
    this.updateDropdown();
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
    this.camera =  new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 )
    this.camera.position.set(20, 20, 20);
		this.camera.rotation.order = 'YXZ';
		this.camera.rotation.y = - Math.PI / 4;
		this.camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) );
  }

  initController() {
    console.log('Adding some controls...');
    this.controller = new Controller(this.camera, this.renderer);
  }

  initScene() {
    console.log('Setting up the scene...');
    this.scene = new Scene();
    this.scene.add(new AmbientLight(0xffffff, .1));
    let spotLight = new SpotLight( 0xffffff, .1 );
    spotLight.position.set( 15, 40, 10 );
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = .5;
    spotLight.decay = 2;
    spotLight.castShadow = true;
    this.scene.add(spotLight);
    this.scene.add(new SpotLightHelper(spotLight));
    }

  createGrid() {
    // grid
    console.log('Initializing grid...');
    this.scene.add(new AxisHelper(40));
    let geometry = new PlaneBufferGeometry(128, 128, 32, 32);
    let material = new MeshToonMaterial( { color: 0xffffff, opacity: .5 } );
    let wireframeMaterial = new MeshToonMaterial( { color: 0xf5f5f5, wireframe: true, opacity: 1 } );
    let grid = new Mesh(geometry, material);
    let wireframe = new Mesh(geometry, wireframeMaterial);
    grid.receiveShadow = true;
    wireframe.receiveShadow = true;
    grid.rotation.order = 'YXZ';
    wireframe.rotation.order = 'YXZ';
    grid.rotation.y = - Math.PI / 2;
    wireframe.rotation.y = - Math.PI / 2;
    grid.rotation.x = - Math.PI / 2;
    wireframe.rotation.x = - Math.PI/2;
    this.scene.add(grid);
    this.scene.add(wireframe);

  }
  onWindowResize() {
		var aspect = window.innerWidth / window.innerHeight;
		this.camera.left   = - frustumSize * aspect / 2;
		this.camera.right  =   frustumSize * aspect / 2;
		this.camera.top    =   frustumSize / 2;
		this.camera.bottom = - frustumSize / 2;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.render();
	}
}

export default Floorplan;
