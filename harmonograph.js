'use strict';

var d, c, p, q, r, A, B, u, v, R, S, f, g, h, s;

var x = 0.0;
var y = 0.0;
var t = 0.0, dt = 0.01;
var alpha, beta, gamma;

var output, outc;
var overview, overc;
var startStop, permalink;

var intervalId = null;

function init() {
	startStop = document.getElementById('startstop');
	permalink = document.getElementById('permalink');
	output = document.getElementById('output');
	outc = output.getContext('2d');
	overview = document.getElementById('overview');
	overc = overview.getContext('2d');

	fromPermalink();
	readInput();
	toPermalink();
	initial();
}

function initial() {
	t = 0.0;
	updateXY();
	
	outc.setTransform(1, 0, 0, 1, 0, 0);
	outc.clearRect(0, 0, output.width, output.height);
	outc.strokeStyle = '#000';
	outc.globalAlpha = 0.2;
	
	if (r) {
		var scale = Math.min(output.width * 0.9 / 2.0 / r, output.height * 0.9 / 2.0 / r);
		outc.setTransform(scale, 0, 0, scale, output.width / 2.0, output.height / 2.0);
		
		outc.save();
		outc.strokeStyle = '#eee';
		outc.globalAlpha = 1.0;
		outc.beginPath();
		outc.arc(0, 0, r, 0, 2.0 * Math.PI, false);
		outc.stroke();
		outc.restore();
	}
	
	drawOverview(true);
	
	return false;
}

function start() {
	if (intervalId == null) {
		intervalId = window.setInterval(step, 1000 * dt);
		
		startStop.innerHTML = 'Stop';
		startStop.onclick = stop;
		enableInput(false);
	}
	return false;
}

function stop() {
	if (intervalId != null) {
		window.clearInterval(intervalId);
		intervalId = null;
		
		startStop.innerHTML = 'Start';
		startStop.onclick = start;
		enableInput(true);
	}
	return false;
}

function step() {
	outc.beginPath();
	outc.moveTo(x, y);
	for (var i = 0; i < s; ++i) {
		t += dt;
		updateXY();
		outc.lineTo(x, y);
	}
	outc.stroke();
	
	drawOverview(false);
}

function inputChange() {
	readInput();
	initial();
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
}

function drawOverview(variables) {
	overc.setTransform(1, 0, 0, 1, 0, 0);
	overc.clearRect(0, 0, output.width, output.height);
	
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
