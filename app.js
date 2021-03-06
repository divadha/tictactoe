/************************************************
 * DECLARATION OF GLOBAL VARIABLES AND CONSTANTS
 ************************************************/

const VALUES_STAGE = ['11', '12', '13', '21', '22', '23', '31', '32', '33'];
const VALUES_BY_LINES = [
	['11', '12', '13'], // Line 1
	['21', '22', '23'], // Line 2
	['31', '32', '33'], // Line 3
	['11', '21', '31'], // Colum 1
	['12', '22', '32'], // Colum 2
	['13', '23', '33'], // Colum 3
	['11', '22', '33'], // Diagonal 1
	['31', '22', '13'], // Diagonal 2
];
let userTurn;
let virtualDom;
let message;
let counter;
let gameOver;
let stageDom;
let button;
let turnElement;
let winnerElement;
let turnFirstTime;




/************************************************
 * 			START StageDom CLASS
 *
 * This class manipulate the stage DOM; 
 ************************************************/
class StageDom {
	constructor(onClick) {
		this.stage = {};
		this.onClick = onClick;
		for (let key of VALUES_STAGE) {
			// set each element to a stage object
			this.stage[key] = document.getElementById('opt-' + key);
			// Add a new event listener to each element of stage;
			// the function onClick that receive by parameter
			this.stage[key].addEventListener('click', () => onClick(key));
		}
	}

	setX(key) {
		this.stage[key].classList.add("optionO");
		this.stage[key].innerHTML = 'X';
	}

	setO(key) {
		this.stage[key].classList.add("optionX");
		this.stage[key].innerHTML = 'O';
	}

	disableOption(key) {
		this.stage[key].classList.remove("active");
	}

	clearOption(key) {
		this.stage[key].innerHTML = '';
		this.stage[key].classList.remove("rotate");
		this.stage[key].classList.remove("optionO");
		this.stage[key].classList.remove("optionX");
	}

	addActiveClass(key) {
		this.stage[key].classList.add("active");
	}

	setWinner(key1, key2, key3) {
		this.stage[key1].classList.remove("optionO");
		this.stage[key1].classList.remove("optionX");
		this.stage[key2].classList.remove("optionO");
		this.stage[key2].classList.remove("optionX");
		this.stage[key3].classList.remove("optionO");
		this.stage[key3].classList.remove("optionX");
		this.stage[key1].classList.add("rotate");
		this.stage[key2].classList.add("rotate");
		this.stage[key3].classList.add("rotate");
	}
}


/************************************************
 *				INIT FUNCTION
 ************************************************/


(function init() {
	virtualDom = {};
	message = document.getElementById('message');
	stageDom = new StageDom(onClick);
	button = document.getElementById('newGame');
	button.addEventListener('click', newGame);
	turnElement = document.getElementById('turn');
	winnerElement = document.getElementById('winner');
	turnFirstTime = parseInt(Math.random() * 2);
})();


function newGame() {
	// We generate a random turn if the turn is 1 (true) is user's turn
	userTurn = turnFirstTime;
	turnFirstTime = !turnFirstTime;
	counter = 0;
	gameOver = false;
	turnElement.innerHTML = '';
	winnerElement.innerHTML = '';

	// We clear the values of virtualDom
	for (let key of VALUES_STAGE) {
		stageDom.addActiveClass(key);
		stageDom.clearOption(key);
		// Key is the nomber of the option for example 11 12 13 21 etc.
		virtualDom[key] = {
			// If active is false the option is available
			active: false,
			// If value is 0 the option is available,
			// If it's X = 0, X is for computer
			// If it's O = -1, O is for user
			value: 0
		};
	}

	turnElement.classList.remove("optionO");
	turnElement.classList.remove("optionY");
	if (!userTurn) {
		turnElement.innerHTML = 'X';
		turnElement.classList.add("optionO");
		message.innerHTML = 'Computer start!';
		generateComputerTurn();
	} else {
		turnElement.innerHTML = 'O';
		turnElement.classList.add("optionX");
		message.innerHTML = 'User start!';
	}
}

function setTurn(key) {
	turnElement.classList.remove("optionO");
	turnElement.classList.remove("optionY");
	if (userTurn) {
		stageDom.setO(key);
		virtualDom[key].active = true;
		virtualDom[key].value = -1;
		turnElement.innerHTML = 'X';
		turnElement.classList.add("optionO");
	} else {
		stageDom.setX(key);
		virtualDom[key].active = true;
		virtualDom[key].value = 1;
		turnElement.innerHTML = 'O';
		turnElement.classList.add("optionX");
	}
	stageDom.disableOption(key);
	userTurn = !userTurn;
	message.innerHTML = "It's  turn of " + (userTurn ? 'User' : 'Computer');
	counter++;
}

function setWinner(winner, key1, key2, key3) {
	for (let key of VALUES_STAGE) {
		if (!virtualDom[key].active) {
			stageDom.disableOption(key);
		}
	}
	message.innerHTML = '';
	if (winner) {
		stageDom.setWinner(key1, key2, key3);
		winnerElement.innerHTML = 'The ' + winner + ' Won!';
	} else {
		winnerElement.innerHTML = 'Game Over there is not a Winner!';
	}
}

function onClick(key) {
	// if isn't user turn or the stage isn't active we do noting
	if (!userTurn || virtualDom[key].active || gameOver) {
		return;
	}
	setTurn(key);
	validateWin();
	generateComputerTurn();
}

// returns the computer opiton
function generateComputerTurn() {
	if (gameOver) {
		return;
	}
	setTimeout(function () {
		let key;
		// If the computer is the firt in play
		if (counter <= 1 && !virtualDom['22'].active) {
			key = '22';
		} else {
			let array = analyzeOptions();
			for (let item of array) {
				if (item.available) {
					key = item.available;
					break;
				}
			}
		}
		setTurn(key);
		validateWin();
	}, 500);
}

// This function analyze the best option for the computer 
// Or if someone is win
// Return a list of object ({value : 2, key1 : '11', key2 : '12', key3 : '13', available : false})
function analyzeOptions() {
	let array = [];
	for (let line of VALUES_BY_LINES) {
		let object = {
			value: virtualDom[line[0]].value + virtualDom[line[1]].value + virtualDom[line[2]].value,
			key1: line[0],
			key2: line[1],
			key3: line[2],
			available: virtualDom[line[2]].value == 0 ? // If the first option is available
				line[2] : virtualDom[line[1]].value == 0 ? // If the second option is available
				line[1] : virtualDom[line[0]].value == 0 ? // If the third option is available
				line[0] : false // If any option is available the value is false
		};
		if (object.available == '33' && object.key1 == '11' && (virtualDom['23'].value == -1 || virtualDom['12'].value == -1) &&
			virtualDom['11'].value == 0) {
			object.available = '11';
		}
		array.push(object)
	}

	// sort the array by value
	array.sort(function (a, b) {
		return Math.abs(a.value) > Math.abs(b.value) ? -1 : // If the absolute value of A is more than B return -1
			Math.abs(a.value) < Math.abs(b.value) ? 1 : // If the absolute value of A is less than B return 1
			a.value > b.value ? -1 : 1
	});
	return array;
}

// If the first element of the array is 3 or -3 there ir a winner 
function validateWin() {
	let item = analyzeOptions()[0];
	if (item.value == 3) {
		setWinner('Computer', item.key1, item.key2, item.key3);
		gameOver = true;
	} else if (item.value == -3) {
		setWinner('User', item.key1, item.key2, item.key3);
		gameOver = true;
	} else if (counter >= 9) {
		setWinner(null);
		gameOver = true;
	}
}
