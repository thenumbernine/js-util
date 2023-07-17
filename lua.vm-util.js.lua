import {DOM, assert, show, hide, FileSetLoader, assertExists, arrayClone, asyncfor, pathToParts, require} from './util.js';
/*
Some helper functions for using lua.vm.js
I want this to turn into an in-page filesystem + lua interpreter.
This assumes util.js is already loaded.  This loads lua.vm.js itself.  Maybe it shouldn't do that.
*/

<?
local wsapi_request = require 'wsapi.request'
local string = require 'ext.string'
local table = require 'ext.table'
local path = require 'ext.path'
local url = require 'socket.url'

local req = wsapi_request.new(env)

local function rfind(dir, pattern, results)
	for f in path(dir):dir() do
		if f:sub(1,1) ~= '.' then
			local pathstr = dir..'/'..f
			if path(pathstr):exists() and path(pathstr):isdir() then
				rfind(pathstr, pattern, results)
			else
				if not pattern or pathstr:match(pattern) then
					results:insert(pathstr)
				end
			end
		end
	end
end

local function find(dir, pattern)
	local results = table()
	if path(dir):exists() and path(dir):isdir() then
		rfind(dir, pattern, results)
	end
	return results
end
?>

<?
local function addDir(base, src, dst, testdir)
?>		files : [
<?
	local sep = ''
	for _,f in ipairs(find(base..'/'..src)) do
		local f = f:sub(#base+3+#src)
		if f:sub(-4) == '.lua'
		and (not testdir or f:sub(1,6) ~= 'tests/')
		then
			local jsfn = string.split(src, '/'):mapi(function(part)
				return url.escape(part)
			end):concat'/'
?>			<?=sep?>{url:'/<?=jsfn?>/<?=f?>', dest:'<?=dst?>/<?=f?>'}
<?
			sep = ','
		end
	end
?>		]
<?

	if testdir then
?>		,tests : [
<?
		local sep = ''
		if path(base..'/'..testdir):exists() then
			for f in path(base..'/'..testdir):dir() do
				if f:sub(1,1) ~= '.'
				and (
					f:sub(-4) == '.lua'
					or f:sub(-8) == '.symmath'
				)
				then
					local jsfn = string.split(testdir..'/'..f, '/'):mapi(function(part)
						return url.escape(part)
					end):concat'/'
?>				<?=sep?>{url:'/<?=jsfn?>', dest:'<?=dst?>/tests/<?=f?>'}
<?					sep = ','
				end
			end
		end
?>		]
<?
	end
end
?>

const luaVmPackageInfos = {
	complex : {
<? addDir(req.doc_root, 'lua/complex', 'complex') ?>
	},
	dkjson : {
<? addDir(req.doc_root, 'lua/dkjson', 'dkjson') ?>
	},
	ext : {
<? addDir(req.doc_root, 'lua/ext', 'ext') ?>
	},
	symmath : {
<? addDir(req.doc_root, 'lua/symmath', 'symmath', 'lua/symmath/tests') ?>
	},
	gnuplot : {
<? addDir(req.doc_root, 'lua/gnuplot', 'gnuplot') ?>
	},
	tensor : {
<? addDir(req.doc_root, 'lua/tensor', 'tensor', 'lua/tensor/tests') ?>
	},
	htmlparser : {
<? addDir(req.doc_root, 'lua/htmlparser', 'htmlparser', 'lua/htmlparser/tests') ?>
	},
	template : {
<? addDir(req.doc_root, 'lua/template', 'template') ?>
	}
};


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
				callback : function(i,result) {
					let file = thiz.files[i];

					if (args.onexec) {
						args.onexec(file.url, file.dest);
					}

					if (
						file.dest.substring(file.dest.length-4) == '.lua'
						|| file.dest.substring(file.dest.length-8) == '.symmath'
					) {
//console.log('loading data file',file.dest);
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
			window.LuaModule = {
				print : s => { thiz.print(s); },
				printErr : s => { thiz.printErr(s); },
				stdin : () => {},
			};
			thiz.LuaModule = await require('/js/lua.vm.js');
			window.LuaModule = undefined;
//console.log('LuaModule', thiz.LuaModule);			

			//granted it doesn't make much sense to include tests from one package without including the package itself ...
			if (args.packageTests) {
				if (!args.tests) args.tests = [];
				args.packageTests.forEach(packageName => {
					const packageContent = luaVmPackageInfos[packageName];
					if (packageContent) {
						if (packageContent.tests) args.tests = args.tests.concat(packageContent.tests);
					}
				});
				args.packageTests = undefined;
			}
			if (args.packages) {
				if (!args.files) args.files = [];
				args.packages.forEach(packageName => {
					const packageContent = luaVmPackageInfos[packageName];
					if (packageContent) {
						if (packageContent.files) args.files = args.files.concat(packageContent.files);
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
			thiz.launchButton.addEventListener('click', e => {
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
			});

			if (args.autoLaunch) {
				thiz.launchButton.dispatchEvent(new Event('click'));
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
		/* seems lua syntax error handling is messed up in lua.vm.js ...
		this.LuaModule.Lua.execute(s);
		*/
		/* until then */
		this.LuaModule.Lua.execute('assert(load[=====['+s+']=====])()');
		/* */
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

export {
	EmbeddedLuaInterpreter,
	luaVmPackageInfos,
	executeLuaVMFileSet,
};
