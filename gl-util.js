/*
allowed to manipulate:
	root
	oninit
user-provided arguments:
	onfps
	ondraw
*/
GL = new function() { 
	var GL = this;	//for internal access
	var gl;
	var wrapMap;

	//view object, for matrix deduction
	this.view = {
		zNear : 1,
		zFar : 2000,
		fovY : 90,	// corresponding with 1:1 x:z
		ortho : false,
		pos : vec3.create(),
		angle : quat.create()
	};

	//traditional gl matrices
	this.projMat = mat4.create();
	this.mvMat = mat4.create();

	//on-init callbacks.  useful for initializing modules with this.
	this.oninit = [];

	this.init = function(canvas, args) {
		//get gl context
		GL.canvas = canvas;

		var webGLNames = ['webgl', 'experimental-webgl'];
		for (var i = 0; i < webGLNames.length; i++) {
			try {
				gl = canvas.getContext(webGLNames[i], {
					//this is supposed to save me from having to write 1's in the dest alpha channel
					//to keep the dest image from being invisible
					//but it is buggy in firefox and safari
					premultipliedAlpha : false,
					alpha : false
				});
			} catch (e) {}
			if (gl) break;
		}
		if (!gl) {
			throw "Couldn't initialize WebGL =(";
		}
	
		if (args && args.debug) {
			gl = WebGLDebugUtils.makeDebugContext(gl);	
		}

		GL.gl = gl;	
	
		//gather extensions
		gl.getExtension('OES_texture_float');

		$.each(gl.getSupportedExtensions(), function(_,ext){
			console.log(ext);
		});

		//now that gl exists, add all those function prototypes that needed it ...
		
		GL.VertexShader.prototype.shaderType = gl.VERTEX_SHADER;
		GL.FragmentShader.prototype.shaderType = gl.FRAGMENT_SHADER;
		GL.Texture2D.prototype.target = gl.TEXTURE_2D;
		GL.TextureCube.prototype.target = gl.TEXTURE_CUBE_MAP;

		wrapMap = {
			s : gl.TEXTURE_WRAP_S,
			t : gl.TEXTURE_WRAP_T
		};

		//do some common gl inits
		//remove these as seen fit
	
		gl.clearColor(0,0,0,1);
	
		$.each(GL.oninit, function(k,v) {
			v.call(GL, gl);
		});

		return gl;
	}

	/*
	must be manually called when any view projection matrix values change:
		aspectRatio, fovY, zNear, zFar
	*/
	this.updateProjection = function() {
		var aspectRatio = GL.canvas.width / GL.canvas.height;
		if (GL.view.ortho) {
			var fovY = GL.view.fovY;
			mat4.ortho(GL.projMat,
				-aspectRatio * fovY,
				aspectRatio * fovY,
				-fovY,
				fovY,
				GL.view.zNear,
				GL.view.zFar);
		} else {
			var tanFovY = Math.tan(GL.view.fovY * Math.PI / 360);
			mat4.frustum(GL.projMat, 
				-aspectRatio * tanFovY * GL.view.zNear, 
				aspectRatio * tanFovY * GL.view.zNear, 
				-tanFovY * GL.view.zNear, 
				tanFovY * GL.view.zNear, 
				GL.view.zNear, 
				GL.view.zFar);
		}
	};

	/*
	must be called manually 
	 (because it makes no assumptions of what the canvas should be resized to
	  or of whether the canvas resize callback fired before or after it did)
	*/
	this.resize = function() {
		gl.viewport(0, 0, GL.canvas.width, GL.canvas.height);
		this.updateProjection();
		//auto draw on resize?
		//flag?
		//or leave it up to the caller?
		GL.draw();
	};

	/*
	args:
			use one of the following:
		code = shader code
		id = the id of the DOM element containing the shader code
	*/
	var Shader = function(args) {
		var code;
		if (args.id) {
			var src = $('#'+args.id);
			//assert(src.attr('type') == this.domType);
			code = src.text();
		}
		if (args.code) {
			code = args.code;
		}
		if (!code) throw "expected code or id";

		this.obj = gl.createShader(this.shaderType);
		gl.shaderSource(this.obj, code);
		gl.compileShader(this.obj);
		if (!gl.getShaderParameter(this.obj, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(this.obj);
	}
	this.Shader = Shader;

	var VertexShader = function(args) {
		Shader.call(this, args);
	}
	VertexShader.prototype = {
		//shaderType provided upon init 
		domType : 'x-shader/x-vertex'
	};
	this.VertexShader = VertexShader;

	var FragmentShader = function(args) {
		Shader.call(this, args);
	}
	FragmentShader.prototype = {
		//shaderType provided upon init 
		domType : 'x-shader/x-fragment'
	};
	this.FragmentShader = FragmentShader;

	//returns an array of gl.uniform* functions to use with this uniform: 
	//0: used when multiple primitive values are passed
	//1: used when an array is passed
	//2: used when an array is passed as a matrix
	var getUniformSettersForGLType = function(gltype) {
		switch (gltype) {
		case gl.FLOAT: 
			return [gl.uniform1f, null];
		case gl.INT:
		case gl.BOOL:
		case gl.SAMPLER_2D:
		case gl.SAMPLER_CUBE: 
			return [gl.uniform1i, null];
		case gl.FLOAT_VEC2: 
			return [gl.uniform2f, gl.uniform2fv];
		case gl.INT_VEC2:
		case gl.BOOL_VEC2:
			return [gl.uniform2i, gl.uniform2iv];
		case gl.FLOAT_VEC3: 
			return [gl.uniform3f, gl.uniform3fv];
		case gl.INT_VEC3:
		case gl.BOOL_VEC3:
			return [gl.uniform3i, gl.uniform3iv];
		case gl.FLOAT_VEC4: 
			return [gl.uniform4f, gl.uniform4fv];
		case gl.INT_VEC4:
		case gl.BOOL_VEC4:
			return [gl.uniform4i, gl.uniform4iv];
		case gl.FLOAT_MAT2:
			return [null, null, gl.uniformMatrix2fv];
		case gl.FLOAT_MAT3:
			return [null, null, gl.uniformMatrix3fv];
		case gl.FLOAT_MAT4:
			return [null, null, gl.uniformMatrix4fv];
		}
	}

	/*
	args:
			one of the following:
		vertexShader = the VertexShader object to link with
		vertexCode = the vertex shader code
		vertexCodeID = the id of the DOM element containing the vertex shader code
			one of the following:
		fragmentShader = the VertexShader object to link with
		fragmentCode = the fragment shader code
		fragmentCodeID = the id of the DOM element containing the fragment shader code
			and any of the following:
		uniforms = a key-value map containing initial values of any uniforms
	*/
	var ShaderProgram = function(args) {
		var thiz = this;
		this.vertexShader = args.vertexShader;
		if (!this.vertexShader) this.vertexShader = new VertexShader({id:args.vertexCodeID, code:args.vertexCode});
		if (!this.vertexShader) throw "expected vertexShader or vertexCode or vertexCodeID";

		this.fragmentShader = args.fragmentShader;
		if (!this.fragmentShader) this.fragmentShader = new FragmentShader({id:args.fragmentCodeID, code:args.fragmentCode});
		if (!this.fragmentShader) throw "expected fragmentShader or fragmentCode or fragmentCodeID";

		this.obj = gl.createProgram();
		gl.attachShader(this.obj, this.vertexShader.obj);
		gl.attachShader(this.obj, this.fragmentShader.obj);
		
		gl.linkProgram(this.obj);
		if (!gl.getProgramParameter(this.obj, gl.LINK_STATUS)) {
			throw "Could not initialize shaders";
		}
		
		gl.useProgram(this.obj);
		
		this.uniforms = {};
		var maxUniforms = gl.getProgramParameter(this.obj, gl.ACTIVE_UNIFORMS);
		for (var i = 0; i < maxUniforms; i++) {
			var info = gl.getActiveUniform(this.obj, i);
			info.loc = gl.getUniformLocation(this.obj, info.name);
			info.setters = getUniformSettersForGLType(info.type);
			this.uniforms[i] = info;
			this.uniforms[info.name] = info;
		}

		this.attrs = {};
		var maxAttrs = gl.getProgramParameter(this.obj, gl.ACTIVE_ATTRIBUTES);
		for (var i = 0; i < maxAttrs; i++) {
			var info = gl.getActiveAttrib(this.obj, i);
			info.loc = gl.getAttribLocation(this.obj, info.name);
			this.attrs[info.name] = info;
		}

		if (args.uniforms) {
			this.setUniforms(args.uniforms);
		}

		gl.useProgram(null);
	}
	ShaderProgram.prototype = {
		setUniforms : function(uniforms) {
			for (k in uniforms) {
				this.setUniform(k, uniforms[k]);
			}
		},
		/*
		type-detecting uniform setting
		currenly only handles unpacked arguments
		and currently calls everything through uniformf
		*/
		setUniform : function() {
			var name = arguments[0];
			var info = this.uniforms[name];
			if (!info) return;	//throw?  but if a uniform isn't used it'll be removed, and its info will return null ... is this an error?
			var value = arguments[1];
			var isArray = typeof(value) == 'object';	//$.isArray(value);
			var setters = info.setters;
			var loc = info.loc;
			if (!isArray) {
				var setter = setters[0];
				if (!setter) throw "failed to find non-array setter for uniform "+name;
				Array.prototype.splice.call(arguments, 0, 1, loc);
				setter.apply(gl, arguments);
			} else {
				if (setters[1]) {
					setters[1].call(gl, loc, value);
				} else if (setters[2]) {
					setters[2].call(gl, loc, false, value);
				} else {
					throw "failed to find array setter for uniform "+name;
				}
			}
		},
		setAttrs : function(attrs) {
			for (k in attrs) {
				this.setAttr(k, attrs[k]);
			}
		},
		setAttr : function(name, buffer) {
			var info = this.attrs[name];
			if (info === undefined) return;
			gl.enableVertexAttribArray(info.loc);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.obj);
			gl.vertexAttribPointer(info.loc, buffer.dim, gl.FLOAT, false, 0, 0);
		},
		removeAttrs : function(attrs) {
			for (k in attrs) {
				this.removeAttr(k);
			}
		},
		removeAttr : function(attr) {
			var info = this.attrs[name];
			if (info === undefined) return;
			gl.disableVertexAttribArray(info.loc);
		}
	};
	this.ShaderProgram = ShaderProgram;

	var Texture = function(args) {
		this.obj = gl.createTexture();
		gl.bindTexture(this.target, this.obj);
		if (args !== undefined) this.setArgs(args);
		gl.bindTexture(this.target, null);
	};
	Texture.prototype = {
		//target provided upon init 
		bind : function(unit) { 
			if (unit !== undefined) gl.activeTexture(gl.TEXTURE0 + unit);
			gl.bindTexture(this.target, this.obj);
		},
		unbind : function(unit) { 
			if (unit !== undefined) gl.activeTexture(gl.TEXTURE0 + unit);
			gl.bindTexture(this.target, null); 
		},
		/*
		args:
			flipY: use UNPACK_FLIP_Y_WEBGL
			dontPremultiplyAlpha: don't use UNPACK_PREMULTIPLY_ALPHA_WEBGL
			magFilter: texParameter TEXTURE_MAG_FILTER
			minFilter: texParameter TEXTURE_MIN_FILTER
			generateMipmap: specifies to call generateMipmap after loading the texture data
			url: url of image to load
			onload: any onload callback to be used with url
		*/
		setArgs : function(args) {
			var target = this.target;
			if (args.flipY) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			if (!args.dontPremultiplyAlpha) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
			if (args.magFilter) gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, args.magFilter);
			if (args.minFilter) gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, args.minFilter);
			if (args.wrap) {
				for (var k in args.wrap) {
					gl.texParameteri(this.target, wrapMap[k] || k, args.wrap[k]);
				}
			}
			this.setData(args);
		},
		//typically overwritten. default calls setImage if args.data is provided
		setData : function(args) {
			if (args.data) {
				this.setImage(args);
			}
		}
	};
	GL.Texture = Texture;

	//args match Texture2D.setArgs
	var Texture2D = function(args) {
		Texture.call(this, args);
	};
	Texture2D.prototype = mergeInto({
		setData : function(args) {
			if (args.url) {
				var image = new Image();
				var thiz = this;
				image.onload = function() {
					args.data = image;
					gl.bindTexture(thiz.target, thiz.obj);
					thiz.setImage(args);
					gl.bindTexture(thiz.target, null);
					
					if (args.onload) args.onload.call(thiz);
				};
				image.src = args.url;
			} else {
				if (args.data === undefined) args.data = null;
				this.setImage(args);
			}
		},
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
		setImage : function(args) {
			var target = args.target !== undefined ? args.target : this.target;
			var level = args.level !== undefined ? args.level : 0;
			var internalFormat = args.internalFormat !== undefined ? args.internalFormat : gl.RGBA;
			var format = args.format !== undefined ? args.format : gl.RGBA;
			var type = args.type !== undefined ? args.type : gl.UNSIGNED_BYTE;
			var width = args.width;
			var height = args.height;
			var border = args.border !== undefined ? args.border : 0;
			//NOTICE this method only works for ArrayBufferView.  maybe that should be my test
			if (width === undefined && height === undefined) {
				gl.texImage2D(target, level, internalFormat, format, type, args.data);
			} else {
				if (typeof(args.data) != 'function') {
					gl.texImage2D(target, level, internalFormat, width, height, border, format, type, args.data);
				} else {
					//builtin procedural generation
					var i = 0;
					var data = new Uint8Array(width * height * 4);
					format = gl.RGBA;
					type = gl.UNSIGNED_BYTE;	//though floats would be nice ...
					for (var y = 0; y < height; ++y) {
						for (var x = 0; x < width; ++x) {
							var c = args.data(x,y);
							for (var ch = 0; ch < 4; ++ch) {
								data[i] = c[ch] * 255;
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
	}, Texture.prototype);
	this.Texture2D = Texture2D;
	var TextureCube = function(args) {
		Texture.call(this, args);
	};
	TextureCube.prototype = mergeInto({
		setArgs : function(args) {
			Texture.prototype.setArgs.call(this, args);
			if (args.urls) {
				var thiz = this;
				$.each(args.urls, function(side,url) {
					var image = new Image();
					image.onload = function() {
						args.data = image;
						args.target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + side;
						gl.bindTexture(thiz.target, thiz.obj);
						Texture2D.prototype.setImage.call(thiz, args);
						gl.bindTexture(thiz.target, null);
					
						if (args.onload) args.onload.call(thiz,side,url);
					};
					image.src = url;
				});
			} 
		},
		setData : function(args) {
			if (args.data === undefined) return;
	
			gl.bindTexture(this.target, this.obj);
			var isArray = typeof(args.data) == 'object';	//$.isArray(value);
			if (isArray && args.data.length >= 6) {
				var srcdata = args.data;
				for (var side = 0; side < 6; ++side) {
					args.data = srcdata[side];
					args.target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + side;
					Texture2D.prototype.setImage.call(this, args);
				}
			} else if (typeof(args.data) == 'function') {
				var srcdata = args.data;
				for (var side = 0; side < 6; ++side) {
					args.data = function(x,y) {
						return srcdata(x,y,side);
					};
					args.target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + side;
					Texture2D.prototype.setImage.call(this, args);
				}
			}
			gl.bindTexture(this.target, null);
	
		}
	
	}, Texture.prototype);
	this.TextureCube = TextureCube;

	/*
	args:
		data = either a Float32Array object, or a constructor for a Float32Array object
		usage = gl.bufferData usage
		dim = dimension / # elements per vector in data. only used for attrs and calculating length. default 3
	*/
	var ArrayBuffer = function(args) {
		if (args === undefined) args = {};
		this.obj = gl.createBuffer();
		this.dim = args.dim !== undefined ? args.dim : 3;
		this.setData(args.data, args.usage || gl.STATIC_DRAW);
	};
	ArrayBuffer.prototype = {
		setData : function(data, usage) {
			if (data.constructor != Float32Array) {
				data = new Float32Array(data);
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, this.obj);
			gl.bufferData(gl.ARRAY_BUFFER, data, usage);
			this.count = data.length / this.dim;
		},
		updateData : function(data, offset) {
			if (offset === undefined) offset = 0;
			if (data.constructor != Float32Array) {
				data = new Float32Array(data);
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, this.obj);
			gl.bufferSubData(gl.ARRAY_BUFFER, offset, data);
		}
	};
	this.ArrayBuffer = ArrayBuffer;
	/*
	args:
		data = either a Float32Array object, or a constructor for a Float32Array object
	*/
	var ElementArrayBuffer = function(args) {
		if (args === undefined) args = {};
		this.obj = gl.createBuffer();
		this.setData(args.data, args.usage || gl.STATIC_DRAW);
	};
	ElementArrayBuffer.prototype = {
		setData : function(data, usage) {
			if (data.constructor != Uint16Array) {
				data = new Uint16Array(data);
			}
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.obj);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, usage);
			this.count = data.length;
		},
		updateData : function(data, offset) {
			if (offset === undefined) offset = 0;
			if (data.constructor != Uint16Array) {
				data = new Uint16Array(data);
			}
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.obj);
			gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, offset, data);
		}
	};
	this.ElementArrayBuffer = ElementArrayBuffer;

	/*
	args:
		width : framebuffer width.  required with depth.
		height : framebuffer height.  required with depth.
		useDepth : set to create a depth renderbuffer for this framebuffer.
	*/
	var Framebuffer = function(args) {
		this.width = args !== undefined ? args.width : undefined;
		this.height = args !== undefined ? args.height : undefined;
		this.obj = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.obj);
		if (args !== undefined && args.useDepth) {
			this.depthObj = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthObj);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT, this.width, this.height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, 0);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthObj);
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	};
	Framebuffer.prototype = {
		bind : function() {
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.obj);
		},
		unbind : function() {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		},
		fboErrors : [
			'FRAMEBUFFER_INCOMPLETE_ATTACHMENT',
			'FRAMEBUFFER_INCOMPLETE_DIMENSIONS',
			'FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER',
			'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT'
		],
		check : function() {
			var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
			if (status != gl.FRAMEBUFFER_COMPLETE) {
				var errstr = 'glCheckFramebufferStatus status=' + status;
				$.each(this.fboErrors, function(i,fboError) {
					if (gl[fboError] == status) {
						errstr += ' error=' + fboError;
						return true;	//break;
					}
				});
				throw errstr;
			}
		},
		setColorAttachmentTex2D : function(index, tex, target, level) {
			if (level === undefined) level = 0;
			this.bind();
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, target || gl.TEXTURE_2D, tex, level);
			this.unbind();
		},
		setColorAttachmentTexCubeMapSide : function(index, tex, side, level) {
			if (side === undefined) side = index;
			if (level === undefined) level = 0;
			this.bind();
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_CUBE_MAP_POSITIVE_X + side, tex, level);
			this.unbind();
		},
