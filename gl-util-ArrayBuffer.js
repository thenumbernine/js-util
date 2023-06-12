function makeArrayBuffer(glutil) {
const gl = glutil.context;
class ArrayBuffer {
	/*
	args:
		one of the two:
			data = either a Float32Array object, or a constructor for a Float32Array object
			count = how many vertexes to create
		usage = gl.bufferData usage
		dim = dimension / # elements per vector in data. only used for attrs and calculating length. default 3
		keep = optional, default true, set to false to not retain data in .data
	*/
	constructor(args) {
		if (args.keep === undefined) args.keep = true;
		this.obj = gl.createBuffer();
		this.dim = args.dim !== undefined ? args.dim : 3;
		let data = args.data;
		if (data === undefined) {
			if (args.count !== undefined) {
				data = new Float32Array(this.dim * args.count);
			} else {
				throw "expected 'data' or 'count'";
			}
		}
		this.setData(data, args.usage || gl.STATIC_DRAW, args.keep);
	}
	setData(data, usage, keep) {
		if (!(data instanceof Float32Array)) {
			data = new Float32Array(data);
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.obj);
		gl.bufferData(gl.ARRAY_BUFFER, data, usage);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		this.count = data.length / this.dim;
		if (keep) this.data = data;
	}
	updateData(data, offset) {
		if (offset === undefined) offset = 0;
		if (data === undefined) data = this.data;
		if (!(data instanceof Float32Array)) {
			data = new Float32Array(data);
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.obj);
		gl.bufferSubData(gl.ARRAY_BUFFER, offset, data);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
}
return ArrayBuffer;
}
export { makeArrayBuffer };
