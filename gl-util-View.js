import { vec3, quat } from '/js/gl-matrix-3.4.1/index.js';
function makeView(glutil) {
const gl = glutil.context;
/*
view object, for matrix deduction
*/
class View {
	/*
	args:
		zNear (optional)
		zFar
		fovY
		ortho
		pos
		angle
	*/
	constructor(args) {
		this.zNear = 1;
		this.zFar = 2000;
		this.fovY = 90;	// corresponding with 1:1 x:z
		this.ortho = false;
		this.pos = vec3.create();
		this.angle = quat.create();
		if (args !== undefined) {
			if (args.zNear !== undefined) this.zNear = args.zNear;
			if (args.zFar !== undefined) this.zFar = args.zFar;
			if (args.fovY !== undefined) this.fovY = args.fovY;
			if (args.ortho !== undefined) this.ortho == args.ortho;
			if (args.pos !== undefined) vec3.copy(this.pos, args.pos);
			if (args.angle !== undefined) quat.copy(this.angle, args.angle);
		}
	}
}
return View;
}
export { makeView };
