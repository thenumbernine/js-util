import {traceback} from './util.js';
function makeShader(glutil) {
const gl = glutil.context;
class Shader {
	/*
	args:
		code = shader code,
	*/
	constructor(args) {
		let code = '';
		if (args !== undefined && args.code !== undefined) {
			if (code === undefined) code = '';
			code += args.code;
		}
		if (code === undefined) throw "expected code";

		this.obj = gl.createShader(this.shaderType);
		gl.shaderSource(this.obj, code);
		gl.compileShader(this.obj);
		if (!gl.getShaderParameter(this.obj, gl.COMPILE_STATUS)) {
			//stupid grep for tablet aLogCat
			code.split('\n').forEach((line, i) => {
				console.log((i+1)+': '+line);
			});
			console.log(traceback());
			throw gl.getShaderInfoLog(this.obj);
		}
	}
}
return Shader;
}
export { makeShader };
