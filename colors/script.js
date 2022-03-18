let colors = ['blue','red','green','yellow','purple','brown','tomato','dodgerblue','mediumseagreen','violet','slateblue']

function getNewGradient() {
	let numColors = 3 + Math.floor(Math.random() * (colors.length - 3));
	let out = '';
	for (let i = 0; i < numColors; i++) {
		out += colors[i];
		if (i != (numColors - 1)) {
			out += ', '
		}
	}
	return out;
}

function change() {
	document.body.style.backgroundImage = 'radial-gradient(' + getNewGradient() + ')';
	setTimeout(change, 200);
}
change();