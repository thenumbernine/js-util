import { vec3, quat, mat4 } from '/js/gl-matrix-3.4.1/index.js';
import { makeSceneObject } from './gl-util-SceneObject.js';
function makeScene(glutil) {
const gl = glutil.context;
glutil.import('SceneObject', makeSceneObject);
class Scene {
	constructor() {
		//traditional gl matrices
		this.projMat = mat4.create();
		this.mvMat = mat4.create();
	
		this.root = new glutil.SceneObject({
			scene : this,
			parent : undefined,
			geometry : undefined,
		});
		
		//private/temp vars
		this.viewAngleInv = quat.create();
		this.viewPosInv = vec3.create();
	}

	setupMatrices() {
		quat.conjugate(this.viewAngleInv, glutil.view.angle);
		mat4.fromQuat(this.mvMat, this.viewAngleInv);
		vec3.negate(this.viewPosInv, glutil.view.pos);
		mat4.translate(this.mvMat, this.mvMat, this.viewPosInv);
	}
}
return Scene;
}
export { makeScene };
