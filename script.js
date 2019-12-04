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
		this.upperTick = 150;
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
		// at the start up to 150
		// but leave the min at 30 so you occasionally get 2 veggies at once early game
		
		if (this.upperTick - 2*dt < 60) {
			this.upperTick = 60;
		} else {
			this.upperTick -= 5*dt;
		}

		// set cooldown from 30 to upperTick
		this.cooldown = Math.round(Math.random() * this.upperTick) + 30;

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
		// does nothing rn
		this.veggies[parseInt(id)].alive = false;
		this.veggies[parseInt(id)].rep.classList.add('flipped');
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
		this.velY = 0;
		this.maxVelY = 28;
		this.accelY = 1.5;
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
			this.rep.style.top = base_y + player.rep.clientHeight - 290 + 'px';
		}

		if (this.direction == 'Right') {
			this.speed *= -1;
		}
	}

	update() {
		if (this.alive) {
			this.rep.style.left = parseInt(this.rep.style.left) + this.speed + 'px';
		} else {
			this.rep.style.top = parseInt(this.rep.style.top) + this.velY + 'px';
			this.velY = constrain(this.velY + this.accelY, 0, this.maxVelY);
		}

		// if its off the screen to the right or left
		if (parseInt(this.rep.style.left) > $(window).width() || parseInt(this.rep.style.left) + this.rep.clientWidth < 0) {
			vm.remove(this.id);
		}

		// if it's below the screen
		// this only activates when it dies
		if (parseInt(this.rep.style.top) > $(window).height()) {
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
		
		let playerLeft = parseInt(p.rep.style.left);
		let playerTop = parseInt(p.rep.style.top);
		let playerRight = playerLeft + p.rep.clientWidth;
		let playerBottom = playerTop + p.rep.clientHeight;
	
		let vegLeft = parseInt(this.rep.style.left);
		let vegTop = parseInt(this.rep.style.top);
		let vegRight = vegLeft + this.rep.clientWidth;
		let vegBottom = vegTop + this.rep.clientHeight;
	
		// if the player is above the veg and a little inside, but not too much, AND its top is wholly above it
		// if the player's bottom is a little below the veggie's top
		//console.log('ptop: ' + p.rep.style.top + '\tpheight: ' + p.rep.clientHeight + '\tvegtop: ' + this.rep.style.top);
		if (playerBottom + 5 > vegTop && playerTop < vegTop) {
			//console.log('bruh');
	
			// make sure it's at least partially over it
			// right corner over it, both over it, left over it
			// make sure the veggie is alive and the player is falling down
			if (((playerRight > vegLeft && playerLeft < vegLeft) ||
			(playerLeft > vegLeft && playerRight < vegRight) ||
			(playerLeft > vegLeft && playerLeft < vegRight)) &&
			(p.velocityY > 0 && this.alive)) {
				//console.log('HIT');
				// kill the vegetable and increase player's acceleration
				p.velocityY = -1 * p.maxVelY;
				p.chain ++;
				if (p.chain > 20) {
					p.score += 100 * 20;
				} else {
					p.score += 100 * p.chain;
				}
				vm.kill(this.id);
			}
			return;
		}
	
		// if the player is running into the left side of the veg
		// aka if (the left side is inside the left) and (the right isnt) and (the bottom is below top and above bottom) or (the top is below top and above bottom)
		if (( playerLeft > vegLeft && playerLeft < vegRight ) &&
		(( (playerTop < vegTop && playerTop > vegBottom) ||
		(playerBottom > vegTop && playerBottom < vegBottom )))) {
			p.alive = false;
			return;
		}
	
		// if the player is running into the right side of the veg
		// same as the previous massive if statement but flipped x values
		// if the right side of the player is between the veggie's right and left side
		if (( playerRight > vegLeft && playerRight < vegRight ) &&
		(( (playerTop < vegTop && playerTop > vegBottom) ||
		(playerBottom > vegTop && playerBottom < vegBottom )))) {
			p.alive = false;
			return;
		}
	
		// lastly we need somethign to check if the top of the player is inside a veg
		// jumping into carrots actually kills you because it activates one of the things above but without this you can go under the cabbages
		// if the players top (plus a little bit) is above the veggie's bottom and player bottom is below veggie bottom
		if (playerTop + 5 < vegBottom && playerBottom > vegBottom) {
			// and if its left is between the veggie's right and left or if its right is between veggie right and left
			if ((playerLeft > vegLeft && playerLeft < vegRight) ||
			(playerRight > vegLeft && playerRight < vegRight)) {
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
let recent_score = 0;
let best_score = 0;

let recent = document.getElementById('recent');
let best = document.getElementById('best');

let papi_info = document.getElementById('papiinfo');

let player = new Player('player');


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

let vm;

let fpsInterval, then, startTime, elapsed;
function startGame(fps) {
	vm = new VegetableManager();
	if (player == null) {
		player = new Player('player');
	}

	document.body.removeChild(onion.rep);
	document.body.removeChild(cabbage.rep);
	document.body.removeChild(carrot.rep);
	document.getElementById('start').style.display = 'none';
	papi_info.style.display = 'none';
	recent.style.display = 'none';
	best.style.display = 'none';

	let score = document.createElement('div');
	score.classList.add('score');
	score.innerHTML = 'Score: 0';
	document.body.appendChild(score);

	document.getElementById('sky').style.display = 'block';
	document.getElementById('ground').style.display = 'block';
	document.getElementById('player').style.display = 'block';
	ground.style.top = base_y + player.rep.clientHeight + 'px';

	player.alive = true;

    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    runGame();
}

function runGame() {
	if (! player.alive) {
		reset();
		return;
	}
	if (player.alive) {
    	requestAnimationFrame(runGame);
	}
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
		recent_score = player.score;
		if (player.score > best_score) {
			best_score = player.score;
		}
    }
}

function reset() {
	for (let i = 0; i < vm.veggies.length; i++) {
		if (vm.veggies[i] != null) {
			vm.remove(i);
		}
	}

	// summon menu screen veggies
	onion.summon('Left');
	cabbage.summon('Left');
	carrot.summon('Left');
	onion.rep.style.left = $(window).width()/2 + 'px';
	cabbage.rep.style.left = $(window).width()/2 + 'px';
	carrot.rep.style.left = $(window).width()/2 + 'px';
	onion.rep.style.top = $(window).height()/3 + 'px';
	cabbage.rep.style.top = $(window).height()/3 + 'px';
	carrot.rep.style.top = $(window).height()/3 + 'px';

	// bring back start button and score displays
	document.getElementById('start').style.display = 'block';
	recent.style.display = 'block';
	best.style.display = 'block';
	recent.innerHTML = 'Recent score: ' + recent_score;
	best.innerHTML = 'Best score: ' + best_score;
	papi_info.style.display = 'block';

	// remove game stuff
	document.getElementById('sky').style.display = 'none';
	document.getElementById('ground').style.display = 'none';
	document.getElementById('player').style.display = 'none';
	document.body.removeChild(document.getElementsByClassName('score')[0]);
	
	player = null;
	vm = null;
}

let onion = new Vegetable('onion');
let cabbage = new Vegetable('cabbage');
let carrot = new Vegetable('carrot');
onion.summon('Left');
cabbage.summon('Left');
carrot.summon('Left');
onion.rep.style.left = $(window).width()/2 + 'px';
cabbage.rep.style.left = $(window).width()/2 + 'px';
carrot.rep.style.left = $(window).width()/2 + 'px';
onion.rep.style.top = $(window).height()/3 + 'px';
cabbage.rep.style.top = $(window).height()/3 + 'px';
carrot.rep.style.top = $(window).height()/3 + 'px';

//startGame(60);