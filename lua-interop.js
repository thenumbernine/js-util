// this file will load the emscripten module and provide the lua<->js wrapper code
import { default as newLuaLib } from '/js/lua-5.4.7-with-ffi.js';

const newLua = async(args = {}) => {

args.locateFile ??= () => '/js/lua-5.4.7-with-ffi.wasm';
args.print ??= s => { console.log('> '+s); }
args.printErr ??= s => { console.log('> '+s); }

const M = await newLuaLib(args);

// luaconf.h
//M.LUAI_MAXSTACK = 1000000;	// 32 bit
M.LUAI_MAXSTACK = 15000;	// otherwise
// lua.h
M.LUA_MULTRET = -1;
M.LUA_REGISTRYINDEX = -M.LUAI_MAXSTACK - 1000;
M._lua_upvalueindex = (i) => LUA_REGISTRYINDEX - i;
M.LUA_OK = 0;
M.LUA_YIELD = 1;
M.LUA_ERRRUN = 2;
M.LUA_ERRSYNTAX = 3;
M.LUA_ERRMEM = 4;
M.LUA_ERRERR = 5;
M.LUA_TNONE = (-1);
M.LUA_TNIL = 0;
M.LUA_TBOOLEAN = 1;
M.LUA_TLIGHTUSERDATA = 2;
M.LUA_TNUMBER = 3;
M.LUA_TSTRING = 4;
M.LUA_TTABLE = 5;
M.LUA_TFUNCTION = 6;
M.LUA_TUSERDATA = 7;
M.LUA_TTHREAD = 8;
M.LUA_NUMTYPES = 9;
M.LUA_MINSTACK = 20;
M.LUA_RIDX_MAINTHREAD = 1;
M.LUA_RIDX_GLOBALS = 2;
M.LUA_RIDX_LAST = M.LUA_RIDX_GLOBALS;

M._lua_tonumber = (L,i) => M._lua_tonumberx(L,i,null);
M._lua_tointeger = (L,i) => M._lua_tointegerx(L,i,null);
M._lua_pop = (L,n) => M._lua_settop(L, -n-1);
M._lua_newtable = (L) => M._lua_createtable(L, 0, 0);
M._lua_register = (L,n,f) => { M._lua_pushcfunction(L, f); M._lua_setglobal(L, n); };
M._lua_pushcfunction = (L, f) => M._lua_pushcclosure(L, f, 0);

M._lua_isfunction = (L,n) => M._lua_type(L, n) == M.LUA_TFUNCTION;
M._lua_istable = (L,n) => M._lua_type(L, n) == M.LUA_TTABLE;
M._lua_islightuserdata = (L,n) => M._lua_type(L, n) == M.LUA_TLIGHTUSERDATA;
M._lua_isnil = (L,n) => M._lua_type(L, n) == M.LUA_TNIL;
M._lua_isboolean = (L,n) => M._lua_type(L, n) == M.LUA_TBOOLEAN;
M._lua_isthread = (L,n) => M._lua_type(L, n) == M.LUA_TTHREAD;
M._lua_isnone = (L,n) => M._lua_type(L, n) == M.LUA_TNONE;
M._lua_isnoneornil = (L, n) => M._lua_type(L, n) <= 0;

M._lua_pushglobaltable = (L) => M._lua_rawgeti(L, M.LUA_REGISTRYINDEX, BigInt(M.LUA_RIDX_GLOBALS));
M._lua_tostring = (L, i) => M._lua_tolstring(L, i, 0);
M._lua_insert = (L,idx) => { M._lua_rotate(L, idx, 1); };
M._lua_remove = (L,idx) => { M._lua_rotate(L, idx, -1); M._lua_pop(L, 1); };
M._lua_replace = (L,idx) => { M._lua_copy(L, -1, idx); M._lua_pop(L, 1); };

M._lua_pcall = (L, nargs, nret, msgh) => M._lua_pcallk(L, nargs, nret, msgh, 0, 0);
M._luaL_typename = (L,i) => M._lua_typename(L, M._lua_type(L,i));

// lauxlib.h

M.LUA_LOADED_TABLE = M.stringToNewUTF8('_LOADED');

const str_luaToJs = M.stringToNewUTF8('luaToJs');
const str_jsToLua = M.stringToNewUTF8('jsToLua');
const str_luaWrapObjectMT = M.stringToNewUTF8('luaWrapObjectMT');
const str_luaWrapFuncMT = M.stringToNewUTF8('luaWrapFuncMT');
const str___index = M.stringToNewUTF8('__index');
const str___newindex = M.stringToNewUTF8('__newindex');
const str___tostring = M.stringToNewUTF8('__tostring');
const str___len = M.stringToNewUTF8('__len');
const str___call = M.stringToNewUTF8('__call');
const str__null_ = M.stringToNewUTF8('[null]');
const str_package = M.stringToNewUTF8('package');
const str_loaded = M.stringToNewUTF8('loaded');
const str_global = M.stringToNewUTF8('global');
const str_null = M.stringToNewUTF8('null');
const str_new = M.stringToNewUTF8('new');
const str_tonumber = M.stringToNewUTF8('tonumber');
const str_tostring = M.stringToNewUTF8('tostring');
const str_instanceof = M.stringToNewUTF8('instanceof');
const str_typeof = M.stringToNewUTF8('typeof');
const str_js = M.stringToNewUTF8('js');
const str_ffi = M.stringToNewUTF8('ffi');

// define this before doing any lua<->js stuff
const errHandler = M.addFunction(L => {
	let msg = M._lua_tostring(L, 1);
	if (msg == 0) {
		if (M._luaL_callmeta(L, 1, str___tostring) &&
			M._lua_type(L, -1) == M.LUA_TSTRING
		) {
			return 1;
		} else {
			// does vararg not work with emcc / wasm?
			//msg = M._lua_pushfstring(L, M.stringToNewUTF8("(error object is a %s value)"), M._luaL_typename(L, 1));
			msg = M._lua_pushstring(L, M.stringToNewUTF8("(error object is a "+M.UTF8ToString(M._luaL_typename(L, 1))+" value)"));
		}
	}
	M._luaL_traceback(L, L, msg, 1);
	return 1;
}, 'ip');

// make the metatable for the js<->lua wrapper

const wrapper___index_func = M.addFunction(L => {
	const jsValue = lua_to_js(L, 1);
	const indexKey = lua_to_js(L, 2);
//console.log('wrapper for jsToLua key', jsObjID, 'index key', indexKey, 'returning value', jsValue[indexKey]);
	return push_js(L, jsValue[indexKey]);
}, 'ip');

const wrapper___newindex_func = M.addFunction(L => {
	// t, newindexKey, newindexValue
	const jsValue = lua_to_js(L, 1);	// optional line or just use the closure variable
	// TODO instead of relying on closures, we can define this function once and read the jsObjID from the table
	const newindexKey = lua_to_js(L, 2);
	const newindexValue = lua_to_js(L, 3);
//console.log('wrapper for jsValue=', jsValue, 'newindexKey=', newindexKey, 'newindexValue=', newindexValue);
	jsValue[newindexKey] = newindexValue;
	return 0;
}, 'ip');

const wrapper___tostring_func = M.addFunction(L => {
	const jsValue = lua_to_js(L, 1);	// optional line or just use the closure variable
	if (jsValue === null) {
		M._lua_pushstring(L, str__null_);
		return 1;
	}

	M._lua_pushstring(L, M.stringToNewUTF8(jsValue.toString()));
	return 1;
}, 'ip');

const wrapper___len_func = M.addFunction(L => {
	const jsValue = lua_to_js(L, 1);	// optional line or just use the closure variable
	M._lua_pushinteger(L, BigInt(jsValue.length || jsValue.size || 0));
	return 1;
}, 'ip');

const call_func = (L, isArrow) => {
	// since it's __call, the 1st arg is the func-obj
	const jsValue = lua_to_js(L, 1);	// optional line or just use the closure variable
	// convert args to js
	const n = M._lua_gettop(L);
//console.log('lua->js call converting this arg 1...');
	const _this = isArrow ? null : lua_to_js(L, 2);
	const args = [];
	for (let i = (isArrow ? 2 : 3); i <= n; ++i) {
//console.log('lua->js call converting arg ', i, '...');
		args.push(lua_to_js(L, i));
	}
	// call jsValue
//console.log('lua->js calling func=', jsValue, 'arg1=this', _this, 'args=', args);
	let ret;
	try {
		ret = jsValue.apply(_this, args);
	} catch (e) {
		M._luaL_error(L, M.stringToNewUTF8(e.toString()));
		return 0;
	}
	// convert results to lua
	// only supports single-return for now
//console.log('... pushing ret', ret);
	return push_js(L, ret);
}
const wrapper___call_func = M.addFunction(L => call_func(L, false), 'ip');
const wrapper___callArrow_func = M.addFunction(L => call_func(L, true), 'ip');


// maps from js objects to some kind of index to look up lua object in lua table
// meanwhile we have a jsToLua table in Lua that maps these indexes to tables
let jsToLua, luaToJs;

const lua_to_js = (L, i) => {
	if (i < 0) {
		i += M._lua_gettop(L)+1;
	}
	const t = M._lua_type(L, i);
//console.log('lua_to_js type', t);
	switch (t) {
	case M.LUA_TNONE:
		return undefined;
	case M.LUA_TNIL:
		return undefined;
	case M.LUA_TBOOLEAN:
		return M._lua_toboolean(L, i) != 0;
	case M.LUA_TLIGHTUSERDATA:
	case M.LUA_TUSERDATA:
		// wrapper at all? meh?
		return {userdata:M._lua_touserdata(L, i)};
	case M.LUA_TTHREAD:
		return {thread:M._lua_tothread(L, i)};
	case M.LUA_TNUMBER:
		return M._lua_tonumber(L, i);
	case M.LUA_TSTRING:
		// TODO lua_tolstring to read length ...
		const lenp = M.stackAlloc(4);
		const s = M._lua_tolstring(L, i, lenp);
		// convert 'len' ptr from int in mem to number ...
		const len = M.getValue(lenp, 'i32');
		return M.UTF8ToString(s, len);
	case M.LUA_TTABLE:
	case M.LUA_TFUNCTION:
//console.log('lua_to_js top=', M._lua_gettop(L));
//console.log('lua_to_js got table/function, checking cache...');
		M._lua_getglobal(L, str_luaToJs);	// stack = luaToJs
		M._lua_pushvalue(L, i);			// stack = luaToJs, luaValue
		M._lua_gettable(L, -2);			// stack = luaToJs, luaToJs[luaValue]
		if (!M._lua_isnil(L, -1)) {
			const jsObjID = M._lua_tointeger(L, -1);
//console.log('lua_to_js got key', typeof(jsObjID), jsObjID);
			M._lua_pop(L, 2);
//console.log('lua_to_js top=', M._lua_gettop(L));
//console.log('lua_to_js returning', luaToJs.get(jsObjID));
			return luaToJs.get(jsObjID);
		} else {
//console.log('lua_to_js building wrapper...');
			M._lua_pop(L, 1);			// stack = luaToJs
//console.log('lua_to_js top=', M._lua_gettop(L));

			const jsObjID = BigInt(jsToLua.size);	// consistent with push_js below
//console.log('lua_to_js cache key=', jsObjID);

			let jsValue;
			if (t == M.LUA_TTABLE) {
//console.log('creating js wrapper for lua obj...');
				jsValue = {};	// do I want JS objects or JS maps?  maps are more like Lua, but don't have syntax support in JS ...
				M._lua_pushnil(L);  // first key
				while (M._lua_next(L, i) != 0) {
					const luaKey = lua_to_js(L, -2);
					const luaValue = lua_to_js(L, -1);
//console.log('setting', luaKey, 'to', luaValue);
					jsValue[luaKey] = luaValue;
					M._lua_pop(L, 1);
				}
//console.log('done with wrapper', jsValue);
			} else if (t == M.LUA_TFUNCTION) {
				// create proxy obj
				jsValue = (...args) => {
//console.log('lua_to_js proxy function being called with args', ...args);
					M._lua_pushcfunction(L, errHandler);	// msgh

					// get back the function from the cache key
					M._lua_getglobal(L, str_jsToLua);	// msgh, jsToLua
					M._lua_geti(L, -1, jsObjID);						// msgh, jsToLua, jsToLua[jsObjID]
					M._lua_remove(L, -2);								// msgh, jsToLua[jsObjID]

					const n = args.length;
					for (let i = 0; i < n; ++i) {
						push_js(L, args[i]);
					}										// msgh, f, args...
//console.log('lua_to_js proxy function pcall...');
					const numret = M._lua_pcall(L, n, M.LUA_MULTRET, 1);
//console.log('lua_to_js proxy function got back #return=', numret);
					// results ... always an array?  coerce to prim for size <= 1?
					const ret = [];
					for (let i = 0; i < numret; ++i) {
						ret.push(lua_to_js(L, -numret+i));
					}
//console.log('lua_to_proxy function got results', ret);
					return ret;
				};
			}
//console.log('lua_to_js built wrapper', jsValue);
//console.log('lua_to_js top=', M._lua_gettop(L));

			luaToJs.set(jsObjID, jsValue);
			jsToLua.set(jsValue, jsObjID);

			M._lua_pushvalue(L, i);				// stack = luaToJs, luaValue
			M._lua_pushinteger(L, jsObjID);		// stack = luaToJs, luaValue, jsObjID
			M._lua_settable(L, -3);				// stack = luaToJs; luaToJs[luaValue] = jsObjID
			M._lua_pop(L, 1);
			M._lua_getglobal(L, str_jsToLua);	// stack = jsToLua
			M._lua_pushvalue(L, i);				// stack = jsToLua, luaValue
			M._lua_seti(L, -2, jsObjID);		// stack = jsToLua; jsToLua[jsObjID] = luaValue
			M._lua_pop(L, 1);

//console.log('lua_to_js returning', jsValue);
			return jsValue;
		}
	default:
		throw 'lua_to_js unknown lua type '+t;
	}
};

let jsNullToken;
const push_js = (L, jsValue, isArrow) => {
//console.log('push_js begin top', M._lua_gettop(L));
	const t = typeof(jsValue);
	switch (t) {
	case 'undefined':
		M._lua_pushnil(L);
		return 1;
	case 'boolean':
		M._lua_pushboolean(L, jsValue ? 1 : 0);
		return 1;
	case 'number':
		M._lua_pushnumber(L, jsValue);
		return 1;
	case 'string':
		M._lua_pushstring(L, M.stringToNewUTF8(jsValue));
		return 1;
		break;
	case 'function':
	case 'object':
		// cuz for null, type is 'object' ... smh javascript
		if (jsValue === null) {
			//M._lua_pushnil(L);
			push_js(L, jsNullToken);
			return 1;
		}
//console.log('push_js checking cache for', jsValue);
		// see if it's already there
		let jsObjID = jsToLua.get(jsValue);
		if (jsObjID !== undefined) {
//console.log('push_js found in entry', jsObjID);
			M._lua_getglobal(L, str_jsToLua);
			M._lua_geti(L, -1, BigInt(jsObjID));
//console.log('push_js returning');
			return 1;
		} else {
			jsObjID = BigInt(jsToLua.size);
//console.log("push_js didn't find any entry, using new key", jsObjID);

			// TODO this is a faulty test , but good luck finding a better one
			//const isArrow = t == 'function' && !jsValue.toString().startsWith('function');
			// because it's faulty I'm going to allow specifying arrow functions manually

			if (isArrow) {
				// push a cfunction with its own addFunction ...
				// unlike pushing an object, this will be 1:1 with function args, no separate initial 'this' arg
				M._lua_newtable(L);								// luaWrapper={}
				M._luaL_setmetatable(L, str_luaWrapFuncMT);		// luaWrapper
			} else {
//console.log('push_js pushing object');
				// convert to a Lua table and push that table
				// or push a table with metamethods that read into this table
				M._lua_newtable(L);								// luaWrapper={}
				M._luaL_setmetatable(L, str_luaWrapObjectMT);	// luaWrapper
			}

			// keep up with the lua<->js map
//console.log('push_js setting relation with key', jsObjID);
			jsToLua.set(jsValue, jsObjID);
			luaToJs.set(jsObjID, jsValue);
			M._lua_getglobal(L, str_jsToLua);	// stack = luaWrapper, jsToLua
			M._lua_pushvalue(L, -2);							// stack = luaWrapper, jsToLua, luaWrapper
			M._lua_seti(L, -2, jsObjID);						// stack = luaWrapper, jsToLua; jsToLua[jsObjID] = luaWrapper
			M._lua_pop(L, 1);									// stack = luaWrapper
			M._lua_getglobal(L, str_luaToJs);	// stack = luaWrapper, luaToJs
			M._lua_pushvalue(L, -2);							// stack = luaWrapper, luaToJs, luaWrapper
			M._lua_pushinteger(L, jsObjID);						// stack = luaWrapper, luaToJs, luaWrapper, jsObjID
			M._lua_settable(L, -3);								// stack = luaWrapper, luaToJs; luaToJs[luaWrapper] = jsObjID
			M._lua_pop(L, 1);									// stack = luaWrapper
//console.log('push_js returning');
			return 1;
		}
	default:
		throw "push_js unknown js type "+t;
	}
//console.log('push_js end top', M._lua_gettop(L));
};

let L;
const lua = {
	lib : M,
	newState : function() {
		L = M._luaL_newstate();
		this.L = L;	// for read access only, don't bother write, lua is a singleton and M is stored in the closure

		jsToLua = new Map();
		luaToJs = new Map();
		lua.jsToLua = jsToLua;
		lua.luaToJs = luaToJs;

		// TODO use registery instead of this
		M._lua_newtable(L);
		M._lua_setglobal(L, str_jsToLua);
		M._lua_newtable(L);
		M._lua_setglobal(L, str_luaToJs);

		// setup wrapper metatable
		if (M._luaL_newmetatable(L, str_luaWrapObjectMT)) {
			M._lua_pushcfunction(L, wrapper___index_func);	// t, mt, luaWrapper
			M._lua_setfield(L, -2, str___index);

			M._lua_pushcfunction(L, wrapper___newindex_func); // t, mt, luaWrapper
			M._lua_setfield(L, -2, str___newindex);	// t, mt

			M._lua_pushcfunction(L, wrapper___tostring_func);	// t, mt, luaWrapper
			M._lua_setfield(L, -2, str___tostring);

			M._lua_pushcfunction(L, wrapper___len_func);	// t, mt, luaWrapper
			M._lua_setfield(L, -2, str___len);

			M._lua_pushcfunction(L, wrapper___call_func);		// luaWrapper
			M._lua_setfield(L, -2, str___call);
		}
		M._lua_pop(L, 1);

		if (M._luaL_newmetatable(L, str_luaWrapFuncMT)) {
			M._lua_pushcfunction(L, wrapper___index_func);	// t, mt, luaWrapper
			M._lua_setfield(L, -2, str___index);

			M._lua_pushcfunction(L, wrapper___newindex_func); // t, mt, luaWrapper
			M._lua_setfield(L, -2, str___newindex);	// t, mt

			M._lua_pushcfunction(L, wrapper___tostring_func);	// t, mt, luaWrapper
			M._lua_setfield(L, -2, str___tostring);

			M._lua_pushcfunction(L, wrapper___len_func);	// t, mt, luaWrapper
			M._lua_setfield(L, -2, str___len);

			M._lua_pushcfunction(L, wrapper___callArrow_func);		// luaWrapper
			M._lua_setfield(L, -2, str___call);
		}
		M._lua_pop(L, 1);

		M._luaL_openlibs(L);

		// getting weird wasm error: Uncaught RuntimeError: null function or function signature mismatch
		//M._luaL_requiref(L, str_ffi, M._luaopen_ffi, 0);
		// can't do this cuz I need a emcc mem loc func ptr of luaopen_ffi, not a js wrapper ...
		// how to get that?  use dlsym? that's broken
		// using getFunctionAddress?
		//M._luaL_requiref(L, str_ffi, M.getFunctionAddress(M._luaopen_ffi), 0); // nope, same error
		//M._luaL_requiref(L, str_ffi, M.__emutls_get_address('luaopen_ffi'), 0); // nope, "table index is out of bounds" ... what table where?
		// instead I have to re-add luaopen_ffi ...
		//M._luaL_requiref(L, str_ffi, M.addFunction(M._luaopen_ffi, ''), 0);
		// it seems that when I started to use MAIN_MODULE/SIDE_MODULE in order to access dlopen/dlsym, emscripten in turn stopped letting me use addFunction's storing prototypes.  what a trash API.
		// so here I can try to use dlopen/dlsym, or I can try to use emscripten's trash API.
		//M._luaL_requiref(L, str_ffi, M.addFunction(M._luaopen_ffi, ''), 0);
		const dlhandle = M._dlopen(0, 257);
		if (!dlhandle) throw "failed to dlopen!";
		const luaopen_ffi = M._dlsym(dlhandle, M.stringToNewUTF8('luaopen_ffi'));
		if (!luaopen_ffi) throw "failed to find luaopen_ffi";
		M._luaL_requiref(L, str_ffi, luaopen_ffi, 0);

		M._lua_pop(L, 1);

		this.luaopen_js();
	},

	luaopen_js : function() {
		// here - add package.loaded.js ... that's fengari compat ... how come I get the feeling that's a bad name to use ...
		// not working:
		//M._lua_getfield(L, M.LUA_REGISTRYINDEX, M.stringToNewUTF8(M.LUA_LOADED_TABLE));	// package.loaded
		// instead:
		M._lua_getglobal(L, str_package);	//package
		M._lua_getfield(L, -1, str_loaded);	//package, package.loaded
		M._lua_remove(L, -2);								// package.loaded

		M._lua_newtable(L);	// package.loaded, js={}

		// js.global:
		push_js(L, window);	// package.loaded, js, window
		M._lua_setfield(L, -2, str_global);	// package.loaded, js;  js.global = window

		// special hack ... make sure luaToJs for jsNullToken returns null
		jsNullToken = {};
		this['null'] = jsNullToken;

		push_js(L, jsNullToken);
		M._lua_setfield(L, -2, str_null);

		// change lua->js calls passing lua's "jsNullToken" will produce `null` in js
		luaToJs.set(jsToLua.get(jsNullToken), null);

		// js.new():
		push_js(L, (cl, ...args) => new cl(...args) );
		M._lua_setfield(L, -2, str_new);

		// js.tonumber()
		push_js(L, x => 1*x, true);
		M._lua_setfield(L, -2, str_tonumber);

		// js.tostring()
		push_js(L, x => ''+x, true);
		M._lua_setfield(L, -2, str_tostring);

		// js.instanceof()
		push_js(L, (a, b) => a instanceof b, true);
		M._lua_setfield(L, -2, str_instanceof);

		// js.typeof()
		push_js(L, x => typeof(x), true);
		M._lua_setfield(L, -2, str_typeof);

		M._lua_setfield(L, -2, str_js);	// package.loaded;  package.loaded.js = js
	},

	doString : function(s) {
		M._lua_pushcfunction(L, errHandler);
		const result = M._luaL_loadstring(L, M.stringToNewUTF8(s));	// throw on error?
		if (result != M.LUA_OK) {
			// TODO get stack trace and error message
			const msg = M.UTF8ToString(M._lua_tostring(L, -1));
			M.printErr('syntax error: '+msg);
			throw 'syntax error: '+msg;
		}
		//console.log('luaL_loadstring', result);	// no syntax errors

		const ret = M._lua_pcall(L, 0, 0, -2);
		//console.log('lua_pcall', ret);
		if (ret != 0) {
			const msg = M.UTF8ToString(M._lua_tostring(L, -1));
			M.printErr(msg);
			//throw msg; // return? idk?
		}
	},

	push_js : push_js,
	lua_to_js : lua_to_js,
};

	return lua;
}; //newLua 
export { newLua };
