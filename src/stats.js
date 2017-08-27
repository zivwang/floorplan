const statXElm = window.document.getElementById('stat-x');

const statYElm = window.document.getElementById('stat-y');

const statZElm = window.document.getElementById('stat-z');
const statNameElm = window.document.getElementById('stat-name');
const sceneElm = window.document.getElementById('scene');

export function updateStats(object) {
  statXElm.innerHTML = object.position.x.roundTo(1);
  statYElm.innerHTML = object.position.y.roundTo(1);
  statZElm.innerHTML = object.position.z.roundTo(1);
  statNameElm.innerHTML = object.name;
}

export function updateRooms(rooms) {
  sceneElm.innerHTML = '';
  for (let r in rooms) {
    let elm = document.createElement('p');
    elm.innerHTML = rooms[r].name;
    sceneElm.appendChild(elm);
  }
}
