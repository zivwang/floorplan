import {
  Mesh,
  MeshToonMaterial,
  ShapeGeometry,
  Shape,
  ExtrudeBufferGeometry,
  Vector3,
  Vector2,
  SphereGeometry,
  CylinderGeometry,
  MeshLambertMaterial,
  PointLight,
  BoxBufferGeometry,
  MeshNormalMaterial,
  MeshBasicMaterial,
  MeshPhongMaterial,
  ShaderMaterial,
} from 'three';

const WALL_SIZE = .25;
const DEFAULT_SIZE = 8;

const defaultOpts = {
  height: DEFAULT_SIZE / 2,
  width: DEFAULT_SIZE,
  length: DEFAULT_SIZE,
  position: new Vector2(0, 0),
}

export default class Room {
  constructor(opts) {
      this.opts = Object.assign(defaultOpts, opts);
      let room = new Mesh(this.createGeometry(), Room.createMaterial());
      this.rotate(room);
      room.floor = opts.floor;
      room.castShadow = true;
      room.receiveShadow = true;
      room.needsUpdate = true;
      room.createGeometry = this.createGeometry.bind(this);
      this.mesh = room;
      this.shader = new Mesh(this.createGeometry(), Room.createShaderMaterial());
      let skeleton = new Mesh(this.createSkeletonGeo(), Room.createSkeletonMaterial());
      skeleton.castShadow = false;
      skeleton.receiveShadow = false;
      this.rotate(skeleton);
      skeleton.name = skeleton.uuid;
      skeleton.needsUpdate = true;
      skeleton.position.x = this.opts.width / 2 + room.position.x.roundTo(1);
      skeleton.position.z =   room.position.z.roundTo(1) - this.opts.length / 2;
      this.skeleton = skeleton;
      this.light = new PointLight( 0xffffff, .35, 10 );

      this.light.position.x = this.opts.width / 2 + room.position.x.roundTo(1);
      this.light.position.y = this.opts.height;
      this.light.position.z =   room.position.z.roundTo(1) - this.opts.length / 2;

      return this;
  }

  rotate(mesh) {
    mesh.lookAt(new Vector3(0, 200, 0));
  }

  static createSkeletonMaterial() {
    return new MeshToonMaterial({ color: 'red', wireframe: true });
  }

  static createShaderMaterial() {
    let material = new ShaderMaterial( {
        uniforms: {},
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent
      });
    material.extensions.derivatives = true;
    return material;
  }

  static createMaterial() {
    return new MeshPhongMaterial({ color: 'lightgray', opacity: .3, specular: 0x050505, });
  }

  static createMaterialOpac() {
    return new MeshLambertMaterial({ color: 'lightgray', opacity: .1 });
  }

  updateSkeleton(object, floorHeight) {
    this.skeleton.position.x = this.opts.width / 2 + object.position.x.roundTo(1);
    this.skeleton.position.y = this.opts.height/2 + floorHeight;
    this.skeleton.position.z =   object.position.z.roundTo(1) - this.opts.length / 2;
  }
  updateLight(object, floorHeight) {
    this.light.position.x = this.opts.width / 2 + object.position.x.roundTo(1);
    this.light.position.y = this.opts.height;
    this.light.position.z =   object.position.z.roundTo(1) - this.opts.length / 2;

  }

  createSkeletonGeo() {
    const geometry = new BoxBufferGeometry(this.opts.length, this.opts.width, this.opts.height);
    return geometry;
  }


  createGeometry() {
    const { height, width, length, position } = this.opts;
    const extrudeSettings = {
        amount: height,
        steps : 1,
        bevelEnabled: false,
        curveSegments: 8
    };
    const { x, y } = position;


    let roomShape = new THREE.Shape();

    roomShape.moveTo(x, y);
    roomShape.lineTo(length + x, y);
    roomShape.lineTo(length + x, y + width);
    roomShape.lineTo(x , y + width);

    let holePath = new THREE.Path();

    holePath.moveTo(x + WALL_SIZE, y + WALL_SIZE);
    holePath.lineTo(x + length - WALL_SIZE, y + WALL_SIZE);
    holePath.lineTo(x + length - WALL_SIZE,  y + width - WALL_SIZE);
    holePath.lineTo(x + WALL_SIZE , y + width - WALL_SIZE);
    roomShape.holes.push(holePath);

    const geometry = new THREE.ExtrudeBufferGeometry(roomShape, extrudeSettings);
    return geometry;
  }
}
