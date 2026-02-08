//require jquery
//require util.js

class Mouse3D {
	/*
	args:
		pressObj: default window
		releaseObj: default window 
		mouseup
		mousedown
		move : function(dx,dy)  for click-and-drag  which match mouse.deltaX, mouse.deltaY
		passiveMove : function(dx,dy)  for simple movement
		zoom : function(dz)
		click : function(event)
		touchclickstart
		touchclickend
		preventDefault - explicit set to false or all defaults will be prevented

	params:
		lastX
		lastY
		downX
		downY
		xf
		yf
		isDown
		isDragging
		isTouchDown
		zoomTouchPts
		newZoomTouchPts

	*/
	constructor(args) {
		this.xf = .5;
		this.yf = .5;
		this.isDown = false;
		this.isDragging = false;
		this.isTouchDown = false;
		this.zoomTouchPts = [[0,0],[0,0]];
		this.newZoomTouchPts = [[0,0],[0,0]];
		this.preventDefault = !(args.preventDefault === false);
		
		let thiz = this;
		this.pressObj = args.pressObj !== undefined ? args.pressObj : window;
		this.releaseObj = args.releaseObj !== undefined ? args.releaseObj : window;
		['mouseup','mousedown','move','passiveMove','zoom','click','touchclickstart','touchclickend'].forEach(callbackName => {
			if (args[callbackName] !== undefined) {
				thiz[callbackName] = args[callbackName];
			}
		});

		//keep this member around for unbinding in the event of finding touch events are used
		//therefore don't expect 'this' to be referenced correctly
		this.mousedownCallback = e => {
			if (thiz.preventDefault) e.preventDefault();
			thiz.doMouseDown(e);
		};
		this.pressObj.addEventListener('mousedown', this.mousedownCallback);
	
		this.mouseupCallback = e => {
			if (thiz.preventDefault) e.preventDefault();
			thiz.doMouseUp(e);
		};
		this.releaseObj.addEventListener('mouseup', this.mouseupCallback);
		
		this.mousemoveCallback = e => {
			if (thiz.preventDefault) e.preventDefault();
			thiz.doMouseMove(e);
		};
		this.pressObj.addEventListener('mousemove', this.mousemoveCallback);
		
		this.mousewheelCallback = e => {
			if (thiz.preventDeafult) e.preventDefault();
			let zoomChange;
			if (e.wheelDelta !== undefined) {
				zoomChange = e.wheelDelta;
			} else if (e.wheelDelta !== undefined) {
				zoomChange = e.wheelDelta;
			}
			if (zoomChange !== undefined && thiz.zoom) {
				thiz.zoom(zoomChange, 'wheel');
				e.preventDefault();
			}
		};
		this.pressObj.addEventListener('mousewheel', this.mousewheelCallback);
		
		//special case for Firefox 25:
		//http://www.javascriptkit.com/javatutors/onmousewheel.shtml
		this.pressObj.addEventListener('DOMMouseScroll', e => {
			if (thiz.preventDefault) e.preventDefault();
			let zoomChange = e.detail;
			if (thiz.zoom) thiz.zoom(zoomChange * -120, 'wheel');
		});
		
		this.clickCallback = function(e) {
			//TODO also check l-infinite distance?  or total distance while mousedown travelled?
			if (thiz.click) thiz.click(e);
		};
		this.pressObj.addEventListener('click', this.clickCallback);

		let unbindMouse = function() {
			thiz.pressObj.removeEventListener('mousedown', thiz.mousedownCallback);
			thiz.releaseObj.removeEventListener('mouseup', thiz.mouseupCallback);
			thiz.pressObj.removeEventListener('mousemove', thiz.mousemoveCallback);
			thiz.pressObj.removeEventListener('mousewheel', thiz.mousewheelCallback);
			thiz.pressObj.removeEventListener('click', thiz.clickCallback);
		};

		this.pressObj.addEventListener('touchstart', e => { 	
			unbindMouse();
			thiz.isTouchDown = false;
			if (thiz.preventDefault) e.preventDefault();
			thiz.doMouseDown(e.targetTouches[0]);
			if (thiz.touchclickstart) thiz.touchclickstart();
		});
		this.pressObj.addEventListener('touchmove', e => {
			if (thiz.preventDefault) e.preventDefault();
			if (e.touches.length >= 2) {
				//do a pinch zoom
				if (!thiz.isTouchDown) {
					//record current events
					if (thiz.getTouchPts(e, thiz.zoomTouchPts)) {
						thiz.isTouchDown = true;
					}
				} else {
					//do zoom based on movement
					if (thiz.getTouchPts(e, thiz.newZoomTouchPts)) {
						let zoomChange = thiz.calcDist(thiz.newZoomTouchPts) - thiz.calcDist(thiz.zoomTouchPts);
						if (zoomChange != 0) {
							if (thiz.zoom) {
								thiz.zoom(100 * zoomChange, 'pinch');
								thiz.zoomTouchPts[0][0] = thiz.newZoomTouchPts[0][0];
								thiz.zoomTouchPts[0][1] = thiz.newZoomTouchPts[0][1];
								thiz.zoomTouchPts[1][0] = thiz.newZoomTouchPts[1][0];
								thiz.zoomTouchPts[1][1] = thiz.newZoomTouchPts[1][1];
							}
						}
					}
				}
			} else {
				//don't reset zoom once we've begun touch zooming
				//until we're finished with the gesture
				//thiz.isTouchDown = false;
			}
			if (!thiz.isTouchDown) {	//only rotate if we haven't begun zooming
				thiz.doMouseMove(e.targetTouches[0]);
			}
		});
		const touchEndCancel = e => {
			if (thiz.preventDefault) e.preventDefault();
			let touch = e.changedTouches[0];
			let [upPosX, upPosY] = thiz.getEventXY(touch);
			thiz.deltaX = upPosX - thiz.downX;
			thiz.deltaY = upPosY - thiz.downY;
			thiz.xf = upPosX / window.innerWidth;
			thiz.yf = upPosY / window.innerHeight;
			let linf = Math.max( Math.abs(thiz.deltaX), Math.abs(thiz.deltaY) );
			if (linf < 2) {
				if (thiz.touchclickend) thiz.touchclickend();
				if (thiz.click) thiz.click(touch);
			} 
			thiz.doMouseUp(touch);
		};
		this.pressObj.addEventListener('touchend', touchEndCancel);
		this.pressObj.addEventListener('touchcancel', touchEndCancel);
	}

