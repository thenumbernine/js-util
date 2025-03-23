import {merge, Img, Div, Span, Br, Progress} from './dom.js';

//http://stackoverflow.com/questions/3954438/remove-item-from-array-by-value
// expects 'this'
function arrayRemove(...args) {
	let what, a = args, L= a.length, ax;
	while(L && this.length){
		what= a[--L];
		while((ax= this.indexOf(what))!= -1){
			this.splice(ax, 1);
		}
	}
	return this;
}

// expects 'this'
function arrayMax() {
	return Math.max.apply(Math, this);
}

// expects 'this'
function arrayMin() {
	return Math.min.apply(Math, this);
}

//http://www.xenoveritas.org/comment/1689
function arrayClone(ar) {
	return ar.slice(0);
}

// expects 'this'
function arrayAddUnique(obj) {
	if (this.indexOf(obj) == -1) this.push(obj);
}

//http://www.tutorialspoint.com/javascript/array_map.htm
// expects 'this'
function arrayMap(...args) {
	let fun = args[0];
	let len = this.length;
	if (typeof fun != "function") {
		throw new TypeError();
	}

	let res = new Array(len);
	let thisp = args[1];
	for (let i = 0; i < len; i++) {
		if (i in this) {
			res[i] = fun.call(thisp, this[i], i, this);
		}
	}

	return res;
}

function traceback() {
	return new Error().stack;
}

//assert

function assert(s, msg) {
	if (!s) {
		console.log(traceback());
		throw msg || "assertion failed!";
	}
	return s;
}

function assertEquals(a,b,msg) {
	if (a != b) throw a+"!="+b+": "+(msg || "assertion failed!");
	return true;
}

function assertExists(obj,field,msg) {
	if (!(field in obj)) throw "no "+field+" in "+obj+": "+(msg || "assertion failed!");
	return obj[field];
}

function mathClamp(x,min,max) {
	return Math.max(min,Math.min(max,x));
}

function mathRad(deg) { return deg * Math.PI / 180; }
function mathDeg(rad) { return rad * 180 / Math.PI; }

/*
args:
	map : map, for key/value iterating
	start : first iteration value, inclusive
	end : last iteration value, exclusive
	step : increment between values.  default is 1
	timeout: how many ms to run each iteration before calling next interval
	callback : callback per-iteration
	done : function to call after iteration

asyncfor(map, callback); calls callback(k,v);
asyncfor(start, end, callback); calls callback(start <= i < end);
asyncfor(start, end, step, callback); calls callback(start <= i < end);

right now the end conditions are exact, so stepping isn't a good idea
i might change that, but that might mean inclusive end bounds for most intuitive use

implementing this the lazy way first: buffering everything then popping as we go
*/
function asyncfor(args) {
	let buffer = [];
	let callback = args.callback;
	if (callback === undefined) {
		throw 'expected callback';
	}
	let done = args.done;
	let timeout = args.timeout !== undefined ? args.timeout : 0;
	if (args.map !== undefined) {
		Object.entries(args.map).forEach(entry => {
			const [k,v] = entry;
			buffer.push([k,v]);
		});
	} else {
		let start = args.start;
		let end = args.end;
		if (start === undefined || end === undefined) {
			throw 'expected map or both start and end';
		}
		let step = args.step;
		if (step === undefined) step = 1;
		for (let i = start; i != end; i += step) {
			buffer.push([i]);
		}
	}

	let interval;
	//makes use of function scope
	let iterate = () => {
		let starttime = Date.now();
		let thistime;
		do {
			thistime = Date.now();
			if (buffer.length == 0) {
				clearInterval(interval);
				if (done) done.apply(undefined, args);
				return;
			} else {
				let args = buffer.splice(0, 1)[0];
				callback.apply(undefined, args);
			}
		} while (thistime - starttime < timeout);
	};
	interval = setInterval(iterate, 1);
	return interval;
}

//returns {dir, file, ext}
function pathToParts(path) {
	let parts = {};
	let lastSlash = path.lastIndexOf('/');
	if (lastSlash != -1) {
		parts.dir = path.substring(0, lastSlash);
		parts.file = path.substring(lastSlash+1);
	} else {
		parts.dir = '.';
		parts.file = path;
	}

	let lastDot = path.lastIndexOf('.');
	if (lastDot != -1) {
		parts.ext = path.substring(lastDot+1);
	} else {
		parts.ext = '';
	}

	return parts;
}

//

function posmod(x,y) {
	return ((x % y) + y) % y;
}

function removeFromParent(o) {
	// sometimes this removes extra stuff
	//o.parentNode.remove(o);
	// use this instead:
	o.parentNode.removeChild(o);
}

function hide(o) {
	o.style.display = 'none';
}

