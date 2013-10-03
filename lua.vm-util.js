// some helper functions for using lua.vm.js
// I want this to turn into an in-page filesystem + lua interpreter
//assumes lua.vm.js and util.js are already loaded 


var luaVmPackageInfos = {
	ext : {
		files : [
			{url:'/lua-ext/class.lua', dest:'ext/class.lua'},
			{url:'/lua-ext/init.lua', dest:'ext/init.lua'},
			{url:'/lua-ext/io.lua', dest:'ext/io.lua'},
			{url:'/lua-ext/math.lua', dest:'ext/math.lua'},
			{url:'/lua-ext/serialize.lua', dest:'ext/serialize.lua'},
			{url:'/lua-ext/string.lua', dest:'ext/string.lua'},
			{url:'/lua-ext/table.lua', dest:'ext/table.lua'}
		]
	},
	symmath : {
		files : [
			{url:'/symbolic-lua/src/init.lua', dest:'symmath/init.lua'},
			{url:'/symbolic-lua/src/symmath.lua', dest:'symmath/symmath.lua'},
			{url:'/symbolic-lua/src/tensor.lua', dest:'symmath/tensor.lua'},
			{url:'/symbolic-lua/src/notebook.lua', dest:'symmath/notebook.lua'}
		],
		tests : [
			{url:'/symbolic-lua/src/tests/units.lua', dest:'symmath/tests/units.lua', name:'Units of Measurement'},
			{url:'/symbolic-lua/src/tests/polar_geodesic.lua', dest:'symmath/tests/polar_geodesic.lua',  name:'Polar Geodesic'},
			{url:'/symbolic-lua/src/tests/schwarzschild_cartesian.lua', dest:'symmath/tests/schwarzschild_cartesian.lua',  name:'Schwarzschild Cartesian Metric'},
			{url:'/symbolic-lua/src/tests/schwarzschild_spheric.lua', dest:'symmath/tests/schwarzschild_spheric.lua',  name:'Schwarzschild Spheric Metric'},
			{url:'/symbolic-lua/src/tests/alcubierre.lua', dest:'symmath/tests/alcubierre.lua',  name:'Alcubierre Warp Bubble Geodesic'},
			{url:'/symbolic-lua/src/tests/metric.lua', dest:'symmath/tests/metric.lua',  name:'Metric Test'},
			{url:'/symbolic-lua/src/tests/gravitation_16_1.lua', dest:'symmath/tests/gravitation_16_1.lua',  name:'Gravitation by M.T.W. Ch.16 Prob.1'},
			{url:'/symbolic-lua/src/tests/linearized_euler_hydrodynamic_equations.lua', dest:'symmath/tests/linearized_euler_hydrodynamic_equations.lua',  name:'Gravitation by M.T.W. Ch.16 Prob.1'},
		 	{url:'/symbolic-lua/src/tests/test.lua', dest:'symmath/tests/test.lua',  name:'Validation Test (broken)'}
		]
	},
	tensor : {
		files : [
			{url:'/tensor-calculator/src/tensor.lua', dest:'tensor/tensor.lua'},
			{url:'/tensor-calculator/src/init.lua', dest:'tensor/init.lua'},
			{url:'/tensor-calculator/src/delta.lua', dest:'tensor/delta.lua'},
			{url:'/tensor-calculator/src/notebook.lua', dest:'tensor/notebook.lua'},
			{url:'/tensor-calculator/src/matrix.lua', dest:'tensor/matrix.lua'}
		],
		tests : [
			{url:'/tensor-calculator/src/tests/metric.lua', dest:'tensor/tests/metric.lua', name:'Metric'},
			{url:'/tensor-calculator/src/tests/delta.lua', dest:'tensor/tests/delta.lua', name:'Kronecher Delta'},
			{url:'/tensor-calculator/src/tests/test.lua', dest:'tensor/tests/test.lua', name:'Test'},
			{url:'/tensor-calculator/src/tests/inverse.lua', dest:'tensor/tests/inverse.lua', name:'Inverse Matrix'}
		]
	},
	htmlparser : {
		files : [
			{url:'/html-beautifier/src/init.lua', dest:'htmlparser/init.lua'},
			{url:'/html-beautifier/src/htmlparser.lua', dest:'htmlparser/htmlparser.lua'},
			{url:'/html-beautifier/src/common.lua', dest:'htmlparser/common.lua'},
			{url:'/html-beautifier/src/xpath.lua', dest:'htmlparser/xpath.lua'}
		],
		tests : [
			{url:'/html-beautifier/src/tests/dominion.lua', dest:'htmlparser/tests/dominion.lua', name:'Dominion Card List'},
			{url:'/html-beautifier/src/tests/exportITunesPlaylist.lua', dest:'htmlparser/tests/exportITunesPlaylist.lua', name:'Export iTunes Playlist'},
			{url:'/html-beautifier/src/tests/prettyprint.lua', dest:'htmlparser/tests/prettyprint.lua', name:'Pretty Printer'},
			{url:'/html-beautifier/src/tests/yqlkey.lua', dest:'htmlparser/tests/yqlkey.lua', name:'Yahoo Finance Quotes'}
		]
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
	if (args.ext) {
		var extFiles = [
		];
		for (var i = 0; i < extFiles.length; ++i) {
			var extFile = extFiles[i];
			extFiles[i] = {
				url : '/lua-ext/' + extFile,
				dest : 'ext/' + extFile
			};
		}
		files = files.concat(extFiles);
	}
	new FileSetLoader({
		//TODO don't store them here
		//just pull from https://raw.github.com/thenumbernine/stupid-text-rpg/master/
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
						//this will run in-place.  I always thought it sucked that Lua loadstring() didn't run in place, now I see why it's a good idea.  consistency of scope.
						//eval(result);
						var s = document.createElement("script");
						s.type = "text/javascript";
						s.innerHTML = result;
						$("head").append(s);
					} else if (file.dest.substring(file.dest.length-4) == '.lua') {
						var parts = pathToParts(file.dest);
						if (parts.dir != '.') {
							try { 	//how do you detect if a path is already created?
								FS.createPath('/', parts.dir, true, true);
							} catch (e) {}
						}
						FS.createDataFile(parts.dir, parts.file, result, true, false);
					} else {
						throw "don't know what to do with "+file.dest;
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
	id : id of the parent container for all this to go
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
		window.Module = {
			print : function(s) { thiz.printOutAndErr(s); },
			printErr : function(s) { thiz.printOutAndErr(s); },
			stdin : function() {} 
		};
		
		this.done = args.done;	//store for later

		this.parentContainer = $('#'+args.id);

		this.container = $('<div>').appendTo(this.parentContainer);
		this.container.hide();

		$('<div>', {html:'Lua VM emulation courtesy of <a href="http://emscripten.org">Emscripten</a>'}).appendTo(this.container);

		this.outputBuffer = '';
		this.output = $('<div>', {
			css : {
				width : '80em',
				height : '24em',
				border : '1px solid black',
				'font-family' : 'Courier',
				'overflow-y' : 'scroll'
			}
		}).appendTo(this.container);

		this.history = [];
		this.historyIndex = this.history.length;
		this.inputGo = $('<button>', {
			text : 'GO!'
		}).appendTo(this.container);

		this.input = $('<input>', {
			css : {
				width : '80em',
				border : '1px solid black',
				'font-family' : 'Courier'
			}
		}).appendTo(this.container);
		$('<br>').appendTo(this.container);

		var launchButton = $('<button>', {text:'Launch'}).appendTo(this.parentContainer);
		launchButton.click(function() {
			launchButton.hide();
			thiz.container.show();

			args.onexec = function(url, dest) {
				Module.print('loading '+dest+' ...');
			};
			args.done = function() {
				Module.print('initializing...');
				setTimeout(function() {
					thiz.doneLoadingFilesystem();
				}, 1);
			};
			executeLuaVMFileSet(args);
		});
	},
	doneLoadingFilesystem : function() {
		var thiz = this;

		//hook up input
		var processInput = function(s) {
			var cmd = thiz.input.val();
			thiz.history.push(cmd);
			while (thiz.history.length > thiz.HISTORY_MAX) thiz.history.shift();
			thiz.historyIndex = thiz.history.length;
			thiz.executeAndPrint(cmd);
			thiz.input.val('');
		};
		this.inputGo.click(processInput);
		this.input.keypress(function(e) {
			if (e.which == 13) {
				e.preventDefault();
				processInput();
			}
		});
		this.input.keydown(function(e) {
			if (e.keyCode == 38) {	//up
				console.log('up');
				thiz.historyIndex--;
				if (thiz.historyIndex < 0) thiz.historyIndex = 0;
				if (thiz.historyIndex >= 0 && thiz.historyIndex < thiz.history.length) {
					thiz.input.val(thiz.history[thiz.historyIndex]);
				}
			} else if (e.keyCode == 40) {	//down
				console.log('down');
				thiz.historyIndex++;
				if (thiz.historyIndex > thiz.history.length) thiz.historyIndex = thiz.history.length;
				if (thiz.historyIndex >= 0 && thiz.historyIndex < thiz.history.length) {
					thiz.input.val(thiz.history[thiz.historyIndex]);
				}
			} 
		});

		//provide test buttons
		if (this.tests) {
			$.each(this.tests, function(_,info) {
				$('<a>', {
					href:info.url, 
					text:'[View]', 
					target:'_blank',
					css : {'padding-right' : '10px'}
				}).appendTo(thiz.container);
				$('<button>', {
					text:info.name, 
					click:function() { 
						thiz.executeAndPrint("dofile '"+info.dest+"'");
					}
				}).appendTo(thiz.container);
				$('<br>').appendTo(thiz.container);
			});
		}

		if (this.done) this.done();
	},
	executeAndPrint : function(s) {
		Module.print('> '+s);
		//todo whatever lua interpreter does for multi lines and printing return values
		Lua.execute(s);
	},
	printOutAndErr : function(s) {
		if (this.outputBuffer !== '') this.outputBuffer += '\n';
		this.outputBuffer += s
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

