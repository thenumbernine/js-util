//https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
//because IE sucks
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

//http://stackoverflow.com/questions/3954438/remove-item-from-array-by-value
Array.prototype.remove = function() {
	var what, a= arguments, L= a.length, ax;
	while(L && this.length){
		what= a[--L];
		while((ax= this.indexOf(what))!= -1){
			this.splice(ax, 1);
		}
	}
	return this;
};

Array.prototype.max = function( array ){
	return Math.max.apply( Math, array );
};

Array.prototype.min = function( array ){
	return Math.min.apply( Math, array );
};

(function($){
	//http://stackoverflow.com/questions/2700000/how-to-disable-text-selection-using-jquery
	$.fn.disableSelection = function() {
		return this.each(function() {
			$(this).attr('unselectable', 'on')
			   .css({
				   '-moz-user-select':'none',
				   '-webkit-user-select':'none',
				   'user-select':'none',
				   '-ms-user-select':'none'
			   })
			   .each(function() {
				   this.onselectstart = function() { return false; };
			   });
		});
	};

	//http://stackoverflow.com/questions/476679/preloading-images-with-jquery
	$.fn.preload = function(done, update) {
		var checklist = this.toArray();
		var totalLength = checklist.length;
		this.each(function() {
			$('<img>').attr({src:this}).load(function() {
				checklist.remove($(this).attr('src'));
				if (update) update(1 - checklist.length / totalLength);
				if (checklist.length == 0 && done !== undefined) done();
			});
		});
	};

})(jQuery);

//http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
	return window.requestAnimationFrame    || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();


//my own creations:

function mergeInto(mergedst, mergesrc) {
	for (var k in mergesrc) {
		if (!(k in mergedst)) mergedst[k] = mergesrc[k];
	}
	return mergedst;
}

function isa(subclassObj, classObj) {
	if (subclassObj == classObj) return true;
	if ('super' in subclassObj.prototype) return isa(subclassObj.prototype.super, classObj);
	return false;
}

/*
args.init is the function that becomes the class object
args.super is the parent class
the rest of args becomes the prototype
if super is provided then super's prototype is merged into this class' prototype
*/
function makeClass(args) {
	var classname = ('classname' in args) ? args.classname : 'classObj';
	if (args == undefined) args = {};
	if (!('init' in args)) {
		if ('super' in args) {
			args.init = eval('var '+classname+' = function() { args.super.apply(this, arguments); }; '+classname+';');
		} else {
			args.init = eval('var '+classname+' = function() {}; '+classname+';');
		}		
	}
	var classFunc = args.init;
	
	classFunc.prototype = args;
	if ('super' in args) {
		mergeInto(classFunc.prototype, args.super.prototype);
		classFunc.super = args.super;
		classFunc.superProto = args.super.prototype;
	}
	classFunc.prototype.isa = function(classObj) {
		return isa(this.init, classObj);
	}

	return classFunc;
}

//cookie stuff

function setCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function clearCookie(name) {
	setCookie(name,"",-1);
}

//assert

function assert(s, msg) {
	if (!s) throw msg || "assertion failed!";
	return s;
}

function assertEquals(a,b,msg) {
	if (a != b) throw a+"!="+b+": "+(msg || "assertion failed!");
	return true;
}

function assertExists(obj,field,msg) {
	if (!(field in obj)) throw "no "+field+" in "+obj+": "+(msg || "assertion failed!");
	return obj[field];
}

Math.clamp = function(x,min,max) {
	return Math.max(min,Math.min(max,x));
};
