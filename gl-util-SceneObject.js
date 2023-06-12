import {arrayRemove} from './util.js';
import {vec3, mat4, quat} from './gl-matrix-3.4.1/index.js';
import {makeGeometry} from './gl-util-Geometry.js';
import {makeAttribute} from './gl-util-Attribute.js';
function makeSceneObject(glutil) {
const gl = glutil.context;
glutil.import('Geometry', makeGeometry);
glutil.import('Attribute', makeAttribute);
class SceneObject {
	/*
	args:
		scene

		geometry
			-or-
		mode
		count 	used to specify the number of elements to render.  not necessary if attrs.vertex is provided.
		index	(optional) used to specify drawElements instead of drawArrays	
		offset	offset into arrays to draw.  default: 0
		
		shader
		uniforms
		attrs:
			[attributeName] = glutil.Attribute object, or semblance of an Attribute object, or an ArrayBuffer.
							I was considering migrating this all to Attribute objects before I considered how many dereferences into the attrs table there are.  (Any time dynamic data is updated.)
							So until I switch everything over, I'll just code this, Shader.setAttr, and Geometry.draw to handle both.  Old code will run the same.  New code will run the new way.
			vertex = vertex attribute buffer.  used to override 'count'
		texs

		scenegraph / questionable vars:
			blend
			useDepth
			static
			parent
			pos
			angle
	*/
	constructor(args) {
		if (!args) args = {};
		this.scene = args.scene || glutil.scene;
		
		this.shader = args.shader;
		this.uniforms = args.uniforms || {};
		if (args.attrs) {
			this.attrs = {};
			for (let k in args.attrs) {
				let v = args.attrs[k];
				if (!(v instanceof glutil.Attribute)) {
					v = new glutil.Attribute(v);
				}
				this.attrs[k] = v;
			}
		}
		this.texs = args.texs;
		this.blend = args.blend;
		this.useDepth = args.useDepth;

		//TODO this should be bool-cast, and should probably be after the implicit assignment
		if ('static' in args) this.static = args.static;
		if (args.pos) {
			this.pos = vec3.clone(args.pos);
			this.static = false;
		}
		if (args.angle) {
			this.angle = quat.clone(args.angle);
			this.static = false;
		}

		if ('geometry' in args) {
			this.geometry = args.geometry;
		} else {
			this.geometry = new glutil.Geometry({
				mode : args.mode,
				count : args.count,
				offset : args.offset,
				indexes : args.indexes,
				vertexes : this.attrs !== undefined ? this.attrs.vertex : undefined
			});
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
		
		if (args && 'parent' in args) {
			this.parent = args.parent;
		} else {
			this.parent = this.scene.root;
		}
		if (this.parent) {
			this.parent.children.push(this);
		}

		if (this.static) {
			if (this.parent) {
				this.targetMat = this.parent.targetMat;
			} else {
				this.targetMat = this.scene.mvMat;
			}
		} else {
			this.localMat = mat4.create();
			this.mvMat = mat4.create();
			this.targetMat = this.mvMat;
		}
	
		if (this.uniforms.projMat === undefined) this.uniforms.projMat = this.scene.projMat;
		if (this.uniforms.mvMat === undefined) this.uniforms.mvMat = this.targetMat;
		//hack to undo the model part of modelview.  TODO instead separate model and view ...
		if (this.localMat && this.uniforms.localMat === undefined) this.uniforms.localMat = this.localMat;
		if (this.uniforms.viewMatInv === undefined) this.uniforms.viewMatInv = this.scene.mvMat;
	}

	static = true; //default
	
	setupMatrices() {
		//TODO make matrix stuff optional?
		if (!this.static) {
			mat4.fromRotationTranslation(this.localMat, this.angle, this.pos);
			if (this.parent) {
				mat4.multiply(this.mvMat, this.parent.targetMat, this.localMat);
			} else {
				mat4.multiply(this.mvMat, this.scene.mvMat, this.localMat);
			}
		}
	}
	
	/*
	args: all optional and all overrides for args of constructor and shader constructor
		shader
		uniforms
		attrs
		mode
		count
		offset
	*/
	draw(args) {
		this.setupMatrices();

		//TODO push attrib anyone?
	
		let blend = this.blend || (args && args.blend);
		if (blend) {
			gl.blendFunc.apply(gl, blend);
			gl.enable(gl.BLEND);
		}

		if (this.useDepth === true) {
			gl.enable(gl.DEPTH_TEST);
		} else if (this.useDepth === false) {
			gl.disable(gl.DEPTH_TEST);
		}

		if (this.texs) glutil.bindTextureSet(gl, this.texs);
		if (args && args.texs) glutil.bindTextureSet(gl, args.texs);

		let shader = this.shader;
		if (args && args.shader) shader = args.shader;
		
		if (shader) {
			gl.useProgram(shader.obj);

			if (this.uniforms) shader.setUniforms(this.uniforms);
			if (args && args.uniforms) shader.setUniforms(args.uniforms);
			
			if (this.attrs) shader.setAttrs(this.attrs);
			if (args && args.attrs) shader.setAttrs(args.attrs);
		}
		
		if (this.geometry) {
			this.geometry.draw(args);
		}
		
		//nest within state & shader binding so children can inherit
		// they can also screw up state, mind you
		for (let i = 0; i < this.children.length; i++) {
			let child = this.children[i];
			if (!child.hidden) {
				child.draw();
			}
		}

		if (shader) {
			if (this.attrs) shader.removeAttrs(this.attrs);
			if (args && args.attrs) shader.removeAttrs(args.attrs);
			
			gl.useProgram(null);
		}
		
		if (args && args.texs) glutil.unbindTextureSet(gl, args.texs);
		if (this.texs) glutil.unbindTextureSet(gl, this.texs);

		if (blend) {
			gl.disable(gl.BLEND);
		}
	}
	
	remove() {
		if (!this.parent) return;
		arrayRemove.call(this.parent.children, this);
		this.parent = undefined;
	}
	
	appendTo(parent) {
		this.remove();
		this.parent = parent;
		this.parent.children.push(this);
	}
	
	prependTo(parent) {
		this.remove();
		this.parent = parent;
		this.parent.children.splice(0, 0, this);
	}
}
return SceneObject;
}
export { makeSceneObject };