/* WebGL only supports one color attachment at a time ...
		setColorAttachmentTexCubeMap : function(tex, level) {
			this.bind();
			for (var i = 0; i < 6; i++) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, tex, level || 0);
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
		setColorAttachment : function(index, tex) {
			if (typeof(tex) == 'object') {
				if (tex.__proto__ == Texture2D.prototype) {
					//javascript splice won't work, so array-clone it first or whatever needs to be done
					this.setColorAttachmentTex2D(index, tex.obj, arguments.splice(2));
				// cube map? side or all at once?
				//elseif mt == Tex3D then
				//	self:setColorAttachmentTex3D(index, tex.id, ...)
				} else {
					throw "Can't deduce how to attach the object.  Try using an explicit attachment method";
				}
			} else if (typeof(tex) == 'number') {
				this.setColorAttachmentTex2D.apply(this, arguments);	// though this could be a 3d slice or a cube side...
			} else {
				throw "Can't deduce how to attach the object.  Try using an explicit attachment method";
			}
		},
		
		/*
		if index is a number then it binds the associated color attachment at 'GL_COLOR_ATTACHMENT0+index' and runs the callback
		if index is a table then it runs through the ipairs,
			binding the associated color attachment at 'GL_COLOR_ATTACHMENT0+index[side]'
			and running the callback for each, passing the side as a parameter
		*/
		drawToCallback : function(index, callback) {
			this.bind();

			this.check();

			//no need to preserve the previous draw buffer in webgl
			//simply binding a framebuffer changes the render target to it
			//var drawbuffer = gl.getParameter(gl.DRAW_BUFFER);
			if (typeof(index)=='number') {
				gl.drawBuffer(gl.COLOR_ATTACHMENT0 + index);
				callback();
			} else if (typeof(index)=='object') {
				// TODO - table attachments should probably make use of glDrawBuffers for multiple draw to's
				// cubemaps should go through the tedious-but-readable chore of calling this method six times
				$.each(index, function(side, colorAttachment) {
					gl.drawBuffer(gl.COLOR_ATTACHMENT0 + colorAttachment);	//index[side])
					callback(side);
				});
			}
			//gl.drawBuffer(drawbuffer);

			this.unbind();
		},

		draw : function(args) {
			var oldvp;
			if (args.viewport) {
				var vp = args.viewport;
				var oldvp = gl.getParameter(gl.VIEWPORT);
				gl.viewport.apply(gl, args.viewport);
			}
			//if (args.resetProjection) throw 'not supported in webgl';
			if (args.shader) {
				gl.useProgram(args.shader.obj);
				if (args.uniforms) {
					if (args.uniforms) {
						args.shader.setUniforms(args.uniforms);
					}
				}
			}
			if (args.texs) bindTextureSet(args.texs);

			//if (args.color) throw 'color not supported in webgl';
			//if (args.dest) throw 'multiple color attachments not supported in webgl';
			
			// no one seems to use fbo:draw... at all...
			// so why preserve a function that no one uses?
			// why not just merge it in here?
			this.drawToCallback(args.colorAttachment || 0, args.callback/* || drawScreenQuad*/);
			
			if (args.texs) unbindTextureSet(args.texs);
			if (args.shader) {
				gl.useProgram(null);
			}

			if (args.viewport) {
				gl.viewport.apply(gl, oldvp);
			}
		}
	};
	this.Framebuffer = Framebuffer;

	var bindTextureSet = function(texs) {
		for (var k in texs) {
			if (texs.hasOwnProperty(k)) {
				gl.activeTexture(gl.TEXTURE0 + parseInt(k));
				var tex = texs[k];
				if (tex) {	//because java can enumerate through undefined values
					gl.bindTexture(tex.target, tex.obj);
				}
			}
		}
		gl.activeTexture(gl.TEXTURE0);
	};
	var unbindTextureSet = function(texs) {
		for (var k in texs) {
			if (texs.hasOwnProperty(k)) {
				gl.activeTexture(gl.TEXTURE0 + parseInt(k));
				var tex = texs[k];
				if (tex) {	//because java can enumerate through undefined values
					gl.bindTexture(tex.target, null);
				}
			}
		}
		gl.activeTexture(gl.TEXTURE0);
	};

	/*
	args:
		mode
		count
		shader
		uniforms
		attrs
		texs
		blend
		useDepth
		vertexBuffer: override for count and attrs.vtx 
		indexBuffer	
	*/
	var SceneObject = function(args) {
		if (args) {
			this.shader = args.shader;
			this.uniforms = args.uniforms;
			this.attrs = args.attrs;
			this.mode = args.mode;
			this.count = args.count;
			this.texs = args.texs;
			this.blend = args.blend;
			this.useDepth = args.useDepth;

			this.indexBuffer = args.indexBuffer;

			this.vertexBuffer = args.vertexBuffer;
			if (this.vertexBuffer !== undefined) {
				if (this.attrs === undefined) {
					this.attrs = {};
				}
				this.attrs.vtx = this.vertexBuffer;
			}
			
			if ('static' in args) this.static = args.static;
			if (args.pos) {
				this.pos = vec3.clone(args.pos);
				this.static = false;
			}
			if (args.angle) {
				this.angle = quat.clone(args.angle);
				this.static = false;
			}
		}

		if (!this.static) {
			if (this.pos === undefined) {
				this.pos = vec3.create();
			}

			if (this.angle === undefined) {
				this.angle = quat.create();
			}
		}
	
		this.children = [];
		
		if (args && args.parent) {
			this.parent = args.parent;
		} else {
			this.parent = GL.root;
		}
		if (this.parent !== undefined) {
			this.parent.children.push(this);
		}

		if (this.static) {
			if (this.parent) {
				this.targetMat = this.parent.targetMat;
			} else {
				this.targetMat = GL.mvMat;
			}
		} else {
			this.localMat = mat4.create();
			this.mvMat = mat4.create();
			this.targetMat = this.mvMat;
		}
	
		//default uniforms?
		// don't create & use these if no pos & angle is provided?
		if (this.shader)
		{
			if (!this.uniforms) this.uniforms = {};
			if (this.uniforms.projMat === undefined) this.uniforms.projMat = GL.projMat;
			if (this.uniforms.mvMat === undefined) this.uniforms.mvMat = this.targetMat;
		}
	}
	SceneObject.prototype = {
		static : true,
		/*
		args:
			shader
			uniforms
			attrs
		*/
		draw : function(args) {
		
			//TODO make matrix stuff optional?
			if (!this.static) {
				mat4.fromRotationTranslation(this.localMat, this.angle, this.pos);
				if (this.parent !== undefined) {
					mat4.multiply(this.mvMat, this.parent.targetMat, this.localMat);
				} else {
					mat4.multiply(this.mvMat, GL.mvMat, this.localMat);
				}
			}

			//TODO push attrib anyone?
			
			if (this.blend) {
				gl.blendFunc.apply(gl, this.blend);
				gl.enable(gl.BLEND);
			}

			if (this.useDepth === true) {
				gl.enable(gl.DEPTH_TEST);
			} else if (this.useDepth === false) {
				gl.disable(gl.DEPTH_TEST);
			}

			if (this.texs) bindTextureSet(this.texs);
			if (args && args.texs) bindTextureSet(args.texs);

			var shader = this.shader;
			if (args && args.shader) shader = args.shader;
			
			if (shader) {
				gl.useProgram(shader.obj);

				if (this.uniforms) shader.setUniforms(this.uniforms);
				if (args && args.uniforms) shader.setUniforms(args.uniforms);
				
				if (this.attrs) shader.setAttrs(this.attrs);
				if (args && args.attrs) shader.setAttrs(args.attrs);
			}
			
			var count = this.count;
			if (this.indexBuffer !== undefined) {
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.obj);
				if (count === undefined) {
					count = this.indexBuffer.count;
				}
				gl.drawElements(this.mode, count, gl.UNSIGNED_SHORT, 0);
			} else {
				if (count === undefined && this.vertexBuffer !== undefined) {
					count = this.vertexBuffer.count;
				}
				gl.drawArrays(this.mode, 0, count);
			}
			//nest within state & shader binding so children can inherit
			// they can also screw up state, mind you
			for (var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				if (!child.hidden) {
					child.draw();
				}
			}

			if (shader) {
				if (this.attrs) shader.removeAttrs(this.attrs);
				if (args && args.attrs) shader.removeAttrs(args.attrs);
				
				gl.useProgram(null);
			}
			
			if (args && args.texs) unbindTextureSet(args.texs);
			if (this.texs) unbindTextureSet(this.texs);
	
			if (this.blend) {
				gl.disable(gl.BLEND);
			}
		},
		remove : function() {
			if (!this.parent) return;
			this.parent.children.remove(this);
			this.parent = undefined;
		},
		appendTo : function(parent) {
			this.remove();
			this.parent = parent;
			this.parent.children.push(this);
		},
		prependTo : function(parent) {
			this.remove();
			this.parent = parent;
			this.parent.children.splice(0, 0, this);
		}
	};
	this.SceneObject = SceneObject;
	this.root = new SceneObject();

	var viewAngleInv = quat.create();
	var viewPosInv = vec3.create();
	var frames = 0;
	var lastTime = Date.now();
	this.draw = function() {	//callback, so 'this' isn't reliable
		if (GL.onfps) {
			frames++;
			thisTime = Date.now();
			if (thisTime - lastTime > 1000) {
				GL.onfps(frames * 1000 / (thisTime - lastTime));
				frames = 0;
				lastTime = thisTime;	
			}
		}

		quat.conjugate(viewAngleInv, GL.view.angle);
		mat4.fromQuat(GL.mvMat, viewAngleInv);
		vec3.negate(viewPosInv, GL.view.pos);
		mat4.translate(GL.mvMat, GL.mvMat, viewPosInv);
	
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		if (!GL.root.hidden) GL.root.draw();

		if (GL.ondraw) GL.ondraw();
	
		//work around canvas alpha crap
		gl.colorMask(false,false,false,true);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.colorMask(true,true,true,true);
	}
};

