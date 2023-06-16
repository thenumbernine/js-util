import {vec3, mat4} from '/js/gl-matrix-3.4.1/index.js';
import {DOM, merge} from '/js/util.js';
import {makeScene} from './gl-util-Scene.js';
import {makeSceneObject} from './gl-util-SceneObject.js';
import {makeView} from './gl-util-View.js';
import {makeArrayBuffer} from './gl-util-ArrayBuffer.js';
import {makeAttribute} from './gl-util-Attribute.js';
import {makeCompressedTexture2D} from './gl-util-CompressedTexture2D.js';
import {makeElementArrayBuffer} from './gl-util-ElementArrayBuffer.js';
import {makeFragmentShader} from './gl-util-FragmentShader.js';
import {makeFramebuffer} from './gl-util-Framebuffer.js';
import {makeGeometry} from './gl-util-Geometry.js';
import {makeProgram} from './gl-util-Program.js';
import {makeShader} from './gl-util-Shader.js';
import {makeTexture} from './gl-util-Texture.js';
import {makeTexture2D} from './gl-util-Texture2D.js';
import {makeTextureCube} from './gl-util-TextureCube.js';
import {makeVertexShader} from './gl-util-VertexShader.js';

// TODO modifiers for the gl-matrix library ... where to put them ...
function quatXAxis (res, q) {
	let x = q[0], y = q[1], z = q[2], w = q[3];
	res[0] = 1 - 2 * (y * y + z * z);
	res[1] = 2 * (x * y + z * w);
	res[2] = 2 * (x * z - w * y);
}
function quatYAxis(res, q) {
	let x = q[0], y = q[1], z = q[2], w = q[3];
	res[0] = 2 * (x * y - w * z);
	res[1] = 1 - 2 * (x * x + z * z);
	res[2] = 2 * (y * z + w * x);
}
function quatZAxis(res, q) {
	let x = q[0], y = q[1], z = q[2], w = q[3];
	res[0] = 2 * (x * z + w * y);
	res[1] = 2 * (y * z - w * x);
	res[2] = 1 - 2 * (x * x + y * y);
}

// WebGL helper classes
class GLUtil {
	//what webgl names to search through
	webGLNames = ['webgl2', 'webgl', 'experimental-webgl'];

