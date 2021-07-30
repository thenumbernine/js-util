some useful JS scripts / functions / libraries thrown together

some docs at http://christopheremoore.net/gl-util/

other libraries I'm using
- jquery 1.11
- gl-matrix 2.2.0 - used by all webgl projects
- jquery.cookie 1.3.1
- jquery purl 2.2.1
- numeric javascript 1.2.6
- lua.vm.js - emscripten - used by lua emulated in js (symbolic-lua, metric, emoji-lua, live lua demos, etc)
- cryptojs-3.1.2.min.js - used by socialbrowsing

- fancybox 2.1.5 - used by main and everything that uses main's system

- webgl-debug.js - used by universe
- mediawiki.api.js wikipedia api, i think used by universe


- purl.js
- showdown-1.9.1.min.js - used by symbolic-lua for rendering the README.md
- webgl-debug.js ?? who is using this?
- gl-matrix-min.js, used by universe/offline, plz update to 2.2.0
- jquery.color.js needs a version # on it
- jquery.cookie.js needs a version # on it

glmatrix considerations:
	- targetMat, mvMat, projMat are all convenient but not always used/useful
	- likewise, 'static'... should it be asserted by the presence of pos/angle?  should it always be true/false unless specified otherwise?
	- speaking of defaults, should parent auto-attach to root, or only when specified?
