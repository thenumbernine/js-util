/*
This and util.js are old and clunky.
I have a much smaller and smoother filesystem-loader in glapp-js, but it doesn't come with a DOM progress bar.

autogen was nice ...
does github.io allow any server-side execution?
otherwise I'll have to keep regenerating this / make a script to do so
*/

import {DOM, assert, show, hide, FileSetLoader, assertExists, arrayClone, asyncfor, pathToParts} from './util.js';
import {newLua} from '/js/lua-interop.js';
/*
Some helper functions for using lua.vm.js
I want this to turn into an in-page filesystem + lua interpreter.
This assumes util.js is already loaded.  This loads lua.vm.js itself.  Maybe it shouldn't do that.
*/

// convert new package system to old package system
// why keep the old around?  it still supports 'tests' folders, which is baked into the EmbeddedLuaInterpreter, which I don't want to get rid of just yet
const luaVmPackageInfos = {};

import { luaPackages } from '/js/lua-packages.js';
for (let pkgname in luaPackages) {
	const files = [];
	const tests = [];
	luaPackages[pkgname].forEach(fileset => {
		fileset.files.forEach(file => {
			const entry = {
				url : (fileset.from + '/' + file).replace('+', '%2b'),
				dest : fileset.to + '/' + file,
			};
			if (fileset.from.substr(-6) == '/tests' || fileset.from.indexOf('/tests/') != -1) {
				tests.push(entry);
			} else {
				files.push(entry);
			}
		});
	});
	const dst = {files : files};
	luaVmPackageInfos[pkgname] = dst;
	if (tests.length) dst.tests = tests;
}

/*
args:
	files : files
	done : (optional) done
	ext : (optional) set to true to include lua-ext files
	onload(url, dest, data) : (optional) per-file on-load callback
	onexec(url, dest) : (optional) per-file on-execute callback
*/
function executeLuaVMFileSet(args) {
	const FS = assertExists(args, 'FS');
	let files = arrayClone(assertExists(args, 'files'));
	if (args.packages) {
		args.packages.forEach(packageName => {
			const packageContent = luaVmPackageInfos[packageName];
			if (packageContent) {
				if (packageContent.files) files = files.concat(packageContent.files);
				if (packageContent.tests) files = files.concat(packageContent.tests);
			}
		});
	}
	new FileSetLoader({
		//TODO don't store them here
		//just pull from their remote location / github repo
		files : files,
		onload : args.onload,
		done : function() {
			let thiz = this;
//console.log('results', this.results);
			asyncfor({
				map	: this.results,
				callback : function(i, result) {
					let file = thiz.files[i];

					if (args.onexec) {
						args.onexec(file.url, file.dest);
					}

					if (
						file.dest.substring(file.dest.length-4) == '.lua'
						|| file.dest.substring(file.dest.length-8) == '.symmath'
						|| file.dest.substring(file.dest.length-4) == '.txt'
					) {
//console.log('loading data file', file.dest);
						let parts = pathToParts(file.dest);
						if (parts.dir != '.') {
							try { 	//how do you detect if a path is already created?
								FS.createPath('/', parts.dir, true, true);
							} catch (e) {
								console.log('failed to create path', parts.dir, e);
							}
						}
						try {
							FS.createDataFile(parts.dir, parts.file, result, true, false);
						} catch (e) {
							console.log("failed to create file", file.dest, e);
						}
					} else {
						throw "got a non-lua file "+file.dest;
					}

				},
				done : args.done
			});
		}
	});
}

