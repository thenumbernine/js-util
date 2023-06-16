import {mat4} from './gl-matrix-3.4.1/index.js';
import {makeArrayBuffer} from './gl-util-ArrayBuffer.js';
import {makeGeometry} from './gl-util-Geometry.js';
import {makeSceneObject} from './gl-util-SceneObject.js';
/*
used by gl-util-font and gl-util-kernel
pretty simple
*/
function makeUnitQuad(glutil) {
const gl = glutil.context;
glutil.import('ArrayBuffer', makeArrayBuffer);
glutil.import('Geometry', makeGeometry);
glutil.import('SceneObject', makeSceneObject);
//2D tri strip front facing unit quad
let unitQuadVertexes = new Float32Array([
	0,0,
	1,0,
	0,1,
	1,1,
]);

let unitQuadVertexBuffer = new glutil.ArrayBuffer({
	dim : 2,
	data : unitQuadVertexes,
	keep : true,
});

let unitQuadGeom = new glutil.Geometry({
	mode : gl.TRIANGLE_STRIP,
	vertexes : unitQuadVertexBuffer,
});

let unitQuad = new glutil.SceneObject({
	mode : gl.TRIANGLE_STRIP,
	attrs : {
		vertex : unitQuadVertexBuffer
	},
	parent : null,
	static : true,
	/* hmm struggling with this ...
	need to rethink the state in SceneObject
	static : false,	//'true' makes us use scene's mvMat , which isn't initialized yet
	uniforms : {
		mvMat : mat4.create(),
		viewMatInv : mat4.create(),
		projMat : mat4.create(),
	},
	*/
});

return {
	unitQuad : unitQuad,
	unitQuadGeom : unitQuadGeom,
	unitQuadVertexBuffer : unitQuadVertexBuffer,
	unitQuadVertexes : unitQuadVertexes,
}
}
export { makeUnitQuad };
