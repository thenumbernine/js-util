import { makeTexture2D } from './gl-util-Texture2D.js';
function makeCompressedTexture2D(glutil) {
const gl = glutil.context;
glutil.import('Texture2D', makeTexture2D);
/**/
class CompressedTexture2D extends glutil.Texture2D {
/**/
/** /
class CompressedTexture2D extends Texture {
	target = gl.TEXTURE_2D;
/ **/
	setData(args) {
		const target = args.target !== undefined ? args.target : this.target;
		const level = args.level !== undefined ? args.level : 0;
		const internalFormat = args.internalFormat !== undefined ? args.internalFormat : gl.RGBA;
		//no format
		//no type
		const width = args.width;
		const height = args.height;
		const border = args.border !== undefined ? args.border : 0;
		const data = args.data;
		gl.compressedTexImage2D(target, level, internalFormat, width, height, border, data)
	}
}
return CompressedTexture2D;
}
export { makeCompressedTexture2D };
