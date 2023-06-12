function makevec(n) {
	let allFields = ['x', 'y', 'z', 'w'];
	assert(n <= allFields.length);
	let fields = allFields.splice(0,n);
	let repeat = function(str, repl, sep) {
		if (sep == undefined) sep = ' ';
		let res = [];
		
		let repeatLength;
		for (let k in repl) {
			if (repeatLength == undefined) {
				repeatLength = repl[k].length;
			} else {
				assert(repeatLength == repl[k].length);
			}
		}
		
		for (let i = 0; i < repeatLength; i++) {
			let s = str;
			for (let k in repl) {
				s = s.replace(new RegExp('\\$'+k, 'g'), repl[k][i]);
			}
			s = s.replace(new RegExp('\\#', 'g'), i);
			res.push(s);
		}
		return res.join(sep);
	};
	let s = `
class vec`+n+` {
	constructor(...args) {
		switch (args.length) {
		case 0: `+repeat(`this.$field = 0;`, {field:fields})+` break;
		case 1:
			let v = args[0];
			if (typeof(v) == "object" && `+repeat(`"$field" in v`, {field:fields}, ` && `)+`) {
				`+repeat(`this.$field = v.$field;`, {field:fields})+`
			} else {
				v = parseFloat(v);
				`+repeat(`this.$field = v;`, {field:fields})+`
			}
			break;
		default: `+repeat(`this.$field = parseFloat(args[#]);`, {field:fields})+` break;
		}
	}
	set(...args) {
		switch (args.length) {
		case 0:`+repeat(`this.$field = 0;`, {field:fields})+` break;
		case 1: let v = args[0]; `+repeat(`this.$field = v.$field;`, {field:fields})+` break;
		case `+n+`:`+repeat(`this.$field = args[#];`, {field:fields})+` break;
		default: throw "set needs `+n+` args";
		};
		return this;
	}
	toString() { return `+repeat(`this.$field`, {field:fields}, ` + "," + `)+`; }
	tileDist(v) { return `+repeat(`Math.abs(Math.floor(this.$field + .5) - Math.floor(v.$field + .5))`, {field:fields}, ` + `)+`; }
	tileEquals(v) { return this.tileDist(v) == 0; }
	equals(v) { return `+repeat(`this.$field == v.$field`, {field:fields}, ` && `)+`; }
	neg() { return new vec`+n+`(`+repeat(`-this.$field`, {field:fields}, `,`)+`); }
`+repeat(`
	$op(v) {
		if (typeof(v) == "object" && `+repeat(`"$field" in v`, {field:fields}, ` && `)+`) return new vec`+n+`(`+repeat(`this.$field $sym v.$field`, {field:fields}, `,`)+`);
		return new vec`+n+`(`+repeat(`this.$field $sym v`, {field:fields}, `,`)+`);
	}`, {op:[`add`, `sub`, `mul`, `div`], sym:[`+`, `-`, `*`, `/`]})+`
	clamp(...args) {
		let mins, maxs;
		if (args.length == 1 && "min" in args[0] && "max" in args[0]) {
			mins = args[0].min;
			maxs = args[0].max;
		} else {
			mins = args[0];
			maxs = args[1];
		}
		`+repeat(`
		if (this.$field < mins.$field) this.$field = mins.$field;
		if (this.$field > maxs.$field) this.$field = maxs.$field;`, {field:fields}, '\n')+`
		return this;
	}
	floor() {`+repeat(`this.$field = Math.floor(this.$field);`,{field:fields})+` return this; }
}
vec`+n+`;
`;
	//console.log(s);
	return eval(s);
}

let vec2 = makevec(2);
let vec3 = makevec(3);
let vec4 = makevec(4);