function show(o) {
	o.style.display = 'block';
}

function hidden(o) {
	return o.style.display == 'none';
}

function toggleHidden(o) {
	if (hidden(o)) {
		show(o);
	} else {
		hide(o);
	}
}

/*
// TODO listeners ...
// should I just intersperse them within args, like jquery does?
// should I give them a reserved table in args?
// should I give them a separate argument?
function DOM(tag, args, listeners) {
	const dom = document.createElement(tag);
	const reservedFields = {css:1, attrs:1, appendTo:1, prependTo:1, text:1, click:1, change:1, class:1};
	const reserved = {};
	if (args) {
		for (let k in args) {
			if (k in reservedFields) {
				reserved[k] = args[k];
			} else {
				dom[k] = args[k];
			}
		}
	}
	if (reserved.css !== undefined) {
		merge(dom.style, reserved.css);
	}
	if (reserved.attrs !== undefined) {
		for (let k in reserved.attrs) {
			dom.setAttribute(k, reserved.attrs[k]);
		}
	}
	if (listeners !== undefined) {
		for (let k in listeners) {
			dom.addEventListener(k, listeners[k]);
		}
	}
	if (reserved.text !== undefined) {
		dom.innerText = reserved.text;
	}
	if (reserved.click !== undefined) {
		dom.addEventListener('click', reserved.click);
	}
	if (reserved.change !== undefined) {
		dom.addEventListener('change', reserved.change);
	}
	if (reserved.class !== undefined) {
		reserved.class.split(' ').forEach(cl => {
			dom.classList.add(cl);
		});
	}

	//add last for load event's sake
	if (reserved.appendTo !== undefined) {
		reserved.appendTo.append(dom);
	}
	if (reserved.prependTo !== undefined) {
		reserved.prependTo.prepend(dom);
	}

	return dom;
}
*/

function preload(checklist, done, update, error) {
	checklist = arrayClone(checklist);
	const len = checklist.length;
//console.log('got checklist', checklist, 'len', len);
	checklist.forEach(src => {
//console.log('loading',src);
		const img = Img({
			attrs : {
				src : src,
			},
			onload : () => {
//console.log('checklist was',checklist);
				arrayRemove.call(checklist, src);
//console.log('checklist is',checklist);
				//this is calling done twice ?
				if (update) {
					update(
						1 - checklist.length / len,
						src,
						img
					);
				}
				if (checklist.length == 0 && done !== undefined) {
//console.log('empty list load calling done');
					done();
				}
			},
			onerror : e => {
				arrayRemove.call(checklist, src);
				if (error) error(1 - checklist.length / len, src);
				if (checklist.length == 0 && done !== undefined) {
//console.log('empty list error calling done');
					done();
				}
			},
		});
	});
}

// TODO get rid of this
function fixJQuery(jQuery) {
	(function($){
		//http://stackoverflow.com/questions/476679/preloading-images-with-jquery
		//with modifications for percentage callback
		$.fn.preload = function(done, update, error) {
			let checklist = this.toArray();
			return preload(checklist, done, update, error);
		};
	})(jQuery);
}


function getIDs() {
	const ids = {};
	document.querySelectorAll('[id]').forEach(n => {
		ids[n.id] = n;
	});
	return ids;
}

// TODO move to js/util.js
const fetchBytes = src => {
	return new Promise((resolve, reject) => {
		const req = new XMLHttpRequest();
		req.open('GET', src, true);
		req.responseType = 'arraybuffer';
		req.onload = ev => {
			resolve(new Uint8Array(req.response));
		};
		req.onerror = function() {
			console.log("failed on", src);
			reject({
				status: this.status,
				statusText: req.statusText
			});
		};
		req.send(null);
	});
};

// https://github.com/hellpanderrr/lua-in-browser
//emscripten filesystem helper function
const mountFile = (FS, filePath, luaPath, callback) => {
	return fetchBytes(filePath)
	.then(fileContent => {

		const fileSep = luaPath.lastIndexOf('/');
		const file = luaPath.substring(fileSep + 1);
		const body = luaPath.substring(0, luaPath.length - file.length - 1);

		if (body.length > 0) {
			const parts = body.split('/').reverse();
			let parent = '';

			while (parts.length) {
				const part = parts.pop();
				if (!part) continue;

				const current = `${parent}/${part}`;
				try {
					FS.mkdir(current);
				} catch (err) {} // ignore EEXIST

				parent = current;
			}
		}

		FS.writeFile(luaPath, fileContent, {encoding:'binary'});

		// I know, I could just let whoever is calling addPackage pick all the filenames they want out and wait until after the promise is finished, but meh. ..
		if (callback) {
			callback(luaPath);
		}
	});
}

