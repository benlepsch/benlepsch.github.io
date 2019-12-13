function constrain(val, min, max) { // used in moving player around
	if (val > max) {
		val = max;
	}
	if (val < min) {
		val = min;
	}
	return val;
}

function getCharFromCode(code) {
	if (code == 40) {
		return 'DOWN_ARROW';
	}
	if (code == 39) {
		return 'RIGHT_ARROW';
	}
	if (code == 38) {
		return 'UP_ARROW';
	}
	if (code == 37) {
		return 'LEFT_ARROW';
	}

	return String.fromCharCode(code);
}

function pause() {
	if ((new Date().getTime() - lastPaused)/1000 > 1) {
		unpaused = false;
		lastPaused = new Date().getTime();

		// need to make the pause text and background each time because otherwise it blocks the menu screen button and link
		let p_background = document.createElement('div');
		p_background.setAttribute('id','pause_background');
		p_background.classList.add('pause_background');
		p_background.style.width = $(window).width() + 'px';
		p_background.style.height = $(window).height() + 'px';
		p_background.style.left = '0px';
		p_background.style.top = '0px';
		document.body.appendChild(p_background);
		p_background.style.zIndex = 400;

		let p_text = document.createElement('div');
		p_text.setAttribute('id', 'pause_text');
		p_text.classList.add('pause_text');
		p_text.innerHTML = 'Paused<br>Press ' + getCharFromCode(pause_key) + ' to continue';
		document.body.appendChild(p_text);
		p_text.style.left = $(window).width()/2 - p_text.clientWidth/2 + 'px';
		p_text.style.top = $(window).height()/2 - p_text.clientHeight/2 + 'px';
		p_text.style.zIndex = 401;
	}
}

function unpause() {
	if ((new Date().getTime() - lastPaused)/1000 > 1) {
		document.body.removeChild(document.getElementById('pause_background'));
		document.body.removeChild(document.getElementById('pause_text'));
		let countdown = document.createElement('div');
		countdown.classList.add('countdown');
		countdown.innerHTML = '<b>3</b>';
		document.body.appendChild(countdown);
		countdown.style.zIndex = 400;
		countdown.style.left = $(window).width()/2 - countdown.clientWidth/2 + 'px';
		countdown.style.top = $(window).height()/2 - countdown.clientHeight/2 + 'px';

		setTimeout(function() {
			countdown.innerHTML = '<b>2</b>';
			countdown.style.left = $(window).width()/2 - countdown.clientWidth/2 + 'px';
			countdown.style.top = $(window).height()/2 - countdown.clientHeight/2 + 'px';
		}, 1000);
		setTimeout(function() {
			countdown.innerHTML = '<b>1</b>';
			countdown.style.left = $(window).width()/2 - countdown.clientWidth/2 + 'px';
			countdown.style.top = $(window).height()/2 - countdown.clientHeight/2 + 'px';
		}, 2000);
		setTimeout(function() { 
			document.body.removeChild(countdown);
			unpaused = true;
			lastPaused = new Date().getTime();
		}, 3000);
	}
}

class FloatyText {
	constructor(txt, player) {
		this.me = document.createElement('div');
		this.me.classList.add('floaty');
		this.me.innerHTML = txt;
		document.body.appendChild(this.me);
		this.me.style.left = parseInt(player.rep.style.left) + player.rep.clientWidth/2 - this.me.clientWidth/2 + 'px';
		this.me.style.top = parseInt(player.rep.style.top) + player.rep.clientHeight/2 - this.me.clientHeight/2 + 'px';
		//console.log(this.me.clientWidth);
		this.me.style.zIndex = 300;
		this.moving = true;
		this.me.style.opacity = 1;
	}

	update() {
		this.me.style.opacity = this.me.style.opacity - 0.01;
		//console.log(this.me.style.opacity);
		this.me.style.top = parseInt(this.me.style.top) - 0.5 + 'px';
		//console.log(this.me.style.top);
		if (this.me.style.opacity <= 0) {
			document.body.removeChild(this.me);
			this.moving = false;
		}
	}
}

class VegetableManager {
	constructor() {
		this.veggies = []; // holds Vegetable objects
		this.begin = new Date().getTime();
		this.last = this.begin;
		this.cooldown = 0;
		this.upperTick = 150;
		this.lowerTick = 30;
		this.types = ['onion','cabbage','carrot'];
	}