/*
a commonly used one
specify the files you want and let it go at it
args are passed on to executeLuaVMFileSet plus ...
	id : (optional) id of the parent container for all this to go
	tests : list of buttons to provide the user at the bottom of the container.  each member of the array contains the following:
		url : where to find the file
		dest : where in the filesystem to find it
		name : button title

		these are automatically added to args.files.   no need to duplicate.
	packages : (optional) auto-populates files and tests
*/
class EmbeddedLuaInterpreter {
	constructor(args) {
		const thiz = this;
		(async () => {
			thiz.lua = await newLua({
				print : s => { thiz.print(s); },
				printErr : s => { thiz.printErr(s); },
			});
			thiz.lua.newState();
			thiz.LuaModule = thiz.lua.lib;

			//granted it doesn't make much sense to include tests from one package without including the package itself ...
			if (args.packageTests) {
				if (!args.tests) args.tests = [];
				args.packageTests.forEach(packageName => {
					const packageContent = luaVmPackageInfos[packageName];
					if (packageContent) {
						if (packageContent.tests) {
							args.tests = args.tests.concat(packageContent.tests);
						}
					}
				});
				args.packageTests = undefined;
			}
			if (args.packages) {
				if (!args.files) args.files = [];
				args.packages.forEach(packageName => {
					const packageContent = luaVmPackageInfos[packageName];
					if (packageContent) {
						if (packageContent.files) {
							args.files = args.files.concat(packageContent.files);
						}
					}
				});
				args.packages = undefined;
			}

			thiz.tests = args.tests;
			if (args.tests !== undefined) {
				args.files = args.files.concat(args.tests);
			}

			thiz.done = args.done;	//store for later

			thiz.parentContainer = document.getElementById(args.id);

			thiz.container = DOM('div');
			if (thiz.parentContainer) {
				thiz.parentContainer.appendChild(thiz.container);
			}
			hide(thiz.container);

			DOM('div', {
				innerHTML : 'Lua VM emulation courtesy of <a href="http://emscripten.org">Emscripten</a>',
				appendTo : thiz.container,
			});

			thiz.outputBuffer = '';
			thiz.output = DOM('div', {
				text : 'Loading...',
				css : {
					width : '80em',
					height : '24em',
					//border : '1px solid black',
					border : '0px',
					'font-family' : 'Courier',
					'overflow-y' : 'scroll'
				},
				appendTo : thiz.container,
			});

			thiz.history = [];
			//load history from cookies
			/*for (let i=0;;++i) {
				let line = localStorage.getItem('lua-history-'+i);
				if (line === null) break;
				thiz.history.push(line);
			}*/
			thiz.historyIndex = thiz.history.length;
			thiz.inputGo = DOM('button', {
				text : 'GO!',
				appendTo : thiz.container,
			});

			thiz.input = DOM('input', {
				type : 'email',
				css : {
					width : '80em',
					border : '1px solid black',
					'font-family' : 'Courier'
				},
				appendTo : thiz.container,
			});
			thiz.input.setAttribute('autocapitalize', 'off');
			thiz.input.setAttribute('autocomplete', 'off');
			thiz.input.setAttribute('autocorrect', 'off');
			thiz.input.setAttribute('spellcheck', 'off');
			DOM('br', {appendTo:thiz.container});

			thiz.launchButton = DOM('button', {text:'Launch'});
			if (thiz.parentContainer) {
				thiz.parentContainer.appendChild(thiz.launchButton);
			}

			const onLaunch = () => {
				hide(thiz.launchButton);
				show(thiz.container);

				args.onexec = (url, dest) => {
//Module.print('loading '+dest+' ...');
				};
				args.done = () => {
//Module.print('initializing...');
					setTimeout(() => {
						thiz.doneLoadingFilesystem();
					}, 1);
				};
				args.FS = thiz.LuaModule.FS;
				executeLuaVMFileSet(args);
			};

			thiz.launchButton.addEventListener('click', e => { onLaunch(); });
			if (args.autoLaunch) {
				onLaunch();
			}
		})();
	}
	processInput() {
		let cmd = this.input.value;
		this.history.push(cmd);
		while (this.history.length > this.HISTORY_MAX) this.history.shift();
		this.historyIndex = this.history.length;

		//store history in cookies...
		let i=0;
		while (i<this.history.length) {
			localStorage.setItem('lua-history-'+i, this.history[i]);
			++i;
		}
		localStorage.removeItem('lua-history-'+i);

		this.executeAndPrint(cmd);
		this.input.value = '';
	}
	doneLoadingFilesystem() {
		let thiz = this;

		//hook up input
		this.inputGo.addEventListener('click', e => {
			thiz.processInput();
		});
		this.input.addEventListener('keypress', e => {
			if (e.which == 13) {
				e.preventDefault();
				thiz.processInput();
			}
		});
		this.input.addEventListener('keydown', e => {
			if (e.keyCode == 38) {	//up
				thiz.historyIndex--;
				if (thiz.historyIndex < 0) thiz.historyIndex = 0;
				if (thiz.historyIndex >= 0 && thiz.historyIndex < thiz.history.length) {
					thiz.input.value = thiz.history[thiz.historyIndex];
				}
			} else if (e.keyCode == 40) {	//down
				thiz.historyIndex++;
				if (thiz.historyIndex > thiz.history.length) thiz.historyIndex = thiz.history.length;
				if (thiz.historyIndex >= 0 && thiz.historyIndex < thiz.history.length) {
					thiz.input.value = thiz.history[thiz.historyIndex];
				}
			}
		});

		//provide test buttons
		if (this.tests) {
			this.testContainer = DOM('div', {appendTo:this.container});
			this.tests.forEach(info => {
				let div = thiz.createDivForTestRow(info);
				thiz.testContainer.appendChild(div);
			});
		}

		this.execute(`
package.path = package.path .. ';./?/?.lua'
`);

		this.print('...Done');

		if (this.done) this.done();
	}
	createDivForTestRow(info) {
		let thiz = this;
		let div = DOM('div');
		DOM('a', {
			href:info.url,
			text:'[View]',
			target:'_blank',
			css : {'margin-right' : '10px'},
			appendTo : div,
		})

		DOM('a', {
			href : '#',
			text : '[Run]',
			css : {'margin-right' : '10px'},
			click : e => {
				thiz.executeAndPrint("dofile '"+info.dest+"'");
			},
			appendTo : div,
		});

		DOM('span', {
			text:info.name !== undefined ? info.name : info.dest,
			appendTo:div,
		});

		return div;
	}
	execute(s) {
		this.lua.doString(s);
	}
	executeAndPrint(s) {
		this.print('> '+s);
		this.execute(s);
	}
	print(s) {
		this.printOutAndErr(s);
	}
	printErr(s) {
		this.printOutAndErr(s);
	}
	printOutAndErr(s) {
		if (this.outputBuffer !== '') this.outputBuffer += '\n';
		this.outputBuffer += s;
		this.output.innerHTML = this.outputBuffer
			.replace(new RegExp('&', 'g'), '&amp;')
			.replace(new RegExp('<', 'g'), '&lt;')
			.replace(new RegExp('>', 'g'), '&gt;')
			.replace(new RegExp('"', 'g'), '&quot;')
			.replace(new RegExp('\n', 'g'), '<br>')
			.replace(new RegExp(' ', 'g'), '&nbsp;')
		;
		this.output.scrollTop = 99999999;
	}
	clearOutput() {
		this.output.innerHTML = this.outputBuffer = '';
	}

