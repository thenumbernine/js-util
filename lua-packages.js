// packages containing filesystem info, so emscripten-lua modules can pick which ones they want and load batches of files
// TODO someday please autogen this file from rockspecs
// TODO merge this with lua.vm-util.js

// TODO autogen this remotely ... like i did in lua.vm-util.js.lua (NOTICE this matches lua.vm-util.js.*)
// or TODO autogen this from lua rockspec files?  and allow a GET param to a rockspec?  and in each repo provide rockspec dependencies?
const luaPackages = {
	bit : [{from : '/lua/bit', to : 'bit', files : ['bit.lua']}],
	template : [{from : '/lua/template', to : 'template', files : ['output.lua', 'showcode.lua', 'template.lua']}],
	ext : [{from : '/lua/ext', to : 'ext', files : ['assert.lua', 'class.lua', 'cmdline.lua', 'coroutine.lua', 'ctypes.lua', 'debug.lua', 'detect_ffi.lua', 'detect_lfs.lua', 'detect_os.lua', 'env.lua', 'ext.lua', 'fromlua.lua', 'gcmem.lua', 'io.lua', 'load.lua', 'math.lua', 'meta.lua', 'number.lua', 'op.lua', 'os.lua', 'path.lua', 'range.lua', 'reload.lua', 'require.lua', 'string.lua', 'table.lua', 'timer.lua', 'tolua.lua', 'xpcall.lua']}],
	struct : [{from : '/lua/struct', to : 'struct', files : ['struct.lua', 'test.lua']}],
	modules : [{from : '/lua/modules', to : 'modules', files : ['module.lua', 'modules.lua']}],
	['vec-ffi'] : [{from : '/lua/vec-ffi', to : 'vec-ffi', files : ['box2f.lua', 'box2i.lua', 'box3f.lua', 'create_box.lua', 'create_plane.lua', 'create_quat.lua', 'create_vec2.lua', 'create_vec3.lua', 'create_vec.lua', 'plane2f.lua', 'plane3f.lua', 'quatd.lua', 'quatf.lua', 'suffix.lua', 'vec2b.lua', 'vec2d.lua', 'vec2f.lua', 'vec2i.lua', 'vec2s.lua', 'vec2sz.lua', 'vec2ub.lua', 'vec3b.lua', 'vec3d.lua', 'vec3f.lua', 'vec3i.lua', 'vec3s.lua', 'vec3sz.lua', 'vec3ub.lua', 'vec4b.lua', 'vec4d.lua', 'vec4f.lua', 'vec4i.lua', 'vec4ub.lua', 'vec-ffi.lua']}],
	matrix : [{from : '/lua/matrix', to : 'matrix', files : ['curl.lua', 'determinant.lua', 'div.lua', 'ffi.lua', 'grad.lua', 'helmholtzinv.lua', 'index.lua', 'inverse.lua', 'lapinv.lua', 'matrix.lua']}],
	gl : [{from : '/lua/gl', to : 'gl', files : ['arraybuffer.lua', 'attribute.lua', 'buffer.lua', 'call.lua', 'elementarraybuffer.lua', 'fbo.lua', 'geometry.lua', 'get.lua', 'gl.lua', 'gradienttex2d.lua', 'gradienttex.lua', 'hsvtex2d.lua', 'hsvtex.lua', 'intersect.lua', 'kernelprogram.lua', 'pingpong3d.lua', 'pingpong.lua', 'pixelpackbuffer.lua', 'pixelunpackbuffer.lua', 'program.lua', 'report.lua', 'sceneobject.lua', 'setup.lua', 'shader.lua', 'shaderstoragebuffer.lua', 'tex1d.lua', 'tex2d.lua', 'tex3d.lua', 'texbuffer.lua', 'texcube.lua', 'tex.lua', 'types.lua', 'vertexarray.lua']}],
	cl : [
		{from : '/lua/cl', to : 'cl', files : ['assert.lua', 'assertparam.lua', 'buffer.lua', 'checkerror.lua', 'cl.lua', 'commandqueue.lua', 'context.lua', 'device.lua', 'event.lua', 'getinfo.lua', 'imagegl.lua', 'kernel.lua', 'memory.lua', 'platform.lua', 'program.lua']},
		{from : '/lua/cl/obj', to : 'cl/obj', files : ['buffer.lua', 'domain.lua', 'env.lua', 'half.lua', 'kernel.lua', 'number.lua', 'program.lua', 'reduce.lua']},
		{from : '/lua/cl/tests', to : 'cl/tests', files : ['cpptest-obj.lua', 'cpptest-standalone.lua', 'getbin.lua', 'info.lua', 'obj.lua', 'obj-multi.lua', 'readme-test.lua', 'reduce.lua', 'test.lua']},
	],
	image : [
		{from : '/lua/image', to : 'image', files : ['image.lua']},
		{from : '/lua/image/luajit', to : 'image/luajit', files : ['bmp.lua', 'fits.lua', 'gif.lua', 'image.lua', 'jpeg.lua', 'loader.lua', 'png.lua', 'tiff.lua']},
	],
	dkjson : [{from : '/lua/dkjson', to : 'dkjson', files : ['dkjson.lua']}],
	mesh : [
		{from : '/lua/mesh', to : 'mesh', files : ['chopupboxes2.lua', 'chopupboxes.lua', 'clipcube.lua', 'combine.lua', 'common.lua', 'earcut.lua', 'edgegraph.lua', 'filtermtls.lua', 'mesh.lua', 'objloader.lua', 'resave.lua', 'tilemesh.lua', 'tileview.lua', 'unwrapuvs.lua', 'view.lua']},
		{from : '/lua/mesh/meshes', to : 'mesh/meshes', files : ['cube.mtl', 'hue.png', 'cube.obj', 'cube-rgb.obj', 'cube-yup-zback.obj', 'cube-zup-xfwd.obj']},
	],
	audio : [
		{from : '/lua/audio', to : 'audio', files : ['audio.lua', 'buffer.lua', 'currentsystem.lua', 'source.lua']},
		{from : '/lua/audio/null', to : 'audio/null', files : ['audio.lua', 'buffer.lua', 'source.lua']},
	],
	glapp : [
		{from : '/lua/glapp', to : 'glapp', files : ['glapp.lua', 'mouse.lua', 'orbit.lua', 'view.lua']},
		{from : '/lua/glapp/tests', to : 'glapp/tests', files : ['compute.lua', 'compute-spirv.lua', 'cubemap.lua', 'events.lua', 'info.lua', 'minimal.lua', 'pointtest.lua', 'test_es_directcalls.lua', 'test_tex.lua', 'test_es.lua', 'test.lua', 'test_vertexattrib.lua', 'src.png']},
	],
	imgui : [{from : '/lua/imgui', to : 'imgui', files : ['imgui.lua']}],
	imguiapp : [
		{from : '/lua/imguiapp', to : 'imguiapp', files : ['imguiapp.lua', 'withorbit.lua']},
		{from : '/lua/imguiapp/tests', to : 'imguiapp/tests', files : ['console.lua', 'demo.lua', 'font.lua']},
	],
	['line-integral-convolution'] : [{from : '/lua/line-integral-convolution', to : 'line-integral-convolution', files : ['run.lua']}],
	rule110 : [{from : '/lua/rule110', to : 'rule110', files : ['rule110.lua']}],
	['n-points'] : [{from : '/lua/n-points', to : 'n-points', files : ['run.lua', 'run_orbit.lua']}],
	seashell : [
		{from : '/lua/seashell', to : 'seashell', files : ['eqn.lua', 'run.lua', 'cached-eqns.glsl']},
		{from : '/lua/seashell/cloudy', to : 'seashell/cloudy', files : ['bluecloud_bk.jpg', 'bluecloud_dn.jpg', 'bluecloud_ft.jpg', 'bluecloud_lf.jpg', 'bluecloud_rt.jpg', 'bluecloud_up.jpg', 'browncloud_bk.jpg', 'browncloud_dn.jpg', 'browncloud_ft.jpg', 'browncloud_lf.jpg', 'browncloud_rt.jpg', 'browncloud_up.jpg', 'graycloud_bk.jpg', 'graycloud_dn.jpg', 'graycloud_ft.jpg', 'graycloud_lf.jpg', 'graycloud_rt.jpg', 'graycloud_up.jpg', 'yellowcloud_bk.jpg', 'yellowcloud_dn.jpg', 'yellowcloud_ft.jpg', 'yellowcloud_lf.jpg', 'yellowcloud_rt.jpg', 'yellowcloud_up.jpg']},
	],
	complex : [{from : '/lua/complex', to : 'complex', files : ['complex.lua']}],
	bignumber : [{from : '/lua/bignumber', to : 'bignumber', files : ['bignumber.lua', 'test.lua']}],
	symmath : [
		{from : '/lua/symmath', to : 'symmath', files : ['abs.lua', 'acosh.lua', 'acos.lua', 'Array.lua', 'asinh.lua', 'asin.lua', 'atan2.lua', 'atanh.lua', 'atan.lua', 'cbrt.lua', 'clone.lua', 'commutativeRemove.lua', 'conj.lua', 'Constant.lua', 'cosh.lua', 'cos.lua', 'Derivative.lua', 'distributeDivision.lua', 'eval.lua', 'expand.lua', 'exp.lua', 'Expression.lua', 'factorDivision.lua', 'factorial.lua', 'factorLinearSystem.lua', 'factor.lua', 'Function.lua', 'hasChild.lua', 'Heaviside.lua', 'Im.lua', 'Integral.lua', 'Invalid.lua', 'Limit.lua', 'log.lua', 'make_README.lua', 'map.lua', 'Matrix.lua', 'multiplicity.lua', 'namespace.lua', 'polyCoeffs.lua', 'polydiv.lua', 'prune.lua', 'Re.lua', 'replace.lua', 'setup.lua', 'simplify.lua', 'sinh.lua', 'sin.lua', 'solve.lua', 'sqrt.lua', 'Sum.lua', 'symmath.lua', 'tableCommutativeEqual.lua', 'tanh.lua', 'tan.lua', 'taylor.lua', 'Tensor.lua', 'tidy.lua', 'TotalDerivative.lua', 'UserFunction.lua', 'Variable.lua', 'Vector.lua', 'Wildcard.lua']},
		{from : '/lua/symmath/export', to : 'symmath/export', files : ['C.lua', 'Console.lua', 'Export.lua', 'GnuPlot.lua', 'JavaScript.lua', 'Language.lua', 'LaTeX.lua', 'Lua.lua', 'Mathematica.lua', 'MathJax.lua', 'MultiLine.lua', 'SingleLine.lua', 'SymMath.lua', 'Verbose.lua']},
		{from : '/lua/symmath/matrix', to : 'symmath/matrix', files : ['determinant.lua', 'diagonal.lua', 'eigen.lua', 'EulerAngles.lua', 'exp.lua', 'hermitian.lua', 'identity.lua', 'inverse.lua', 'nullspace.lua', 'pseudoInverse.lua', 'Rotation.lua', 'trace.lua', 'transpose.lua']},
		{from : '/lua/symmath/op', to : 'symmath/op', files : ['add.lua', 'approx.lua', 'Binary.lua', 'div.lua', 'eq.lua', 'Equation.lua', 'ge.lua', 'gt.lua', 'le.lua', 'lt.lua', 'mod.lua', 'mul.lua', 'ne.lua', 'pow.lua', 'sub.lua', 'unm.lua']},
		{from : '/lua/symmath/physics', to : 'symmath/physics', files : ['diffgeom.lua', 'Faraday.lua', 'MatrixBasis.lua', 'StressEnergy.lua', 'units.lua']},
		{from : '/lua/symmath/set', to : 'symmath/set', files : ['Complex.lua', 'EvenInteger.lua', 'Integer.lua', 'Natural.lua', 'Null.lua', 'OddInteger.lua', 'RealInterval.lua', 'RealSubset.lua', 'Set.lua', 'sets.lua', 'Universal.lua']},
		{from : '/lua/symmath/tensor', to : 'symmath/tensor', files : ['Chart.lua', 'DenseCache.lua', 'dual.lua', 'Index.lua', 'KronecherDelta.lua', 'LeviCivita.lua', 'Manifold.lua', 'Ref.lua', 'symbols.lua', 'wedge.lua']},
		{from : '/lua/symmath/visitor', to : 'symmath/visitor', files : ['DistributeDivision.lua', 'Expand.lua', 'ExpandPolynomial.lua', 'FactorDivision.lua', 'Factor.lua', 'Prune.lua', 'Tidy.lua', 'Visitor.lua']},
	],
	['geographic-charts'] : [{from : '/lua/geographic-charts', to : 'geographic-charts', files : ['code.lua', 'geographic-charts.lua', 'test.lua', 'earth-color.png']}],
	['prime-spiral'] : [{from : '/lua/prime-spiral', to : 'prime-spiral', files : ['run.lua', 'pi']}],
	['fibonacci-modulo'] : [{from : '/lua/fibonacci-modulo', to : 'fibonacci-modulo', files : ['run.lua', 'fibonacci.lua']}],
	['lambda-cdm'] : [{from : '/lua/lambda-cdm', to : 'lambda-cdm', files : ['bisect.lua', 'run.lua']}],
	['surface-from-connection'] : [{from : '/lua/surface-from-connection', to : 'surface-from-connection', files : ['run.lua']}],
	SphericalHarmonicGraphs : [{from : '/lua/SphericalHarmonicGraphs', to : 'SphericalHarmonicGraphs', files : ['associatedlegendre.lua', 'factorial.lua', 'plot_associatedlegendre.lua', 'run.lua', 'sphericalharmonics.lua']}],
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
};

export { luaPackages };
