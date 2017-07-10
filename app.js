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
let virtualDom = {};
let message = document.getElementById('message');
let counter;
let gameOver;




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
		this.stage[key].innerHTML = 'X';
	}

	setO(key) {
		this.stage[key].innerHTML = 'O';
	}
	disableOption(key) {

	}

	addActiveClass(key) {
		this.stage[key].classList.add("active");
	}
}





/************************************************
 *				INIT FUNCTION
 ************************************************/
const stageDom = new StageDom(onClick);
init();

function init() {
	// We generate a random turn if the turn is 1 (true) is user's turn
	userTurn = parseInt(Math.random() * 2);
	counter = 0;
	gameOver = false;

	// We clear the values of virtualDom
	for (let key of VALUES_STAGE) {
		stageDom.addActiveClass(key);
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
	if (!userTurn) {
		message.innerHTML = 'Computer start!';
		generateComputerTurn();
	} else {
		message.innerHTML = 'User start!';
	}
}

function setTurn(key) {
	if (userTurn) {
		stageDom.setO(key);
		virtualDom[key].active = true;
		virtualDom[key].value = -1;

	} else {
		stageDom.setX(key);
		virtualDom[key].active = true;
		virtualDom[key].value = 1;
	}
	stageDom.disableOption(key);
	message.innerHTML = "It's  turn of " + (userTurn ? 'User' : 'Computer');
	counter++;
	userTurn = !userTurn;
}

function setWinner(winner) {
	if (winner) {
		message.innerHTML = 'The ' + winner + ' Won!';
	} else {
		message.innerHTML = 'Game Over there is not a Winner!';

	}
}

function onClick(key) {

	// if isn't user turn or the stage isn't available we do noting
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
	let key;
	// If the computer is the firt in play
	if (counter == 0) {
		// We have a 50% of possibility of set the 22
		if (parseInt(Math.random() * 2)) {
			key = '22';
		}
		// Generate a random option
		else {
			key = VALUES_STAGE[parseInt(Math.random() * VALUES_STAGE.length)];
		}
		// If isn't the first in play generate anohter option
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

}

// This function alalyze the best option for the computer 
// Or if someone is win
// Return a list of object ({value : 2, key1 : '11', key2 : '12', key3 : '13', available : false})
function analyzeOptions() {
	let array = [];
	for (let line of VALUES_BY_LINES) {
		array.push({
			value: virtualDom[line[0]].value + virtualDom[line[1]].value + virtualDom[line[2]].value,
			key1: line[0],
			key2: line[1],
			key3: line[2],
			available: virtualDom[line[0]].value == 0 ? // If the first option is available
				line[0] : virtualDom[line[1]].value == 0 ? // If the second option is available
				line[1] : virtualDom[line[2]].value == 0 ? // If the third option is available
				line[2] : false // If any option is available the value is false
		});
	}

	// sort the array by value
	array.sort(function (a, b) {

		return Math.abs(a.value) > Math.abs(b.value) ? -1 : // If the absolute value of A is more than B return -1
			Math.abs(a.value) < Math.abs(b.value) ? 1 : // If the absolute value of A is less than B return 1
			a.value > b.value ? -1 : // If the absolute value of A is equals B take in count if is positive 
			a.value == b.value ? // If both values are equial we take in count if is available
			(a.available ? -1 : 1) : 1
	});
	return array;
}

// If the first element of the array is 3 or -3 there ir a winner 
function validateWin() {
	let value = analyzeOptions()[0].value;
	if (value == 3) {
		setWinner('Computer');
		gameOver = true;
	} else if (value == -3) {
		setWinner('User');
		gameOver = true;
	} else if (counter >= 9) {
		setWinner(null);
		gameOver = true;

	}
}