	//hmm seems there are cases when i need this modular
	// or I want screenX/ screenY or client 
	getEventXY(e) {
		return [e.pageX, e.pageY];
	}

	doMouseDown(e) {
		this.isDragging = false;
		this.isDown = true;
		[this.lastX, this.lastY] = this.getEventXY(e);
		this.xf = this.lastX / window.innerWidth;
		this.yf = this.lastY / window.innerHeight;
		this.downX = this.lastX;
		this.downY = this.lastY;
		this.deltaX = 0;
		this.deltaY = 0;

		if (this.mousedown) this.mousedown(e);
	}
	doMouseUp(e) {
		this.isDown = false;
		if (this.mouseup) this.mouseup();
	}
	doMouseMove(e) {
		let [thisX, thisY] = this.getEventXY(e);
		this.xf = thisX / window.innerWidth;
		this.yf = thisY / window.innerHeight;

		this.deltaX = thisX - this.lastX;
		this.deltaY = thisY - this.lastY;
		this.lastX = thisX;
		this.lastY = thisY;

		if (this.isDown) {
			this.isDragging = true;
			if (e.shiftKey) {
				if (this.zoom) this.zoom(-100 * this.deltaY, 'shift');
			} else {
				if (this.move) this.move(this.deltaX, this.deltaY);
			}
		} else {
			if (this.passiveMove) this.passiveMove(this.deltaX, this.deltaY);
		}
	}
	getTouchPts(e, pts) {
		if (e.changedTouches.length < 2) return false;
		let [pt0x, pt0y] = this.getEventXY(e.changedTouches[0]);
		pts[0][0] = pt0x;
		pts[0][1] = pt0y;
		let [pt1x, pt1y] = this.getEventXY(e.changedTouches[1]);
		pts[1][0] = pt1x;
		pts[1][1] = pt1y;
		return true;
	}
	calcDist(pts) {
		let dx = pts[0][0] - pts[1][0];
		let dy = pts[0][1] - pts[1][1];
		return Math.sqrt(dx*dx + dy*dy);
	}
}

export { Mouse3D };
