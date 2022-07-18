const CHANNELS = 13;
const NOTE_NUMS = 10;

var interVal;
var noteNum = 0;
var noteElem;
var noteCellElem, oldNoteCellElem;
var noteSpd = 500;

function init() {
    generateNoteTable();
    document.getElementById('playBtn').onclick = playAction;
}

function playAction() {
    noteNum = 0;
    noteElem = document.getElementById('ch1n0');
    noteCellElem = document.getElementById('ch1cll0');
    interVal = setInterval(stepAction, noteSpd);
}

function stepAction() {
    if (noteNum >= NOTE_NUMS) {
        console.log("Cleared!");
        oldNoteCellElem.style.background = 'white';
        clearInterval(interVal);
        return;
    }
    noteCellElem.style.background = 'red';
    if (noteNum > 0) {
        oldNoteCellElem.style.background = 'white';
    }
    console.log("Step " + noteNum);
    if (noteElem && noteElem.checked) {
        playNote();
    }
    noteNum++;
    noteElem = document.getElementById('ch1n' + noteNum);
    oldNoteCellElem = noteCellElem;
    noteCellElem = document.getElementById('ch1cll' + noteNum);
}

function playNote() {
    const audioCtx = new AudioContext();
    const note = new Audio("assets/note.wav");
    const source  = audioCtx.createMediaElementSource(note);
    source.connect(audioCtx.destination);
    note.play();
}

function stopAction() {
    clearInterval(interVal)
    if (noteNum < NOTE_NUMS) {
        noteCellElem.style.background = 'white';
    }
    if (noteNum > 0) {
        oldNoteCellElem.style.background = 'white';
    }
}

function generateNoteTable() {
    var noteTable = document.getElementById("noteTable");

    for (let i = 1; i <= CHANNELS; i++) {
        let row = document.createElement("tr");
        let cell = document.createElement("td");
        let chnlTxt = document.createTextNode("CH" + i);
        cell.appendChild(chnlTxt);
        row.appendChild(cell);

        for (let j = 0; j < NOTE_NUMS; j++) {
            let noteCell = document.createElement("td");
            noteCell.id = "ch" + i + "cll" + j;
            let noteChk = document.createElement("input");
            noteChk.type = "checkbox";
            noteChk.id = "ch" + i + "n" + j;
            noteCell.appendChild(noteChk);
            row.appendChild(noteCell);
        }

        noteTable.appendChild(row);
    }
}

function onChangeNoteSpd() {
    noteSpd = document.getElementById("noteSpd").valueAsNumber;
    console.log("New Note Speed is " + noteSpd);
}

init();