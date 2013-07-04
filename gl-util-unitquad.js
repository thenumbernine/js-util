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

	this.unitQuad = new GL.SceneObject({
		mode : gl.TRIANGLE_STRIP,
		attrs : {
			vertex : new GL.ArrayBuffer({
				dim : 2,
				data : this.unitQuadVertexes,
				keep : true
			})
		},
		parent : null,
		static : true
	});
});
