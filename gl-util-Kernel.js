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
		const varyingCodePrefix = 'varying vec2 '+varyingVar+';\n';
		const vertexCode =
varyingCodePrefix.replace(/varying/g, 'out')
+ `
in vec2 vertex;
void main() {
	`+varyingVar+` = vertex.xy;
	gl_Position = vec4(vertex.xy * 2. - 1., 0., 1.);
}
`;
		let fragmentCodePrefix = '';
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
			args.texs.forEach((v, i) => {
				const v = args.texs[i];
				let name, vartype;
				if (typeof(v) == 'string') {
					[name, vartype] = [v, 'sampler2D'];
				} else {
					[name, vartype] = v;
				}
				fragmentCodePrefix += 'uniform '+vartype+' '+name+';\n';
				uniforms[name] = i;
			});
		}

		super({
			vertexPrecision : args.precision,
			vertexCode : args.vertexCode !== undefined ? args.vertexCode : vertexCode,
			fragmentPrecision : args.precision,
			fragmentCode :
				varyingCodePrefix.replace(/varying/g, 'in')
				+ fragmentCodePrefix
				+ (args.code !== undefined ? args.code : ''),
			uniforms : uniforms,
		});
	}
}

return Kernel;
}
export { makeKernel };
