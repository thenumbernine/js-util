// packages containing filesystem info, so emscripten-lua modules can pick which ones they want and load batches of files

const luaPackages = {
	['bignumber'] : [
		{from : '/lua/bignumber', to : 'bignumber', files : ['bignumber.lua']},
		{from : '/lua/bignumber/tests', to : 'bignumber/tests', files : ['test.lua']},
	],
	['bit'] : [{from : '/lua/bit', to : 'bit', files : ['bit.lua']}],
	['complex'] : [{from : '/lua/complex', to : 'complex', files : ['complex.lua']}],
	['dkjson'] : [{from : '/lua/dkjson', to : 'dkjson', files : ['dkjson.lua']}],
	['gnuplot'] : [{from : '/lua/gnuplot', to : 'gnuplot', files : ['gnuplot.lua']}],
	['template'] : [{from : '/lua/template', to : 'template', files : ['output.lua', 'showcode.lua', 'template.lua']}],
	['ext'] : [{from : '/lua/ext', to : 'ext', files : ['assert.lua', 'class.lua', 'cmdline.lua', 'coroutine.lua', 'ctypes.lua', 'debug.lua', 'detect_ffi.lua', 'detect_lfs.lua', 'detect_os.lua', 'env.lua', 'ext.lua', 'fromlua.lua', 'gc.lua', 'gcmem.lua', 'io.lua', 'load.lua', 'math.lua', 'meta.lua', 'number.lua', 'op.lua', 'os.lua', 'path.lua', 'range.lua', 'reload.lua', 'require.lua', 'string.lua', 'table.lua', 'timer.lua', 'tolua.lua', 'xpcall.lua']}],
	['struct'] : [{from : '/lua/struct', to : 'struct', files : ['struct.lua', 'test.lua']}],
	['modules'] : [{from : '/lua/modules', to : 'modules', files : ['module.lua', 'modules.lua']}],
	['vec-ffi'] : [{from : '/lua/vec-ffi', to : 'vec-ffi', files : ['box2f.lua', 'box2i.lua', 'box3f.lua', 'create_box.lua', 'create_plane.lua', 'create_quat.lua', 'create_vec2.lua', 'create_vec3.lua', 'create_vec.lua', 'plane2f.lua', 'plane3f.lua', 'quatd.lua', 'quatf.lua', 'suffix.lua', 'vec2b.lua', 'vec2d.lua', 'vec2f.lua', 'vec2i.lua', 'vec2s.lua', 'vec2sz.lua', 'vec2ub.lua', 'vec3b.lua', 'vec3d.lua', 'vec3f.lua', 'vec3i.lua', 'vec3s.lua', 'vec3sz.lua', 'vec3ub.lua', 'vec4b.lua', 'vec4d.lua', 'vec4f.lua', 'vec4i.lua', 'vec4ub.lua', 'vec-ffi.lua']}],
	['matrix'] : [{from : '/lua/matrix', to : 'matrix', files : ['curl.lua', 'determinant.lua', 'div.lua', 'ffi.lua', 'grad.lua', 'helmholtzinv.lua', 'index.lua', 'inverse.lua', 'lapinv.lua', 'matrix.lua']}],
	['csv'] : [{from : '/lua/csv', to : 'csv', files : ['csv.lua', 'tolua.lua']}],
	['stat'] : [{from : '/lua/stat', to : 'stat', files : ['bin.lua', 'set.lua', 'stat.lua']}],
	['gl'] : [{from : '/lua/gl', to : 'gl', files : ['arraybuffer.lua', 'attribute.lua', 'buffer.lua', 'call.lua', 'elementarraybuffer.lua', 'fbo.lua', 'geometry.lua', 'get.lua', 'gl.lua', 'gradienttex2d.lua', 'gradienttex.lua', 'hsvtex2d.lua', 'hsvtex.lua', 'intersect.lua', 'kernelprogram.lua', 'pingpong3d.lua', 'pingpong.lua', 'pixelpackbuffer.lua', 'pixelunpackbuffer.lua', 'program.lua', 'report.lua', 'sceneobject.lua', 'setup.lua', 'shader.lua', 'shaderstoragebuffer.lua', 'tex1d.lua', 'tex2d.lua', 'tex3d.lua', 'texbuffer.lua', 'texcube.lua', 'tex.lua', 'transformfeedbackbuffer.lua', 'types.lua', 'vertexarray.lua']}],
	['cl'] : [
		{from : '/lua/cl', to : 'cl', files : ['assert.lua', 'assertparam.lua', 'buffer.lua', 'checkerror.lua', 'cl.lua', 'commandqueue.lua', 'context.lua', 'device.lua', 'event.lua', 'getinfo.lua', 'imagegl.lua', 'kernel.lua', 'memory.lua', 'platform.lua', 'program.lua']},
		{from : '/lua/cl/obj', to : 'cl/obj', files : ['buffer.lua', 'domain.lua', 'env.lua', 'half.lua', 'kernel.lua', 'number.lua', 'program.lua', 'reduce.lua']},
		{from : '/lua/cl/tests', to : 'cl/tests', files : ['cpptest-obj.lua', 'cpptest-standalone.lua', 'getbin.lua', 'info.lua', 'obj.lua', 'obj-multi.lua', 'readme-test.lua', 'reduce.lua', 'test.lua']},
	],
	['image'] : [
		{from : '/lua/image', to : 'image', files : ['image.lua']},
		{from : '/lua/image/luajit', to : 'image/luajit', files : ['bmp.lua', 'fits.lua', 'gif.lua', 'image.lua', 'jpeg.lua', 'loader.lua', 'png.lua', 'tiff.lua']},
	],
	['mesh'] : [
		{from : '/lua/mesh', to : 'mesh', files : ['chopupboxes2.lua', 'chopupboxes.lua', 'clipcube.lua', 'combine.lua', 'common.lua', 'earcut.lua', 'edgegraph.lua', 'filtermtls.lua', 'mesh.lua', 'objloader.lua', 'resave.lua', 'tilemesh.lua', 'tileview.lua', 'unwrapuvs.lua', 'view.lua']},
		{from : '/lua/mesh/meshes', to : 'mesh/meshes', files : ['cube.mtl', 'hue.png', 'cube.obj', 'cube-rgb.obj', 'cube-yup-zback.obj', 'cube-zup-xfwd.obj']},
	],
	['audio'] : [
		{from : '/lua/audio', to : 'audio', files : ['audio.lua', 'buffer.lua', 'currentsystem.lua', 'source.lua']},
		{from : '/lua/audio/null', to : 'audio/null', files : ['audio.lua', 'buffer.lua', 'source.lua']},
	],
	['sdl'] : [
		{from : '/lua/sdl', to : 'sdl', files : ['app.lua', 'assert.lua', 'sdl.lua', 'tests/test.lua']},
	],
	['glapp'] : [
		{from : '/lua/glapp', to : 'glapp', files : ['glapp.lua', 'mouse.lua', 'orbit.lua', 'view.lua']},
		{from : '/lua/glapp/tests', to : 'glapp/tests', files : ['compute.lua', 'compute-spirv.lua', 'cubemap.lua', 'events.lua', 'info.lua', 'minimal.lua', 'pointtest.lua', 'test_es_directcalls.lua', 'test_tex.lua', 'test_es.lua', 'test.lua', 'test_vertexattrib.lua', 'transformFeedbackTest.lua', 'src.png']},
	],
	['imgui'] : [{from : '/lua/imgui', to : 'imgui', files : ['imgui.lua']}],
	['imguiapp'] : [
		{from : '/lua/imguiapp', to : 'imguiapp', files : ['imguiapp.lua', 'withorbit.lua']},
		{from : '/lua/imguiapp/tests', to : 'imguiapp/tests', files : ['console.lua', 'demo.lua', 'font.lua']},
	],
	['line-integral-convolution'] : [{from : '/lua/line-integral-convolution', to : 'line-integral-convolution', files : ['run.lua']}],
	['rule110'] : [{from : '/lua/rule110', to : 'rule110', files : ['rule110.lua']}],
	['n-points'] : [{from : '/lua/n-points', to : 'n-points', files : ['run.lua', 'run_orbit.lua']}],
	['seashell'] : [
		{from : '/lua/seashell', to : 'seashell', files : ['eqn.lua', 'run.lua', 'cached-eqns.glsl']},
		{from : '/lua/seashell/cloudy', to : 'seashell/cloudy', files : ['bluecloud_bk.jpg', 'bluecloud_dn.jpg', 'bluecloud_ft.jpg', 'bluecloud_lf.jpg', 'bluecloud_rt.jpg', 'bluecloud_up.jpg', 'browncloud_bk.jpg', 'browncloud_dn.jpg', 'browncloud_ft.jpg', 'browncloud_lf.jpg', 'browncloud_rt.jpg', 'browncloud_up.jpg', 'graycloud_bk.jpg', 'graycloud_dn.jpg', 'graycloud_ft.jpg', 'graycloud_lf.jpg', 'graycloud_rt.jpg', 'graycloud_up.jpg', 'yellowcloud_bk.jpg', 'yellowcloud_dn.jpg', 'yellowcloud_ft.jpg', 'yellowcloud_lf.jpg', 'yellowcloud_rt.jpg', 'yellowcloud_up.jpg']},
	],
	['symmath'] : [
		{from : '/lua/symmath', to : 'symmath', files : ['abs.lua', 'acosh.lua', 'acos.lua', 'Array.lua', 'asinh.lua', 'asin.lua', 'atan2.lua', 'atanh.lua', 'atan.lua', 'cbrt.lua', 'clone.lua', 'commutativeRemove.lua', 'conj.lua', 'Constant.lua', 'cosh.lua', 'cos.lua', 'Derivative.lua', 'distributeDivision.lua', 'eval.lua', 'expand.lua', 'exp.lua', 'Expression.lua', 'factorDivision.lua', 'factorial.lua', 'factorLinearSystem.lua', 'factor.lua', 'Function.lua', 'hasChild.lua', 'Heaviside.lua', 'Im.lua', 'Integral.lua', 'Invalid.lua', 'Limit.lua', 'log.lua', 'make_README.lua', 'map.lua', 'Matrix.lua', 'multiplicity.lua', 'namespace.lua', 'polyCoeffs.lua', 'polydiv.lua', 'prune.lua', 'Re.lua', 'replace.lua', 'setup.lua', 'simplify.lua', 'sinh.lua', 'sin.lua', 'solve.lua', 'sqrt.lua', 'Sum.lua', 'symmath.lua', 'tableCommutativeEqual.lua', 'tanh.lua', 'tan.lua', 'taylor.lua', 'Tensor.lua', 'tidy.lua', 'TotalDerivative.lua', 'UserFunction.lua', 'Variable.lua', 'Vector.lua', 'Wildcard.lua']},
		{from : '/lua/symmath/export', to : 'symmath/export', files : ['C.lua', 'Console.lua', 'Export.lua', 'GnuPlot.lua', 'JavaScript.lua', 'Language.lua', 'LaTeX.lua', 'Lua.lua', 'Mathematica.lua', 'MathJax.lua', 'MultiLine.lua', 'SingleLine.lua', 'SymMath.lua', 'Verbose.lua']},
		{from : '/lua/symmath/matrix', to : 'symmath/matrix', files : ['determinant.lua', 'diagonal.lua', 'eigen.lua', 'EulerAngles.lua', 'exp.lua', 'hermitian.lua', 'identity.lua', 'inverse.lua', 'nullspace.lua', 'pseudoInverse.lua', 'Rotation.lua', 'trace.lua', 'transpose.lua']},
		{from : '/lua/symmath/op', to : 'symmath/op', files : ['add.lua', 'approx.lua', 'Binary.lua', 'div.lua', 'eq.lua', 'Equation.lua', 'ge.lua', 'gt.lua', 'le.lua', 'lt.lua', 'mod.lua', 'mul.lua', 'ne.lua', 'pow.lua', 'sub.lua', 'unm.lua']},
		{from : '/lua/symmath/physics', to : 'symmath/physics', files : ['diffgeom.lua', 'Faraday.lua', 'MatrixBasis.lua', 'StressEnergy.lua', 'units.lua']},
		{from : '/lua/symmath/set', to : 'symmath/set', files : ['Complex.lua', 'EvenInteger.lua', 'Integer.lua', 'Natural.lua', 'Null.lua', 'OddInteger.lua', 'RealInterval.lua', 'RealSubset.lua', 'Set.lua', 'sets.lua', 'Universal.lua']},
		{from : '/lua/symmath/tests', to : 'symmath/tests', files : ['Acoustic Black Hole.lua', 'ADM formalism.lua', 'ADM gravity using expressions.lua', 'ADM Levi-Civita.lua', 'ADM metric.lua', 'ADM metric - mixed.lua', 'Alcubierre.lua', 'black hole brain.lua', 'BSSN - generate.lua', 'BSSN - index - cache.lua', 'BSSN - index.lua', 'Building Curvature by ADM.lua', 'console_spherical_metric.lua', 'Divergence Theorem in curvilinear coordinates.lua', 'EFE discrete solution - 1-var.lua', 'EFE discrete solution - 2-var.lua', 'Einstein field equations - expression.lua', 'Ernst.lua', 'Euler Angles in Higher Dimensions.lua', 'Euler fluid equations - flux eigenvectors.lua', 'Euler fluid equations - primitive form.lua', 'Faraday tensor in general relativity.lua', 'Faraday tensor in special relativity.lua', 'Finite Difference Coefficients.lua', 'FiniteVolume.lua', 'FLRW.lua', 'GLM-Maxwell equations - flux eigenvectors.lua', 'Gravitation 16.1 - dense.lua', 'Gravitation 16.1 - expression.lua', 'Gravitation 16.1 - mixed.lua', 'hydrodynamics.lua', 'hyperbolic gamma driver in ADM terms.lua', 'imperial units.lua', 'Kaluza-Klein - dense.lua', 'Kaluza-Klein - index.lua', 'Kaluza-Klein - real world values.lua', 'Kaluza-Klein - varying scalar field - index.lua', 'Kerr metric of Earth.lua', 'Kerr-Schild degenerate case.lua', 'Kerr-Schild - dense.lua', 'Kerr-Schild - expression.lua', 'KOE.lua', 'Lorentz group.lua', 'MakeTrigLookupTables.lua', 'Maxwell equations - flux eigenvectors.lua', 'metric catalog.lua', 'MHD - flux eigenvectors.lua', 'MHD inverse.lua', 'MHD symmetrization.lua', 'natural units.lua', 'Navier-Stokes-Wilcox - flux eigenvectors.lua', 'Newton method.lua', 'numeric integration.lua', 'Platonic Solids.lua', 'remove beta from adm metric.lua', 'rotation group.lua', 'run all tests.lua', 'scalar metric.lua', 'Schwarzschild - isotropic.lua', 'Schwarzschild - spherical - derivation.lua', 'Schwarzschild - spherical - derivation - varying time 2.lua', 'Schwarzschild - spherical - derivation - varying time.lua', 'Schwarzschild - spherical.lua', 'Schwarzschild - spherical - mass varying with time.lua', 'Shallow Water equations - flux eigenvectors.lua', 'simple_ag.lua', 'spacetime embedding radius.lua', 'spinors.lua', 'spring force.lua', 'SRHD_1D.lua', 'SRHD.lua', 'sum of two metrics.lua', 'tensor coordinate invariance.lua', 'TOV.lua', 'toy-1+1 spacetime.lua', 'wave equation in spacetime - flux eigenvectors.lua', 'wave equation in spacetime.lua', 'Z4 - flux PDE noSource.lua', 'Z4 - flux PDE noSource usingOnlyUs.lua', 'Z4.lua']},
		{from : '/lua/symmath/tests/electrovacuum', to : 'symmath/tests/electrovacuum', files : ['black hole electron.lua', 'general case.lua', 'infinite wire.lua', 'infinite wire no charge.lua', 'uniform field - Cartesian.lua', 'uniform field - cylindrical.lua', 'uniform field - spherical.lua', 'verify cylindrical transform.lua']},
		{from : '/lua/symmath/tests/unit', to : 'symmath/tests/unit', files : ['compile.lua', 'determinant_performance.lua', 'export.lua', 'func.lua', 'getIndexesUsed.lua', 'index_construction.lua', 'integral.lua', 'limit.lua', 'linear solver.lua', 'match.lua', 'Matrix eigen.lua', 'matrix.lua', 'notfinite.lua', 'plot.lua', 'polyCoeffs.lua', 'polydiv.lua', 'replaceIndex.lua', 'replace.lua', 'run all tests.lua', 'sets.lua', 'simplifyMetrics.lua', 'solve.lua', 'sqrt.lua', 'symmetrizeIndexes.lua', 'tensor sub-assignment.lua', 'tensor sub-index.lua', 'tensor use case.lua', 'test.lua', 'tidyIndexes.lua', 'unit.lua', 'Variable dependsOn.lua']},
		{from : '/lua/symmath/tensor', to : 'symmath/tensor', files : ['Chart.lua', 'DenseCache.lua', 'dual.lua', 'Index.lua', 'KronecherDelta.lua', 'LeviCivita.lua', 'Manifold.lua', 'Ref.lua', 'symbols.lua', 'wedge.lua']},
		{from : '/lua/symmath/visitor', to : 'symmath/visitor', files : ['DistributeDivision.lua', 'Expand.lua', 'ExpandPolynomial.lua', 'FactorDivision.lua', 'Factor.lua', 'Prune.lua', 'Tidy.lua', 'Visitor.lua']},
	],
	['geographic-charts'] : [{from : '/lua/geographic-charts', to : 'geographic-charts', files : ['buildall.lua', 'code.lua', 'geographic-charts.lua', 'test.lua', 'earth-color.png']}],
	['prime-spiral'] : [{from : '/lua/prime-spiral', to : 'prime-spiral', files : ['run.lua', 'pi']}],
	['fibonacci-modulo'] : [{from : '/lua/fibonacci-modulo', to : 'fibonacci-modulo', files : ['run.lua', 'fibonacci.lua']}],
	['lambda-cdm'] : [{from : '/lua/lambda-cdm', to : 'lambda-cdm', files : ['bisect.lua', 'run.lua']}],
	['surface-from-connection'] : [{from : '/lua/surface-from-connection', to : 'surface-from-connection', files : ['run.lua']}],
	['SphericalHarmonicGraphs'] : [{from : '/lua/SphericalHarmonicGraphs', to : 'SphericalHarmonicGraphs', files : ['associatedlegendre.lua', 'factorial.lua', 'plot_associatedlegendre.lua', 'run.lua', 'sphericalharmonics.lua']}],
	['sand-attack'] : [
		{from : '/lua/sand-attack', to : 'sand-attack', files : ['app.lua', 'player.lua', 'run.lua', 'serialize.lua', 'splash.demo']}, // isn't in the repo: 'config.lua'
		{from : '/lua/sand-attack/font', to : 'sand-attack/font', files : ['Billow twirl Demo.ttf', 'Billow twirl Demo.url']},
		{from : '/lua/sand-attack/menu', to : 'sand-attack/menu', files : ['config.lua', 'highscore.lua', 'main.lua', 'menu.lua', 'newgame.lua', 'playerkeys.lua', 'playing.lua', 'splashscreen.lua']},
		//sand-attack/music : [{from : '/lua/sand-attack/music', to : 'sand-attack/music', files : ['Desert-City.ogg', 'Exotic-Plains.ogg', 'Ibn-Al-Noor.ogg', 'Market_Day.ogg', 'Return-of-the-Mummy.ogg', 'temple-of-endless-sands.ogg', 'wombat-noises-audio-the-legend-of-narmer.ogg']}],
		{from : '/lua/sand-attack/sandmodel', to : 'sand-attack/sandmodel', files : ['all.lua', 'automatacpu.lua', 'automatagpu.lua', 'cfd.lua', 'sandmodel.lua', 'sph.lua']},
		{from : '/lua/sand-attack/sfx', to : 'sand-attack/sfx', files : ['levelup.url', 'levelup.wav', 'line.url', 'line.wav', 'place.url', 'place.wav']},
		{from : '/lua/sand-attack/tex', to : 'sand-attack/tex', files : ['splash.png', 'youlose.png']},
		//sand-attack/highscores : [{from : '/lua/sand-attack/highscores', to : 'sand-attack/highscores', files : ['2024-06-21-22-05-44.demo']}],	// ... isn't in the repo ... interesting, mkdir didn't seem to work ... also interesting making an empty dir ?
	],
	['htmlparser'] : [
		{from : '/lua/htmlparser', to : 'htmlparser', files : ['common.lua', 'htmlparser.lua', 'xpath.lua']},
		{from : '/lua/htmlparser/tests', to : 'htmlparser/tests', files : ['dominion-from-diehrstraits.lua', 'dominion.lua', 'exportITunesPlaylist.lua', 'prettyprint.lua', 'yqlkey.lua']},
	],
	['parser'] : [
		{from : '/lua/parser', to : 'parser', files : ['load_xform.lua', 'parser.lua', 'syntax_5.1.txt', 'syntax_5.2.txt', 'syntax_5.3.txt', 'syntax_5.4.txt', 'syntax_ast_5.1.txt', 'syntax_grammar.txt']},
		{from : '/lua/parser/base', to : 'parser/base', files : ['ast.lua', 'datareader.lua', 'parser.lua', 'tokenizer.lua']},
		{from : '/lua/parser/grammar', to : 'parser/grammar', files : ['parser.lua', 'tokenizer.lua']},
		{from : '/lua/parser/lua', to : 'parser/lua', files : ['ast.lua', 'parser.lua', 'tokenizer.lua']},
		{from : '/lua/parser/tests', to : 'parser/tests', files : ['flatten.lua', 'lua_to_c.lua', 'lua_to_c_test.lua', 'minify_tests.lua', 'minify_tests.txt', 'parse.lua', 'spantest.lua']},
	],
	['tensor'] : [
		{from : '/lua/tensor', to : 'tensor', files : ['delta.lua', 'index.lua', 'layer.lua', 'matrix.lua', 'notebook.lua', 'representation.lua', 'tensor.lua']},
		{from : '/lua/tensor/tests', to : 'tensor/tests', files : ['delta.lua', 'inverse.lua', 'metric.lua', 'test.lua']},
	],
	['plot2d'] : [
		{from : '/lua/plot2d', to : 'plot2d', files : ['app.lua', 'plot2d.lua', 'run.lua', 'font.png']},
	],
	['plot3d'] : [
		{from : '/lua/plot3d', to : 'plot3d', files : ['plot3d.lua', 'run.lua', 'font.png']},
	],
	['vec'] : [
		{from : '/lua/vec', to : 'vec', files : ['box2.lua', 'box3.lua', 'create.lua', 'quat.lua', 'vec2.lua', 'vec3.lua', 'vec4.lua', 'vec.lua']},
	],
	['gui'] : [
		{from : '/lua/gui', to : 'gui', files : ['font.lua', 'gui.lua', 'timer.lua', 'widget.lua']},
		{from : '/lua/gui/widget', to : 'gui/widget', files : ['scrollareabar.lua', 'scrollarea.lua', 'scrollbar.lua', 'scrollcontainer.lua', 'scrolltab.lua', 'textfield.lua', 'text.lua']},
	],
	['sphere-grid'] : [
		{from : '/lua/sphere-grid', to : 'sphere-grid', files : ['run.lua']},
	],
	['make'] : [
		{from : '/lua/make', to : 'make', files : ['clean.lua', 'detect.lua', 'distclean.lua', 'env.lua', 'exec.lua', 'find.lua', 'make.lua', 'run.lua', 'targets.lua', 'writechanged.lua']},
	],
	['ips'] : [
		{from : '/lua/ips', to : 'ips', files : ['addheader.lua', 'ips.lua', 'makeips.lua']},
	],
	['super_metroid_randomizer'] : [
		{from : '/lua/super_metroid_randomizer', to : 'super_metroid_randomizer', files : ['blob.lua', 'config.lua', 'door.lua', 'doors.lua', 'enemies.lua', 'exprand.lua', 'item-scavenger.lua', 'items.lua', 'lz.lua', 'mapbg.lua', 'md5.lua', 'memorymap.lua', 'palette.lua', 'patches.lua', 'pc.lua', 'plm.lua', 'print-instrs.lua', 'randomizeworld.lua', 'roomblocks.lua', 'room.lua', 'rooms.lua', 'roomstate.lua', 'run.lua', 'sm-code.lua', 'sm-enemies.lua', 'sm-graphics.lua', 'sm-items.lua', 'sm.lua', 'sm-map.lua', 'sm-regions.lua', 'sm-samus.lua', 'smstruct.lua', 'sm-weapons.lua', 'tileset.lua', 'util.lua', 'vis.lua', 'weapons.lua', 'writerange.lua']},
	],
	['earth-magnetic-field'] : [
		{from : '/lua/earth-magnetic-field', to : 'earth-magnetic-field', files : ['run.lua', 'reduce.lua', 'wmm.cof', 'earth.png', 'calc_b.shader']},
	],

	// not in the /lua folder:
	['black-hole-skymap'] :  [
		{from : '/black-hole-skymap/lua', to : 'black-hole-skymap', files : ['black-hole-skymap.lua', 'black-hole-skymap-noniterative.lua', 'r_for_rho.lua']},
	],
	['topple'] :  [
		{from : '/cpp/Topple', to : 'topple', files : ['plot.lua', 'test.lua', 'topple-glsl.lua', 'topple-gpu-3d-display.lua', 'topple-gpu-display.lua', 'topple-gpu.lua']},
	],
};

export { luaPackages };
