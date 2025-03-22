/*
simple table ctor of DOM elements
*/

const merge = (mergedst, ...mergesrcs) => {
	mergesrcs.forEach(mergesrc => {
		for (let k in mergesrc) {
			mergedst[k] = mergesrc[k];
		}
	});
	return mergedst;
};

const appendChildren = (par, ...chs) => {
	chs.forEach(ch => par.appendChild(ch));
};

const removeAllChildren = par => {
	while (par.firstChild) {
		par.removeChild(par.lastChild);
	}
};

const setChildren = (par, chs) => {
	removeAllChildren(par);
	appendChildren(par, chs);
};


const Text = (text) => {
	return document.createTextNode(text);
}

//TODO put this in util.js
const Dom = args => {
	const tagName = args.tagName;
	if (!tagName) throw "can't make a dom without a tagName";
	const dom = document.createElement(tagName);
	const reservedFields = {
		// the following are same name but dif setter
		tagName : 1,
		style : 1,
		attrs : 1,
		children : 1,
		classList : 1,
		// the following are my names
		events : 1,
		appendTo : 1,
		prependTo : 1,
	};
	const reserved = {};
	if (args) {
		for (let k in args) {
			if (k in reservedFields) {
				reserved[k] = args[k];
			} else {
				dom[k] = args[k];
			}
		}
	}
	if (reserved.style !== undefined) {
		if (typeof(reserved.style) == 'object') {
			merge(dom.style, reserved.style);
		} else {
			dom.style = reserved.style;
		}
	}
	if (reserved.attrs !== undefined) {
		for (let k in reserved.attrs) {
			dom.setAttribute(k, reserved.attrs[k]);
		}
	}
	if (reserved.events !== undefined) {
		for (let k in reserved.events) {
			dom.addEventListener(k, reserved.events[k]);
		}
	}

	//add last for load event's sake
	if (reserved.appendTo !== undefined) {
		reserved.appendTo.append(dom);
	}
	if (reserved.prependTo !== undefined) {
		reserved.prependTo.prepend(dom);
	}
	if (reserved.children !== undefined) {
		reserved.children.forEach(child => {
			dom.append(child);
		});
	}
	if (reserved.classList !== undefined) {
		reserved.classList.forEach(className => {
			dom.classList.add(className);
		});
	}

	return dom;
}

const DomTag = tagName => {
	return args => Dom(merge({tagName:tagName}, args));
};

const A = DomTag('a');
const Br = DomTag('br');
const Button = DomTag('button');
const Canvas = DomTag('canvas');
const Div = DomTag('div');
const Hr = DomTag('hr');
const Img = DomTag('img');
const Input = DomTag('input');
const Option = DomTag('option');
const Pre = DomTag('pre');
const Progress = DomTag('progress');
const Select = DomTag('select');
const Span = DomTag('span');
const Table = DomTag('table');
const Td = DomTag('td');
const TextArea = DomTag('textarea');
const Th = DomTag('th');
const Tr = DomTag('tr');

export {
	merge,
	appendChildren,
	removeAllChildren,
	setChildren,
	Text,
	Dom,
	DomTag,
	A,
	Br,
	Button,
	Canvas,
	Div,
	Hr,
	Img,
	Input,
	Option,
	Pre,
	Progress,
	Select,
	Span,
	Table,
	Td,
	TextArea,
	Th,
	Tr,
};
