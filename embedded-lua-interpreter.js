import {A, Br, Div, Span, Input, Button} from './dom.js';
import {assert, show, hide, fileSetLoader, assertExists, arrayClone, asyncfor, pathToParts} from './util.js';
import {newLua} from '/js/lua-interop.js';
/*
Some helper functions for using lua.vm.js
I want this to turn into an in-page filesystem + lua interpreter.
This assumes util.js is already loaded.  This loads lua.vm.js itself.  Maybe it shouldn't do that.
*/



// convert new package system to old package system
// why keep the old around?  it still supports 'tests' folders, which is baked into the EmbeddedLuaInterpreter, which I don't want to get rid of just yet
// TODO get rid of that though, just use this /tests test instead.
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
used to be used more
but now I'm opting for the more lean lua-interop.js
so atm this is only actively used in emoji-lua

... I want to async/await this but it's a class and javascript is too retarded to async/await class constructors so ... I'll just leave it

specify the files you want and let it go at it
args:
	id : (optional) id of the parent container for all this to go
	tests : list of buttons to provide the user at the bottom of the container.  each member of the array contains the following:
		url : where to find the file
		dest : where in the filesystem to find it
		name : button title

		these are automatically added to args.files.   no need to duplicate.
	packages : (optional) auto-populates files and tests


	files : files
	done : (optional) done , run after all loaded, after onLaunch
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
			thiz.lib = thiz.lua.lib;
			thiz.FS = thiz.lib.FS;

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

			args.files ??= [];

			if (args.packages) {
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

			thiz.container = Div({
				appendTo : thiz.parentContainer || undefined,
				children : [
					thiz.output = Div({
						innerText : 'Loading...',
						style : {
							width : '80em',
							height : '24em',
							//border : '1px solid black',
							border : '0px',
							'font-family' : 'Courier',
							'overflow-y' : 'scroll'
						},
					}),
					Div({
						innerHTML : 'Lua VM emulation courtesy of <a href="http://emscripten.org">Emscripten</a>',
					}),
					thiz.inputGo = Button({
						innerText : 'GO!',
					}),
					thiz.input = Input({
						type : 'email',
						style : {
							width : '80em',
							border : '1px solid black',
							'font-family' : 'Courier'
						},
					}),
					Br(),
				],
			});
			hide(thiz.container);
			thiz.outputBuffer = '';

			thiz.history = [];
			//load history from cookies
			/*for (let i=0;;++i) {
				let line = localStorage.getItem('lua-history-'+i);
				if (line === null) break;
				thiz.history.push(line);
			}*/
			thiz.historyIndex = thiz.history.length;

			thiz.input.setAttribute('autocapitalize', 'off');
			thiz.input.setAttribute('autocomplete', 'off');
			thiz.input.setAttribute('autocorrect', 'off');
			thiz.input.setAttribute('spellcheck', 'off');

			show(thiz.container);

			const FS = thiz.FS;

			//TODO don't store them here
			//just pull from their remote location / github repo
			const results = await fileSetLoader(args.files);

			//console.log('results', this.results);

			// once they're all loaded, onexec?
			results.forEach((result, i) => {
				let file = args.files[i];

//console.log('loading data file', file.dest);
				let parts = pathToParts(file.dest);
				if (parts.dir != '.') {
					try { 	//how do you detect if a path is already created?
//console.log('mkdir', parts.dir);
						FS.createPath('/', parts.dir, true, true);
					} catch (e) {
						console.log('failed to create path', parts.dir, 'with error', e);
					}
				}
				try {
//console.log('writing', parts.file);
					FS.createDataFile(parts.dir, parts.file, result, true, false);
				} catch (e) {
					console.log("failed to create file", file.dest, 'file', parts.file, 'dir', parts.dir, 'with error', e);
				}
			});

//console.log('...executeLuaVMFileSet done');
//Module.print('initializing...');
			setTimeout(() => {
				thiz.doneLoadingFilesystem();
			}, 1);

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
			this.testContainer = Div({appendTo:this.container});
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
		return Div({
			children : [
				A({
					href:info.url,
					innerText:'[View]',
					target:'_blank',
					style: {'margin-right' : '10px'},
				}),
				A({
					href : '#',
					innerText : '[Run]',
					style : {'margin-right' : '10px'},
					events : {
						click : e => {
							thiz.executeAndPrint("dofile '"+info.dest+"'");
						},
					},
				}),
				Span({
					innerText:info.name !== undefined ? info.name : info.dest,
				}),
			],
		});
	}
	execute(s) {
		this.lua.run(s);
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

export {EmbeddedLuaInterpreter};
