'use strict';

var d, c, p, q, r, A, B, u, v, R, S, f, g, h, s, w, res;

var t = 0.0, dt = 0.01;
var x, y;
var xs, ys;
var alpha, beta, gamma;

var output;
var overview, overc;
var startStop, permalink;

var intervalId = null;

function CanvasRenderer(canvas, drawCircle) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.drawCircle = drawCircle;

	this.clear();
}

CanvasRenderer.prototype.clear = function() {
	var context = this.context;
	var width = this.canvas.width;
	var height = this.canvas.height;

	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, width, height);
	context.strokeStyle = '#000';
	context.lineWidth = w;
	context.lineCap = 'round';
	context.lineJoin = 'round';
	
	if (r) {
		var scale = Math.min(width * 0.9 / 2.0 / r, height * 0.9 / 2.0 / r);
		context.setTransform(scale, 0, 0, scale, width / 2.0, height / 2.0);
		
		if (this.drawCircle) {
			context.save();
			context.beginPath();
			context.arc(0, 0, r, 0, 2.0 * Math.PI, false);
			context.stroke();
			context.restore();
		}
	}
};

CanvasRenderer.prototype.draw = function(xs, ys) {
	var context = this.context;
	context.beginPath();
	context.moveTo(xs[0], ys[0]);
	var n = xs.length;
	for (var i = 1; i < n; i++) {
		context.lineTo(xs[i], ys[i]);
	}
	context.stroke();
};

CanvasRenderer.prototype.save = function() {
	this.canvas.toBlob(function(blob) {
		saveAs(blob, 'harmonograph.png');
	}, 'image/png');
};

function SvgRenderer(svg, drawSegments, drawBezier) {
	this.svg = svg;
	this.path = null;
	svg.innerHTML = '';

	this.segments = '';
	if (drawSegments) {
		svg.innerHTML += '<path id="segments" stroke="#f00" stroke-linecap="round" stroke-linejoin="round" fill="none" d=""></path>';
		this.segments = this.svg.querySelector('#segments');
	}

	this.bezier = '';
	if (drawBezier) {
		svg.innerHTML += '<path id="bezier" stroke="#000" stroke-linecap="round" stroke-linejoin="round" fill="none" d=""></path>';
		this.bezier = this.svg.querySelector('#bezier');
	}

	this.clear();
}

SvgRenderer.prototype.clear = function() {
	var svg = this.svg;
	if (this.segments) {
		this.segments.setAttribute('d', '');
		this.segments.setAttribute('stroke-width', w);
	}
	if (this.bezier) {
		this.bezier.setAttribute('d', '');
		this.bezier.setAttribute('stroke-width', w);
	}

	if (r) {
		var width = svg.width.baseVal.value;
		var height = svg.height.baseVal.value;
		var scale = Math.min(width * 0.9 / 2.0 / r, height * 0.9 / 2.0 / r);
		var m = svg.createSVGMatrix().translate(width / 2.0, height / 2.0).scale(scale);
		var transform = svg.createSVGTransformFromMatrix(m);
		if (this.segments) {
			this.segments.transform.baseVal.initialize(transform);
		}
		if (this.bezier) {
			this.bezier.transform.baseVal.initialize(transform);
		}
	}
};

SvgRenderer.prototype.draw = function(xs, ys) {
	if (this.segments) {
		this.drawSegments(this.segments, xs, ys);
	}
	if (this.bezier) {
		this.drawBezier(this.bezier, xs, ys);
	}
};

function round(x) {
	return Math.round(x * 1000) / 1000;
}

SvgRenderer.prototype.drawSegments = function(path, xs, ys) {
	var data = [path.getAttribute('d'), 'M'];
	var i = 0;
	data.push(round(xs[0]));
	data.push(round(ys[0]));
	var n = xs.length;
	if (n > 1) {
		data.push('L');
	}
	for (var i = 1; i < n; i++) {
		data.push(round(xs[i]));
		data.push(round(ys[i]));
	}
	path.setAttribute('d', data.join(' '));
};

