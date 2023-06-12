function makeTexture(glutil) {
const gl = glutil.context;
class Texture {
	/*
	args:
		glutil (optional)
		everything else handled by setArgs
	*/
	constructor(args) {
		this.obj = gl.createTexture();
		gl.bindTexture(this.target, this.obj);
		if (args !== undefined) this.setArgs(args);
		gl.bindTexture(this.target, null);
	}
	//target provided upon init 
	bind(unit) { 
		if (unit !== undefined) gl.activeTexture(gl.TEXTURE0 + unit);
		gl.bindTexture(this.target, this.obj);
		return this;
	}
	unbind(unit) { 
		if (unit !== undefined) gl.activeTexture(gl.TEXTURE0 + unit);
		gl.bindTexture(this.target, null); 
		return this;
	}
	/*
	args:
		flipY: use UNPACK_FLIP_Y_WEBGL
		dontPremultiplyAlpha: don't use UNPACK_PREMULTIPLY_ALPHA_WEBGL
		magFilter: texParameter TEXTURE_MAG_FILTER
		minFilter: texParameter TEXTURE_MIN_FILTER
		generateMipmap: specifies to call generateMipmap after loading the texture data
		url: url of image to load
		wrap : wrap info
		onload: any onload callback to be used with url
		done: what to call after all onloads are finished (ex. for cube, when there are multiple images)
	*/
	setArgs(args) {
		let target = this.target;
		if (args.alignment) gl.pixelStorei(gl.UNPACK_ALIGNMENT, args.alignment);
		if (args.flipY === true) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		else if (args.flipY === false) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		if (!args.dontPremultiplyAlpha) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		if (args.magFilter) gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, args.magFilter);
		if (args.minFilter) gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, args.minFilter);
		if (args.wrap) {
			this.setWrap(args.wrap);
		}
		this.setData(args);
		return this;
	}
	wrapMap = {
		s : gl.TEXTURE_WRAP_S,
		t : gl.TEXTURE_WRAP_T
	};
	setWrap(args) {
		for (let k in args) {
			gl.texParameteri(this.target, this.wrapMap[k] || k, args[k]);
		}
		return this;
	}
	//typically overwritten. default calls setImage if args.data is provided
	setData(args) {
		if (args.data) {
			this.setImage(args);
		}
	}
}
return Texture;
}
export { makeTexture };
