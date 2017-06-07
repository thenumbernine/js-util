/*
Some helper functions for using lua.vm.js
I want this to turn into an in-page filesystem + lua interpreter.
This assumes util.js is already loaded.  This loads lua.vm.js itself.  Maybe it shouldn't do that.
*/


var luaVmPackageInfos = {
	ext : {
		files : [
			{url:'/lua-ext/ext.lua', dest:'ext/ext.lua'},
			{url:'/lua-ext/table.lua', dest:'ext/table.lua'},
			{url:'/lua-ext/range.lua', dest:'ext/range.lua'},
			{url:'/lua-ext/os.lua', dest:'ext/os.lua'},
			{url:'/lua-ext/coroutine.lua', dest:'ext/coroutine.lua'},
			{url:'/lua-ext/file.lua', dest:'ext/file.lua'},
			{url:'/lua-ext/gcmem.lua', dest:'ext/gcmem.lua'},
			{url:'/lua-ext/io.lua', dest:'ext/io.lua'},
			{url:'/lua-ext/meta.lua', dest:'ext/meta.lua'},
			{url:'/lua-ext/class.lua', dest:'ext/class.lua'},
			{url:'/lua-ext/string.lua', dest:'ext/string.lua'},
			{url:'/lua-ext/tolua.lua', dest:'ext/tolua.lua'},
			{url:'/lua-ext/env.lua', dest:'ext/env.lua'},
			{url:'/lua-ext/reload.lua', dest:'ext/reload.lua'},
			{url:'/lua-ext/math.lua', dest:'ext/math.lua'}
		]
	},
	symmath : {
		files : [
			{url:'/symbolic-lua/src/symmath.lua', dest:'symmath/symmath.lua'},
			{url:'/symbolic-lua/src/physics/units.lua', dest:'symmath/physics/units.lua'},
			{url:'/symbolic-lua/src/physics/StressEnergy.lua', dest:'symmath/physics/StressEnergy.lua'},
			{url:'/symbolic-lua/src/physics/Faraday.lua', dest:'symmath/physics/Faraday.lua'},
			{url:'/symbolic-lua/src/physics/diffgeom.lua', dest:'symmath/physics/diffgeom.lua'},
			{url:'/symbolic-lua/src/nodeCommutativeEqual.lua', dest:'symmath/nodeCommutativeEqual.lua'},
			{url:'/symbolic-lua/src/simplify.lua', dest:'symmath/simplify.lua'},
			{url:'/symbolic-lua/src/Constant.lua', dest:'symmath/Constant.lua'},
			{url:'/symbolic-lua/src/matrix/identity.lua', dest:'symmath/matrix/identity.lua'},
			{url:'/symbolic-lua/src/matrix/trace.lua', dest:'symmath/matrix/trace.lua'},
			{url:'/symbolic-lua/src/matrix/inverse.lua', dest:'symmath/matrix/inverse.lua'},
			{url:'/symbolic-lua/src/matrix/transpose.lua', dest:'symmath/matrix/transpose.lua'},
			{url:'/symbolic-lua/src/matrix/diagonal.lua', dest:'symmath/matrix/diagonal.lua'},
			{url:'/symbolic-lua/src/matrix/determinant.lua', dest:'symmath/matrix/determinant.lua'},
			{url:'/symbolic-lua/src/matrix/pseudoInverse.lua', dest:'symmath/matrix/pseudoInverse.lua'},
			{url:'/symbolic-lua/src/js/embedded.js', dest:'symmath/js/embedded.js'},
			{url:'/symbolic-lua/src/sin.lua', dest:'symmath/sin.lua'},
			{url:'/symbolic-lua/src/factorLinearSystem.lua', dest:'symmath/factorLinearSystem.lua'},
			{url:'/symbolic-lua/src/Sum.lua', dest:'symmath/Sum.lua'},
			{url:'/symbolic-lua/src/eval.lua', dest:'symmath/eval.lua'},
			{url:'/symbolic-lua/src/atan.lua', dest:'symmath/atan.lua'},
			{url:'/symbolic-lua/src/cosh.lua', dest:'symmath/cosh.lua'},
			{url:'/symbolic-lua/src/exp.lua', dest:'symmath/exp.lua'},
			{url:'/symbolic-lua/src/Expression.lua', dest:'symmath/Expression.lua'},
			{url:'/symbolic-lua/src/acos.lua', dest:'symmath/acos.lua'},
			{url:'/symbolic-lua/src/prune.lua', dest:'symmath/prune.lua'},
			{url:'/symbolic-lua/src/tanh.lua', dest:'symmath/tanh.lua'},
			{url:'/symbolic-lua/src/asin.lua', dest:'symmath/asin.lua'},
			{url:'/symbolic-lua/src/tostring/MathJax.lua', dest:'symmath/tostring/MathJax.lua'},
			{url:'/symbolic-lua/src/tostring/Verbose.lua', dest:'symmath/tostring/Verbose.lua'},
			{url:'/symbolic-lua/src/tostring/C.lua', dest:'symmath/tostring/C.lua'},
			{url:'/symbolic-lua/src/tostring/LaTeX.lua', dest:'symmath/tostring/LaTeX.lua'},
			{url:'/symbolic-lua/src/tostring/ToString.lua', dest:'symmath/tostring/ToString.lua'},
			{url:'/symbolic-lua/src/tostring/JavaScript.lua', dest:'symmath/tostring/JavaScript.lua'},
			{url:'/symbolic-lua/src/tostring/Console.lua', dest:'symmath/tostring/Console.lua'},
			{url:'/symbolic-lua/src/tostring/MultiLine.lua', dest:'symmath/tostring/MultiLine.lua'},
			{url:'/symbolic-lua/src/tostring/GnuPlot.lua', dest:'symmath/tostring/GnuPlot.lua'},
			{url:'/symbolic-lua/src/tostring/Language.lua', dest:'symmath/tostring/Language.lua'},
			{url:'/symbolic-lua/src/tostring/SingleLine.lua', dest:'symmath/tostring/SingleLine.lua'},
			{url:'/symbolic-lua/src/tostring/Lua.lua', dest:'symmath/tostring/Lua.lua'},
			{url:'/symbolic-lua/src/sqrt.lua', dest:'symmath/sqrt.lua'},
			{url:'/symbolic-lua/src/log.lua', dest:'symmath/log.lua'},
			{url:'/symbolic-lua/src/tableCommutativeEqual.lua', dest:'symmath/tableCommutativeEqual.lua'},
			{url:'/symbolic-lua/src/Invalid.lua', dest:'symmath/Invalid.lua'},
			{url:'/symbolic-lua/src/expand.lua', dest:'symmath/expand.lua'},
			{url:'/symbolic-lua/src/Array.lua', dest:'symmath/Array.lua'},
			{url:'/symbolic-lua/src/solve.lua', dest:'symmath/solve.lua'},
			{url:'/symbolic-lua/src/map.lua', dest:'symmath/map.lua'},
			{url:'/symbolic-lua/src/atan2.lua', dest:'symmath/atan2.lua'},
			{url:'/symbolic-lua/src/Tensor.lua', dest:'symmath/Tensor.lua'},
			{url:'/symbolic-lua/src/Integral.lua', dest:'symmath/Integral.lua'},
			{url:'/symbolic-lua/src/clone.lua', dest:'symmath/clone.lua'},
			{url:'/symbolic-lua/src/tensor/LeviCivita.lua', dest:'symmath/tensor/LeviCivita.lua'},
			{url:'/symbolic-lua/src/tensor/TensorRef.lua', dest:'symmath/tensor/TensorRef.lua'},
			{url:'/symbolic-lua/src/tensor/TensorCoordBasis.lua', dest:'symmath/tensor/TensorCoordBasis.lua'},
			{url:'/symbolic-lua/src/tensor/TensorIndex.lua', dest:'symmath/tensor/TensorIndex.lua'},
			{url:'/symbolic-lua/src/Function.lua', dest:'symmath/Function.lua'},
			{url:'/symbolic-lua/src/tan.lua', dest:'symmath/tan.lua'},
			{url:'/symbolic-lua/src/op/mod.lua', dest:'symmath/op/mod.lua'},
			{url:'/symbolic-lua/src/op/ge.lua', dest:'symmath/op/ge.lua'},
			{url:'/symbolic-lua/src/op/le.lua', dest:'symmath/op/le.lua'},
			{url:'/symbolic-lua/src/op/mul.lua', dest:'symmath/op/mul.lua'},
			{url:'/symbolic-lua/src/op/lt.lua', dest:'symmath/op/lt.lua'},
			{url:'/symbolic-lua/src/op/div.lua', dest:'symmath/op/div.lua'},
			{url:'/symbolic-lua/src/op/sub.lua', dest:'symmath/op/sub.lua'},
			{url:'/symbolic-lua/src/op/gt.lua', dest:'symmath/op/gt.lua'},
			{url:'/symbolic-lua/src/op/add.lua', dest:'symmath/op/add.lua'},
			{url:'/symbolic-lua/src/op/eq.lua', dest:'symmath/op/eq.lua'},
			{url:'/symbolic-lua/src/op/pow.lua', dest:'symmath/op/pow.lua'},
			{url:'/symbolic-lua/src/op/ne.lua', dest:'symmath/op/ne.lua'},
			{url:'/symbolic-lua/src/op/unm.lua', dest:'symmath/op/unm.lua'},
			{url:'/symbolic-lua/src/op/Binary.lua', dest:'symmath/op/Binary.lua'},
			{url:'/symbolic-lua/src/op/Equation.lua', dest:'symmath/op/Equation.lua'},
			{url:'/symbolic-lua/src/factorDivision.lua', dest:'symmath/factorDivision.lua'},
			{url:'/symbolic-lua/src/README.md', dest:'symmath/README.md'},
			{url:'/symbolic-lua/src/complex.lua', dest:'symmath/complex.lua'},
			{url:'/symbolic-lua/src/cos.lua', dest:'symmath/cos.lua'},
			{url:'/symbolic-lua/src/factor.lua', dest:'symmath/factor.lua'},
			{url:'/symbolic-lua/src/Heaviside.lua', dest:'symmath/Heaviside.lua'},
			{url:'/symbolic-lua/src/visitor/Eval.lua', dest:'symmath/visitor/Eval.lua'},
			{url:'/symbolic-lua/src/visitor/Tidy.lua', dest:'symmath/visitor/Tidy.lua'},
			{url:'/symbolic-lua/src/visitor/Visitor.lua', dest:'symmath/visitor/Visitor.lua'},
			{url:'/symbolic-lua/src/visitor/Expand.lua', dest:'symmath/visitor/Expand.lua'},
			{url:'/symbolic-lua/src/visitor/ExpandPolynomial.lua', dest:'symmath/visitor/ExpandPolynomial.lua'},
			{url:'/symbolic-lua/src/visitor/DistributeDivision.lua', dest:'symmath/visitor/DistributeDivision.lua'},
			{url:'/symbolic-lua/src/visitor/Factor.lua', dest:'symmath/visitor/Factor.lua'},
			{url:'/symbolic-lua/src/visitor/FactorDivision.lua', dest:'symmath/visitor/FactorDivision.lua'},
			{url:'/symbolic-lua/src/visitor/Prune.lua', dest:'symmath/visitor/Prune.lua'},
			{url:'/symbolic-lua/src/replace.lua', dest:'symmath/replace.lua'},
			{url:'/symbolic-lua/src/sinh.lua', dest:'symmath/sinh.lua'},
			{url:'/symbolic-lua/src/Matrix.lua', dest:'symmath/Matrix.lua'},
			{url:'/symbolic-lua/src/Vector.lua', dest:'symmath/Vector.lua'},
			{url:'/symbolic-lua/src/polyCoeffs.lua', dest:'symmath/polyCoeffs.lua'},
			{url:'/symbolic-lua/src/primeFactors.lua', dest:'symmath/primeFactors.lua'},
			{url:'/symbolic-lua/src/Derivative.lua', dest:'symmath/Derivative.lua'},
			{url:'/symbolic-lua/src/tidy.lua', dest:'symmath/tidy.lua'},
			{url:'/symbolic-lua/src/distributeDivision.lua', dest:'symmath/distributeDivision.lua'},
			{url:'/symbolic-lua/src/abs.lua', dest:'symmath/abs.lua'},
			{url:'/symbolic-lua/src/Variable.lua', dest:'symmath/Variable.lua'}
		],
		tests : [
			{url:'/symbolic-lua/src/tests/ADM metric - mixed.lua', dest:'symmath/tests/ADM metric - mixed.lua'},
			{url:'/symbolic-lua/src/tests/ADM metric.lua', dest:'symmath/tests/ADM metric.lua'},
			{url:'/symbolic-lua/src/tests/Alcubierre.lua', dest:'symmath/tests/Alcubierre.lua'},
			{url:'/symbolic-lua/src/tests/EFE discrete solution - 1-var.lua', dest:'symmath/tests/EFE discrete solution - 1-var.lua'},
			{url:'/symbolic-lua/src/tests/EFE discrete solution - 2-var.lua', dest:'symmath/tests/EFE discrete solution - 2-var.lua'},
			{url:'/symbolic-lua/src/tests/Einstein field equations - expression.lua', dest:'symmath/tests/Einstein field equations - expression.lua'},
			{url:'/symbolic-lua/src/tests/FLRW.lua', dest:'symmath/tests/FLRW.lua'},
			{url:'/symbolic-lua/src/tests/Gravitation 16.1 - dense.lua', dest:'symmath/tests/Gravitation 16.1 - dense.lua'},
			{url:'/symbolic-lua/src/tests/Gravitation 16.1 - expression.lua', dest:'symmath/tests/Gravitation 16.1 - expression.lua'},
			{url:'/symbolic-lua/src/tests/Gravitation 16.1 - mixed.lua', dest:'symmath/tests/Gravitation 16.1 - mixed.lua'},
			{url:'/symbolic-lua/src/tests/Kaluza-Klein.lua', dest:'symmath/tests/Kaluza-Klein.lua'},
			{url:'/symbolic-lua/src/tests/Kerr - Cartesian.lua', dest:'symmath/tests/Kerr - Cartesian.lua'},
			{url:'/symbolic-lua/src/tests/MHD inverse.lua', dest:'symmath/tests/MHD inverse.lua'},
			{url:'/symbolic-lua/src/tests/MHD symmetrization.lua', dest:'symmath/tests/MHD symmetrization.lua'},
			{url:'/symbolic-lua/src/tests/Newton method.lua', dest:'symmath/tests/Newton method.lua'},
			{url:'/symbolic-lua/src/tests/SRHD.lua', dest:'symmath/tests/SRHD.lua'},
			{url:'/symbolic-lua/src/tests/Schwarzschild - Cartesian.lua', dest:'symmath/tests/Schwarzschild - Cartesian.lua'},
			{url:'/symbolic-lua/src/tests/Schwarzschild - spherical to Cartesian.lua', dest:'symmath/tests/Schwarzschild - spherical to Cartesian.lua'},
			{url:'/symbolic-lua/src/tests/Schwarzschild - spherical.lua', dest:'symmath/tests/Schwarzschild - spherical.lua'},
			{url:'/symbolic-lua/src/tests/electrovacuum/black hole electron.lua', dest:'symmath/tests/electrovacuum/black hole electron.lua'},
			{url:'/symbolic-lua/src/tests/electrovacuum/general case.lua', dest:'symmath/tests/electrovacuum/general case.lua'},
			{url:'/symbolic-lua/src/tests/electrovacuum/infinite wire no charge.lua', dest:'symmath/tests/electrovacuum/infinite wire no charge.lua'},
			{url:'/symbolic-lua/src/tests/electrovacuum/infinite wire.lua', dest:'symmath/tests/electrovacuum/infinite wire.lua'},
			{url:'/symbolic-lua/src/tests/electrovacuum/uniform field - Cartesian.lua', dest:'symmath/tests/electrovacuum/uniform field - Cartesian.lua'},
			{url:'/symbolic-lua/src/tests/electrovacuum/uniform field - cylindrical.lua', dest:'symmath/tests/electrovacuum/uniform field - cylindrical.lua'},
			{url:'/symbolic-lua/src/tests/electrovacuum/uniform field - spherical.lua', dest:'symmath/tests/electrovacuum/uniform field - spherical.lua'},
			{url:'/symbolic-lua/src/tests/electrovacuum/verify cylindrical transform.lua', dest:'symmath/tests/electrovacuum/verify cylindrical transform.lua'},
			{url:'/symbolic-lua/src/tests/hydrodynamics.lua', dest:'symmath/tests/hydrodynamics.lua'},
			{url:'/symbolic-lua/src/tests/linearized Euler fluid equations.lua', dest:'symmath/tests/linearized Euler fluid equations.lua'},
			{url:'/symbolic-lua/src/tests/metric catalog.lua', dest:'symmath/tests/metric catalog.lua'},
			{url:'/symbolic-lua/src/tests/natural units.lua', dest:'symmath/tests/natural units.lua'},
			{url:'/symbolic-lua/src/tests/numeric integration.lua', dest:'symmath/tests/numeric integration.lua'},
			{url:'/symbolic-lua/src/tests/rotation group.lua', dest:'symmath/tests/rotation group.lua'},
			{url:'/symbolic-lua/src/tests/run all tests.lua', dest:'symmath/tests/run all tests.lua'},
			{url:'/symbolic-lua/src/tests/scalar metric.lua', dest:'symmath/tests/scalar metric.lua'},
			{url:'/symbolic-lua/src/tests/spacetime embedding radius.lua', dest:'symmath/tests/spacetime embedding radius.lua'},
			{url:'/symbolic-lua/src/tests/spring force.lua', dest:'symmath/tests/spring force.lua'},
			{url:'/symbolic-lua/src/tests/tensor coordinate invariance.lua', dest:'symmath/tests/tensor coordinate invariance.lua'},
			{url:'/symbolic-lua/src/tests/toy-1+1 spacetime.lua', dest:'symmath/tests/toy-1+1 spacetime.lua'},
			{url:'/symbolic-lua/src/tests/unit/linear solver.lua', dest:'symmath/tests/unit/linear solver.lua'},
			{url:'/symbolic-lua/src/tests/unit/matrix.lua', dest:'symmath/tests/unit/matrix.lua'},
			{url:'/symbolic-lua/src/tests/unit/sub-tensor assignment.lua', dest:'symmath/tests/unit/sub-tensor assignment.lua'},
			{url:'/symbolic-lua/src/tests/unit/tensor use case.lua', dest:'symmath/tests/unit/tensor use case.lua'},
			{url:'/symbolic-lua/src/tests/unit/test.lua', dest:'symmath/tests/unit/test.lua'}
		]
	},
	tensor : {
		files : [
			{url:'/tensor-calculator/src/delta.lua', dest:'tensor/delta.lua'},
			{url:'/tensor-calculator/src/index.lua', dest:'tensor/index.lua'},
			{url:'/tensor-calculator/src/layer.lua', dest:'tensor/layer.lua'},
			{url:'/tensor-calculator/src/matrix.lua', dest:'tensor/matrix.lua'},
			{url:'/tensor-calculator/src/notebook.lua', dest:'tensor/notebook.lua'},
			{url:'/tensor-calculator/src/representation.lua', dest:'tensor/representation.lua'},
			{url:'/tensor-calculator/src/tensor.lua', dest:'tensor/tensor.lua'}
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
						
					} else if (file.dest.substring(file.dest.length-4) == '.lua') {
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
			text:info.name !== undefined ? info.name : info.dest, 
			click:function() { 
				thiz.executeAndPrint("dofile '"+info.dest+"'");
			}
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

