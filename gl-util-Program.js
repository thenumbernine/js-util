import {assert, assertExists} from '/js/util.js';
import {makeArrayBuffer} from './gl-util-ArrayBuffer.js';
import {makeVertexShader} from './gl-util-VertexShader.js';
import {makeFragmentShader} from './gl-util-FragmentShader.js';
function makeProgram(glutil) {
const gl = glutil.context;
glutil.import('ArrayBuffer', makeArrayBuffer);
glutil.import('VertexShader', makeVertexShader);
glutil.import('FragmentShader', makeFragmentShader);
class Program {
	/*
	args:
			one of the following:
		vertexShader = the VertexShader object to link with
		vertexCode = the vertex shader code
		vertexCodeID = the id of the DOM element containing the vertex shader code
			one of the following:
		fragmentShader = the FragmentShader object to link with
		fragmentCode = the fragment shader code
		fragmentCodeID = the id of the DOM element containing the fragment shader code
			and any of the following:
		vertexPrecision = set to 'best' for generating the best possible precision
		fragmentPrecision = set to 'best' for generating the best possible precision
		version = which glsl version to use.  default is whatever is specified in glutil.shaderVersion.
		uniforms = a key-value map containing initial values of any uniforms
	*/
	constructor(args) {
		let thiz = this;
	
		//first look in args
		let shaderVersion = args.shaderVersion;
		//if not there, look in glutil
		if (shaderVersion === undefined) {
			shaderVersion = glutil.shaderVersion;
		}
		// if any exist then convert it to a pragma line
		if (shaderVersion !== undefined) {
			shaderVersion = '#version '+shaderVersion+'\n';
		}

		const prepareCode = (type, code, id, reqPrec, defaultBestPrec) => {
			if (id !== undefined) {
				if (code !== undefined) {
					console.log("!!! got both code and id ... which should I use, and in which order?");
				} else {
					code = '';
				}
				const dom = document.getElementById(id);
				if (dom) {
					code += dom.innerText;
				}
			}
			assert(code !== undefined, "expected either a shader or code for "+type);
			//if precision == 'best' then set it to the detected best
			if (reqPrec === 'best') {
				reqPrec = defaultBestPrec;
			}
			// put precision above all statements
			if (reqPrec !== undefined) {
				code = 'precision '+reqPrec+' float;\n'
					+ code;
			}
			// put #version on first line
			if (shaderVersion !== undefined) {
				code = shaderVersion + code;
			}
			return code;
		};

		this.vertexShader = args.vertexShader;
		if (this.vertexShader === undefined) {
			this.vertexShader = new glutil.VertexShader({
				code : prepareCode(
					'vertex',
					args.vertexCode,
					args.vertexCodeID,
					args.vertexPrecision || glutil.defaultFragmentPrecision,
					glutil.vertexBestPrec),
			});
		}
		if (!this.vertexShader) throw "expected vertexShader or vertexCode or vertexCodeID";

		this.fragmentShader = args.fragmentShader;
		if (this.fragmentShader === undefined) {
			this.fragmentShader = new glutil.FragmentShader({
				code : prepareCode(
					'fragment',
					args.fragmentCode,
					args.fragmentCodeID,
					args.fragmentPrecision || glutil.defaultVertexPrecision,
					glutil.fragmentBestPrec),
			});
		}
		if (!this.fragmentShader) throw "expected fragmentShader or fragmentCode or fragmentCodeID";

		this.obj = gl.createProgram();
		gl.attachShader(this.obj, this.vertexShader.obj);
		gl.attachShader(this.obj, this.fragmentShader.obj);
		
		gl.linkProgram(this.obj);
		if (!gl.getProgramParameter(this.obj, gl.LINK_STATUS)) {
			//throw 'Link Error: '+gl.getShaderInfoLog(this.obj);	
			console.log('vertex code:');
			(args.vertexCode || $('#'+args.vertexCodeID).text()).split('\n').forEach((line,i) => {
				console.log((i+1)+': '+line);
			});
			console.log('fragment code:');
			(args.fragmentCode || $('#'+args.fragmentCodeID).text()).split('\n').forEach((line,i) => {
				console.log((i+1)+': '+line);
			});
			throw "Could not initialize shaders";
		}
		
		gl.useProgram(this.obj);
		
		this.uniforms = {};
		let maxUniforms = gl.getProgramParameter(this.obj, gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < maxUniforms; i++) {
			let info = gl.getActiveUniform(this.obj, i);
			info.loc = gl.getUniformLocation(this.obj, info.name);
			info.setters = this.getUniformSettersForGLType(gl, info.type);
			this.uniforms[i] = info;
			this.uniforms[info.name] = info;
		}

		this.attrs = {};
		let maxAttrs = gl.getProgramParameter(this.obj, gl.ACTIVE_ATTRIBUTES);
		for (let i = 0; i < maxAttrs; i++) {
			let info = gl.getActiveAttrib(this.obj, i);
			info.loc = gl.getAttribLocation(this.obj, info.name);
			this.attrs[info.name] = info;
		}

		if (args.uniforms !== undefined) {
			this.setUniforms(args.uniforms);
		}

		gl.useProgram(null);
	}
	
	//returns an array of gl.uniform* functions to use with this uniform: 
	//0: used when multiple primitive values are passed
	//1: used when an array is passed
	//2: used when an array is passed as a matrix
	getUniformSettersForGLType(gl, gltype) {
		switch (gltype) {
		case gl.FLOAT: 
			return {arg:gl.uniform1f, count:1};
		case gl.INT:
		case gl.BOOL:
		case gl.SAMPLER_2D:
		case gl.SAMPLER_CUBE: 
			return {arg:gl.uniform1i, count:1};
		case gl.FLOAT_VEC2: 
			return {arg:gl.uniform2f, count:2, vec:gl.uniform2fv};
		case gl.INT_VEC2:
		case gl.BOOL_VEC2:
			return {arg:gl.uniform2i, count:2, vec:gl.uniform2iv};
		case gl.FLOAT_VEC3: 
			return {arg:gl.uniform3f, count:3, vec:gl.uniform3fv};
		case gl.INT_VEC3:
		case gl.BOOL_VEC3:
			return {arg:gl.uniform3i, count:3, vec:gl.uniform3iv};
		case gl.FLOAT_VEC4: 
			return {arg:gl.uniform4f, count:4, vec:gl.uniform4fv};
		case gl.INT_VEC4:
		case gl.BOOL_VEC4:
			return {arg:gl.uniform4i, count:4, vec:gl.uniform4iv};
		case gl.FLOAT_MAT2:
			return {mat:gl.uniformMatrix2fv};
		case gl.FLOAT_MAT3:
			return {mat:gl.uniformMatrix3fv};
		case gl.FLOAT_MAT4:
			return {mat:gl.uniformMatrix4fv};
		}
	}

	use() {
		gl.useProgram(this.obj);
		return this;
	}
	useNone() {
		gl.useProgram(null);
		return this;
	}
	setUniforms(uniforms) {
		for (let k in uniforms) {
			this.setUniform(k, uniforms[k]);
		}
		return this;
	}
	/*
	type-detecting uniform setting
	currenly only handles unpacked arguments
	and currently calls everything through uniformf
	*/
	setUniform(...args) {
		let name = args[0];
		let info = this.uniforms[name];
		if (info === undefined) return;	//throw?  but if a uniform isn't used it'll be removed, and its info will return null ... is this an error?
		let value = args[1];
		let isArray = typeof(value) == 'object';	//$.isArray(value);
		let setters = info.setters;
		let loc = info.loc;
		if (!isArray) {
			let setter = setters.arg;
			if (!setter) throw "failed to find non-array setter for uniform "+name;
			args[0] = loc;
			if (args.length < setters.count) {
				throw 'setUniform('+name+') needed '+setters.count+' args';
			}
			setter.apply(gl, args);
		} else {
			if (setters.vec) {
				setters.vec.call(gl, loc, value);
			} else if (setters.mat) {
				setters.mat.call(gl, loc, false, value);
			} else {
				throw "failed to find array setter for uniform "+name;
			}
		}
	}
	setAttrs(attrs) {
		for (let k in attrs) {
			this.setAttr(k, attrs[k]);
		}
	}
	setAttr(name, buffer) {
		let info = this.attrs[name];
		if (info === undefined) return;
		gl.enableVertexAttribArray(info.loc);
		// array buffer object, assume packed
		if (buffer instanceof glutil.ArrayBuffer) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.obj);
			gl.vertexAttribPointer(info.loc, buffer.dim, gl.FLOAT, false, 0, 0);
		//table object, try to derive values
		} else {
			let attrInfo = buffer;
			buffer = assertExists(attrInfo, 'buffer');
			let size = attrInfo.size !== undefined ? attrInfo.size : buffer.dim;
			//TODO make underlying type modular, and store as a parameter of the buffer
			let type = gl.FLOAT;
			let normalized = attrInfo.normalized !== undefined ? attrInfo.normalized : false;
			let offset = attrInfo.offset !== undefined ? attrInfo.offset : 0;
			let stride = attrInfo.stride !== undefined ? attrInfo.stride : 0;
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.obj);
			gl.vertexAttribPointer(info.loc, size, type, normalized, stride, offset);
		}
	}
	removeAttrs(attrs) {
		for (let k in attrs) {
			this.removeAttr(k);
		}
	}
	removeAttr(name) {
		let info = this.attrs[name];
		if (info === undefined) return;
		gl.disableVertexAttribArray(info.loc);
	}
}
return Program;
}
export { makeProgram };