//emscripten filesystem helper function
const addFromToDir = (FS, fromPath, toPath, files, callback) =>
	// TODO use Promise.allSettled, but that means first flatten all the promises into one Promise.all ... shudders ... javascript is so retarded ...
	Promise.all(files.map(f => mountFile(
		FS,
		(fromPath+'/'+f).replace('+', '%2b'),	//TODO full url escape? but not for /'s
		toPath+'/'+f,
		callback
	)));

//emscripten filesystem helper function
const addPackage = (FS, pkg, callback) =>
	Promise.all(
		pkg.map(fileset =>
			addFromToDir(FS, fileset.from, fileset.to, fileset.files, callback)
		)
	);



//used especially with the lua.vm-utils.js
//but I could also potentially form it into the loader that universe uses ...
// it'd just take changing the loading div stuff and change the xmlhttprequest data type
/*
files : array of string
returns: array of results from loaded files
*/
const fileSetLoader = async(files) => {
	const progress = Progress({
		attrs : {
			max : files.length,
			value : 0,
		},
	});
	const div = Div({
		style : {
			margin : 'auto',
		},
		prependTo : document.body,
		children : [
			Span({
				innerText:'Loading...',
			}),
			Br(),
			progress,
		],
	});

	const results = files.map(file => null);

	let numLoaded = 0;
	await Promise.all(files.map((file,i) => fetch(file.url)
		.then(response => response.text())
		.then(responseText => {
			results[i] = responseText;
			++numLoaded;
			progress.setAttribute('value', numLoaded);
		})));

	removeFromParent(div);

	return results;
}

/*
args:
	duration (in ms)
	callback (TODO how bout 'update' instead?)
	done
*/
function animate(args) {
	const duration = assertExists(args, 'duration');
	const callback = assertExists(args, 'callback');
	const done = args.done;	//TODO promises or something. meh.
	const startTime = Date.now();
/* using requestAnimationFrame
	const update = () => {
		const percent = (Date.now() - startTime) / duration;
		if (percent >= 1) {
			callback(1);
			if (done) done();
		} else {
			callback(percent);
			requestAnimationFrame(update);
		}
	};
	requestAnimationFrame(update);
*/
/* using setTimeout */
	let stopped;
	const update = () => {
		if (stopped) return;
		const percent = (Date.now() - startTime) / duration;
		if (percent >= 1) {
			callback(1);
			if (done) done();
		} else {
			callback(percent);
			setTimeout(update, 0);
		}
	};
	setTimeout(update, 0);
/**/
	return {
		stop : () => {
			stopped = true;
		},
	};
}

// See: https://lea.verou.me/2020/07/import-non-esm-libraries-in-es-modules,-with-client-side-vanilla-js/
async function require(path) {
	const _module = window.module;
	window.module = {};
	window.module.exports ??= {};	// I added this.  why is it a thing?  lots of exporters expect `module.exports` to exist before they overwrite it.  why care if it's there if you're about to overwrite it?
	await import(path);
	const exports = module.exports;
	window.module = _module;
	return exports;
}

//I was hoping to replace my 'makeClass' function/new/prototype stuff with ES6 classes
// too bad ES6 breaks static member access
// I guess I still have a use for this, even using ES6 classes:
function makeClass(x) {
	let cl = x.super
		? class extends x.super {
			// looks like if you add 'constructor' as a field to 'cl.prototype' after the 'class' declaration then it just doesn't work, so...
			// more glue code for shitty ES6 syntax standards
			constructor(...args) {
				super(...args);
				if (x.constructor) {
					x.constructor(...args);
				}
			}
		}
		: class {
			constructor(...args) {
				if (x.constructor) {
					x.constructor(...args);
				}
			}
		};
	for (let k in x) {
		if (k != 'super'
		&& k != 'constructor'
		) {
			cl.prototype[k] = x[k];
		}
	}
	return cl;
}

//another function I hoped ES6 would replace,
// but then ES6 was a disappointment
//cl is a class
//sub is a subclass or an instance of a subclass
function isa(sub, cl) {
	return sub instanceof cl
		|| sub.prototype instanceof cl
		|| sub === cl;
}

export {
	arrayRemove,
	arrayMax,
	arrayMin,
	arrayClone,
	arrayAddUnique,
	arrayMap,
	merge,
	traceback,
	assert,
	assertEquals,
	assertExists,
	mathClamp,
	mathRad,
	mathDeg,
	asyncfor,
	pathToParts,
	fixJQuery,
	posmod,
	removeFromParent,
	hide,
	show,
	hidden,
	toggleHidden,
	getIDs,
	preload,
	fetchBytes,
	mountFile,
	addFromToDir,
	addPackage,
	fileSetLoader,
	animate,
	require,
	makeClass,
	isa,
};