	add() {
		let current = new Date().getTime()
		let dt = Math.round((current - this.last)/1000); // delta milliseconds to seconds, used for generating cooldown
		this.last = current;

		let nv = new Vegetable();		
		// need to set a type
		// this will vary based on how long the game has been going on. 0-10 seconds only onions, then peppers and onions until 20 seconds, then all three.

		// set a random type depending on how long the game has been going for
		if (carrots_only) {
			nv.type = this.types[2];
		} else {
			let since = Math.round((current - this.begin)/1000);
			if (since < 10) {
				nv.type = this.types[0];
			} else if (since < 20) {
				nv.type = this.types[Math.floor(Math.random()*2)];
			} else {
				nv.type = this.types[Math.floor(Math.random()*3)];
			}
		}
		
		nv.direction = ['Right','Left'][Math.floor(Math.random()*2)];

		// handles creating the image and blitting into the right spot
		nv.init();

		this.veggies.push(nv);

		// then set a new cooldown
		// oh god
		// so at max i want maybe a couple every 60 frames/1 second, so cooldown between 30-60?
		// at the start up to 150
		// but leave the min at 30 so you occasionally get 2 veggies at once early game
		
		if (this.upperTick - 2*dt < 30) {
			this.upperTick = 40;
			this.lowerTick = 10;
		} else {
			this.upperTick -= 5*dt;
		}

		// set cooldown from 30 to upperTick
		this.cooldown = Math.round(Math.random() * this.upperTick) + this.lowerTick;
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
				this.veggies[i].update(i);
			}
		}
	}
	
	// remove for veggies that go off the side
	remove(id) {
		document.body.removeChild(this.veggies[parseInt(id)].rep);
		this.veggies.splice(id, 1);
	}

	// remove for veggies that get killed
	kill(id) {
		this.veggies[parseInt(id)].alive = false;
		this.veggies[parseInt(id)].rep.classList.add('flipped');
		this.veggies[parseInt(id)].rep.style.width = this.veggies[parseInt(id)].rep.clientWidth + 'px';
		this.veggies[parseInt(id)].rep.style.height = this.veggies[parseInt(id)].rep.clientHeight * .8 + 'px';
	}

	checkCollision() {
		for (let i = 0; i < this.veggies.length; i++) {
			if (this.veggies[i] != null && this.veggies[i] != undefined) {
				this.veggies[i].colliding(player, i);
			}
		}
	}
}

class Vegetable {
	constructor() {
		this.alive = true;
		this.speed = Math.floor(Math.random() * 4) + 4;
		this.velY = 0;
		this.maxVelY = 28;
		this.accelY = 1.5;
	}

	// create the image and blit onto screen
	// don't need to adjust width and height because i cut and pasted them all at the same relative scale
	init() {
		this.rep = document.createElement('img');
		this.rep.classList.add('vegetable');
		this.rep.src = 'images/' + this.type + '.png';
		document.body.appendChild(this.rep);

		// starts from left side
		if (this.direction == 'Left') {
			this.rep.style.left = -1 * this.rep.clientWidth + 'px';
		} else {
			this.rep.classList.add('mirror');
			this.rep.style.left = 1 + $(window).width() + 'px';
		}

		// get the y right, this never needs to be changed
		if (this.type == 'onion') {
			this.rep.style.top = base_y + player.rep.clientHeight - 100 + 'px';
			this.score = 100;
		} else if (this.type == 'cabbage') {
			this.rep.style.top = base_y + player.rep.clientHeight - 130 + 'px';
			this.score = 130;
		} else if (this.type == 'carrot') {
			this.rep.style.top = base_y + player.rep.clientHeight - 300 + 'px';
			this.score = 170;
		}

		if (this.direction == 'Right') {
			this.speed *= -1;
		}
	}