	/*
	this combines the GL context, render target, and viewport responsabilities
	so maybe it should be split up later

	create a new scene with associated canvas and view
	args:
		one of these:
			canvas = which canvas to use
			fullscreen = whether to create our own fullscreen canvas
		canvasArgs = canvas.getContext arguments, including:
			premultipliedAlpha (default false)
			alpha (default false)
	*/
	constructor(args) {
		var thiz = this;
window.glutil = this;

		this.canvas = args.canvas;
		if (args.fullscreen) {
			window.scrollTo(0,1);
			if (this.canvas === undefined) {
				this.canvas = DOM('canvas', {prependTo:document.body});
			}

			merge(this.canvas.style, {
				left : 0,
				top : 0,
				position : 'absolute',
			});
			let resize = e => {
				thiz.canvas.width = window.innerWidth;
				thiz.canvas.height = window.innerHeight;
				thiz.resize();
			};
			window.addEventListener('resize', resize);
			//also call resize after init is done
			setTimeout(resize, 0);
		}
		if (this.canvas === undefined) throw 'expected canvas or fullscreen';

		let canvasArgs = args.canvasArgs;
		if (canvasArgs === undefined) canvasArgs = {};

		/*
		this is supposed to save me from having to write 1's in the dest alpha channel
		to keep the dest image from being invisible
		but it is buggy in firefox and safari
		*/
		if (canvasArgs.premultipliedAlpha === undefined) canvasArgs.premultipliedAlpha = false;

		/*
		this is supposed to slow things down
		but it is also supposed to allow folks to take screenshots ...
		*/
		//args.preserveDrawingBuffer

		if (canvasArgs.alpha === undefined) canvasArgs.alpha = false;

		let gl = undefined;
		let contextName = undefined;
		for (let i = 0; i < this.webGLNames.length; i++) {
			try {
				//console.log('trying to init gl context of type', this.webGLNames[i]);
				gl = this.canvas.getContext(this.webGLNames[i], canvasArgs);
				contextName = this.webGLNames[i];
			} catch (e) {
				//console.log('failed with exception', e);
			}
			if (gl) break;
		}
		if (gl === undefined) {
			throw "Couldn't initialize WebGL =(";
		}

		if (args !== undefined && args.debug) {
			gl = WebGLDebugUtils.makeDebugContext(gl);
		}

		this.context = gl;
		// TODO there has to be a way to get the name of the context from the gl object ... right?
		this.contextName = contextName;

		//gather extensions
		gl.getExtension('OES_element_index_uint');
		gl.getExtension('OES_standard_derivatives');
		gl.getExtension('OES_texture_float');	//needed for webgl framebuffer+rgba32f
		gl.getExtension('OES_texture_float_linear');
		gl.getExtension('EXT_color_buffer_float');	//needed for webgl2 framebuffer+rgba32f

		//initialize variables based on the gl context object constants:

		//detect precision used

		this.fragmentBestPrec = 'mediump';
		this.vertexBestPrec = undefined;

		let vtxhigh = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT)
		if (vtxhigh.rangeMin !== 0 && vtxhigh.rangeMax !== 0 && vtxhigh.precision !== 0) {
			this.vertexBestPrec = 'highp';
		}
		let fraghigh = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)
		if (fraghigh.rangeMin !== 0 && fraghigh.rangeMax !== 0 && fraghigh.precision !== 0) {
			this.fragmentBestPrec = 'highp';
		}

		//set precision here once and for all if you don't want to specify it in every single Program.
		this.defaultVertexPrecision = 'best';
		this.defaultFragmentPrecision  = 'best';

		//set this / clear this for default Program shader version
		this.shaderVersion = '300 es';

		// initialize classes
		// I could have each module return a function that makes the class (dependent on gl and glutil args)
		// but that means instead of modules importing, they have to assert glutil has loaded the module already ..
		// ... or use a glutil import function
		//
		// I could have modules import gl so we know gl is first
		// but that would mean a singleton gl, so no more than 1 glutil could be present
		// I'm already doing that, so meh.
		// but in this situation I still need to be sure to always import everything through glutil and not individual classes (whcih don't hae gl initialized yet)
		//

		// do this after glutil.context is assigned
		// so that the classes can use gl
		[
			//needed here/for scenegraph by GLUtil
			['View', makeView],
			['Scene', makeScene],
			['SceneObject', makeSceneObject],

			//classes wrapping GL functionality
			['ArrayBuffer', makeArrayBuffer],
			['Attribute', makeAttribute],
			['CompressedTexture2D', makeCompressedTexture2D],
			['ElementArrayBuffer', makeElementArrayBuffer],
			['FragmentShader', makeFragmentShader],
			['Framebuffer', makeFramebuffer],
			['Geometry', makeGeometry],
			['Program', makeProgram],
			['Shader', makeShader],
			['Texture', makeTexture],
			['Texture2D', makeTexture2D],
			['TextureCube', makeTextureCube],
			['VertexShader', makeVertexShader],

			//extra helper classes
			//Font
			//Gradient
			//Kernel
			//MipmapGenerator
			//PingPong
			//UnitQuad

		].forEach(pair => {
			const [name, fn] = pair;
			thiz.import(name, fn);
		});

		//create objects:

		//camera
		this.view = new glutil.View();

		//scenegraph
		this.scene = new glutil.Scene();

		this.frames = 0;
		this.lastTime = Date.now();
	}

	// can I only await an import if it's the toplevel import statement?
	// otherwise I could do import in here
	// why doesn't await actually block ...
	import(name, fn) {
		if (this[name] !== undefined) return;
		this[name] = fn(this);
	}

	bindTextureSet(gl, texs) {
		for (let k in texs) {
			if (texs.hasOwnProperty(k)) {
				gl.activeTexture(gl.TEXTURE0 + parseInt(k));
				let tex = texs[k];
				if (tex) {	//because java can enumerate through undefined values
					gl.bindTexture(tex.target, tex.obj);
				}
			}
		}
		gl.activeTexture(gl.TEXTURE0);
	}

	unbindTextureSet(gl, texs) {
		for (let k in texs) {
			if (texs.hasOwnProperty(k)) {
				gl.activeTexture(gl.TEXTURE0 + parseInt(k));
				let tex = texs[k];
				if (tex) {	//because java can enumerate through undefined values
					gl.bindTexture(tex.target, null);
				}
			}
		}
		gl.activeTexture(gl.TEXTURE0);
	}

	draw() {
		if (this.onfps) {
			this.frames++;
			const thisTime = Date.now();
			if (thisTime - this.lastTime > 1000) {
				const fps = this.frames * 1000 / (thisTime - this.lastTime);
				if (this.onfps) this.onfps(fps);
				this.frames = 0;
				this.lastTime = thisTime;
			}
		}

		this.scene.setupMatrices();

		//TODO modular?
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);

		if (!this.scene.root.hidden) this.scene.root.draw();

		if (this.ondraw) this.ondraw();

		this.clearAlpha();
	}

	clearAlpha() {
		//work around canvas alpha crap
		this.context.colorMask(false,false,false,true);
		this.context.clear(this.context.COLOR_BUFFER_BIT);
		this.context.colorMask(true,true,true,true);
	}

	/*
	must be called manually
	 (because it makes no assumptions of what the canvas should be resized to
	  or of whether the canvas resize callback fired before or after it did)
	*/
	resize() {
		this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.updateProjection();

		//auto draw on resize?
		//flag?
		//or leave it up to the caller?
		if (this.dontDrawOnResize) return;
		this.draw();
	}

	/*
	dir = unit direction result
	xf = fraction x coordinte
	fy = fraction y coordinate
	*/
	mouseDir(dir,xf,yf) {
		//basis: [0] = right, [1] = up, [2] = backwards
		let x = vec3.create(); quatXAxis(x, this.view.angle);
		let y = vec3.create(); quatYAxis(y, this.view.angle);
		let z = vec3.create(); quatZAxis(z, this.view.angle);
		let aspectRatio = this.canvas.width / this.canvas.height;
		let mxf = xf * 2 - 1;
		let myf = 1 - yf * 2;
		let tanFovY = Math.tan(this.view.fovY * Math.PI / 360);
		let px = this.view.pos[0];
		let py = this.view.pos[1];
		let pz = this.view.pos[2];
		dir[0] = -z[0] + tanFovY * (aspectRatio * mxf * x[0] + myf * y[0]);
		dir[1] = -z[1] + tanFovY * (aspectRatio * mxf * x[1] + myf * y[1]);
		dir[2] = -z[2] + tanFovY * (aspectRatio * mxf * x[2] + myf * y[2]);
	}

	/*
	must be manually called when any view projection matrix values change:
		aspectRatio, fovY, zNear, zFar
	*/
	updateProjection() {
		let projMat = this.scene.projMat;
		let aspectRatio = this.canvas.width / this.canvas.height;
		if (this.view.ortho) {
			let fovY = this.view.fovY;
			mat4.ortho(projMat,
				-aspectRatio * fovY,
				aspectRatio * fovY,
				-fovY,
				fovY,
				this.view.zNear,
				this.view.zFar);
		} else {
			let tanFovY = Math.tan(this.view.fovY * Math.PI / 360);
			mat4.frustum(projMat,
				-aspectRatio * tanFovY * this.view.zNear,
				aspectRatio * tanFovY * this.view.zNear,
				-tanFovY * this.view.zNear,
				tanFovY * this.view.zNear,
				this.view.zNear,
				this.view.zFar);
		}
	}

	//might require preserveDrawingBuffer ...
	screenshot() {
		/* download ... as a fixed-filename that can't be given an extension ... */
		let data = this.canvas.toDataURL('image/png');
		document.location.href = data.replace('image/png', 'image/octet');
		/**/

		/* download as a specified filename (by encoding in anchor element and simulating click) * /
		let mimeType = 'image/octet';
		let filename = 'download.png';
		let data = this.canvas.toDataURL(mimeType);
window.downloadData = data;
		let blob = new Blob([data], {type: mimeType});

		let downloadAnchor = document.createElement('a');
window.downloadAnchor = downloadAnchor;
		downloadAnchor.download = filename;
		downloadAnchor.href = window.URL.createObjectURL(blob);
		downloadAnchor.textContent = 'Download Ready';

		downloadAnchor.dataset.downloadurl = [
			mimeType,
			downloadAnchor.download,
			downloadAnchor.href].join(':');
		downloadAnchor.dataset.disabled = false;

		document.body.append(downloadAnchor);

		downloadAnchor.onclick = e => {
			if ('disabled' in this.dataset) {
				return false;
			}

			downloadAnchor.textContent = '';
			downloadAnchor.dataset.disabled = true;

			// Need a small delay for the revokeObjectURL to work properly.
			setTimeout(() => {
				window.URL.revokeObjectURL(downloadAnchor.href);
				//document.body.remove(downloadAnchor);
			}, 1500);
		};

		setTimeout(function() {
			downloadAnchor.dispatchEvent(new Event('click'));
		}, 1000);
	*/
	}
}

