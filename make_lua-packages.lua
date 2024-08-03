#!/usr/bin/env lua
--[[
Generate the lua-packages.js using rockspecs.

This seems nice at first, since rockspecs can also include extra non-lua files.
But with rockspecs the problem becomes that, for rockspecs, I decided to move the `?/?.lua` file into the root directory so that people installing a rockspec wouldn't have to explicitly change their Lua path to include `?/?.lua`.
That means that if this script wants to map rockspec files to a listing of files to be uploaded, then it will have to look out for those remapped files.
Or of course I could just leave them where the rockspec says to put them, in the root folder.  But then you run the issue of multiple files colliding / overwriting.  
And you run into the issue of a cluttered root directory.  Which is exactly why I modified my package.path.  At first I tried `?/init.lua` to be like Lua's .so search path, and to be like Python's default `import` functionality, but then you just get single-line `init.lua` files scattered everwhere, and why bother when they all always only ever redirect to the file with the same name of the cwd?  So I just used `?/?.lua`.
--]]
local path = require 'ext.path'
local table = require 'ext.table'
local string = require 'ext.string'
local json = require 'dkjson'

local cmdline = require 'ext.cmdline'.validate{
	root = {desc = 'filesystem root of Lua projects to search through'},
	urlbase = {desc = 'URL base of to Lua projects when accessing from website'},
	fsbase = {desc = 'virtual filesystem base'},
}(...)
local root = cmdline.root or os.getenv'LUA_PROJECT_PATH'
local urlbase = cmdline.urlpath or '/lua/'
local fsbase = cmdline.fsbase or './'

local luaPackages = {}
for _,dirname in ipairs{
	'bignumber',
	'bit',
	'complex',
	'dkjson',
	'gnuplot',
	'template',
	'ext',
	'struct',
	'modules',
	'vec-ffi',
	'matrix',
	'stat',
	'csv',
	'gl',
	'cl',
	'image',
	'mesh',
	'audio',
	'sdl',
	'glapp',
	'imgui',
	'imguiapp',
	'line-integral-convolution',
	'rule110',
	'n-points',
	'seashell',
	'symmath',
	'geographic-charts',
	'prime-spiral',
	'fibonacci-modulo',
	'surface-from-connection',
	'SphericalHarmonicGraphs',
	'htmlparser',
	'parser',
	'tensor',
	'plot2d',
	'plot3d',
	'vec',
	'gui',
	'make',
	'ips',
	'super_metroid_randomizer',
	'earth-magnetic-field',
	'sand-attack',
	--TODO js/black-hole-skymap's lua version
	--TODO cpp/Topple's lua version
} do
	io.write(dirname..'... ')
	local rockspec = {}
	local rockpath 
	local dirpath = path(root..'/'..dirname)

	local rockpaths = table.wrapfor(dirpath:dir())
		:mapi(function(fs) return fs[1] end)
		:filter(function(f)
			return f.path:match('^'..string.patescape(dirname)..'%-.*%.rockspec$')
		end)
		:mapi(function(f) return dirpath/f end)
	assert(#rockpaths == 1, "expected only one .rockspec file in "..dirname.." but found "..#rockpaths)
	local rockpath = rockpaths[1]

	assert(loadfile(rockpath.path, nil, rockspec))()

	local files = table.values(rockspec.build.modules):sort()
	
	luaPackages[dirname] = {{
		from = path(urlbase)(dirname).path,
		to = path(fsbase)(dirname).path,
		files = files,
	}}
	print'good'
end

print(json.encode({luaPackages=luaPackages}, {indent=true}))
