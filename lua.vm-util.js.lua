#!/usr/bin/env wsapi.cgi
-- this file and cryptobot/index.lua both use this same structure
-- TODO, how about a new .lua.js and .lua.html format that automatically uses templates?
local file = require 'ext.file'
local template = require 'template'
return {run = function(env)
	local headers = { 
		['Content-Type'] = 'application/x-javascript',
	}
	local function text()
		coroutine.yield(template(file['lua.vm-util.js'], {
			env = env,
		}))
	end
	return 200, headers, coroutine.wrap(text)
end}
