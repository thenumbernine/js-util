import { makeAttribute } from './gl-util-Attribute.js';
function makeGeometry(glutil) {
const gl = glutil.context;
glutil.import('Attribute', makeAttribute);
class Geometry {
	/*
	args:
		mode
		count (optional).  required unless 'indexes' or 'vertexes' is provided.
		indexes (optional).  specifies to use drawElements instead of drawArrays
		vertexes (optional).  either Attribute (holding ArrayBuffer) or ArrayBuffer.  solely used for providing 'count' when 'indexes' and 'count' is not used.
		offset (optional).  default 0
	*/
	constructor(args) {
		this.mode = args.mode;
		this.count = args.count;
		this.indexes = args.indexes;
		this.vertexes = args.vertexes;
		this.offset = args.offset !== undefined ? args.offset : 0;
	}
	/*
	args:
		mode : overrides mode
		count : overrides count
		offset : overrides offset
	*/
	draw(args) {
		let mode = this.mode;
		let count = this.count;
		let offset = this.offset;
		//allow overrides?  for which variables?
		if (args !== undefined) {
			if (args.mode !== undefined) mode = args.mode;
			if (args.count !== undefined) count = args.count;
			if (args.offset !== undefined) offset = args.offset;
		}
		if (this.indexes !== undefined) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexes.obj);
			if (count === undefined) {
				count = this.indexes.count;
			}
			gl.drawElements(mode, count, this.indexes.type, offset);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		} else {
			if (count === undefined && this.vertexes !== undefined) {
				if (!(this.vertexes instanceof glutil.Attribute)) {
					count = this.vertexes.count;
				} else {
					count = this.vertexes.buffer.count;
				}
			}
			if (count > 0) {
				gl.drawArrays(mode, offset, count);
			}
		}
	}
}
return Geometry;
}
export { makeGeometry };
