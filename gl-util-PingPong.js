import { makeFramebuffer } from './gl-util-Framebuffer.js';
import { makeTexture2D } from './gl-util-Texture2D.js';
function makePingPong(glutil) {
const gl = glutil.context;
glutil.import('Framebuffer', makeFramebuffer);
glutil.import('Texture2D', makeTexture2D);
class PingPong {
	/*
	args:
		width : framebuffer width (optional)
		height : framebuffer height (optional)
		numBuffers : number of textures to buffer
		fbo : (optional) framebuffer.  If none is provided then one will be created.
		rest of args are passed on to the textures
	*/
	constructor(args) {
		this.history = [];
		this.fbo = args.fbo;
		if (this.fbo === undefined) {
			this.fbo = new glutil.Framebuffer({width:args.width, height:args.height});
		}
		this.width = args.width;
		this.height = args.height;
		this.index = 0;	//history index
		let numBuffers = args.numBuffers !== undefined ? args.numBuffers : 2;
		for (let i = 0; i < numBuffers; i++) {
			let tex = new glutil.Texture2D(args);
			this.history.push(tex);
			//the old way set a unique color attachment per texture...
			//...but webgl can't do that...
		}
	}
	nextIndex(n) {
		if (n === undefined) n = 1;
		return (this.index + n) % this.history.length;
	}
	swap() {
		this.index = this.nextIndex();
	}
	current() {
		return this.history[this.index];
	}
	previous(n) {
		return this.history[this.nextIndex(n)];
	}
	last() {
		return this.prev(this.history.length-1);
	}
	draw(args) {
		this.fbo.bind();
		this.fbo.setColorAttachmentTex2D(this.current());
		this.fbo.unbind();
		this.fbo.draw(args);
	}
	//clear used a quad ... could use viewport clear I suppose...
/*
function PingPong:clear(index, color)
self:draw{
	colorAttachment=index-1;
	color=color;
	resetProjection=true;
	viewport={0, 0, self.width, self.height};
}
end

function PingPong:clearAll(color)
color = color or {0,0,0,0}
for i=1,#self.hist do
	self:clear(i, color)
end
end
*/
}
return PingPong;
}
export { makePingPong };
