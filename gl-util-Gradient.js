import { makeTexture2D } from './gl-util-Texture2D.js';
function makeGradient(glutil) {
glutil.import('Texture2D', makeTexture2D);
const gl = glutil.context;
class GradientTexture extends glutil.Texture2D {
	/*
	args:
		context (optional)
		width
		colors
		dontRepeat
	*/
	constructor(args) {
		const width = args.width;
		const colors = args.colors;
		const data = new Uint8Array(width * 3);
		for (let i = 0; i < width; i++) {
			let f = (i+.5)/width;
			if (args.dontRepeat) {
				f *= colors.length - 1;
			} else {
				f *= colors.length;
			}
			const ip = parseInt(f);
			f -= ip;
			const iq = (ip + 1) % colors.length;
			const g = 1. - f;	
			for (let k = 0; k < 3; k++) {
				data[k+3*i] = 255*(colors[ip][k] * g + colors[iq][k] * f);
			}
		}
		super({
			width : width,
			height : 1,
			format : gl.RGB,
			internalFormat : gl.RGB,
			data : data,
			minFilter : gl.NEAREST,
			magFilter : gl.LINEAR,
			wrap : {s : gl.CLAMP_TO_EDGE, t : gl.CLAMP_TO_EDGE},
		});	
	}
}

class HSVTexture extends glutil.Texture2D {
	constructor(width) {
		super({
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
}

return {
	GradientTexture : GradientTexture,
	HSVTexture : HSVTexture,
}
}
export { makeGradient };
