import { MeshPhongMaterial } from 'three';

class RoomMaterial extends MeshPhongMaterial {
  constructor(opts) {
    super({
      color: 'lightgray',
      opacity: 0.3,
      specular: 0x050505,
      depthTest: true,
    });
  }
}

export default RoomMaterial;
