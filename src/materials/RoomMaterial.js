import { MeshPhongMaterial } from 'three';

class RoomMaterial extends MeshPhongMaterial {
  constructor(opts) {
    super({
      color: 0x1f8eed,
      specular: 0xffffff,
      reflectivity: .25,
    });
  }
}

export default RoomMaterial;
