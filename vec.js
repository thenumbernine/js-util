//require util.js

function makevec(n) {
	var allFields = ['x', 'y', 'z', 'w'];
	assert(n <= allFields.length);
	var fields = allFields.splice(0,n);
	var repeat = function(str, repl, sep) {
		if (sep == undefined) sep = ' ';
		var res = [];
		
		var repeatLength;
		for (var k in repl) {
			if (repeatLength == undefined) {
				repeatLength = repl[k].length;
			} else {
				assert(repeatLength == repl[k].length);
			}
		}
		
		for (var i = 0; i < repeatLength; i++) {
			var s = str;
			for (var k in repl) {
				s = s.replace(new RegExp('\\$'+k, 'g'), repl[k][i]);
			}
			s = s.replace(new RegExp('\\#', 'g'), i);
			res.push(s);
		}
		return res.join(sep);
	};
	var s = '\
	var vec'+n+' = function() {\n\
		switch (arguments.length) {\n\
		case 0: '+repeat('this.$field = 0;', {field:fields})+' break;\n\
		case 1:\n\
			var v = arguments[0];\n\
			if (typeof(v) == "object" && '+repeat('"$field" in v', {field:fields}, ' && ')+') {\n\
				'+repeat('this.$field = v.$field;', {field:fields})+'\n\
			} else {\n\
				v = parseFloat(v);\n\
				'+repeat('this.$field = v;', {field:fields})+'\n\
			}\n\
			break;\n\
		default: '+repeat('this.$field = parseFloat(arguments[#]);', {field:fields})+' break;\n\
		}\n\
	};\n\
	vec'+n+'.prototype = {\n\
		set : function() {\n\
			switch (arguments.length) {\n\
			case 0:'+repeat('this.$field = 0;', {field:fields})+' break;\n\
			case 1: var v = arguments[0]; '+repeat('this.$field = v.$field;', {field:fields})+' break;\n\
			case '+n+':'+repeat('this.$field = arguments[#];', {field:fields})+' break;\n\
			default: throw "set needs '+n+' arguments";\n\
			};\n\
			return this;\n\
		},\n\
		toString : function() { return '+repeat('this.$field', {field:fields}, ' + "," + ')+'; },\n\
		tileDist : function(v) { return '+repeat('Math.abs(Math.floor(this.$field + .5) - Math.floor(v.$field + .5))', {field:fields}, ' + ')+'; },\n\
		tileEquals : function(v) { return this.tileDist(v) == 0; },\n\
		equals : function(v) { return '+repeat('this.$field == v.$field', {field:fields}, ' && ')+'; },\n\
		neg : function() { return new vec'+n+'('+repeat('-this.$field', {field:fields}, ',')+'); },\n\
		'+repeat('\n\
		$op : function(v) {\n\
			if (typeof(v) == "object" && '+repeat('"$field" in v', {field:fields}, ' && ')+') return new vec'+n+'('+repeat('this.$field $sym v.$field', {field:fields}, ',')+');\n\
			return new vec'+n+'('+repeat('this.$field $sym v', {field:fields}, ',')+');\n\
		},', {op:['add', 'sub', 'mul', 'div'], sym:['+', '-', '*', '/']})+'\n\
		clamp : function() {\n\
			var mins, maxs;\n\
			if (arguments.length == 1 && "min" in arguments[0] && "max" in arguments[0]) {\n\
				mins = arguments[0].min;\n\
				maxs = arguments[0].max;\n\
			} else {\n\
				mins = arguments[0];\n\
				maxs = arguments[1];\n\
			}\n\
			'+repeat('\n\
			if (this.$field < mins.$field) this.$field = mins.$field;\n\
			if (this.$field > maxs.$field) this.$field = maxs.$field;', {field:fields}, '\n')+'\n\
			return this;\n\
		},\n\
		floor : function() {'+repeat('this.$field = Math.floor(this.$field);',{field:fields})+' return this; }\n\
	};\n\
	vec'+n+';';
	//console.log(s);
	return eval(s);
}
var vec2 = makevec(2);
var vec3 = makevec(3);
var vec4 = makevec(4);


function box2() {
	switch (arguments.length) {
	case 0:
		this.min = new vec2();
		this.max = new vec2();
		break;
	case 1:
		var v = arguments[0];
		if (typeof(v) == 'object') {
			if ('min' in v && 'max' in v) {
				this.min = new vec2(v.min);
				this.max = new vec2(v.max);
			} else if ('x' in v && 'y' in v) {
				this.max = new vec2(v);
				this.min = this.max.neg();
			}
		} else {
			v = parseFloat(v);
			this.max = new vec2(v, v);
			this.min = this.max.neg();
		}
		break;
	case 4:
		this.min = new vec2(arguments[0], arguments[1]);
		this.max = new vec2(arguments[2], arguments[3]);
		break;
	default:
		this.min = new vec2(arguments[0]);
		this.max = new vec2(arguments[1]);
		break;
	}
}
box2.prototype = {
	toString : function() { return this.min + ':' + this.max; },
	size : function() { return this.max.sub(this.min); },
	contains : function(v) {
		if ('min' in v && 'max' in v) {
			return this.contains(v.min) && this.contains(v.max);
		} else {
			return v.x >= this.min.x && v.x <= this.max.x
				&& v.y >= this.min.y && v.y <= this.max.y;
		}
	},
	touches : function(b) {
		return b.min.x <= this.max.x && this.min.x <= b.max.x
			&& b.min.y <= this.max.y && this.min.y <= b.max.y;
	},
	clamp : function(b) {
		this.min.clamp(b);
		this.max.clamp(b);
		return this;
	},
	stretch : function(v) {
		if ('min' in v && 'max' in v) {
			this.stretch(v.min);
			this.stretch(v.max);
		} else {
			if (this.min.x > v.x) this.min.x = v.x;
			if (this.max.x < v.x) this.max.x = v.x;
			if (this.min.y > v.y) this.min.y = v.y;
			if (this.max.y < v.y) this.max.y = v.y;
		}
	}
}
