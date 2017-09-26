if(!bg){
	var bg = {};
}

// copy and paste from processing.js
bg.map = function(value, istart, istop, ostart, ostop) {
	return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
};

bg.contrain = function(aNumber, aMin, aMax) {
	return aNumber > aMax ? aMax : aNumber < aMin ? aMin : aNumber;
};

bg.random = function random() {
	var currentRandom = Math.random;
	if(arguments.length === 0) {
		return currentRandom();
	} else if(arguments.length === 1) {
		return currentRandom() * arguments[0];
	} else {
		var aMin = arguments[0], aMax = arguments[1];
		return currentRandom() * (aMax - aMin) + aMin;
	}
};

bg.adaptTouchToMouse = function adaptTouchToMouse(event) {
	var touches = event.changedTouches,
		first = touches[0],
		type = "";
	switch(event.type) {
		case "touchstart": type = "mousedown"; break;
		case "touchmove":  type = "mousemove"; break;
		case "touchend":   type = "mouseup"; break;
		default: return;
	}
	
	var simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent(type, true, true, window, 1, 
							  first.screenX, first.screenY, 
							  first.clientX, first.clientY, false, 
							  false, false, false, 0/*left*/, null);

	first.target.dispatchEvent(simulatedEvent);
	event.preventDefault();
};