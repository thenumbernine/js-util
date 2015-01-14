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
			{url:'/symbolic-lua/src/acos.lua', dest:'symmath/acos.lua'},
			{url:'/symbolic-lua/src/addOp.lua', dest:'symmath/addOp.lua'},
			{url:'/symbolic-lua/src/asin.lua', dest:'symmath/asin.lua'},
			{url:'/symbolic-lua/src/atan.lua', dest:'symmath/atan.lua'},
			{url:'/symbolic-lua/src/atan2.lua', dest:'symmath/atan2.lua'},
			{url:'/symbolic-lua/src/BinaryOp.lua', dest:'symmath/BinaryOp.lua'},
			{url:'/symbolic-lua/src/clone.lua', dest:'symmath/clone.lua'},
			{url:'/symbolic-lua/src/Constant.lua', dest:'symmath/Constant.lua'},
			{url:'/symbolic-lua/src/cos.lua', dest:'symmath/cos.lua'},
			{url:'/symbolic-lua/src/cosh.lua', dest:'symmath/cosh.lua'},
			{url:'/symbolic-lua/src/Derivative.lua', dest:'symmath/Derivative.lua'},
			{url:'/symbolic-lua/src/divOp.lua', dest:'symmath/divOp.lua'},
			{url:'/symbolic-lua/src/equals.lua', dest:'symmath/equals.lua'},
			{url:'/symbolic-lua/src/EquationOp.lua', dest:'symmath/EquationOp.lua'},
			{url:'/symbolic-lua/src/eval.lua', dest:'symmath/eval.lua'},
			{url:'/symbolic-lua/src/exp.lua', dest:'symmath/exp.lua'},
			{url:'/symbolic-lua/src/expand.lua', dest:'symmath/expand.lua'},
			{url:'/symbolic-lua/src/Expression.lua', dest:'symmath/Expression.lua'},
			{url:'/symbolic-lua/src/factor.lua', dest:'symmath/factor.lua'},
			{url:'/symbolic-lua/src/Function.lua', dest:'symmath/Function.lua'},
			{url:'/symbolic-lua/src/greaterThan.lua', dest:'symmath/greaterThan.lua'},
			{url:'/symbolic-lua/src/greaterThanOrEquals.lua', dest:'symmath/greaterThanOrEquals.lua'},
			{url:'/symbolic-lua/src/init.lua', dest:'symmath/init.lua'},
			{url:'/symbolic-lua/src/Invalid.lua', dest:'symmath/Invalid.lua'},
			{url:'/symbolic-lua/src/lessThan.lua', dest:'symmath/lessThan.lua'},
			{url:'/symbolic-lua/src/lessThanOrEquals.lua', dest:'symmath/lessThanOrEquals.lua'},
			{url:'/symbolic-lua/src/log.lua', dest:'symmath/log.lua'},
			{url:'/symbolic-lua/src/map.lua', dest:'symmath/map.lua'},
			{url:'/symbolic-lua/src/matrix/determinant.lua', dest:'symmath/matrix/determinant.lua'},
			{url:'/symbolic-lua/src/matrix/identity.lua', dest:'symmath/matrix/identity.lua'},
			{url:'/symbolic-lua/src/matrix/inverse.lua', dest:'symmath/matrix/inverse.lua'},
			{url:'/symbolic-lua/src/matrix/transpose.lua', dest:'symmath/matrix/transpose.lua'},
			{url:'/symbolic-lua/src/Matrix.lua', dest:'symmath/Matrix.lua'},
			{url:'/symbolic-lua/src/modOp.lua', dest:'symmath/modOp.lua'},
			{url:'/symbolic-lua/src/mulOp.lua', dest:'symmath/mulOp.lua'},
			{url:'/symbolic-lua/src/nodeCommutativeEqual.lua', dest:'symmath/nodeCommutativeEqual.lua'},
			{url:'/symbolic-lua/src/notebook.lua', dest:'symmath/notebook.lua'},
			{url:'/symbolic-lua/src/polyCoeffs.lua', dest:'symmath/polyCoeffs.lua'},
			{url:'/symbolic-lua/src/powOp.lua', dest:'symmath/powOp.lua'},
			{url:'/symbolic-lua/src/primeFactors.lua', dest:'symmath/primeFactors.lua'},
			{url:'/symbolic-lua/src/prune.lua', dest:'symmath/prune.lua'},
			{url:'/symbolic-lua/src/replace.lua', dest:'symmath/replace.lua'},
			{url:'/symbolic-lua/src/simplify.lua', dest:'symmath/simplify.lua'},
			{url:'/symbolic-lua/src/sin.lua', dest:'symmath/sin.lua'},
			{url:'/symbolic-lua/src/singleton/Eval.lua', dest:'symmath/singleton/Eval.lua'},
			{url:'/symbolic-lua/src/singleton/Expand.lua', dest:'symmath/singleton/Expand.lua'},
			{url:'/symbolic-lua/src/singleton/ExpandPolynomial.lua', dest:'symmath/singleton/ExpandPolynomial.lua'},
			{url:'/symbolic-lua/src/singleton/Factor.lua', dest:'symmath/singleton/Factor.lua'},
			{url:'/symbolic-lua/src/singleton/Prune.lua', dest:'symmath/singleton/Prune.lua'},
			{url:'/symbolic-lua/src/singleton/Tidy.lua', dest:'symmath/singleton/Tidy.lua'},
			{url:'/symbolic-lua/src/singleton/Visitor.lua', dest:'symmath/singleton/Visitor.lua'},
			{url:'/symbolic-lua/src/sinh.lua', dest:'symmath/sinh.lua'},
			{url:'/symbolic-lua/src/solve.lua', dest:'symmath/solve.lua'},
			{url:'/symbolic-lua/src/sqrt.lua', dest:'symmath/sqrt.lua'},
			{url:'/symbolic-lua/src/subOp.lua', dest:'symmath/subOp.lua'},
			{url:'/symbolic-lua/src/symmath.lua', dest:'symmath/symmath.lua'},
			{url:'/symbolic-lua/src/tableCommutativeEqual.lua', dest:'symmath/tableCommutativeEqual.lua'},
			{url:'/symbolic-lua/src/tan.lua', dest:'symmath/tan.lua'},
			{url:'/symbolic-lua/src/tanh.lua', dest:'symmath/tanh.lua'},
			{url:'/symbolic-lua/src/Tensor.lua', dest:'symmath/Tensor.lua'},
			{url:'/symbolic-lua/src/tensorhelp.lua', dest:'symmath/tensorhelp.lua'},
			{url:'/symbolic-lua/src/tidy.lua', dest:'symmath/tidy.lua'},
			{url:'/symbolic-lua/src/tostring/JavaScript.lua', dest:'symmath/tostring/JavaScript.lua'},
			{url:'/symbolic-lua/src/tostring/Language.lua', dest:'symmath/tostring/Language.lua'},
			{url:'/symbolic-lua/src/tostring/LaTeX.lua', dest:'symmath/tostring/LaTeX.lua'},
			{url:'/symbolic-lua/src/tostring/Lua.lua', dest:'symmath/tostring/Lua.lua'},
			{url:'/symbolic-lua/src/tostring/MathJax.lua', dest:'symmath/tostring/MathJax.lua'},
			{url:'/symbolic-lua/src/tostring/MultiLine.lua', dest:'symmath/tostring/MultiLine.lua'},
			{url:'/symbolic-lua/src/tostring/SingleLine.lua', dest:'symmath/tostring/SingleLine.lua'},
			{url:'/symbolic-lua/src/tostring/ToString.lua', dest:'symmath/tostring/ToString.lua'},
			{url:'/symbolic-lua/src/tostring/Verbose.lua', dest:'symmath/tostring/Verbose.lua'},
			{url:'/symbolic-lua/src/unmOp.lua', dest:'symmath/unmOp.lua'},
			{url:'/symbolic-lua/src/Variable.lua', dest:'symmath/Variable.lua'},
			{url:'/symbolic-lua/src/Vector.lua', dest:'symmath/Vector.lua'}
		],
		/*tests : [
			{url:'/symbolic-lua/src/tests/alcubierre.lua', dest:'symmath/tests/alcubierre.lua', name:'Alcubierre Warp Bubble Geodesic'},
			//{url:'/symbolic-lua/src/tests/flrw.lua', dest:'symmath/tests/flrw.lua'},
			{url:'/symbolic-lua/src/tests/gravitation_16_1.lua', dest:'symmath/tests/gravitation_16_1.lua', name:'Gravitation by M.T.W. Ch.16 Prob.1'},
			//{url:'/symbolic-lua/src/tests/kaluza-klein.lua', dest:'symmath/tests/kaluza-klein.lua'},
			{url:'/symbolic-lua/src/tests/kerr_cartesian.lua', dest:'symmath/tests/kerr_cartesian.lua', name:'Kerr Cartesian Metric'},
			{url:'/symbolic-lua/src/tests/linearized_euler_hydrodynamic_equations.lua', dest:'symmath/tests/linearized_euler_hydrodynamic_equations.lua', name:'Linearizing Euler Hydrodynamic Equations'},
			{url:'/symbolic-lua/src/tests/matrix.lua', dest:'symmath/tests/matrix.lua', name:'Matrix Test'},
			{url:'/symbolic-lua/src/tests/metric.lua', dest:'symmath/tests/metric.lua', name:'Metric Test'},
			{url:'/symbolic-lua/src/tests/mhd_symmetrization.lua', dest:'symmath/tests/mhd_symmetrization.lua', name:'Linearizing MHD Equations'},
			{url:'/symbolic-lua/src/tests/newunits.lua', dest:'symmath/tests/newunits.lua', name:'Units of Measurement (using equations)'},
			//{url:'/symbolic-lua/src/tests/numeric_integration.lua', dest:'symmath/tests/numeric_integration.lua'},
			{url:'/symbolic-lua/src/tests/polar_geodesic.lua', dest:'symmath/tests/polar_geodesic.lua', name:'Polar Geodesic'},
			{url:'/symbolic-lua/src/tests/schwarzschild_cartesian.lua', dest:'symmath/tests/schwarzschild_cartesian.lua', name:'Schwarzschild Cartesian Metric'},
			{url:'/symbolic-lua/src/tests/schwarzschild_spherical.lua', dest:'symmath/tests/schwarzschild_spherical.lua', name:'Schwarzschild Spherical Metric'},
			{url:'/symbolic-lua/src/tests/spherical_geodesic.lua', dest:'symmath/tests/spherical_geodesic.lua', name:'Spherical Geodesic'},
			//{url:'/symbolic-lua/src/tests/spring_force.lua', dest:'symmath/tests/spring_force.lua'},
			{url:'/symbolic-lua/src/tests/test.lua', dest:'symmath/tests/test.lua', name:'validation test'},
			{url:'/symbolic-lua/src/tests/units.lua', dest:'symmath/tests/units.lua', name:'Units of Measurement'}
		]*/
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
			css : {
				width : '80em',
				height : '24em',
				border : '1px solid black',
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
		this.input.attr('autocomplete', 'off');		
		this.input.attr('autocorrect', 'off');		
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

		if (args.autoLaunch) this.launchButton.click();
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
		$('<button>', {
			text:info.name, 
			click:function() { 
				thiz.executeAndPrint("dofile '"+info.dest+"'");
			}
		}).appendTo(div);
		return div;
	},
	execute : function(s) {
		Lua.execute('xpcall(function() '+s+'\n end, function(err) io.stderr:write(err.."\\n"..debug.traceback()) end)');
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

