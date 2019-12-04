function constrain(val, min, max) { // used in moving player around
	if (val > max) {
		val = max;
	}
	if (val < min) {
		val = min;
	}
	return val;
}

class VegetableManager {
	constructor() {
		this.veggies = []; // holds Vegetable objects
		this.onVeg = 0; // indexes vegetables
		this.begin = new Date().getTime();
		this.last = this.begin;
		this.cooldown = 0;
		this.lowerTick = 200;
		this.types = ['onion','cabbage','carrot'];
	}

	add() {
		let current = new Date().getTime()
		let dt = Math.round((current - this.last)/1000); // delta milliseconds to seconds, used for generating cooldown
		this.last = current;

		this.veggies[this.onVeg] = new Vegetable(this.onVeg);
		
		// need to set a type
		// this will vary based on how long the game has been going on. 0-10 seconds only onions, then peppers and onions until 20 seconds, then all three.

		// set a random type depending on how long the game has been going for
		let since = Math.round((current - this.begin)/1000);
		if (since < 10) {
			this.veggies[this.onVeg].type = this.types[0];
		} else if (since < 20) {
			this.veggies[this.onVeg].type = this.types[Math.floor(Math.random()*2)];
		} else {
			this.veggies[this.onVeg].type = this.types[Math.floor(Math.random()*3)];
		}
		
		this.veggies[this.onVeg].direction = ['Right','Left'][Math.floor(Math.random()*2)];

		// handles creating the image and blitting into the right spot
		this.veggies[this.onVeg].init();

		// then set a new cooldown
		// oh god
		// so at max i want maybe a couple every 60 frames/1 second, so cooldown between 30-60?
		// at the start idk dude maybe cooldown of 200-400 or something
		// but how do i scale that
		// after 60 seconds i want max speed
		// so 60 seconds for delta 120 ticks
		// for every second decrease lower tick by 2
		
		if (this.lowerTick - 2*dt < 30) {
			this.lowerTick = 30;
		} else {
			this.lowerTick -= 2*dt;
		}

		// set cooldown from lowerTick to double lowerTick, so 30 to 60 or 200 to 400 etc
		this.cooldown = Math.round(Math.random() * this.lowerTick) + this.lowerTick;

		this.onVeg ++;
	}

	// decide if a new veg is to be added
	isTime() {
		// i'm going to add a cooldown here
		// like
		// depending on the time since the start of the game it will pick a random number of game ticks to loop thru until it spawns another veggie
		// then when cooldown = 0 it spawns a veg and pick a new number
		if (this.cooldown <= 0) {
			return true;
		} else {
			this.cooldown --;
			return false;
		}
	}

	// update the vegetals
	update() {
		for (let i = 0; i < this.veggies.length; i++) {
			if (this.veggies[i] != null && this.veggies[i] != undefined) {
				this.veggies[i].update();
			}
		}
	}
	
	// remove for veggies that go off the side
	remove(id) {
		document.body.removeChild(this.veggies[parseInt(id)].rep);
		this.veggies[parseInt(id)] = null;
	}

	// remove for veggies that get killed
	// separate function right now because i want to make it fall off like the real game later
	// eventually make this just set alive to false, turn upside down
	kill(id) {
		this.remove(id);
	}

	checkCollision() {
		for (let i = 0; i < this.veggies.length; i++) {
			if (this.veggies[i] != null && this.veggies[i] != undefined) {
				this.veggies[i].colliding(player);
			}
		}
	}
}

class Vegetable {
	constructor(id) {
		this.id = id;
		this.alive = true;
		this.speed = Math.floor(Math.random() * 8) + 4;
	}

	// create the image and blit onto screen
	// don't need to adjust width and height because i cut and pasted them all at the same relative scale
	init() {
		this.rep = document.createElement('img');
		this.rep.classList.add('vegetable');
		this.rep.src = 'images/' + this.type + this.direction + '.png';
		document.body.appendChild(this.rep);

		// starts from left side
		if (this.direction == 'Left') {
			this.rep.style.left = -1 * this.rep.clientWidth + 'px';
		} else {
			this.rep.style.left = 1 + $(window).width() + 'px';
		}

		// get the y right, this never needs to be changed
		if (this.type == 'onion') {
			this.rep.style.top = base_y + player.rep.clientHeight - 100 + 'px';
		} else if (this.type == 'cabbage') {
			this.rep.style.top = base_y + player.rep.clientHeight - 130 + 'px';
		} else if (this.type == 'carrot') {
			this.rep.style.top = base_y + player.rep.clientHeight - 280 + 'px';
		}

		if (this.direction == 'Right') {
			this.speed *= -1;
		}
	}

	update() {
		if (this.alive) {
			this.rep.style.left = parseInt(this.rep.style.left) + this.speed + 'px';
		}

		// if its off the screen
		if (parseInt(this.rep.style.left) > $(window).width() || parseInt(this.rep.style.left) + this.rep.clientWidth < 0) {
			vm.remove(this.id);
		}
	}