SvgRenderer.prototype.drawBezier = function(path, xs, ys) {
	var n = xs.length;
	var step = Math.min(32, n - 1);
	var factor = 0.5 * step / 3;
	var rxs = [];
	var rys = [];
	var cxs = [];
	var cys = [];
	for (var i = 0; i < n; i += step) {
		var prev = Math.max(0, i - 1);
		var next = Math.min(n - 1, i + 1);
		rxs.push(xs[i]);
		rys.push(ys[i]);
		cxs.push(factor * (xs[next] - xs[prev]));
		cys.push(factor * (ys[next] - ys[prev]));
	}
	var rn = rxs.length;

	var data = [
		path.getAttribute('d'),
		'M',
		round(rxs[0]), round(rys[0]),
		'C',
		round(rxs[0] + cxs[0]), round(rys[0] + cys[0]) + ',',
		round(rxs[1] - cxs[1]), round(rys[1] - cys[1]) + ',',
		round(rxs[1]), round(rys[1])
	];
	if (rn > 2) {
		data.push('S');
		for (var i = 2; i < rn; i++) {
			data.push(round(rxs[i] - cxs[i]));
			data.push(round(rys[i] - cys[i]) + ',');
			data.push(round(rxs[i]));
			data.push(round(rys[i]));
		}
	}
	path.setAttribute('d', data.join(' '));
};

SvgRenderer.prototype.save = function() {
	var blob = new Blob([this.svg.outerHTML], {type: 'application/svg+xml'});
	saveAs(blob, 'harmonograph.svg');
}

function init() {
	startStop = document.getElementById('startstop');
	permalink = document.getElementById('permalink');
	output = new CanvasRenderer(document.getElementById('output'), true);
	overview = document.getElementById('overview');
	overc = overview.getContext('2d');

	fromPermalink();
	readInput();
	toPermalink();
	clear();
}

function clear() {
	t = 0.0;
	updateXY();
	xs = [x];
	ys = [y];

	output.clear();
	drawOverview(true);
}

function start() {
	if (intervalId == null) {
		intervalId = window.setInterval(step, 1000 * dt);
		
		startStop.innerHTML = 'Stop';
		startStop.onclick = stop;
		enableInput(false);
	}
}

function stop() {
	if (intervalId != null) {
		window.clearInterval(intervalId);
		intervalId = null;
		
		startStop.innerHTML = 'Start';
		startStop.onclick = start;
		enableInput(true);
	}
}

function step() {
	var newXs = [xs[xs.length - 1]];
	var newYs = [ys[ys.length - 1]];
	for (var i = 0; i < s; ++i) {
		t += dt;
		updateXY();
		xs.push(x);
		ys.push(y);
		newXs.push(x);
		newYs.push(y);
	}
	
	output.draw(newXs, newYs);
	drawOverview(false);
}

function inputChange() {
	readInput();
	clear();
	drawOverview(true);
	toPermalink();
}

function sChange() {
	s = read('s');
}

function enableInput(enabled) {
	var form = document.getElementById('input');
	var inputs = form.getElementsByTagName('input');
	for (var i = 0; i < inputs.length; i++) {
		var input = inputs[i];
		input.disabled = !enabled;
	}
	document.getElementById('res').disabled = !enabled;
}

function updateXY() {
	alpha = A * Math.sin(2.0 * Math.PI * (f * t + u)) * Math.exp(-R * t);
	beta  = B * Math.sin(2.0 * Math.PI * (g * t + v)) * Math.exp(-S * t);
	gamma = 2.0 * Math.PI * h * t;
	
	var xa = p * Math.cos(alpha) + q * Math.sin(alpha) - d;
	var ya = q * Math.cos(alpha) - p * Math.sin(alpha);
	var xb = xa * Math.cos(beta) - ya * Math.sin(beta);
	var yb = ya * Math.cos(beta) + xa * Math.sin(beta) - c;
	x = xb * Math.cos(gamma) - yb * Math.sin(gamma);
	y = yb * Math.cos(gamma) + xb * Math.sin(gamma);
}

function read(id) {
	var input = document.getElementById(id);
	var value = input.value;
	var f = parseFloat(value);
	if (isNaN(f)) {
		input.className = 'error';
	} else {
		input.className = '';
	}
	return f;
}

function toRadians(degrees) {
	return degrees / 180.0 * Math.PI;
}

function readInput() {
	d = read('d');
	c = read('c');
	p = read('p');
	q = read('q');
	r = read('r');
	A = toRadians(read('A'));
	B = toRadians(read('B'));
	u = read('u');
	v = read('v');
	R = read('R');
	S = read('S');
	f = read('f');
	g = read('g');
	h = read('h');
	s = read('s');
	w = read('w');

	res = read('res');
	output.canvas.width = res;
	output.canvas.height = res;
}