	/*
	args:
		callback = what to execute,
		output = where to redirect output,
		error = where to redirect errors
	*/
	capture(args) {
		assert(!this.captured, "already capturing!")
		this.captured = true;
		//now cycle through coordinates, evaluate data points, and get the data back into JS
		//push module output and redirect to a buffer of my own
		const oldPrint = this.print;
		const oldError = this.printErr;
		if (args.output !== undefined) this.print = args.output;
		if (args.error !== undefined) this.printErr = args.error;
		args.callback(this);
		this.print = oldPrint;
		this.printErr = oldError;
		this.captured = false;
	}
}
EmbeddedLuaInterpreter.prototype.HISTORY_MAX = 100;


// new system I guess

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

const addFromToDir = (FS, fromPath, toPath, files, callback) =>
	// TODO use Promise.allSettled, but that means first flatten all the promises into one Promise.all ... shudders ... javascript is so retarded ...
	Promise.all(files.map(f => mountFile(
		FS,
		(fromPath+'/'+f).replace('+', '%2b'),	//TODO full url escape? but not for /'s
		toPath+'/'+f,
		callback
	)));

const addPackage = (FS, pkg, callback) =>
	Promise.all(
		pkg.map(fileset =>
			addFromToDir(FS, fileset.from, fileset.to, fileset.files, callback)
		)
	);

export {
	EmbeddedLuaInterpreter,
	luaVmPackageInfos,
	executeLuaVMFileSet,

	fetchBytes,
	mountFile,
	addFromToDir,
	addPackage,
};