	// if killing player, kill him and then reset the game
	// if dying, add player y acceleration and then remove
	colliding(p) {
		// i'm going to collision detect after the player gets a little bit inside of the veg because that's how the real game looks
		// ok then

		// dont want to collide with a dead veggie
		if (! this.alive) {
			return;
		}

		// if the player is above the veg and a little inside, but not too much, AND its top is wholly above it
		// if the player's bottom is a little below the veggie's top
		//console.log('ptop: ' + p.rep.style.top + '\tpheight: ' + p.rep.clientHeight + '\tvegtop: ' + this.rep.style.top);
		if (parseInt(p.rep.style.top) + p.rep.clientHeight > parseInt(this.rep.style.top) && parseInt(p.rep.style.top) + p.rep.clientHeight/2 < parseInt(this.rep.style.top)) {
			//console.log('bruh');

			// make sure it's at least partially over it
			// right corner over it, both over it, left over it
			// make sure the veggie is alive and the player is falling down
			if (((parseInt(p.rep.style.left) + p.rep.clientWidth > parseInt(this.rep.style.left) && parseInt(p.rep.style.left) < parseInt(this.rep.style.left)) ||
			(parseInt(p.rep.style.left) > parseInt(this.rep.style.left) && parseInt(p.rep.style.left) + p.rep.clientWidth < parseInt(this.rep.style.left) + this.rep.clientWidth) ||
			(parseInt(p.rep.style.left) > parseInt(this.rep.style.left) && parseInt(p.rep.style.left) < parseInt(this.rep.style.left) + this.rep.clientWidth)) &&
			(p.velocityY > 0 && this.alive)) {
				//console.log('HIT');
				// kill the vegetable and increase player's acceleration
				p.velocityY = -1 * p.maxVelY;
				p.chain ++;
				if (p.chain > 20) {
					p.chain = 20;
				}
				p.score += 100 * p.chain;
				vm.kill(this.id);
			}
			return;
		}

		// if the player is running into the left side of the veg
		// aka if (the left side is inside the left) and (the right isnt) and (the bottom is below top and above bottom) or (the top is below top and above bottom)
		if (( parseInt(p.rep.style.left) > parseInt(this.rep.style.left) && parseInt(p.rep.style.left) < parseInt(this.rep.style.left) + this.rep.clientWidth ) &&
		(( (parseInt(p.rep.style.top) < parseInt(this.rep.style.top) && parseInt(p.rep.style.top) > parseInt(this.rep.style.top) + this.rep.clientHeight) ||
		(parseInt(p.rep.style.top) + p.rep.clientHeight > parseInt(this.rep.style.top) && parseInt(p.rep.style.top) + p.rep.clientHeight < parseInt(this.rep.style.top) + this.rep.clientHeight )))) {
			p.alive = false;
			return;
		}

		// if the player is running into the right side of the veg
		// same as the previous massive if statement but flipped x values
		// if the right side of the player is between the veggie's right and left side
		if (( parseInt(p.rep.style.left) + p.rep.clientWidth > parseInt(this.rep.style.left) && parseInt(p.rep.style.left) + p.rep.clientWidth < parseInt(this.rep.style.left) + this.rep.clientWidth ) &&
		(( (parseInt(p.rep.style.top) < parseInt(this.rep.style.top) && parseInt(p.rep.style.top) > parseInt(this.rep.style.top) + this.rep.clientHeight) ||
		(parseInt(p.rep.style.top) + p.rep.clientHeight > parseInt(this.rep.style.top) && parseInt(p.rep.style.top) + p.rep.clientHeight < parseInt(this.rep.style.top) + this.rep.clientHeight )))) {
			p.alive = false;
			return;
		}

		// lastly we need somethign to check if the top of the player is inside a veg
		// jumping into carrots actually kills you because it activates one of the things above but without this you can go under the cabbages
		// if the players top (plus a little bit) is above the veggie's bottom and player bottom is below veggie bottom
		if (parseInt(p.rep.style.top) + 5 < parseInt(this.rep.style.top) + this.rep.clientHeight && parseInt(p.rep.style.top) + p.rep.clientHeight > parseInt(this.rep.style.top) + this.rep.clientHeight) {
			// and if its left is between the veggie's right and left or if its right is between veggie right and left
			if ((parseInt(p.rep.style.left) > parseInt(this.rep.style.left) && parseInt(p.rep.style.left) < parseInt(this.rep.style.left) + this.rep.clientWidth) ||
			(parseInt(p.rep.style.left) + p.rep.clientWidth > parseInt(this.rep.style.left) && parseInt(p.rep.style.left) + p.rep.clientWidth < parseInt(this.rep.style.left) + this.rep.clientWidth)) {
				p.alive = false;
				return;
			}
		}
	}

	summon(direction) {
		this.rep = document.createElement('img');
		this.rep.classList.add('vegetable');
		this.rep.src = 'images/' + this.id + direction + '.png';
		document.body.appendChild(this.rep);
	}
}

