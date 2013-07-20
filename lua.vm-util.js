// some helper functions for using lua.vm.js
// I want this to turn into an in-page filesystem + lua interpreter
//assumes lua.vm.js and util.js are already loaded 

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
	if (args.ext) {
		var extFiles = [
			'class.lua',
			'init.lua',
			'io.lua',
			'math.lua',
			'serialize.lua',
			'string.lua',
			'table.lua'
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
*/
var EmbeddedLuaInterpreter = makeClass({
	init : function(args) {
		var thiz = this;
		
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
				thiz.doneLoadingFilesystem();
			};
			executeLuaVMFileSet(args);
		});
	},
	doneLoadingFilesystem : function() {
		var thiz = this;

		//hook up input
		var processInput = function(s) {
			thiz.executeAndPrint(thiz.input.val());
			thiz.input.val('');
		};
		this.inputGo.click(processInput);
		this.input.keypress(function(e) {
			if (e.which == 13) {
				e.preventDefault();
				processInput();
			}
		});
	
		if (this.done) this.done();
	},
	executeAndPrint : function(s) {
		Module.print('> '+s);
		Lua.execute(s);
	},
	printOutAndErr : function(s) {
		console.log("print: "+s);
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

