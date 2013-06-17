if (!GL) throw "require gl-util.js before gl-util-font.js";

GL.oninit.push(function() {
	var gl = GL.gl;

	/*
	args:
		width
		colors
		dontRepeat
	*/
	var GradientTexture = function(args) {
		var width = args.width;
		var colors = args.colors;
		var data = new Uint8Array(width * 3);
		for (var i = 0; i < width; i++) {
			var f = (i+.5)/width;
			if (args.dontRepeat) {
				f *= colors.length - 1;
			} else {
				f *= colors.length;
			}
			var ip = parseInt(f);
			f -= ip;
			var iq = (ip + 1) % colors.length;
			var g = 1. - f;	
			for (var k = 0; k < 3; k++) {
				data[k+3*i] = 255*(colors[ip][k] * g + colors[iq][k] * f);
			}
		}
		GL.Texture2D.call(this, {
			width : width,
			height : 1,
			format : gl.RGB,
			internalFormat : gl.RGB,
			data : data,
			minFilter : gl.NEAREST,
			magFilter : gl.LINEAR,
			wrap : { s : gl.CLAMP_TO_EDGE, t : gl.CLAMP_TO_EDGE }
		});
	};
	GradientTexture.prototype = GL.Texture2D.prototype; //by-ref so long as this contains nothing new
	GL.GradientTexture = GradientTexture;

	var HSVTexture = function(width) {
		GradientTexture.call(this, {
			width : width,
			colors : [
				[1,0,0],
				[1,1,0],
				[0,1,0],
				[0,1,1],
				[0,0,1],
				[1,0,1]
			]
		});
	}
	HSVTexture.prototype = GL.Texture2D.prototype; //by-ref so long as this contains nothing new
	GL.HSVTexture = HSVTexture;
});
