import { makeShader } from './gl-util-Shader.js';
function makeFragmentShader(glutil) {
const gl = glutil.context;
glutil.import('Shader', makeShader);
class FragmentShader extends glutil.Shader {}
//static keyword class members cannot be accessed by instances, so ...
FragmentShader.prototype.shaderType = gl.FRAGMENT_SHADER;
return FragmentShader;
}
export { makeFragmentShader };
