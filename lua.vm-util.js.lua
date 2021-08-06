/*
Some helper functions for using lua.vm.js
I want this to turn into an in-page filesystem + lua interpreter.
This assumes util.js is already loaded.  This loads lua.vm.js itself.  Maybe it shouldn't do that.
*/

<?
local wsapi_request = require 'wsapi.request'
local string = require 'ext.string'
local table = require 'ext.table'
local os = require 'ext.os'
local url = require 'socket.url'

local req = wsapi_request.new(env)

local function rfind(dir, pattern, results)
	for f in os.listdir(dir) do
		if f:sub(1,1) ~= '.' then	
			local path = dir..'/'..f
			if os.fileexists(path) and os.isdir(path) then
				rfind(path, pattern, results)
			else
				if not pattern or path:match(pattern) then
					results:insert(path)
				end
			end
		end
	end
end

local function find(dir, pattern)
	local results = table()
	if os.fileexists(dir) and os.isdir(dir) then
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
		if os.fileexists(base..'/'..testdir) then
			for f in os.listdir(base..'/'..testdir) do
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

var luaVmPackageInfos = {
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
	var files = args.files.clone();
	files.splice(0, 0, '/js/lua.vm.js');
	if (args.packages) {
		$.each(args.packages, function(_,packageName) {
			var packageContent = luaVmPackageInfos[packageName];
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
		//wait til all are loaded, then insert them in order
		//this way we run the lua.vm.js before writing to the filesystems (since the filesystem is created by lua.vm.js)
		onload : args.onload,
		done : function() {	
			var thiz = this;
			asyncfor({
				map	: this.results,
				callback : function(i,result) {
					var file = thiz.files[i];
					
					if (args.onexec) {
						args.onexec(file.url, file.dest);
					}
					
					//first load the vm...
					if (file.dest.substring(file.dest.length-3) == '.js') {
console.log('executing javascript file',file.dest);
						
						//this will run in-place.  I always thought it sucked that Lua loadstring() didn't run in place, now I see why it's a good idea.  consistency of scope.
						/*
						eval(result);
						*/
						var s = document.createElement("script");
						s.type = "text/javascript";
						s.innerHTML = result;
						$("head").append(s);
						
					} else if (
						file.dest.substring(file.dest.length-4) == '.lua'
						|| file.dest.substring(file.dest.length-8) == '.symmath'
					) {
console.log('loading data file',file.dest);
						var parts = pathToParts(file.dest);
						if (parts.dir != '.') {
							try { 	//how do you detect if a path is already created?
								FS.createPath('/', parts.dir, true, true);
							} catch (e) {
								console.log('failed to create path', parts.dir, e);
							}
						}
						FS.createDataFile(parts.dir, parts.file, result, true, false);
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
var EmbeddedLuaInterpreter = makeClass({
	HISTORY_MAX : 100,
	init : function(args) {
		var thiz = this;

		//granted it doesn't make much sense to include tests from one package without including the package itself ...
		if (args.packageTests) {
			if (!args.tests) args.tests = [];
			$.each(args.packageTests, function(_,packageName) {
				var packageContent = luaVmPackageInfos[packageName];
				if (packageContent) {
					if (packageContent.tests) args.tests = args.tests.concat(packageContent.tests);
				}
			});
			args.packageTests = undefined;
		}
		if (args.packages) {
			if (!args.files) args.files = [];
			$.each(args.packages, function(_,packageName) {
				var packageContent = luaVmPackageInfos[packageName];
				if (packageContent) {
					if (packageContent.files) args.files = args.files.concat(packageContent.files);
				}
			});
			args.packages = undefined;
		}

		this.tests = args.tests;
		if (args.tests !== undefined) {
			args.files = args.files.concat(args.tests);
		}

//setup Module global for lua.vm.js
//for some reason, on load, lua.vm.js's Module object is no longer reading from the predefined window.Module ...
//so I'm going to overwrite this after load
// something tells me it won't have an affect on the Module references in lua.vm.js ...
		window.Module = {
			print : function(s) { thiz.print(s); },
			printErr : function(s) { thiz.printErr(s); },
			stdin : function() {}
		};

		this.done = args.done;	//store for later

		this.parentContainer = $('#'+args.id).get(0);

		this.container = $('<div>');
		if (this.parentContainer !== undefined) {
			this.container.appendTo(this.parentContainer);
		}
		this.container.hide();

		$('<div>', {html:'Lua VM emulation courtesy of <a href="http://emscripten.org">Emscripten</a>'}).appendTo(this.container);

		this.outputBuffer = '';
		this.output = $('<div>', {
			text : 'Loading...',
			css : {
				width : '80em',
				height : '24em',
				//border : '1px solid black',
				border : '0px',
				'font-family' : 'Courier',
				'overflow-y' : 'scroll'
			}
		}).appendTo(this.container);

		this.history = [];
		//load history from cookies
		for (var i=0;;++i) {
			var line = getCookie('lua-history-'+i);
			if (line === null) break;
			this.history.push(line);
		}
		this.historyIndex = this.history.length;
		this.inputGo = $('<button>', {
			text : 'GO!'
		}).appendTo(this.container);

		this.input = $('<input>', {
			type:'email',	
			css : {
				width : '80em',
				border : '1px solid black',
				'font-family' : 'Courier'
			}
		}).appendTo(this.container);
		this.input.attr('autocapitalize', 'off');		
		this.input.attr('autocomplete', 'off');		
		this.input.attr('autocorrect', 'off');		
		this.input.attr('spellcheck', 'off');		
		$('<br>').appendTo(this.container);

		this.launchButton = $('<button>', {text:'Launch'});
		if (this.parentContainer !== undefined) {
			this.launchButton.appendTo(this.parentContainer);
		}
		this.launchButton.click(function() {
			thiz.launchButton.hide();
			thiz.container.show();

			args.onexec = function(url, dest) {
				//Module.print('loading '+dest+' ...');
			};
			args.done = function() {
				//Module.print('initializing...');
				setTimeout(function() {
					thiz.doneLoadingFilesystem();
				}, 1);
			};
			executeLuaVMFileSet(args);
		});

		if (args.autoLaunch) {
			this.launchButton.click();
		}
	},
	processInput : function() {
		var cmd = this.input.val();
		this.history.push(cmd);
		while (this.history.length > this.HISTORY_MAX) this.history.shift();
		this.historyIndex = this.history.length;
		
		//store history in cookies...
		var i=0;
		while (i<this.history.length) {
			setCookie('lua-history-'+i, this.history[i]);
			++i;
		}
		clearCookie('lua-history-'+i);
		
		this.executeAndPrint(cmd);
		this.input.val('');
	},
	doneLoadingFilesystem : function() {
		var thiz = this;

/*
before I could provide window.Module = { .. default functions ... }
and lua.vm.js would handle them correctly.
But now things aren't working so well.
Lua.execute invokes Module.ccall, but the Module that Lua sees is my Module, not the lua.vm.js Module.  It used to see the lua.vm.js Module.  wtf happened?  too bad Javascript's scope rules suck.
*//*
		Module.print = function(s) { thiz.print(s); };
		Module.printErr = function(s) { thiz.printErr(s); };
		Module.stdin = function() {};
*/

		//hook up input
		this.inputGo.click(function() {
			thiz.processInput();
		});
		this.input.keypress(function(e) {
			if (e.which == 13) {
				e.preventDefault();
				thiz.processInput();
			}
		});
		this.input.keydown(function(e) {
			if (e.keyCode == 38) {	//up
				thiz.historyIndex--;
				if (thiz.historyIndex < 0) thiz.historyIndex = 0;
				if (thiz.historyIndex >= 0 && thiz.historyIndex < thiz.history.length) {
					thiz.input.val(thiz.history[thiz.historyIndex]);
				}
			} else if (e.keyCode == 40) {	//down
				thiz.historyIndex++;
				if (thiz.historyIndex > thiz.history.length) thiz.historyIndex = thiz.history.length;
				if (thiz.historyIndex >= 0 && thiz.historyIndex < thiz.history.length) {
					thiz.input.val(thiz.history[thiz.historyIndex]);
				}
			} 
		});

		//provide test buttons
		if (this.tests) {
			this.testContainer = $('<div>').appendTo(this.container);
			$.each(this.tests, function(_,info) {
				var div = thiz.createDivForTestRow(info);
				div.appendTo(thiz.testContainer);
			});
		}

		this.execute(mlstr(function(){/*
package.path = package.path .. ';./?/?.lua'
*/}));

		this.print('...Done<br>');

		if (this.done) this.done();
	},
	createDivForTestRow : function(info) {
		var thiz = this;
		var div = $('<div>');
		$('<a>', {
			href:info.url, 
			text:'[View]', 
			target:'_blank',
			css : {'margin-right' : '10px'}
		}).appendTo(div);
		
		$('<a>', {
			href:'#',
			text:'[Run]',
			css : {'margin-right' : '10px'},
			click:function() { 
				thiz.executeAndPrint("dofile '"+info.dest+"'");
			}
		}).appendTo(div);
		
		$('<span>', {
			text:info.name !== undefined ? info.name : info.dest
		}).appendTo(div);
	
		return div;
	},
	execute : function(s) {
		Lua.execute(s);
	},
	executeAndPrint : function(s) {
		Module.print('> '+s);
		this.execute(s);
	},
	print : function(s) {
		this.printOutAndErr(s);
	},
	printErr : function(s) {
		this.printOutAndErr(s);
	},
	printOutAndErr : function(s) {
		if (this.outputBuffer !== '') this.outputBuffer += '\n';
		this.outputBuffer += s;
		this.output.html(this.outputBuffer
			.replace(new RegExp('&', 'g'), '&amp;')
			.replace(new RegExp('<', 'g'), '&lt;')
			.replace(new RegExp('>', 'g'), '&gt;')
			.replace(new RegExp('"', 'g'), '&quot;')
			.replace(new RegExp('\n', 'g'), '<br>')
			.replace(new RegExp(' ', 'g'), '&nbsp;')
		);
		this.output.scrollTop(99999999); 
	},
	clearOutput : function() {
		this.output.html(this.outputBuffer = '');
	}
});
