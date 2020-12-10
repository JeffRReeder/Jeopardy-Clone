// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

/** Jeopardy Clone
 * Jeopard API = http://jservice.io/
 * Random categories = http://jservice.io/api/random
 * 
 */


const WIDTH = 6;
const HEIGHT = 5;
let categories = [];
let questionsAndAnswers = [];
let NUM_CATEGORIES = 6;

let ifClicked = false;          // ifClicked used to prevent clicking on multiple questions until answer is revealed

document.body.setAttribute('onload', 'setupAndStart()');
document.body.setAttribute('class', 'flex-container');
document.body.innerHTML = `<button type="button" id="gameButton" onclick='showLoadingView()'>Restart Game</button> `

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns map of category ids
 */
async function getCategoryIds() {
    for(let i = 0; i < NUM_CATEGORIES; i++){
        let response = await axios.get('https://jservice.io/api/random');
        let categoryId = response.data.map(result => {
        let catId = result.category.id;

        getCategory(catId);
        }); 
    }
    hideLoadingView();
}

async function getCategory(catId) {
      /** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
        let response = await axios.get(`https://jservice.io/api/category?id=${catId}`);
        // Top row of categories
        categories.push(response.data.title);

        // clues array for each category {question: "xyz", answer: "abc"}
        let clues = response.data.clues;

        // get just first 5 questions and answers + add a "showing" property
        for(let i = 0; i < 5; i++){
            clues[i].showing = "null";              // add "showing" attribute for click handling
            questionsAndAnswers.push(clues[i]);     // load QnA array with 30 questions/answers in proper order
        }
        // Now we have data, fill the table
        fillTable();
}

// fills in Categories row and all Cells with starting $ amounts
async function fillTable() {

    // Display categories
    for(let i = 0; i < categories.length; i++){
        let categoryTitle = document.getElementById(i);
        categoryTitle.innerText = categories[i].toUpperCase();

        // default start amount
        let dollarAmount = 100;

        // fill in all cells with correct dollar amounts, overwriting inital "?"
        for(let j = 0; j < HEIGHT; j++){
            let questionSquare = document.getElementById(`${i}-${j}`);
            questionSquare.innerText = '$' + dollarAmount;
            dollarAmount = dollarAmount + 100;
            questionSquare.setAttribute('class', 'dollarAmount'); // used later for css sizing
        }
    }
    return questionsAndAnswers;
}



function handleClick(e) {
    /** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
  

    let index = 0;
    let x = parseInt(e.target.id[0]); // to capture cell id of where clicked "x-y"
    let y = parseInt(e.target.id[2]); // to capture cell id of where clicked "x-y"

    let inputId = e.target.id;
    // QnA array is 0-4 = column 1, 5-9 = column 2, 10-14 = column 3, etc...
    //Use this math to grab correct questions for each column. (offset every 5 in array for next column)
    index = 5*x + y; 
    let show = document.getElementById(inputId);

        // ifClicked used to prevent clicking on multiple questions until answer is revealed
        if(questionsAndAnswers[index].showing === "null" && ifClicked === false){
            questionsAndAnswers[index].showing = "question";        // flip from "null" to "showing"
            show.innerText = questionsAndAnswers[index].question;   // show "question" on board
            show.setAttribute('class', ''); // remove class to keep correct text size in css
            ifClicked = true;
        }
        else if (questionsAndAnswers[index].showing === "question" && ifClicked == true){
            questionsAndAnswers[index].showing = "answer";          // flip from "question" to "answer"
            show.innerText = questionsAndAnswers[index].answer;     // show "answer" on board
            ifClicked = false;                                      // "answer" is shown, reset flag for next cell
        } else return;  // technically don't need this
}

function showLoadingView() {
/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
    window.location.reload();
}



function hideLoadingView() {
/** Remove the loading spinner and update the button used to fetch data. */
    console.log("Loading Complete");
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

function setupAndStart() {
    let button = document.getElementById('gameButton');
    // create template for game board and stick it into html page
    const boardDiv = document.createElement('table');
    boardDiv.setAttribute('id', 'board');
    document.body.append(boardDiv);
    
    const board = document.getElementById('board');

    // Categories row
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');

    // fill in categories from "categories" array
    for(let x = 0; x < WIDTH; x++){
        const headCell = document.createElement('th');
        headCell.setAttribute('id', x);
        top.append(headCell);
    }
    board.append(top);

    // Create main part of board below categories
    // setAttribute for every position, it's y-x coordinates (for later logic)
    for (let y = 0; y < HEIGHT; y++) {
        const row = document.createElement("tr");

        for (let x = 0; x < WIDTH; x++) {
            const cell = document.createElement("td");
            cell.setAttribute("id", `${x}-${y}`);
            // make it clickable to change from $ amount -> question -> answers
            cell.setAttribute("onclick" , "handleClick(event)")
            // default value before $ amount loaded in is: ?
            cell.innerText = '?';
            row.append(cell);
        }
        board.append(row);
    }
    if(button.innerText = "Restart Game"){
        button.remove();
        board.append(button);
    }
    getCategoryIds(); 
}