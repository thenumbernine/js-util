if (!GL) throw "require gl-util.js before gl-util-kernel.js";

GL.oninit.push(function(gl) {
	if (!this.unitQuad) throw "require gl-util-unitquad.js before gl-util-kernel.js";

	var KernelShader = makeClass({
		super : this.ShaderProgram,
		/*
		args:
			code : the fragment code
			vertexCode : (optional) vertex code
			uniforms : { uniformName : uniformType }
					: { uniformName : [uniformType, initialValue] }
			texs : [texName]
				: [{texName : texType}]
			precision : (optional) mediump (default), highp, etc
		*/
		init : function(args) {
			var varyingCode = [
'varying vec2 pos;'].join('\n');
			var vertexCode = [
varyingCode,
'attribute vec2 vertex;',
'void main() {',
'	pos = vertex.xy;',
'	gl_Position = vec4(vertex.xy * 2. - 1., 0., 1.);',
'}'].join('\n');
			var precision = 'mediump';
			if (args.precision !== undefined) precision = args.precision;
			var fragmentCodePrefix = 'precision '+precision+' float;\n' + varyingCode;
			var uniforms = {};
			if (args.uniforms !== undefined) {
				$.each(args.uniforms, function(uniformName, uniformType) {
					if ($.isArray(uniformType)) {
						//save initial value
						uniforms[uniformName] = uniformType[1];
						uniformType = uniformType[0];
					}
					fragmentCodePrefix += 'uniform '+uniformType+' '+uniformName+';\n';
				});
			}
			if (args.texs !== undefined) {
				for (var i = 0; i < args.texs.length; ++i) {
					var v = args.texs[i];
					var name, vartype;
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
			var code;
			if (args.code !== undefined) code = args.code;
			if (args.codeID !== undefined) code = $('#'+args.codeID).text();
			KernelShader.super.call(this, {
				vertexCodeID : args.vertexCodeID,
				vertexCode : args.vertexCode !== undefined ? args.vertexCode : vertexCode,
				fragmentCode : fragmentCodePrefix + code,
				uniforms : uniforms
			});
		}
	});
	this.KernelShader = KernelShader;
});