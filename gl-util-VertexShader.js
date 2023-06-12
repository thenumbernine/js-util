import { makeShader } from './gl-util-Shader.js';
function makeVertexShader(glutil) {
const gl = glutil.context;
glutil.import('Shader', makeShader);
class VertexShader extends glutil.Shader {}
//static keyword class members cannot be accessed by instances, so ...
VertexShader.prototype.shaderType = gl.VERTEX_SHADER;
return VertexShader;
}
export { makeVertexShader };
