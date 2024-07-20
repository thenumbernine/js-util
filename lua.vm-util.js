// autogen was nice ... 
// does github.io allow any server-side execution?
// otherwise I'll have to keep regenerating this / make a script to do so

import {DOM, assert, show, hide, FileSetLoader, assertExists, arrayClone, asyncfor, pathToParts, require} from './util.js';
/*
Some helper functions for using lua.vm.js
I want this to turn into an in-page filesystem + lua interpreter.
This assumes util.js is already loaded.  This loads lua.vm.js itself.  Maybe it shouldn't do that.
*/

const luaVmPackageInfos = {
	bignumber : {
		files : [
			{url:'/lua/bignumber/test.lua', dest:'bignumber/test.lua'}
			,{url:'/lua/bignumber/bignumber.lua', dest:'bignumber/bignumber.lua'}
		]
	},
	complex : {
		files : [
			{url:'/lua/complex/complex.lua', dest:'complex/complex.lua'}
		]
	},
	dkjson : {
		files : [
			{url:'/lua/dkjson/dkjson.lua', dest:'dkjson/dkjson.lua'}
			,{url:'/lua/dkjson/dkjson/dkjson.lua', dest:'dkjson/dkjson/dkjson.lua'}
			,{url:'/lua/dkjson/dkjson/speedtest.lua', dest:'dkjson/dkjson/speedtest.lua'}
			,{url:'/lua/dkjson/dkjson/jsontest.lua', dest:'dkjson/dkjson/jsontest.lua'}
		]
	},
	ext : {
		files : [
			{url:'/lua/ext/gcmem.lua', dest:'ext/gcmem.lua'}
			,{url:'/lua/ext/timer.lua', dest:'ext/timer.lua'}
			,{url:'/lua/ext/detect_os.lua', dest:'ext/detect_os.lua'}
			,{url:'/lua/ext/require.lua', dest:'ext/require.lua'}
			,{url:'/lua/ext/load.lua', dest:'ext/load.lua'}
			,{url:'/lua/ext/debug.lua', dest:'ext/debug.lua'}
			,{url:'/lua/ext/io.lua', dest:'ext/io.lua'}
			,{url:'/lua/ext/fromlua.lua', dest:'ext/fromlua.lua'}
			,{url:'/lua/ext/reload.lua', dest:'ext/reload.lua'}
			,{url:'/lua/ext/coroutine.lua', dest:'ext/coroutine.lua'}
			,{url:'/lua/ext/class.lua', dest:'ext/class.lua'}
			,{url:'/lua/ext/cmdline.lua', dest:'ext/cmdline.lua'}
			,{url:'/lua/ext/math.lua', dest:'ext/math.lua'}
			,{url:'/lua/ext/os.lua', dest:'ext/os.lua'}
			,{url:'/lua/ext/env.lua', dest:'ext/env.lua'}
			,{url:'/lua/ext/meta.lua', dest:'ext/meta.lua'}
			,{url:'/lua/ext/number.lua', dest:'ext/number.lua'}
			,{url:'/lua/ext/ext.lua', dest:'ext/ext.lua'}
			,{url:'/lua/ext/range.lua', dest:'ext/range.lua'}
			,{url:'/lua/ext/table.lua', dest:'ext/table.lua'}
			,{url:'/lua/ext/detect_lfs.lua', dest:'ext/detect_lfs.lua'}
			,{url:'/lua/ext/op.lua', dest:'ext/op.lua'}
			,{url:'/lua/ext/assert.lua', dest:'ext/assert.lua'}
			,{url:'/lua/ext/detect_ffi.lua', dest:'ext/detect_ffi.lua'}
			,{url:'/lua/ext/path.lua', dest:'ext/path.lua'}
			,{url:'/lua/ext/ctypes.lua', dest:'ext/ctypes.lua'}
			,{url:'/lua/ext/tolua.lua', dest:'ext/tolua.lua'}
			,{url:'/lua/ext/xpcall.lua', dest:'ext/xpcall.lua'}
			,{url:'/lua/ext/string.lua', dest:'ext/string.lua'}
		]
	},
	symmath : {
		files : [
			{url:'/lua/symmath/abs.lua', dest:'symmath/abs.lua'}
			,{url:'/lua/symmath/eval.lua', dest:'symmath/eval.lua'}
			,{url:'/lua/symmath/atan2.lua', dest:'symmath/atan2.lua'}
			,{url:'/lua/symmath/replace.lua', dest:'symmath/replace.lua'}
			,{url:'/lua/symmath/matrix/hermitian.lua', dest:'symmath/matrix/hermitian.lua'}
			,{url:'/lua/symmath/matrix/identity.lua', dest:'symmath/matrix/identity.lua'}
			,{url:'/lua/symmath/matrix/determinant.lua', dest:'symmath/matrix/determinant.lua'}
			,{url:'/lua/symmath/matrix/diagonal.lua', dest:'symmath/matrix/diagonal.lua'}
			,{url:'/lua/symmath/matrix/pseudoInverse.lua', dest:'symmath/matrix/pseudoInverse.lua'}
			,{url:'/lua/symmath/matrix/eigen.lua', dest:'symmath/matrix/eigen.lua'}
			,{url:'/lua/symmath/matrix/transpose.lua', dest:'symmath/matrix/transpose.lua'}
			,{url:'/lua/symmath/matrix/inverse.lua', dest:'symmath/matrix/inverse.lua'}
			,{url:'/lua/symmath/matrix/trace.lua', dest:'symmath/matrix/trace.lua'}
			,{url:'/lua/symmath/matrix/nullspace.lua', dest:'symmath/matrix/nullspace.lua'}
			,{url:'/lua/symmath/matrix/EulerAngles.lua', dest:'symmath/matrix/EulerAngles.lua'}
			,{url:'/lua/symmath/matrix/Rotation.lua', dest:'symmath/matrix/Rotation.lua'}
			,{url:'/lua/symmath/matrix/exp.lua', dest:'symmath/matrix/exp.lua'}
			,{url:'/lua/symmath/UserFunction.lua', dest:'symmath/UserFunction.lua'}
			,{url:'/lua/symmath/distributeDivision.lua', dest:'symmath/distributeDivision.lua'}
			,{url:'/lua/symmath/commutativeRemove.lua', dest:'symmath/commutativeRemove.lua'}
			,{url:'/lua/symmath/conj.lua', dest:'symmath/conj.lua'}
			,{url:'/lua/symmath/tidy.lua', dest:'symmath/tidy.lua'}
			,{url:'/lua/symmath/Limit.lua', dest:'symmath/Limit.lua'}
			,{url:'/lua/symmath/cos.lua', dest:'symmath/cos.lua'}
			,{url:'/lua/symmath/visitor/Expand.lua', dest:'symmath/visitor/Expand.lua'}
			,{url:'/lua/symmath/visitor/Prune.lua', dest:'symmath/visitor/Prune.lua'}
			,{url:'/lua/symmath/visitor/Visitor.lua', dest:'symmath/visitor/Visitor.lua'}
			,{url:'/lua/symmath/visitor/FactorDivision.lua', dest:'symmath/visitor/FactorDivision.lua'}
			,{url:'/lua/symmath/visitor/ExpandPolynomial.lua', dest:'symmath/visitor/ExpandPolynomial.lua'}
			,{url:'/lua/symmath/visitor/DistributeDivision.lua', dest:'symmath/visitor/DistributeDivision.lua'}
			,{url:'/lua/symmath/visitor/Tidy.lua', dest:'symmath/visitor/Tidy.lua'}
			,{url:'/lua/symmath/visitor/Factor.lua', dest:'symmath/visitor/Factor.lua'}
			,{url:'/lua/symmath/Sum.lua', dest:'symmath/Sum.lua'}
			,{url:'/lua/symmath/set/RealInterval.lua', dest:'symmath/set/RealInterval.lua'}
			,{url:'/lua/symmath/set/Set.lua', dest:'symmath/set/Set.lua'}
			,{url:'/lua/symmath/set/RealSubset.lua', dest:'symmath/set/RealSubset.lua'}
			,{url:'/lua/symmath/set/EvenInteger.lua', dest:'symmath/set/EvenInteger.lua'}
			,{url:'/lua/symmath/set/Null.lua', dest:'symmath/set/Null.lua'}
			,{url:'/lua/symmath/set/Integer.lua', dest:'symmath/set/Integer.lua'}
			,{url:'/lua/symmath/set/Natural.lua', dest:'symmath/set/Natural.lua'}
			,{url:'/lua/symmath/set/Universal.lua', dest:'symmath/set/Universal.lua'}
			,{url:'/lua/symmath/set/sets.lua', dest:'symmath/set/sets.lua'}
			,{url:'/lua/symmath/set/OddInteger.lua', dest:'symmath/set/OddInteger.lua'}
			,{url:'/lua/symmath/set/Complex.lua', dest:'symmath/set/Complex.lua'}
			,{url:'/lua/symmath/Derivative.lua', dest:'symmath/Derivative.lua'}
			,{url:'/lua/symmath/atanh.lua', dest:'symmath/atanh.lua'}
			,{url:'/lua/symmath/log.lua', dest:'symmath/log.lua'}
			,{url:'/lua/symmath/Expression.lua', dest:'symmath/Expression.lua'}
			,{url:'/lua/symmath/symmath.lua', dest:'symmath/symmath.lua'}
			,{url:'/lua/symmath/Function.lua', dest:'symmath/Function.lua'}
			,{url:'/lua/symmath/taylor.lua', dest:'symmath/taylor.lua'}
			,{url:'/lua/symmath/physics/diffgeom.lua', dest:'symmath/physics/diffgeom.lua'}
			,{url:'/lua/symmath/physics/Faraday.lua', dest:'symmath/physics/Faraday.lua'}
			,{url:'/lua/symmath/physics/MatrixBasis.lua', dest:'symmath/physics/MatrixBasis.lua'}
			,{url:'/lua/symmath/physics/units.lua', dest:'symmath/physics/units.lua'}
			,{url:'/lua/symmath/physics/StressEnergy.lua', dest:'symmath/physics/StressEnergy.lua'}
			,{url:'/lua/symmath/tan.lua', dest:'symmath/tan.lua'}
			,{url:'/lua/symmath/sin.lua', dest:'symmath/sin.lua'}
			,{url:'/lua/symmath/cosh.lua', dest:'symmath/cosh.lua'}
			,{url:'/lua/symmath/server/standalone.lua', dest:'symmath/server/standalone.lua'}
			,{url:'/lua/symmath/server/standalone.html.lua', dest:'symmath/server/standalone.html.lua'}
			,{url:'/lua/symmath/Tensor.lua', dest:'symmath/Tensor.lua'}
			,{url:'/lua/symmath/hasChild.lua', dest:'symmath/hasChild.lua'}
			,{url:'/lua/symmath/Constant.lua', dest:'symmath/Constant.lua'}
			,{url:'/lua/symmath/multiplicity.lua', dest:'symmath/multiplicity.lua'}
			,{url:'/lua/symmath/sinh.lua', dest:'symmath/sinh.lua'}
			,{url:'/lua/symmath/Integral.lua', dest:'symmath/Integral.lua'}
			,{url:'/lua/symmath/prune.lua', dest:'symmath/prune.lua'}
			,{url:'/lua/symmath/polyCoeffs.lua', dest:'symmath/polyCoeffs.lua'}
			,{url:'/lua/symmath/asin.lua', dest:'symmath/asin.lua'}
			,{url:'/lua/symmath/solve.lua', dest:'symmath/solve.lua'}
			,{url:'/lua/symmath/factor.lua', dest:'symmath/factor.lua'}
			,{url:'/lua/symmath/clone.lua', dest:'symmath/clone.lua'}
			,{url:'/lua/symmath/setup.lua', dest:'symmath/setup.lua'}
			,{url:'/lua/symmath/make_README.lua', dest:'symmath/make_README.lua'}
			,{url:'/lua/symmath/js/lua.vm-util.js.lua', dest:'symmath/js/lua.vm-util.js.lua'}
			,{url:'/lua/symmath/polydiv.lua', dest:'symmath/polydiv.lua'}
			,{url:'/lua/symmath/TotalDerivative.lua', dest:'symmath/TotalDerivative.lua'}
			,{url:'/lua/symmath/sqrt.lua', dest:'symmath/sqrt.lua'}
			,{url:'/lua/symmath/Array.lua', dest:'symmath/Array.lua'}
			,{url:'/lua/symmath/op/div.lua', dest:'symmath/op/div.lua'}
			,{url:'/lua/symmath/op/add.lua', dest:'symmath/op/add.lua'}
			,{url:'/lua/symmath/op/Binary.lua', dest:'symmath/op/Binary.lua'}
			,{url:'/lua/symmath/op/sub.lua', dest:'symmath/op/sub.lua'}
			,{url:'/lua/symmath/op/mod.lua', dest:'symmath/op/mod.lua'}
			,{url:'/lua/symmath/op/Equation.lua', dest:'symmath/op/Equation.lua'}
			,{url:'/lua/symmath/op/le.lua', dest:'symmath/op/le.lua'}
			,{url:'/lua/symmath/op/ne.lua', dest:'symmath/op/ne.lua'}
			,{url:'/lua/symmath/op/mul.lua', dest:'symmath/op/mul.lua'}
			,{url:'/lua/symmath/op/unm.lua', dest:'symmath/op/unm.lua'}
			,{url:'/lua/symmath/op/ge.lua', dest:'symmath/op/ge.lua'}
			,{url:'/lua/symmath/op/approx.lua', dest:'symmath/op/approx.lua'}
			,{url:'/lua/symmath/op/eq.lua', dest:'symmath/op/eq.lua'}
			,{url:'/lua/symmath/op/lt.lua', dest:'symmath/op/lt.lua'}
			,{url:'/lua/symmath/op/gt.lua', dest:'symmath/op/gt.lua'}
			,{url:'/lua/symmath/op/pow.lua', dest:'symmath/op/pow.lua'}
			,{url:'/lua/symmath/tanh.lua', dest:'symmath/tanh.lua'}
			,{url:'/lua/symmath/factorLinearSystem.lua', dest:'symmath/factorLinearSystem.lua'}
			,{url:'/lua/symmath/expand.lua', dest:'symmath/expand.lua'}
			,{url:'/lua/symmath/tensor/Index.lua', dest:'symmath/tensor/Index.lua'}
			,{url:'/lua/symmath/tensor/Chart.lua', dest:'symmath/tensor/Chart.lua'}
			,{url:'/lua/symmath/tensor/wedge.lua', dest:'symmath/tensor/wedge.lua'}
			,{url:'/lua/symmath/tensor/Ref.lua', dest:'symmath/tensor/Ref.lua'}
			,{url:'/lua/symmath/tensor/Manifold.lua', dest:'symmath/tensor/Manifold.lua'}
			,{url:'/lua/symmath/tensor/symbols.lua', dest:'symmath/tensor/symbols.lua'}
			,{url:'/lua/symmath/tensor/dual.lua', dest:'symmath/tensor/dual.lua'}
			,{url:'/lua/symmath/tensor/DenseCache.lua', dest:'symmath/tensor/DenseCache.lua'}
			,{url:'/lua/symmath/tensor/LeviCivita.lua', dest:'symmath/tensor/LeviCivita.lua'}
			,{url:'/lua/symmath/tensor/KronecherDelta.lua', dest:'symmath/tensor/KronecherDelta.lua'}
			,{url:'/lua/symmath/Wildcard.lua', dest:'symmath/Wildcard.lua'}
			,{url:'/lua/symmath/tableCommutativeEqual.lua', dest:'symmath/tableCommutativeEqual.lua'}
			,{url:'/lua/symmath/Matrix.lua', dest:'symmath/Matrix.lua'}
			,{url:'/lua/symmath/export/LaTeX.lua', dest:'symmath/export/LaTeX.lua'}
			,{url:'/lua/symmath/export/SymMath.lua', dest:'symmath/export/SymMath.lua'}
			,{url:'/lua/symmath/export/Console.lua', dest:'symmath/export/Console.lua'}
			,{url:'/lua/symmath/export/Export.lua', dest:'symmath/export/Export.lua'}
			,{url:'/lua/symmath/export/MultiLine.lua', dest:'symmath/export/MultiLine.lua'}
			,{url:'/lua/symmath/export/Verbose.lua', dest:'symmath/export/Verbose.lua'}
			,{url:'/lua/symmath/export/MathJax.lua', dest:'symmath/export/MathJax.lua'}
			,{url:'/lua/symmath/export/Language.lua', dest:'symmath/export/Language.lua'}
			,{url:'/lua/symmath/export/SingleLine.lua', dest:'symmath/export/SingleLine.lua'}
			,{url:'/lua/symmath/export/Lua.lua', dest:'symmath/export/Lua.lua'}
			,{url:'/lua/symmath/export/C.lua', dest:'symmath/export/C.lua'}
			,{url:'/lua/symmath/export/GnuPlot.lua', dest:'symmath/export/GnuPlot.lua'}
			,{url:'/lua/symmath/export/JavaScript.lua', dest:'symmath/export/JavaScript.lua'}
			,{url:'/lua/symmath/export/Mathematica.lua', dest:'symmath/export/Mathematica.lua'}
			,{url:'/lua/symmath/map.lua', dest:'symmath/map.lua'}
			,{url:'/lua/symmath/factorDivision.lua', dest:'symmath/factorDivision.lua'}
			,{url:'/lua/symmath/acosh.lua', dest:'symmath/acosh.lua'}
			,{url:'/lua/symmath/simplify.lua', dest:'symmath/simplify.lua'}
			,{url:'/lua/symmath/namespace.lua', dest:'symmath/namespace.lua'}
			,{url:'/lua/symmath/Vector.lua', dest:'symmath/Vector.lua'}
			,{url:'/lua/symmath/factorial.lua', dest:'symmath/factorial.lua'}
			,{url:'/lua/symmath/cbrt.lua', dest:'symmath/cbrt.lua'}
			,{url:'/lua/symmath/Heaviside.lua', dest:'symmath/Heaviside.lua'}
			,{url:'/lua/symmath/Re.lua', dest:'symmath/Re.lua'}
			,{url:'/lua/symmath/Variable.lua', dest:'symmath/Variable.lua'}
			,{url:'/lua/symmath/Invalid.lua', dest:'symmath/Invalid.lua'}
			,{url:'/lua/symmath/atan.lua', dest:'symmath/atan.lua'}
			,{url:'/lua/symmath/acos.lua', dest:'symmath/acos.lua'}
			,{url:'/lua/symmath/Im.lua', dest:'symmath/Im.lua'}
			,{url:'/lua/symmath/exp.lua', dest:'symmath/exp.lua'}
			,{url:'/lua/symmath/asinh.lua', dest:'symmath/asinh.lua'}
		]
		,tests : [
				{url:'/lua/symmath/tests/Z4%20%2d%20compute%20flux%20eigenmodes%2esymmath', dest:'symmath/tests/Z4 - compute flux eigenmodes.symmath'}
				,{url:'/lua/symmath/tests/Kaluza%2dKlein%20%2d%20real%20world%20values%2elua', dest:'symmath/tests/Kaluza-Klein - real world values.lua'}
				,{url:'/lua/symmath/tests/ADM%20Levi%2dCivita%2elua', dest:'symmath/tests/ADM Levi-Civita.lua'}
				,{url:'/lua/symmath/tests/Euler%20fluid%20equations%20%2d%20flux%20eigenvectors%2esymmath', dest:'symmath/tests/Euler fluid equations - flux eigenvectors.symmath'}
				,{url:'/lua/symmath/tests/Z4%20%2d%20flux%20PDE%20noSource%20usingOnlyUs%2elua', dest:'symmath/tests/Z4 - flux PDE noSource usingOnlyUs.lua'}
				,{url:'/lua/symmath/tests/rotation%20group%2elua', dest:'symmath/tests/rotation group.lua'}
				,{url:'/lua/symmath/tests/Acoustic%20Black%20Hole%2elua', dest:'symmath/tests/Acoustic Black Hole.lua'}
				,{url:'/lua/symmath/tests/spacetime%20embedding%20radius%2elua', dest:'symmath/tests/spacetime embedding radius.lua'}
				,{url:'/lua/symmath/tests/plane%20wave%20Wikipedia%2esymmath', dest:'symmath/tests/plane wave Wikipedia.symmath'}
				,{url:'/lua/symmath/tests/deriving%20spacetime%20metrics%2esymmath', dest:'symmath/tests/deriving spacetime metrics.symmath'}
				,{url:'/lua/symmath/tests/SRHD%2elua', dest:'symmath/tests/SRHD.lua'}
				,{url:'/lua/symmath/tests/Gravitation%2016%2e1%20%2d%20dense%2esymmath', dest:'symmath/tests/Gravitation 16.1 - dense.symmath'}
				,{url:'/lua/symmath/tests/Schwarzschild%20%2d%20isotropic%2elua', dest:'symmath/tests/Schwarzschild - isotropic.lua'}
				,{url:'/lua/symmath/tests/Kaluza%2dKlein%20%2d%20index%2elua', dest:'symmath/tests/Kaluza-Klein - index.lua'}
				,{url:'/lua/symmath/tests/FLRW%2elua', dest:'symmath/tests/FLRW.lua'}
				,{url:'/lua/symmath/tests/KOE%2elua', dest:'symmath/tests/KOE.lua'}
				,{url:'/lua/symmath/tests/Schwarzschild%20%2d%20spherical%20%2d%20derivation%20%2d%20varying%20time%202%2elua', dest:'symmath/tests/Schwarzschild - spherical - derivation - varying time 2.lua'}
				,{url:'/lua/symmath/tests/run%20all%20tests%2elua', dest:'symmath/tests/run all tests.lua'}
				,{url:'/lua/symmath/tests/Faraday%20tensor%20in%20general%20relativity%2elua', dest:'symmath/tests/Faraday tensor in general relativity.lua'}
				,{url:'/lua/symmath/tests/GLM%2dMaxwell%20equations%20%2d%20flux%20eigenvectors%2elua', dest:'symmath/tests/GLM-Maxwell equations - flux eigenvectors.lua'}
				,{url:'/lua/symmath/tests/Platonic%20Solids%2elua', dest:'symmath/tests/Platonic Solids.lua'}
				,{url:'/lua/symmath/tests/Kaluza%2dKlein%20%2d%20varying%20scalar%20field%20%2d%20index%2elua', dest:'symmath/tests/Kaluza-Klein - varying scalar field - index.lua'}
				,{url:'/lua/symmath/tests/Schwarzschild%20%2d%20spherical%20%2d%20derivation%20%2d%20varying%20time%2elua', dest:'symmath/tests/Schwarzschild - spherical - derivation - varying time.lua'}
				,{url:'/lua/symmath/tests/TOV%2elua', dest:'symmath/tests/TOV.lua'}
				,{url:'/lua/symmath/tests/BSSN%2esymmath', dest:'symmath/tests/BSSN.symmath'}
				,{url:'/lua/symmath/tests/metric%20catalog%2elua', dest:'symmath/tests/metric catalog.lua'}
				,{url:'/lua/symmath/tests/Riemann%20From%20Stress%2dEnergy%2esymmath', dest:'symmath/tests/Riemann From Stress-Energy.symmath'}
				,{url:'/lua/symmath/tests/ADM%20gravity%20using%20expressions%2elua', dest:'symmath/tests/ADM gravity using expressions.lua'}
				,{url:'/lua/symmath/tests/cylindrical%20EM%20wave%2esymmath', dest:'symmath/tests/cylindrical EM wave.symmath'}
				,{url:'/lua/symmath/tests/Z4%20%2d%20flux%20PDE%20noSource%2elua', dest:'symmath/tests/Z4 - flux PDE noSource.lua'}
				,{url:'/lua/symmath/tests/Shallow%20Water%20equations%20%2d%20flux%20eigenvectors%2elua', dest:'symmath/tests/Shallow Water equations - flux eigenvectors.lua'}
				,{url:'/lua/symmath/tests/EFE%20discrete%20solution%20%2d%201%2dvar%2elua', dest:'symmath/tests/EFE discrete solution - 1-var.lua'}
				,{url:'/lua/symmath/tests/Gravitation%2016%2e1%20%2d%20expression%2esymmath', dest:'symmath/tests/Gravitation 16.1 - expression.symmath'}
				,{url:'/lua/symmath/tests/numeric%20integration%2elua', dest:'symmath/tests/numeric integration.lua'}
				,{url:'/lua/symmath/tests/scalar%20metric%2elua', dest:'symmath/tests/scalar metric.lua'}
				,{url:'/lua/symmath/tests/Schwarzschild%20%2d%20spherical%2elua', dest:'symmath/tests/Schwarzschild - spherical.lua'}
				,{url:'/lua/symmath/tests/Building%20Curvature%20by%20ADM%2elua', dest:'symmath/tests/Building Curvature by ADM.lua'}
				,{url:'/lua/symmath/tests/BSSN%20%2d%20generate%2elua', dest:'symmath/tests/BSSN - generate.lua'}
				,{url:'/lua/symmath/tests/Euler%20fluid%20equations%20%2d%20primitive%20form%2elua', dest:'symmath/tests/Euler fluid equations - primitive form.lua'}
				,{url:'/lua/symmath/tests/wave%20equation%20in%20spacetime%20%2d%20flux%20eigenvectors%2elua', dest:'symmath/tests/wave equation in spacetime - flux eigenvectors.lua'}
				,{url:'/lua/symmath/tests/tensor%20coordinate%20invariance%2elua', dest:'symmath/tests/tensor coordinate invariance.lua'}
				,{url:'/lua/symmath/tests/Gravitation%20Ex%2035%2e3%20generalized%2esymmath', dest:'symmath/tests/Gravitation Ex 35.3 generalized.symmath'}
				,{url:'/lua/symmath/tests/MHD%20%2d%20flux%20eigenvectors%2elua', dest:'symmath/tests/MHD - flux eigenvectors.lua'}
				,{url:'/lua/symmath/tests/Alcubierre%2elua', dest:'symmath/tests/Alcubierre.lua'}
				,{url:'/lua/symmath/tests/spinors%20and%20tensor%20charts%2esymmath', dest:'symmath/tests/spinors and tensor charts.symmath'}
				,{url:'/lua/symmath/tests/hyperbolic%20gamma%20driver%20in%20ADM%20terms%2elua', dest:'symmath/tests/hyperbolic gamma driver in ADM terms.lua'}
				,{url:'/lua/symmath/tests/Gravitation%20ch35%2esymmath', dest:'symmath/tests/Gravitation ch35.symmath'}
				,{url:'/lua/symmath/tests/Kaluza%2dKlein%2esymmath', dest:'symmath/tests/Kaluza-Klein.symmath'}
				,{url:'/lua/symmath/tests/spring%20force%2elua', dest:'symmath/tests/spring force.lua'}
				,{url:'/lua/symmath/tests/EM%20Connection%20for%20Stress%20Energy%2esymmath', dest:'symmath/tests/EM Connection for Stress Energy.symmath'}
				,{url:'/lua/symmath/tests/spinors%2elua', dest:'symmath/tests/spinors.lua'}
				,{url:'/lua/symmath/tests/Kerr%2dSchild%20%2d%20dense%2elua', dest:'symmath/tests/Kerr-Schild - dense.lua'}
				,{url:'/lua/symmath/tests/EM%20Connection%20for%20Stress%20Energy%202%2esymmath', dest:'symmath/tests/EM Connection for Stress Energy 2.symmath'}
				,{url:'/lua/symmath/tests/Gravitation%2016%2e1%20%2d%20mixed%2elua', dest:'symmath/tests/Gravitation 16.1 - mixed.lua'}
				,{url:'/lua/symmath/tests/EFE%20discrete%20solution%20%2d%202%2dvar%2elua', dest:'symmath/tests/EFE discrete solution - 2-var.lua'}
				,{url:'/lua/symmath/tests/Kerr%2dSchild%20degenerate%20case%2elua', dest:'symmath/tests/Kerr-Schild degenerate case.lua'}
				,{url:'/lua/symmath/tests/Kaluza%2dKlein%20%2d%20dense%2elua', dest:'symmath/tests/Kaluza-Klein - dense.lua'}
				,{url:'/lua/symmath/tests/Z4%2elua', dest:'symmath/tests/Z4.lua'}
				,{url:'/lua/symmath/tests/Kerr%20metric%20of%20Earth%2elua', dest:'symmath/tests/Kerr metric of Earth.lua'}
				,{url:'/lua/symmath/tests/Maxwell%20equations%20%2d%20flux%20eigenvectors%2elua', dest:'symmath/tests/Maxwell equations - flux eigenvectors.lua'}
				,{url:'/lua/symmath/tests/Schwarzschild%20%2d%20spherical%20%2d%20mass%20varying%20with%20time%2elua', dest:'symmath/tests/Schwarzschild - spherical - mass varying with time.lua'}
				,{url:'/lua/symmath/tests/hydrodynamics%2elua', dest:'symmath/tests/hydrodynamics.lua'}
				,{url:'/lua/symmath/tests/Lorentz%20group%2elua', dest:'symmath/tests/Lorentz group.lua'}
				,{url:'/lua/symmath/tests/console_spherical_metric%2elua', dest:'symmath/tests/console_spherical_metric.lua'}
				,{url:'/lua/symmath/tests/Divergence%20Theorem%20in%20curvilinear%20coordinates%2elua', dest:'symmath/tests/Divergence Theorem in curvilinear coordinates.lua'}
				,{url:'/lua/symmath/tests/Kerr%2dSchild%20%2d%20expression%2elua', dest:'symmath/tests/Kerr-Schild - expression.lua'}
				,{url:'/lua/symmath/tests/Navier%2dStokes%2dWilcox%20%2d%20flux%20eigenvectors%2elua', dest:'symmath/tests/Navier-Stokes-Wilcox - flux eigenvectors.lua'}
				,{url:'/lua/symmath/tests/elastic%20plate%2elua', dest:'symmath/tests/elastic plate.lua'}
				,{url:'/lua/symmath/tests/Gravitation%2016%2e1%20%2d%20expression%2elua', dest:'symmath/tests/Gravitation 16.1 - expression.lua'}
				,{url:'/lua/symmath/tests/imperial%20units%2elua', dest:'symmath/tests/imperial units.lua'}
				,{url:'/lua/symmath/tests/MakeTrigLookupTables%2elua', dest:'symmath/tests/MakeTrigLookupTables.lua'}
				,{url:'/lua/symmath/tests/Z4%20%2d%20compute%20flux%20eigenmodes%20%2d%20withGauge%2esymmath', dest:'symmath/tests/Z4 - compute flux eigenmodes - withGauge.symmath'}
				,{url:'/lua/symmath/tests/MHD%20symmetrization%2elua', dest:'symmath/tests/MHD symmetrization.lua'}
				,{url:'/lua/symmath/tests/solve%20cubic%2elua', dest:'symmath/tests/solve cubic.lua'}
				,{url:'/lua/symmath/tests/wave%20equation%20in%20spacetime%2elua', dest:'symmath/tests/wave equation in spacetime.lua'}
				,{url:'/lua/symmath/tests/monochromatic%20plane%20wave%20Wikipedia%2esymmath', dest:'symmath/tests/monochromatic plane wave Wikipedia.symmath'}
				,{url:'/lua/symmath/tests/exp%20metric%2esymmath', dest:'symmath/tests/exp metric.symmath'}
				,{url:'/lua/symmath/tests/natural%20units%2elua', dest:'symmath/tests/natural units.lua'}
				,{url:'/lua/symmath/tests/Schwarzschild%20%2d%20spherical%20%2d%20derivation%2elua', dest:'symmath/tests/Schwarzschild - spherical - derivation.lua'}
				,{url:'/lua/symmath/tests/BSSN%20%2d%20index%2elua', dest:'symmath/tests/BSSN - index.lua'}
				,{url:'/lua/symmath/tests/worksheet_spherical_metric_using_eqs%2esymmath', dest:'symmath/tests/worksheet_spherical_metric_using_eqs.symmath'}
				,{url:'/lua/symmath/tests/simple_ag%2elua', dest:'symmath/tests/simple_ag.lua'}
				,{url:'/lua/symmath/tests/ADM%20metric%2elua', dest:'symmath/tests/ADM metric.lua'}
				,{url:'/lua/symmath/tests/earth%20surface%20time%20dilation%2esymmath', dest:'symmath/tests/earth surface time dilation.symmath'}
				,{url:'/lua/symmath/tests/SRHD_1D%2elua', dest:'symmath/tests/SRHD_1D.lua'}
				,{url:'/lua/symmath/tests/Euler%20fluid%20equations%20%2d%20flux%20eigenvectors%2elua', dest:'symmath/tests/Euler fluid equations - flux eigenvectors.lua'}
				,{url:'/lua/symmath/tests/plane%20wave%20MTW%2035%2e11%2esymmath', dest:'symmath/tests/plane wave MTW 35.11.symmath'}
				,{url:'/lua/symmath/tests/Z4%20metric%2dinvariant%2esymmath', dest:'symmath/tests/Z4 metric-invariant.symmath'}
				,{url:'/lua/symmath/tests/Newton%20method%2elua', dest:'symmath/tests/Newton method.lua'}
				,{url:'/lua/symmath/tests/ADM%20metric%20%2d%20mixed%2elua', dest:'symmath/tests/ADM metric - mixed.lua'}
				,{url:'/lua/symmath/tests/speed%20of%20light%20to%20length%20of%20day%2esymmath', dest:'symmath/tests/speed of light to length of day.symmath'}
				,{url:'/lua/symmath/tests/black%20hole%20brain%2elua', dest:'symmath/tests/black hole brain.lua'}
				,{url:'/lua/symmath/tests/EM%20Stress%2dEnergy%20Contractions%2esymmath', dest:'symmath/tests/EM Stress-Energy Contractions.symmath'}
				,{url:'/lua/symmath/tests/Finite%20Difference%20Coefficients%2elua', dest:'symmath/tests/Finite Difference Coefficients.lua'}
				,{url:'/lua/symmath/tests/ADM%20formalism%2elua', dest:'symmath/tests/ADM formalism.lua'}
				,{url:'/lua/symmath/tests/Faraday%20tensor%20in%20special%20relativity%2elua', dest:'symmath/tests/Faraday tensor in special relativity.lua'}
				,{url:'/lua/symmath/tests/FiniteVolume%2elua', dest:'symmath/tests/FiniteVolume.lua'}
				,{url:'/lua/symmath/tests/worksheet_spherical_metric%2esymmath', dest:'symmath/tests/worksheet_spherical_metric.symmath'}
				,{url:'/lua/symmath/tests/Ernst%2elua', dest:'symmath/tests/Ernst.lua'}
				,{url:'/lua/symmath/tests/BSSN%20%2d%20index%20%2d%20cache%2elua', dest:'symmath/tests/BSSN - index - cache.lua'}
				,{url:'/lua/symmath/tests/Einstein%20field%20equations%20%2d%20expression%2elua', dest:'symmath/tests/Einstein field equations - expression.lua'}
				,{url:'/lua/symmath/tests/MHD%20inverse%2elua', dest:'symmath/tests/MHD inverse.lua'}
				,{url:'/lua/symmath/tests/Euler%20Angles%20in%20Higher%20Dimensions%2elua', dest:'symmath/tests/Euler Angles in Higher Dimensions.lua'}
				,{url:'/lua/symmath/tests/Platonic%20Solids%20%2d%20cache%2elua', dest:'symmath/tests/Platonic Solids - cache.lua'}
				,{url:'/lua/symmath/tests/Gravitation%2016%2e1%20%2d%20dense%2elua', dest:'symmath/tests/Gravitation 16.1 - dense.lua'}
				,{url:'/lua/symmath/tests/remove%20beta%20from%20adm%20metric%2elua', dest:'symmath/tests/remove beta from adm metric.lua'}
				,{url:'/lua/symmath/tests/plane%20wave%20testing%2esymmath', dest:'symmath/tests/plane wave testing.symmath'}
				,{url:'/lua/symmath/tests/toy%2d1%2b1%20spacetime%2elua', dest:'symmath/tests/toy-1+1 spacetime.lua'}
				,{url:'/lua/symmath/tests/plane%20wave%20MTW%2035%2e9%2esymmath', dest:'symmath/tests/plane wave MTW 35.9.symmath'}
				,{url:'/lua/symmath/tests/sum%20of%20two%20metrics%2elua', dest:'symmath/tests/sum of two metrics.lua'}
		]
	},
	gnuplot : {
		files : [
			{url:'/lua/gnuplot/gnuplot.lua', dest:'gnuplot/gnuplot.lua'}
		]
	},
	tensor : {
		files : [
		]
		,tests : [
		]
	},
	htmlparser : {
		files : [
		]
		,tests : [
		]
	},
	template : {
		files : [
			{url:'/lua/template/showcode.lua', dest:'template/showcode.lua'}
			,{url:'/lua/template/template.lua', dest:'template/template.lua'}
			,{url:'/lua/template/output.lua', dest:'template/output.lua'}
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