// handle player movement basically
class Player {
	constructor(id) {
		this.id = id;
		this.velocityX = 0;
		this.velocityY = 0;
		this.accelX = 0;
		this.accelY = 1.5; //gravity

		this.maxAccelX = 10;
		this.maxVelX = 25;
		this.maxVelY = 28;

		this.rep = document.getElementById(this.id);
		this.rep.style.left = Math.round($(window).width()/2) + 'px';
		
		this.alive = true;

		this.score = 0;
		this.chain = 0;
	}

	update() {
		this.velocityX = constrain(this.velocityX + this.accelX, -1*this.maxVelX, this.maxVelX);
		this.velocityY = constrain(this.velocityY + this.accelY, -1*this.maxVelY, this.maxVelY);
		//console.log("accel: " + this.accelX + "\tvel: " + this.velocityX);

		this.velocityX = this.velocityX < 0 ? Math.ceil(this.velocityX/2) : Math.floor(this.velocityX/2);
		this.accelX = 0;

		// if it's going off the left side of the screen or if it's going to go off the left side of the screen
		if ((parseInt(this.rep.style.left) <= 0 && this.velocityX < 0) || (parseInt(this.rep.style.left) + this.velocityX < 0)) {
			this.rep.style.left = '0px';
			this.velocityX = 0;
			this.accelX = 0;
		}

		// if it's going off the right side or if it's going to go off the right side
		if ((parseInt(this.rep.style.left) + this.rep.clientWidth > $(window).width()) || (parseInt(this.rep.style.left) + this.rep.clientWidth + this.velocityX > $(window).width())) {
			this.rep.style.left = $(window).width() - this.rep.clientWidth + 'px';
			this.velocityX = 0;
			this.accelX = 0;
		}

		if (parseInt(this.rep.style.top) == base_y) {
			this.chain = 0;
		}

		this.rep.style.left = parseInt(this.rep.style.left) + this.velocityX + 'px';
		this.rep.style.top = constrain(parseInt(this.rep.style.top) + this.velocityY, 0, base_y) + 'px';
	}
}

// determine where to draw the ground
let base_y = Math.floor($(window).height()*2 /3);

let player = new Player('player');
let vm = new VegetableManager();

// set up background
let sky = document.getElementById('sky');
let ground = document.getElementById('ground');

sky.style.width = $(window).width() + 'px';
sky.style.height = $(window).height() + 'px';
sky.style.top = '0px';
sky.style.left = '0px';

//console.log($(window).width());

ground.style.width = $(window).width() + 'px';
ground.style.height = $(window).height() - (base_y + player.rep.clientHeight) + 'px';
ground.style.top = base_y + player.rep.clientHeight + 'px';
ground.style.left = '0px';

let keys = {};

player.rep.style.top = base_y + 'px';

window.onkeydown = function(e) {
    let key = e.keyCode ? e.keyCode : e.which;
		keys[key] = true;
}

window.onkeyup = function(e) {
	let key = e.keyCode ? e.keyCode : e.which;
	keys[key] = false;
}

function checkKeys() {
	if (keys[87] || keys[38] || keys[32]) {
		if (parseInt(player.rep.style.top) == base_y) {
			player.velocityY = -1 * player.maxVelY;
		}
	}
	if (keys[65] || keys[37]) {
		player.accelX = -20;
	}
	if (keys[68] || keys[39]) {
		player.accelX = 20;
	}
}

//runs the game at a specified fps
//dont touch i dont know how it works

let fpsInterval, then, startTime, elapsed;
function startGame(fps) {
	document.body.removeChild(onion.rep);
	document.body.removeChild(cabbage.rep);
	document.body.removeChild(carrot.rep);
	document.getElementById('start').style.display = 'none';

	let score = document.createElement('div');
	score.classList.add('score');
	score.innerHTML = 'Score: 0';
	document.body.appendChild(score);

	document.getElementById('sky').style.display = 'block';
	document.getElementById('ground').style.display = 'block';
	document.getElementById('player').style.display = 'block';
	ground.style.top = base_y + player.rep.clientHeight + 'px';

    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    runGame();
}

function runGame() {
    requestAnimationFrame(runGame);
    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
		then = now - (elapsed % fpsInterval);
		checkKeys();
		player.update();
		if (vm.isTime()) {
			vm.add();
		}
		vm.update();
		vm.checkCollision();

		let score = document.getElementsByClassName('score')[0];
		score.innerHTML = 'Score: ' + player.score;

		if (! player.alive) {
			reset();
			return;
		}
    }
}

function reset() {
	for (let i = 0; i < vm.veggies.length; i++) {
		if (vm.veggies[i] != null) {
			vm.remove(i);
		}
	}
	player.alive = true;
	onion.summon('Left');
	cabbage.summon('Left');
	carrot.summon('Left');
	document.getElementById('start').style.display = 'block';
	document.getElementById('sky').style.display = 'none';
	document.getElementById('ground').style.display = 'none';
	document.getElementById('player').style.display = 'none';
	document.body.removeChild(document.getElementById('score'));
}

let onion = new Vegetable('onion');
let cabbage = new Vegetable('cabbage');
let carrot = new Vegetable('carrot');
onion.summon('Left');
cabbage.summon('Left');
carrot.summon('Left');

//startGame(60);