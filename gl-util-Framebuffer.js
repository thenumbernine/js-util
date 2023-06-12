import {traceback} from './util.js';
import {makeTexture2D} from './gl-util-Texture2D.js';
import {makeTextureCube} from './gl-util-TextureCube.js';
function makeFramebuffer(glutil) {
const gl = glutil.context;
glutil.import('TextureCube', makeTextureCube);
glutil.import('Texture2D', makeTexture2D);
class Framebuffer {
	/*
	args:
		width : framebuffer width.  required with depth.
		height : framebuffer height.  required with depth.
		useDepth : set to create a depth renderbuffer for this framebuffer.
	*/
	constructor(args) {
		this.width = args && args.width;
		this.height = args && args.height;
		this.obj = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.obj);
		if (args !== undefined && args.useDepth) {
			this.depthObj = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthObj);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthObj);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	bind() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.obj);
	}
	unbind() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	check() {
		let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if (status != gl.FRAMEBUFFER_COMPLETE) {
			let errstr = 'glCheckFramebufferStatus status=' + status;
			for (let i = 0; i < this.fboErrors.length; ++i) {
				const fboError = this.fboErrors[i];
				if (gl[fboError] == status) {
					errstr += ' error=' + fboError;
					break;
				}
			}
			console.log(traceback());	//w ould be great if exceptions logged tracebacks to the console.  such a genius invention.  it's 2023 now, and someday in the future this will be in browser ... like it used to be for 20 f'ing years... smh.
			throw errstr;
		}
	}
	setColorAttachmentTex2D(index, tex, target, level) {
		if (index === undefined) index = 0;
		if (target === undefined) target = gl.TEXTURE_2D;
		if (level === undefined) level = 0;
		this.bind();
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, target, tex.obj, level);
		this.unbind();
	}
	setColorAttachmentTexCubeMapSide(index, tex, side, level) {
		if (side === undefined) side = index;
		if (level === undefined) level = 0;
		this.bind();
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, glutil.TextureCube.prototype.getTargetForSide(side), tex, level);
		this.unbind();
	}
/* WebGL only supports one color attachment at a time ...
	setColorAttachmentTexCubeMap(tex, level) {
		this.bind();
		for (let i = 0; i < 6; i++) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, glutil.TextureCube.prototype.getTargetForSide(i), tex, level || 0);
		}
		this.unbind();
	},
*/
/* only available by extension ...
function FBO:setColorAttachmentTex3D(index, tex, slice, target, level)
if not tonumber(slice) then error("unable to convert slice to number: " ..tostring(slice)) end
slice = tonumber(slice)
self:bind()
gl.glFramebufferTexture3D(gl.GL_FRAMEBUFFER, gl.GL_COLOR_ATTACHMENT0 + index, target or gl.GL_TEXTURE_3D, tex, level or 0, slice)
self:unbind()
end
*/
	//general, object-based type-deducing
	setColorAttachment(index, tex) {
		if (typeof(tex) == 'object') {
			if (tex instanceof glutil.Texture2D) {
				//javascript splice won't work, so array-clone it first or whatever needs to be done
				this.setColorAttachmentTex2D(index, tex.obj)	//, arguments.splice(2));
			// cube map? side or all at once?
			//elseif mt == Tex3D then
			//	self:setColorAttachmentTex3D(index, tex.id, ...)
			} else if (tex instanceof WebGLTexture) {
				this.setColorAttachmentTex2D(index, tex);	// though this could be a 3d slice or a cube side...
			} else {
				throw "Can't deduce how to attach the object.  Try using an explicit attachment method";
			}
		} else {
			throw "Can't deduce how to attach the object.  Try using an explicit attachment method";
		}
	}
	
	/*
	if index is a number then it binds the associated color attachment at 'GL_COLOR_ATTACHMENT0+index' and runs the callback
	if index is a table then it runs through the ipairs,
		binding the associated color attachment at 'GL_COLOR_ATTACHMENT0+index[side]'
		and running the callback for each, passing the side as a parameter
	*/
	drawToCallback(callback/*, index*/) {
		this.bind();
		this.check();
		//no need to preserve the previous draw buffer in webgl
		//simply binding a framebuffer changes the render target to it
		callback();	
		this.unbind();
	}

	/*
	args:
		viewport
		shader
		uniforms
		texs
		callback
	*/
	draw(args) {
		let oldvp;
		if (args.viewport) {
			oldvp = gl.getParameter(gl.VIEWPORT);
			gl.viewport.apply(gl, args.viewport);
		}
		//if (args.resetProjection) throw 'not supported in webgl';
		
		//something to consider:
		//the draw callback will most likely need a shader to bind its vertex attribute to
		//the fbo itself doesn't necessarily need one, nor does it store uniforms
		//so args.shader, args.uniforms, and args.texs might be moot here
		if (args.shader) {
			gl.useProgram(args.shader.obj);
			if (args.uniforms) {
				if (args.uniforms) {
					args.shader.setUniforms(args.uniforms);
				}
			}
		}
		if (args.texs) bindTextureSet(gl, args.texs);

		//if (args.color) throw 'color not supported in webgl';
		//if (args.dest) throw 'multiple color attachments not supported in webgl';
		
		// no one seems to use fbo:draw... at all...
		// so why preserve a function that no one uses?
		// why not just merge it in here?
		this.drawToCallback(args.callback/* || drawScreenQuad, args.colorAttachment || 0*/);
		
		if (args.texs) unbindTextureSet(gl, args.texs);
		if (args.shader) {
			gl.useProgram(null);
		}

		if (args.viewport) {
			gl.viewport.apply(gl, oldvp);
		}
	}
}
// statics go here so instances can access them becaue javascript is retarded
Framebuffer.prototype.fboErrors = [
	'FRAMEBUFFER_INCOMPLETE_ATTACHMENT',
	'FRAMEBUFFER_INCOMPLETE_DIMENSIONS',
	'FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER',
	'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT'
];
return Framebuffer;
}
export { makeFramebuffer };
