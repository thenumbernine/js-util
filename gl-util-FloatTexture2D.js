import {assertExists} from './util.js';
import {makeTexture2D} from './gl-util-Texture2D.js';
function makeFloatTexture2D(glutil) {
const gl = glutil.context;
glutil.import('Texture2D', makeTexture2D);
class FloatTexture2D extends glutil.Texture2D {
	constructor(args) {
		if (args.internalFormat === undefined) args.internalFormat = gl.RGBA32F;
		if (args.format === undefined) args.format = gl.RGBA;
		if (args.type === undefined) args.type = gl.FLOAT;
		if (args.minFilter === undefined) args.minFilter = gl.NEAREST;
		if (args.magFilter === undefined) args.magFilter = gl.NEAREST;
		if (args.wrap === undefined) args.wrap = {};
		if (args.wrap.s === undefined) args.wrap.s = gl.REPEAT;
		if (args.wrap.t === undefined) args.wrap.t = gl.REPEAT;
		super(args);
	}
}
return FloatTexture2D;
}
export {makeFloatTexture2D};
