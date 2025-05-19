/*
This contains a list of package-names that can be requested.
Each package structure is [{from: fromdir, to: todir, files:[list of filenames]}, ...]
They are used with remote-loading of groups of interdependent lua script folders.

These are used in conjuction with a few /js/util.js files which maybe can be argued should belong in here.

mountFile = read a file from 'filePath' and write to the FS virtual-filesystem at 'luaPath', invoke 'fileCallback' if it is provided.
addFromToDir = load files pertaining to a single from/to entry.  These used to correspond with folders, but not really so much anymore.
addPackage = load files pertaining to a single package.
loadDistInfoPackageAndDeps = recursively load packages based on their 'distinfo' files' '.deps' property.
loadPackageAndDeps = load a set of packages and its dependencies into the filesystem, return the luaPackages object mapping names to package-objects.

Most all of the pacakges and their 'distinfo' files reside in /lua/${package name}, with 3 ecxeptions that are all hard-coded into loadDistInfoPackageAndDeps
*/
const packageNames = [
	'chompman',
	'interpreter',
	'mesh',
	'bignumber',
	'glapp',
	'lambda-cdm',
	'bit',
	'ips',
	'gnuplot',
	'plot3d',
	'complex',
	'imgui',
	'ext',
	'fibonacci-modulo',
	'template',
	'chess-on-manifold',
	'htmlparser',
	'neuralnet',
	'solver',
	'parser',
	'earth-magnetic-field',
	'resourcecache',
	'prime-spiral',
	'image',
	'space-filling-curve',
	'struct',
	'SandAttack',
	'rule110',
	'pong',
	'audio',
	'vec',
	'stat',
	'sdl',
	'seashell',
	'make',
	'csv',
	'n-points',
	'gui',
	'gl',
	'numo9',
	'surface-from-connection',
	'SphericalHarmonicGraphs',
	'plot2d',
	'langfix',
	'vec-ffi',
	'netrefl',
	'line-integral-convolution',
	'cl',
	'modules',
	'metric',
	'stupid-text-rpg',
	'super_metroid_randomizer',
	'matrix',
	'symmath',
	'geographic-charts',
	'dkjson',				// custom handled dir in js/util.js's loadDistInfoPackageAndDeps() 
	'black-hole-skymap',	// custom handled dir
	'Topple',				// custom handled dir
];

export {packageNames};
