import Floorplan from './floorplan';

Number.prototype.roundTo = function(num) {
    var resto = this%num;
    if (resto <= (num/2)) {
        return this-resto;
    } else {
        return this+num-resto;
    }
}


window.floorplan = new Floorplan();

animate();

function animate() {
	requestAnimationFrame(animate);
	window.floorplan.controller.controls.update();
	window.floorplan.render();
}