function drawOverview(variables) {
	overc.setTransform(1, 0, 0, 1, 0, 0);
	overc.clearRect(0, 0, overview.width, overview.height);
	
	var scale = overview.width * 0.6 / d;
	overc.setTransform(scale, 0, 0, scale, overview.width * 0.2, overview.width * 0.2);
	
	overc.lineWidth = 5;
	overc.strokeStyle = '#000';
	overc.fillStyle = '#000';
	overc.font = 'italic 80px sans-serif';
	overc.textBaseline = 'bottom';

	// top bar
	overc.beginPath();
	overc.moveTo(0, 0);
	overc.lineTo(d, 0);
	overc.stroke();
	if (variables) {
		overc.textAlign = 'center';
		overc.fillText('d', 0.5 * d, 0);
	}
	
	// right pendulum
	overc.save();
	{
		overc.translate(d, 0);
		overc.rotate(-beta);
		
		overc.beginPath();
		overc.moveTo(0, 0);
		overc.lineTo(0, 1.8 * c);
		overc.stroke();
		
		overc.beginPath();
		overc.arc(0, 2.0 * c, 0.2 * c, 0, 2.0 * Math.PI, true);
		overc.stroke();
		
		// paper
		overc.save();
		{
			overc.translate(0, c);
			overc.rotate(-gamma);
			
			overc.fillStyle = '#fff';
			overc.beginPath();
			overc.arc(0, 0, r, 0, 2.0 * Math.PI, false);
			overc.fill();
			
			overc.beginPath();
			overc.arc(0, 0, r, 0, 2.0 * Math.PI, false);
			overc.stroke();
			
			overc.beginPath();
			overc.moveTo(0.8 * r, 0);
			overc.lineTo(-0.8 * r, 0);
			overc.moveTo(0, 0.8 * r);
			overc.lineTo(0, -0.8 * r);
			overc.moveTo(-0.1 * r, -0.6 * r);
			overc.lineTo(0, -0.8 * r);
			overc.lineTo(0.1 * r, -0.6 * r);
			overc.stroke();
			
			if (variables) {
				overc.textAlign = 'center';
				overc.fillStyle = '#000';
				overc.fillText('r', 0.5 * r, 0);
			}
		}
		overc.restore();
		
		if (variables) {
			overc.textAlign = 'left';
			overc.fillText(' c', 0, 0.5 * c);
		}
	}
	overc.restore();
	
	// left pendulum
	overc.save();
	{
		overc.rotate(-alpha);
		
		overc.beginPath();
		overc.moveTo(0, 0);
		overc.lineTo(0, 1.8 * c);
		overc.moveTo(0, q);
		overc.lineTo(p, q);
		overc.stroke();
		
		overc.beginPath();
		overc.arc(0, 2.0 * c, 0.2 * c, 0, 2.0 * Math.PI, false);
		overc.stroke();
		
		overc.beginPath();
		overc.arc(p, q, 10.0, 0, 2.0 * Math.PI, false);
		overc.fill();
		
		if (variables) {
			overc.textAlign = 'center';
			overc.fillText('p', 0.5 * p, q);
			overc.textAlign = 'left';
			overc.fillText(' q', 0, 0.5 * q);
		}
	}
	overc.restore();
}

function savePng() {
	var png = document.createElement('canvas');
	png.width = res;
	png.height = res;
	var renderer = new CanvasRenderer(png, false);
	renderer.draw(xs, ys);
	renderer.save();
}

function saveSvg() {
	var ns = 'http://www.w3.org/2000/svg';
	var svg = document.createElementNS(ns, 'svg');
	svg.setAttribute('xmlns', ns);
	svg.setAttribute('width', res);
	svg.setAttribute('height', res);
	svg.setAttribute('version', '1.1');
	var renderer = new SvgRenderer(svg, false, true);
	renderer.draw(xs, ys);
	renderer.save();
}

function fromPermalink() {
	var link = document.location.hash;
	var values = link.substring(1).split('&');
	for (var i in values) {
		var s = values[i].split('=', 2);
		if (s.length == 2) {
			var input = document.getElementById(s[0]);
			if (input) {
				input.value = s[1];
			}
		}
	}
}

function toPermalink() {
	var link = '#';
	var form = document.getElementById('input');
	var inputs = form.getElementsByTagName('input');
	for (var i in inputs) {
		var input = inputs[i];
		if (input.id) {
			link += input.id + '=' + input.value + '&';
		}
	}
	permalink.href = link;
}
