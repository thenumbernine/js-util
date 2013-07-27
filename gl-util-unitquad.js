/*
used by gl-util-font and gl-util-kernel
pretty simple
*/

if (!GL) throw "require gl-util.js before gl-util-unitquad.js";

GL.oninit.push(function(gl) {
	this.unitQuad = {};

	//2D tri strip front facing unit quad
	this.unitQuadVertexes = new Float32Array([
		0,0,
		1,0,
		0,1,
		1,1
	]);

	this.unitQuadVertexBuffer = new GL.ArrayBuffer({
		dim : 2,
		data : this.unitQuadVertexes,
		keep : true
	});

	this.unitQuadGeom = new GL.Geometry({
		mode : gl.TRIANGLE_STRIP,
		vertexes : this.unitQuadVertexBuffer
	});

	this.unitQuad = new GL.SceneObject({
		mode : gl.TRIANGLE_STRIP,
		attrs : {
			vertex : this.unitQuadVertexBuffer
		},
		parent : null,
		static : true
	});
});