//helpful function with generating GLSL code
GLUtil.prototype.tonumber = function(x) {
	x = ''+x;
	if (x.indexOf('.') == -1) x = x + '.';
	return x;
};

// https://stackoverflow.com/a/32633586
GLUtil.prototype.toHalf = (function(){
	let floatView = new Float32Array(1);
	let int32View = new Int32Array(floatView.buffer);
	return function(fval) {
		floatView[0] = fval;
		let fbits = int32View[0];
		let sign = (fbits >> 16) & 0x8000;					// sign only
		let val = (fbits & 0x7fffffff) + 0x1000;			// rounded value

		if (val >= 0x47800000) {							// might be or become NaN/Inf
			if ((fbits & 0x7fffffff) >= 0x47800000) {
															// is or must become NaN/Inf
			if (val < 0x7f800000) {						// was value but too large
				return sign | 0x7c00;						// make it +/-Inf
			}
			return sign | 0x7c00 |							// remains +/-Inf or NaN
				(fbits & 0x007fffff) >> 13;				// keep NaN (and Inf) bits
			}
			return sign | 0x7bff;							// unrounded not quite Inf
		}
		if (val >= 0x38800000) {							// remains normalized value
			return sign | val - 0x38000000 >> 13;			// exp - 127 + 15
		}
		if (val < 0x33000000) {							// too small for subnormal
			return sign;									// becomes +/-0
		}
		val = (fbits & 0x7fffffff) >> 23;					// tmp exp for subnormal calc
		return sign | ((fbits & 0x7fffff | 0x800000)		// add subnormal bit
			+ (0x800000 >>> val - 102)					// round depending on cut off
			>> 126 - val);									// div by 2^(1-(exp-127+15)) and >> 13 | exp=0
	}
})();

export { GLUtil };
