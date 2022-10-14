const letters = document.querySelectorAll('.letter');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
    let currentGuess = '';
    let currentRow = 0;
    let isLoading = true;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordLetters = word.split("");
    let done = false;
    isLoading = false;
    

    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter; //add letter to the end
        } else {
            //replace last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    //user tries to enter a guess
    async function commit() {
        if (currentGuess.length != ANSWER_LENGTH) {
            //do nothing
            return;
        }

        isLoading = true;
        
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        });

        const resObj = await res.json(); 
        const validWord = resObj.validWord; //const { validWord } = resObj;
        
        isLoading = false;

        if (!validWord) {
            markInvalidWord();
            return;
        }

        const guessParts = currentGuess.split("");
        const map = makeMap(wordLetters);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            //mark as correct 
            if (guessParts[i] === wordLetters[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordLetters[i]) {
                //nothing
            } else if (wordLetters.includes(guessParts[i]) && map[guessParts[i]] > 0) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
                map[guessParts[i]]--;
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            }
        }

        currentRow++;

        if (currentGuess === word) {
            alert("you win!");
            done = true;
            return; 
        } else if (currentRow === ROUNDS) {
            alert(`you lose, the word was ${word}`);
            done = true;
        }    
        currentGuess = '';
    }

    //user hits backspace, if the length of the string is 0 then do nothing
    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    function markInvalidWord() {
        alert('not a valid word');
    }

    document.addEventListener('keydown', function handleKeyPress (event) {
        if (done || isLoading) {
            return;
        }
        
        const action = event.key;

        if (action === 'Enter') {
            commit();
        } else if (action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase());
        } else {
            //do nothing
        }
    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function makeMap (array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i];
        if (obj[letter]) { //exist
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }

    return obj;
}

init();