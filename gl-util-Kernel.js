import { makeProgram } from './gl-util-Program.js';
function makeKernel(glutil) {
const gl = glutil.context;

class Kernel extends glutil.Program {
	/*
	args:
		code : the fragment code
		varying : name of varying variable.  default 'pos'
		vertexCode : (optional) vertex code
		uniforms : { uniformName : uniformType }
				: { uniformName : [uniformType, initialValue] }
		texs : [texName]
			: [{texName : texType}]
		precision : (optional) mediump (default), highp, etc
	*/
	constructor(args) {
		const varyingVar = args.varying !== undefined ? args.varying : 'pos';
		
		const varyingCode = [
'varying vec2 '+varyingVar+';'].join('\n');
		const vertexCode = [
varyingCode,
'attribute vec2 vertex;',
'void main() {',
'	'+varyingVar+' = vertex.xy;',
'	gl_Position = vec4(vertex.xy * 2. - 1., 0., 1.);',
'}'].join('\n');
		let precision = 'mediump';
		if (args.precision !== undefined) precision = args.precision;
		let fragmentCodePrefix = 'precision '+precision+' float;\n' + varyingCode;
		const uniforms = {};
		if (args.uniforms !== undefined) {
			Object.entries(args.uniforms).each(entry => {
				const [uniformName, uniformType] = entry;
				if (Array.isArray(uniformType)) {
					//save initial value
					uniforms[uniformName] = uniformType[1];
					uniformType = uniformType[0];
				}
				fragmentCodePrefix += 'uniform '+uniformType+' '+uniformName+';\n';
			});
		}
		if (args.texs !== undefined) {
			for (let i = 0; i < args.texs.length; ++i) {
				const v = args.texs[i];
				let name, vartype;
				if (typeof(v) == 'string') {
					name = v;
					vartype = 'sampler2D';
				} else {
					name = v[0];
					vartype = v[1];
				}
				fragmentCodePrefix += 'uniform '+vartype+' '+name+';\n';
				uniforms[name] = i;
			}
		}
		let code;
		if (args.code !== undefined) code = args.code;
		if (args.codeID !== undefined) code = document.getElementById('#'+args.codeID).innerHTML;
		super({
			vertexCodeID : args.vertexCodeID,
			vertexCode : args.vertexCode !== undefined ? args.vertexCode : vertexCode,
			vertexPrecision : precision,
			fragmentCode : fragmentCodePrefix + code,
			//fragmentPrecision : none because I already added the line
			uniforms : uniforms,
		});
	}
}

return Kernel;
}
export { makeKernel };
