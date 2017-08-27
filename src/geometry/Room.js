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

const WALL_SIZE = 0.25;
const DEFAULT_SIZE = 8;

const defaultOpts = {
  height: DEFAULT_SIZE / 2,
  width: DEFAULT_SIZE,
  length: DEFAULT_SIZE,
  position: new Vector2(0, 0),
};

export default class Room {
  constructor(opts) {
    this.opts = Object.assign(defaultOpts, opts);
    let room = new Mesh(this.createGeometry(), Room.createMaterial());
    this.rotate(room);
    room.floor = opts.floor;
    room.castShadow = true;
    room.receiveShadow = true;
    room.needsUpdate = true;
    room.highlight = true;
    room.height = opts.height;
    room.width = opts.width;
    room.length = opts.length;

    let skeleton = new Mesh(
      this.createSkeletonGeo(),
      Room.createSkeletonMaterial(),
    );
    skeleton.castShadow = false;
    skeleton.receiveShadow = false;
    this.rotate(skeleton);
    skeleton.name = skeleton.uuid;
    skeleton.needsUpdate = true;
    skeleton.position.set(room.position.x, opts.height / 2, room.position.z);

    room.skeleton = skeleton;

    room.light = new PointLight(0xffffff, 0.35, 10);
    room.light.name = room.light.uuid;
    room.light.position.x = this.opts.width / 2 + room.position.x.roundTo(1);
    room.light.position.y = this.opts.height;
    room.light.position.z = room.position.z.roundTo(1) - this.opts.length / 2;

    return room;
  }

  rotate(mesh) {
    mesh.lookAt(new Vector3(0, 200, 0));
  }

  static createSkeletonMaterial() {
    return new MeshToonMaterial({ color: 0xd800ff, wireframe: true });
  }

  static createShaderMaterial() {
    let material = new ShaderMaterial({
      uniforms: {},
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent,
    });
    material.extensions.derivatives = true;
    return material;
  }

  static createMaterial() {
    return new MeshPhongMaterial({
      color: 'lightgray',
      opacity: 0.3,
      specular: 0x050505,
      depthTest: true,
    });
  }

  static createMaterialOpac() {
    return new MeshLambertMaterial({ color: 'lightgray', opacity: 0.5 });
  }

  static updatePosition(target, object, floorHeight, lockY) {
    if (target) {
      target.position.set(
        object.position.x.roundTo(1) + object.length / 2,
        object.height / 2 + floorHeight,
        object.position.z.roundTo(1) - object.width / 2,
      );
    }
  }

  createSkeletonGeo() {
    const geometry = new BoxBufferGeometry(
      this.opts.length,
      this.opts.width,
      this.opts.height,
    );
    return geometry;
  }

  createGeometry() {
    const { height, width, length, position } = this.opts;
    const extrudeSettings = {
      amount: height,
      steps: 1,
      bevelEnabled: false,
      curveSegments: 8,
    };
    const { x, z } = position;
    console.log(height, width, length, position, x, z);
    let roomShape = new THREE.Shape();

    roomShape.moveTo(x, z);
    roomShape.lineTo(length + x, z);
    roomShape.lineTo(length + x, z + width);
    roomShape.lineTo(x, z + width);
    let holePath = new THREE.Path();

    holePath.moveTo(x + WALL_SIZE, z + WALL_SIZE);
    holePath.lineTo(x + length - WALL_SIZE, z + WALL_SIZE);
    holePath.lineTo(x + length - WALL_SIZE, z + width - WALL_SIZE);
    holePath.lineTo(x + WALL_SIZE, z + width - WALL_SIZE);
    roomShape.holes.push(holePath);
    const geometry = new THREE.ExtrudeBufferGeometry(
      roomShape,
      extrudeSettings,
    );
    return geometry;
  }
}
