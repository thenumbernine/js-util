import { makeFramebuffer } from './gl-util-Framebuffer.js';
import { Texture2D } from './gl-util-Texture2D.js';
function makeMipmapGenerator(glutil) {
glutil.import('Framebuffer', makeFramebuffer);
glutil.import('Texture2D', makeTexture2D);
// TODO make this its own file?
// then again, this is pretty ubiquotous among non-float_linear / half_float_linear cards
// then again ... does this require extensions ?  will I know what extensions it needs?
// should I let that be optional post-glutil-init?
// also this is based on unit-quad and kernel-fbo, so...
class MipmapGenerator {
	// call this after glutil's init
	constructor() {
		this.fbo = new glutil.Framebuffer();
	}
	generate(tex) {
		if (!this.tex || 
			this.tex.width < tex.width / 2 ||
			this.tex.height < tex.height / 2
		) {
			// destroy the old ... too bad there's no __gc overload ... does webgl auto free textures upon their gl object destruction?  i am suspicious...
			// recreate the tex
			this.tex = new glutil.Texture2D({
				// npo2 anyone?
				width : tex.width / 2,
				height : tex.height / 2,
				// hmm if the format has to match ... should i bin these texs by format?
				internalFormat : tex.intermediateFormat,
				format : tex.format,
				type : tex.type,
				minFilter : gl.NEAREST,
				magFilter : gl.NEAREST,
			});
		}
		this.fbo.draw({
			here : throw 'TODO',
		});
	}
}
return MipmapGenerator;
}
export { makeMipmapGenerator };
