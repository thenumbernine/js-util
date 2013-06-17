if (!GL) throw "require gl-util.js before gl-util-font.js";
GL.oninit.push(function() {
	var gl = GL.gl;
	
	/*
	args:
		width : framebuffer width (optional)
		height : framebuffer height (optional)
		numBuffers : number of textures to buffer
		rest of args are passed on to the textures
	*/
	var PingPong = function(args) {
		this.history = [];
		this.fbo = new GL.Framebuffer({width:args.width, height:args.height});
		this.width = args.width;
		this.height = args.height;
		this.index = 0;	//history index
		var numBuffers = args.numBuffers || 2;
		for (var i = 0; i < numBuffers; i++) {
			var tex = new GL.Texture2D(args);
			this.history.push(tex);
			//the old way set a unique color attachment per texture...
			//...but webgl can't do that...
		}
	};
	PingPong.prototype = {
		nextIndex : function(n) {
			n = n || 1;
			return (this.index + n) % this.history.length;
		},
		swap : function() {
			this.index = this.nextIndex();
		},
		current : function() {
			return this.history[this.index];
		},
		previous : function(n) {
			return this.history[this.nextIndex(n)];
		},
		last : function() {
			return this.prev(this.history.length-1);
		},
		draw : function(args) {
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

	};
	GL.PingPong = PingPong;
});
