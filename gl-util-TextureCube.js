import { makeTexture } from './gl-util-Texture.js';
import { makeTexture2D } from './gl-util-Texture2D.js';
function makeTextureCube(glutil) {
const gl = glutil.context;
glutil.import('Texture', makeTexture);
glutil.import('Texture2D', makeTexture2D);
class TextureCube extends glutil.Texture {
	setArgs(args) {
		super.setArgs(args);
		if (args.urls) {
//console.log('gotURLs', args.urls);			
			let loadedCount = 0;
			//store 'generateMipmap' up front.  we can't set it per-loaded-face, we have to as a whole.
			let generateMipmap = args.generateMipmap;
			args.generateMipmap = undefined;
			let thiz = this;
			args.urls.forEach((url,side) => {
				const image = new Image();
				image.onload = () => {
//console.log('loaded', url);					
					args.data = image;
					args.target = thiz.getTargetForSide(side);
					gl.bindTexture(thiz.target, thiz.obj);
					glutil.Texture2D.prototype.setImage.call(thiz, args);
					gl.bindTexture(thiz.target, null);
				
					// TODO match onload in Texture2D? move 'side' last?
					if (args.onload) args.onload.call(thiz,side,url,image);
				
					//provide an overall all-sides-loaded callback
					//TODO make it generic?  add 'done' and 'onload' to Texture2D too?
					loadedCount++;
//console.log('loadedCount', loadedCount);						
					if (loadedCount == 6) {
//console.log('done!');						
						if (generateMipmap) {
							gl.bindTexture(gl.TEXTURE_CUBE_MAP, thiz.obj);
							gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
							gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
						}
						if (args.done) args.done.call(thiz);
					}
				};
				image.src = url;
//console.log('loading',url);			
			});
		} 
	}
	setData(args) {
		if (args.data === undefined) return;
		
		//store 'generateMipmap' up front.  we can't set it per-loaded-face, we have to as a whole.
		let generateMipmap = args.generateMipmap;
		args.generateMipmap = undefined;

		gl.bindTexture(this.target, this.obj);
		let isArray = typeof(args.data) == 'object';	//$.isArray(value);
//console.log('isArray?',isArray);
		if (isArray && args.data.length >= 6) {
			let srcdata = args.data;
			for (let side = 0; side < 6; ++side) {
				args.data = srcdata[side];
				args.target = this.getTargetForSide(side);
//console.log('setting target',args.target,' to data ',args.data);
				glutil.Texture2D.prototype.setImage.call(this, args);
			}
		} else if (typeof(args.data) == 'function') {
			let srcdata = args.data;
			for (let side = 0; side < 6; ++side) {
				args.data = (x,y) => {
					return srcdata(x,y,side);
				};
				args.target = this.getTargetForSide(side);
				glutil.Texture2D.prototype.setImage.call(this, args);
			}
		}
		
		if (generateMipmap) {
//console.log('generating mipmaps of data-driven cubemap');
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		}
		
		gl.bindTexture(this.target, null);
	}
}

TextureCube.prototype.target = gl.TEXTURE_CUBE_MAP;
TextureCube.prototype.getTargetForSide = function(side) {	//static if javascript statics weren't so messed up. maybe i'll make this TextureCube.prototype.... =  so static member lookup in instances is correct.
	return gl.TEXTURE_CUBE_MAP_POSITIVE_X + side;
};

return TextureCube;
}
export { makeTextureCube };