	update(id) {
		if (this.alive) {
			this.rep.style.left = parseInt(this.rep.style.left) + this.speed + 'px';
		} else {
			this.rep.style.top = parseInt(this.rep.style.top) + this.velY + 'px';
			this.velY = constrain(this.velY + this.accelY, 0, this.maxVelY);
		}

		// if its off the screen to the right or left
		if (parseInt(this.rep.style.left) > $(window).width() || parseInt(this.rep.style.left) + this.rep.clientWidth < 0) {
			vm.remove(id);
		}

		// if it's below the screen
		// this only activates when it dies
		if (parseInt(this.rep.style.top) > $(window).height()) {
			vm.remove(id);
		}
	}

	// if killing player, kill him and then reset the game
	// if dying, add player y acceleration and then remove
	colliding(p, id) {
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
		////console.log('ptop: ' + p.rep.style.top + '\tpheight: ' + p.rep.clientHeight + '\tvegtop: ' + this.rep.style.top);
		if (playerBottom + 5 > vegTop && playerTop < vegTop) {
			////console.log('bruh');
	
			// make sure it's at least partially over it
			// right corner over it, both over it, left over it
			// make sure the veggie is alive and the player is falling down
			if (((playerRight > vegLeft && playerLeft < vegLeft) ||
			(playerLeft > vegLeft && playerRight < vegRight) ||
			(playerLeft > vegLeft && playerLeft < vegRight)) &&
			(p.velocityY > 0 && this.alive)) {
				////console.log('HIT');
				// kill the vegetable and increase player's acceleration
				let ftext = '';
				p.jumpin = true;
				p.chain ++;
				if (p.chain > 20) {
					p.score += this.score * 20;
					ftext = p.chain + ' chain<br>' + this.score + 'x20';
				} else {
					if (p.chain > 1) {
						ftext = p.chain + ' chain<br>' + this.score + 'x' + p.chain;
					} else {
						ftext = '' + this.score;
					}
					p.score += this.score * p.chain;
				}

				vm.kill(id);

				floatyTexts.push(new FloatyText(ftext, player));
			}
			return;
		}
	
		// if the player is running into the left side of the veg
		// aka if (the left side is inside the left) and (the right isnt) and (the bottom is below top and above bottom) or (the top is below top and above bottom)
		if (( playerLeft > vegLeft && playerLeft < vegRight ) &&
		(( (playerTop < vegTop && playerTop > vegBottom) ||
		(playerBottom > vegTop && playerBottom < vegBottom )))) {
			if (cheats) {
				let ftext = '';
				p.jumpin = true;
				p.chain ++;
				if (p.chain > 20) {
					p.score += this.score * 20;
					ftext = p.chain + ' chain<br>' + this.score + 'x20';
				} else {
					if (p.chain > 1) {
						ftext = p.chain + ' chain<br>' + this.score + 'x' + p.chain;
					} else {
						ftext = '' + this.score;
					}
					p.score += this.score * p.chain;
				}

				vm.kill(id);

				floatyTexts.push(new FloatyText(ftext, player));
				return;
			}
			p.alive = false;
			return;
		}
	
		// if the player is running into the right side of the veg
		// same as the previous massive if statement but flipped x values
		// if the right side of the player is between the veggie's right and left side
		if (( playerRight > vegLeft && playerRight < vegRight ) &&
		(( (playerTop < vegTop && playerTop > vegBottom) ||
		(playerBottom > vegTop && playerBottom < vegBottom )))) {
			if (cheats) {
				let ftext = '';
				p.jumpin = true;
				p.chain ++;
				if (p.chain > 20) {
					p.score += this.score * 20;
					ftext = p.chain + ' chain<br>' + this.score + 'x20';
				} else {
					if (p.chain > 1) {
						ftext = p.chain + ' chain<br>' + this.score + 'x' + p.chain;
					} else {
						ftext = '' + this.score;
					}
					p.score += this.score * p.chain;
				}

				vm.kill(id);

				floatyTexts.push(new FloatyText(ftext, player));
				return;
			}
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
				if (cheats) {
					let ftext = '';
					p.jumpin = true;
					p.chain ++;
					if (p.chain > 20) {
						p.score += this.score * 20;
						ftext = p.chain + ' chain<br>' + this.score + 'x20';
					} else {
						if (p.chain > 1) {
							ftext = p.chain + ' chain<br>' + this.score + 'x' + p.chain;
						} else {
							ftext = '' + this.score;
						}
						p.score += this.score * p.chain;
					}
	
					vm.kill(id);
	
					floatyTexts.push(new FloatyText(ftext, player));
					return;
				}
				p.alive = false;
				return;
			}
		}
	}

	summon(type, direction) {
		this.rep = document.createElement('img');
		this.rep.classList.add('vegetable');
		this.rep.src = 'images/' + type + '.png';
		if (direction == 'Right') {
			this.rep.classList.add('mirror');
		}
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
		this.gravity = 1.5; //gravity
		this.jumpAccel = 60;
		this.accelY = 0;

		this.maxVelX = 25;
		this.maxVelY = 20;

		this.rep = document.getElementById(this.id);
		this.rep.style.left = Math.round($(window).width()/2) + 'px';
		
		this.alive = true;
		this.jumpin = false;

		this.score = 0;
		this.chain = 0;
	}

	update() {
		this.velocityX = constrain(this.velocityX + this.accelX, -1*this.maxVelX, this.maxVelX);
		this.velocityY = constrain(this.velocityY + this.gravity + this.accelY, -1*this.maxVelY, this.maxVelY);
		////console.log("accel: " + this.accelX + "\tvel: " + this.velocityX);

		this.velocityX = this.velocityX < 0 ? Math.ceil(this.velocityX/2) : Math.floor(this.velocityX/2);
		this.accelX = this.accelX < 0 ? Math.ceil(this.accelX/4) : Math.floor(this.accelX/4);
		this.accelY = this.accelY < 0 ? Math.ceil(this.accelY/2) : Math.floor(this.accelY/2);

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

let carrots_only = false;

function changeCarrots() {
	carrots_only = !carrots_only;
	alert('carrots only has been ' + ((carrots_only) ? 'enabled' : 'disabled'));
}

// determine where to draw the ground
let base_y = Math.floor($(window).height()*2 /3);
let recent_score = 0;
let best_score = 0;
let cheats = false;

let unpaused = true;
let lastPaused = new Date().getTime();

let recent = document.getElementById('recent');
let best = document.getElementById('best');

let papi_info = document.getElementById('papiinfo');

let player = new Player('player');

let score = document.createElement('div');
score.classList.add('score');
score.innerHTML = 'Score: 0';
document.body.appendChild(score);
score.style.display = 'none';

let running = false;

let floatyTexts = [];

// set up background
let sky = document.getElementById('sky');
let ground = document.getElementById('ground');

sky.style.width = $(window).width() + 'px';
sky.style.height = $(window).height() + 'px';
sky.style.top = '0px';
sky.style.left = '0px';

////console.log($(window).width());

ground.style.width = $(window).width() + 'px';
ground.style.height = $(window).height() - (base_y + player.rep.clientHeight) + 'px';
ground.style.top = base_y + player.rep.clientHeight + 'px';
ground.style.left = '0px';

let jump_key = 38, left_key = 37, right_key = 39, pause_key = 40;
let keys = {};

player.rep.style.top = base_y + 'px';

let rebinding = null;

function rebind(key) {
	rebinding = key;
}

window.onkeydown = function(e) {
	let key = e.keyCode ? e.keyCode : e.which;

	if (rebinding != null) {
		if (rebinding == 'jump') {
			jump_key = key;
		} else if (rebinding == 'pause') {
			pause_key = key;
		} else if (rebinding == 'right') {
			right_key = key;
		} else {
			left_key = key;
		}
		rebinding = null;

		updateCookie('keys', left_key + ',' + jump_key + ',' + right_key + ',' + pause_key);
		return;
	}

	keys[key] = true;
	
	if (keys[jump_key]) {
		if (! running) {
			startGame(60);
		}
	}
}

window.onkeyup = function(e) {
	let key = e.keyCode ? e.keyCode : e.which;
	keys[key] = false;
}

function checkKeys() {
	if (keys[jump_key]) {
		if (parseInt(player.rep.style.top) == base_y) {
			player.jumpin = true;
		}
	}
	if (keys[left_key]) {
		player.accelX -= 10;
	}
	if (keys[right_key]) {
		player.accelX += 10;
	}
	if (keys[pause_key]) {
		if (unpaused) {
			pause();
		} else {
			unpause();
		}
	}
}

function updateCookie(name, value) {
	document.cookie = name + '=' + value + ';';
}

// read cookies for high score and keybinds, if they exist
window.onload = function() {
	if (document.cookie == '') return;
	let c = document.cookie.split('; ');

	for (let i = 0; i < c.length; i++) {
		if (c[i].slice(0,10) == 'highscore=') {
			best_score = (c[i].slice(10, c[0].length));
			document.getElementById('best').innerHTML = 'Best score: ' + best_score;
		}

		if (c[i].slice(0,5) == 'keys=') {
			let ka = c[i].slice(5, c[i].length).split(',');
			left_key = parseInt(ka[0]);
			jump_key = parseInt(ka[1]);
			right_key = parseInt(ka[2]);
			pause_key = parseInt(ka[3]);
		}
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
	document.getElementById('menu_stuff').style.display = 'none';

	document.getElementById('sky').style.display = 'block';
	document.getElementById('ground').style.display = 'block';
	document.getElementById('player').style.display = 'block';
	ground.style.top = base_y + player.rep.clientHeight + 'px';
	running = true;
	player.alive = true;

	document.getElementsByClassName('score')[0].style.display = 'block';

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

	checkKeys();
    if (elapsed > fpsInterval && unpaused) {
		then = now - (elapsed % fpsInterval);

		if (player.jumpin) {
			player.accelY = -1 * player.jumpAccel;
			player.jumpin = false;
		}

		player.update();
		if (vm.isTime()) {
			vm.add();
		}
		vm.update();
		vm.checkCollision();

		for (let i = 0; i < floatyTexts.length; i++) {
			//console.log('updating?');
			////console.log(floatyTexts[i]);
			if (floatyTexts[i] != null) {
				//console.log(floatyTexts[i].moving);
				if (floatyTexts[i].moving) {
					//console.log('updating!');
					//console.log(floatyTexts[i]);
					floatyTexts[i].update();
				} else {
					floatyTexts.splice(i, 1);
					i --;
				}
			}
		}

		let score = document.getElementsByClassName('score')[0];
		score.innerHTML = 'Score: ' + player.score;
		recent_score = player.score;
		if (player.score > best_score) {
			best_score = player.score;
		}
    }
}

function reset() {
	let vml = vm.veggies.length;
	for (let i = 0; i < vml; i++) {
		vm.remove(0);
	}
	running = false;

	// summon menu screen veggies
	onion.summon('onion','Left');
	cabbage.summon('cabbage','Left');
	carrot.summon('carrot','Left');
	onion.rep.style.left = $(window).width()/2 + 'px';
	cabbage.rep.style.left = $(window).width()/2 + 'px';
	carrot.rep.style.left = $(window).width()/2 + 'px';
	onion.rep.style.top = $(window).height()/3 + 'px';
	cabbage.rep.style.top = $(window).height()/3 + 'px';
	carrot.rep.style.top = $(window).height()/3 + 'px';

	// bring back start button and score displays
	document.getElementById('menu_stuff').style.display = 'block';
	recent.innerHTML = 'Recent score: ' + recent_score;
	best.innerHTML = 'Best score: ' + best_score;
	updateCookie('highscore', best_score);

	// remove game stuff
	document.getElementById('sky').style.display = 'none';
	document.getElementById('ground').style.display = 'none';
	document.getElementById('player').style.display = 'none';

	for (let i = 0; i < floatyTexts.length; i++) {
		if (floatyTexts[i] != null) {
			document.body.removeChild(floatyTexts[i].me);
		}
	}

	floatyTexts = [];
	document.getElementsByClassName('score')[0].style.display = 'none';
	
	player = null;
	vm = null;
}

let onion = new Vegetable();
let cabbage = new Vegetable();
let carrot = new Vegetable();
onion.summon('onion','Left');
cabbage.summon('cabbage','Left');
carrot.summon('carrot','Left');
onion.rep.style.left = $(window).width()/2 + 'px';
cabbage.rep.style.left = $(window).width()/2 + 'px';
carrot.rep.style.left = $(window).width()/2 + 'px';
onion.rep.style.top = $(window).height()/3 + 'px';
cabbage.rep.style.top = $(window).height()/3 + 'px';
carrot.rep.style.top = $(window).height()/3 + 'px';