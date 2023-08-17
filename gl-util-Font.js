import {DOM} from '/js/util.js';
import {mat4} from '/js/gl-matrix-3.4.1/index.js';
import {makeTexture2D} from './gl-util-Texture2D.js';
import {makeProgram} from './gl-util-Program.js';
import {makeUnitQuad} from './gl-util-UnitQuad.js';
function makeFont(glutil) {
glutil.import('Texture2D', makeTexture2D);
glutil.import('Program', makeProgram);
glutil.import('UnitQuad', makeUnitQuad);
const gl = glutil.context;
class Font {
	constructor(args) {
		let c = DOM('canvas');
		c.width = 256;
		c.height = 256;
		let c2d = c.getContext('2d');
		c2d.font = this.fontSize+'px Monospace';
		let yOffset = -.25;
		for (let i = 0, y = 0; y < this.lettersPerSize; y++) {
			for (let x = 0; x < this.lettersPerSize; x++, i++) {
				let ch = String.fromCharCode(i);
				c2d.fillRect(ch, x*this.fontSize, (y+1+yOffset)*this.fontSize, this.fontSize, this.fontSize);
			}
		}

		this.widths = [];
		for (let i = 0,y = 0; y < this.lettersPerSize; y++) {
			for (let x = 0; x < this.lettersPerSize; x++, i++) {
				let firstx = this.charSubtexSize;
				let lastx = -1;
				let data = c2d.getImageData(x, y, this.charSubtexSize, this.charSubtexSize);
				for (let v = 0; v < this.charSubtexSize; v++) {
					for (let u = 0; u < this.charSubtexSize; u++) {
						let pixel = data[4*(u+this.charSubtexSize*v)];
						if (pixel != 0) {
							if (u < firstx) firstx = u;
							if (u > lastx) lastx = u;
						}
					}
				}
				firstx--;
				lastx += 2;
				if (firstx < 0) firstx = 0;
				if (lastx > this.charSubtexSize) lastx = this.charSubtexSize;
				if (lastx < firstx) {
					firstx = 0;
					lastx = this.charSubtexSize / 2;
				}
				this.widths[i] = {
					start:firstx/this.charSubtexSize,
					finish:lastx/this.charSubtexSize
				};
//console.log('i '+i+' char '+String.fromCharCode(i)+' start '+firstx+' finish '+lastx);
			}
		}

		this.tex = new glutil.Texture2D({
			flipY : true,
			data : c,
			minFilter : gl.NEAREST,
			magFilter : gl.LINEAR
		});
	
		this.shader = new glutil.Program({
			vertexCode : `
in vec2 vertex;
out vec2 vertexv;
uniform vec4 ortho;
uniform vec2 offset;
uniform vec2 scale;
void main() {
	vertexv = vertex;
	vec2 vtx = vertex;
	vtx += offset;
	vtx *= scale;
	vtx -= .5;
	vtx -= ortho.xz;
	vtx /= ortho.yw - ortho.xz;
	vtx *= 2.;
	vtx -= 1.;
	gl_Position = vec4(vtx, 0., 1.);
}
`,
			fragmentCode : `
precision mediump float;
in vec2 vertexv;
out vec4 fragColor;
uniform vec2 texMinLoc;
uniform vec2 texMaxLoc;
uniform sampler2D tex;
void main() {
	fragColor = texture(tex, vertexv * (texMaxLoc - texMinLoc) + texMinLoc);
}
`,
			uniforms : {
				tex : 0
			}
		});

	}
	ortho(xmin, xmax, ymin, ymax) {
		gl.useProgram(this.shader.obj);
		gl.uniform4f(this.shader.uniforms.ortho.loc, xmin, xmax, ymin, ymax);
		gl.useProgram(null);
	}
	draw(posX, posY, fontSizeX, fontSizeY, text, sizeX, sizeY, colorR, colorG, colorB, colorA, dontRender, singleLine) {
		let cursorX = 0;
		let cursorY = 0;
		let maxx = 0;

		if (!dontRender) {
			gl.bindTexture(gl.TEXTURE_2D, this.tex.obj);
		}
		let lastCharWasSpace = true;
		let a = 0;
		while (a < text.length) {	
			let thisCharIsSpace = (text.charCodeAt(a) || 0) <= 32;
			let nextCharIsSpace = (text.charCodeAt(a + 1) || 0) <= 32;
			let newline = false;
			
			if (text.substr(a,1) == '\n') {
				newline = true;
			} else {
				if (thisCharIsSpace && !nextCharIsSpace) {
					let wordlen = 0;
					while ((text.charCodeAt(a) || 0) <= 32) a++;
					let finish = a;
					while ((text.charCodeAt(finish) || 0) > 32) {
						let widthIndex = text.charCodeAt(finish) || 0;
						let charWidth;
						if (this.widths[widthIndex]) {
							charWidth = this.widths[widthIndex].finish - this.widths[widthIndex].start;
						} else {
							charWidth = 1;
						}
						wordlen += charWidth;
						finish++;
					}
					if (sizeX !== undefined && cursorX + wordlen * fontSizeX + 1 >= sizeX) {
						newline = true;
					}
					a--;
				}
			}
			
			if (newline && !singleLine) {
				cursorX = 0;
				cursorY += fontSizeY;
				if (sizeY !== undefined && cursorY >= sizeY) break;
			} else {
				let charIndex = Math.max(text.charCodeAt(a) || 0, 32);
				if (this.widths[charIndex]) {
					startWidth = this.widths[charIndex].start;
					finishWidth = this.widths[charIndex].finish;
				} else {
					startWidth = 0;
					finishWidth = 1;
				}
				let width = finishWidth - startWidth;
				
				let lettermaxx = width * fontSizeX + cursorX;
				if (maxx < lettermaxx) maxx = lettermaxx;
				
				if (!dontRender) {
					let tx = charIndex%this.lettersPerSize;
					let ty = (charIndex-tx)/this.lettersPerSize;

					glutil.UnitQuad.unitQuad.draw({
						shader : this.shader,
						uniforms : {
							texMinLoc : [tx+startWidth/this.lettersPerSize, ty],
							texMaxLoc : [tx+finishWidth/this.lettersPerSize, ty+1/this.lettersPerSize],
							offset : [
								(-startWidth) * fontSizeX + cursorX + posX,
								cursorY + posY
							],
							scale : [
								(finishWidth - startWidth) * .5,
								.5,
							]
						}
					});
				}	
				cursorX += width * fontSizeX;
			}
			
			a++;
		}
		
		if (!dontRender) {
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		
		return [maxx, cursorY + fontSizeY];
	}
}
Font.prototype.fontSize = 16;
Font.prototype.charSubtexSize = 16;
Font.prototype.lettersPerSize = 16;
Font.prototype.letterMat = mat4.create();
return Font;
}
export {makeFont};
