function makeElementArrayBuffer(glutil) {
const gl = glutil.context;
class ElementArrayBuffer {
	/*
	args:
		data = either a Uint16Array object, or a constructor for a Uint16Array object
	*/
	constructor(args) {
		this.obj = gl.createBuffer();
		this.setData(args.data, args.usage || gl.STATIC_DRAW, args.keep);
	}
	setData(data, usage, keep) {
		if (!(data instanceof Uint16Array || 
			data instanceof Uint32Array)) 
		{
			//in case of uint, default to uint
			// otherwise default to ushort
			this.datatype = Uint16Array;
			if (gl.getExtension('OES_element_index_uint')) this.datatype = Uint32Array;
			data = new this.datatype(data);
		} else {
			// ok so 'instanceof' is now preferred over .constructor==
			// but is there any easy way to get the class of an object?
			// I didn't think so ... 
			// using the old method:
			this.datatype = data.constructor;
		}
		this.type = data instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.obj);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, usage);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		this.count = data.length;

		if (keep) {
			this.data = data;
		}
	}
	updateData(data, offset) {
		if (offset === undefined) offset = 0;
		if (!(data instanceof this.datatype)) {
			data = new this.datatype(data);
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.obj);
		gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, offset, data);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
}
return ElementArrayBuffer;
}
export { makeElementArrayBuffer };
