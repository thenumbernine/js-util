# js-utils

Some useful JS scripts / functions / libraries thrown together, including:

## My Lua-FFI-WASM Library:
- my [lua-ffi-wasm](https://github.com/thenumbernine/lua-ffi-wasm) build of Lua in JS, which includes:
	- lua-5.4.7-with-ffi.js
	- lua-5.4.7-with-ffi.wasm
	- lua-interop.js

## other libraries:
- gl-matrix 3.4.1 - used by all webgl projects
- jquery ... a few dif versions ...
- numeric javascript 1.2.6
- cryptojs-3.1.2.min.js - used by socialbrowsing

- fancybox 2.1.5 - used by main and everything that uses main's system

- webgl-debug.js - used by universe
- mediawiki.api.js wikipedia api, i think used by universe

- showdown-1.9.1.min.js - used by symbolic-lua for rendering the README.md
- webgl-debug.js ?? who is using this?

# My Webgl Utils:

## GLUtil class
*GLUtil.prototype.onload*<br>
Array of functions to call upon creation of a GLUtil object.
Each function is called with 'this' set to the GLUtil object.

*GLUtil.prototype.webGLNames*

List of names to query WebGL use for using the HTML canvas getContext function.

## GLUtil objects
*glutil = new GLUtil(args)*

args:

canvas = the HTML canvas object to use.

canvasArgs = arguments to pass to to the getContext function of the canvas.

By default the following arguments are set to canvasArgs:

premultipliedAlpha is set to false

alpha is set to false

*glutil.canvas*

The canvas of the GLUtil object.

*glutil.context*

The WebGL context of the canvas.

*glutil.wrapMap*

An object mapping letters 's' and 't' to WebGL constants `TEXTURE_WRAP_S` and `TEXTURE_WRAP_T`.

*glutil.fragmentPrecision*

The default precision code to prepend to fragment shaders.

*glutil.vertexPrecision*

The default precision code to prepend to vertex shaders.

*view = new glutil.View(args)*

args:

zNear = (optional) default 1

zFar = (optional) default 2000

fovY = (optional) default 90

ortho = (optional) orthogonal view.  default false.

pos = (optional) [x,y,z].  default [0,0,0].

angle = (optional) [x,y,z,w] quaternion. default [0,0,0,1].

*view.zNear* the near plane of the View.

*view.zFar* the far plane of the View.

*view.fovY* the fov along the vertical of the View.

*view.ortho* whether the View is orthogonal or frustum.

*view.pos* the View position, as [x,y,z].

*view.angle* the View angle quaternion, as [x,y,z,w].

*scene = new glutil.Scene()*

*scene.projMat* the projection matrix associated with this Scene.

Computation comes from the View projection variables (zNear, zFar, fovY, ortho) and the canvas width and height.

*scene.mvMat* the modelview matrix associated with this Scene.

Computation starts as the inverse transform of the View translation (of view.pos) and rotation (of view.angle).

It is subsequently permuted as the scene graph is traversed.

*scene.setupMatrices()*

Initializes the scene.projMat and scene.mvMat.

*shader = new glutil.Shader(args)*

args:

code = (optional) shader code to use.

id = (optional) the id of a DOM object to use the text of.

Shader is an abstract class which depends on its shaderType field to be defined.

*shader.obj* = the WebGL createShader object.

*vertexShader = new glutil.VertexShader(args)*

args are passed on to Shader construction.

*VertexShader.prototype.shaderType* is initialized to the context constant `VERTEX_SHADER`.

*FragmentShader.prototype.shaderType* is initialized to the context constant `FRAGMENT_SHADER`.

*shaderProgram = new glutil.ShaderProgram(args)*

args:

one of the following:

vertexShader = the VertexShader object to link with.

vertexCode = the vertex shader code.

vertexCodeID = this DOM element id containing vertex shader code.

and one of the following:

fragmentShader = the FragmentShader object to link with.

fragmentCode = the fragment shader code.

fragmentCodeID = the DOM element id containing fragment shader code.

optional:

vertexPrecision = set to 'best' to prepend the 'using precision' code for the the highest supported precision.

fragmentPrecision = set to 'best' to prepend the 'using precision' code for the highest supported precision.

uniforms: a key/value map containing initial values of any uniforms.

*shaderProgram.vertexShader* = the ShaderProgram's VertexShader.

*shaderProgram.fragmentShader* = the ShaderProgram's FragmentShader.

*shaderProgram.obj* = the WebGL createProgram object.

*shaderProgram.uniforms* = a map from both each uniform's name and each uniform's index to its WebGL getActiveUniform structure.

This object also has the following fields appended:

shaderProgram.uniforms[i].loc = the WebGL getUniformLocation for this uniform.

shaderProgram.uniforms[i].setters = an object containing the following fields:

count : the number of elements in the uniform setter.

arg : the WebGL uniform setter accepting primitives

vec : the WebGL uniform setter accepting an array

mat : the WebGL uniform setter accepting a matrix

*shaderProgram.attrs* = a map from both each attribute's name and each attribute's index to its WebGL getActiveAttrib structure.

This object also has the following fields appended:

shaderProgram.attrs[i].loc = the WebGL getAttribLocation for this attribute.

*shaderProgram.use()* enables this ShaderProgram.  Returns self.

*shaderProgram.useNone()* disables this ShaderProgram.  Returns self.

*shaderProgram.setUniforms(uniforms)* calls shaderProgram.setUniform on all key/value pairs in 'uniforms.'  Returns self.

TODO Texture, Texture2D, ArrayBuffer, ElementArrayBuffer, Framebuffer, Geometry, Attribute, SceneObject

glutil considerations:
	- targetMat, mvMat, projMat are all convenient but not always used/useful
	- likewise, 'static'... should it be asserted by the presence of pos/angle?  should it always be true/false unless specified otherwise?
	- speaking of defaults, should parent auto-attach to root, or only when specified?
