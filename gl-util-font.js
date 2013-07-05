if (!GL) throw "require gl-util.js before gl-util-font.js";

GL.oninit.push(function(gl) {
	if (!this.unitQuad) throw "require gl-util-unitquad.js before gl-util-font.js";
	
	var fontSize = 16;
	var charSubtexSize = 16;
	var lettersPerSize = 16;

	var letterMat = mat4.create();
	var Font = makeClass({
		init : function() {
			var c = $('<canvas>').get(0);
			c.width = 256;
			c.height = 256;
			var c2d = c.getContext('2d');
			c2d.font = fontSize+'px Monospace';
			var yOffset = -.25;
			for (var i = 0, y = 0; y < lettersPerSize; y++) {
				for (var x = 0; x < lettersPerSize; x++, i++) {
					var ch = String.fromCharCode(i);
					c2d.fillRect(ch, x*fontSize, (y+1+yOffset)*fontSize);
				}
			}

			this.widths = [];
			for (var i = 0,y = 0; y < lettersPerSize; y++) {
				for (var x = 0; x < lettersPerSize; x++, i++) {
					var firstx = charSubtexSize;
					var lastx = -1;
					var data = c2d.getImageData(x, y, charSubtexSize, charSubtexSize);
					for (var v = 0; v < charSubtexSize; v++) {
						for (var u = 0; u < charSubtexSize; u++) {
							var pixel = data[4*(x+lettersPerSize*y)];
							if (pixel != 0) {
								if (x < firstx) firstx = x;
								if (x > lastx) lastx = x;
							}
						}
					}
					firstx--;
					lastx += 2;
					if (firstx < 0) firstx = 0;
					if (lastx > charSubtexSize) lastx = charSubtexSize;
					if (lastx < firstx) {
						firstx = 0;
						lastx = charSubtexSize / 2;
					}
					this.widths[i] = {start:firstx/charSubtexSize, finish:lastx/charSubtexSize};
				}
			}

			this.tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.tex);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);	//gl.LINEAR_MIPMAP_LINEAR);
			gl.bindTexture(gl.TEXTURE_2D, null);
		},
		
		shader : new GL.ShaderProgram({
			vertexCode : [
'attribute vec2 vertex;',
'varying vec2 vertexv;',
'uniform mat4 projMat;',
'uniform mat4 mvMat;',
'void main() {',
'	vertexv = vertex;',
'	gl_Position = projMat * mvMat * vec4(vertex, 0., 1.);',
'}'].join('\n'),
			fragmentCode : [
'precision mediump float;',
'varying vec2 vertexv;',
'uniform vec2 texMinLoc;',
'uniform vec2 texMaxLoc;',
'uniform sampler2D tex;',
'void main() {',
'	gl_FragColor = texture2D(tex, vertexv * (texMaxLoc - texMinLoc) + texMinLoc);',
'}'].join('\n'),
			uniforms : {
				tex : 0
			}
		}),
		
		draw : function(posX, posY, fontSizeX, fontSizeY, text, sizeX, sizeY, colorR, colorG, colorB, colorA, dontRender, singleLine) {
			var cursorX = 0;
			var cursorY = 0;
			var maxx = 0;

			var lastCharWasSpace = true;
			var a = 0;
			while (a < text.length) {	
				var thisCharIsSpace = (text.charCodeAt(a) || 0) <= 32;
				var nextCharIsSpace = (text.charCodeAt(a + 1) || 0) <= 32;
				var newline = false;
				
				if (text.substr(a,1) == '\n') {
					newline = true;
				} else {
					if (thisCharIsSpace && !nextCharIsSpace) {
						var wordlen = 0;
						while ((text.charCodeAt(a) || 0) <= 32) a++;
						var finish = a;
						while ((text.charCodeAt(finish) || 0) > 32) {
							var widthIndex = text.charCodeAt(finish) || 0;
							var charWidth;
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
					var charIndex = Math.max(text.charCodeAt(a) || 0, 32);
					if (this.widths[charIndex]) {
						startWidth = this.widths[charIndex].start;
						finishWidth = this.widths[charIndex].finish;
					} else {
						startWidth = 0;
						finishWidth = 1;
					}
					var width = finishWidth - startWidth;
					
					var lettermaxx = width * fontSizeX + cursorX;
					if (maxx < lettermaxx) maxx = lettermaxx;
					
					if (!dontRender) {
						var tx = charIndex%lettersPerSize;
						var ty = (charIndex-tx)/lettersPerSize;

						mat4.translate(letterMat, GL.mvMat, [
							(-startWidth) * fontSizeX + cursorX + posX,
							cursorY + posY,
							0]);
						mat4.scale(letterMat, letterMat, [
							(finishWidth - startWidth) * .5,
							.5,
							1]);
						mat4.translate(letterMat, letterMat, [.5, .5, 0]);
						GL.unitQuad.draw({
							shader : this.shader,
							uniforms : {
								texMinLoc : [tx+startWidth/lettersPerSize, ty],
								texMaxLoc : [tx+finishWidth/lettersPerSize, ty+1/lettersPerSize],
								mvMat : letterMat
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
	});
	this.Font = Font;
});
