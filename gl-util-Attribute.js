import { assertExists } from '/js/util.js';
import { makeArrayBuffer } from './gl-util-ArrayBuffer.js';
function makeAttribute(glutil) {
const gl = glutil.context;
glutil.import('ArrayBuffer', makeArrayBuffer);
class Attribute {
	/*
	args:
		buffer = ArrayBuffer object
		size = dimension of the buffer, default buffer.dim
		type = type of the buffer, default gl.FLOAT (soon to be buffer.type)
		normalize = whether to normalize the buffer 
		stride = stride of the buffer, default 0
		offset = offset of the buffer, default 0
	if args is a ArrayBuffer then it is treated as the buffer argument
	*/
	constructor(args) {
		if (args instanceof glutil.ArrayBuffer) {
			this.buffer = args;
			this.size = this.buffer.dim;
			this.type = gl.FLOAT;
			this.normalize = false;
			this.stride = 0;
			this.offset = 0;
		} else {
			this.buffer = assertExists(args, 'buffer');
			this.size = args.size !== undefined ? args.size : this.buffer.dim;
			this.type = args.type !== undefined ? args.type : gl.FLOAT;	//TODO this.buffer.type
			this.normalize = args.normalize !== undefined ? args.normalize : false;
			this.stride = args.stride !== undefined ? args.stride : 0;
			this.offset = args.offset !== undefined ? args.offset : 0;
		}
	}
}
return Attribute;
}
export { makeAttribute };
