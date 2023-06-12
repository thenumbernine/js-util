some useful JS scripts / functions / libraries thrown together

some docs at http://christopheremoore.net/gl-util/

other libraries I'm using
- gl-matrix 3.4.1 - used by all webgl projects
- jquery ... a few dif versions ... 
- numeric javascript 1.2.6
- lua.vm.js - emscripten - used by lua emulated in js (symbolic-lua, metric, emoji-lua, live lua demos, etc)
- cryptojs-3.1.2.min.js - used by socialbrowsing

- fancybox 2.1.5 - used by main and everything that uses main's system

- webgl-debug.js - used by universe
- mediawiki.api.js wikipedia api, i think used by universe

- showdown-1.9.1.min.js - used by symbolic-lua for rendering the README.md
- webgl-debug.js ?? who is using this?

glutil considerations:
	- targetMat, mvMat, projMat are all convenient but not always used/useful
	- likewise, 'static'... should it be asserted by the presence of pos/angle?  should it always be true/false unless specified otherwise?
	- speaking of defaults, should parent auto-attach to root, or only when specified?
