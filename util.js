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

function merge(mergedst, mergesrc) {
	for (let k in mergesrc) {
		mergedst[k] = mergesrc[k];
	}
	return mergedst;
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

function Text(text) {
	return document.createTextNode(text);
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
	if (reserved.appendTo !== undefined) {
		reserved.appendTo.append(dom);
	}
	if (reserved.prependTo !== undefined) {
		reserved.prependTo.prepend(dom);
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
	return dom;
}

function preload(checklist, done, update, error) {
	checklist = arrayClone(checklist);
	const len = checklist.length;
//console.log('got checklist', checklist, 'len', len);	
	checklist.forEach(src => {
//console.log('loading',src);
		const img = DOM('img', {
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

//used especially with the lua.vm-utils.js
//but I could also potentially form it into the loader that universe uses ... 
// it'd just take changing the loading div stuff and change the xmlhttprequest data type
class FileSetLoader {
	/*
	args:
		files : array of string
		onload(filename) : (optional) once one file is done
		done : (optional) once they're all done
	
	produces:
		this.files : a copy of the args.files
			either strings or {url, dest} for remote/local locations
		this.div : div containing the label and progress bar
		this.loading : label
		this.progress : progress bar
		this.results : results from loaded files
	*/
	constructor(args) {
		let thiz = this;
		
		this.files = arrayClone(args.files);
		for (let i = 0; i < this.files.length; ++i) {
			let file = this.files[i];
			if (typeof(file) == 'string') {
				this.files[i] = {url:file, dest:file};
			}
		}
		
		this.div = DOM('div', {
			css : {
				margin : 'auto',
			},
		});
		document.body.prepend(this.div);
		this.loading = DOM('span', {text:'Loading...', appendTo:this.div});
		DOM('br', {appendTo:this.div});
		this.progress = DOM('progress', {
			attrs : {
				max : 0,
				value : 0,
			},
			appendTo: this.div,
		});

		this.results = [];
		const totals = [];
		const loadeds = [];
		const dones = [];
		for (let i = 0; i < this.files.length; ++i) {
			totals[i] = 0;
			loadeds[i] = 0;
			dones[i] = false;
			this.results[i] = null;
		}
		const updateProgress = () => {
			let loaded = 0;
			let total = 0;
			for (let i = 0; i < thiz.files.length; ++i) {
				loaded += loadeds[i];
				total += totals[i];
			}
			thiz.progress.setAttribute('max', total);
			thiz.progress.setAttribute('value', loaded);
		};
		const updateDones = () => {
			for (let i = 0; i < thiz.files.length; ++i) {
				if (!dones[i]) return;
			}
			removeFromParent(thiz.div);
			if (args.done) args.done.call(thiz);
		};
		this.files.forEach((file, i) => {
			/* as fetch ... */	
			fetch(file.url)
			.then(response => {
				if (!response.ok) return Promise.reject('not ok');
				response.text()
				.then(responseText => {
					loadeds[i] = totals[i];
					thiz.results[i] = responseText;
					updateProgress();
					dones[i] = true;
					if (args.onload) {
						args.onload.call(thiz, file.url, file.dest, this.responseText);
					}
					updateDones();
				});
			}).catch(e => {
				console.log(e)
			});
			/**/	
			/* as XMLHttpRequest ...
			let xhr = new XMLHttpRequest();
			xhr.open('GET', file.url, true);
			xhr.addEventListener('progress', e => {
				if (e.total) {
					totals[i] = e.total;
					loadeds[i] = e.loaded;
				} else {
					totals[i] = 0;
					loadeds[i] = 0;
				}
				updateProgress();
			});
			xhr.addEventListener('load', e => {
				loadeds[i] = totals[i];
				thiz.results[i] = this.responseText;
				updateProgress();
				dones[i] = true;
				if (args.onload) args.onload.call(thiz, file.url, file.dest, this.responseText);
				updateDones();
			});
			xhr.send();
			*/
		});
	}
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
	let _module = window.module;
	window.module = {};
	await import(path);
	let exports = module.exports;
	window.module = _module;
	return exports;
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
	Text,
	DOM,
	hide,
	show,
	hidden,
	toggleHidden,
	getIDs,
	preload,
	FileSetLoader,
	animate,
	require,
};