class box2 {
	constructor(...args) {
		switch (args.length) {
		case 0:
			this.min = new this.vec2();
			this.max = new this.vec2();
			break;
		case 1:
			let v = args[0];
			if (typeof(v) == 'object') {
				if ('min' in v && 'max' in v) {
					this.min = new this.vec2(v.min);
					this.max = new this.vec2(v.max);
				} else if ('x' in v && 'y' in v) {
					this.max = new this.vec2(v);
					this.min = this.max.neg();
				} else {
					throw "Don't know how to build this box3";
				}
			} else {
				v = parseFloat(v);
				this.max = new this.vec2(v, v);
				this.min = this.max.neg();
			}
			break;
		case 2:
			this.min = new this.vec2(args[0]);
			this.max = new this.vec2(args[1]);
			break;
		case 4:
			this.min = new this.vec2(args[0], args[1]);
			this.max = new this.vec2(args[2], args[3]);
			break;
		default:
			throw "Don't know how to build this box2";
		}
	}
	vec2 = vec2;	//too bad javascript is retarded, or I wouldn't have to store this here
	toString() { return this.min + ':' + this.max; }
	size() { return this.max.sub(this.min); }
	contains(v) {
		if ('min' in v && 'max' in v) {
			return this.contains(v.min) && this.contains(v.max);
		} else {
			return v.x >= this.min.x && v.x <= this.max.x
				&& v.y >= this.min.y && v.y <= this.max.y;
		}
	}
	touches(b) {
		return b.min.x <= this.max.x && this.min.x <= b.max.x
			&& b.min.y <= this.max.y && this.min.y <= b.max.y;
	}
	clamp(b) {
		this.min.clamp(b);
		this.max.clamp(b);
		return this;
	}
	stretch(v) {
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

class box3 {
	constructor(...args) {
		switch (args.length) {
		case 0:
			this.min = new this.vec3();
			this.max = new this.vec3();
			break;
		case 1:
			let v = args[0];
			if (typeof(v) == 'object') {
				if ('min' in v && 'max' in v) {
					this.min = new this.vec3(v.min);
					this.max = new this.vec3(v.max);
				} else if ('x' in v && 'y' in v && 'z' in v) {
					this.max = new this.vec3(v);
					this.min = this.max.neg();
				} else {
					throw "Don't know how to build this box3";
				}
			} else {
				v = parseFloat(v);
				this.max = new this.vec3(v, v);
				this.min = this.max.neg();
			}
			break;
		case 2:
			this.min = new this.vec3(args[0]);
			this.max = new this.vec3(args[1]);
			break;
		case 6:
			this.min = new this.vec3(args[0], args[1], args[2]);
			this.max = new this.vec3(args[3], args[4], args[5]);
			break;
		default:
			throw "Don't know how to build this box3";
		}
	}
	vec3 = vec3,
	toString() { return this.min + ':' + this.max; }
	size() { return this.max.sub(this.min); }
	contains(v) {
		if ('min' in v && 'max' in v) {
			return this.contains(v.min) && this.contains(v.max);
		} else {
			return v.x >= this.min.x && v.x <= this.max.x
				&& v.y >= this.min.y && v.y <= this.max.y
				&& v.z >= this.min.z && v.z <= this.max.z;
		}
	}
	touches(b) {
		return b.min.x <= this.max.x && this.min.x <= b.max.x
			&& b.min.y <= this.max.y && this.min.y <= b.max.y
			&& b.min.z <= this.max.z && this.min.z <= b.max.z;
	}
	clamp(b) {
		this.min.clamp(b);
		this.max.clamp(b);
		return this;
	}
	stretch(v) {
		if ('min' in v && 'max' in v) {
			this.stretch(v.min);
			this.stretch(v.max);
		} else {
			if (this.min.x > v.x) this.min.x = v.x;
			if (this.max.x < v.x) this.max.x = v.x;
			if (this.min.y > v.y) this.min.y = v.y;
			if (this.max.y < v.y) this.max.y = v.y;
			if (this.min.z > v.z) this.min.z = v.z;
			if (this.max.z < v.z) this.max.z = v.z;
		}
	}
}

export { vec2, vec3, vec4, box2, box3 };
