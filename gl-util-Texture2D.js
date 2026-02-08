import {makeTexture} from './gl-util-Texture.js';
function makeTexture2D(glutil) {
const gl = glutil.context;
glutil.import('Texture', makeTexture);
/*
args match Texture2D.setArgs
with the exception of:
	onload : called when the image loads, after the data is set to the texture
	onerror : called if the image errors
*/
class Texture2D extends glutil.Texture {
	setData(args) {
		if (args.url) {
			let image = new Image();
			let thiz = this;
			image.addEventListener('load', e => {
				args.data = image;
				gl.bindTexture(thiz.target, thiz.obj);
				thiz.setImage(args);
				gl.bindTexture(thiz.target, null);
				
				if (args.onload) args.onload.call(thiz, args.url, image);
			});
			image.addEventListener('error', e => { 
				if (args.onerror) args.onerror.call(thiz, e);
			});
			image.src = args.url;
		} else {
			if (args.data === undefined) args.data = null;
			this.setImage(args);
		}
	}
	/*
	args:
		target (default this.target)
		level (default 0)
		internalFormat (default gl.RGBA)
		width (optional)
		height (optional)
		border (optional, default 0 if needed)
		format (default gl.RGBA)
		type (default gl.UNSIGNED_BYTE)
		data (required - ArrayBufferView, ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElement)
			- though only ArrayBufferView requires width, height, and optionally border
	*/
	setImage(args) {
		let target = args.target !== undefined ? args.target : this.target;
		let level = args.level !== undefined ? args.level : 0;
		let internalFormat = args.internalFormat !== undefined ? args.internalFormat : gl.RGBA;
		let format = args.format !== undefined ? args.format : gl.RGBA;
		let type = args.type !== undefined ? args.type : gl.UNSIGNED_BYTE;
		let width = args.width;
		let height = args.height;
		let border = args.border !== undefined ? args.border : 0;
		
		//store?  WebGL has no getTexParameteri(gl.TEXTURE_WIDTH) ...
		this.internalFormat = internalFormat;
		this.format = format;
		this.type = type;
		this.width = width;
		this.height = height;
		
		//NOTICE this method only works for ArrayBufferView.  maybe that should be my test
//console.log('setting image target',target,'level',level,'internalFormat',internalFormat,'width',width,'height',height,'border',border,'format',format,'type',type,'data',args.data);
		if (width === undefined && height === undefined) {
			//assume it's an image
			gl.texImage2D(target, level, internalFormat, format, type, args.data);
		} else {
			if (typeof(args.data) != 'function') {
				//assume it's a buffer
				gl.texImage2D(target, level, internalFormat, width, height, border, format, type, args.data);
			} else {
				//procedural generation
				let i = 0;
				
				//TODO get number of channels for format, rather than overriding it...
				format = gl.RGBA;
				let channels = 4;

				let scale = undefined;
				let data = undefined;
				if (type == gl.UNSIGNED_BYTE) {
					data = new Uint8Array(width * height * channels);
					scale = 255;
				} else if (type == gl.FLOAT) {
					data = new Float32Array(width * height * channels);
					// TODO only upon override
					this.internalFormat = internalFormat = gl.RGBA32F;
					scale = 1;
				}
		
				for (let y = 0; y < height; ++y) {
					for (let x = 0; x < width; ++x) {
						let c = args.data(x,y);
						for (let ch = 0; ch < 4; ++ch) {
							let d = c[ch];
							if (d === undefined) d = 0;
							d *= scale;
							data[i] = d;
							++i;
						}
					}
				}
				gl.texImage2D(target, level, internalFormat, width, height, border, format, type, data);
			}
		}
		if (args.generateMipmap) {
			gl.generateMipmap(this.target);
		}
	}
}
Texture2D.prototype.target = gl.TEXTURE_2D;
return Texture2D;
}
export { makeTexture2D };
